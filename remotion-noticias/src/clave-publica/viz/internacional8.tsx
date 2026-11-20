import React from "react";
import { interpolate, staticFile, useCurrentFrame } from "remotion";
import { C, F, P, inOut, lerp, outBack, outCubic } from "../../theme";
import { Cifra, Lienzo, Sticker, fade, pop, type VizProps } from "./internacional";
import { Birmania, EEUU, Venezuela } from "./banderas";

// Ilustraciones de la edición internacional del 19 nov 2026.
const FOTOS = "fotos/2026-11-19-int/";
const cuenta = (f: number, at: number, hasta: number, d = 22) =>
  Math.round(interpolate(f, [at, at + d], [0, hasta], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: outCubic }));
const ROJO = "#E5484D";
const AMARILLO = "#F2B544";

const Chip: React.FC<{ x: number; y: number; texto: string; k: number; color?: string; size?: number }> = ({ x, y, texto, k, color = C.blanco, size = 26 }) => {
  const w = texto.length * size * 0.66 + 56;
  return (
    <g transform={`translate(${x} ${y}) scale(${k})`} opacity={Math.min(1, k * 1.5)}>
      <rect x={-w / 2} y={-size - 4} width={w} height={size * 2 + 8} rx={size + 4} fill="rgba(14,44,82,0.94)" stroke={C.suave} strokeWidth="2.5" />
      <text y={size * 0.36} textAnchor="middle" fontFamily={F.mono} fontWeight={800} fontSize={size} fill={color} letterSpacing="1.5">{texto}</text>
    </g>
  );
};
const LogoCard: React.FC<{ src: string; x: number; y: number; w: number; h: number; k: number; pad?: number }> = ({ src, x, y, w, h, k, pad = 18 }) => (
  <g transform={`translate(${x} ${y}) scale(${k})`} opacity={Math.min(1, k * 1.5)}>
    <rect x={-w / 2 - pad} y={-h / 2 - pad} width={w + pad * 2} height={h + pad * 2} rx="22" fill="#FFFFFF" filter="drop-shadow(0 10px 20px rgba(0,0,0,0.45))" />
    <image href={staticFile(src)} x={-w / 2} y={-h / 2} width={w} height={h} />
  </g>
);

