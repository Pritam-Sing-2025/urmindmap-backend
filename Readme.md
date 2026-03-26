# MindMap Server

Express API for generating mind map JSON from user notes with Gemini. This folder is prepared to deploy on Render and work cleanly with the Vercel frontend.

## Stack

- Node.js
- Express
- CORS
- Gemini via `@google/genai`

## API Routes

- `GET /`
- `GET /health`
- `GET /api/health`
- `POST /api/generate-mindmap`
- `POST /generate-mindmap`

## Environment Variables

Required:

```bash
GEMINI_API_KEY=your_gemini_api_key_here
```

Optional:

```bash
GEMINI_MODEL=gemini-2.5-flash
PORT=5001
ALLOWED_ORIGIN=http://localhost:5173
ALLOWED_ORIGINS=http://localhost:5173,https://your-app.vercel.app
ALLOWED_ORIGIN_PATTERNS=https://*.vercel.app
```

Notes:

- If no CORS env vars are set, the API allows cross-origin requests by default so initial deployment is less likely to get blocked.
- `ALLOWED_ORIGINS` accepts a comma-separated list of exact origins.
- `ALLOWED_ORIGIN_PATTERNS` accepts wildcard patterns such as `https://*.vercel.app`.

## Local Development

1. Install dependencies:

```bash
npm install
```

2. Create your env file:

```bash
cp .env.example .env
```

3. Start the API:

```bash
npm run dev
```

The server runs on `http://localhost:5001` by default.

## Request Format

`POST /api/generate-mindmap`

Request body:

```json
{
  "text": "Your notes go here"
}
```

Successful response:

```json
{
  "mindMap": {
    "title": "Main Topic",
    "nodes": [
      {
        "title": "Subtopic 1",
        "children": ["Point A", "Point B"]
      }
    ]
  },
  "model": "gemini-2.5-flash"
}
```

## Deploy To Render

1. Create a new Render Web Service from this repository.
2. Set the Root Directory to `server`.
3. Build Command: `npm install`
4. Start Command: `npm run start`
5. Add `GEMINI_API_KEY`.
6. Optionally add `ALLOWED_ORIGINS` with your Vercel URL once your frontend domain is known.

This folder includes [render.yaml](/Users/apple/Downloads/VS-code/Vibecode/mindmap/server/render.yaml) with a health check at `/api/health`.

## Connect To The Frontend

In the Vercel project for the client, set:

```bash
VITE_API_BASE_URL=https://your-render-service.onrender.com/api
```

If you later lock down CORS on Render, make sure your Vercel production domain and any preview domains are included in `ALLOWED_ORIGINS` or `ALLOWED_ORIGIN_PATTERNS`.

## Notes

- The API validates short and oversized inputs before calling Gemini.
- The server returns JSON errors so the frontend can surface useful messages.
- `npm run smoke` calls Gemini directly and requires a valid API key, so use it only when you want a real integration check.
