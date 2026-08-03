import os
import json
import logging
import numpy as np
from PIL import Image
import cv2

# Set up logging
logger = logging.getLogger("ai_engine")
logger.setLevel(logging.INFO)

# Global variables for models
_text_model = None
_faiss_available = False

try:
    import faiss
    _faiss_available = True
    logger.info("FAISS library loaded successfully.")
except ImportError:
    _faiss_available = False
    logger.info("FAISS not installed; fallback vector cosine similarity will be used.")

def get_text_model():
    global _text_model
    if _text_model is None:
        try:
            from sentence_transformers import SentenceTransformer
            # Load lightweight high-performance sentence transformer
            _text_model = SentenceTransformer("all-MiniLM-L6-v2")
            logger.info("Sentence Transformer 'all-MiniLM-L6-v2' loaded.")
        except Exception as e:
            logger.warning(f"Could not load SentenceTransformer ({e}). Using fallback TF-IDF embedder.")
            _text_model = "fallback"
    return _text_model

def extract_text_embedding(text: str) -> list[float]:
    """Generates a 384-dimensional vector embedding for input text."""
    if not text or not text.strip():
        return [0.0] * 384
    
    model = get_text_model()
    if model != "fallback":
        try:
            emb = model.encode(text, convert_to_numpy=True)
            # L2 normalize vector
            norm = np.linalg.norm(emb)
            if norm > 0:
                emb = emb / norm
            return emb.tolist()
        except Exception as e:
            logger.error(f"Error encoding text with model: {e}")
    
    # Fallback frequency-hash embedding (384-dim)
    vec = np.zeros(384, dtype=np.float32)
    words = text.lower().split()
    for word in words:
        h = hash(word) % 384
        vec[h] += 1.0
    norm = np.linalg.norm(vec)
    if norm > 0:
        vec = vec / norm
    return vec.tolist()

def extract_image_embedding(image_path: str) -> list[float]:
    """Extracts a normalized visual feature vector (512-dim) from an image file."""
    vec = np.zeros(512, dtype=np.float32)
    if not image_path or not os.path.exists(image_path):
        return vec.tolist()

    try:
        # Load image via PIL and OpenCV
        pil_img = Image.open(image_path).convert("RGB")
        cv_img = cv2.imread(image_path)

        # 1. Color Histogram Features (RGB + HSV) -> 256 dimensions
        if cv_img is not None:
            hsv = cv2.cvtColor(cv_img, cv2.COLOR_BGR2HSV)
            hist_h = cv2.calcHist([hsv], [0], None, [64], [0, 180]).flatten()
            hist_s = cv2.calcHist([hsv], [1], None, [64], [0, 256]).flatten()
            hist_v = cv2.calcHist([hsv], [2], None, [64], [0, 256]).flatten()
            hist_b = cv2.calcHist([cv_img], [0], None, [64], [0, 256]).flatten()
            
            color_feat = np.concatenate([hist_h, hist_s, hist_v, hist_b])
            c_norm = np.linalg.norm(color_feat)
            if c_norm > 0:
                color_feat = color_feat / c_norm
            vec[:256] = color_feat[:256]

        # 2. Resized Structural Grid Features -> 256 dimensions
        img_resized = pil_img.resize((16, 16))
        grid_data = np.array(img_resized, dtype=np.float32).flatten() # 16*16*3 = 768 -> slice to 256
        if len(grid_data) >= 256:
            grid_feat = grid_data[:256]
            g_norm = np.linalg.norm(grid_feat)
            if g_norm > 0:
                grid_feat = grid_feat / g_norm
            vec[256:] = grid_feat

        total_norm = np.linalg.norm(vec)
        if total_norm > 0:
            vec = vec / total_norm

    except Exception as e:
        logger.error(f"Error extracting image embedding for {image_path}: {e}")

    return vec.tolist()

