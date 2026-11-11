---
name: "videos-noticias-tiktok-clave-publica"
description: "Videos de noticias 9:16 para TikTok de Clave Pública (nacionales o internacionales), hechos con la plantilla de Remotion del repo g4tio/apps (remotion-noticias/): busca las noticias en los medios autorizados de Guatemala, escribe el guion, genera la voz con Fish Audio y monta intro y cierre oficiales, encabezado GUATEMALA + NOTICIA n/N, recapitulación y FUENTES. Úsala para «N noticias nacionales/internacionales» y en vez de videos-noticias-tiktok."
---

# Videos de noticias para TikTok (motion graphics de marca, diseños fijos)

Responde siempre en español.

## 0. Plantilla de Remotion (punto de partida obligatorio)
El video se construye con **Remotion** sobre la plantilla ya hecha en el repositorio **g4tio/apps**, carpeta **`remotion-noticias/`**. No la reconstruyas desde cero.
- Si la carpeta no está en la rama por defecto, búscala en la rama `ccr-69630ccc-d6vuxw` (`git fetch origin ccr-69630ccc-d6vuxw` y `git checkout origin/ccr-69630ccc-d6vuxw -- remotion-noticias`). Si el repo no está en la sesión, añádelo con `add_repo`.
- Instalación: `cd remotion-noticias && npm install` (Remotion 4.0.542, React 18). `remotion.config.ts` ya apunta al Chromium headless del entorno (`/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell`); no descargues otro navegador ni ejecutes `playwright install`.
- Estructura (motor por día en **`src/clave-publica/`**):
  - `videos/AAAA-MM-DD.ts`: datos del día (fecha, «NOTICIAS DE GUATEMALA» o «NOTICIAS INTERNACIONALES», icono `bandera-gt` o `globo`, noticias con `seccion`, `titulo`, `viz` y `etiquetas` [cue, texto], fuentes, rutas de voz y música). **Es lo único que se crea en cada video**, junto con su `.plan.json` y `.timing.json`.
  - `videos/index.ts`: registra cada día; cada entrada es una composición (`Nacional-AAAA-MM-DD`, `Internacional-AAAA-MM-DD`).
  - `Video.tsx` (`crearVideo`: línea de tiempo desde los tiempos reales), `Escenas.tsx` (resumen, noticia, recapitulación, FUENTES), `components.tsx` (fondo, transición, encabezado, subtítulos, escenario), `contexto.ts`.
  - `viz/`: ilustraciones por noticia (`internacional.tsx`, `nacional.tsx`, `banderas.tsx`) registradas en `viz/index.ts`. Ayudantes reutilizables: `Sticker` (foto recortada, con `fadeBottom`/`fadeLeft`), `Cifra` (número grande + rótulo mono), `Lienzo`, `pop`, `fade`. Cada ilustración recibe `c("cue")` = cuadro local de la palabra clave.
  - La composición `Noticias` (src/Video.tsx, src/data.ts) es la edición nacional del 10 nov hecha en otra sesión: no la toques.
  - `public/fonts/` (Exo 2, Inter, JetBrains Mono, Montserrat), `public/marca/`, `public/audio/AAAA-MM-DD/` y `public/fotos/AAAA-MM-DD/` (estas dos no se versionan).
- **Intro y cierre oficiales**: `public/marca/intro.mp4` (90 cuadros = 3,0 s) y `public/marca/cierre.mp4` (108 cuadros = 3,6 s), recortados con su audio del video aprobado del 9 nov 2026. Se insertan tal cual con `<OffthreadVideo>`; no los reanimes ni los cambies. `public/marca/bandera-gt.png` es la bandera de Guatemala con escudo, para el resumen y las ilustraciones.
- Comandos: `npx remotion bundle --out-dir=out/bundle` + `npx remotion still out/bundle Nacional-AAAA-MM-DD out/stills/fN.jpg --frame=N --scale=0.5` para la hoja de contactos; `npx remotion render out/bundle Nacional-AAAA-MM-DD out/<nombre>.mp4` para el video completo y luego recodifica con `ffmpeg -c:v libx264 -crf 18 -pix_fmt yuv420p -color_range tv -c:a copy -movflags +faststart` (≈1 min por cada 50 s de video con 4 núcleos). `out/` y `node_modules/` no se suben al repo.
- Al terminar, guarda los cambios de la plantilla (no los videos) con commit y push a la rama de trabajo. Antes de subir, haz `git fetch` de la rama: otras sesiones también trabajan en ella; integra sus cambios sin sobrescribirlos.

