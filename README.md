# AskFlow AI - Full-Stack AI Chatbot Application

AskFlow AI is a high-performance, full-stack AI application powered by **React.js (TypeScript)**, **Tailwind CSS**, **Node.js (Express.js)**, **Supabase Auth & PostgreSQL**, **Zod validation**, and **Google Gemini API** using the `@google/genai` SDK.

---

## 🌟 Key Features

- **🔒 Authentication & Protected Routes**: Complete user signup, login, and logout flow using Supabase Auth, wrapped in protected client-side routes.
- **🖥️ Responsive Layout**: Left sidebar navigation with active indicators, recent chat history, user profile display, and logout controls.
- **📊 Modern Dashboard**: Personalized welcome greeting with live total AI conversation metrics and a quick "Start New Chat" card.
- **🤖 Full-Page AI Chatbot**: High-speed conversational UI with user and AI message bubbles, loading indicators, message history, and copy-to-clipboard functionality.
- **🔐 Enterprise-Grade Security**:
  - Gemini API key and Supabase Service Role key are stored strictly in the Node.js backend.
  - Supabase PostgreSQL **Row Level Security (RLS)** ensures users can only access their own conversations and messages.
  - Incoming HTTP payloads are strictly validated using **Zod**.

---

## 📁 Repository Structure

```
anti/
├── frontend/                   # React + TypeScript + Vite + Tailwind CSS + Lucide Icons
│   ├── src/
│   │   ├── components/         # Layout, Sidebar, ProtectedRoute
│   │   ├── context/            # AuthContext.tsx (Supabase Auth session state)
│   │   ├── pages/              # Login, Signup, Dashboard, ChatPage
│   │   ├── lib/                # supabaseClient.ts, api.ts
│   │   ├── types/              # auth.ts, chat.ts
│   │   ├── App.tsx             # React Router configuration
│   │   ├── main.tsx            # Entry point
│   │   └── index.css           # Styling system & glassmorphic tokens
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   ├── .env.example
│   └── package.json
│
├── backend/                    # Node.js + Express + TypeScript + Zod + @google/genai
│   ├── src/
│   │   ├── controllers/        # chatController.ts, conversationController.ts
│   │   ├── middleware/         # authMiddleware.ts (JWT verification)
│   │   ├── routes/             # chatRoutes.ts, conversationRoutes.ts
│   │   ├── services/           # geminiService.ts (@google/genai SDK), supabaseService.ts
│   │   ├── utils/              # validation.ts (Zod schemas)
│   │   └── server.ts           # Express server entrypoint
│   ├── tsconfig.json
│   ├── .env.example
│   └── package.json
│
├── supabase/
│   └── migrations/
│       └── 20260801_initial_schema.sql  # Database schema + RLS policies
└── README.md                   # Project documentation
```

---

## ⚙️ Prerequisites

- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **Supabase Account**: (Free tier at [supabase.com](https://supabase.com))
- **Google Gemini API Key**: (Get free key from [Google AI Studio](https://aistudio.google.com/))

---

## 🛠️ Step-by-Step Setup Instructions

### 1. Database & Supabase Setup

1. Log into your [Supabase Dashboard](https://database.supabase.com/) and create a new project.
2. Navigate to **SQL Editor** in the left sidebar.
3. Open `supabase/migrations/20260801_initial_schema.sql`, copy all SQL contents, paste into the editor, and click **Run**.
4. This creates the `conversations` and `messages` tables and applies strict **Row Level Security (RLS)** policies restricting data access to `auth.uid() = user_id`.

---

### 2. Backend Setup

1. Open a terminal and navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create your `.env` file from the example:
   ```bash
   cp .env.example .env
   ```
4. Fill in your secrets inside `backend/.env`:
   ```env
   PORT=5000
   GEMINI_API_KEY=your_actual_gemini_api_key
   SUPABASE_URL=https://your-supabase-project-id.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
5. Start the backend development server:
   ```bash
   npm run dev
   ```
   *The backend will run at `http://localhost:5000`.*

---

### 3. Frontend Setup

1. Open a new terminal window and navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create your `.env` file from the example:
   ```bash
   cp .env.example .env
   ```
4. Configure `frontend/.env`:
   ```env
   VITE_SUPABASE_URL=https://your-supabase-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_BACKEND_URL=http://localhost:5000
   ```
5. Start the frontend Vite development server:
   ```bash
   npm run dev
   ```
   *The frontend application will run at `http://localhost:3000`.*

---

## 🚀 Running the Application

1. Ensure both **backend** (`http://localhost:5000`) and **frontend** (`http://localhost:3000`) are running.
2. Open your browser and navigate to `http://localhost:3000`.
3. Sign up with a new user account (or use Demo mode).
4. Navigate through the **Dashboard** to view live total AI conversation counts.
5. Click **AI Chatbot** or **Start New Chat** to engage with Gemini AI in full-page mode.

---

## 🔒 Security Architecture Highlights

- **No Exposed API Keys**: Frontend never contains `GEMINI_API_KEY` or Supabase `service_role` keys. All requests are routed through Express.
- **Row Level Security (RLS)**: PostgreSQL enforces that users can read and write only data where `user_id = auth.uid()`.
- **Payload Validation**: Zod verifies input lengths and formats prior to processing.
