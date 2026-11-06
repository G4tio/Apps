// Motor de evaluación con IA multimodal (Claude, API de Anthropic).
// El PDF se envía completo como bloque "document": el modelo recibe el texto y la
// imagen de cada página, por lo que puede leer documentos escaneados (OCR), manuscritos,
// tablas, dibujos y gráficos.
import Anthropic from '@anthropic-ai/sdk';
import { config } from './config.js';
import { LEVEL_RULES } from './levels.js';

let client = null;
let clientKey = null;
function getClient() {
  if (!config.anthropic.apiKey) {
    const err = new Error('La API de IA no está configurada: defina ANTHROPIC_API_KEY en el servidor.');
    err.permanent = true;
    throw err;
  }
  if (!client || clientKey !== config.anthropic.apiKey) {
    clientKey = config.anthropic.apiKey;
    client = new Anthropic({
      apiKey: clientKey,
      maxRetries: 2,
      timeout: 10 * 60 * 1000,
      // Versión de navegador: la clave pertenece al propio docente y se guarda solo en su dispositivo.
      dangerouslyAllowBrowser: Boolean(config.browser),
    });
  }
  return client;
}

export class TransientAIError extends Error {}
export class AIProcessingError extends Error {
  constructor(message, incidentType = 'error_procesamiento') {
    super(message);
    this.incidentType = incidentType;
  }
}

const OUTPUT_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['document_status', 'document_status_detail', 'detected_student_name', 'identity_check', 'criteria', 'strengths', 'difficulties', 'recommendations', 'observation'],
  properties: {
    document_status: { type: 'string', enum: ['ok', 'ilegible', 'vacio', 'no_corresponde', 'evidencia_insuficiente'] },
    document_status_detail: { type: 'string' },
    detected_student_name: { type: 'string' },
    identity_check: { type: 'string', enum: ['coincide', 'no_coincide', 'no_visible'] },
    criteria: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['criterion_id', 'level_name', 'score', 'evidence', 'justification'],
        properties: {
          criterion_id: { type: 'string' },
          level_name: { type: 'string' },
          score: { type: 'number' },
          evidence: { type: 'array', items: { type: 'string' } },
          justification: { type: 'string' },
        },
      },
    },
    strengths: { type: 'array', items: { type: 'string' } },
    difficulties: { type: 'array', items: { type: 'string' } },
    recommendations: { type: 'array', items: { type: 'string' } },
    observation: { type: 'string' },
  },
};