Flujo probado: noticias (buscadas o dadas por el usuario) → guion aprobado → voz con Fish Audio (o audio del usuario) + imágenes por noticia → video vertical 1080×1920, 30 fps, con logo animado al inicio y al cierre, subtítulos palabra por palabra sincronizados con la voz real, ilustraciones animadas y mezcla de audio.

## 1a. Búsqueda de noticias y guion (cuando el usuario pide «N noticias nacionales/internacionales»)
- **Noticias de Guatemala: busca solo en los medios de `references/fuentes-guatemala.md`** (lista del usuario: medios nacionales, investigación, regionales, economía, deportes y fuentes oficiales). Léela antes de buscar. Para internacionales, usa agencias y medios en español (EFE vía Infobae, Euronews, Telemundo…); AP y Reuters no son accesibles desde el buscador.
- Noticias de las últimas 24–48 h, que no repitan las del video anterior. Confirma cada cifra en dos medios de la lista o en la fuente oficial; si solo hay una fuente, márcalo en la tabla.
- Entrega una tabla: n.º · noticia · dato clave · fuentes con enlace · fecha. Agrega 2–3 alternas. Después, el guion: intro «Estas son las cinco noticias más importantes de Guatemala de este <día> <fecha>.» + un bloque por noticia (≈ 35–50 palabras, una idea por frase, cifras y nombres completos, números escritos como se pronuncian). Incluye los títulos cortos de la recapitulación (≤ 28 caracteres) y las fuentes. **Espera la aprobación antes de generar la voz.**
- **Voz** (si el usuario no trae audio): Fish Audio, voz **«Fernando Martínez – Noticias»** (`reference_id` `95619e57f2484596b3cfa3ffbe55f2da`, elegida por el usuario). `public/audio/AAAA-MM-DD/locucion.txt` con una línea por bloque (intro + noticias) → `python3 scripts/voz_por_bloques.py public/audio/AAAA-MM-DD <carpeta_modelo_asr> 0.7 1.0` (genera, verifica y une cada bloque; si falta la credencial de `api.fish.audio`, pídela con `request_credential`). Escribe «Metro Riel», «G siete», etc. separados para que la voz los pronuncie bien; en pantalla se unen con `pantalla` del plan.
- **Sincronía**: `transcribir.py` → `palabras_asr.json`; luego `python3 scripts/timing_cp.py public/audio/AAAA-MM-DD src/clave-publica/videos/AAAA-MM-DD.plan.json src/clave-publica/videos/AAAA-MM-DD.timing.json`. El plan define `pantalla` (secuencias de palabras → cifra o nombre en pantalla), `claves` (palabras en celeste) y `cues` por bloque (nombre → palabra que dispara cada animación; `palabra#2` = segunda aparición).
- **Música**: `python3 scripts/musica_cp.py <timing.json> <voz_limpia.wav> public/audio/AAAA-MM-DD/musica.wav`.

