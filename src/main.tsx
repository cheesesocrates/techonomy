import '@fontsource-variable/ibarra-real-nova/wght.css'
import '@fontsource-variable/ibarra-real-nova/wght-italic.css'
import '@fontsource-variable/atkinson-hyperlegible-next/wght.css'
import '@fontsource-variable/atkinson-hyperlegible-mono/wght.css'
import './styles.css'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { stage } from './brain/atlas'
import { gsap } from './lib/motion'
import { useStore } from './state/store'
import { App } from './ui/App'

// Handles for poking at the running app from the console. Never in a build.
if (import.meta.env.DEV) Object.assign(window, { gsap, stage, useStore })

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
