"""
Turns face measurements into a face shape and style ideas.

How it works
------------
The browser measures four things on the photo and sends them as ratios.
Every ratio is compared with the width of the cheekbones, so the cheekbones are always 1.00:

    forehead = forehead width  / cheekbone width
    jaw      = jaw width       / cheekbone width
    length   = face length     / cheekbone width

Each face shape has a typical set of ratios (SHAPE_PROFILES below).
We pick the shape whose typical ratios are closest to the person's ratios.
If the second shape is almost as close, we also report it as the "runner up".

If results feel off for real faces, the numbers in SHAPE_PROFILES are the only thing to tune.
"""

from math import sqrt

# Typical ratios for each face shape: (length, forehead, jaw)
SHAPE_PROFILES: dict[str, tuple[float, float, float]] = {
    "oval": (1.20, 0.86, 0.80),
    "round": (1.02, 0.90, 0.88),
    "square": (1.06, 0.92, 0.95),
    "heart": (1.18, 0.96, 0.70),
    "diamond": (1.20, 0.76, 0.74),
    "oblong": (1.40, 0.88, 0.84),
}

# If the second-closest shape is within this distance of the best one, report it too
RUNNER_UP_GAP = 0.02


def classify(forehead: float, jaw: float, length: float) -> tuple[str, str | None]:
    """Returns (best shape, runner-up shape or None)."""
    distances = sorted(
        (
            sqrt((length - l) ** 2 + (forehead - f) ** 2 + (jaw - j) ** 2),
            name,
        )
        for name, (l, f, j) in SHAPE_PROFILES.items()
    )
    best_distance, best = distances[0]
    second_distance, second = distances[1]
    runner_up = second if second_distance - best_distance < RUNNER_UP_GAP else None
    return best, runner_up


def _item(name: str, why: str) -> dict[str, str]:
    return {"name": name, "why": why}


