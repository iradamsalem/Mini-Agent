import app from './app.js';

/**
 * Entry point of the server.
 *
 * - Loads the Express app from `app.js`.
 * - Starts listening on the configured `PORT` environment variable or defaults to 3001.
 * - Logs a message to the console with the local URL when the server is ready.
 *
 * @constant {number|string} port - The port number the server listens on.
 */
const port = process.env.PORT || 3001;

app.listen(port, () =>
  console.log(`🚀 API running on http://localhost:${port}`)
);
