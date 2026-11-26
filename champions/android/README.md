# Champions Hub para Android

App nativa (WebView) que empaqueta `champions/index.html`. El APK listo para instalar está en `champions/ChampionsHub.apk`.

## Volver a compilar después de cambiar la app
Requiere JDK 17+ y el SDK de Android (plataforma 34).

```bash
cd champions/android
echo "sdk.dir=/ruta/al/android-sdk" > local.properties
gradle assembleRelease
cp app/build/outputs/apk/release/app-release.apk ../ChampionsHub.apk
```

La compilación copia automáticamente `champions/index.html` dentro del APK.
Sube `versionCode` y `versionName` en `app/build.gradle` en cada versión nueva.
La llave `app/champions.keystore` (contraseña `championshub`) firma todas las versiones para que se
puedan instalar encima de la anterior; no protege nada secreto.