/* ---------- 1. La CIJ declara a Birmania responsable de genocidio (motion graphics) ---------- */
const Balanza: React.FC<{ incl: number }> = ({ incl }) => (
  <g stroke={C.claro} strokeWidth="7" strokeLinecap="round" fill="none">
    <line x1="0" y1="-100" x2="0" y2="110" />
    <path d="M-70 110 H70" strokeWidth="12" />
    <circle cy="-108" r="12" fill={C.claro} />
    <g transform={`rotate(${incl} 0 -80)`}>
      <line x1="-140" y1="-80" x2="140" y2="-80" />
      <line x1="-140" y1="-80" x2="-176" y2="-6" /><line x1="-140" y1="-80" x2="-104" y2="-6" />
      <line x1="140" y1="-80" x2="104" y2="-6" /><line x1="140" y1="-80" x2="176" y2="-6" />
      <path d="M-184 -6 Q-140 34 -96 -6 Z" fill={C.celeste} />
      <path d="M96 -6 Q140 34 184 -6 Z" fill={C.celeste} />
    </g>
  </g>
);
const Icono: React.FC<{ tipo: "lupa" | "monedas" | "casa" }> = ({ tipo }) => (
  <g>
    <circle r="62" fill="rgba(14,44,82,0.9)" stroke={C.suave} strokeWidth="3" />
    {tipo === "lupa" && (
      <g stroke={C.claro} strokeWidth="9" fill="none" strokeLinecap="round"><circle cx="-8" cy="-8" r="22" /><line x1="9" y1="9" x2="28" y2="28" /></g>
    )}
    {tipo === "monedas" && (
      <g>{[18, 4, -10].map((y, i) => <ellipse key={i} cx="0" cy={y} rx="30" ry="11" fill={AMARILLO} stroke="#B8862D" strokeWidth="3" />)}</g>
    )}
    {tipo === "casa" && (
      <g><path d="M-30 4 L0 -24 L30 4" fill="none" stroke={C.claro} strokeWidth="8" strokeLinejoin="round" strokeLinecap="round" /><rect x="-20" y="2" width="40" height="28" rx="3" fill={C.claro} /></g>
    )}
  </g>
);
export const CIJBirmania: React.FC<VizProps> = ({ c }) => {
  const f = useCurrentFrame();
  const kb = pop(f, 6, 16);
  const incl = interpolate(f, [c("genocidio") - 6, c("genocidio") + 14], [0, -12], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: outBack });
  const kf = pop(f, c("birmania") - 6, 14);
  const sello = P(f, c("genocidio") - 2, 10, outBack);
  const fv = P(f, c("votos") - 8, 12, inOut); // fase de votos
  const fi = P(f, c("investigar") - 10, 12, inOut); // fase de órdenes
  return (
    <Lienzo>
      <g opacity={1 - fv}>
        <g transform={`translate(700 200) scale(${kb})`} opacity={Math.min(1, kb * 1.5)}><Balanza incl={incl} /></g>
        <g transform={`translate(110 90) scale(${kf})`} opacity={Math.min(1, kf * 1.5)}><Birmania w={270} id="mm19" /></g>
        <text x="245" y="320" textAnchor="middle" fontFamily={F.mono} fontWeight={800} fontSize="28" fill={C.suave} letterSpacing="3" opacity={fade(f, c("birmania"))}>BIRMANIA</text>
        <g transform={`translate(540 470) rotate(-6) scale(${lerp(1.8, 1, sello)})`} opacity={sello}>
          <rect x="-230" y="-52" width="460" height="104" rx="14" fill="rgba(10,38,71,0.85)" stroke={ROJO} strokeWidth="8" />
          <text y="20" textAnchor="middle" fontFamily={F.exo} fontWeight={900} fontSize="62" fill="#FF8A8D" letterSpacing="4">GENOCIDIO</text>
        </g>
        <Chip x={540} y={630} texto="1ª VEZ EN LA HISTORIA DE LA CIJ" k={pop(f, c("primera") - 4)} color={AMARILLO} size={24} />
      </g>
      {/* votación 9–6 */}
      <g opacity={fv * (1 - fi)}>
        <Cifra x={540} y={230} valor="9 – 6" rotulo="VOTOS DE LOS JUECES" k={fv} size={170} />
        {Array.from({ length: 15 }).map((_, i) => {
          const si = i < 9;
          const k = pop(f, c("votos") - 4 + i * 2, 10);
          return (
            <g key={i} transform={`translate(${155 + i * 55} 420) scale(${k})`} opacity={Math.min(1, k * 1.5)}>
              <circle cy="-16" r="15" fill={si ? C.celeste : "#5B6676"} />
              <path d="M-22 26 a22 26 0 0 1 44 0 z" fill={si ? C.celeste : "#5B6676"} />
            </g>
          );
        })}
      </g>
      {/* lo que ordena la Corte */}
      <g opacity={fi}>
        {([["lupa", "INVESTIGAR", "investigar"], ["monedas", "INDEMNIZAR", "indemnizar"], ["casa", "RETORNO", "regreso"]] as const).map(([t, l, cue], i) => {
          const k = pop(f, c(cue) - 6, 14);
          return (
            <g key={t} transform={`translate(${220 + i * 320} 330)`}>
              <g transform={`scale(${k * 1.4})`} opacity={Math.min(1, k * 1.5)}><Icono tipo={t} /></g>
              <text y="140" textAnchor="middle" fontFamily={F.mono} fontWeight={800} fontSize="28" fill={C.suave} letterSpacing="2" opacity={fade(f, c(cue))}>{l}</text>
            </g>
          );
        })}
        <g transform="translate(110 570)" opacity={fi}><Birmania w={120} id="mm19b" /></g>
        <text x="250" y="625" fontFamily={F.mono} fontWeight={800} fontSize="26" fill={C.claro} letterSpacing="2" opacity={fi}>ÓRDENES A BIRMANIA</text>
      </g>
    </Lienzo>
  );
};

