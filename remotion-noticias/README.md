# Plantilla de noticias TikTok (Remotion)

Video vertical 1080×1920, 30 fps: logo de entrada → resumen → 6 noticias → recapitulación → fuentes → logo de cierre.

- Contenido: `src/data.ts` (noticias, fuentes y fecha). **Lo actual es contenido de prueba ficticio.**
- Escenas: `src/scenes/`, ilustraciones: `src/viz/`, componentes comunes: `src/components.tsx`.
- Logo: intro y cierre oficiales en `public/marca/intro.mp4` (3,0 s) y `public/marca/cierre.mp4` (3,6 s), recortados del video del 9 nov 2026 con su audio. Bandera de Guatemala: `public/marca/bandera-gt.png`.

```bash
npm install
npm run render      # → out/noticias.mp4
npm run studio      # vista previa interactiva
```
