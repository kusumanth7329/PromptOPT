# ⚡ PromptOpt

**AI-powered prompt optimizer that turns vague instructions into precision prompts — in seconds.**

[![MIT License](https://img.shields.io/badge/license-MIT-6366f1?style=flat-square)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4-3178c6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Gemini](https://img.shields.io/badge/Powered%20by-Gemini%202.5%20Flash-4285f4?style=flat-square&logo=google&logoColor=white)](https://ai.google.dev/)
[![Node](https://img.shields.io/badge/Node.js-20+-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org/)

---

## What is PromptOpt?

Most people write prompts like this:

> *"Write a blog post about AI."*

That gets you a generic, forgettable response. PromptOpt runs your prompt through an AI judge that scores it across **4 quality dimensions**, then an optimizer rewrites it — iteratively — until it scores near-perfect. The result:

> *"Write a 600–800 word blog post for tech-curious readers on a popular science blog. Tone: informative, engaging, and optimistic — no jargon. Topic: 'How AI is Already Transforming Our Daily Lives.' Include: a curiosity-provoking title, an intro that defines AI simply, three body paragraphs each with a concrete real-world example, a forward-looking conclusion, and a call to action inviting readers to share their experiences."*

Same intent. Dramatically better output.

---

## How It Works

```
Your Prompt
    │
    ▼
┌─────────────┐
│  AI Judge   │  Scores on 4 dimensions (0–10 each, 40 total)
│             │  Clarity · Specificity · Context · Output Guidance
└──────┬──────┘
       │ score + reasoning
       ▼
┌─────────────┐
│  Optimizer  │  Rewrites the prompt, attacking the weakest dimension
│             │  Returns improved prompt + list of changes made
└──────┬──────┘
       │
       ▼
  Repeat N times
       │
       ▼
  Final Prompt  (+15 to +30 points improvement, typically)
```

The engine uses **two separate AI agents** — a Judge and an Optimizer — so neither one grades its own work.

---

## Features

- **Real-time progress** — watch each iteration stream in as it completes
- **4-dimension scoring** — Clarity, Specificity, Context, Output Guidance scored 0–10 each
- **Step tracker** — visual progress indicator that fills as passes complete
- **Animated score cards** — color-coded quality bars, per-dimension breakdowns
- **1-click copy** — copy the final optimized prompt instantly
- **Retry logic** — automatically retries on 429/503 with exponential backoff
- **Configurable depth** — 1 pass (quick), 2 passes (balanced), or 3 passes (deep dive)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Language | TypeScript (ESM) |
| AI Engine | Google Gemini 2.5 Flash |
| Backend | Express.js + Server-Sent Events |
| Frontend | Vanilla HTML/CSS/JS (no framework) |
| Runtime | Node.js + tsx |

---

## Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/kusumanth7329/PromptOPT.git
cd PromptOPT
```

### 2. Install dependencies

```bash
npm install
```

### 3. Get a free Gemini API key

1. Go to [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)
2. Sign in with a **personal Gmail** account
3. Click **Create API key** → copy the key

> ⚠️ Use a personal Gmail, not a university/workspace account — those often have free tier restrictions.

### 4. Add your API key

Create a `.env` file in the project root:

```env
GEMINI_API_KEY=AIza...
```

### 5. Run

```bash
npm run dev
```

Open **http://localhost:3000** in your browser.

---

## CLI Mode

To run the optimizer directly in the terminal (no UI):

```bash
npm run test-engine
```

This runs 3 optimization passes on the default test prompt and prints the full output to your console.

---

## Project Structure

```
PromptOPT/
├── engine/
│   ├── types.ts        # TypeScript interfaces
│   ├── judge.ts        # AI judge — scores a prompt on 4 dimensions
│   ├── optimizer.ts    # AI optimizer — rewrites based on judge feedback
│   ├── index.ts        # Orchestration loop (judge → optimize → judge)
│   └── utils.ts        # Retry logic + sleep helper
├── public/
│   ├── index.html      # Web UI (HTML + CSS)
│   └── app.js          # Frontend JavaScript
├── server.ts           # Express server + SSE streaming endpoint
├── test-engine.ts      # CLI test runner
├── tsconfig.json
└── package.json
```

---

## Scoring Dimensions

| Dimension | What it measures |
|---|---|
| **Clarity** | Is the intent clear and unambiguous? Could two people interpret it differently? |
| **Specificity** | Are the instructions precise? Or does the AI have to guess at details? |
| **Context** | Is enough background, role, or constraints provided? |
| **Output Guidance** | Is the desired format, length, tone, or structure defined? |

Each dimension is scored **0–10**, for a maximum total of **40 points**.

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `GEMINI_API_KEY` | Yes | Your Google AI Studio API key |

---

## License

[MIT](LICENSE) — free to use, modify, and distribute.

---

<p align="center">Built at Northeastern University · Powered by Gemini 2.5 Flash</p>
