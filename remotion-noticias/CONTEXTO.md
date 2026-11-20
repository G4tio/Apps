# Clave Pública: contexto para continuar los videos de noticias

Las reglas fijas están en la skill `videos-noticias-tiktok-clave-publica` (copia en `skill/`, sección «Acuerdos vigentes»). Este archivo guarda lo que cambia cada día: **actualízalo al entregar cada video**.

Videos verticales 9:16 de noticias para TikTok de **Clave Pública** (medio de Guatemala), hechos con Remotion en este repo (`g4tio/apps`, carpeta `remotion-noticias/`, rama de trabajo `ccr-69630ccc-d6vuxw`). La skill `videos-noticias-tiktok-clave-publica` describe la plantilla; este archivo agrega lo acordado en el día a día.

## Flujo de cada video

1. **Buscar noticias.**
   - Nacionales: solo en medios autorizados de Guatemala, listados en `skill/references/fuentes-guatemala.md` (Prensa Libre, La Hora, Soy502, Publinews, Emisoras Unidas, DCA, AGN, República, Canal Antigua, TV Azteca Guate, etc.).
   - Internacionales: también desde esos medios guatemaltecos.
   - **Evitar temas repetidos** de videos anteriores (ver la lista al final).
   - La fecha se toma **en hora de Guatemala**: `TZ=America/Guatemala date`. El reloj del contenedor va adelantado (UTC).
2. **Proponer.** Una tabla con las noticias y enlaces a las fuentes, el guion completo, los títulos del recap y la línea FUENTES. Avisar si una noticia tiene una sola fuente o cifras que no coinciden entre medios.
3. **Recibir material.** El usuario aprueba y manda el material **por nota**: «Nota 1, foto de X», «Nota 3, motion graphics», etc., y al final dice **«listo»**.
   - Las fotos suelen ser **stickers** en blanco y negro (borde blanco sobre fondo negro). Se recortan con `python3 scripts/recortar_sticker.py <entrada> public/fotos/AAAA-MM-DD[-int]/<nombre>.png` (añade `--sin-abajo` si la figura está cortada abajo sin contorno).
   - Los logos se guardan tal cual; si traen fondo, se recorta la zona del logo.
   - A veces una imagen no se guarda en disco. Hay que avisar al usuario para que la reenvíe.
   - Cuando dice «que ya tenemos», se reutilizan fotos o logos de días anteriores (`public/fotos/...`).
4. **Voz.** Fish Audio, voz **«Fernando Martínez – Noticias»**.
   - `public/audio/<carpeta>/locucion.txt` lleva una línea por bloque: intro, noticias y cierre. Los números van **escritos en palabras**.
   - `locucion_tts.txt` es la versión fonética para la voz: «o pe ese», «pe ene ce», «be be ce», «Jáland», «Er Frans». Los subtítulos salen de `locucion.txt`.
   - Comando: `python3 scripts/voz_por_bloques.py public/audio/<carpeta> <carpeta_modelo_asr> 0.7 1.0`. Guarda las tomas en `bloques/bNN_1.mp3`; para rehacer solo un bloque, se borra su `bNN_*`.
   - El modelo ASR es sherpa-onnx-nemo-fast-conformer-ctc-es; si no está, hay que descargarlo (ver la skill).
5. **Timing y música.**
   - Convertir a 16 kHz: `ffmpeg -i voz_limpia.wav -ar 16000 -ac 1 voz16k.wav`.
   - Transcribir: `python3 scripts/transcribir.py voz16k.wav <modelo> > palabras_asr.json`.
   - Timing: `python3 scripts/timing_cp.py public/audio/<carpeta> src/clave-publica/videos/<id>.plan.json src/clave-publica/videos/<id>.timing.json`.
   - Música: `python3 scripts/musica_cp.py <timing> <voz_limpia.wav> <musica.wav> --cierre`.
   - El ASR a veces omite números hablados; se confirma revisando los huecos de tiempo.