## 1. Entradas
- **Audio**: lo genera Claude con Fish Audio (§1a) o el usuario trae MP3/MP4 con la narración.
- **Guion**: texto de las noticias. Puede diferir del audio (palabras de más, frases distintas): manda lo que realmente se dice (ver §4).
- **Imágenes**: el usuario indica de qué noticia es cada una. Si no dice la noticia, pregúntalo en una línea.
- **Fuentes y fecha de referencia**: medios consultados (en el orden que el usuario indique) y la fecha de las noticias. Si falta alguno de los dos, pregúntalo en una línea.
- **Logo**: si no viene adjunto, pídelo. Marca vigente: **Clave Pública** (logo negativo sobre negro y versión clara; brandbook adjunto por el usuario). Si trae otra marca, pide logo, paleta y tipografía y aplica las mismas reglas.
- Fotos de personas públicas: no las descargues de la web. Pide al usuario que las adjunte; mientras tanto usa un avatar genérico sin rostro con el nombre en una tarjeta.
- Con una foto adjunta: tarjeta con esquinas redondeadas (38 px), borde celeste fino, sombra suave, entrada con el nombre de la persona y un leve zoom lento. No apliques efecto halftone ni borde de recorte blanco salvo que el usuario lo pida expresamente.
- **Stickers del usuario** (ilustraciones halftone con borde blanco sobre fondo negro, como en los videos aprobados): quita el fondo negro rellenando desde los bordes superior, izquierdo y derecho los píxeles con `max(R,G,B) < 60` (no desde el borde inferior: si la figura está cortada abajo, el relleno se come la ropa), suaviza el alfa 1,2 px y recorta. Guárdalos en `public/fotos/AAAA-MM-DD/` y muéstralos con `Sticker` (con `fadeBottom` si el corte inferior es plano). Logos con fondo blanco y color marino (p. ej. MP) van sobre una tarjeta blanca; logos sobre fondo gris claro (p. ej. PNC) se recortan rellenando el gris desde los bordes.

## 2. Elementos mandatorios (nunca se cambian)
- **Formato**: 9:16, 1080×1920, 30 fps, H.264 yuv420p. Zona útil: subtítulos y contenido entre y≈130 y y≈1500; deja libres los ~390 px inferiores (interfaz de TikTok) y ~120 px del borde derecho (salvo la recapitulación, que sigue su diseño fijo de §2b-B).
- **Paleta (brandbook)**: Azul Marino `#0A2647`, Azul Celeste `#1FB6FF`, Azul Claro `#BFEAFF`, Gris Claro `#F5F8FC`, Gris Oscuro `#1F2937`, más blanco. En el logo negativo el celeste es `#8ED8FF`.
  - **La paleta de marca es obligatoria en**: los **fondos** (degradado de marino a una sombra más oscura del mismo marino, p. ej. `#04122A`, con resplandor celeste), los **titulares y subtítulos** (énfasis con celeste vs azul claro vs blanco, tamaño y movimiento), la **sección de compartir** (los tres botones INFÓRMATE / COMPARTE / SÍGUENOS de §2b-B), la pantalla **FUENTES** (§2b-C) y todo el marco de interfaz (encabezado, chip, contador, barra de progreso, transiciones y logos). En estos elementos no uses otros tonos (ámbar, rojo…).
  - **Excepciones de interfaz** tomadas de los diseños fijos de §2b: **celeste suave `#7FB8E6`** (chips, contador, etiquetas, botones, iconos) y **verde menta `#5CCB9B`** (solo palomitas y borde tenue de la checklist).
  - **En las gráficas e ilustraciones sí pueden usarse otros colores** (objetos, escenarios, iconos, medidores, mapas, personajes), siempre que mantengan coherencia visual con la marca y se vean profesionales: tonos armonizados sobre el fondo marino (saturación media, sin neones ni mezclas chillonas), contraste suficiente, pocos colores por escena y el celeste de marca como color dominante. Úsalos con intención (p. ej. el color real de un objeto o el verde/ámbar de un estado), no como decoración.
  - **Banderas**: cuando aparezca una bandera, dibújala con **sus colores reales y en el orden y proporciones correctos** (p. ej. Francia azul-blanco-rojo, España rojo-amarillo-rojo, Ucrania azul y amarillo, Estados Unidos rojo-blanco-azul con estrellas, Unión Europea azul con círculo de estrellas amarillas). No las recolorees con la paleta de marca. Aplícales el mismo tratamiento de borde fino y sombra suave que al resto de la ilustración para que se integren al fondo.
