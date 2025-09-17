/**
 * Higher-order middleware for validating request bodies using a Zod schema.
 *
 * If validation fails, responds with HTTP 400 and a JSON object containing the error details.
 * If validation succeeds, attaches the parsed data to `req.validated` and calls `next()`.
 *
 * @param {import('zod').ZodSchema} schema - Zod schema used to validate the request body.
 * @returns {import('express').RequestHandler} Express middleware function.
 */
export const validate = (schema) => (req, res, next) => {
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      error: 'Validation error',
      details: parsed.error.flatten(),
    });
  }
  req.validated = parsed.data; // { query }
  next();
};