/* ---------- 2. Hegseth en Caracas: acuerdo de cooperación militar ---------- */
const Avion: React.FC = () => (
  <g fill={C.claro}>
    <path d="M-70 -8 L60 -8 Q84 0 60 8 L-70 8 Z" />
    <path d="M-10 -6 L-40 -50 L-22 -50 L22 -6 Z" /><path d="M-10 6 L-40 50 L-22 50 L22 6 Z" />
    <path d="M-62 -6 L-76 -28 L-66 -28 L-48 -6 Z" />
  </g>
);
const Documento: React.FC<{ firma: number; duda: number }> = ({ firma, duda }) => (
  <g filter="drop-shadow(0 10px 18px rgba(0,0,0,0.45))">
    <rect x="-80" y="-105" width="160" height="210" rx="12" fill={C.grisClaro} />
    {[-70, -45, -20, 5, 30].map((y, i) => <rect key={y} x="-56" y={y} width={i === 4 ? 70 : 112} height="9" rx="4" fill="#9FB3C8" opacity={1 - duda * 0.7} />)}
    <path d="M-50 75 q15 -20 28 0 t28 0 t26 -6" fill="none" stroke={C.marino} strokeWidth="5" strokeLinecap="round" pathLength={1} strokeDasharray={`${firma} 1`} />
    <g opacity={duda}>
      <circle cy="-10" r="44" fill={AMARILLO} />
      <text y="16" textAnchor="middle" fontFamily={F.exo} fontWeight={900} fontSize="70" fill={C.marino}>?</text>
    </g>
  </g>
);
export const HegsethCaracas: React.FC<VizProps> = ({ c }) => {
  const f = useCurrentFrame();
  const kh = pop(f, 4, 16);
  const kd = pop(f, c("delcy") - 6, 16);
  const vuelo = P(f, c("caracas") - 30, 40, inOut);
  const kdoc = pop(f, c("acuerdo") - 4, 14);
  const firma = P(f, c("acuerdo") + 6, 20);
  const duda = P(f, c("organizacion") - 4, 12);
  return (
    <Lienzo>
      {/* avión que llega a Caracas */}
      <g transform={`translate(${lerp(-120, 1200, vuelo)} ${60 - Math.sin(vuelo * Math.PI) * 20})`} opacity={vuelo > 0 && vuelo < 1 ? 1 : 0}><Avion /></g>
      <Chip x={720} y={70} texto="CARACAS" k={pop(f, c("caracas") - 4) * (1 - P(f, c("pentagono") - 8, 8))} size={28} />
      <Chip x={540} y={70} texto="1ª VISITA EN DÉCADAS" k={pop(f, c("pentagono") - 4)} color={AMARILLO} size={26} />
      <Sticker src={FOTOS + "hegseth.png"} id="hegseth" x={10} y={190} w={340} h={455} k={kh} opacity={Math.min(1, kh * 2)} />
      <g transform={`translate(40 620) scale(${pop(f, 10, 12)})`}><EEUU w={130} id="us19" /></g>
      <Sticker src={FOTOS + "rodriguez.png"} id="rodriguez" x={560} y={290} w={400} h={352} k={kd} opacity={Math.min(1, kd * 2)} />
      <g transform={`translate(800 600) scale(${kd})`} opacity={Math.min(1, kd * 1.5)}><Venezuela w={130} id="ve19" /></g>
      <g transform={`translate(455 330) scale(${kdoc})`} opacity={Math.min(1, kdoc * 1.5)}><Documento firma={firma} duda={duda} /></g>
      <Chip x={480} y={740} texto="COOPERACIÓN MILITAR" k={pop(f, c("acuerdo") + 4) * (1 - duda)} size={26} />
      <Chip x={480} y={740} texto="CLÁUSULAS SIN PUBLICAR" k={pop(f, c("clausulas") - 8)} color={AMARILLO} size={26} />
    </Lienzo>
  );
};

