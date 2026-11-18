import React from "react";
import { interpolate, staticFile, useCurrentFrame } from "remotion";
import { C, F, P, inOut, lerp, outBack, outCubic } from "../../theme";
import { Cifra, Lienzo, Sticker, fade, pop, type VizProps } from "./internacional";
import { Bolivia, Chequia, Dinamarca, EEUU, ElSalvador, Haiti, Mexico, Noruega } from "./banderas";

// Ilustraciones de la edición internacional del 18 nov 2026.
const FOTOS = "fotos/2026-11-18-int/";
const cuenta = (f: number, at: number, hasta: number, d = 22) =>
  Math.round(interpolate(f, [at, at + d], [0, hasta], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: outCubic }));
const fase = (f: number, a: number, b: number) => Math.min(P(f, a, 10), 1 - P(f, b, 10));
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
const Persona: React.FC<{ x: number; y: number; s?: number; color?: string; f: number; i: number; bandera?: React.ReactNode }> = ({ x, y, s = 1, color = C.claro, f, i, bandera }) => (
  <g transform={`translate(${x} ${y + Math.abs(Math.sin(f / 5 + i)) * -4}) scale(${s})`}>
    {bandera && (
      <g transform={`rotate(${Math.sin(f / 7 + i) * 8})`}>
        <line x1="16" y1="-6" x2="16" y2="-86" stroke={C.suave} strokeWidth="4" />
        <g transform="translate(16 -86)">{bandera}</g>
      </g>
    )}
    <circle cy="-24" r="12" fill={color} />
    <path d="M-19 14 a19 21 0 0 1 38 0 z" fill={color} />
  </g>
);

