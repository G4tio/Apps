import { continueRender, delayRender, staticFile } from "remotion";

const fonts: [string, string, string][] = [
  ["Exo 2", "Exo2.ttf", "normal"],
  ["Exo 2", "Exo2-Italic.ttf", "italic"],
  ["Inter", "Inter.ttf", "normal"],
  ["JetBrains Mono", "JetBrainsMono.ttf", "normal"],
  ["Montserrat", "Montserrat.ttf", "normal"],
];

const handle = delayRender("Cargando fuentes");
Promise.all(
  fonts.map(([family, file, style]) =>
    new FontFace(family, `url(${staticFile("fonts/" + file)})`, {
      weight: "100 900",
      style,
    })
      .load()
      .then((ff) => document.fonts.add(ff))
  )
)
  .then(() => continueRender(handle))
  .catch((e) => {
    console.error(e);
    continueRender(handle);
  });