def compute_cosine_similarity(vec1: list[float], vec2: list[float]) -> float:
    """Computes cosine similarity between two float vectors."""
    if not vec1 or not vec2:
        return 0.0
    v1 = np.array(vec1, dtype=np.float32)
    v2 = np.array(vec2, dtype=np.float32)
    
    # Check zero vectors
    norm1 = np.linalg.norm(v1)
    norm2 = np.linalg.norm(v2)
    if norm1 == 0 or norm2 == 0:
        return 0.0
        
    dot = np.dot(v1, v2)
    sim = dot / (norm1 * norm2)
    return float(np.clip(sim, 0.0, 1.0))

def faiss_search(query_vec: list[float], candidate_vecs: list[list[float]], top_k: int = 5):
    """Performs fast vector search using FAISS (or fallback numpy array inner product)."""
    if not candidate_vecs:
        return []

    q_arr = np.array([query_vec], dtype=np.float32)
    cand_arr = np.array(candidate_vecs, dtype=np.float32)

    # Normalize vectors
    q_norm = np.linalg.norm(q_arr, axis=1, keepdims=True)
    q_norm[q_norm == 0] = 1.0
    q_arr = q_arr / q_norm

    cand_norm = np.linalg.norm(cand_arr, axis=1, keepdims=True)
    cand_norm[cand_norm == 0] = 1.0
    cand_arr = cand_arr / cand_norm

    if _faiss_available:
        try:
            dim = q_arr.shape[1]
            index = faiss.IndexFlatIP(dim)
            index.add(cand_arr)
            distances, indices = index.search(q_arr, min(top_k, len(candidate_vecs)))
            return list(zip(indices[0].tolist(), distances[0].tolist()))
        except Exception as e:
            logger.warning(f"FAISS index error ({e}), falling back to numpy matmul.")

    # Fallback NumPy Cosine Similarity Matrix
    scores = np.dot(q_arr, cand_arr.T)[0]
    sorted_idx = np.argsort(scores)[::-1][:top_k]
    return [(int(i), float(scores[i])) for i in sorted_idx]

def calculate_match_scores(lost_item, found_item) -> dict:
    """Calculates text, image, and overall weighted match scores between a Lost and Found item."""
    # Category multiplier: if categories differ completely, apply slight penalty
    cat_match = 1.0 if lost_item.category.lower() == found_item.category.lower() else 0.85

    # 1. Text Similarity
    lost_text = f"{lost_item.name} {lost_item.category} {lost_item.description} {lost_item.location}"
    found_text = f"{found_item.name} {found_item.category} {found_item.description} {found_item.location_found}"
    
    lost_t_emb = json.loads(lost_item.text_embedding) if lost_item.text_embedding else extract_text_embedding(lost_text)
    found_t_emb = json.loads(found_item.text_embedding) if found_item.text_embedding else extract_text_embedding(found_text)
    
    text_sim = compute_cosine_similarity(lost_t_emb, found_t_emb)

    # 2. Image Similarity
    lost_i_emb = json.loads(lost_item.image_embedding) if lost_item.image_embedding else []
    found_i_emb = json.loads(found_item.image_embedding) if found_item.image_embedding else []
    
    if lost_i_emb and found_i_emb and any(lost_i_emb) and any(found_i_emb):
        image_sim = compute_cosine_similarity(lost_i_emb, found_i_emb)
        # Weighted combination: 45% Text + 55% Image when both images present
        raw_score = (text_sim * 0.45) + (image_sim * 0.55)
    else:
        image_sim = 0.0
        # Text-only match
        raw_score = text_sim

    overall_score = round(raw_score * cat_match, 4)
    overall_score = min(max(overall_score, 0.0), 1.0)

    if overall_score >= 0.70:
        confidence = "High"
    elif overall_score >= 0.55:
        confidence = "Medium"
    else:
        confidence = "Low"

    return {
        "text_similarity": round(text_sim, 4),
        "image_similarity": round(image_sim, 4),
        "overall_score": overall_score,
        "confidence_level": confidence
    }
