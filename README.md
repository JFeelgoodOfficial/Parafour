# Parafour — 3D LPG Dispensing Systems Landing Experience

> Industrial-cinematic Next.js + React Three Fiber landing page for the Parafour P4-SFCP product line.

---

## Live Preview

Deploy to Vercel and visit your URL. Designed and optimized for mobile-first.

---

## Stack

| Package | Version | Purpose |
|---|---|---|
| `next` | 14.2 | App framework (App Router) |
| `react` / `react-dom` | 18.3 | UI layer |
| `three` | 0.168 | 3D engine |
| `@react-three/fiber` | 8.17 | React renderer for Three.js |
| `@react-three/drei` | 9.114 | R3F helpers (RoundedBox, Environment, etc.) |
| `@react-three/postprocessing` | 2.16 | Bloom, Vignette post-FX |
| `postprocessing` | 6.36 | Post-processing core |
| `framer-motion` | 11.3 | HTML overlay animations |
| `lenis` | 1.1 | Smooth scroll engine |
| `gsap` | 3.12 | Available for extended scroll animations |
| `tailwindcss` | 3.4 | Utility CSS |

---

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Start dev server
npm run dev

# 3. Open in browser
open http://localhost:3000
```

---

## Project Structure

```
parafour/
├── app/
│   ├── layout.tsx          # Root layout, metadata, font loading
│   ├── page.tsx            # Main page — scroll orchestration
│   └── globals.css         # Design tokens, base styles, animations
│
├── components/
│   ├── Scene.tsx           # R3F Canvas wrapper (dynamic import, no SSR)
│   │
│   ├── Scene/
│   │   ├── DispenserModel.tsx    # Procedural P4-SFCP 3D dispenser
│   │   ├── CameraController.tsx  # Scroll-driven camera path
│   │   ├── Lights.tsx            # Industrial warehouse lighting rig
│   │   ├── Particles.tsx         # Ambient dust + mist particles
│   │   └── FloorPlane.tsx        # Dark reflective floor + platform
│   │
│   ├── sections/
│   │   ├── HeroOverlay.tsx       # Section 1: Cinematic first impression
│   │   ├── ProductsOverlay.tsx   # Section 2: Interactive hotspot inspection
│   │   ├── SystemOverlay.tsx     # Section 3: Animated feature cards
│   │   ├── ImpactOverlay.tsx     # Section 4: Industry use case storytelling
│   │   └── ContactOverlay.tsx    # Section 5: Trust close + inquiry form
│   │
│   └── ui/
│       ├── Navigation.tsx        # Scroll-aware dot nav + mobile drawer
│       └── LoadingScreen.tsx     # Industrial boot-up loading sequence
│
└── hooks/
    ├── useScrollProgress.ts      # Lenis scroll → 0-1 progress
    └── useReducedMotion.ts       # prefers-reduced-motion hook
```

---

## Scroll Architecture

The page uses a **600vh** tall scroll container. Each section occupies a proportional range:

| Section | Scroll % | 3D Camera Behavior |
|---|---|---|
| Hero | 0–18% | Subtle orbital motion, wide reveal |
| Products | 18–42% | Pan to front face → display panel → valves |
| System | 42–62% | Three-quarter wide view with feature overlay |
| Impact | 62–82% | Dramatic pull-back, angled perspective |
| Contact | 82–100% | Calm 3/4 settled view |

**Sections are `position: sticky` inside the scroll container.** The canvas is `position: fixed`. This gives the illusion of scroll-driven 3D navigation.

---

## 3D Model

The `DispenserModel.tsx` is a fully **procedural** Three.js model built from primitives. No GLTF file required. It represents the P4-SFCP dispenser with:

- Main steel housing with recessed front panel
- Amber LCD display unit (emissive)
- Dual flow meter dials
- 12-key IP54 keypad
- Dual hose/nozzle cradles
- Valve assemblies with brass fittings
- Color-coded internal wiring harness
- Corner hardware bolts
- Ventilation grilles + base plinth

**To replace with a real GLTF model:**
```tsx
// In DispenserModel.tsx, replace the procedural group with:
import { useGLTF } from '@react-three/drei'

const { scene } = useGLTF('/models/p4-sfcp.glb')
return <primitive object={scene} ref={groupRef} />
```
Place your `.glb` file in `/public/models/`.

---

## Vercel Deployment

### Option A — Vercel CLI (Recommended)

```bash
# Install Vercel CLI globally
npm i -g vercel

# Login
vercel login

# Deploy (follow prompts)
vercel

# Production deploy
vercel --prod
```

### Option B — GitHub Integration

1. Push this repo to GitHub
2. Visit [vercel.com/new](https://vercel.com/new)
3. Import your repository
4. Framework will be auto-detected as Next.js
5. Click **Deploy** — no environment variables needed

### Build Settings (auto-detected)
```
Framework: Next.js
Build Command: npm run build
Output Directory: .next
Install Command: npm install
```

---

## Performance Notes

- **DPR Adaptive**: `PerformanceMonitor` from Drei automatically reduces pixel ratio on struggling devices
- **Dynamic import**: Canvas is dynamically imported with `ssr: false` — prevents server-side Three.js errors
- **Particle count**: Tuned conservatively (180 dust, 40 mist) for mobile GPU budgets
- **Post-processing**: Bloom + Vignette only — no expensive SSAO or DOF that would hurt mobile performance
- **Shadow map**: 2048×2048 on key light only; other lights cast no shadows
- **Material reuse**: All materials defined at module level as singletons — no per-render allocations

### Mobile Optimizations
- Touch interactions: Lenis handles smooth touch scrolling natively
- No hover-only UI: All interactions are tap/click first
- Sticky scroll pattern prevents janky 3D + scroll conflicts
- `viewport-fit=cover` for notch-safe layouts

---

## Art Direction Reference

| Token | Value | Usage |
|---|---|---|
| `--carbon` | `#0D0E10` | Page background, deep shadows |
| `--forge` | `#1A1C1F` | Secondary backgrounds |
| `--graphite` | `#2A2D31` | Borders, dividers |
| `--steel` | `#8B9095` | Body text, secondary labels |
| `--steel-light` | `#B8BCC2` | Primary body text |
| `--amber` | `#F59E0B` | Primary accent (display glow, CTAs) |
| `--blue` | `#3B82F6` | Secondary accent (feature highlights) |

**Fonts:**
- Display: `Barlow Condensed` — industrial condensed headline face
- Body: `IBM Plex Sans` — technical, clean, readable
- Mono: `IBM Plex Mono` — labels, specs, code-adjacent UI

---

## Extending the Project

### Adding a Real 3D Model
Replace procedural geometry in `DispenserModel.tsx` with a `useGLTF` call. Use [gltf.pmnd.rs](https://gltf.pmnd.rs) to generate typed hooks from your `.glb`.

### Adding Video Backgrounds
For the impact section, add a `<Video>` mesh (plane with video texture) in the scene for contextual footage.

### Adding Analytics
Install `@vercel/analytics` and add `<Analytics />` to `layout.tsx`.

### CMS Integration
Replace hardcoded content in overlay components with fetched data from Contentful, Sanity, or any headless CMS.

---

## License

MIT — Built by jfeelgoodofficial for Parafour Systems, Kyle TX.
