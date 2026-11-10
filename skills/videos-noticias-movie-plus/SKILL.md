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
- **Busca solo en las fuentes autorizadas de `references/fuentes.md`** (lista del usuario, en niveles A/B/C, más medios en español y cines de Guatemala). Léela antes de buscar.
- Usa WebSearch con varias búsquedas en el mismo turno, en modo `standard`; usa `extended` si los resultados son pobres o viejos. Combina el tema con `site:`, por ejemplo:
  - `casting OR exclusive site:variety.com OR site:deadline.com OR site:hollywoodreporter.com`
  - `trailer site:collider.com OR site:screenrant.com`
  - `renewed OR cancelled site:tvline.com OR site:deadline.com`
  - `box office weekend site:boxofficepro.com OR site:deadline.com`
  - `estreno site:lacovacha.mx OR site:latam.ign.com`

  Ignora los resultados que no sean de la lista.
- Criterios:
  - Noticias **de las últimas 24–48 h**.
  - Cada noticia confirmada por al menos una fuente de **nivel A**.
  - Lo que solo publique una fuente de nivel B o C va como rumor etiquetado («se reporta que…») o se descarta.
  - Los agregadores (nivel C) solo sirven para detectar noticias.
- Para estrenos, revisa los cines de Guatemala de la lista y añade la fecha local si existe.
- Mezcla recomendada: 1 bombazo (anuncio, casting, cambio de estudio), 1 tráiler/póster, 1 taquilla o récord con cifra, 1 serie/streaming, 1 fecha de estreno. Prioriza lo que interesa al público latino/guatemalteco (estrenos en cines de la región si los hay).
- Entrega una tabla: n.º · titular en 1 línea · dato clave (cifra/fecha) · fuente(s) con enlace al artículo (indica el nivel A/B/C) · fecha. Ofrece 1–2 alternas por si el usuario quiere cambiar alguna.

## 2. Guion (estilo del video de referencia)
- **Gancho fijo** (≈2 s): «Cinco noticias de cine de hoy.» (o «…de cine y series de hoy»). Nada de saludos ni presentaciones.
- **Una noticia = 2–3 frases cortas, ≈25–40 palabras, 8–11 s.** Arranca directo con el hecho: «Se reveló que…», «Es oficial:…», «Se reporta que…», «Tenemos nuevo tráiler de…», «Ya hay fecha:…».
- **Datos claros**: nombres completos, cifra o fecha concreta en cada noticia (día y mes en palabras, montos en dólares redondeados: «ciento veinte millones de dólares»). Una idea por frase. Cierra con la consecuencia («…lo que significa que está terminada y lista para su estreno el 19 de noviembre»).
- Tono: animado, cercano, de fan informado; sin opiniones largas ni chistes intercalados (los memes del original se omiten). Un remate breve opcional de 2–4 palabras por noticia está bien si suena natural («Por fin.»).
- **Cierre** (≈3 s): «Sigue a Movie Plus para más noticias de cine.» (ajusta si el usuario da otro CTA).
- Escribe los números como se pronuncian en la versión para voz; mantén otra versión «para pantalla» con cifras (§5).
- Títulos de películas: usa el título con el que se conoce en Latinoamérica; si difiere del original, menciona el original solo en pantalla.
- Entrega al usuario: guion en bloques numerados, palabras totales y duración estimada (≈3,2 palabras/s, ritmo del video de referencia; apunta a ~170–180 palabras en total y 27–34 por noticia). Espera su aprobación.

## 3. Imágenes
- El usuario facilita las imágenes finales; indica cuál va en cada noticia. Si no lo dice, pregúntalo en una línea.
- Sugiere por noticia 2–3 imágenes concretas: póster oficial, still del tráiler (con el segundo aproximado), foto de prensa del estreno/evento, logo del estudio o plataforma. Da dónde encontrarlas (cuenta oficial, sitio del estudio, IMDb/TMDB, galería de prensa) **sin descargarlas tú**; no descargues fotos de personas.
- Formatos útiles: póster vertical (va perfecto al centro), still horizontal (se recorta/centra con zoom lento), varios pósters → collage escalonado como en la referencia.
- **Videos que trae el usuario** (tráileres descargados de TikTok u otras redes):
  - **Placa final:** córtala siempre. Detecta el primer cuadro con fondo uniforme azul noche (≈ RGB 12,13,25), recorta 0,1 s antes y verifica el último cuadro.
  - **Audio:** déjalo en **cero**, quitando la pista (`-an`).
  - **Material:** guárdalo en `public/media/AAAA-MM-DD/` con el prefijo de la noticia (`n2_…`). Esa carpeta no se versiona.
