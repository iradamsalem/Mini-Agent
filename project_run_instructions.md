# Mini-Agent  

Mini-Agent is a small end-to-end system with a **backend** (API + database) and a **frontend** (user interface).  
Follow these instructions to set up and run the project from scratch.

---

## 📥 Step 1: Clone the Repository  

Clone the repository from GitHub and open the project folder:

```bash
git clone https://github.com/iradamsalem/Mini-Agent.git
cd Mini-Agent
```

---

## ⚙️ Step 2: Create Environment Files  

Both the **backend** and **frontend** require their own `.env` files.  
Each folder contains a file named `.env.example`. Copy it to `.env` and update the values as needed.

### 🔧 Backend  

From the **project root**, run:

```bash
cd backend
cp .env.example .env
```

Then open `backend/.env` and update the values:

```env
PORT=3001
DATABASE_URL=postgres://postgres:postgres@localhost:5432/mini_agent
GOOGLE_API_KEY=YOUR_KEY_HERE
```

* **PORT** – The port where the backend server will run (3001 is recommended).
* **DATABASE_URL** – PostgreSQL connection string (default port is 5432).
* **GOOGLE_API_KEY** – Your Google AI key.

---

### 🔧 Frontend  

Return to the **project root**, then run:

```bash
cd frontend
cp .env.example .env
```

Then open `frontend/.env` and update the values if needed:

```env
VITE_API_BASE_URL=http://localhost:3001
```

* **VITE_API_BASE_URL** – The URL where the backend API is running.

---

## 📦 Step 3: Install Dependencies  

### 📂 Backend  
From the **project root**, run:

```bash
cd backend
npm install
```

### 📂 Frontend  
Return to the **project root**, then run:

```bash
cd frontend
npm install
```

---

## 🗄️ Step 4: Create the Database  

Make sure PostgreSQL is running and create a database named `mini_agent`:

```bash
createdb mini_agent
```

You can also create the database using pgAdmin or DBeaver if you prefer a GUI.

---

## 🏗️ Step 5: Initialize and Seed the Database  

From the **project root**, run the following commands:

### 🏛️ Initialize Schema  

The schema initialization script is located at  
`Mini-Agent/backend/src/db/migrations/init.sql`.  
Run it to create all tables in the `mini_agent` database:

```bash
psql -d mini_agent -f backend/src/db/migrations/init.sql
```

> **Explanation:** This step creates all necessary tables in the database.

### 🌱 Seed Sample Data  

After initializing the schema, run:

```bash
node backend/src/db/seed/seed.js
```

> **Explanation:** This step fills the database with sample data for testing.

---

## 🚀 Step 6: Run the Application  

### ▶️ Start Backend  

From the **project root**, run:

```bash
cd backend
npm run dev
```

You can also run the tests from the **backend** folder:

```bash
npm test
```

### ▶️ Start Frontend  

Open a **new terminal window**, go to the **project root**, then run:

```bash
cd frontend
npm run dev
```

Once both servers are running, open the URL printed by the frontend (usually `http://localhost:3000`).

---

## 🧪 Step 7: Example Questions for Testing  

Use these example questions to test the system.

### 📋 Company & Policy (RAG)  
* What is your refund policy?
* Do you accept product returns?
* How long does it take to process a refund?
* How many days does domestic shipping usually take?
* Do you support international shipping?
* How do you handle my personal data?
* What password rules do you require and do you support two-factor authentication?
* What is the motto of the company?
* Tell me about the company and its mission.

### 💾 Database-Related (DB Tool)  
* What is the balance of user 123?
* What is the balance of user 124?
* What is the balance of user 999?

### 🎲 Fun / General (Direct Tool – Not DB/RAG)  
* Tell me a short database joke.
* Tell me a programming joke.
* What is 2 + 2?
* Suggest me a random book to read.
* What are some popular programming languages?
