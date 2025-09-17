import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// טוען את קובץ .env שנמצא בתיקיית backend
dotenv.config({ path: path.resolve(__dirname, '../.env') });



import app from './app.js';

const port = process.env.PORT || 3001;
app.listen(port, () => console.log(`🚀 API running on http://localhost:${port}`));
