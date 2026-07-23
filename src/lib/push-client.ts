// Utilitários de push que rodam só no navegador. Nada aqui usa a Web
// Notification API "solta" (isso já existe em notifications-client.ts,
// funciona só com a aba aberta) — isto aqui é Web Push de verdade, entregue
// pelo navegador/SO mesmo com o site fechado.

// applicationServerKey do PushManager.subscribe() precisa de Uint8Array,
// não da string base64url que a VAPID pública é — conversão padrão.
function urlBase64ToUint8Array(base64: string): Uint8Array<ArrayBuffer> {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const base64Safe = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64Safe);
  const bytes = new Uint8Array(new ArrayBuffer(rawData.length));
  for (let i = 0; i < rawData.length; i++) {
    bytes[i] = rawData.charCodeAt(i);
  }
  return bytes;
}

export function pushSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
}

// iPhone/iPad: Safari só expõe Web Push quando o site foi "instalado"
// (Compartilhar → Adicionar à Tela de Início) — aberto numa aba comum,
// PushManager nem existe no window, então pushSupported() já volta false
// sozinho. Detectamos iOS à parte só pra mostrar a instrução certa em vez
// de um genérico "não suportado".
export function isIOS(): boolean {
  if (typeof navigator === "undefined") return false;
  return (
    /iP(hone|od|ad)/.test(navigator.userAgent) ||
    // iPadOS 13+ finge ser um Mac no user-agent; maxTouchPoints > 1 é o
    // jeito padrão de diferenciar de um Mac de verdade.
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
}

export function isStandalonePWA(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    // Propriedade não-padrão, só existe no Safari — é o jeito real de
    // saber se o iOS considera o site "instalado".
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!pushSupported()) return null;
  try {
    return await navigator.serviceWorker.register("/sw.js");
  } catch {
    return null;
  }
}

export async function subscribeToPush(): Promise<PushSubscriptionJSON | null> {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  if (!publicKey || !pushSupported()) return null;

  const permission = await Notification.requestPermission();
  if (permission !== "granted") return null;

  const registration = await registerServiceWorker();
  if (!registration) return null;

  const existing = await registration.pushManager.getSubscription();
  const subscription =
    existing ??
    (await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey),
    }));

  return subscription.toJSON();
}

export async function unsubscribeFromPush(): Promise<string | null> {
  if (!pushSupported()) return null;
  const registration = await navigator.serviceWorker.getRegistration();
  const subscription = await registration?.pushManager.getSubscription();
  if (!subscription) return null;

  const endpoint = subscription.endpoint;
  await subscription.unsubscribe();
  return endpoint;
}

export async function getCurrentPushEndpoint(): Promise<string | null> {
  if (!pushSupported()) return null;
  const registration = await navigator.serviceWorker.getRegistration();
  const subscription = await registration?.pushManager.getSubscription();
  return subscription?.endpoint ?? null;
}
