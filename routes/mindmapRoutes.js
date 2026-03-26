import { Router } from 'express';
import { generateMindMap } from '../controllers/mindmapController.js';

const router = Router();

router.post('/generate-mindmap', generateMindMap);

export default router;