- **Tipografía**: Exo 2 (títulos, subtítulos, cifras, itálica/negrita como el logo) y Montserrat (textos secundarios). En los tres diseños fijos de §2b se usan **Inter** (títulos de filas y «FUENTES») y **JetBrains Mono** en negrita (chips, contador, numeración, etiquetas y fecha), tal como se ven en las referencias del usuario. Obtén los archivos con:
  `git clone --depth 1 --filter=blob:none --sparse --no-checkout https://github.com/google/fonts.git gf && cd gf && git sparse-checkout set ofl/exo2 ofl/montserrat ofl/inter ofl/jetbrainsmono && git checkout` (funciona sin `add_repo`). Cárgalos con `@font-face` local (`font-weight:100 900`) y espera `document.fonts.load(...)` antes de renderizar.
- **Logo animado de entrada (3,0 s) y de cierre (3,6 s)**: son los clips oficiales `public/marca/intro.mp4` y `public/marca/cierre.mp4` (ver §0). Lema del logo: «NOTICIAS EN CONTEXTO». Solo si el usuario pide un logo nuevo, se recrea desde el PNG separando capas (símbolo CP, línea, CLAVE, PÚBLICA, barra, lema) con la misma secuencia de los clips.
- **Estructura fija**: logo intro (3,0 s) → voz empieza en 3,2 s → escena resumen inicial (encabezado con chip «RESUMEN DEL DÍA» y «0n NOTICIAS» a la derecha con la barra de progreso vacía; cifra gigante Exo 2 itálica 900 con degradado `#A8E4FF`→`#1FB6FF`; «NOTICIAS DE GUATEMALA» en JetBrains Mono ≈ 44 px celeste suave; bandera de Guatemala con escudo debajo) → una escena por noticia con el **encabezado fijo** de §2b-A (chip de sección + «NOTICIA 0n / 06», barra de progreso por noticias) → **recapitulación** de §2b-B → **FUENTES** de §2b-C (~5,2 s) → logo de cierre.

## 2b. Diseños fijos (referencias del usuario)
Estos tres diseños se usan **siempre, idénticos en cada video**; solo cambian los textos. Mandan sobre §2 y §3 donde choquen. Las medidas son aproximadas, tomadas de capturas del usuario y expresadas para 1080 px de ancho; si el usuario vuelve a adjuntar capturas o da otra medida, manda lo que él indique. El botón ▶ que aparece sobre las capturas es del reproductor, no se dibuja.

**Fondo común**: degradado marino oscuro (de `#0A2647` a `#04122A`) con una **trama de puntos tenue y regular** en toda la escena (separación ≈ 110 px, punto celeste muy suave, ≈ 10 % de opacidad).

### A. Encabezado de cada noticia (chip + contador)
- **Una sola fila**, centrada verticalmente: chip a la izquierda y contador a la derecha, con el mismo margen lateral (≈ 70 px) en ambos lados.
- **Distancia al borde superior fija en todas las escenas de noticia**: centro de la fila en y≈160 px (borde superior del chip ≈ y 128). No la animes, no la muevas según el contenido, no la cambies entre noticias; la barra de progreso y el resto de la escena se acomodan debajo.
- **Chip de sección** (GUATEMALA / INTERNACIONAL): píldora de radio completo, alto ≈ 62 px, ancho según el texto (≈ 250 px para «GUATEMALA»), relleno marino translúcido con degradado leve, borde celeste suave de ≈ 2 px (`#7FB8E6` al ~45 %). Icono de pin de mapa (contorno, celeste suave) a la izquierda del texto; texto en MAYÚSCULAS, JetBrains Mono negrita ≈ 26 px, blanco, con espaciado de letras ≈ 0,06 em.
- **Contador**: «NOTICIA 03 / 06» (dos dígitos, siempre con el total), JetBrains Mono negrita ≈ 30 px, MAYÚSCULAS, celeste suave `#7FB8E6`, alineado al borde derecho del margen.

