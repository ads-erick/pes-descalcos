// Símbolo da barra da camisa: disco com dois olhos inclinados e a boca.
// Azul no claro (com aro e furos brancos, pra aparecer na faixa azul) e dourado no escuro
export function Bardo({ className }: { className?: string }) {
  return (
    <svg viewBox="-100 -100 200 200" className={className} aria-hidden>
      <circle r="95" fill="var(--bardo)" stroke="var(--bardo-aro)" strokeWidth="10" />
      <g fill="var(--bardo-furo)">
        <ellipse cx="-42" cy="-24" rx="23" ry="15" transform="rotate(30 -42 -24)" />
        <ellipse cx="42" cy="-24" rx="23" ry="15" transform="rotate(-30 42 -24)" />
        <ellipse cx="0" cy="44" rx="16" ry="21" />
      </g>
    </svg>
  );
}