/* ---------- 1. México, Bolivia y EE. UU. pierden el estatus de libres de sarampión ---------- */
const Virus: React.FC<{ r: number; f: number }> = ({ r, f }) => (
  <g transform={`rotate(${f * 1.5})`}>
    {Array.from({ length: 10 }).map((_, i) => (
      <g key={i} transform={`rotate(${i * 36})`}>
        <line x1="0" y1={-r} x2="0" y2={-r - r * 0.35} stroke={ROJO} strokeWidth={r * 0.12} strokeLinecap="round" />
        <circle cy={-r - r * 0.4} r={r * 0.13} fill="#FF8A8D" />
      </g>
    ))}
    <circle r={r} fill={ROJO} stroke="#FFB3B5" strokeWidth={r * 0.08} />
    {[[-0.3, -0.25, 0.18], [0.3, 0.1, 0.14], [-0.1, 0.35, 0.12]].map(([x, y, rr], i) => <circle key={i} cx={x * r} cy={y * r} r={rr * r} fill="#B3262B" />)}
  </g>
);
export const Sarampion: React.FC<VizProps> = ({ c }) => {
  const f = useCurrentFrame();
  const a = 1 - P(f, c("pide") - 12, 10);
  const b = P(f, c("pide") - 6, 10);
  const banderas = [
    { cue: "mexico", x: 190, nombre: "MÉXICO", el: <g transform="translate(-100 -57)"><Mexico id="sm-mx" w={200} /></g> },
    { cue: "bolivia", x: 540, nombre: "BOLIVIA", el: <g transform="translate(-90 -60)"><Bolivia id="sm-bo" w={180} /></g> },
    { cue: "eeuu", x: 890, nombre: "EE. UU.", el: <g transform="translate(-100 -53)"><EEUU id="sm-us" w={200} /></g> },
  ];
  return (
    <Lienzo>
      {banderas.map((bd, i) => {
        const k = pop(f, c(bd.cue) - 6);
        const tacha = P(f, c(bd.cue) + 6, 10);
        return (
          <g key={bd.cue} transform={`translate(${bd.x} 140) scale(${k})`} opacity={Math.min(1, k * 1.5)}>
            {bd.el}
            <text y="100" textAnchor="middle" fontFamily={F.mono} fontWeight={800} fontSize="24" fill={C.blanco} letterSpacing="2">{bd.nombre}</text>
            {/* sello: ya no es libre */}
            <g transform={`rotate(-12) scale(${0.6 + 0.4 * tacha})`} opacity={tacha}>
              <rect x="-112" y="-24" width="224" height="48" rx="8" fill="rgba(11,18,32,0.75)" stroke={ROJO} strokeWidth="4" />
              <text y="9" textAnchor="middle" fontFamily={F.mono} fontWeight={800} fontSize="22" fill={ROJO} letterSpacing="1">NO ES LIBRE</text>
            </g>
          </g>
        );
      })}
      {/* Fase A: virus circulando 12 meses + 26 años */}
      <g opacity={a}>
        <g transform={`translate(300 470) scale(${pop(f, c("meses") - 14, 14)})`}>
          <circle r="150" fill="none" stroke={C.suave} strokeOpacity="0.4" strokeWidth="3" strokeDasharray="6 10" />
          <circle r="150" fill="none" stroke={ROJO} strokeWidth="8" strokeLinecap="round" strokeDasharray={`${942 * P(f, c("meses") - 10, 40, inOut)} 942`} transform="rotate(-90)" />
          {Array.from({ length: 12 }).map((_, i) => <line key={i} x1="0" y1="-132" x2="0" y2="-120" stroke={C.suave} strokeWidth="4" transform={`rotate(${i * 30})`} />)}
          <Virus r={48} f={f} />
        </g>
        <Cifra x={760} y={440} valor={`${cuenta(f, c("meses") - 6, 12, 18)} MESES`} rotulo="DE CONTAGIO CONTINUO" k={P(f, c("meses") - 8, 12, outBack)} size={96} />
        <Chip x={760} y={600} texto={`EE. UU.: ${cuenta(f, c("llevaba") - 4, 26, 16)} AÑOS LIBRE`} k={pop(f, c("llevaba") - 6)} color={AMARILLO} size={24} />
      </g>
      {/* Fase B: vacunación */}
      <g opacity={b}>
        <g transform={`translate(310 480) rotate(-35) scale(${pop(f, c("pide") - 4, 14)})`}>
          <rect x="-150" y="-30" width="230" height="60" rx="10" fill={C.grisClaro} stroke={C.claro} strokeWidth="4" />
          <rect x="-146" y="-26" width={lerp(0, 160, P(f, c("dosis") - 20, 30))} height="52" rx="8" fill={C.celeste} />
          <rect x="80" y="-40" width="16" height="80" rx="4" fill={C.suave} />
          <rect x="96" y="-10" width="70" height="20" fill={C.suave} />
          <rect x="166" y="-26" width="16" height="52" rx="4" fill={C.claro} />
          <path d="M-150 -8 L-230 0 L-150 8 Z" fill={C.claro} />
          {[-110, -70, -30, 10, 50].map((x) => <line key={x} x1={x} y1="-30" x2={x} y2="-12" stroke={C.marino} strokeWidth="4" />)}
        </g>
        <g transform={`translate(790 460) scale(${pop(f, c("porciento") - 8, 14)})`}>
          <circle r="140" fill="none" stroke="rgba(127,184,230,0.25)" strokeWidth="26" />
          <circle r="140" fill="none" stroke={C.menta} strokeWidth="26" strokeLinecap="round" strokeDasharray={`${880 * 0.95 * P(f, c("porciento") - 4, 30, inOut)} 880`} transform="rotate(-90)" />
          <text y="20" textAnchor="middle" fontFamily={F.exo} fontWeight={900} fontSize="88" fill={C.blanco}>{cuenta(f, c("porciento") - 4, 95, 30)}%</text>
          <text y="70" textAnchor="middle" fontFamily={F.mono} fontWeight={700} fontSize="22" fill={C.suave} letterSpacing="2">COBERTURA</text>
        </g>
        <Chip x={540} y={710} texto="2 DOSIS" k={pop(f, c("dosis") - 6)} color={C.menta} size={30} />
      </g>
    </Lienzo>
  );
};