### B. Recapitulación (checklist + botones)
- **Seis filas**, una por noticia, apiladas con separación pareja. Cada fila: píldora de ≈ 87 % del ancho del video (margen lateral ≈ 70 px), alto ≈ 86 px, radio ≈ 34 px, separación entre filas ≈ 17 px; relleno marino translúcido con degradado leve y sombra suave; borde fino verde menta tenue (`#5CCB9B` al ~45 %).
  - Izquierda: numeración «01»–«06» en JetBrains Mono, celeste suave, ≈ 30 px.
  - Centro: título corto de la noticia (2–4 palabras, ≈ 28 caracteres máx.), Inter negrita ≈ 32 px, blanco. Ejemplos del diseño: «Combustibles a la baja», «498 capturados en operativos».
  - Derecha: círculo de ≈ 60 px verde menta `#5CCB9B` con palomita marino oscuro `#0A2647`.
- **Animación**: las filas entran en orden (deslizamiento + fade) y cada palomita aparece con «pop»; la composición queda estable ≥ 1 s antes del corte.
- **Botones — sección de compartir** (≈ 56 px bajo la última fila; solo paleta de marca, sin otros colores): tres círculos de ≈ 168 px de diámetro, centrados en ≈ 1/5, 1/2 y 4/5 del ancho. Relleno celeste claro `#7FB8E6`, icono marino oscuro `#0A2647`: **campana** (INFÓRMATE), **compartir** (flecha hacia arriba saliendo de una bandeja, COMPARTE), **usuario con «+»** (SÍGUENOS). Halo exterior translúcido (≈ 1,1× el diámetro) que pulsa en secuencia de izquierda a derecha. Etiqueta debajo de cada botón: JetBrains Mono, MAYÚSCULAS, celeste suave, ≈ 26 px, espaciado ≈ 0,08 em.
- El bloque completo (filas + botones + etiquetas) queda dentro de la zona útil (y≈130 a y≈1500).

### C. Fuentes
- Solo paleta de marca (fondo marino, blanco y celeste suave); sin otros colores ni logotipos de colores de los medios.
- **Título «FUENTES»**: Inter negra (900), blanco, ≈ 90–96 px, MAYÚSCULAS, espaciado de letras ≈ 0,12 em, centrado. Debajo, a ≈ 20 px, un subrayado celeste suave `#7FB8E6` de ≈ 4 px de grosor y ≈ 250 px de ancho, centrado.
- **Lista**: una fila por fuente, en el orden que dé el usuario (hasta 6; el diseño no cambia con menos). Cada fila: píldora de ≈ 76 % del ancho del video centrada (≈ 820 px), alto ≈ 107 px, radio ≈ 44 px, separación entre filas ≈ 30 px; relleno marino translúcido, borde celeste suave muy tenue (≈ 1,5 px), sombra suave.
  - Izquierda: círculo de ≈ 72 px con contorno celeste suave, relleno translúcido y **icono de documento** (hoja con líneas) celeste suave.
  - Nombre del medio: Inter negrita ≈ 48 px, blanco. Si es «Associated Press» o «Reuters», puedes añadir la sigla entre paréntesis en JetBrains Mono ≈ 22 px, celeste suave, a continuación del nombre (en el diseño: «Associated Press (AP)»).
- **Pie**: «Fecha de referencia: 3 de noviembre de 2026» (usa la fecha de las noticias que dio el usuario), JetBrains Mono ≈ 26 px, celeste suave, centrado, ≈ 40 px bajo la última fila.
- Duración ≈ 5,2 s; las filas entran en cascada y la composición queda estable ≥ 1 s antes del logo de cierre.

