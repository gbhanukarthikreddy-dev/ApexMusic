# Apex Music — Marketing Website

Single-page marketing site for **Apex Music** built with **React 18**, **TypeScript**, **Vite**, **Tailwind CSS**, **Framer Motion**, **Lenis**, and **d3-contour**.

## Structure

```text
website/
├── public/
│   ├── favicon.svg         # Circular orange "A" mark
│   └── og-image.svg        # Open Graph preview graphic
├── src/
│   ├── components/
│   │   ├── Hero.tsx
│   │   ├── FloatingNav.tsx
│   │   ├── ContourMap.tsx
│   │   ├── Features.tsx
│   │   ├── PhoneShowcase.tsx
│   │   ├── Stats.tsx
│   │   ├── DownloadCTA.tsx
│   │   ├── FAQ.tsx
│   │   ├── Footer.tsx
│   │   └── Reveal.tsx
│   ├── hooks/
│   │   ├── useLenis.ts
│   │   └── useScrollSpy.ts
│   ├── lib/
│   │   └── contour.ts      # d3-contour heightfield generator
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── tailwind.config.ts
└── index.html
```

## Local Development

```bash
cd website
npm install
npm run dev
```

## Production Build

```bash
cd website
npm run build
npm run preview
```

## Deploy

### Vercel
1. Import the repository at [vercel.com/new](https://vercel.com/new).
2. Set **Root Directory** to `website`.
3. Build Command: `npm run build` · Output Directory: `dist`.

### Netlify
1. Import the repository at [app.netlify.com](https://app.netlify.com).
2. Set **Base directory** to `website`.
3. Build command: `npm run build` · Publish directory: `website/dist`.
