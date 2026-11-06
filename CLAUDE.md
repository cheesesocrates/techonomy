# Techonomy handover

A static, local-first BYOK web app. The user lists tech terms; they light up on a fixed anatomical brain; the app reports how much of the reference map they know. **Update this file whenever the code changes.**

## Commands

- `npm run dev`: dev server on **5199** (5173 is used by another project)
- `npm test`: vitest, must stay green
- `npm run build`: `tsc --noEmit` then `vite build`
- `npm run mock-ai`: fake provider on 8787, speaking both wire formats

## Decisions that are settled

These came from the user. Don't reverse them without asking.

- **No RAG in v1. The reference map is the only knowledge source.** No news feeds, no web fetching, no embeddings, no vector store.
- **Any key, not Claude-only.** Claude is one provider of many. Grok must stay.
- **GSAP for all UI motion.**
- **No AI-slop fonts or looks.** No Inter, Space Grotesk, Poppins, Geist, Fraunces, Instrument Serif. No purple gradients, glassmorphism, emoji icons, or uppercase mono eyebrow labels.
- **Low cognitive load is a requirement.** Prefer removing a control to adding one.
- **The GitHub repo is private for now.** Do not make it public, and do not deploy to a public URL (Vercel or anywhere else), until Ayan says so.

## Rules that keep it working

1. **Eight domains, forever.** The eight pigments in `src/map/types.ts` were validated in that exact order for colour-blind separation on these exact surfaces, in both themes. Never reorder, recolour or add a ninth. Finer detail is an `area`. If a colour or surface changes, re-run the dataviz skill's validator.
2. **Colour means knowledge.** Chrome is ink and paper only. Colour on screen always means a field. Text never wears a domain colour; a dot beside it carries identity.
3. **Geography is fixed.** `src/brain/layout.ts` gives every term a deterministic home. Adding a term must never move another. That's what builds spatial memory, so don't introduce a force layout. Adding terms to the map does shift positions, which is acceptable between releases.
4. **The map must stay one connected web.** `tests/map.test.ts` enforces it, because otherwise full knowledge can't reach full Connection. New terms need at least one link into the web.
5. **Stats must agree with each other.** A number and the sentence beside it must be the same measurement. Currency was once weighted while its caption wasn't, and read 55% next to 17%.
6. **Never probe a key.** `detectProvider` uses the key's shape only. Testing a key against several providers would send someone's secret to companies it wasn't meant for.
7. **No server.** All 11 hosted providers allow direct browser calls (checked for both `/models` and `/chat/completions`, from a real browser origin). Keys stay in `sessionStorage` unless "Remember" is ticked.
8. **Render untrusted text as text.** AI output and user input go through React or `textContent`, never `innerHTML`.

## Claude specifics

- Uses the official `@anthropic-ai/sdk`, dynamically imported so it's a separate chunk.
- SDK 1.6 sends API keys as `Authorization: Bearer`, not `x-api-key`.
- Default model is `claude-opus-5-5`, chosen by the `prefer` list in `src/ai/providers.ts`.
- `src/ai/claude.ts` streams through `client.beta.messages.stream` with structured outputs (`output_config.format`), `effort: 'low'` for this classification-style work, and `fallbacks: 'default'` with beta `server-side-fallback-2026-07-01`. Each is gated by model and dropped and retried if the API rejects it.
- Don't send `temperature`, forced `tool_choice`, assistant prefill, or `thinking: disabled`. Current models 400 on them. The mock rejects them too.

## Layout

```
src/map/domains/*.ts   the 771 terms, in a line-based format: name | aliases | kind | year | weight | def | related
src/map/index.ts       parses it, folds spellings (norm), resolves links, reports problems
src/map/types.ts       the eight domains and their pigments
src/brain/anatomy.ts   hand-placed outlines, sulci and folia
src/brain/layout.ts    fills the shapes with points and assigns every term a spot
src/brain/plate.ts     Canvas renderer: camera, semantic zoom, ignite, pulses, hit testing
src/brain/atlas.ts     the singleton atlas, and `stage.plate` so any page can point at the plate
src/engine/parse.ts    turns a dump into terms, with typo tolerance and everyday-word guards
src/engine/stats.ts    all scoring, tiers, frontier ordering, plain-language summaries
src/ai/                providers and key detection, Claude adapter, OpenAI-compatible adapter, tasks
src/state/store.ts     Zustand store, persistence, undo, AI actions
src/ui/                App shell and one file per page
src/lib/motion.ts      GSAP setup and the shared rise and grow hooks
scripts/mock-llm.mjs   the fake provider
```

## Design system

- Concept: an open atlas. Left is the text page, right is the plate. One page of text at a time, no modals, no cards.
- Type: Ibarra Real Nova (display and italic captions), Atkinson Hyperlegible Next (UI, and the hero number, per the dataviz rule that a hero figure stays in the UI sans), Atkinson Hyperlegible Mono (keys).
- Surfaces: `#12110e` and `#f6f1e7`. Tokens are in `src/styles.css`, with domain colours mirrored in `src/map/types.ts` and theme values in `THEME` in `plate.ts`. Keep all three in step.
- Motion: things settle, they don't bounce. Every animation shows cause or continuity. All of it respects `prefers-reduced-motion`.
- Secondary encoding on the plate: ideologies are diamonds, "heard of it" is an outline, terms beyond the map get a ring.

## Adding terms

Add a line to the right file in `src/map/domains/`, then run `npm test`. Check aliases don't collide, links resolve, and everyday-word aliases are in `EVERYDAY` in `parse.ts` if they'd misfire in prose.

## Testing notes

- The built-in Browser pane can run as a hidden page at about 1 fps, where GSAP's lag smoothing makes animations crawl. In dev, `gsap`, `stage` and `useStore` are on `window`, so run `gsap.ticker.lagSmoothing(0)`.
- Screenshots may crop when the device pixel ratio isn't 1. `computer` `zoom` over the full region gives a faithful capture.
- Real frame cost measured at about 2.7 ms with every term lit, and near zero when idle thanks to the cached layer.

## Not verified yet

- A real API call. All AI paths were tested through the real SDK and fetch code against the mock, and every provider's endpoints were confirmed reachable from a browser, but no live completion has been run because no key was available.
- GSAP choreography at full frame rate, watched by eye.
- `prefers-reduced-motion` in a real browser setting.

## Ideas for later

Freshness (a v2 discussion, deliberately out of v1): a "Pulse" of current terms would need live sources, and Hacker News, dev.to, GitHub and Wikipedia all allow browser calls while Lobsters and arXiv need a proxy. Also shareable brain cards, comparing two brains, a "prove it" spot-check, and a 3D plate.
