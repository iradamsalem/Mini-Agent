
````markdown
# Mini-Agent 🤖

Mini-Agent is a lightweight end-to-end project combining:
- 🌐 **Backend** with REST API + PostgreSQL database  
- 🎨 **Frontend** with modern UI and interactive chat  
- 🧠 **AI-powered Q&A** with RAG (Retrieval-Augmented Generation)

---

## ✨ Key Features

- 💬 **Interactive Chat UI**  
  - Displays which tool was used for each answer (DB, RAG, or Direct)  
  - Includes a matching icon for better visualization  
  - Supports **Day/Night mode** toggle for a comfortable viewing experience

- 📚 **RAG Tool with Sources**  
  - Each RAG answer includes **sources and returned chunks**, so you can trace where the information came from.  
  - Perfect for debugging and demonstrating how retrieval-augmented generation works.

- 🗄️ **Database Tool**  
  - Allows querying of users' balances directly from the database for demo purposes.

- 🧩 **Seeded Example Data**  
  - Pre-populated database with users and documents so you can test the system right away.

---

## 🧪 Running Tests

This project includes basic tests to verify core functionality.

From the **project root**, run:

```bash
cd backend
npm test
````

You should see all tests passing ✅ before running the demo.

---


## ⚙️ Setup & Run Instructions

For full installation and run instructions (including environment setup, database initialization, and test questions), see:
📄 **[project\_run\_instructions.md](./project_run_instructions.md)**

---


