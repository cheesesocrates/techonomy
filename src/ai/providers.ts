export type Wire = 'anthropic' | 'openai'

export interface Provider {
  id: string
  name: string
  /** Who the key is sent to, in words for the privacy note. */
  company: string
  wire: Wire
  baseURL: string
  /** False for models running on this computer. */
  needsKey: boolean
  /** Models to prefer, best first, when choosing a default from a live list. */
  prefer: RegExp[]
  /** OpenAI's newer models renamed this field. */
  tokenField: 'max_tokens' | 'max_completion_tokens'
  keyUrl?: string
}

const openai = (p: Partial<Provider> & Pick<Provider, 'id' | 'name' | 'baseURL'>): Provider => ({
  company: p.name,
  wire: 'openai',
  needsKey: true,
  prefer: [],
  tokenField: 'max_tokens',
  ...p,
})

/**
 * Every hosted provider here was checked to allow direct browser calls, which is
 * why Techonomy needs no server. Claude uses its own SDK; the rest share the
 * OpenAI-compatible wire format.
 */
export const PROVIDERS: Provider[] = [
  {
    id: 'anthropic',
    name: 'Claude',
    company: 'Anthropic',
    wire: 'anthropic',
    baseURL: 'https://api.anthropic.com',
    needsKey: true,
    prefer: [/^claude-opus-5-5/, /^claude-opus/, /^claude-sonnet/],
    tokenField: 'max_tokens',
    keyUrl: 'https://console.anthropic.com/settings/keys',
  },
  openai({
    id: 'openai',
    name: 'OpenAI',
    baseURL: 'https://api.openai.com/v1',
    tokenField: 'max_completion_tokens',
    prefer: [/^gpt-5(?!.*(codex|audio|search|image|chat-latest))/, /^gpt-4\.1/, /^gpt-4o(?!.*(audio|search|realtime|transcribe|tts))/],
    keyUrl: 'https://platform.openai.com/api-keys',
  }),
  openai({
    id: 'xai',
    name: 'Grok',
    company: 'xAI',
    baseURL: 'https://api.x.ai/v1',
    prefer: [/^grok-\d+(-\d+)*$/, /^grok-\d/, /^grok/],
    keyUrl: 'https://console.x.ai',
  }),
  openai({
    id: 'google',
    name: 'Gemini',
    company: 'Google',
    baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai',
    prefer: [/^gemini-[\d.]+-flash$/, /^gemini-[\d.]+-pro$/, /^gemini/],
    keyUrl: 'https://aistudio.google.com/apikey',
  }),
  openai({
    id: 'openrouter',
    name: 'OpenRouter',
    baseURL: 'https://openrouter.ai/api/v1',
    prefer: [/^anthropic\/claude-opus/, /^openai\/gpt-5/, /^google\/gemini/],
    keyUrl: 'https://openrouter.ai/keys',
  }),
  openai({
    id: 'groq',
    name: 'Groq',
    baseURL: 'https://api.groq.com/openai/v1',
    prefer: [/versatile/, /llama/],
    keyUrl: 'https://console.groq.com/keys',
  }),
  openai({
    id: 'mistral',
    name: 'Mistral',
    baseURL: 'https://api.mistral.ai/v1',
    prefer: [/^mistral-large-latest/, /^mistral-medium-latest/],
    keyUrl: 'https://console.mistral.ai/api-keys',
  }),
  openai({
    id: 'deepseek',
    name: 'DeepSeek',
    baseURL: 'https://api.deepseek.com/v1',
    prefer: [/^deepseek-chat/],
    keyUrl: 'https://platform.deepseek.com/api_keys',
  }),
  openai({
    id: 'together',
    name: 'Together',
    baseURL: 'https://api.together.xyz/v1',
    prefer: [/llama/i],
    keyUrl: 'https://api.together.ai/settings/api-keys',
  }),
  openai({
    id: 'fireworks',
    name: 'Fireworks',
    baseURL: 'https://api.fireworks.ai/inference/v1',
    prefer: [/llama/i],
    keyUrl: 'https://fireworks.ai/account/api-keys',
  }),
  openai({
    id: 'cerebras',
    name: 'Cerebras',
    baseURL: 'https://api.cerebras.ai/v1',
    prefer: [/llama/i],
    keyUrl: 'https://cloud.cerebras.ai',
  }),
  openai({
    id: 'ollama',
    name: 'Ollama',
    company: 'your own computer',
    baseURL: 'http://localhost:11434/v1',
    needsKey: false,
  }),
  openai({
    id: 'lmstudio',
    name: 'LM Studio',
    company: 'your own computer',
    baseURL: 'http://localhost:1234/v1',
    needsKey: false,
  }),
  openai({
    id: 'custom',
    name: 'Other',
    company: 'the address you entered',
    baseURL: '',
  }),
]

