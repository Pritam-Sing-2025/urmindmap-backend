export const MINDMAP_JSON_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['title', 'nodes'],
  properties: {
    title: {
      type: 'string',
      minLength: 1
    },
    nodes: {
      type: 'array',
      minItems: 1,
      maxItems: 10,
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['title', 'children'],
        properties: {
          title: {
            type: 'string',
            minLength: 1
          },
          children: {
            type: 'array',
            maxItems: 8,
            items: {
              type: 'string',
              minLength: 1
            }
          }
        }
      }
    }
  }
};

function cleanText(value, fallback = '') {
  if (typeof value !== 'string') {
    return fallback;
  }

  const normalized = value.replace(/\s+/g, ' ').trim();

  return normalized || fallback;
}

export function buildMindMapPrompt(text) {
  return `Convert the following notes into a hierarchical mind map structure.
Return ONLY JSON in this format:
{
  "title": "",
  "nodes": [
    { "title": "", "children": [] }
  ]
}
Notes: ${text}`;
}

export function sanitizeMindMap(payload) {
  const safePayload = payload && typeof payload === 'object' ? payload : {};
  const rawNodes = Array.isArray(safePayload.nodes) ? safePayload.nodes : [];

  const nodes = rawNodes
    .map((node, index) => ({
      title: cleanText(node?.title, `Branch ${index + 1}`),
      children: Array.isArray(node?.children)
        ? node.children.map((child) => cleanText(child)).filter(Boolean).slice(0, 8)
        : []
    }))
    .filter((node) => node.title);

  if (!nodes.length) {
    const error = new Error('The AI response did not include any valid mind map branches.');
    error.statusCode = 422;
    error.expose = true;
    throw error;
  }

  return {
    title: cleanText(safePayload.title, 'Generated Mind Map'),
    nodes: nodes.slice(0, 10)
  };
}