/* ---------- 3. COP31: el borrador borra los combustibles fósiles ---------- */
const Barril: React.FC = () => (
  <g>
    <rect x="-34" y="-46" width="68" height="92" rx="10" fill="#3A4656" stroke={C.claro} strokeWidth="3" />
    <rect x="-34" y="-18" width="68" height="6" fill={C.claro} opacity="0.6" /><rect x="-34" y="14" width="68" height="6" fill={C.claro} opacity="0.6" />
    <path d="M0 -10 q12 14 0 22 q-12 -8 0 -22z" fill={AMARILLO} />
  </g>
);
const Llama: React.FC = () => (
  <g>
    <path d="M0 -48 C28 -18 34 8 22 30 C14 46 -14 46 -22 30 C-34 8 -18 -12 -6 -24 C-6 -8 2 0 8 -6 C12 -18 6 -32 0 -48Z" fill="#4CA3E6" />
    <path d="M0 0 C12 14 12 28 0 34 C-12 28 -12 14 0 0Z" fill="#BFEAFF" />
  </g>
);
const Carbon: React.FC = () => (
  <g fill="#2A2F36" stroke="#8C98A6" strokeWidth="3" strokeLinejoin="round">
    <path d="M-40 30 L-30 -4 L-6 -14 L10 6 L-4 34 Z" /><path d="M-2 34 L12 2 L34 -6 L44 20 L30 38 Z" /><path d="M-18 -10 L0 -40 L22 -30 L18 -4 L2 0 Z" />
  </g>
);
export const COP31Borrador: React.FC<VizProps> = ({ c }) => {
  const f = useCurrentFrame();
  const kl = pop(f, 6, 16);
  const kdoc = pop(f, c("borrador") - 6, 14);
  const borra = P(f, c("carbon") + 4, 18, inOut);
  const fp = P(f, c("paises") - 10, 14, inOut);
  const items = [["petroleo", Barril], ["gas", Llama], ["carbon", Carbon]] as const;
  return (
    <Lienzo>
      <LogoCard src={FOTOS + "logo-cop31.png"} x={540} y={100} w={400} h={162} k={kl} />
      <g opacity={1 - fp}>
        {/* borrador */}
        <g transform={`translate(540 470) scale(${kdoc})`} opacity={Math.min(1, kdoc * 1.5)}>
          <rect x="-330" y="-170" width="660" height="340" rx="18" fill="rgba(245,248,252,0.96)" filter="drop-shadow(0 12px 22px rgba(0,0,0,0.45))" />
          <text x="-300" y="-122" fontFamily={F.mono} fontWeight={800} fontSize="26" fill={C.marino} letterSpacing="3">BORRADOR</text>
          {[-90, -66].map((y) => <rect key={y} x="-300" y={y} width="600" height="10" rx="5" fill="#B7C6D6" />)}
          {items.map(([cue, Ic], i) => {
            const k = pop(f, c(cue) - 6, 12);
            return (
              <g key={cue} transform={`translate(${-190 + i * 190} 50)`}>
                <g transform={`scale(${k * 1.2})`} opacity={Math.min(1, k * 1.5) * (1 - 0.75 * borra)}><Ic /></g>
              </g>
            );
          })}
          {/* goma que tacha la línea de los fósiles */}
          <line x1="-300" y1="50" x2={-300 + 600 * borra} y2="50" stroke={ROJO} strokeWidth="12" strokeLinecap="round" opacity={borra > 0 ? 1 : 0} />
        </g>
      </g>
      {/* plazo: casi 200 países hasta el viernes */}
      <g opacity={fp}>
        <Cifra x={540} y={400} valor={`~${cuenta(f, c("paises") - 6, 200, 24)}`} rotulo="PAÍSES NEGOCIAN" k={fp} size={170} />
        <Chip x={540} y={560} texto="PLAZO: VIERNES 20" k={pop(f, c("viernes") - 4)} color={AMARILLO} size={28} />
        <g transform={`translate(540 680) scale(${pop(f, c("retroceso") - 8)})`} opacity={Math.min(1, pop(f, c("retroceso") - 8) * 1.5)}>
          <circle r="46" fill={ROJO} />
          <path d="M0 -24 V22 M-18 6 L0 24 L18 6" stroke="#FFFFFF" strokeWidth="9" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      </g>
    </Lienzo>
  );
};

