# EduGrade AI

Sistema inteligente de evaluación automática de tareas escolares. Importa el listado de alumnos desde Excel, lee los PDF de una carpeta de Google Drive, identifica a qué estudiante pertenece cada documento, lo evalúa con IA multimodal según una rúbrica y entrega un Excel con notas, resultados y retroalimentación.

El docente solo tiene que:

1. **Importar el Excel de estudiantes** (Estudiantes → Importar Excel).
2. **Conectar una carpeta de Google Drive** (Google Drive → Conectar cuenta → Seleccionar carpeta).
3. **Configurar la actividad y su rúbrica** (Configuración académica / Rúbricas).
4. Presionar **«INICIAR EVALUACIÓN»**.

El servidor procesa la cola en segundo plano. Al terminar, *Resultados → Descargar Excel* entrega el archivo final.

---

## Requisitos

- Node.js **22.13 o superior** (usa el módulo SQLite integrado `node:sqlite`; no hace falta instalar una base de datos).
- Una clave de la **API de Anthropic** (modelo multimodal que lee los PDF).
- Un proyecto de **Google Cloud** con credenciales OAuth 2.0 para Google Drive.

## Instalación

```bash
cd edugrade
npm install
cp .env.example .env      # complete las claves (ver abajo)
npm start                 # http://localhost:3000
```

La primera vez que abra la aplicación se le pedirá crear la cuenta del docente administrador.

## La aplicación como un solo archivo HTML

`dist/edugrade.html` contiene toda la interfaz en un único archivo (HTML, estilos, JavaScript, gráficos y logo). Se puede descargar, abrir con doble clic, enviar a otros docentes o publicar en cualquier sitio web (por ejemplo GitHub Pages).

- Desde la aplicación: **Ajustes → Descargar edugrade.html** (o `http://SU-SERVIDOR/edugrade.html`). Esa copia ya trae configurada la dirección del servidor.
- La copia del repositorio pide la dirección del servidor la primera vez que se abre.
- Se regenera con `npm run build:html` (también automáticamente con `npm start`).

El archivo es la interfaz: la evaluación con IA, Google Drive y la base de datos siguen en el servidor, que debe estar encendido. Se autentica con un token (no con cookies) y la conexión con Google usa un enlace de un solo uso. `ALLOWED_ORIGINS` limita desde dónde puede usarse.

## Activar las integraciones

### 1. Inteligencia artificial (Anthropic)

1. Entre a <https://console.anthropic.com/>, cree una clave en **API Keys**.
2. Escríbala en `.env` como `ANTHROPIC_API_KEY=...` y reinicie.
3. Opcional: `ANTHROPIC_MODEL` (por defecto `claude-opus-5-5`) y `ANTHROPIC_EFFORT` (`high` por defecto).

La clave solo existe en el servidor: el navegador nunca la recibe. Cada PDF se envía completo al modelo como documento: el modelo recibe el texto **y la imagen de cada página**, por lo que lee documentos escaneados (OCR), escritura a mano legible, tablas, ejercicios, dibujos y gráficos.

### 2. Google Drive (OAuth 2.0)

