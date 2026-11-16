import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { C, F, P, inOut, lerp, outBack, outCubic } from "../../theme";
import { Cifra, Lienzo, Sticker, fade, pop, type VizProps } from "./internacional";
import { Barein, China, EEUU, Espana, Iran as BanderaIran, Peru, Rusia, Ucrania } from "./banderas";

// Ilustraciones de la edición internacional del 16 nov 2026.
const FOTOS = "fotos/2026-11-16-int/";
const cuenta = (f: number, at: number, hasta: number, d = 22) =>
  Math.round(interpolate(f, [at, at + d], [0, hasta], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: outCubic }));

const Chip: React.FC<{ x: number; y: number; texto: string; k: number; color?: string; size?: number }> = ({ x, y, texto, k, color = C.blanco, size = 26 }) => {
  const w = texto.length * size * 0.66 + 56;
  return (
    <g transform={`translate(${x} ${y}) scale(${k})`} opacity={Math.min(1, k * 1.5)}>
      <rect x={-w / 2} y={-size - 4} width={w} height={size * 2 + 8} rx={size + 4} fill="rgba(14,44,82,0.94)" stroke={C.suave} strokeWidth="2.5" />
      <text y={size * 0.36} textAnchor="middle" fontFamily={F.mono} fontWeight={800} fontSize={size} fill={color} letterSpacing="1.5">{texto}</text>
    </g>
  );
};
const Bandera: React.FC<{ x: number; y: number; k: number; w: number; h: number; children: React.ReactNode }> = ({ x, y, k, w, h, children }) => (
  <g transform={`translate(${x} ${y}) scale(${k}) translate(${-w / 2} ${-h / 2})`} opacity={Math.min(1, k * 1.5)}>{children}</g>
);
const Dron: React.FC<{ color?: string }> = ({ color = C.suave }) => <path d="M-26 0 L18 -12 L12 0 L18 12 Z" fill={color} stroke={C.marinoOsc} strokeWidth="2" />;

/* ---------- 1. Primera cumbre Trump–Xi–Putin ---------- */
export const CumbreTres: React.FC<VizProps> = ({ c }) => {
  const f = useCurrentFrame();
  const mesa = pop(f, 6, 16);
  const tr = P(f, c("trump") - 6, 16, outCubic);
  const pu = P(f, c("putin") - 6, 16, outCubic);
  const gira = f * 0.6;
  return (
    <Lienzo>
      {/* mesa redonda con las tres banderas */}
      <g transform={`translate(540 230) scale(${mesa})`} opacity={Math.min(1, mesa * 1.5)}>
        <circle r="120" fill="#12345E" stroke={C.celeste} strokeWidth="5" />
        <circle r="138" fill="none" stroke={C.suave} strokeOpacity="0.5" strokeWidth="3" strokeDasharray="6 12" transform={`rotate(${gira})`} />
        <text y="-6" textAnchor="middle" fontFamily={F.exo} fontWeight={900} fontSize="44" fill={C.blanco}>1.ª</text>
        <text y="30" textAnchor="middle" fontFamily={F.mono} fontWeight={800} fontSize="18" fill={C.suave} letterSpacing="2">CUMBRE A TRES</text>
      </g>
      <Bandera x={300} y={150} k={pop(f, c("trump") - 2)} w={150} h={79}><EEUU id="us16" w={150} /></Bandera>
      <Bandera x={540} y={60} k={pop(f, c("xi") - 2)} w={130} h={87}><China id="cn16" w={130} /></Bandera>
      <Bandera x={780} y={150} k={pop(f, c("putin") - 2)} w={140} h={93}><Rusia id="ru16" w={140} /></Bandera>
      <Chip x={540} y={420} texto="SHENZHEN · JUEVES 19" k={pop(f, c("shenzhen") - 4)} color="#F2B544" size={24} />
      <Sticker src={FOTOS + "trump.png"} id="trump16" x={lerp(-460, 20, tr)} y={470} w={420} h={329} k={1} opacity={tr} fadeBottom />
      <Sticker src={FOTOS + "putin.png"} id="putin16" x={lerp(1100, 580, pu)} y={440} w={400} h={341} k={1} opacity={pu} fadeBottom />
    </Lienzo>
  );
};