## 3. Reglas de diseño (aplican a cada bloque)
1. **Propón una acción visual por bloque y luego construye.** Antes de programar, envía al usuario (SendUserMessage) una tabla breve: bloque → acción visual → palabra clave que la dispara → imagen final de la escena. Luego construye sin esperar, salvo que el usuario haya pedido aprobar. Los bloques de §2b ya están decididos: no los propongas de nuevo, solo lístalos como «diseño fijo».
2. **Máximo cuatro palabras de texto en pantalla por escena**, aparte de los subtítulos (chips y etiquetas cuentan). Excepción: la recapitulación y FUENTES, cuyo texto es parte del diseño fijo de §2b.
3. **Convierte ideas en acciones y dibuja las analogías del guion literalmente** (precios que bajan = bomba cuyo nivel desciende; ruta bloqueada = barco que se detiene ante una X; viaje = avión sobre un arco).
4. **Muestra magnitudes con escala** (contadores que suben o bajan, barras proporcionales, gráficos que se trazan) y **enfoca lo importante**: atenúa o aleja lo secundario, agranda lo clave.
5. **Conserva elementos entre escenas** para que se vea cómo se transforman (la cifra «6» de la intro se encoge y sube; el icono principal pasa a una esquina como marca de fuente).
6. **Sincroniza cada acción clave con su palabra** (claves `@cue` en el guion; los tiempos salen de la transcripción, §4).
7. **Deja una imagen final clara en cada escena**: composición estable al menos ~1 s antes del corte.
8. Ilustraciones: vectores SVG animados (bomba, patrulla con luces, ciclista pedaleando con cinemática inversa de piernas, avatar, cajas de ayuda, buque, periódico, banderas…), no stickers de imágenes. Parten de la paleta de marca, pero **en las gráficas se permiten otros colores** con coherencia visual y acabado profesional (ver §2); las **banderas llevan sus colores reales**. Cada una sobre un círculo de radio ≈ 360 px centrado en y≈917, con resplandor celeste muy tenue y borde punteado fino celeste suave que gira lento. Debajo del círculo, la etiqueta en **píldora** (Exo 2 800 ≈ 44 px, MAYÚSCULAS, blanca, relleno marino con degradado y borde celeste suave), como «HASTA EL VIERNES 13»; las cifras grandes de datos van en Exo 2 900 azul claro con un rótulo en JetBrains Mono celeste suave debajo (p. ej. «MÍNIMAS EN EL ALTIPLANO»).
9. Subtítulos cinéticos palabra por palabra, como en el video aprobado: **alineados a la izquierda** (margen 70 px), primera línea con el borde superior en y≈262, Exo 2 800 ≈ 72 px, interlineado 90 px, máximo dos líneas; palabras clave en celeste, cifras destacadas en azul claro. Cada palabra entra **atenuada** (≈ 45 % de opacidad, deslizamiento corto) ≈ 0,26 s antes de pronunciarse y **se ilumina** al 100 % en su `t0`; la frase desaparece justo antes de la siguiente.
10. Transiciones en cada corte: dos barras inclinadas (`skewX(-12deg)`, marino y celeste) que cruzan de −0,24 s a +0,26 s; el contenido cambia al cubrir. El encabezado se mantiene en su sitio: solo cambian el texto del chip y el contador.

