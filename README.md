# Techonomy

**An atlas of what you know in tech.**

List every tech term, tool and idea you're aware of, and your brain lights up as you type. Techonomy shows it as a plate from an anatomy atlas: 771 terms, each with a permanent home in a brain, in eight fields that sit in fitting lobes. Security is in the amygdala, Cloud in the cerebellum, Systems in the brain stem. What you know glows. What you don't stays dark, so the gaps are visible at a glance.

It then tells you plainly how much of the map you know, where you're strong, and what sits closest to what you already know.

## Run it

```bash
npm install
```

```bash
npm run dev
```

Then open <http://localhost:5199>.

Everything works without an API key. A key adds three things: placing terms the map doesn't have, explaining a term through what you already know, and a written reading of your brain.

## Any key works

Paste a key and Techonomy works out whose it is from its shape, then lists that account's models. No other setup.

| Provider | Key looks like |
|---|---|
| Claude | `sk-ant-…` |
| Grok (xAI) | `xai-…` |
| OpenAI | `sk-proj-…`, `sk-…` |
| Gemini | `AIza…` |
| OpenRouter | `sk-or-…` |
| Groq | `gsk_…` |
| Fireworks | `fw_…` |
| Cerebras | `csk-…` |
| Together | `tgp_…` |
| Mistral, DeepSeek | pick from the list |
| Ollama, LM Studio | no key, runs on your computer |
| Anything OpenAI-compatible | choose "Other" and give an address |

**Your key is yours.** It's held in this tab unless you tick "Remember on this device", and it goes straight from your browser to the provider. There is no server. A key is never tried against another company to see which accepts it: detection is by shape alone, and an ambiguous key makes you choose.

Filing terms is cheap. On Claude, about 500 terms costs a dollar or two on Opus 5.5 and a few cents on Haiku 5.5 (rough estimates). The app shows an estimate before it spends anything.

## Trying it with no key and no cost

A mock provider speaks both wire formats and refuses what the real APIs refuse.

```bash
npm run mock-ai
```

In the app choose **Connect any AI**, type anything in the key field, pick **Other**, and use `http://localhost:8787/v1` as the server address. Keys containing `bad` get a 401 and keys containing `broke` run out of credit.

## Commands

| Command | Does |
|---|---|
| `npm run dev` | Dev server on port 5199 |
| `npm test` | Map integrity, parser, stats, layout and provider tests |
| `npm run build` | Type-check and build to `dist/` |
| `npm run preview` | Serve the production build |
| `npm run mock-ai` | Fake AI provider on port 8787 |

## Deploy

`dist/` is plain static files, so any static host works. On Vercel, import the repository and the Vite defaults are correct.

## How the stats work

- **Awareness** is the share of the map you know, weighted so a core term counts three times a specialist one. It's coverage of this map, not of all of technology.
- **Breadth** is how many fields you reach into. A field counts as fully reached at a third of its weight.
- **Depth** is how much of the core you hold in the fields you've entered, and how well, using your familiarity levels.
- **Connection** is how much of what you know links up into one web.
- **Currency** is the share of terms from 2023 onward that you know.

The map is self-reported: it measures what you say you're aware of, not what you can do.

## How it's built

TypeScript, Vite, React and Zustand, with GSAP for motion. The brain is hand-written Canvas 2D with no graph library. Fonts are self-hosted: Ibarra Real Nova, and Atkinson Hyperlegible Next and Mono. Claude calls use the official Anthropic SDK, loaded only when someone connects a Claude key. Other providers share one small OpenAI-compatible client.

`CLAUDE.md` has the architecture and the rules that keep it working.
