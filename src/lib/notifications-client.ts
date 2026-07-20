const STORAGE_KEY = "t3e-notificacoes-ativas";

export function notificationsSupported(): boolean {
  return typeof window !== "undefined" && "Notification" in window;
}

export function areNotificationsEnabled(): boolean {
  if (!notificationsSupported()) return false;
  return (
    localStorage.getItem(STORAGE_KEY) === "true" &&
    Notification.permission === "granted"
  );
}

export function setNotificationsPreference(enabled: boolean): void {
  localStorage.setItem(STORAGE_KEY, enabled ? "true" : "false");
}

export function notify(title: string, body: string): void {
  if (!areNotificationsEnabled()) return;

  const notification = new Notification(title, {
    body,
    icon: "/logo-3e.png",
  });
  notification.onclick = () => {
    window.focus();
    notification.close();
  };
}