/* ---------- 4. Trump pide calma ante la ola de fallos tecnológicos ---------- */
const Sistema: React.FC<{ tipo: "banco" | "red" | "avion"; falla: number; f: number }> = ({ tipo, falla, f }) => {
  const parpadeo = falla > 0.5 ? (f % 16 < 9 ? 1 : 0.45) : 1;
  return (
    <g>
      <rect x="-90" y="-80" width="180" height="160" rx="20" fill="rgba(14,44,82,0.92)" stroke={falla > 0.5 ? ROJO : C.suave} strokeWidth={falla > 0.5 ? 5 : 3} />
      <g opacity={parpadeo}>
        {tipo === "banco" && (
          <g fill={C.claro}><path d="M-50 -18 L0 -48 L50 -18 Z" />{[-36, -12, 12, 36].map((x) => <rect key={x} x={x - 6} y="-12" width="12" height="40" />)}<rect x="-54" y="30" width="108" height="10" /></g>
        )}
        {tipo === "red" && (
          <g stroke={C.claro} strokeWidth="6" fill="none"><rect x="-44" y="-42" width="88" height="26" rx="5" /><rect x="-44" y="-8" width="88" height="26" rx="5" /><path d="M0 18 V40 M-40 40 H40" /></g>
        )}
        {tipo === "avion" && <g transform="scale(0.75) rotate(-20)"><Avion /></g>}
      </g>
      <g transform={`translate(66 -62) scale(${falla})`} opacity={Math.min(1, falla * 1.5)}>
        <path d="M0 -26 L26 20 H-26 Z" fill={AMARILLO} stroke="#0A2647" strokeWidth="3" strokeLinejoin="round" />
        <rect x="-3" y="-10" width="6" height="16" rx="2" fill="#0A2647" /><circle cy="12" r="3.5" fill="#0A2647" />
      </g>
    </g>
  );
};
export const FallosEEUU: React.FC<VizProps> = ({ c }) => {
  const f = useCurrentFrame();
  const kt = pop(f, 4, 16);
  const fr = P(f, c("rubio") - 10, 16, inOut); // entra Rubio
  return (
    <Lienzo>
      <g opacity={1 - fr}>
        <Sticker src={FOTOS + "trump.png"} id="trump19" x={240} y={0} w={600} h={401} k={kt} opacity={Math.min(1, kt * 2)} />
        {([["banco", "bancos"], ["red", "redes"], ["avion", "aereo"]] as const).map(([t, cue], i) => {
          const k = pop(f, c(cue) - 8, 12);
          return (
            <g key={t} transform={`translate(${250 + i * 290} 560) scale(${k})`} opacity={Math.min(1, k * 1.5)}>
              <Sistema tipo={t} falla={P(f, c(cue) + 2, 8, outBack)} f={f} />
            </g>
          );
        })}
        <Chip x={540} y={725} texto="+4 HORAS SIN DESPEGUES" k={pop(f, c("horas") - 4)} color={AMARILLO} size={28} />
      </g>
      <g opacity={fr}>
        <Sticker src={FOTOS + "trump.png"} id="trump19b" x={0} y={260} w={480} h={321} k={fr} />
        <Sticker src={FOTOS + "rubio.png"} id="rubio19" x={540} y={60} w={390} h={520} k={pop(f, c("rubio") - 6, 16)} />
        <Chip x={540} y={690} texto="SIN PRUEBAS DE CIBERATAQUE" k={pop(f, c("ciberataque") - 6)} color={C.menta} size={26} />
      </g>
    </Lienzo>
  );
};