/* ---------- 2. Ciberataque masivo a casi 200 sitios web ---------- */
const Ventana: React.FC<{ rojo: number }> = ({ rojo }) => (
  <g>
    <rect width="96" height="70" rx="8" fill={rojo > 0.5 ? "#3A1418" : "#123B6B"} stroke={rojo > 0.5 ? ROJO : C.suave} strokeWidth="2.5" />
    <rect width="96" height="16" rx="8" fill={rojo > 0.5 ? ROJO : C.suave} opacity="0.8" />
    {[12, 24, 36].map((x) => <circle key={x} cx={x} cy="8" r="3" fill={C.marinoOsc} />)}
    <rect x="12" y="28" width="56" height="7" rx="3" fill={C.claro} opacity="0.6" />
    <rect x="12" y="42" width="72" height="7" rx="3" fill={C.claro} opacity="0.4" />
    {rojo > 0.5 && <text x="80" y="62" textAnchor="middle" fontFamily={F.exo} fontWeight={900} fontSize="22" fill={ROJO}>!</text>}
  </g>
);
export const Ciberataque: React.FC<VizProps> = ({ c }) => {
  const f = useCurrentFrame();
  const a = 1 - P(f, c("atacantes") - 10, 10);
  const b = fase(f, c("atacantes") - 4, c("bloqueo") - 12);
  const d = P(f, c("bloqueo") - 8, 12);
  const LOGOS = [
    { cue: "bbc", src: "logo-bbc.png", x: 190, w: 240, h: 69, card: false },
    { cue: "ikea", src: "logo-ikea.png", x: 540, w: 220, h: 79, card: false },
    { cue: "airfrance", src: "logo-airfrance.png", x: 890, w: 260, h: 25, card: true },
  ];
  return (
    <Lienzo>
      {/* Fase A: sitios que se infectan + logos */}
      <g opacity={a}>
        {Array.from({ length: 24 }).map((_, i) => {
          const col = i % 8, row = Math.floor(i / 8);
          const k = pop(f, 4 + i * 1.5, 10);
          const rojo = P(f, c("ciber") + 10 + ((i * 7) % 24) * 2, 6);
          return <g key={i} transform={`translate(${40 + col * 128} ${30 + row * 96}) scale(${k})`} opacity={Math.min(1, k * 1.5)}><Ventana rojo={rojo} /></g>;
        })}
        <Cifra x={540} y={430} valor={`CASI ${cuenta(f, c("sitios") - 6, 200, 20)}`} rotulo="SITIOS WEB AFECTADOS" k={P(f, c("sitios") - 8, 12, outBack)} size={100} />
        {LOGOS.map((l) => {
          const k = pop(f, c(l.cue) - 6);
          return (
            <g key={l.cue} transform={`translate(${l.x} 610) scale(${k})`} opacity={Math.min(1, k * 1.5)}>
              <rect x={-l.w / 2 - 22} y={-62} width={l.w + 44} height={124} rx="20" fill={l.card ? "#FFFFFF" : "rgba(14,44,82,0.94)"} stroke={ROJO} strokeWidth="4" filter="drop-shadow(0 10px 20px rgba(0,0,0,0.45))" />
              <image href={staticFile(FOTOS + l.src)} x={-l.w / 2} y={-l.h / 2} width={l.w} height={l.h} />
            </g>
          );
        })}
      </g>
      {/* Fase B: código malicioso que roba tarjetas y criptomonedas */}
      <g opacity={b}>
        <g transform={`translate(40 120) scale(${pop(f, c("atacantes") - 2, 14)})`}>
          <rect width="520" height="420" rx="20" fill="#0B1220" stroke={ROJO} strokeWidth="3" />
          <rect width="520" height="44" rx="20" fill={ROJO} opacity="0.85" />
          <text x="24" y="30" fontFamily={F.mono} fontWeight={800} fontSize="22" fill={C.blanco} letterSpacing="2">{"</> CÓDIGO MALICIOSO"}</text>
          {["<script>", "  steal(card);", "  wallet.drain();", "  send(attacker);", "</script>"].map((l, i) => {
            const n = Math.max(0, Math.min(l.length, Math.floor((f - c("codigo") + 4 - i * 10) * 0.9)));
            return <text key={i} x="28" y={100 + i * 60} fontFamily={F.mono} fontWeight={700} fontSize="28" fill={i % 4 === 0 ? C.suave : "#FF8A8D"} xmlSpace="preserve">{l.slice(0, n)}{n < l.length && n > 0 && f % 16 < 8 ? "▌" : ""}</text>;
          })}
        </g>
        {/* tarjeta */}
        <g transform={`translate(820 220) rotate(-8) scale(${pop(f, c("tarjetas") - 6)})`}>
          <rect x="-150" y="-92" width="300" height="184" rx="20" fill="#1F3A5C" stroke={C.claro} strokeWidth="4" />
          <rect x="-150" y="-50" width="300" height="34" fill={C.marinoOsc} />
          <rect x="-120" y="10" width="54" height="40" rx="6" fill={AMARILLO} />
          <text x="-126" y="78" fontFamily={F.mono} fontWeight={800} fontSize="18" fill={C.claro} letterSpacing="1">•••• •••• •••• 4821</text>
        </g>
        {/* criptomoneda */}
        <g transform={`translate(840 470) scale(${pop(f, c("cripto") - 6)}) rotate(${Math.sin(f / 8) * 8})`}>
          <circle r="90" fill={AMARILLO} stroke="#FFF0C2" strokeWidth="6" />
          <circle r="70" fill="none" stroke="#B5831A" strokeWidth="4" />
          <text y="34" textAnchor="middle" fontFamily={F.exo} fontWeight={900} fontSize="100" fill="#8A5A00">₿</text>
        </g>
        <Chip x={830} y={650} texto="ROBO DE DATOS" k={pop(f, c("cripto") + 6)} color={ROJO} size={26} />
      </g>
      {/* Fase C: falla bloqueada */}
      <g opacity={d}>
        <g transform={`translate(540 360) scale(${P(f, c("bloqueo") - 8, 14, outBack)})`}>
          <path d="M0 -190 L160 -130 V10 Q160 140 0 210 Q-160 140 -160 10 V-130 Z" fill="rgba(92,203,155,0.18)" stroke={C.menta} strokeWidth="8" />
          <path d={`M-70 10 L-20 60 L80 -50`} fill="none" stroke={C.menta} strokeWidth="22" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="240" strokeDashoffset={240 * (1 - P(f, c("bloqueo"), 14))} />
        </g>
        <Chip x={540} y={680} texto="FALLA BLOQUEADA" k={pop(f, c("bloqueo") + 4)} color={C.menta} size={30} />
      </g>
    </Lienzo>
  );
};

