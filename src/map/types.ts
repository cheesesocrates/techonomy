export type DomainId =
  | 'ai'
  | 'data'
  | 'ideas'
  | 'systems'
  | 'code'
  | 'interfaces'
  | 'security'
  | 'cloud'

export type Kind = 'tool' | 'language' | 'concept' | 'practice' | 'ideology' | 'standard'

export interface Term {
  id: string
  name: string
  aliases: string[]
  domain: DomainId
  area: string
  kind: Kind
  /** Roughly when the term entered common use. */
  year: number
  /** 3 = core of its field, 2 = common, 1 = specialist. */
  weight: 1 | 2 | 3
  def: string
  /** Ids of related map terms, always symmetric. */
  rel: string[]
}

export interface Domain {
  id: DomainId
  name: string
  /** The part of the brain this field lives in on the plate. */
  region: string
  /** What that part of the brain does, in a few words. */
  role: string
  /** Pigment name, used in the palette docs. */
  pigment: string
  dark: string
  light: string
}

/**
 * Eight domains, eight pigments. The order is the palette's slot order: it was
 * validated for colour-blind separation on Techonomy's own surfaces in both
 * themes, so never reorder or add a ninth. Anything finer is an `area`.
 */
export const DOMAINS: Domain[] = [
  { id: 'ai', name: 'AI & ML', region: 'Parietal lobe', role: 'where signals get synthesised', pigment: 'vermilion', dark: '#ca4e2c', light: '#ad320a' },
  { id: 'data', name: 'Backend & Data', region: 'Temporal lobe', role: 'long-term memory', pigment: 'viridian', dark: '#119074', light: '#0e8769' },
  { id: 'ideas', name: 'Ideas & Culture', region: 'Prefrontal cortex', role: 'values and judgment', pigment: 'amethyst', dark: '#955fbf', light: '#7b46a4' },
  { id: 'systems', name: 'Systems & Hardware', region: 'Brain stem', role: 'keeps everything alive', pigment: 'moss', dark: '#75a548', light: '#5f8f35' },
  { id: 'code', name: 'Code & Craft', region: "Broca's area", role: 'where language is produced', pigment: 'cobalt', dark: '#5075d7', light: '#466bcb' },
  { id: 'interfaces', name: 'Interfaces', region: 'Occipital lobe', role: 'everything you see', pigment: 'rose', dark: '#d1608f', light: '#c35483' },
  { id: 'security', name: 'Security & Crypto', region: 'Amygdala', role: 'spots threats first', pigment: 'ochre', dark: '#be8b0d', light: '#a57700' },
  { id: 'cloud', name: 'Cloud & DevOps', region: 'Cerebellum', role: 'quiet coordination', pigment: 'azure', dark: '#2599c3', light: '#1f8db5' },
]

export const DOMAIN_BY_ID = Object.fromEntries(DOMAINS.map((d) => [d.id, d])) as Record<DomainId, Domain>

export const KIND_LABEL: Record<Kind, string> = {
  tool: 'Tools',
  language: 'Languages',
  concept: 'Concepts',
  practice: 'Practices',
  ideology: 'Ideologies',
  standard: 'Standards',
}
