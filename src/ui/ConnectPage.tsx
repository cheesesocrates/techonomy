import { useRef, useState } from 'react'
import { PROVIDERS, PROVIDER_BY_ID, detectProvider } from '../ai/providers'
import { useRise } from '../lib/motion'
import { useStore } from '../state/store'
import { Back, money } from './bits'

/** One field. Paste any key and the app works out the rest. */
export function ConnectPage() {
  const root = useRef<HTMLDivElement>(null)
  const ai = useStore((s) => s.ai)
  const spent = useStore((s) => s.spent)
  const connect = useStore((s) => s.connect)
  const pickModel = useStore((s) => s.pickModel)
  const disconnect = useStore((s) => s.disconnect)
  const closeConnect = useStore((s) => s.closeConnect)

  const [key, setKey] = useState('')
  const [picked, setPicked] = useState('')
  const [choosing, setChoosing] = useState(false)
  const [baseURL, setBaseURL] = useState('')
  const [modelName, setModelName] = useState('')
  const [remember, setRemember] = useState(ai.remember)

  useRise(root, [ai.status === 'on'])

  const detected = detectProvider(key)
  const providerId = picked || detected?.provider.id || ''
  const provider = providerId ? PROVIDER_BY_ID[providerId] : null
  const showList = choosing || Boolean(key.trim() && !detected) || Boolean(detected && !detected.sure)
  const needsUrl = provider?.id === 'custom'
  const canConnect =
    Boolean(provider) &&
    ai.status !== 'checking' &&
    (!provider!.needsKey || key.trim().length > 7 || provider!.id === 'custom') &&
    (!needsUrl || baseURL.trim().length > 7)

  const go = (over?: { providerId: string; key: string }) => {
    const id = over?.providerId ?? providerId
    if (!id) return
    void connect({
      providerId: id,
      key: over?.key ?? key,
      baseURL: id === 'custom' || baseURL ? baseURL : PROVIDER_BY_ID[id].baseURL,
      remember,
      model: modelName || undefined,
    })
  }

  if (ai.status === 'on') {
    const current = PROVIDER_BY_ID[ai.providerId]
    return (
      <div className="connect" ref={root}>
        <Back onClick={closeConnect} />
        <h2 data-rise>Connected to {current.name}</h2>
        <p className="connect-why" data-rise>
          Requests go straight from this browser to {current.company}. Nothing passes through a server of ours.
        </p>

        <label className="field" data-rise>
          <span className="field-label">Model</span>
          {ai.models.length > 0 ? (
            <select className="field-select" value={ai.model} onChange={(e) => pickModel(e.target.value)}>
              {ai.models.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          ) : (
            <input className="field-input" value={ai.model} onChange={(e) => pickModel(e.target.value)} />
          )}
        </label>
        {ai.providerId === 'anthropic' && (
          <p className="field-note" data-rise>
            Opus is the default. For filing terms, Haiku costs about a fortieth as much and is usually plenty.
          </p>
        )}

        {spent.inputTokens + spent.outputTokens > 0 && (
          <p className="privacy" data-rise>
            This session: {(spent.inputTokens + spent.outputTokens).toLocaleString()} tokens
            {spent.cost !== null ? `, ${money(spent.cost)}` : ''}.
          </p>
        )}

        <div className="connect-actions" data-rise>
          <button className="btn btn-quiet" onClick={disconnect}>
            Disconnect
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="connect" ref={root}>
      <Back onClick={closeConnect} />
      <h2 data-rise>Connect any AI</h2>
      <p className="connect-why" data-rise>
        Optional. The map works without it. A key lets an AI place terms the map doesn't have, explain things through
        what you already know, and read your brain.
      </p>

      <label className="field" data-rise>
        <span className="field-label">Paste any API key</span>
        <input
          className="field-input key"
          type="password"
          autoComplete="off"
          spellCheck={false}
          placeholder="sk-ant-…, xai-…, AIza…"
          value={key}
          onChange={(e) => {
            setKey(e.target.value)
            setPicked('')
          }}
          onPaste={(e) => {
            const pasted = e.clipboardData.getData('text').trim()
            const hit = detectProvider(pasted)
            // A key whose shape names its provider needs nothing else from the person.
            if (hit?.sure) {
              e.preventDefault()
              setKey(pasted)
              go({ providerId: hit.provider.id, key: pasted })
            }
          }}
        />
      </label>

      <p className="field-note" aria-live="polite" data-rise>
        {ai.status === 'checking' && 'Checking the key…'}
        {ai.status !== 'checking' && ai.error && <span className="note-error">{ai.error}</span>}
        {ai.status !== 'checking' && !ai.error && provider && (
          <>
            {detected?.sure && !picked ? 'That’s a ' : 'Using '}
            <b>{provider.name}</b>
            {detected?.sure && !picked ? ' key. ' : '. '}
            {!showList && (
              <button className="link" onClick={() => setChoosing(true)}>
                Not right?
              </button>
            )}
          </>
        )}
        {ai.status !== 'checking' && !ai.error && !provider && key.trim() && 'Which company is this key from?'}
      </p>

      {showList && (
        <label className="field" data-rise>
          <span className="field-label">Provider</span>
          <select className="field-select" value={providerId} onChange={(e) => setPicked(e.target.value)}>
            <option value="" disabled>
              Choose one
            </option>
            {PROVIDERS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </label>
      )}

      {(needsUrl || provider?.needsKey === false) && (
        <>
          <label className="field">
            <span className="field-label">Server address</span>
            <input
              className="field-input"
              placeholder={provider?.baseURL || 'https://example.com/v1'}
              value={baseURL}
              onChange={(e) => setBaseURL(e.target.value)}
            />
          </label>
          {needsUrl && (
            <label className="field">
              <span className="field-label">Model</span>
              <input className="field-input" value={modelName} onChange={(e) => setModelName(e.target.value)} />
            </label>
          )}
        </>
      )}

      <label className="check" data-rise>
        <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
        Remember on this device
      </label>

      <div className="connect-actions" data-rise>
        <button className="btn btn-primary" disabled={!canConnect} onClick={() => go()}>
          Connect
        </button>
      </div>

      <p className="privacy" data-rise>
        Your key stays in this browser{remember ? '' : ' until you close the tab'}. It's only ever sent to
        {provider ? ` ${provider.company}` : ' the company it belongs to'}.
      </p>

      <div className="providers" data-rise>
        No key?{' '}
        <button
          className="link"
          onClick={() => {
            setPicked('ollama')
            go({ providerId: 'ollama', key: '' })
          }}
        >
          Use Ollama
        </button>{' '}
        or{' '}
        <button
          className="link"
          onClick={() => {
            setPicked('lmstudio')
            go({ providerId: 'lmstudio', key: '' })
          }}
        >
          LM Studio
        </button>{' '}
        on this computer.
        <div className="providers-list">
          {PROVIDERS.filter((p) => p.keyUrl).map((p) => (
            <a key={p.id} className="link" href={p.keyUrl} target="_blank" rel="noreferrer">
              {p.name}
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