/* ---------- 3. Haitianos marchan en apoyo a Bukele ---------- */
export const HaitiBukele: React.FC<VizProps> = ({ c }) => {
  const f = useCurrentFrame();
  const k = pop(f, 6, 16);
  const marcha = P(f, c("haitianos") - 4, 70, inOut);
  return (
    <Lienzo>
      <g transform={`translate(560 70) scale(${pop(f, 4)})`}><g transform="translate(-90 -54)"><Haiti id="hb-ht" w={180} /></g></g>
      <g transform={`translate(860 70) scale(${pop(f, c("bukele") - 4)})`}><g transform="translate(-90 -54)"><ElSalvador id="hb-sv" w={180} /></g></g>
      <path d="M690 70 h40" stroke={C.suave} strokeWidth="4" opacity={fade(f, c("bukele"))} />
      <Sticker src={FOTOS + "bukele.png"} id="bukele" x={0} y={240} w={420} h={560} k={k} opacity={Math.min(1, k * 2)} fadeBottom />
      {/* multitud con banderas de Haití */}
      <g opacity={fade(f, c("haitianos") - 6)}>
        <rect x="440" y="370" width="620" height="6" rx="3" fill={C.suave} opacity="0.4" />
        {Array.from({ length: 12 }).map((_, i) => {
          const x = lerp(1120, 470, marcha) + (i % 6) * 100 + Math.floor(i / 6) * 50;
          const y = 360 - Math.floor(i / 6) * 34;
          return x < 1070 ? <Persona key={i} x={x} y={y} s={0.95 - Math.floor(i / 6) * 0.1} f={f} i={i} color={i % 3 ? C.claro : C.suave} bandera={i % 2 === 0 ? <Haiti id={`hb-p${i}`} w={44} /> : undefined} /> : null;
        })}
      </g>
      <Chip x={750} y={470} texto="APOYO A BUKELE" k={pop(f, c("bukele") - 2)} color={AMARILLO} size={26} />
      <Chip x={750} y={550} texto="SOLDADOS VS. PANDILLAS" k={pop(f, c("soldados") - 2)} size={22} />
      <Chip x={750} y={630} texto="MISIÓN SIN FECHA DE FIN" k={pop(f, c("continuidad") - 4)} color={ROJO} size={22} />
      <Chip x={750} y={710} texto="AMNISTÍA: RESPETAR DD. HH." k={pop(f, c("amnistia") - 4)} color={C.menta} size={21} />
    </Lienzo>
  );
};

