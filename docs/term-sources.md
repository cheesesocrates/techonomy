# Where to get more tech terms

Researched 2026-11-06. A ✓ means the number was read live that day. Anything without one came from search results or memory, so check it before relying on it. Nothing here has been imported yet.

## Start here

Four sources cover most of what is worth having. Use them in this order.

| # | Source | What you get | Size | License |
|---|---|---|---|---|
| 1 | [github/explore](https://github.com/github/explore) | Curated topics with aliases, related topics, release date, short description and a Wikipedia link, as front matter in `topics/*/index.md` | 1,278 topics, 112 collections ✓ | CC-BY-4.0 ✓ |
| 2 | [Wikidata](https://www.wikidata.org) | The join table for everything else: a stable ID, `inception` for the year, `influenced by` for relations, and links to a Stack Exchange tag (5,822 items ✓) and a GitHub topic (3,564 items ✓) | 1,572 programming languages ✓, 14,648 file formats ✓, 1,121 software libraries ✓, 847 algorithms ✓, 391 protocols ✓, 19,313 software ✓ (direct instances only; subclasses add far more) | CC0 |
| 3 | [Stack Overflow tags](https://api.stackexchange.com/docs) | The long tail, ranked by use, plus synonyms to use as aliases (`js -> javascript`) | 65,781 tags ✓, 5,332 synonyms ✓ | Tag names are facts; excerpts are CC BY-SA |
| 4 | [Computer Science Ontology](https://cso.kmi.open.ac.uk/downloads) | Research-flavoured concepts and the links between them | about 15K topics, 166K relations ✓ (v3.5, July 2025) | CC BY 4.0, per its FAQ |

Access:

1. Clone the repo.
2. SPARQL at query.wikidata.org, or the search API with `haswbstatement:P31=Q9143` (Q9143 is "programming language").
3. The Stack Exchange API: 300 requests a day without a key ✓. The full data dump now needs a sign-in and a pledge not to use it for LLM training (per search results).
4. `.csv`, `.owl`, `.ttl` or `.nt` downloads.

## By field

- **Code & Craft (languages):** [GitHub Linguist](https://github.com/github-linguist/linguist) `languages.yml`: 845 entries ✓, MIT ✓, with aliases and types.
- **Interfaces (web platform):** [mdn/browser-compat-data](https://github.com/mdn/browser-compat-data): every HTML element, CSS property and web API. CC0 ✓, last pushed 6 Nov ✓.
- **Cloud & DevOps:** [CNCF landscape](https://github.com/cncf/landscape) `landscape.yml`: 2,441 projects and products ✓, Apache-2.0 ✓. [Kubernetes glossary](https://github.com/kubernetes/website/tree/main/content/en/docs/reference/glossary): about 160 terms (163 files ✓), CC-BY-4.0 ✓.
- **AI & ML:** Hugging Face tags API (`huggingface.co/api/models-tags-by-type`, no key): 52 task tags ✓, 54 libraries ✓, 2,986 datasets ✓. Papers with Code shut down in July 2025. A frozen copy of its data is at `github.com/paperswithcode/paperswithcode-data` (last pushed Sept 2025, no license declared ✓).
- **Security & Crypto:** [NIST glossary](https://csrc.nist.gov/glossary): export zip of about 740 KB ✓, updated this month ✓. Its definitions come from many different standards, so take the terms and write your own definitions.
- **Ideas & Culture** (the thinnest field, so worth extra effort): the [Jargon File](https://www.catb.org/jargon/) (public domain per its own preface; the site HTTPS certificate is currently broken, so use the Project Gutenberg copy), [hacker-laws](https://github.com/dwmkerr/hacker-laws) (CC-BY-SA-4.0 ✓, 27k stars ✓), and Wikipedia categories: Internet culture 206 pages ✓, Hacker culture 122 ✓, Computing terminology 127 ✓, Programming principles 42 ✓, Software development philosophies 41 ✓.
- **Backend & Data, Systems & Hardware:** no clean specialist source found. Use the four above, and Wikidata classes (algorithms, data structures, protocols, file formats).

## Tools and packages (only after a popularity filter)

The raw lists are enormous, mostly noise, and not terms anyone "knows". Import the top slice only.

- PyPI top packages: 15,000 ✓, updated 1 Nov 2026 ✓ (`hugovk.github.io/top-pypi-packages`)
- [npm-high-impact](https://github.com/wooorm/npm-high-impact): MIT ✓
- Homebrew install analytics: 26,798 formulae ✓ (`formulae.brew.sh/api/analytics/install/30d.json`)
- Libraries.io: 9.96M packages ✓, data CC BY-SA 4.0 per the site

## Dictionaries

- **FOLDOC:** 15,284 entries ✓, last updated Aug 2025 ✓. Distributed under the GFDL, though the site itself only says "Copyright Denis Howe". No bulk download is advertised ✓; Debian packages a 2014 snapshot (`dict-foldoc`). Good for definitions to learn from, not to paste.

## Importance weights

The map weights terms 1 to 3. For imports, derive weights from signals instead of guessing:

- Stack Overflow tag counts (API)
- Wikipedia monthly pageviews: keyless REST API ✓ (Kubernetes had 26,724 in Sept 2026 ✓)
- PyPI downloads, Homebrew installs
- [Stack Overflow Developer Survey](https://survey.stackoverflow.co): the latest published year is 2025 (the 2026 survey is open, results not out). CSVs for 2011 to 2025 live in `StackExchange/Survey` (repo is Apache-2.0 ✓)

## Licensing

Names and facts are free to use. Written definitions are the problem: Wikipedia, Stack Overflow and hacker-laws are CC BY-SA (copyleft), FOLDOC is GFDL, and NIST definitions come from many standards. github/explore and CSO need attribution only. The clean route is to import names and IDs, then have an AI write a fresh one-sentence definition, and keep a `source` field for attribution. That is also what the AI path inside the app is for.

## Checked and skipped

- **OpenAlex:** only 302 topics in Computer Science ✓, and 1.88M keywords ✓ that are mostly noise.
- **ACM Computing Classification System:** SKOS, Word and HTML downloads, "free for educational and research purposes", but its license could not be read (the page returns 403 to scripts ✓), so do not bundle it until you have read it.
- **Thoughtworks Radar data:** no clear license found.
- **developer-roadmap (roadmap.sh):** custom license (GitHub reports "NOASSERTION" ✓), so read it first.
- **Stack Exchange full dump:** needs a sign-in and a no-LLM-training pledge. The API covers tags without it.

## Before importing thousands

This is a recommendation, not a settled decision.

1. **The score collapses.** The percentage is measured against 771 terms. Against 15,000, everyone reads one to three percent. Keep the curated 771 as the only thing scored, and load imports as an unscored "deep" layer: lit on the plate, counted as "beyond the map", outside the percentage.
2. **The parser gets noisier.** More aliases means more false hits on everyday words (Go, Swift, Spring, Hive, Gin, Pig). Keep typo-tolerant matching on the core only, make imported terms exact-match, and grow `EVERYDAY` in `src/engine/parse.ts`.
3. **The atlas is built on every page load.** That is about 80 to 100 ms for 771 terms ✓ (measured). At 15,000 it would take seconds, so precompute positions at build time.
4. **Bundle size.** The map ships inside the JS bundle. Thousands of terms should be lazy-loaded as JSON per field.
5. **Tests.** The connected-web test in `tests/map.test.ts` should apply to the core only.

Suggested importer (`scripts/import/`): pull names from sources 1 to 3, merge on Wikidata ID (falling back to `norm(name)`), drop anything under a popularity floor, weight by percentile, have an AI assign field, area, kind and a fresh definition, then emit the map line format and run `npm test`.