ADVICE: dict[str, dict] = {
    "oval": {
        "title": "Oval face",
        "summary": (
            "Your face is a little longer than it is wide, and your jaw is softly rounded. "
            "This is the most flexible shape, so most styles will suit you."
        ),
        "haircuts": [
            _item("Textured crop", "Keeps the shape clean and easy to style."),
            _item("Layered medium length", "Adds movement without changing your balance."),
            _item("Side part", "Works with your proportions and looks neat for work."),
        ],
        "beards": [
            _item("Short stubble", "Adds a little edge and keeps your shape visible."),
            _item("Short boxed beard", "Tidy and balanced along the jaw."),
            _item("Clean shaven", "Your proportions look good without any beard."),
        ],
        "glasses": [
            _item("Square or rectangle frames", "Add a little structure to a soft face."),
            _item("Geometric frames", "A modern look that still fits your width."),
            _item("Aviators", "Balanced shapes that suit most oval faces."),
        ],
        "avoid": [
            "Very heavy fringes that hide your forehead.",
            "Frames much wider than your face, which can make it look short.",
        ],
    },
    "round": {
        "title": "Round face",
        "summary": (
            "Your face is about as long as it is wide, with soft lines. "
            "The goal is to add a little height and sharper lines."
        ),
        "haircuts": [
            _item("Quiff or volume on top", "Adds height so the face looks longer."),
            _item("Short sides, longer top", "Slims the sides of the face."),
            _item("Long layers past the chin", "Frame the face and stretch the look downward."),
        ],
        "beards": [
            _item("Beard longer on the chin", "Lengthens the lower face."),
            _item("Short sides, fuller chin", "Adds a sharper jawline."),
            _item("Defined goatee", "Draws the eye down instead of out."),
        ],
        "glasses": [
            _item("Rectangle frames", "Their straight lines balance round cheeks."),
            _item("Angular frames", "Add the sharp edges your face is missing."),
            _item("Frames slightly wider than your cheeks", "Make the face look narrower."),
        ],
        "avoid": [
            "Round frames, which repeat the shape of your face.",
            "Volume at the sides of your head.",
            "A straight, blunt fringe across the forehead.",
        ],
    },
    "square": {
        "title": "Square face",
        "summary": (
            "Your forehead and jaw are about the same width, which gives a strong, "
            "straight jawline. Soft lines work well to balance it."
        ),
        "haircuts": [
            _item("Soft layers or waves", "Soften the strong corners of the jaw."),
            _item("Side-swept fringe", "Breaks up the straight line of the forehead."),
            _item("Longer top with textured sides", "Adds height and a relaxed look."),
        ],
        "beards": [
            _item("Short, rounded beard", "Softens the corners of the jaw."),
            _item("Light stubble", "Keeps the strong jaw visible but not harsh."),
            _item("Clean shaven", "Shows off your natural jawline."),
        ],
        "glasses": [
            _item("Round or oval frames", "Their curves balance a straight jaw."),
            _item("Aviators", "A softer outline that still looks sharp."),
            _item("Thin frames", "Keep the face from looking too heavy."),
        ],
        "avoid": [
            "Boxy, blunt cuts that repeat your jawline.",
            "Thick square frames, which add even more corners.",
        ],
    },
    "heart": {
        "title": "Heart face",
        "summary": (
            "Your forehead is wider than your jaw, and your chin is narrower. "
            "The goal is to add a little width lower down."
        ),
        "haircuts": [
            _item("Side-swept fringe", "Makes the forehead look smaller."),
            _item("Chin-length layers", "Add width around the jaw."),
            _item("Medium length with volume at the ends", "Balances a wide forehead."),
        ],
        "beards": [
            _item("Fuller beard", "Adds width to a narrow jaw."),
            _item("Short boxed beard", "Gives the chin more weight."),
            _item("Stubble that follows the jaw", "A simple way to add definition."),
        ],
        "glasses": [
            _item("Frames that are wider at the bottom", "Balance a wider forehead."),
            _item("Round or oval frames", "Soft curves suit a narrow chin."),
            _item("Light or rimless frames", "Do not add weight to the top of the face."),
        ],
        "avoid": [
            "Heavy, top-heavy frames.",
            "Volume at the crown or temples, which makes the forehead look wider.",
        ],
    },
    "diamond": {
        "title": "Diamond face",
        "summary": (
            "Your cheekbones are the widest part of your face, and your forehead and jaw "
            "are narrower. Adding width at the forehead and jaw creates balance."
        ),
        "haircuts": [
            _item("Fringe or side-swept bangs", "Add width to a narrow forehead."),
            _item("Volume at the forehead and jaw", "Balances the wide cheekbones."),
            _item("Chin-length layers", "Add width near the jaw."),
        ],
        "beards": [
            _item("Fuller chin beard", "Adds width to a narrow jaw."),
            _item("Short, even beard", "Keeps the focus off the cheekbones."),
            _item("Light stubble", "Adds a little definition without extra width."),
        ],
        "glasses": [
            _item("Oval frames", "Their soft curves suit sharp cheekbones."),
            _item("Browline frames", "Add width at the forehead."),
            _item("Rimless frames", "Stay light so they do not draw attention to the cheekbones."),
        ],
        "avoid": [
            "Styles that add width at cheek level.",
            "Very narrow frames, which make the cheekbones stand out more.",
        ],
    },
    "oblong": {
        "title": "Oblong face",
        "summary": (
            "Your face is clearly longer than it is wide. "
            "The goal is to add width and avoid adding extra height."
        ),
        "haircuts": [
            _item("Fringe", "Makes the forehead look shorter."),
            _item("Volume at the sides", "Adds width to a long face."),
            _item("Medium-length waves", "Frame the face and add softness."),
        ],
        "beards": [
            _item("Fuller beard on the sides", "Adds width to the lower face."),
            _item("Short boxed beard", "Keeps the face from looking longer."),
            _item("Stubble", "Adds a little weight without extra length."),
        ],
        "glasses": [
            _item("Oversized frames", "Fill more of the face and add width."),
            _item("Round or square frames with depth", "Break up the length."),
            _item("Frames with a detailed or decorated bridge", "Draw the eye across the face."),
        ],
        "avoid": [
            "A lot of height on top, which makes the face look longer.",
            "A long goatee or a very pointed beard.",
            "Long, flat hair parted in the middle.",
        ],
    },
}


def get_advice(shape: str) -> dict:
    return ADVICE[shape]