export function buildSystemPrompt(activity, rubric) {
  const rules = LEVEL_RULES[activity.level] || LEVEL_RULES['Primaria'];
  const rubricForModel = rubric.criteria.map((c) => ({
    criterion_id: c.id,
    nombre: c.name,
    descripcion: c.description || '',
    ponderacion_porcentaje: c.weight,
    puntuacion_maxima: c.max_score,
    indicadores: c.indicators || [],
    niveles_de_desempeno: (c.levels || []).map((l) => ({ nivel: l.name, puntos: l.score, descriptor: l.descriptor || '' })),
  }));

  return `Eres el motor de evaluación de EduGrade AI, un evaluador docente experto, riguroso y justo. Evalúas trabajos escolares en Guatemala y escribes en español.

## Contexto de la actividad
- Nivel educativo: ${activity.level} (edad aproximada: ${rules.age})
- Grado: ${activity.grade || 'no especificado'}${activity.section ? ` — Sección ${activity.section}` : ''}
- Materia / área: ${activity.subject}
- Actividad: ${activity.name}
- Descripción: ${activity.description || '—'}
- Objetivos de aprendizaje: ${activity.objectives || '—'}
- Instrucciones dadas al estudiante: ${activity.instructions || '—'}
${activity.due_date ? `- Fecha de entrega: ${activity.due_date}\n` : ''}
## Rúbrica (única fuente de criterios)
${JSON.stringify(rubricForModel, null, 2)}

## Enfoque según el nivel ${activity.level}
${rules.focus.map((f) => `- ${f}`).join('\n')}
- Usa EXCLUSIVAMENTE los criterios de la rúbrica. No apliques exigencias de niveles o grados superiores ni criterios que no estén en la rúbrica.

## Cómo evaluar
1. Lee el documento completo, todas las páginas: texto, tablas, ejercicios, imágenes, dibujos y escritura a mano.
2. Evalúa CADA criterio de forma independiente. Para cada uno elige el nivel de desempeño cuyo descriptor mejor corresponda y asigna una puntuación entre 0 y su puntuación máxima (puedes usar la puntuación del nivel o un valor intermedio justificado). No uses una calificación genérica para todo el documento.
3. Fundamenta cada puntuación con evidencias concretas del trabajo: cita frases breves, describe el ejercicio, la tabla o el dibujo concreto e indica la página cuando sea posible.
4. Devuelve un elemento en "criteria" por cada criterio de la rúbrica, usando exactamente su "criterion_id". No calcules la nota final: el sistema la calcula a partir de tus puntuaciones y las ponderaciones.

## Honestidad: nunca inventes una calificación
- Si el documento no se puede leer (imagen borrosa, páginas ilegibles), usa document_status "ilegible".
- Si está en blanco o prácticamente vacío, usa "vacio".
- Si claramente pertenece a otra actividad o materia, usa "no_corresponde".
- Si se lee pero no hay evidencia suficiente para evaluar la mayoría de los criterios con fundamento, usa "evidencia_insuficiente".
- En esos casos explica el motivo en document_status_detail; puedes dejar "criteria" vacío.
- Un trabajo incompleto pero legible SÍ se evalúa ("ok"): los criterios sin evidencia reciben la puntuación baja que corresponda según la rúbrica.

## Identidad
Se te indicará el nombre del estudiante al que el sistema asignó el archivo. Si el documento muestra un nombre de estudiante, escríbelo en detected_student_name. identity_check: "coincide" si corresponde (admite variaciones menores, abreviaturas o solo un nombre y apellido), "no_coincide" solo si aparece claramente el nombre de OTRA persona como autora, "no_visible" si no aparece ningún nombre.

## Retroalimentación
${rules.tone}
- strengths: 1 a 4 fortalezas concretas.
- difficulties: 0 a 4 dificultades concretas.
- recommendations: 1 a 4 recomendaciones prácticas.
- observation: un párrafo breve (máximo 400 caracteres) para el registro del docente, dirigido al estudiante, que resuma logros y aspectos a mejorar.`;
}

/**
 * Evalúa un PDF con la rúbrica configurada.
 * @returns {Promise<{criteria:Array, strengths:Array, difficulties:Array, recommendations:Array, observation:string, meta:Object}>}
 */
