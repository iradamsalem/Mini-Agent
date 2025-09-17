/**
 * Express middleware for handling 404 "Not Found" routes.
 *
 * Sends a JSON response with a 404 status code when no other route matches.
 *
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 * @param {import('express').NextFunction} next - Express next middleware function (unused).
 */
export const notFound = (req, res, next) => {
  res.status(404).json({ error: 'Not Found' });
};
