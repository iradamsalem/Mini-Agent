import { z } from 'zod';

/**
 * Zod schema for validating "ask" requests.
 *
 * Ensures that the body contains:
 * - `query`: a non-empty string (minimum length: 1).
 *
 * Example valid payload:
 * ```json
 * { "query": "What is the motto of the company?" }
 * ```
 *
 * @type {import('zod').ZodObject<{query: import('zod').ZodString}>}
 */
export const askSchema = z.object({
  query: z.string().min(1, 'query is required')
});
