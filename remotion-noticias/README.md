# Plantilla de noticias TikTok (Remotion)

Video vertical 1080×1920, 30 fps: logo de entrada → resumen → 6 noticias → recapitulación → fuentes → logo de cierre.

- Contenido: `src/data.ts` (noticias, fuentes y fecha). **Lo actual es contenido de prueba ficticio.**
- Escenas: `src/scenes/`, ilustraciones: `src/viz/`, componentes comunes: `src/components.tsx`.
- Logo: provisional, hecho con tipografía (`src/scenes/Logo.tsx`).

```bash
npm install
npm run render      # → out/noticias.mp4
npm run studio      # vista previa interactiva
```
