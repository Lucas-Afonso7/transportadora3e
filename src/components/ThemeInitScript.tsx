// Roda antes da primeira pintura (bloqueante, no <head>) pra decidir a
// classe "dark" no <html> antes do React hidratar. Sem isso, a página
// pisca no tema errado por uma fração de segundo (flash of wrong theme)
// toda vez que o cliente já tinha escolhido escuro.
const THEME_INIT_SCRIPT = `
(function () {
  try {
    var stored = localStorage.getItem("theme");
    var dark = stored ? stored === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches;
    if (dark) document.documentElement.classList.add("dark");
  } catch (e) {}
})();
`;

// nonce vem do header x-nonce que o proxy.ts gera por requisição — sem
// ele, a CSP (nonce-based, ver src/proxy.ts) bloqueia esse script inline
// igual bloquearia qualquer outro não autorizado.
export function ThemeInitScript({ nonce }: { nonce: string | null }) {
  return (
    <script
      nonce={nonce ?? undefined}
      dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }}
    />
  );
}