## 4. Sincronía real con el audio (no la estimes)
Sin ASR instalado, descarga un modelo desde GitHub (el acceso a pypi/huggingface suele estar bloqueado, pero GitHub Releases funciona):
```
curl -L -o m.tar.bz2 https://github.com/k2-fsa/sherpa-onnx/releases/download/asr-models/sherpa-onnx-nemo-fast-conformer-ctc-es-1424.tar.bz2 && tar xjf m.tar.bz2
```
(Hay también `...whisper-small`, etc. en la misma release.) Úsalo con `onnxruntime` (ya instalado), sin sherpa:
- Audio a 16 kHz mono: `ffmpeg -i in -ar 16000 -ac 1 voice.wav`.
- Características estilo NeMo: pre-énfasis 0,97; reflect-pad 256; ventana Hann periódica de 400, hop 160, FFT 512; potencia; 80 filtros mel Slaney (0–8 kHz, norma de área); `log(x+2**-24)`; normalización por característica (media/σ por bin); entrada `audio_signal` [1,80,T] float32 y `length` [1] int64.
- Salida `logprobs` [T',1025], 80 ms por cuadro, **blanco = índice 1024**; tokens en `tokens.txt` (prefijo `▁` = inicio de palabra). Decodifica voraz (argmax, colapsa repetidos, quita blanco), agrupa tokens en palabras y toma `t0` = primer cuadro×0,08.
- Alinea las palabras del guion con las transcritas con Needleman–Wunsch (similitud `difflib.SequenceMatcher`, gap −0,55; números con pronunciación explícita, p. ej. `^Q3.82@cue|tres_ochenta_y_dos_quetzales^`); interpola las no emparejadas.
- Verificación: el `t0` de cada palabra cae a ±0,08 s de un núcleo silábico; usa `t0 − 0,08` como aparición del subtítulo. Corte entre noticias = `t0` de la primera palabra de la siguiente − 0,04.
- El ASR puede deformar nombres propios (p. ej. «Choney»): escribe la ortografía del guion pero conserva la hora detectada.
- **Muestra al usuario las diferencias entre guion y audio** y usa en pantalla lo que realmente se dice.

## 5. Construcción (Remotion)
- Todo es determinista por cuadro (`useCurrentFrame()`); nada de animaciones CSS por tiempo real. Ayudantes en `src/theme.ts`: `P(f,inicio,dur,easing)`, `ent()` (up/left/right/pop/fade), `outCubic/outExpo/outBack/inOut`, `s(seg)` → cuadros.
- Cada escena es un `<Sequence>` en `src/Video.tsx`; las transiciones de barras (`<Transicion cut>`) se dibujan en cada corte. Con audio real, las duraciones de cada noticia salen de los cortes de la transcripción (§4) en vez del valor fijo de 5 s: genera `src/timing.ts` con escenas, cues y cortes y úsalo en `Video.tsx` y en los `captions` de `data.ts`.
- El encabezado (§2b-A) es el componente `Encabezado` con `HEADER_CY = 160`, igual en todas las noticias; la recapitulación (`Recap`) y FUENTES (`Fuentes`) siguen §2b-B y §2b-C.
- Las fotos que adjunte el usuario van a `public/fotos/` y se muestran con `<Img src={staticFile(...)}>` dentro de la tarjeta de §1.
- Evita ids duplicados en SVG (prefijos únicos para `clipPath`/gradientes) y claves de cue duplicadas.
- Antes del render completo, genera una hoja de contactos con 8–14 instantes clave (`remotion still`) y corrige solapamientos, textos cortados y elementos fuera de pantalla.

## 6. Render y audio
- La voz entra como `<Audio src={staticFile("audio/voz.mp3")} />` dentro de una `<Sequence from={96}>` (3,2 s). La música de fondo (la que dé el usuario o una generada con numpy/scipy: pad Am–F–C–G + arpegio suave, con ducking bajo la voz y whooshes en cada corte) va como otro `<Audio>` con `volume` ≈ 0,65 o menos. Los clips de intro y cierre ya traen su propio audio.
- `npx remotion render Noticias out/<nombre>.mp4` (H.264, yuv420p, JPEG 92 y concurrencia 4 ya configurados). Si solo cambia una escena, renderiza ese rango con `--frames=a-b` para revisar.

## 7. Revisión y entrega
- `ffprobe`: 1080×1920, 30 fps, duración exacta; `volumedetect`: pico bajo −0,3 dB; hoja de contactos (1 cuadro cada ~10 s) revisada; encabezado a la misma distancia del borde superior en todas las noticias; recapitulación y FUENTES iguales a §2b; banderas con sus colores reales y gráficas con colores coherentes y profesionales.
- Entrega con `SendUserFile` (el video desde `remotion-noticias/out/`) y dime en pocas líneas: diferencias guion/audio, imágenes que faltan, y que la sincronía viene de la transcripción real (si ve un desfase, que indique el segundo).
- Ofrece como siguiente paso colocar las fotos pendientes.