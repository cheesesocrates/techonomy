// name | aliases | kind | year | weight | definition | related
export default `
@Web platform
HTML | html5 | s | 1993 | 3 | The markup language that structures every web page. | CSS; DOM; JavaScript
CSS | css3, stylesheets | s | 1996 | 3 | The language that styles and lays out web pages. | HTML; Flexbox; CSS Grid
DOM | document object model | s | 1998 | 3 | The live tree of a page that JavaScript can change. | HTML; JavaScript; Virtual DOM
Accessibility | a11y, wcag, aria | p | 1999 | 3 | Making software usable by people of all abilities. | HTML; User Experience
Responsive Design | responsive web design | p | 2010 | 3 | Layouts that adapt to any screen size. | CSS; Mobile First
Flexbox | | s | 2012 | 2 | CSS layout for arranging items along a line. | CSS; CSS Grid
CSS Grid | | s | 2017 | 2 | CSS layout in rows and columns at once. | CSS; Flexbox
Web Components | custom elements, shadow dom | s | 2013 | 1 | Reusable custom HTML elements built into the browser. | HTML; DOM
Service Worker | service workers | s | 2015 | 1 | A background script that lets web apps work offline. | PWA
PWA | progressive web app, progressive web apps | c | 2015 | 2 | A website that installs and behaves like an app. | Service Worker; Single-Page Application
Core Web Vitals | web vitals, lcp, cls, inp | c | 2020 | 1 | Google's metrics for how fast and stable a page feels. | SEO
Canvas API | html canvas, canvas | s | 2004 | 2 | A browser API for drawing graphics with code. | WebGL; JavaScript
SEO | search engine optimization, search engine optimisation | p | 1997 | 2 | Getting pages to rank well in search results. | Server-Side Rendering; Core Web Vitals
Browser Engine | blink, webkit, gecko, chromium | c | 1998 | 1 | The software that turns web code into what you see. | V8; DOM
View Transitions | view transitions api | s | 2023 | 1 | A browser API for animating between page states. | CSS

@Frameworks & rendering
React | reactjs, react.js | t | 2013 | 3 | Meta's library for building interfaces from components. | Next.js; Virtual DOM; Hooks; JavaScript
Vue | vuejs, vue.js | t | 2014 | 2 | An approachable framework for building web interfaces. | Nuxt; JavaScript
Angular | angularjs | t | 2016 | 2 | Google's full-featured framework for large web apps. | TypeScript; Reactive Programming
Svelte | sveltekit | t | 2016 | 2 | A framework that compiles away at build time. | JavaScript; Compiler
SolidJS | solid.js, solid js | t | 2021 | 1 | A fast UI library with fine-grained reactivity. | React
Next.js | nextjs | t | 2016 | 3 | The most popular full-stack framework for React. | React; Server-Side Rendering; Vercel
Nuxt | nuxtjs | t | 2016 | 1 | The full-stack framework for Vue. | Vue
Astro | | t | 2021 | 1 | A framework for content sites that ship little JavaScript. | Islands Architecture
Remix | react router | t | 2021 | 1 | A full-stack React framework built on web standards. | React
jQuery | | t | 2006 | 2 | The library that made browser JavaScript bearable. | JavaScript; DOM
Vite | | t | 2020 | 2 | A fast build tool and dev server for the web. | Webpack; Vue; Transpiler
Webpack | | t | 2014 | 2 | The bundler that powered a decade of web apps. | Vite
Redux | redux toolkit | t | 2015 | 2 | Predictable state management for React apps. | React; Zustand
Zustand | | t | 2019 | 1 | A tiny, simple state library for React. | React; Redux
TanStack Query | react query | t | 2019 | 1 | A library for fetching and caching server data. | React
React Server Components | rsc, server components | c | 2020 | 2 | React components that run only on the server. | React; Next.js
Hooks | react hooks, usestate, useeffect | c | 2019 | 2 | Functions that give React components state and effects. | React
Virtual DOM | vdom | c | 2013 | 2 | An in-memory copy of the page used to update it efficiently. | React; DOM
Server-Side Rendering | ssr | c | 2015 | 2 | Building a page's HTML on the server for each request. | Next.js; Hydration
Static Site Generation | ssg, jamstack, static site | c | 2015 | 2 | Building all pages ahead of time as plain files. | Astro; CDN
Hydration | | c | 2016 | 1 | Making server-rendered HTML interactive in the browser. | Server-Side Rendering; Islands Architecture
Islands Architecture | islands | c | 2020 | 1 | Static pages with small interactive pieces. | Astro; Hydration
Single-Page Application | spa, single page app, single page application | c | 2010 | 2 | One page that updates itself instead of reloading. | React; PWA
HTMX | | t | 2020 | 1 | Adding interactivity with HTML attributes instead of JavaScript. | HTML

@Styling & motion
Tailwind CSS | tailwind, tailwindcss | t | 2017 | 3 | Styling with small utility classes directly in your markup. | CSS; shadcn/ui
Sass | scss | t | 2006 | 2 | A CSS extension that adds variables and nesting. | CSS
CSS-in-JS | styled-components, emotion | c | 2016 | 1 | Writing styles inside JavaScript components. | React; CSS
shadcn/ui | shadcn | t | 2023 | 2 | Copy-paste React components you own and customise. | Tailwind CSS; React
Design System | design systems | p | 2013 | 2 | A shared library of components and rules for a product. | Design Tokens; Figma; Storybook
Design Tokens | | p | 2017 | 1 | Named values for colours and spacing shared across tools. | Design System
Figma | | t | 2016 | 3 | The collaborative design tool that replaced desktop apps. | Design System; Wireframe
Storybook | | t | 2016 | 1 | A workshop for building UI components in isolation. | Design System; React
Dark Mode | | c | 2018 | 1 | A light-on-dark colour theme. | CSS
Variable Fonts | | s | 2016 | 1 | One font file that holds a whole range of weights. | CSS
GSAP | greensock | t | 2008 | 1 | A powerful JavaScript library for web animation. | Framer Motion; JavaScript
Framer Motion | motion | t | 2018 | 1 | A popular animation library for React. | React; GSAP

@UX & HCI
User Experience | ux, ux design | c | 1993 | 3 | How using a product actually feels. | User Interface; Usability Testing; Human-Computer Interaction
User Interface | ui, ui design | c | 1970 | 3 | The screens and controls people interact with. | User Experience; Design System
Human-Computer Interaction | hci | c | 1980 | 2 | The study of how people use computers. | User Experience; Fitts's Law; Cognitive Load
Usability Testing | user testing | p | 1985 | 2 | Watching real people try to use your product. | User Experience; A/B Testing
Information Architecture | ia | c | 1998 | 1 | Organising content so people can find their way. | User Experience
Fitts's Law | fitts law, fitts' law | c | 1954 | 1 | Bigger, closer targets are faster to reach. | Human-Computer Interaction
Cognitive Load | | c | 1988 | 2 | How much mental effort an interface demands. | Human-Computer Interaction
Dark Patterns | deceptive design | c | 2010 | 1 | Interfaces designed to trick people. | User Experience; Attention Economy
A/B Testing | ab testing, split testing | p | 2000 | 2 | Showing two versions and measuring which works better. | Usability Testing; Feature Flags
Wireframe | wireframes, wireframing | p | 1990 | 2 | A rough sketch of a screen's layout. | Figma
Gestalt Principles | gestalt | c | 1923 | 1 | How people group what they see into wholes. | User Interface
Micro-interactions | microinteractions | c | 2013 | 1 | Small moments of feedback in an interface. | User Experience

@Mobile & desktop
iOS | iphone, ipad | t | 2007 | 3 | Apple's mobile operating system. | Swift; SwiftUI
Android | | t | 2008 | 3 | Google's mobile operating system. | Kotlin; Jetpack Compose; Linux
React Native | | t | 2015 | 2 | Building native mobile apps with React. | React; Expo; Flutter
Flutter | | t | 2017 | 2 | Google's toolkit for apps from one Dart codebase. | Dart; React Native
SwiftUI | | t | 2019 | 2 | Apple's declarative framework for building interfaces. | Swift; iOS
Jetpack Compose | compose ui | t | 2021 | 1 | Android's modern declarative UI toolkit. | Kotlin; Android
Expo | | t | 2015 | 1 | A platform that makes React Native much easier. | React Native
Electron | | t | 2013 | 2 | Building desktop apps with web technology. | Tauri; Node.js; Chromium
Tauri | | t | 2019 | 1 | A lightweight, Rust-based alternative to Electron. | Electron; Rust
Push Notifications | | c | 2009 | 1 | Messages a server sends straight to a device. | iOS; Android

@Graphics & 3D
OpenGL | | s | 1992 | 2 | The long-standing cross-platform graphics API. | WebGL; Vulkan; Shaders
WebGL | | s | 2011 | 2 | GPU-powered graphics in the browser. | OpenGL; Three.js; Canvas API
WebGPU | | s | 2023 | 1 | The modern successor to WebGL. | WebGL; Vulkan
Vulkan | | s | 2016 | 1 | A low-level, high-performance graphics API. | OpenGL; GPU
DirectX | direct3d | s | 1995 | 1 | Microsoft's graphics and game APIs. | Windows; GPU
Metal | | s | 2014 | 1 | Apple's low-level graphics API. | Apple Silicon
Three.js | threejs, three js | t | 2010 | 2 | The most popular library for 3D on the web. | WebGL; JavaScript
Shaders | shader, glsl, hlsl | c | 1988 | 2 | Small programs that run on the GPU to draw pixels. | GPU; WebGL
Ray Tracing | path tracing, rtx | c | 1980 | 2 | Rendering by simulating how light really travels. | GPU; Rasterization
Rasterization | | c | 1970 | 1 | Turning 3D triangles into pixels quickly. | Ray Tracing; Shaders
Gaussian Splatting | 3d gaussian splatting, gaussian splats | c | 2023 | 1 | Rebuilding real scenes from photos as soft blobs. | NeRF
NeRF | neural radiance fields, neural radiance field | c | 2020 | 1 | A neural network that captures a 3D scene from photos. | Gaussian Splatting; Neural Network
Blender | | t | 1998 | 2 | The free, open-source 3D creation suite. | glTF; Open Source
glTF | glb | s | 2015 | 1 | The JPEG of 3D models. | Three.js; Blender
Procedural Generation | procgen | c | 1980 | 1 | Creating content with algorithms instead of by hand. | Game Loop

@Games & spatial
Unity | unity3d, unity engine | t | 2005 | 2 | The most widely used engine for indie and mobile games. | C#; Game Loop; Godot
Unreal Engine | unreal, ue5 | t | 1998 | 2 | Epic's high-end engine for photoreal games. | C++; Ray Tracing
Godot | | t | 2014 | 2 | The free and open-source game engine. | Unity; Open Source
Game Loop | | c | 1980 | 1 | The endless cycle of update and draw behind every game. | Unity; Physics Engine
Entity Component System | ecs | c | 2007 | 1 | Structuring games as data rather than class hierarchies. | Game Loop; Unity
Physics Engine | rapier, box2d | c | 2000 | 1 | Software that simulates collisions and forces. | Game Loop
Virtual Reality | vr | c | 2016 | 2 | Fully immersive computer-made worlds. | Meta Quest; Spatial Computing
Augmented Reality | ar | c | 2016 | 2 | Digital layers drawn over the real world. | Spatial Computing; Computer Vision
Spatial Computing | mixed reality, xr | c | 2023 | 1 | Computers that blend into the space around you. | Vision Pro; Virtual Reality
Vision Pro | apple vision pro | t | 2024 | 1 | Apple's mixed reality headset. | Spatial Computing
Meta Quest | oculus | t | 2019 | 1 | Meta's standalone VR headset line. | Virtual Reality
OpenXR | webxr | s | 2019 | 1 | An open standard for VR and AR apps. | Virtual Reality
`