/* ---------- 5. Muere Fiona, la hipopótamo de Cincinnati ---------- */
const Gorro: React.FC = () => (
  <g>
    <path d="M-44 20 C-44 -30 44 -30 44 20 Z" fill="#C2504F" />
    <rect x="-48" y="14" width="96" height="22" rx="8" fill="#E7E1D6" />
    {[-32, -16, 0, 16, 32].map((x) => <line key={x} x1={x} y1="16" x2={x} y2="34" stroke="#BDB4A6" strokeWidth="3" />)}
    <circle cy="-28" r="13" fill="#E7E1D6" />
  </g>
);
export const FionaHipopotamo: React.FC<VizProps> = ({ c }) => {
  const f = useCurrentFrame();
  const k = P(f, 4, 20, outBack);
  const fs = P(f, c("salvarla") - 4, 20, inOut); // tono de despedida
  const fv = P(f, c("viral") - 8, 14, inOut);
  const datos = 1 - fv;
  return (
    <Lienzo>
      {/* ondas del agua */}
      {[0, 1, 2].map((i) => {
        const u = ((f + i * 30) % 90) / 90;
        return <ellipse key={i} cx="540" cy="500" rx={260 + u * 160} ry={36 + u * 24} fill="none" stroke={C.suave} strokeWidth="3" opacity={(1 - u) * 0.5 * Math.min(1, k)} />;
      })}
      <g style={{ filter: `grayscale(${fs * 0.6})` }}>
        <Sticker src={FOTOS + "fiona.png"} id="fiona" x={250} y={30} w={580} h={488} k={k} opacity={Math.min(1, k * 2)} />
      </g>
      {/* corazones al volverse viral */}
      {Array.from({ length: 8 }).map((_, i) => {
        const t = ((f - c("viral") + i * 9) % 60) / 60;
        const on = fv * (f > c("viral") - 8 ? 1 : 0);
        const x = 180 + ((i * 137) % 720);
        return (
          <path key={i} transform={`translate(${x} ${520 - t * 420}) scale(${0.8 + (i % 3) * 0.25})`} d="M0 10 C-22 -6 -14 -26 0 -14 C14 -26 22 -6 0 10Z" fill={i % 2 ? "#FF8A8D" : C.celeste} opacity={on * (1 - t) * 0.9} />
        );
      })}
      <g opacity={datos}>
        <Cifra x={250} y={660} valor={`${cuenta(f, c("nueve") - 4, 9, 12)} AÑOS`} rotulo="EDAD DE FIONA" k={P(f, c("nueve") - 8, 12, outBack)} size={92} />
        <g transform={`translate(${lerp(820, 820, 1)} ${lerp(420, 630, P(f, c("gorro") - 4, 18, inOut))}) scale(${pop(f, c("gorro") - 8)})`} opacity={Math.min(1, pop(f, c("gorro") - 8) * 1.5)}><Gorro /></g>
        <Chip x={820} y={730} texto="HACE 11 DÍAS" k={pop(f, c("once") - 4)} color={AMARILLO} size={24} />
      </g>
      <Chip x={540} y={640} texto="NACIÓ PREMATURA · 2017" k={pop(f, c("dosmil") - 14) * fv} size={26} />
      <text x="540" y="730" textAnchor="middle" fontFamily={F.mono} fontWeight={800} fontSize="28" fill={C.suave} letterSpacing="3" opacity={fade(f, c("dosmil") + 4) * fv}>2017 – 2026</text>
    </Lienzo>
  );
};

export const VIZ_INTERNACIONAL_8: Record<string, React.FC<VizProps>> = {
  cijbirmania: CIJBirmania,
  hegsethcaracas: HegsethCaracas,
  cop31borrador: COP31Borrador,
  falloseeuu: FallosEEUU,
  fionahipopotamo: FionaHipopotamo,
};