export async function evaluateDocument({ pdfBuffer, activity, rubric, studentName, pdfInfo }) {
  const anthropic = getClient();
  if (pdfBuffer.length > config.maxPdfBytes) {
    throw new AIProcessingError(`El PDF pesa ${(pdfBuffer.length / 1048576).toFixed(1)} MB; el máximo procesable es ${config.maxPdfBytes / 1048576} MB.`);
  }
  if (pdfInfo?.pages > 600) throw new AIProcessingError(`El PDF tiene ${pdfInfo.pages} páginas; el máximo procesable es 600.`);

  const system = buildSystemPrompt(activity, rubric);
  const userText = `Estudiante asignado por el sistema: ${studentName}
Información técnica del archivo: ${pdfInfo?.pages ?? '?'} página(s)${pdfInfo?.likelyScanned ? ', probablemente escaneado o manuscrito (lee las imágenes de cada página)' : ''}.

Evalúa el documento adjunto con la rúbrica y devuelve el resultado en el formato JSON solicitado.`;

  let message;
  try {
    const stream = anthropic.beta.messages.stream({
      model: config.anthropic.model,
      max_tokens: 32000,
      ...(config.anthropic.fallbacks ? { betas: ['server-side-fallback-2026-07-01'], fallbacks: 'default' } : {}),
      system: [{ type: 'text', text: system, cache_control: { type: 'ephemeral' } }],
      output_config: {
        effort: config.anthropic.effort,
        format: { type: 'json_schema', schema: OUTPUT_SCHEMA },
      },
      messages: [{
        role: 'user',
        content: [
          { type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: pdfBuffer.toString('base64') }, title: 'Trabajo del estudiante' },
          { type: 'text', text: userText },
        ],
      }],
    });
    message = await stream.finalMessage();
  } catch (e) {
    if (e instanceof Anthropic.RateLimitError || e instanceof Anthropic.InternalServerError || e instanceof Anthropic.APIConnectionError) {
      throw new TransientAIError(`Fallo temporal de la API de IA: ${e.message}`);
    }
    if (e instanceof Anthropic.APIError && (e.status === 529 || e.status === 408 || e.status === 409 || (e.status >= 500))) {
      throw new TransientAIError(`Fallo temporal de la API de IA (${e.status}): ${e.message}`);
    }
    if (e instanceof Anthropic.AuthenticationError || e instanceof Anthropic.PermissionDeniedError) {
      const err = new Error(`Credenciales de IA inválidas: ${e.message}`);
      err.permanent = true;
      throw err;
    }
    if (e instanceof Anthropic.BadRequestError) throw new AIProcessingError(`La API de IA rechazó el documento: ${e.message}`);
    throw new TransientAIError(e?.message || String(e));
  }

  if (message.stop_reason === 'refusal') {
    throw new AIProcessingError('El modelo de IA declinó evaluar este documento. Requiere revisión manual.');
  }
  if (message.stop_reason === 'max_tokens') {
    throw new TransientAIError('La respuesta del modelo se truncó por longitud.');
  }
  const text = message.content.filter((b) => b.type === 'text').map((b) => b.text).join('');
  let out;
  try {
    out = JSON.parse(text);
  } catch {
    throw new TransientAIError('La respuesta del modelo no tuvo un formato JSON válido.');
  }

  const meta = {
    model: message.model,
    usage: message.usage ? { input: message.usage.input_tokens, output: message.usage.output_tokens, cache_read: message.usage.cache_read_input_tokens || 0 } : null,
    detected_student_name: out.detected_student_name || '',
    identity_check: out.identity_check,
    document_status: out.document_status,
    document_status_detail: out.document_status_detail,
    evaluated_at: new Date().toISOString(),
  };

  const statusIncident = {
    ilegible: 'pdf_ilegible',
    vacio: 'documento_vacio',
    no_corresponde: 'evidencia_insuficiente',
    evidencia_insuficiente: 'evidencia_insuficiente',
  }[out.document_status];
  if (statusIncident) {
    const label = out.document_status === 'no_corresponde' ? 'El documento no corresponde a la actividad' : 'La IA no pudo evaluar el documento';
    const err = new AIProcessingError(`${label}: ${out.document_status_detail || out.document_status}`, statusIncident);
    err.meta = meta;
    throw err;
  }
  if (out.identity_check === 'no_coincide') {
    const err = new AIProcessingError(`El documento muestra el nombre "${out.detected_student_name}", que no coincide con ${studentName}.`, 'coincidencia_dudosa');
    err.meta = meta;
    throw err;
  }

  const criteria = validateCriteria(out.criteria, rubric);
  return {
    criteria,
    strengths: out.strengths || [],
    difficulties: out.difficulties || [],
    recommendations: out.recommendations || [],
    observation: out.observation || '',
    meta,
  };
}

function validateCriteria(aiCriteria, rubric) {
  const byId = new Map((aiCriteria || []).map((c) => [String(c.criterion_id), c]));
  const missing = rubric.criteria.filter((c) => !byId.has(String(c.id)));
  if (missing.length) {
    throw new TransientAIError(`La IA no evaluó los criterios: ${missing.map((c) => c.name).join(', ')}.`);
  }
  return rubric.criteria.map((c) => {
    const ai = byId.get(String(c.id));
    const max = Number(c.max_score);
    const score = Math.min(max, Math.max(0, Number(ai.score) || 0));
    return {
      criterion_id: c.id,
      name: c.name,
      weight: Number(c.weight),
      max_score: max,
      score: Math.round(score * 100) / 100,
      level_name: ai.level_name,
      evidence: ai.evidence || [],
      justification: ai.justification || '',
    };
  });
}

/** Calcula la nota final ponderada y el resultado. */
export function computeGrade(criteria, { scaleMax, passMark }) {
  const percent = criteria.reduce((acc, c) => acc + (c.max_score > 0 ? (c.score / c.max_score) * c.weight : 0), 0);
  const pct = Math.round(percent * 100) / 100;
  const score = Math.round((pct / 100) * scaleMax * 100) / 100;
  return { percent: pct, score, result: score >= passMark ? 'APROBADO' : 'NO APROBADO' };
}
