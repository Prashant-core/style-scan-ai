"""
Turns face measurements into a face shape and style ideas.

How it works
------------
The browser measures four things on the photo and sends them as ratios.
Every ratio is compared with the width of the cheekbones, so the cheekbones are always 1.00:

    forehead = forehead width  / cheekbone width
    jaw      = jaw width       / cheekbone width
    length   = face length     / cheekbone width

Why the numbers are "stretched" first
-------------------------------------
The face-point map used in the browser is a template that is fitted to each face, so real
faces give very similar ratios (forehead about 0.84-0.90, jaw about 0.77-0.83). If we compared
the raw ratios with fixed shapes, almost every face would look "average" (oval).
So each ratio is first compared with the average face and stretched by its normal spread.
After that, small real differences become clear. Each face shape is a spot in that stretched
space (SHAPE_PROFILES below), and we pick the closest one.

If results feel off for real faces, the numbers below are the only thing to tune.
"""

from math import exp, sqrt

# The average face measured on 9 real photos, and how much faces normally differ from it
AVERAGE = {"length": 1.21, "forehead": 0.86, "jaw": 0.81}
SPREAD = {"length": 0.07, "forehead": 0.025, "jaw": 0.025}

# Each shape as (length, forehead, jaw) in stretched units. 0 = average, +1 = clearly above.
SHAPE_PROFILES: dict[str, tuple[float, float, float]] = {
    "oval": (0.0, 0.0, 0.0),
    "round": (-1.6, 0.5, 0.8),
    "square": (-0.8, 0.8, 1.8),
    "heart": (0.0, 1.2, -1.5),
    "diamond": (0.3, -1.5, -1.3),
    "oblong": (1.8, 0.0, 0.0),
}

# If the second-closest shape is within this distance of the best one, report it too
RUNNER_UP_GAP = 0.3


def _stretched(forehead: float, jaw: float, length: float) -> tuple[float, float, float]:
    return (
        (length - AVERAGE["length"]) / SPREAD["length"],
        (forehead - AVERAGE["forehead"]) / SPREAD["forehead"],
        (jaw - AVERAGE["jaw"]) / SPREAD["jaw"],
    )


def _distances(forehead: float, jaw: float, length: float) -> list[tuple[float, str]]:
    z = _stretched(forehead, jaw, length)
    return sorted(
        (sqrt(sum((a - b) ** 2 for a, b in zip(z, profile))), name)
        for name, profile in SHAPE_PROFILES.items()
    )


def classify(forehead: float, jaw: float, length: float) -> tuple[str, str | None]:
    """Returns (best shape, runner-up shape or None)."""
    distances = _distances(forehead, jaw, length)
    best_distance, best = distances[0]
    second_distance, second = distances[1]
    runner_up = second if second_distance - best_distance < RUNNER_UP_GAP else None
    return best, runner_up


def match_scores(forehead: float, jaw: float, length: float) -> list[dict]:
    """How well the face fits each shape, as whole percentages that add up to 100."""
    distances = _distances(forehead, jaw, length)
    weights = [(name, exp(-(distance**2) / 2)) for distance, name in distances]
    total = sum(w for _, w in weights) or 1.0
    scores = [{"shape": name, "percent": round(100 * w / total)} for name, w in weights]
    return scores


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