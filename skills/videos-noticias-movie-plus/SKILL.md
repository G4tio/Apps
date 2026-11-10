---
name: "videos-noticias-movie-plus"
description: "Resumen diario de noticias de cine y series para Movie Plus: busca 5 noticias del día, escribe el guion en estilo rápido y con datos claros, genera la voz con Fish Audio y edita un video vertical 9:16 en Remotion con subtítulos, música baja e intro/cierre con el logo de Movie Plus. Úsala para «noticias de películas», «resumen de cine del día» o «video de Movie Plus»."
---

# Movie Plus · Resumen de noticias de cine y series del día

Responde siempre en español. Resultado: video vertical 1080×1920, 30 fps, de ~45–60 s, con 5 noticias de películas/series del día, locución con la voz de Fish Audio de Movie Plus, subtítulos sincronizados con la voz real, música de fondo baja y logo animado de Movie Plus al inicio y al cierre.

Referencia de estilo: video «8 noticias random de hoy» del usuario (imagen grande al centro sobre fondo desenfocado de la misma imagen, rótulos cortos en mayúsculas, ritmo rápido). **Sin memes entre noticias.**

## 0. Flujo (hay dos puntos de aprobación)
1. **Buscar** 5 noticias del día → presentar lista con fuente y fecha.
2. **Guion** (§2) → el usuario lo aprueba o corrige. **No generes voz antes de la aprobación.**
3. **Sugerir imágenes** por noticia (§3) → el usuario sube las imágenes finales.
4. **Voz** con Fish Audio (§4) → transcribir para sincronía real (§5).
5. **Editar en Remotion** (§6–7) → hoja de contactos → render → entrega (§8).
Si el usuario ya trae guion o imágenes, salta los pasos correspondientes.

## 1. Búsqueda de noticias
- Usa WebSearch (varias búsquedas en el mismo turno, modo `standard`; `extended` si los resultados son pobres o viejos). Busca en inglés y español: «movie news today», «box office this weekend», «trailer released», «casting», «renewed/cancelled series», «Netflix/Max/Disney+/Prime Video news», Variety, The Hollywood Reporter, Deadline, IGN, Collider, SensaCine, Espinof.
- Criterios: noticias **de las últimas 24–48 h**, confirmadas por al menos un medio de referencia (Variety, THR, Deadline o comunicado oficial). Rumores solo si están etiquetados como tales en el guion («se reporta que…»).
- Mezcla recomendada: 1 bombazo (anuncio, casting, cambio de estudio), 1 tráiler/póster, 1 taquilla o récord con cifra, 1 serie/streaming, 1 fecha de estreno. Prioriza lo que interesa al público latino/guatemalteco (estrenos en cines de la región si los hay).
- Entrega una tabla: n.º · titular en 1 línea · dato clave (cifra/fecha) · fuente(s) con enlace · fecha. Ofrece 1–2 alternas por si el usuario quiere cambiar alguna.

## 2. Guion (estilo del video de referencia)
- **Gancho fijo** (≈2 s): «Cinco noticias de cine de hoy.» (o «…de cine y series de hoy»). Nada de saludos ni presentaciones.
- **Una noticia = 2–3 frases cortas, ≈25–40 palabras, 8–11 s.** Arranca directo con el hecho: «Se reveló que…», «Es oficial:…», «Se reporta que…», «Tenemos nuevo tráiler de…», «Ya hay fecha:…».
- **Datos claros**: nombres completos, cifra o fecha concreta en cada noticia (día y mes en palabras, montos en dólares redondeados: «ciento veinte millones de dólares»). Una idea por frase. Cierra con la consecuencia («…lo que significa que está terminada y lista para su estreno el 19 de noviembre»).
- Tono: animado, cercano, de fan informado; sin opiniones largas ni chistes intercalados (los memes del original se omiten). Un remate breve opcional de 2–4 palabras por noticia está bien si suena natural («Por fin.»).
- **Cierre** (≈3 s): «Sigue a Movie Plus para más noticias de cine.» (ajusta si el usuario da otro CTA).
- Escribe los números como se pronuncian en la versión para voz; mantén otra versión «para pantalla» con cifras (§5).
- Títulos de películas: usa el título con el que se conoce en Latinoamérica; si difiere del original, menciona el original solo en pantalla.
- Entrega al usuario: guion en bloques numerados, palabras totales y duración estimada (≈2,6 palabras/s). Espera su aprobación.