/* ---------- 2. Ataque récord de drones de Ucrania contra Rusia (motion graphics) ---------- */
export const DronesRecord: React.FC<VizProps> = ({ c }) => {
  const f = useCurrentFrame();
  const at = c("ataque");
  const puente = c("puente");
  const boom = P(f, puente, 3) * (1 - P(f, puente + 4, 16));
  return (
    <Lienzo>
      <Bandera x={170} y={80} k={pop(f, 4)} w={170} h={113}><Ucrania id="ua16" w={170} /></Bandera>
      <Bandera x={910} y={80} k={pop(f, 8)} w={150} h={100}><Rusia id="ru16b" w={150} /></Bandera>
      <text x="170" y="170" textAnchor="middle" fontFamily={F.mono} fontWeight={800} fontSize="22" fill={C.suave} letterSpacing="2" opacity={fade(f, 6)}>UCRANIA</text>
      <text x="910" y="170" textAnchor="middle" fontFamily={F.mono} fontWeight={800} fontSize="22" fill={C.suave} letterSpacing="2" opacity={fade(f, 8)}>RUSIA</text>
      {/* enjambre de drones */}
      {Array.from({ length: 34 }).map((_, i) => {
        const per = 60 + (i % 7) * 8;
        const u = (((f - at) / per + i / 34) % 1 + 1) % 1;
        const y = 200 + ((i * 53) % 300);
        if (f < at - 10) return null;
        const derribado = i % 5 === 0 && u > 0.7;
        return (
          <g key={i} transform={`translate(${lerp(160, 960, u)} ${y + Math.sin(u * 9 + i) * 10})`} opacity={fade(f, at - 10) * Math.min(1, (1 - u) * 6)}>
            {derribado ? <circle r={10 + (u - 0.7) * 60} fill="#F2B544" opacity={1 - (u - 0.7) * 3} /> : <Dron />}
          </g>
        );
      })}
      {/* puente de Crimea */}
      <g transform="translate(540 560)" opacity={fade(f, puente - 14)}>
        <path d="M-300 30 H300" stroke={C.claro} strokeWidth="10" />
        {[-240, -120, 0, 120, 240].map((x) => <g key={x}><path d={`M${x - 60} 30 Q${x} -30 ${x + 60} 30`} fill="none" stroke={C.claro} strokeWidth="5" /><line x1={x} x2={x} y1="30" y2="80" stroke={C.claro} strokeWidth="6" /></g>)}
        <circle cx="60" cy="10" r={20 + 80 * boom} fill="#F2B544" opacity={boom * 0.85} />
        <text y="120" textAnchor="middle" fontFamily={F.mono} fontWeight={800} fontSize="22" fill={C.suave} letterSpacing="2">PUENTE DE CRIMEA</text>
      </g>
      <Cifra x={300} y={760} valor={cuenta(f, c("cifra") - 4, 1336).toLocaleString("en-US")} rotulo="DRONES, SEGÚN MOSCÚ" k={P(f, c("cifra") - 8, 12, outBack)} size={100} />
      <Chip x={790} y={735} texto="16 REGIONES" k={pop(f, c("regiones") - 2)} />
    </Lienzo>
  );
};

