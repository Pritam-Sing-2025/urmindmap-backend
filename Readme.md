# AI Notes to Mind Map Generator

Full-stack web app that turns pasted notes or paragraphs into an interactive visual mind map using Gemini.

## Stack

- Frontend: React + Vite
- Styling: Tailwind CSS
- Animations: Framer Motion
- Visualization: React Flow (`@xyflow/react`)
- Backend: Node.js + Express
- AI: Gemini API
- Deployment: Vercel for the client, Render or Railway for the server

## Features

- Paste notes and generate a structured mind map with AI
- Modern landing page and polished app workspace
- Glassmorphism cards, gradients, and motion-driven UI
- Interactive mind map canvas with drag, zoom, minimap, and controls
- Branch color-coding and auto-balanced left/right layout
- Collapse or expand branches
- Edit node labels directly from the canvas
- Export the map as PNG
- Export the map as JSON
- Save maps locally in the browser
- Copy a shareable link with encoded map data
- Example notes button
- Dark mode toggle
- Mobile-responsive layout

## Project Structure

```text
client/
  src/
    components/
    pages/
    App.jsx
    main.jsx
server/
  controllers/
  routes/
  utils/
  index.js
```

## Local Setup

### 1. Install dependencies

```bash
npm install
npm install --workspace client
npm install --workspace server
```

### 2. Create env files

Copy the examples:

```bash
cp client/.env.example client/.env
cp server/.env.example server/.env
```

### 3. Add your Gemini API key

Set `GEMINI_API_KEY` inside [server/.env](/Users/apple/Downloads/VS-code/Vibecode/mindmap/server/.env.example).

Optional server vars:

- `GEMINI_MODEL=gemini-2.5-flash`
- `PORT=5001`
- `ALLOWED_ORIGIN=http://localhost:5173`

Optional client vars:

- `VITE_API_BASE_URL=http://localhost:5001/api`

### 4. Run the app

From the project root:

```bash
npm run dev
```

Frontend: `http://localhost:5173`

Backend health check: `http://localhost:5001/api/health`

## API

### `POST /generate-mindmap`

Also available at `POST /api/generate-mindmap`

Request body:

```json
{
  "text": "Your notes go here"
}
```

Response:

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

## Gemini Prompt Used

The backend wraps this user-facing prompt:

```text
Convert the following notes into a hierarchical mind map structure.
Return ONLY JSON in this format:
{
  "title": "",
  "nodes": [
    { "title": "", "children": [] }
  ]
}
Notes: [USER INPUT]
```

The response is constrained with a JSON schema before it reaches the client.

## Deployment

### Frontend on Vercel

1. Import the `client` folder as a Vercel project.
2. Set `VITE_API_BASE_URL` to your deployed backend URL plus `/api`.
3. Deploy.

`client/vercel.json` already includes an SPA rewrite for React Router.

### Backend on Render

1. Create a new Web Service from this repository.
2. Set the root directory to `server`.
3. Build command: `npm install`
4. Start command: `npm run start`
5. Add:
   - `GEMINI_API_KEY`
   - `GEMINI_MODEL`
   - `ALLOWED_ORIGIN`

The root [render.yaml](/Users/apple/Downloads/VS-code/Vibecode/mindmap/render.yaml) can also be used as a starting point.

### Backend on Railway

1. Create a service from the `server` folder.
2. Add the same environment variables.
3. Start with `npm run start`.

## Notes

- Saved mind maps are stored in browser local storage.
- Share links encode map data in the URL, so very large maps may create long links.
- Supabase persistence can be added later without changing the current UI architecture.
