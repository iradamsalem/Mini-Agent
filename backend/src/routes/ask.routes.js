import { Router } from 'express';
import { validate } from '../middleware/validate.js';
import { askSchema } from '../validations/ask.schema.js';
import { askController } from '../controllers/agent.controller.js';

const router = Router();
router.post('/', validate(askSchema), askController);
export default router;
