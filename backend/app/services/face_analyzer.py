# TEMPORARY MOCK ENGINE 
# Bypassing MediaPipe dependency hell to unblock Full-Stack UI/DB development.

def analyze_face(image_bytes: bytes) -> dict:
    """
    Mock AI Analysis engine. 
    Accepts the image upload from Next.js and returns a simulated geometric payload 
    so the frontend dashboard and database can be built.
    """
    
    # Simulate a successful analysis for a "Square" face shape
    return {
        "status": "success",
        "face_shape": "Square",
        "landmarks_mapped": 468,
        "proportions": {
            "length_to_width": 1.35,
            "jaw_to_cheek": 0.92,
            "forehead_to_cheek": 0.88
        },
        "anchors": {
            "top_head": {"x": 0.5, "y": 0.1},
            "chin": {"x": 0.5, "y": 0.9},
            "left_cheek": {"x": 0.2, "y": 0.5},
            "right_cheek": {"x": 0.8, "y": 0.5},
            "left_jaw": {"x": 0.3, "y": 0.75},
            "right_jaw": {"x": 0.7, "y": 0.75},
        },
        "recommendations": {
            "eyewear": ["Round frames", "Oval silhouettes", "Wire-rimmed glasses"],
            "hairstyles": ["Textured quiff", "Messy fringe", "Soft side-part with volume"],
            "grooming": ["Rounded goatee or softly trimmed beard to soften the jawline"],
            "necklines": ["Round crew-necks", "Scoop necks"]
        }
    }