/**
 * Express global error handling middleware.
 *
 * Logs the error to the console and returns a JSON response with the status code
 * and error message. Defaults to HTTP 500 if no status is provided.
 *
 * @param {Error & {status?:number}} err - The error object, optionally containing a `status` property.
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 * @param {import('express').NextFunction} next - Express next middleware function (unused).
 */
export const errorHandler = (err, req, res, next) => {
  console.error(err);
  const status = err.status || 500;
  res.status(status).json({ error: err.message || 'Server error' });
};
