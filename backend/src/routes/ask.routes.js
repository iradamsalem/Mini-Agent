import { Router } from 'express';
import { validate } from '../middleware/validate.js';
import { askSchema } from '../validations/ask.schema.js';
import { askController } from '../controllers/agent.controller.js';

/**
 * Router for handling "ask" requests.
 *
 * POST / :
 * - Validates the request body against `askSchema`
 * - Passes the validated data to `askController` for processing.
 *
 * This endpoint is typically used by the frontend to query the MiniAgent (RAG/DB/Direct).
 *
 * @type {import('express').Router}
 */
const router = Router();

router.post('/', validate(askSchema), askController);

export default router;
