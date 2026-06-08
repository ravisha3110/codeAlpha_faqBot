# 🤖 FAQ Chatbot — NLP & ML Powered

A full-stack intelligent FAQ chatbot built with **React.js** (frontend) and **Python FastAPI** (backend), using **NLP preprocessing**, **TF-IDF + Cosine Similarity**, and optionally **Sentence Transformers** for semantic search.

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🧠 NLP Pipeline | Lowercasing, tokenization, stop-word removal, lemmatization |
| 📊 TF-IDF Mode | Fast cosine similarity matching |
| 🔮 Semantic Mode | `all-MiniLM-L6-v2` sentence embeddings |
| 💬 Chat UI | Bubbles, timestamps, typing animation, auto-scroll |
| 🎯 Confidence Score | Visual badge + evaluation dashboard |
| 📚 FAQ Browser | Searchable sidebar with category filters |
| 💡 Suggestions | Clickable question chips per category |
| 🌙 Dark / Light Mode | Smooth theme switching |
| 📱 Mobile Responsive | Works on all screen sizes |
| 🗑 Clear Chat | Reset conversation history |

---

## 🗂 Project Structure

```
faq-chatbot/
├── backend/
│   ├── app.py               # FastAPI app (endpoints)
│   ├── preprocessing.py     # NLP preprocessing pipeline
│   ├── similarity_engine.py # TF-IDF + Semantic engines
│   ├── faq_data.json        # 55 FAQs across 9 categories
│   └── requirements.txt     # Python dependencies
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── ChatWindow.jsx          # Scrollable message container
    │   │   ├── MessageBubble.jsx       # User/bot chat bubbles
    │   │   ├── ChatInput.jsx           # Input bar + mode selector
    │   │   ├── SuggestedQuestions.jsx  # Quick question chips
    │   │   ├── ThemeToggle.jsx         # Dark/Light toggle
    │   │   ├── EvaluationDashboard.jsx # Metrics panel
    │   │   └── FAQSearch.jsx           # FAQ browser sidebar
    │   ├── services/
    │   │   └── api.js       # Axios API layer
    │   ├── App.jsx          # Root component + state management
    │   └── App.css          # Complete design system
    ├── index.html
    └── package.json
```

---

## 🚀 Setup & Running

### Prerequisites

- **Python 3.10+**
- **Node.js 18+**

---

### Backend Setup

```bash
# 1. Navigate to backend folder
cd backend

# 2. Create a virtual environment (recommended)
python -m venv venv

# On Windows:
venv\Scripts\activate

# On Mac/Linux:
source venv/bin/activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Start the FastAPI server
uvicorn app:app --reload --host 0.0.0.0 --port 8000
```

The backend will be available at: **http://localhost:8000**  
Swagger API docs: **http://localhost:8000/docs**

---

### Frontend Setup

```bash
# 1. Navigate to frontend folder
cd frontend

# 2. Install npm packages
npm install

# 3. Start the development server
npm run dev
```

The frontend will be available at: **http://localhost:5174**

---

## 🔌 API Reference

### `POST /chat`

Match a user query against the FAQ knowledge base.

**Request:**
```json
{
  "message": "How can I reset my password?",
  "mode": "tfidf"
}
```

**Response:**
```json
{
  "answer": "Click on 'Forgot Password' on the login page...",
  "confidence": 0.9234,
  "confidence_pct": 92,
  "matched_question": "How do I reset my password?",
  "category": "Account",
  "response_time_ms": 12.4,
  "is_fallback": false,
  "mode": "tfidf"
}
```

### `GET /faqs`

Returns all FAQs in the knowledge base.

**Response:**
```json
{
  "count": 55,
  "faqs": [
    {
      "id": 1,
      "question": "What is your return policy?",
      "answer": "Products can be returned within 30 days...",
      "category": "Returns"
    }
  ]
}
```

### `GET /health`

```json
{ "status": "healthy", "timestamp": 1717834217.123 }
```

---

## 🧪 NLP Pipeline

```
Raw Text
   ↓ Lowercase
   ↓ Contraction expansion (can't → cannot)
   ↓ Punctuation removal
   ↓ NLTK Tokenization
   ↓ Stop-word removal (keeping: how, what, when, where, why, which, who)
   ↓ Lemmatization (WordNetLemmatizer)
   ↓ Short token filtering (len > 1)
   ↓ Rejoin
Preprocessed Text
```

---

## 🤖 Similarity Matching

### TF-IDF Mode (Default)

1. All FAQ questions preprocessed and indexed with `TfidfVectorizer` (unigrams + bigrams)
2. User query preprocessed and transformed to TF-IDF vector
3. Cosine similarity computed against all FAQ vectors
4. Highest-scoring FAQ returned if score ≥ 0.50

### Semantic Mode (Bonus)

1. All FAQ questions encoded with `all-MiniLM-L6-v2` sentence transformer
2. User query encoded to L2-normalized embedding
3. Cosine similarity via dot product
4. Highest-scoring FAQ returned if score ≥ 0.50

---

## 📊 FAQ Categories

| Category | # FAQs |
|----------|--------|
| Returns | 4 |
| Shipping | 6 |
| Account | 5 |
| Payments | 7 |
| Orders | 5 |
| Products | 5 |
| Support | 4 |
| Technical | 5 |
| Privacy | 5 |

---

## 🧠 Enabling Semantic Search

Semantic mode is included in `requirements.txt`. First run will download the ~90MB model:

```bash
pip install sentence-transformers
```

Then in the UI, click the **🧠 Semantic** pill in the input bar.

---

## 📝 Example Queries

| Input | Expected Output |
|-------|----------------|
| "How do I change my password?" | Reset password instructions |
| "I want my money back" | Return policy (30 days) |
| "When will my order arrive?" | 3-5 business days |
| "Do you ship internationally?" | Yes, 50+ countries |
| "Where is my package?" | Tracking instructions |

---

## 🏗 Built With

- **React 18** + **Vite** — Frontend framework
- **FastAPI** + **Uvicorn** — Python web framework
- **NLTK** — NLP preprocessing
- **scikit-learn** — TF-IDF vectorization + cosine similarity
- **sentence-transformers** — Semantic search
- **Axios** — HTTP client
- **Inter** (Google Fonts) — Typography
"# codeAlpha_faqBot" 