- **Nunca uses el tráiler completo: solo fragmentos de 1–3 s con las tomas más fuertes.**
  - Detecta cortes con `select='gt(scene,0.28)'` y arma una hoja de contactos numerada por toma.
  - Elige 2–5 fragmentos por noticia, alternados con las imágenes fijas.
  - Evita las tomas con subtítulos quemados o rótulos, salvo la placa del título de la serie o película.
  - Revisa el primer y el último cuadro de cada fragmento para que no se cuele otra toma.
  - Guarda la selección en `src/videos/AAAA-MM-DD.json` (fuente, `desde`, `hasta`, descripción de la toma).
- **Marcas de agua de TikTok:** los tráileres llevan el logo y el @usuario en dos posiciones fijas: a la izquierda a media altura y abajo a la derecha. `scripts/fragmentos.py` las borra con `delogo` (coordenadas para videos 576×1024; verifica con una captura si el video tiene otro tamaño). En la tarjeta el clip va ampliado ×1,2; usa `"zoom": 1.0` en el medio si es una placa de título que no debe recortarse.
- Mientras falte una imagen: tarjeta de marcador con el título de la película en tipografía de marca; avísalo en la entrega.

## 4. Voz · Fish Audio
- Voz de Movie Plus: **`d8363f34e83d466791e2f295214c4deb`** (`reference_id`). No uses otra voz salvo que el usuario lo pida.
- Clave: nunca en el chat ni en archivos. Si no hay credencial para `api.fish.audio`, pídela con `request_credential` (host `api.fish.audio`, tipo bearer) y luego ejecuta:
  `python3 scripts/fish_tts.py locucion.txt voz.mp3` (modelo `s1` por defecto; `--modelo speech-1.6` si el usuario lo prefiere).
- `locucion.txt` = solo el texto aprobado, con números en palabras y nombres extranjeros escritos como se pronuncian si la voz falla (p. ej. «Tímoti Shalamé»). Separa noticias con un salto de línea; añade «…» donde quieras una micro‑pausa.
- Escucha el resultado vía transcripción (§5): si una palabra sale mal, corrige la grafía solo en `locucion.txt` y regenera ese fragmento o todo.
- **Revisa artefactos de Fish Audio:** a veces mete una sílaba suelta entre bloques (p. ej. «Oria» tras el gancho).
  - Detéctala comparando la transcripción con el guion y midiendo el volumen por tramos de 0,1 s.
  - Quítala con `atrim` + `acrossfade` (20 ms) y guarda `voz/voz_limpia.wav`.
  - Avísale al usuario qué quitaste.
- Si el usuario trae su propio audio, úsalo y salta este paso.

## 5. Sincronía real (no la estimes)
- Modelo ASR (GitHub Releases funciona aunque pypi/huggingface estén bloqueados):
  `curl -L -o m.tar.bz2 https://github.com/k2-fsa/sherpa-onnx/releases/download/asr-models/sherpa-onnx-nemo-fast-conformer-ctc-es-1424.tar.bz2 && tar xjf m.tar.bz2`
- `ffmpeg -i voz.mp3 -ar 16000 -ac 1 voz16k.wav && python3 scripts/transcribir.py voz16k.wav <carpeta_modelo> > palabras.json` (solo numpy + onnxruntime; 80 ms por cuadro).
- Alinea guion↔transcripción con Needleman–Wunsch (similitud `difflib.SequenceMatcher`, gap −0,55) e interpola las no emparejadas. El ASR deforma nombres propios: usa la ortografía del guion con el tiempo detectado.
- Aparición de cada palabra en subtítulos = `t0 − 0,08`. Corte entre noticias = `t0` de la primera palabra de la siguiente − 0,04.
- Usa `scripts/alinear.py` del proyecto: `python3 scripts/alinear.py public/media/AAAA-MM-DD src/videos/AAAA-MM-DD.json src/videos/AAAA-MM-DD.timing.json`.
- El plan del día (`src/videos/AAAA-MM-DD.json`) define:
  - `pantalla`: cifras en pantalla, p. ej. «treinta y un» → «31».
  - `claves`: palabras que van en rojo en los subtítulos.
  - Por noticia: `fondo` (imagen desenfocada de fondo), `medios` y `rotulos`.
    - Cada medio y cada rótulo lleva `en`: la palabra que lo dispara; usa «La#2» para la segunda aparición.
    - Cada medio puede llevar `ajuste` (`contain` para pósters y logos), `foco` y `zoom`.
- **Reparte los medios según el espacio que les toca**: un fragmento de video no debe quedar en un espacio mucho mayor que su duración (máx. ralentización ×0,6); las imágenes absorben los espacios largos.

