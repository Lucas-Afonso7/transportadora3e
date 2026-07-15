// lucide-react removeu ícones de marca (Instagram, Facebook etc.) por
// questão de trademark — este é um traço genérico desenhado à mão no
// mesmo estilo (24x24, stroke 2, cantos arredondados) só pra manter a
// identidade visual consistente com os outros ícones do rodapé.
export function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}