export const PROVIDER_BY_ID = Object.fromEntries(PROVIDERS.map((p) => [p.id, p])) as Record<string, Provider>

/** Shapes of key that identify their provider with no room for doubt. */
const KEY_SHAPES: [RegExp, string][] = [
  [/^sk-ant-/, 'anthropic'],
  [/^xai-/, 'xai'],
  [/^gsk_/, 'groq'],
  [/^sk-or-/, 'openrouter'],
  [/^AIza/, 'google'],
  [/^fw_/, 'fireworks'],
  [/^csk-/, 'cerebras'],
  [/^tgp_/, 'together'],
  [/^sk-(proj|svcacct|admin)-/, 'openai'],
]

export interface Detection {
  provider: Provider
  /** False when the key's shape only suggests a provider. */
  sure: boolean
}

/**
 * Works out where a pasted key belongs from its shape alone. It deliberately
 * never "tries" a key against providers to see which accepts it: that would
 * hand someone's secret to companies it wasn't meant for.
 */
export function detectProvider(raw: string): Detection | null {
  const key = raw.trim()
  if (key.length < 8) return null
  for (const [shape, id] of KEY_SHAPES) {
    if (shape.test(key)) return { provider: PROVIDER_BY_ID[id], sure: true }
  }
  // Plain "sk-" is used by OpenAI and by several others, so it's only a guess.
  if (/^sk-/.test(key)) return { provider: PROVIDER_BY_ID.openai, sure: false }
  return null
}

const NOT_CHAT = /embed|whisper|tts|audio|image|dall-?e|moderation|realtime|transcri|rerank|guard|vision-preview|imagen|veo|aqa|sora|babbage|davinci|ocr/i

function versionSort(a: string, b: string) {
  return b.localeCompare(a, undefined, { numeric: true })
}

/** Keeps chat models, and puts the sensible default first. */
export function rankModels(provider: Provider, ids: string[]): string[] {
  const chat = ids.filter((id) => !NOT_CHAT.test(id)).sort(versionSort)
  for (const rule of provider.prefer) {
    const hit = chat.find((id) => rule.test(id))
    if (hit) return [hit, ...chat.filter((id) => id !== hit)]
  }
  return chat
}

/** Dollars per million tokens, input then output. Only for prices we actually know. */
const PRICES: Record<string, [number, number]> = {
  'claude-fable-5-1': [10, 50],
  'claude-fable-5': [10, 50],
  'claude-opus-5-5': [4, 20],
  'claude-opus-5': [5, 25],
  'claude-opus-4-8': [5, 25],
  'claude-sonnet-5-5': [2, 10],
  'claude-sonnet-5': [2, 10],
  'claude-sonnet-4-6': [3, 15],
  'claude-haiku-5-5': [0.1, 0.5],
  'claude-haiku-4-5': [1, 5],
}

export function costOf(model: string, inputTokens: number, outputTokens: number): number | null {
  const price = PRICES[model]
  if (!price) return null
  return (inputTokens * price[0] + outputTokens * price[1]) / 1_000_000
}