6. **Animaciones.** Un archivo `src/clave-publica/viz/nacionalN.tsx` o `internacionalN.tsx` por edición, registrado en `viz/index.ts`.
7. **Revisión.** Antes de renderizar, revisar una hoja de cuadros (contact sheet) con `npx remotion still ...` y **corregir todo lo que se encime**: subtítulos, rótulos, contadores, bordes de pantalla.
8. **Render.**
   - Empaquetar: `npx remotion bundle --out-dir=out/bundle`.
   - Renderizar: `npx remotion render out/bundle <Id> out/tmp.mp4`.
   - Convertir: `ffmpeg -i out/tmp.mp4 -c:v libx264 -crf 18 -pix_fmt yuv420p -color_range tv -c:a copy -movflags +faststart out/clave-publica-<nacional|internacional>-AAAA-MM-DD.mp4`.
9. **Entrega.** Commit y push a la rama (siempre `git fetch` antes del push), luego enviar el MP4.

## Archivos de cada día

- `src/clave-publica/videos/AAAA-MM-DD[-int].ts`: datos del video (fecha, noticias con `viz` y `etiquetas`, fuentes, `cierreHablado: true`, `escenaCy: 1050`). Se registra en `videos/index.ts`; el id de la composición es `Nacional-AAAA-MM-DD` o `Internacional-AAAA-MM-DD`.
- `...plan.json`:
  - `pantalla`: cambia palabras por cifras en los subtítulos.
  - `claves`: palabras resaltadas.
  - `cues`: palabra exacta del guion que dispara cada animación. El bloque 0 necesita el cue **`cinco`**, aunque sean 6 noticias (en ese caso se escribe `"cinco": "seis"`).
- `...timing.json`: lo genera el script.
- `public/fotos/` **sí está en git** (fotos y logos reutilizables); `public/audio/` no (pesa mucho; se regenera).

## Preferencias del usuario

- El cierre siempre se dice en voz: «Infórmate, comparte y síguenos en Clave Pública» (`cierreHablado: true`).
- El contenido va **más abajo**, lejos de los subtítulos: `escenaCy: 1050` en cada video nuevo. Por defecto era 917.
- Motion graphics en las notas sin foto. Las fotos de personas se muestran como sticker (componente `Sticker`) y los logos en una tarjeta blanca (`LogoCard`).
- Nada se puede encimar. Si el usuario lo marca, se revisa el video completo, no solo la escena señalada.
- Los videos suelen tener 5 noticias (a veces 6). La intro es «Estas son las cinco noticias más importantes de Guatemala de este <día> <fecha>» o «…noticias internacionales…».

## Piezas reutilizables

- **Ayudas** en `viz/internacional.tsx`:
  - `Lienzo` es el área de animación: 1080×800.
  - `Sticker`, `Cifra` (número grande con rótulo), `pop` y `fade`.
  - Cada archivo define su propio `Chip` y `LogoCard`.
- **Banderas** en `viz/banderas.tsx`: Rusia, Ucrania, Alemania, Francia, Italia, Japón, Canadá, Reino Unido, EE. UU., Irán, Perú, Nicaragua, España, Colombia, México, Israel, Honduras, Chile, Vietnam, EAU, China, Baréin, Bolivia, Haití, El Salvador, Chequia, Noruega, Dinamarca, Venezuela, Birmania y Turquía. La de Guatemala está dibujada en `nacional7.tsx` (`BanderaGT`).
- **Mapa de Guatemala** por departamentos: `MAPA` y `MapaGuatemala` en `viz/nacional3.tsx`. Para hacer zoom a una zona hay un ejemplo en `nacional6.tsx` (Izabal) y en `nacional7.tsx`.
- **Fotos y logos ya usados**, en `public/fotos/<fecha>/`:
  - Personas: Trump, Putin, Xi, el papa León XIV, Arévalo (`2026-11-17/presidente.png`), Bukele, Haaland, Villeda, Karen Ortiz e Illescas.
  - Edificios: Hospital Roosevelt.
  - Logos: TSE, MP, MAGA, MEM, Mingob, Mindef, BBC, IKEA, Air France y Fedefut.
  - 19 nov int: Hegseth, Delcy Rodríguez, Trump con las manos abiertas, Rubio, la hipopótamo Fiona y el logo de la COP31 (`2026-11-19-int/`).
  - 19 nov: Baldetti (`2026-11-19/baldetti.png`), góndola del AeroMetro (`aerometro.png`) y mazorcas de maíz (`maiz.png`). Congreso: `2026-11-16/congreso.png`.
