# AI Demos

Exploring OpenAI APIs — chat, prompt engineering, embeddings, and RAG — built with Next.js.

Live: [https://main.d30kst47gtj7uu.amplifyapp.com](https://main.d30kst47gtj7uu.amplifyapp.com)

---

## What's Inside

### Conversational AI
Multi-turn chat with manual context window management using `gpt-4o-mini`.
- Conversation history tracked in state and passed with every request
- Context automatically resets when token limit is reached — mimicking how production chatbots handle long sessions
- Token usage visualized in real time

### Prompt Engineering
The same question sent to 4 different system prompts in parallel, comparing results side by side.
- Zero-shot
- Role + Chain-of-thought
- Few-shot
- Structured output
- Compares output tokens (cost), response time, and response length across all 4

### Embeddings
Text converted into 1536-dimension vectors using `text-embedding-3-small`.
- Visualize a single embedding vector
- Batch multiple texts in one API call
- Cosine similarity computed in plain JavaScript — no vector library — to show how semantic search works under the hood

### RAG Pipeline
Retrieval-Augmented Generation built from scratch — no LangChain, no framework.
- Paste any document → chunked and embedded into an in-memory vector store
- Ask a question → semantically retrieves the most relevant chunks → injects them as context → generates a grounded answer
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

### Production-grade features
- **Rate limiting** — 20 requests/min per IP via Next.js middleware
- **Input validation** — message length and format checked before hitting OpenAI
- **Error boundaries** — each tab is isolated, crashes don't take down the whole app
- **Logging** — all API errors logged with context, visible in AWS CloudWatch

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

The key is stored in AWS SSM Parameter Store — never in the codebase.

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

## Running Tests

```bash
npm test
```

Unit tests cover `cosineSimilarity`, `chunkText`, and API input validation logic.

---

## Deployment

Deployed on AWS Amplify with automatic CI/CD on every push to `main`.

Environment variables are stored in AWS SSM Parameter Store at:
```
/amplify/{appId}/{branch}/OPENAI_API_KEY
```