/* ---------- 3. Irán vuelve a atacar Baréin (motion graphics) ---------- */
export const BareinDrones: React.FC<VizProps> = ({ c }) => {
  const f = useCurrentFrame();
  const at = c("ataco");
  const inter = c("interceptaron");
  const hunde = P(f, c("hundio") - 4, 40, inOut);
  return (
    <Lienzo>
      <Bandera x={200} y={110} k={pop(f, 4)} w={190} h={109}><BanderaIran id="ir16" w={190} /></Bandera>
      <Bandera x={880} y={110} k={pop(f, 8)} w={170} h={102}><Barein id="bh16" w={170} /></Bandera>
      <Chip x={540} y={110} texto="2.º ATAQUE EN 3 DÍAS" k={pop(f, c("segunda") - 2)} color="#F2B544" size={22} />
      {/* drones que cruzan y son interceptados */}
      {Array.from({ length: 6 }).map((_, i) => {
        const u = P(f, at + i * 4, 50, inOut);
        const x = lerp(240, 840, u), y = 230 + i * 34 - 80 * Math.sin(Math.PI * u);
        const boom = f >= inter + i * 2 ? P(f, inter + i * 2, 3) * (1 - P(f, inter + i * 2 + 4, 12)) : 0;
        const vivo = f < inter + i * 2;
        return (
          <g key={i} transform={`translate(${Math.min(x, 720)} ${y})`} opacity={fade(f, at + i * 4)}>
            {vivo ? <Dron color="#E5E7EB" /> : <circle r={10 + 50 * boom} fill="#F2B544" opacity={boom} />}
          </g>
        );
      })}
      <Chip x={790} y={420} texto="INTERCEPTADOS" k={pop(f, inter + 6)} color="#5CCB9B" size={24} />
      {/* superpetrolero que se hunde (versión de Irán) */}
      <g opacity={fade(f, c("hundio") - 12)}>
        {[0, 1].map((k) => (
          <path key={k} d={`M80 ${620 + k * 30} ${Array.from({ length: 15 }).map((_, i) => `q 32 ${(i % 2 ? 1 : -1) * 10} 64 0`).join(" ")}`} fill="none" stroke={C.celeste} strokeOpacity={0.5 - k * 0.15} strokeWidth="5" transform={`translate(${((f * (1.5 + k)) % 128) - 64} 0)`} />
        ))}
        <clipPath id="mar16"><rect x="0" y="0" width="1080" height="625" /></clipPath>
        <g clipPath="url(#mar16)">
          <g transform={`translate(${380} ${600 + hunde * 90}) rotate(${hunde * 16})`}>
            <path d="M-170 -10 H170 L140 30 H-150 Z" fill="#12345E" stroke={C.celeste} strokeWidth="5" />
            <rect x="-130" y="-30" width="210" height="20" rx="4" fill="#9AA7B8" />
            <rect x="100" y="-70" width="44" height="60" rx="6" fill={C.grisClaro} />
          </g>
        </g>
        <Chip x={780} y={600} texto="SEGÚN IRÁN" k={pop(f, c("hundio"))} color="#F2B544" size={22} />
      </g>
    </Lienzo>
  );
};

/* ---------- 4. León XIV se despide de Perú ---------- */
export const PapaDespedida: React.FC<VizProps> = ({ c }) => {
  const f = useCurrentFrame();
  const k = P(f, 4, 18, outBack);
  const cita = P(f, c("mensaje") - 4, 14, outCubic);
  return (
    <Lienzo>
      <Sticker src={FOTOS + "papa.png"} id="papa16" x={10} y={260} w={590} h={399} k={k} opacity={Math.min(1, k * 2)} fadeBottom />
      <Bandera x={810} y={110} k={pop(f, c("peru") - 4)} w={180} h={120}><Peru id="pe16" w={180} /></Bandera>
      <Cifra x={790} y={330} valor={`${(1.5 * P(f, c("fieles") - 4, 24, outCubic)).toFixed(1)} M`} rotulo="FIELES, SEGÚN EL VATICANO" k={P(f, c("fieles") - 8, 12, outBack)} size={100} />
      {/* cita del mensaje */}
      <g transform={`translate(${lerp(1200, 780, cita)} 540)`} opacity={cita}>
        <rect x="-190" y="-90" width="380" height="180" rx="24" fill="rgba(14,44,82,0.95)" stroke={C.celeste} strokeWidth="3" />
        <text x="-160" y="-40" fontFamily={F.exo} fontWeight={900} fontSize="60" fill={C.celeste}>«</text>
        {["Los únicos que no", "pueden esperar son", "los pobres»"].map((l, i) => (
          <text key={i} x="-140" y={-26 + i * 40} fontFamily={F.exo} fontWeight={800} fontSize="30" fill={C.blanco}>{l}</text>
        ))}
      </g>
      {/* avión que despega */}
      <g transform={`translate(${lerp(560, 1000, P(f, c("mensaje") + 40, 40, inOut))} ${lerp(720, 640, P(f, c("mensaje") + 40, 40, inOut))}) rotate(-12)`} opacity={fade(f, c("mensaje") + 30)}>
        <path d="M-34 0 L30 -6 Q42 0 30 6 Z M-6 -2 L-20 -30 L-10 -30 L12 -3 Z M-6 2 L-20 30 L-10 30 L12 3 Z M-30 0 L-40 -14 L-34 -14 L-22 -1 Z" fill={C.claro} transform="scale(1.3)" />
      </g>
    </Lienzo>
  );
};