## 3. Imágenes
- El usuario facilita las imágenes finales; indica cuál va en cada noticia. Si no lo dice, pregúntalo en una línea.
- Sugiere por noticia 2–3 imágenes concretas: póster oficial, still del tráiler (con el segundo aproximado), foto de prensa del estreno/evento, logo del estudio o plataforma. Da dónde encontrarlas (cuenta oficial, sitio del estudio, IMDb/TMDB, galería de prensa) **sin descargarlas tú**; no descargues fotos de personas.
- Formatos útiles: póster vertical (va perfecto al centro), still horizontal (se recorta/centra con zoom lento), varios pósters → collage escalonado como en la referencia.
- Mientras falte una imagen: tarjeta de marcador con el título de la película en tipografía de marca; avísalo en la entrega.

## 4. Voz · Fish Audio
- Voz de Movie Plus: **`d8363f34e83d466791e2f295214c4deb`** (`reference_id`). No uses otra voz salvo que el usuario lo pida.
- Clave: nunca en el chat ni en archivos. Si no hay credencial para `api.fish.audio`, pídela con `request_credential` (host `api.fish.audio`, tipo bearer) y luego ejecuta:
  `python3 scripts/fish_tts.py locucion.txt voz.mp3` (modelo `s1` por defecto; `--modelo speech-1.6` si el usuario lo prefiere).
- `locucion.txt` = solo el texto aprobado, con números en palabras y nombres extranjeros escritos como se pronuncian si la voz falla (p. ej. «Tímoti Shalamé»). Separa noticias con un salto de línea; añade «…» donde quieras una micro‑pausa.
- Escucha el resultado vía transcripción (§5): si una palabra sale mal, corrige la grafía solo en `locucion.txt` y regenera ese fragmento o todo.
- Si el usuario trae su propio audio, úsalo y salta este paso.

## 5. Sincronía real (no la estimes)
- Modelo ASR (GitHub Releases funciona aunque pypi/huggingface estén bloqueados):
  `curl -L -o m.tar.bz2 https://github.com/k2-fsa/sherpa-onnx/releases/download/asr-models/sherpa-onnx-nemo-fast-conformer-ctc-es-1424.tar.bz2 && tar xjf m.tar.bz2`
- `ffmpeg -i voz.mp3 -ar 16000 -ac 1 voz16k.wav && python3 scripts/transcribir.py voz16k.wav <carpeta_modelo> > palabras.json` (solo numpy + onnxruntime; 80 ms por cuadro).
- Alinea guion↔transcripción con Needleman–Wunsch (similitud `difflib.SequenceMatcher`, gap −0,55) e interpola las no emparejadas. El ASR deforma nombres propios: usa la ortografía del guion con el tiempo detectado.
- Aparición de cada palabra en subtítulos = `t0 − 0,08`. Corte entre noticias = `t0` de la primera palabra de la siguiente − 0,04.
- Genera `src/timing.json` con `{palabras:[{w,pantalla,t}], noticias:[{inicio,fin}], cues:{}}`, sumando el desfase de la intro.

## 6. Diseño del video
**Identidad Movie Plus** (pendiente de confirmar con el material del usuario):
- Logo: pídelo en PNG/SVG con transparencia (y versión sobre fondo oscuro) si no está adjunto. Toma la paleta del propio logo (extrae 3–4 colores dominantes con numpy) y la tipografía de la web movieplusgt.com; si la web no es accesible desde la sesión, pide al usuario paleta y fuente o una captura. Una vez confirmadas, **escríbelas aquí** en la skill para que queden fijas.
- Mientras tanto: fondo casi negro cinematográfico, un color de acento tomado del logo para subtítulos clave y barras, tipografía condensada pesada para rótulos (Anton o Bebas Neue) y Montserrat para textos secundarios (Google Fonts vía `git clone --depth 1 --filter=blob:none --sparse https://github.com/google/fonts.git` + `sparse-checkout set ofl/anton ofl/bebasneue ofl/montserrat`).