- **Más piezas** en `viz/nacional8.tsx`: billetes de quetzal (`Billete`), hojas de calendario (`Dia`), hospital, cárcel, mazo, sol, casas, conos y carros sobre un bulevar.

## Temas ya cubiertos (no repetir)

- **Nacionales:**
  - Estado de sitio en Zacapa e Izabal, veteranos y bloqueos, allanamiento al COG, Selección eliminada ante Canadá, Asturias.
  - 17 nov: Ley de Ciberseguridad, juntas del TSE, minería en Izabal, frío (MAGA), semana renal del Roosevelt.
  - 18 nov: Villeda a la Corte IDH, cámaras corporales, bono de Q5 mil, cárcel El Triunfo, extraditados a Atlanta, Illescas.
  - 19 nov: Presupuesto 2027 sin dictamen, homicidios de octubre (CIEN), Baldetti al San Juan de Dios, sequía y maíz (Oxfam), carriles reducidos en el bulevar Liberación (AeroMetro).
  - Propuestas el 19 nov pero no usadas: capturas por fentanilo (Maaz Cruz y García Chacón), extorsiones a la baja (13 226 denuncias), EE. UU. condena el ataque a la fiscal.
  - Propuestas el 18 nov pero no usadas: exención de combustibles hasta junio 2027, reformas a la prisión preventiva, ataque a la fiscal electoral, Ley de Contrataciones, zafra y El Niño, ranking FIFA 97.
- **Internacionales:**
  - Rusia-Ucrania (negociación, drones, puente de Crimea), el Papa en Perú, Irán y Baréin, cumbre Trump-Xi-Putin, G7, ASEAN, Canarias.
  - 19 nov: CIJ declara a Birmania responsable de genocidio rohinyá, Hegseth firma acuerdo militar en Caracas, COP31 borra los fósiles del borrador, Trump pide calma ante los fallos tecnológicos (Rubio: sin ciberataque), muere la hipopótamo Fiona.
  - Propuestas el 19 nov pero no usadas: Senado de EE. UU. y poderes de guerra en Irán (48-51), declaración final de la cumbre Trump-Xi-Putin, debate Sánchez-Feijóo (elecciones 29N).
  - 17 nov: sarampión (OPS), ciberataque a BBC, IKEA y Air France, Haití y Bukele, choque de trenes en Praga, Noruega y Haaland.

## Último estado

- Videos entregados:
  - Nacional 17 nov: `Nacional-2026-11-17`.
  - Internacional 17 nov: `Internacional-2026-11-17`.
  - Nacional 18 nov (6 noticias): `Nacional-2026-11-18`.
  - Nacional 19 nov: `Nacional-2026-11-19` (corregido: final de la nota 5 y gráfica de Baldetti).
  - Internacional 19 nov: `Internacional-2026-11-19`.
- La credencial de Fish Audio está guardada en el entorno «Htmls» (no en «Default»): si `api.fish.audio` da 403, se cambia la sesión a ese entorno (`switch_environment`, solo red).
- `voz_por_bloques.py` repite los bloques que Fish entrega cortados (cola > −24 dB). Si un bloque se corta siempre, cambia el final de la frase (Fish se come una sílaba suelta final como «calle ce»).
- `timing_cp.py` corta las frases a ~46 caracteres (dos líneas de subtítulo).
- Para recortar stickers con trajes oscuros o ventanas, usa la silueta exterior (rellenar desde fuera el contorno blanco) en vez de `recortar_sticker.py`, que puede vaciar zonas negras internas.
- El modelo ASR se pasa como la carpeta que **contiene** `sherpa-onnx-nemo-fast-conformer-ctc-es-1424`.
- `timing_cp.py` ahora corta la frase tras puntuación también cuando lleva ≥ 18 caracteres (evita subtítulos de tres líneas como «36,431 hogares guatemaltecos. 8 de cada 10…»).
- Corrección reciente: `timing_cp.py` ya no duplica la puntuación («45 mil agentes,,») al cambiar palabras por cifras.