/* ---------- 5. Récord de migrantes en Canarias (motion graphics) ---------- */
export const Canarias: React.FC<VizProps> = ({ c }) => {
  const f = useCurrentFrame();
  const at = c("canarias");
  const islas: [number, number, number][] = [[560, 230, 40], [660, 250, 30], [760, 230, 34], [860, 210, 28], [470, 270, 22], [400, 300, 18], [940, 190, 24]];
  return (
    <Lienzo>
      <Bandera x={170} y={90} k={pop(f, 4)} w={160} h={107}><Espana id="es16" w={160} /></Bandera>
      {/* costa africana y océano */}
      <path d="M1040 300 Q980 420 1000 560 Q1010 680 960 800 L1080 800 L1080 300 Z" fill="#1F3A5C" stroke={C.claro} strokeOpacity="0.5" strokeWidth="2" opacity={fade(f, 4)} />
      <text x="1000" y="620" textAnchor="middle" fontFamily={F.mono} fontWeight={700} fontSize="20" fill={C.suave} letterSpacing="2" opacity={fade(f, 4)} transform="rotate(-80 1000 620)">ÁFRICA</text>
      {islas.map(([x, y, r], i) => (
        <g key={i} opacity={pop(f, at - 6 + i * 2)}>
          <ellipse cx={x} cy={y} rx={r} ry={r * 0.6} fill="#2F5A3F" stroke={C.claro} strokeWidth="2" />
        </g>
      ))}
      <text x="660" y="170" textAnchor="middle" fontFamily={F.mono} fontWeight={800} fontSize="26" fill={C.blanco} letterSpacing="2" opacity={fade(f, at)}>ISLAS CANARIAS</text>
      {/* 14 cayucos que llegan */}
      {Array.from({ length: 14 }).map((_, i) => {
        const u = P(f, c("embarcaciones") - 30 + i * 3, 60, inOut);
        const x0 = 820 + (i % 4) * 40, y0 = 680 - Math.floor(i / 4) * 40;
        const x = lerp(x0, 380 + (i % 7) * 70, u), y = lerp(y0, 340 + Math.floor(i / 7) * 34, u);
        return (
          <g key={i} transform={`translate(${x} ${y + Math.sin(f / 6 + i) * 3})`} opacity={fade(f, c("embarcaciones") - 30 + i * 3)}>
            <path d="M-24 0 H24 L16 10 H-16 Z" fill="#E5E7EB" />
            {[-12, -4, 4, 12].map((dx) => <circle key={dx} cx={dx} cy="-5" r="3.5" fill="#F2B544" />)}
          </g>
        );
      })}
      <Cifra x={300} y={600} valor={`~${cuenta(f, c("cifra") - 4, 1500).toLocaleString("en-US")}`} rotulo="MIGRANTES EN UN DÍA" k={P(f, c("cifra") - 8, 12, outBack)} size={100} />
      <Chip x={300} y={720} texto="14 EMBARCACIONES" k={pop(f, c("embarcaciones") - 2)} />
    </Lienzo>
  );
};

export const VIZ_INTERNACIONAL_6: Record<string, React.FC<VizProps>> = {
  cumbretres: CumbreTres,
  dronesrecord: DronesRecord,
  bareindrones: BareinDrones,
  papadespedida: PapaDespedida,
  canarias: Canarias,
};