## 6. Diseño del video
**Identidad Movie Plus** (confirmada con el logo oficial):
- Rojo `#ED1C24` (aro, punto, acentos, botones, barridos), carbón `#3A3A3C` (letras del logo sobre fondo claro), fondo negro cinematográfico `#0B0D12` con resplandor azul noche `#1A2236` y partículas suaves (como el ícono de la estrella). Sobre fondo oscuro las letras del logo van en **blanco**.
- Logo: capas separadas en `assets/remotion/public/logo/` (m, estrella, aro_sup, aro_inf, punto, v, i, e, p, l, u, s), con sus posiciones en `assets/remotion/src/logo-layers.json`. El original está en `public/logo/movieplus_original.png` y el ícono en `movieplus_icono.jpg`.
- Tipografías: **Saira Condensed** Black/Bold itálica (rótulos, botones, subtítulos; combina con el logo) y **Montserrat** (textos secundarios con espaciado amplio). Están en `assets/remotion/public/fonts/` (OFL).

**Animaciones de inicio y cierre guardadas en la skill (aprobadas; no las rediseñes):**
- `assets/render/movieplus_intro.mp4` (2,58 s) y `assets/render/movieplus_cierre.mp4` (3,24 s): renders finales listos, 1080×1920, 30 fps, H.264 yuv420p, con su sonido. Si no hay cambios, úsalos tal cual (concaténalos con ffmpeg o colócalos con `<OffthreadVideo>` en Remotion).
- `assets/remotion/`: proyecto Remotion fuente.
  - Composiciones `Intro` y `Cierre`.
  - Animación del logo en `src/LogoAnim.tsx` y capas, fondo y estrella en `src/Logo.tsx`; colores y easings en `src/marca.ts`.
  - Sonido en `scripts/sfx.py` (genera `public/sfx/*.wav`).
- Para editarlas o montar el video completo:
  1. Copia la carpeta: `cp -r <skill>/assets/remotion movieplus-video && cd movieplus-video && npm install`.
  2. Renderiza: `npx remotion render Intro out/intro.mp4 --browser-executable=/opt/pw-browsers/chromium`.
  3. Recodifica: `ffmpeg -i out/intro.mp4 -c:v libx264 -crf 16 -pix_fmt yuv420p -c:a copy -movflags +faststart movieplus_intro.mp4`.
  4. Si cambian, actualiza también los MP4 de `assets/render/`.

**Estructura** (igual en cada video):
1. **Intro logo** (composición `Intro`, 2,5 s; aprobada por el usuario). Se inspira en la referencia de Pinterest (bloques planos de color que se expanden, letra gigante que se aleja y letras que encajan una a una):
   - Bloque rojo que se expande desde el centro (0–0,27 s).
   - Estrella blanca gigante que se aleja ×11→×1 girando (0,17–0,67 s).
   - El rojo se contrae hasta convertirse en el aro, que se abre con sus cortes y gira (0,33–0,77 s), y el punto rebota.
   - El ícono viaja a su lugar mientras M, V, I y E entran por máscara, escalonadas, y luego aparece PLUS.
   - Barrido de luz sobre la estrella; el panel rojo sube y descubre la primera noticia.
2. **Gancho**: «5 NOTICIAS DE CINE DE HOY» con el «5» gigante a la izquierda y tres líneas apiladas a la derecha (como «8 NOTICIAS RANDOM DE HOY» de la referencia), con pop de escala; fondo desenfocado del primer póster.
3. **Una escena por noticia** (≈8–11 s):
   - Fondo: la misma imagen, ampliada al 120 %, desenfoque fuerte (≈40 px) y oscurecida ~45 %.
   - Imagen principal centrada (≈80 % del ancho, esquinas 18 px, sombra), entra con pop (escala 0,85→1, 0,35 s, `outBack`) y zoom lento 1→1,05 durante la escena. Cambios de imagen dentro de una noticia sincronizados con la palabra que la nombra.
   - **Rótulo de dato** sobre la parte baja de la imagen, en MAYÚSCULAS, blanco con contorno negro/sombra dura (como «JEREMY LATCHMAN», «2028»): nombre de la persona, cifra, fecha o título. Máx. 4 palabras, entra con pop en su palabra.
   - Pequeño contador discreto arriba («1/5») con el acento de marca y barra de progreso fina.
   - Motion graphics simples cuando aporten dato: contador de taquilla que sube, calendario con la fecha que cae, estrellas/score que se rellenan, collage de pósters que se reparte.
4. **Cierre** (composición `Cierre`, 3,2 s; aprobada por el usuario; el CTA queda ≈100 px bajo el aro, sin tocarlo). El panel rojo entra desde abajo y se contrae en el aro, la estrella entra con «pop» girando y el logo se arma. Luego el logo sube y aparecen la píldora roja «SÍGUENOS» y el texto «NOTICIAS DE CINE CADA DÍA». Termina con un fundido a negro.
   - Diseño sonoro propio de ambos en `scripts/sfx.py`: whoosh, impacto al formarse el aro, clics por letra y brillo.

