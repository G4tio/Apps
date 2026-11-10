import { Config } from "@remotion/cli/config";

// Usa el Chromium headless que ya viene en el entorno (no descarga otro).
Config.setBrowserExecutable(
  "/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell"
);
Config.setVideoImageFormat("jpeg");
Config.setJpegQuality(92);
Config.setCodec("h264");
Config.setPixelFormat("yuv420p");
Config.setConcurrency(Math.min(4, require("os").cpus().length));
