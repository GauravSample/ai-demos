# AI Demos

Exploring OpenAI APIs — chat, prompt engineering, embeddings, and RAG — built with Next.js.

Live: [https://main.d30kst47gtj7uu.amplifyapp.com](https://main.d30kst47gtj7uu.amplifyapp.com)

---

## What's Inside

### Day 1 — OpenAI Chat
Conversational chat with token-limit context management using `gpt-4o-mini`.
- Multi-turn conversation with context window
- Automatically resets context when token limit is reached
- Token usage visualized in real time

### Day 2 — Prompt Comparator
Same question sent to 4 different system prompts simultaneously.
- Zero-shot
- Role + Chain-of-thought
- Few-shot
- Structured output
- Side-by-side comparison of output tokens, response time, and response length

### Day 3 — Embeddings Explorer
Step-by-step exploration of how text embeddings work using `text-embedding-3-small`.
- Single embedding — visualize a 1536-dimension vector
- Batch embedding — embed multiple texts in one API call
- Cosine similarity — measure semantic closeness between sentences (pure JS, no library)

### Day 4–5 — RAG Demo
A minimal Retrieval-Augmented Generation pipeline built from scratch.
- Paste any document → chunked and embedded into an in-memory vector store
- Ask a question → semantically retrieves relevant chunks → generates a grounded answer
- Shows retrieved source chunks with similarity scores

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| UI | React 18, CSS Modules |
| AI | OpenAI API (`gpt-4o-mini`, `text-embedding-3-small`) |
| Hosting | AWS Amplify |
| CDN | CloudFront (auto-provisioned by Amplify) |
| SSL | AWS Certificate Manager (auto-provisioned) |

---

## Architecture

```
Browser
   |
CloudFront (CDN + SSL)
   |
Amplify Hosting
   |
   ├── Static assets (JS/CSS) → served from S3/CloudFront edge
   |
   └── Next.js Lambda Functions
         ├── /                → SSR page
         ├── /api/chat        → OpenAI chat completions
         └── /api/embeddings  → OpenAI embeddings
```

### API Key Security

The OpenAI API key is never exposed to the browser. All API calls go through server-side Next.js Route Handlers:

```
Browser → POST /api/chat (just the message)
               ↓
     Next.js API Route (server only)
               ↓  uses OPENAI_API_KEY
           OpenAI API
               ↓
     JSON response back to browser
```

The key is stored in AWS SSM Parameter Store and injected at build time — never in the codebase.

---

## Running Locally

```bash
# 1. Clone the repo
git clone https://github.com/GauravSample/ai-demos.git
cd ai-demos

# 2. Install dependencies
npm install

# 3. Add your OpenAI key
echo "OPENAI_API_KEY=sk-..." > .env.local

# 4. Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Deployment

Deployed on AWS Amplify with automatic CI/CD on every push to `main`.

Environment variables are stored in AWS SSM Parameter Store at:
```
/amplify/{appId}/{branch}/OPENAI_API_KEY
```