/* ---------- 4. Choque de trenes en Praga ---------- */
const Tren: React.FC<{ color: string; flip?: boolean }> = ({ color, flip }) => (
  <g transform={flip ? "scale(-1 1)" : undefined}>
    <path d="M-300 -70 H0 Q60 -70 70 0 V20 H-300 Z" fill={color} stroke={C.claro} strokeWidth="4" />
    {[-270, -200, -130, -60].map((x) => <rect key={x} x={x} y="-54" width="50" height="34" rx="6" fill={C.marinoOsc} opacity="0.85" />)}
    <path d="M10 -54 H40 Q55 -50 58 -20 H10 Z" fill={C.marinoOsc} opacity="0.85" />
    <rect x="-300" y="-6" width="370" height="8" fill="#FFFFFF" opacity="0.7" />
    {[-260, -200, -60, 0].map((x) => <circle key={x} cx={x} cy="26" r="13" fill="#1F2937" stroke={C.suave} strokeWidth="3" />)}
  </g>
);
export const TrenesPraga: React.FC<VizProps> = ({ c }) => {
  const f = useCurrentFrame();
  const t = P(f, c("chocaron") - 30, 30, (x) => x * x);
  const golpe = f >= c("chocaron");
  const sacude = golpe ? Math.sin(f * 2.2) * 6 * (1 - P(f, c("chocaron"), 18)) : 0;
  const boom = P(f, c("chocaron"), 14, outBack);
  return (
    <Lienzo>
      <g transform={`translate(70 60) scale(${pop(f, c("checa") - 6)})`}><Chequia id="tp-cz" w={150} /></g>
      <text x="250" y="110" fontFamily={F.exo} fontWeight={900} fontSize="52" fill={C.blanco} opacity={fade(f, c("checa"))}>PRAGA</text>
      {/* vía y puente */}
      <g opacity={fade(f, 4)}>
        <rect x="0" y="378" width="1080" height="10" fill={C.suave} />
        {Array.from({ length: 28 }).map((_, i) => <rect key={i} x={i * 40} y="388" width="22" height="12" fill={C.suave} opacity="0.5" />)}
        <path d="M320 400 Q540 470 760 400" fill="none" stroke={C.suave} strokeWidth="6" opacity="0.6" />
        {[380, 460, 540, 620, 700].map((x) => <line key={x} x1={x} y1="400" x2={x} y2={400 + 30 - Math.abs(x - 540) / 10} stroke={C.suave} strokeWidth="4" opacity="0.6" />)}
      </g>
      <g transform={`translate(${lerp(-140, 470, t) + sacude} 350)`}><Tren color="#1F6FB5" /></g>
      <g transform={`translate(${lerp(1220, 610, t) - sacude} 350)`}><Tren color={ROJO} flip /></g>
      {golpe && (
        <g transform={`translate(540 320) scale(${boom})`} opacity={1 - P(f, c("chocaron") + 20, 16)}>
          <path d="M0 -110 L26 -40 L100 -60 L50 0 L110 40 L36 44 L30 120 L-6 56 L-80 100 L-50 30 L-120 0 L-48 -26 L-80 -90 L-20 -50 Z" fill={AMARILLO} stroke="#FFF0C2" strokeWidth="5" />
        </g>
      )}
      <Cifra x={280} y={620} valor={`${cuenta(f, c("heridos") - 6, 46, 18)}`} rotulo="HERIDOS" k={P(f, c("heridos") - 8, 12, outBack)} size={140} />
      <Chip x={280} y={745} texto="4 GRAVES" k={pop(f, c("graves") - 6)} color={ROJO} size={26} />
      {/* semáforo */}
      <g transform={`translate(780 640) scale(${pop(f, c("senal") - 8)})`}>
        <rect x="-8" y="0" width="16" height="140" fill={C.suave} />
        <rect x="-40" y="-150" width="80" height="160" rx="16" fill="#0B1220" stroke={C.claro} strokeWidth="4" />
        <circle cy="-110" r="26" fill={ROJO} opacity={f % 20 < 12 ? 1 : 0.35} />
        <circle cy="-40" r="26" fill="#2A3A4F" />
      </g>
      <Chip x={930} y={560} texto="SEÑAL" k={pop(f, c("senal") - 2)} color={ROJO} size={22} />
      <Chip x={930} y={630} texto="IGNORADA" k={pop(f, c("senal") + 4)} color={ROJO} size={22} />
      <Chip x={930} y={720} texto="EN INVESTIGACIÓN" k={pop(f, c("investigan") - 4)} size={18} />
    </Lienzo>
  );
};

