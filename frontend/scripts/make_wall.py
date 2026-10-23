"""Makes the example pictures for the home page photo wall.

It uses the sample photos that come with scikit-image (public domain or CC0, so free to use)
and applies simple edits with Pillow to make "before" and "after" pairs.
The pictures are written to frontend/public/wall/.

Run it once from the frontend folder:
    pip install scikit-image pillow
    python scripts/make_wall.py

To use your own photos instead, put them in frontend/public/wall/ and edit
frontend/src/components/home/PhotoWall.jsx.
"""

from pathlib import Path

from PIL import Image, ImageDraw, ImageEnhance, ImageFilter, ImageOps
from skimage import data, restoration, img_as_float, img_as_ubyte
import numpy as np

OUT = Path(__file__).resolve().parent.parent / "public" / "wall"
OUT.mkdir(parents=True, exist_ok=True)


def photo(array):
    return Image.fromarray(array).convert("RGB")


def save(image, name):
    image.save(OUT / name, "JPEG", quality=88, optimize=True)
    print("wrote", name, image.size)


astronaut = photo(data.astronaut())
coffee = photo(data.coffee())
rocket = photo(data.rocket())
cat = photo(data.chelsea())

# 1. Enhance: a small, soft crop against a sharpened, twice-as-large version
face = astronaut.crop((110, 10, 360, 300))
big = face.resize((face.width * 2, face.height * 2), Image.LANCZOS).filter(ImageFilter.UnsharpMask(1.6, 90, 2))
soft = face.resize((face.width // 4, face.height // 4), Image.BILINEAR).resize(big.size, Image.BICUBIC)
save(big, "enhance-after.jpg")
save(soft, "enhance-before.jpg")

# 2. Blur background: sharp in the middle, soft around it
cup = coffee.crop((150, 0, 550, 400)).resize((640, 640), Image.LANCZOS)
mask = Image.new("L", cup.size, 0)
ImageDraw.Draw(mask).ellipse((120, 90, 520, 560), fill=255)
mask = mask.filter(ImageFilter.GaussianBlur(40))
blurred = Image.composite(cup, cup.filter(ImageFilter.GaussianBlur(14)), mask)
save(blurred, "blur-after.jpg")
save(cup, "blur-before.jpg")

# 3. Auto-fix: a dark, flat, slightly cold picture against the balanced one
rock = rocket.crop((100, 0, 527, 427)).resize((640, 640), Image.LANCZOS)
dull = ImageEnhance.Brightness(rock).enhance(0.62)
dull = ImageEnhance.Contrast(dull).enhance(0.72)
r, g, b = dull.split()
dull = Image.merge("RGB", (r.point(lambda v: int(v * 0.92)), g, b.point(lambda v: min(255, int(v * 1.08)))))
save(rock, "autofix-after.jpg")
save(dull, "autofix-before.jpg")

# 4. Face shape: measurement lines drawn over a portrait
shape = astronaut.crop((100, 0, 380, 330)).resize((560, 660), Image.LANCZOS)
draw = ImageDraw.Draw(shape)
lines = [
    ((172, 168), (342, 168)),  # forehead
    ((160, 240), (352, 240)),  # cheekbones
    ((196, 306), (318, 306)),  # jaw
    ((256, 60), (256, 336)),  # length
]
for (x1, y1), (x2, y2) in lines:
    draw.line((x1, y1, x2, y2), fill=(242, 194, 48), width=3)
    for x, y in ((x1, y1), (x2, y2)):
        draw.ellipse((x - 6, y - 6, x + 6, y + 6), fill=(255, 255, 255), outline=(0, 0, 0), width=2)
save(shape, "face-shape.jpg")

# 5. Crop and filters: a square crop with a warm tone and a soft edge
square = cat.crop((60, 0, 360, 300)).resize((640, 640), Image.LANCZOS)
warm = ImageEnhance.Color(square).enhance(1.15)
warm = ImageEnhance.Contrast(warm).enhance(1.08)
r, g, b = warm.split()
warm = Image.merge("RGB", (r.point(lambda v: min(255, int(v * 1.06))), g, b.point(lambda v: int(v * 0.92))))
fade = Image.new("L", warm.size, 0)
ImageDraw.Draw(fade).ellipse((-120, -120, 760, 760), fill=255)
fade = fade.filter(ImageFilter.GaussianBlur(90))
warm = Image.composite(warm, ImageEnhance.Brightness(warm).enhance(0.72), fade)
save(warm, "filters-after.jpg")
save(square, "filters-before.jpg")

# 6. Smooth skin: gentle smoothing that keeps edges
skin = astronaut.crop((140, 30, 330, 240))
skin_big = skin.resize((skin.width * 3, skin.height * 3), Image.LANCZOS)
smooth = restoration.denoise_bilateral(img_as_float(np.array(skin_big)), sigma_color=0.09, sigma_spatial=6, channel_axis=-1)
smooth = Image.fromarray(img_as_ubyte(smooth))
smooth = Image.blend(skin_big, smooth, 0.85)
save(smooth, "smooth-after.jpg")
save(skin_big, "smooth-before.jpg")

# 7. Saved edit: a finished picture from the gallery
keep = coffee.crop((200, 0, 500, 400)).resize((600, 800), Image.LANCZOS)
keep = ImageEnhance.Contrast(keep).enhance(1.12)
keep = ImageEnhance.Color(keep).enhance(0.85)
save(keep, "saved.jpg")

print("Done. Pictures are in", OUT)