**Estructura** (igual en cada video):
1. **Intro logo** ≈1,8 s (más corta que la referencia de Pinterest del usuario): estilo de reveal cinematográfico — destello/lens flare que barre, el logo aparece con escala 1,15→1 y desenfoque que se aclara, brillo final; sale con zoom leve. Si el usuario comparte el video o GIF de referencia, iguala sus pasos y anótalos aquí.
2. **Gancho**: «5 NOTICIAS DE CINE DE HOY» con el «5» gigante a la izquierda y tres líneas apiladas a la derecha (como «8 NOTICIAS RANDOM DE HOY» de la referencia), con pop de escala; fondo desenfocado del primer póster.
3. **Una escena por noticia** (≈8–11 s):
   - Fondo: la misma imagen, ampliada al 120 %, desenfoque fuerte (≈40 px) y oscurecida ~45 %.
   - Imagen principal centrada (≈80 % del ancho, esquinas 18 px, sombra), entra con pop (escala 0,85→1, 0,35 s, `outBack`) y zoom lento 1→1,05 durante la escena. Cambios de imagen dentro de una noticia sincronizados con la palabra que la nombra.
   - **Rótulo de dato** sobre la parte baja de la imagen, en MAYÚSCULAS, blanco con contorno negro/sombra dura (como «JEREMY LATCHMAN», «2028»): nombre de la persona, cifra, fecha o título. Máx. 4 palabras, entra con pop en su palabra.
   - Pequeño contador discreto arriba («1/5») con el acento de marca y barra de progreso fina.
   - Motion graphics simples cuando aporten dato: contador de taquilla que sube, calendario con la fecha que cae, estrellas/score que se rellenan, collage de pósters que se reparte.
4. **Cierre**: «Sigue a Movie Plus» + logo animado (≈2,5 s) con el mismo lenguaje de la intro en reversa.

**Subtítulos**: palabra por palabra, 2–4 palabras por bloque, en la franja y≈1250–1450 (por debajo de la imagen, por encima de la interfaz de TikTok), fuente condensada pesada ≈78 px, blanco con contorno; palabra activa y nombres/cifras en el color de acento. Cada palabra entra con escala 0,8→1 en 0,15 s.

**Zonas seguras**: contenido entre y≈130 y y≈1500; ~120 px libres a la derecha.

**Transiciones** entre noticias: corte con whip/zoom rápido (0,25 s) y leve desenfoque de movimiento.

## 7. Edición con Remotion
- El usuario autoriza usar Remotion: `npx create-video@latest --blank movieplus` (o reusa el proyecto si ya existe en el repo). Composición `MoviePlusNews` 1080×1920, 30 fps, duración = intro + voz + cierre.
- Componentes: `Intro`, `Gancho`, `Noticia` (props: imágenes, rótulos con tiempos, índice), `Subtitulos` (lee `timing.json`), `Cierre`. Usa `interpolate`/`spring`, `<Img>` con `staticFile`, `<Audio>` para voz (con `startFrom`/`Sequence` tras la intro) y música.
- **Música de fondo baja**: pista que dé el usuario o una sin derechos; volumen ≈ −22 dB bajo la voz (≈0,08–0,12 en Remotion) con ducking suave, fade in/out; whoosh en cada transición y golpe en el logo.
- Revisión antes del render: renderiza fotogramas sueltos (`npx remotion still MoviePlusNews out/f.png --frame=N`) en 8–12 instantes clave y arma una hoja de contactos; corrige textos cortados y solapamientos.
- Render: `npx remotion render MoviePlusNews out/movieplus_AAAA-MM-DD.mp4 --codec=h264 --crf=18 --concurrency=4`. Si Remotion no puede ejecutarse (sin red para npm o sin Chromium compatible: usa `--browser-executable=/opt/pw-browsers/chromium`), recurre a la misma maqueta en HTML + `renderFrame(t)` con Playwright y ffmpeg, y avísalo.

## 8. Revisión y entrega
- `ffprobe`: 1080×1920, 30 fps, H.264 yuv420p, AAC; `volumedetect`: pico < −1 dB, voz clara sobre la música.
- Hoja de contactos (1 cuadro cada ~5 s) revisada: rótulos legibles, nada en la zona de interfaz de TikTok.
- Entrega con `SendUserFile` y resume en pocas líneas: noticias y fuentes usadas, diferencias guion/audio, imágenes pendientes (marcadores) y que la sincronía viene de la transcripción real.
- Ofrece también una descripción para TikTok (1–2 líneas + 5 hashtags: #MoviePlus #NoticiasDeCine #Cine #Series + uno del tema principal).