/* ---------- 5. Haaland y la remontada de Noruega ---------- */
export const NoruegaRemonta: React.FC<VizProps> = ({ c }) => {
  const f = useCurrentFrame();
  const marc = pop(f, c("noruega") - 6, 14);
  const nor = f < c("haaland") - 6 ? 0 : f < c("tres") - 4 ? 2 : 3;
  const vs = f < c("perdia") - 6;
  const cambio = P(f, c("tres") - 4, 10, outBack);
  const k = pop(f, c("haaland") - 10, 16);
  const tiro = P(f, c("penal"), 16, inOut);
  return (
    <Lienzo>
      {/* marcador */}
      <g transform={`translate(540 110) scale(${marc})`} opacity={Math.min(1, marc * 1.5)}>
        <rect x="-470" y="-80" width="940" height="160" rx="28" fill="rgba(14,44,82,0.94)" stroke={C.suave} strokeWidth="3" />
        <g transform="translate(-440 -46)"><Dinamarca id="nr-dk" w={120} /></g>
        <text x="-290" y="12" fontFamily={F.exo} fontWeight={900} fontSize="36" fill={C.blanco}>DIN</text>
        <text x="-60" y="34" textAnchor="middle" fontFamily={F.exo} fontWeight={900} fontSize="100" fill={C.blanco}>{vs ? "" : 2}</text>
        <text y={vs ? 18 : 26} textAnchor="middle" fontFamily={F.exo} fontWeight={900} fontSize={vs ? 44 : 60} fill={C.suave}>{vs ? "VS" : "–"}</text>
        <g transform={`translate(60 34) scale(${nor === 3 ? 0.7 + 0.3 * cambio : 1})`}>
          <text textAnchor="middle" fontFamily={F.exo} fontWeight={900} fontSize="100" fill={nor === 3 ? C.menta : C.blanco}>{vs ? "" : nor}</text>
        </g>
        <text x="290" y="12" textAnchor="end" fontFamily={F.exo} fontWeight={900} fontSize="36" fill={C.blanco}>NOR</text>
        <g transform="translate(320 -44)"><Noruega id="nr-no" w={120} /></g>
        <text y="66" textAnchor="middle" fontFamily={F.mono} fontWeight={700} fontSize="20" fill={C.suave} letterSpacing="2" opacity={fade(f, c("copenhague") - 4)}>COPENHAGUE · FINAL</text>
      </g>
      <Sticker src={FOTOS + "haaland.png"} id="haaland" x={0} y={300} w={600} h={395} k={k} opacity={Math.min(1, k * 2)} />
      {/* portería y penal */}
      <g transform={`translate(840 400) scale(${pop(f, c("penal") - 10)})`}>
        <path d="M-160 80 V-80 H160 V80" fill="none" stroke={C.blanco} strokeWidth="8" />
        {Array.from({ length: 9 }).map((_, i) => <line key={`v${i}`} x1={-160 + i * 40} y1="-80" x2={-160 + i * 40} y2="80" stroke={C.suave} strokeWidth="1.5" opacity="0.5" />)}
        {Array.from({ length: 4 }).map((_, i) => <line key={`h${i}`} x1="-160" y1={-80 + i * 40} x2="160" y2={-80 + i * 40} stroke={C.suave} strokeWidth="1.5" opacity="0.5" />)}
        <g transform={`translate(${lerp(-40, 110, tiro)} ${lerp(150, -40, tiro)}) scale(${lerp(1.3, 0.8, tiro)}) rotate(${f * 12})`}>
          <circle r="22" fill="#FFFFFF" stroke="#0B1220" strokeWidth="2" />
          <path d="M0 -8 L8 -2 L5 8 H-5 L-8 -2 Z" fill="#0B1220" />
        </g>
        <text y="150" textAnchor="middle" fontFamily={F.exo} fontWeight={900} fontSize="44" fill={AMARILLO} opacity={P(f, c("penal") + 14, 8)}>¡GOL! 90+</text>
      </g>
      <Chip x={840} y={720} texto="A CUARTOS DE FINAL" k={pop(f, c("cuartos") - 6)} color={C.menta} size={24} />
    </Lienzo>
  );
};

export const VIZ_INTERNACIONAL_7: Record<string, React.FC<VizProps>> = {
  sarampion: Sarampion,
  ciberataque: Ciberataque,
  haitibukele: HaitiBukele,
  trenespraga: TrenesPraga,
  noruegaremonta: NoruegaRemonta,
};
