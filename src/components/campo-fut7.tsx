// Campo de fut7 visto de cima, em pé: o gol da seleção embaixo e o ataque em cima.
// Medidas em metros (40 x 60), esticado pra ocupar o espaço do pai.
const LINHA = { fill: "none", stroke: "rgb(255 255 255 / 0.75)", strokeWidth: 0.3 };

export function CampoFut7({ className = "" }: { className?: string }) {
  const faixas = Array.from({ length: 10 }, (_, i) => i);

  return (
    <svg
      viewBox="0 0 40 60"
      preserveAspectRatio="none"
      className={className}
      aria-hidden
    >
      <defs>
        <radialGradient id="campo-luz" cx="50%" cy="45%" r="75%">
          <stop offset="0%" stopColor="rgb(255 255 255 / 0.12)" />
          <stop offset="100%" stopColor="rgb(0 0 0 / 0.35)" />
        </radialGradient>
      </defs>

      {/* Grama cortada em faixas */}
      {faixas.map((i) => (
        <rect key={i} x="0" y={i * 6} width="40" height="6" fill={i % 2 ? "#2f7a3c" : "#358745"} />
      ))}
      <rect width="40" height="60" fill="url(#campo-luz)" />

      <g {...LINHA}>
        <rect x="1.5" y="1.5" width="37" height="57" />
        <line x1="1.5" y1="30" x2="38.5" y2="30" />
        <circle cx="20" cy="30" r="5" />
        {/* Áreas de cima e de baixo */}
        <rect x="10" y="1.5" width="20" height="8" />
        <rect x="15" y="1.5" width="10" height="3" />
        <path d="M 16 9.5 A 4.5 4.5 0 0 0 24 9.5" />
        <rect x="10" y="50.5" width="20" height="8" />
        <rect x="15" y="55.5" width="10" height="3" />
        <path d="M 16 50.5 A 4.5 4.5 0 0 1 24 50.5" />
        {/* Gols */}
        <rect x="17" y="0.3" width="6" height="1.2" />
        <rect x="17" y="58.5" width="6" height="1.2" />
      </g>
      <g fill="rgb(255 255 255 / 0.75)">
        <circle cx="20" cy="30" r="0.4" />
        <circle cx="20" cy="7" r="0.3" />
        <circle cx="20" cy="53" r="0.3" />
      </g>
    </svg>
  );
}