1. En [Google Cloud Console](https://console.cloud.google.com/) cree (o elija) un proyecto.
2. **APIs y servicios → Biblioteca**: habilite **Google Drive API**.
3. **Pantalla de consentimiento OAuth**: tipo *Externo* (o *Interno* si usa Google Workspace). Agregue el alcance `https://www.googleapis.com/auth/drive.readonly` y, mientras la app esté en modo de prueba, agregue los correos de los docentes como *usuarios de prueba*.
4. **Credenciales → Crear credenciales → ID de cliente OAuth → Aplicación web**. En *URI de redireccionamiento autorizados* agregue exactamente:
   `http://localhost:3000/api/drive/oauth/callback` (o `https://SU-DOMINIO/api/drive/oauth/callback` en producción).
5. Copie el ID y el secreto en `.env` (`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI`) y reinicie.
6. En la aplicación: **Google Drive → Conectar cuenta Google → Seleccionar carpeta** (navegando o pegando el enlace de la carpeta).

Permiso solicitado: **solo lectura** (`drive.readonly`), el mínimo que permite descargar los PDF de una carpeta elegida por el docente. EduGrade AI nunca modifica ni borra archivos de Drive. Los tokens se guardan cifrados con AES-256-GCM.

## Cómo funciona

| Módulo | Qué hace |
|---|---|
| **Dashboard** | Indicadores (alumnos, documentos, identificados, evaluados, pendientes, incidencias, aprobados, no aprobados, promedio, % de aprobación), gráficos (distribución, aprobados/no aprobados, rendimiento por criterio, comparación por grado) y lista de alumnos que necesitan reforzamiento. Filtros por nivel, grado, sección, materia y actividad. |
| **Estudiantes** | Importa `.xlsx`/`.xls`, permite elegir la hoja, detecta automáticamente la fila de encabezados y las columnas (nombre completo o nombres + apellidos, código, nivel, grado, sección), muestra vista previa, marca duplicados y conserva el orden original. Se pueden agregar y quitar estudiantes sin tocar el archivo original, que se guarda intacto y puede descargarse. |
| **Google Drive** | Conexión OAuth, selección de una única carpeta (incluye subcarpetas), conteo de PDF, sincronización con detección de documentos nuevos, modificados y eliminados. Muestra la identificación de cada archivo y permite asignarlo o ignorarlo manualmente. |
| **Identificación** | Compara nombres de archivo con el listado tolerando mayúsculas, tildes, espacios, guiones, `CamelCase`, palabras como «Tarea» o «Actividad», orden de nombres y apellidos, pequeñas variaciones ortográficas y códigos de estudiante. Estados: *confirmada*, *probable* y *sin coincidencia*. Solo las confirmadas se evalúan automáticamente; ante cualquier duda razonable (un solo nombre, faltas de ortografía, homónimos, varios candidatos) el documento va a **Incidencias**. |
| **Configuración académica** | Nivel (Preprimaria, Primaria, Básicos, Diversificado) con grados adaptados al nivel, sección, materia, nombre, descripción, objetivos, instrucciones, fecha de entrega, escala y nota mínima. Las actividades se guardan y se pueden duplicar. Una *palabra clave* opcional limita los PDF de la carpeta a los de esa actividad (p. ej. `Tarea1`). |
| **Rúbricas** | Editor completo: criterios con nombre, descripción, ponderación, indicadores, puntuación máxima y niveles de desempeño con descriptores. Valida que las ponderaciones sumen exactamente 100 %. Crear, editar, duplicar, guardar como plantilla, importar (JSON o Excel) y exportar. Incluye plantillas iniciales por nivel. |
| **Motor de IA** | Lee el PDF, analiza instrucciones, objetivos y rúbrica, califica cada criterio por separado con evidencias concretas, y genera fortalezas, dificultades, recomendaciones y una observación con lenguaje adecuado a la edad. Aplica reglas específicas por nivel (p. ej. en Preprimaria no penaliza errores propios del desarrollo). La **nota final la calcula el servidor**: Σ (puntos/máximo × ponderación) convertido a la escala configurada y comparado con la nota mínima. |
| **Cola de procesamiento** | Procesamiento por lotes con concurrencia configurable, barra de progreso, contadores (procesados, pendientes, con error), reintentos automáticos con espera exponencial ante fallos temporales (límite de uso, sobrecarga, red), guardado progresivo de cada resultado, pausa / continuar / cancelar, reanudación tras reiniciar el servidor y **prevención de evaluaciones duplicadas** (un documento con la misma versión, actividad y rúbrica no se vuelve a enviar a la IA). Un documento con error nunca detiene a los demás. |
| **Resultados** | Tabla con número, nombre, nivel, grado, sección, actividad, nota, resultado, estado de evaluación y observaciones. Estados: APROBADO, NO APROBADO, PENDIENTE, SIN DOCUMENTO, REVISIÓN NECESARIA. Búsqueda, filtros, orden por nota, detalle con desglose de rúbrica y evidencias, retroalimentación, abrir el PDF original, volver a evaluar y **modificar la nota manualmente con motivo** (queda registrado). |
| **Incidencias** | PDF ilegible, documento vacío, archivo dañado, alumno no identificado, coincidencia dudosa, rúbrica no configurada, evidencia insuficiente y error de procesamiento. Se resuelven asignando el documento correcto, eligiendo entre varios documentos, reintentando la evaluación, poniendo nota manual o descartando. Nunca se inventa una calificación. |
| **Exportación Excel** | Copia nueva del listado original (conserva todas sus columnas, filas y títulos) con las columnas *Nota final*, *Resultado*, *Estado de evaluación* y *Observaciones*, más las hojas *Desglose de rúbrica*, *Retroalimentación*, *Estadísticas* e *Incidencias*, con encabezados, filtros, colores y paneles inmovilizados. |
| **Historial** | Cada evaluación queda guardada (fecha, actividad, materia, grado, sección, rúbrica, estudiantes, promedio, aprobados, no aprobados, incidencias) y se puede consultar o descargar en Excel en cualquier momento. Se guarda una copia de la actividad y la rúbrica usadas. |
| **Ajustes** | Estado de las integraciones, política de retención (días que se guardan las copias locales de los PDF y el historial), eliminación inmediata de copias, docentes con acceso, cambio de contraseña y registro de actividad. |

## Seguridad

- Las claves (`ANTHROPIC_API_KEY`, `GOOGLE_CLIENT_SECRET`) solo se leen del entorno del servidor.
- Acceso con usuario y contraseña (hash `scrypt`), sesiones con cookie `HttpOnly` / `SameSite=Lax` (y `Secure` con HTTPS), límite de intentos de inicio de sesión.
- Protección CSRF por verificación de origen y política de seguridad de contenido (CSP) estricta.
- Tokens de Google cifrados en la base de datos; permiso de Drive de solo lectura; el flujo OAuth valida el parámetro `state`.
- Registro de auditoría de acciones y registro de cada cambio de nota (IA, reevaluación o manual).
- Retención configurable y eliminación de las copias de los documentos.

En producción, sirva la aplicación detrás de HTTPS (por ejemplo con un proxy inverso) y defina `PUBLIC_URL=https://...`.

## Desarrollo y pruebas

```bash
npm run dev     # reinicio automático al editar
npm test        # pruebas automatizadas
```

Las pruebas cubren el algoritmo de identificación, la petición real enviada a la API de IA (contra un servidor local que imita la API), y el flujo completo: importar Excel, identificar documentos, evaluar en cola con reintentos, incidencias (PDF vacío, dañado, coincidencia dudosa, sin rúbrica), asignación manual, nota manual con historial, prevención de duplicados y exportación Excel.

## Estructura

```
edugrade/
├── server.js              # servidor Express
├── src/
│   ├── config.js          # variables de entorno
│   ├── db.js              # SQLite: alumnos, rúbricas, actividades, evaluaciones, historial
│   ├── auth.js, security.js
│   ├── excel-import.js    # SheetJS
│   ├── drive.js           # Google Drive API + OAuth 2.0
│   ├── matching.js        # identificación de estudiantes
│   ├── pdf.js             # PDF.js: integridad, páginas, texto, imágenes
│   ├── ai-evaluator.js    # evaluación con IA multimodal
│   ├── engine.js          # cola de evaluación, incidencias, reintentos
│   ├── stats.js, export.js, rubrics.js, matches.js, retention.js
│   └── routes/api.js      # API REST
├── public/                # interfaz (HTML5, CSS3, JavaScript)
└── test/
```
