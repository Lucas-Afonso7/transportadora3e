// Service worker mínimo, só pro que Web Push exige: receber o evento
// "push" com o navegador/app fechado e mostrar a notificação do sistema.
// Não faz cache de nada, não intercepta fetch — não é um app offline,
// só o mecanismo de entrega de push.

self.addEventListener("push", (event) => {
  if (!event.data) return;

  let payload;
  try {
    payload = event.data.json();
  } catch {
    return;
  }

  const { title, body, url } = payload;

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon: "/logo-3e.png",
      badge: "/logo-3e.png",
      data: { url: url || "/painel" },
    }),
  );
});

// Clica na notificação: foca uma aba já aberta no site, se tiver uma;
// senão abre uma nova na URL do evento (ex.: a página do serviço vencendo).
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || "/painel";

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((windowClients) => {
        for (const client of windowClients) {
          if (client.url.includes(targetUrl) && "focus" in client) {
            return client.focus();
          }
        }
        if (self.clients.openWindow) {
          return self.clients.openWindow(targetUrl);
        }
      }),
  );
});
