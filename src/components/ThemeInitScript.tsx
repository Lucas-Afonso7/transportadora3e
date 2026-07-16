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

export function ThemeInitScript() {
  return <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />;
}
