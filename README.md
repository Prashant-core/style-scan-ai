# StyleScan AI

A photo and style web app. Measure your face to find your face shape, get haircut, beard and glasses ideas, edit and enhance photos, remove or blur backgrounds, track your skin over time, and chat with a style assistant. Photos are private and can be deleted at any time.

- Website: https://style-scan-ai-sand.vercel.app
- API: https://style-scan-ai.onrender.com

## What it does

| Feature | What it does | Where it runs |
| --- | --- | --- |
| Photo editor | Crop, straighten, adjust light and colour, filters, text, undo and redo, Auto-fix | In your browser |
| Photo enhancer | Makes small or soft photos sharper with an AI upscaler (Swin2SR) | In your browser |
| Portrait tools | Blur, colour, replace or remove the background. Smooth skin and even its tone | In your browser |
| My gallery | Save finished pictures privately, download, edit again or delete | Browser + server |
| Face analysis | Measures your face (MediaPipe) and finds your face shape. Gives haircut, beard and glasses ideas | In your browser (only the numbers are saved) |
| Skin tracker | Scans a photo with Google Gemini and draws a score graph over time | Server + Gemini |
| Style assistant | Chat that knows your latest results (Groq) | Server + Groq |
| Trial room | See yourself in a new look. **Switched off** because it needs a paid image AI | Server + Gemini |

## Tech stack

**Frontend:** Next.js 16 (App Router, JavaScript), React 19, Tailwind CSS v4, Framer Motion, lucide-react, MediaPipe Tasks Vision, Transformers.js (loaded in a web worker).

**Backend:** FastAPI, SQLAlchemy 2, Pydantic settings, bcrypt, PyJWT, slowapi (rate limits), Pillow, httpx.

**Hosting (all free plans):** Vercel (frontend), Render (backend), Neon (PostgreSQL).

## How it is built

- `frontend/` is the website. Pages are in `frontend/src/app/`, shared parts in `frontend/src/components/`, logic in `frontend/src/utils/`.
- The editor keeps every change in one small "edit" object and redraws the photo from the original each time, so nothing is lost and undo is easy. See `frontend/src/utils/editor.js`.
- The enhancer cuts a photo into small tiles, sends them to a web worker that runs the AI model, and stitches the result. See `frontend/src/utils/enhance.js` and `frontend/public/enhance-worker.js`.
- Portrait tools use MediaPipe's selfie segmentation model to find the person and skin, then plain maths for the blur, retouch and compositing. See `frontend/src/utils/portrait.js`, `retouch.js` and `segment.js`.
- `backend/app/` is the API: `routers/` (endpoints), `services/` (Gemini, Groq, photos, limits), `models/` (database tables).
- Photos are stored as bytes in the database and only ever sent to the account that owns them (`backend/app/routers/images.py`).

## Run it on your computer

You need Node.js 20+ and Python 3.12+.

### Backend

```powershell
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
```

Open `backend/.env` and set `SECRET_KEY` (run `python -c "import secrets; print(secrets.token_urlsafe(64))"` to make one). Then:

```powershell
uvicorn app.main:app --reload
```

`--reload` does not notice changes to `.env`. Stop and start the server after editing it.

### Frontend

```powershell
cd frontend
npm install
npm run dev
```

Open http://localhost:3000.

### Check your Gemini key

```powershell
cd backend
venv\Scripts\activate
python check_gemini.py
```

It prints what Google answers for your key and models.

## Settings (environment variables)

Backend (`backend/.env` locally, the Environment tab on Render):

| Name | What it is |
| --- | --- |
| `SECRET_KEY` | Required. A long random text that signs login tokens |
| `DATABASE_URL` | SQLite file locally. The Neon link on the live site |
| `FRONTEND_URLS` | Allowed website addresses, no trailing slash |
| `ENVIRONMENT` | `development` or `production` |
| `GEMINI_API_KEY`, `GEMINI_TEXT_MODEL` | Skin tracker. Example model: `gemini-3.1-flash-lite` |
| `GEMINI_IMAGE_MODEL` | Trial room. Needs billing on the Gemini account |
| `GROQ_API_KEY`, `GROQ_MODEL` | Style assistant. Example model: `openai/gpt-oss-20b` |
| `MAX_IMAGES_PER_USER`, `DAILY_IMAGE_LIMIT`, `DAILY_CHECK_LIMIT` | Limits that keep the free plans safe |

Frontend (`frontend/.env.local` locally, Vercel settings on the live site):

| Name | What it is |
| --- | --- |
| `NEXT_PUBLIC_API_URL` | The backend address |

Never commit `.env` files or keys.

## Deploy

1. **Neon:** create a project and copy the connection string into `DATABASE_URL`.
2. **Render:** new Web Service from this repo, root directory `backend`, start command `uvicorn app.main:app --host 0.0.0.0 --port $PORT`. Add the backend settings above.
3. **Vercel:** import this repo, root directory `frontend`, set `NEXT_PUBLIC_API_URL` to the Render address.
4. Set `FRONTEND_URLS` on Render to the exact Vercel address.

Both Render and Vercel redeploy when you push to GitHub. The free Render plan sleeps after 15 minutes without visits, so the first request can take about a minute.

## Security and privacy

- Passwords are hashed with bcrypt. Login tokens expire (access 15 minutes, refresh 7 days).
- Every user has a random unique ID. A photo is sent back only to its owner.
- Uploads are checked, re-saved as plain JPEG and stripped of hidden data such as location.
- Rate limits and daily limits protect the free plans.
- Users can delete one item, all photos, all history, or the account in Settings. See the in-app Privacy page.

## Known limits

- The Trial room is switched off. Google gives no free quota for image models. Turn on billing, then set its status to `live` in `frontend/src/utils/features.js`.
- The enhancer runs on the user's device. It is fast with WebGPU and slower without it.
- The face shape rules were tuned on a small set of faces and are estimates.
- Photos live in the Neon database (1 GB on the free plan). Moving photos to object storage (for example Cloudflare R2) is a possible next step.

## Licences of the AI parts

MediaPipe (Apache-2.0), Transformers.js (Apache-2.0), Swin2SR models (Apache-2.0 upstream). Check each model page before using the project commercially.