**Subtítulos**: palabra por palabra, 2–4 palabras por bloque, en la franja y≈1250–1450 (por debajo de la imagen, por encima de la interfaz de TikTok), fuente condensada pesada ≈78 px, blanco con contorno; palabra activa y nombres/cifras en el color de acento. Cada palabra entra con escala 0,8→1 en 0,15 s.

**Zonas seguras**: contenido entre y≈130 y y≈1500; ~120 px libres a la derecha.

**Transiciones** entre noticias: corte con whip/zoom rápido (0,25 s) y leve desenfoque de movimiento.

## 7. Edición con Remotion
- El usuario autoriza usar Remotion. Parte de la plantilla `assets/remotion/` de la skill (copiada a `movieplus-video/`, `npm install`; Intro y Cierre ya hechos) y agrega ahí la composición del video. Renderiza siempre con `--browser-executable=/opt/pw-browsers/chromium` y recodifica a `yuv420p` con ffmpeg. Composición `MoviePlusNews` 1080×1920, 30 fps, duración = intro + voz + cierre.
- **Composición `MoviePlusNews`** (`src/MoviePlusNews.tsx`, ya hecha). Lee el plan y el `timing` del día; para un día nuevo cambia los dos `import` de `./videos/…`.
  - **Intro:** el panel rojo final descubre el gancho; la voz entra a los 2,4 s.
  - **Gancho:** «5» gigante en rojo y las líneas NOTICIAS / DE CINE / Y SERIES / DE HOY, que entran con su palabra.
  - **Noticias:**
    - Encabezado «NOTICIA 0n / 05» con la estrella y una barra de progreso de 5 segmentos.
    - Fondo: la imagen de la noticia desenfocada.
    - Tarjeta 900×930 con esquinas redondeadas y medios que cambian en su palabra.
    - Rótulos grandes en Saira Condensed itálica con contorno; las cifras cuentan hacia arriba y cada rótulo dura máximo 2,8 s.
  - **Subtítulos:** palabra por palabra, en bloques de hasta 3 palabras, y y≈1262–1460.
  - **Transición:** barra roja diagonal (con filo blanco) en cada cambio de noticia.
  - **Cierre:** entra con el panel rojo en la frase «Sigue a Movie Plus».
- **Orden de trabajo para cada video:**
  1. `fish_tts.py` y luego limpiar artefactos.
  2. `transcribir.py` → `voz/palabras_asr.json`.
  3. `alinear.py`.
  4. `mezcla.py public/media/AAAA-MM-DD src/videos/AAAA-MM-DD.timing.json [musica.wav]`: calcula el montaje (intro 76 cuadros, cierre 96) y mezcla voz + música con ducking + whooshes + sonidos de logos en `mezcla.wav`.
  5. `fragmentos.py src/videos/AAAA-MM-DD.timing.json`: corta cada fragmento a la duración exacta de su espacio, sin audio y sin marca de agua.
  6. Hoja de contactos con `npx remotion still` en ~20 cuadros.
  7. Render.
- **Música de fondo baja:** pista que dé el usuario o, si no hay, la que genera `mezcla.py` (pad Am–F–C–G a 96 BPM, bajo y hi-hat suaves), a ≈ −26 dBFS y con ducking bajo la voz.
- **Errores conocidos:**
  - `<OffthreadVideo>` debe ir dentro de un `<Sequence from={inicio}>`; si no, se ve negro.
  - No uses `playbackRate` con recortes: por eso los fragmentos se preparan con ffmpeg.
  - Si la carga de fuentes da timeout con concurrencia alta, renderiza con `--concurrency=3 --timeout=180000`.
- **Render:** `npx remotion render MoviePlusNews out/raw.mp4 --codec=h264 --crf=17 --concurrency=3 --timeout=180000 --browser-executable=/opt/pw-browsers/chromium` (~8 min para 1 min de video) y recodifica a `yuv420p` con `+faststart`.

## 8. Revisión y entrega
- `ffprobe`: 1080×1920, 30 fps, H.264 yuv420p, AAC; `volumedetect`: pico < −1 dB, voz clara sobre la música.
- Hoja de contactos (1 cuadro cada ~5 s) revisada: rótulos legibles, nada en la zona de interfaz de TikTok.
- Entrega con `SendUserFile` y resume en pocas líneas: noticias y fuentes usadas, diferencias guion/audio, imágenes pendientes (marcadores) y que la sincronía viene de la transcripción real.
- Ofrece también una descripción para TikTok (1–2 líneas + 5 hashtags: #MoviePlus #NoticiasDeCine #Cine #Series + uno del tema principal).
