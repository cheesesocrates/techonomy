/** An example brain to explore: a full-stack developer drifting into AI. */
export const SAMPLE_BRAIN = `
JavaScript, TypeScript, Python, SQL, Bash, Java, C, Go
React, Next.js, Vite, Tailwind CSS, HTML, CSS, DOM, Flexbox, CSS Grid, Accessibility, Responsive Design
Hooks, Virtual DOM, Server-Side Rendering, Single-Page Application, Redux, shadcn/ui, Figma, Design System
Node.js, Express, REST, GraphQL, JSON, WebSockets, API, Webhooks, Prisma, ORM, FastAPI
PostgreSQL, MySQL, MongoDB, Redis, SQLite, Supabase, Firebase, Indexing, Caching, Schema Migration, NoSQL, ACID
Git, GitHub, Pull Request, Code Review, VS Code, npm, Command Line, Debugger, Unit Testing, Jest, Playwright, Refactoring, Technical Debt, Monorepo
Docker, Containers, Kubernetes, CI/CD, GitHub Actions, AWS, S3, Vercel, Cloudflare, CDN, Serverless, AWS Lambda, DevOps, Terraform, Observability, Load Balancing, Logging, Sentry
LLM, ChatGPT, Claude, Prompt Engineering, RAG, Embedding, Vector Database, AI Agent, MCP, Claude Code, GitHub Copilot, Cursor, Hallucination, Token, Context Window, Vibe Coding, Machine Learning, Deep Learning, Neural Network, Transformer, Ollama, Hugging Face, LangChain, Function Calling
HTTP, HTTPS, DNS, TCP/IP, SSH, Linux, Unix, Process and Thread, Operating System, Virtual Machine, CPU, GPU, RAM, NVIDIA, ARM, Moore's Law
OAuth, JWT, Authentication, Authorization, TLS, Hash Function, Cross-Site Scripting, SQL Injection, OWASP Top 10, Multi-Factor Authentication, Phishing, GDPR, Zero Trust, Bitcoin, Ethereum, Blockchain
Open Source, Agile, Scrum, MVP, Product-Market Fit, Unix Philosophy, Local-First, SaaS, Network Effects, Vendor Lock-in, Enshittification, Lean Startup, Move Fast and Break Things, Conway's Law, Big O Notation, Hash Table, Data Structures, Recursion, Object-Oriented Programming, Functional Programming, Async/Await, Concurrency, Design Patterns, Regular Expressions, Compiler
`

/** Some terms it knows especially well, so the example shows every familiarity level. */
export const SAMPLE_LEVELS: Record<string, 1 | 3 | 4> = {
  react: 4,
  typescript: 4,
  javascript: 4,
  'next-js': 3,
  'tailwind-css': 3,
  'node-js': 3,
  postgresql: 3,
  git: 4,
  github: 3,
  docker: 3,
  'prompt-engineering': 3,
  llm: 3,
  'claude-code': 3,
  python: 3,
  kubernetes: 1,
  terraform: 1,
  'neural-network': 1,
  transformer: 1,
  blockchain: 1,
  ethereum: 1,
  'zero-trust': 1,
  'moore-s-law': 1,
}
