"use client";

import { useEffect, useRef, useState } from "react";
import { Bell, BellOff, LogOut, Moon, Settings, Sun } from "lucide-react";
import {
  areNotificationsEnabled,
  notificationsSupported,
  setNotificationsPreference,
} from "@/lib/notifications-client";

export function SettingsMenu({
  logoutAction,
  align = "down",
}: {
  logoutAction: () => void | Promise<void>;
  // "down": abre pra baixo, a partir do botão (uso no topo de um cabeçalho).
  // "up": abre pra cima (uso quando o botão fica perto do fim da tela,
  // como no rodapé da sidebar do admin — senão o menu abriria pra fora
  // da viewport).
  align?: "down" | "up";
}) {
  const [open, setOpen] = useState(false);
  // null até montar no cliente — evita mismatch de hidratação, já que o
  // servidor não tem como saber a preferência salva no localStorage.
  const [isDark, setIsDark] = useState<boolean | null>(null);
  const [notifsEnabled, setNotifsEnabled] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsDark(document.documentElement.classList.contains("dark"));
    setNotifsEnabled(areNotificationsEnabled());
  }, []);

  useEffect(() => {
    if (!open) return;

    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  function toggleTheme() {
    const next = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
    setIsDark(next);
  }

  async function toggleNotifications() {
    if (!notificationsSupported()) return;

    if (notifsEnabled) {
      setNotificationsPreference(false);
      setNotifsEnabled(false);
      return;
    }

    const permission =
      Notification.permission === "granted"
        ? "granted"
        : await Notification.requestPermission();

    if (permission !== "granted") return;
    setNotificationsPreference(true);
    setNotifsEnabled(true);
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label="Configurações"
        aria-expanded={open}
        className="flex h-8 w-8 items-center justify-center rounded-control border border-border text-fg-muted transition-colors hover:border-fg-subtle hover:text-fg"
      >
        <Settings className="h-4 w-4" />
      </button>

      {open && (
        <div
          className={`absolute right-0 z-20 w-60 rounded-card border border-border bg-surface p-1.5 shadow-card ${
            align === "up" ? "bottom-full mb-2" : "top-full mt-2"
          }`}
        >
          <button
            type="button"
            onClick={toggleTheme}
            className="flex w-full items-center gap-2 rounded-control px-3 py-2 text-left text-sm text-fg hover:bg-surface-hover"
          >
            {isDark ? (
              <Sun className="h-4 w-4 shrink-0" />
            ) : (
              <Moon className="h-4 w-4 shrink-0" />
            )}
            {isDark ? "Mudar para tema claro" : "Mudar para tema escuro"}
          </button>

          <button
            type="button"
            onClick={toggleNotifications}
            disabled={!notificationsSupported()}
            className="flex w-full items-center gap-2 rounded-control px-3 py-2 text-left text-sm text-fg hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-50"
          >
            {notifsEnabled ? (
              <BellOff className="h-4 w-4 shrink-0" />
            ) : (
              <Bell className="h-4 w-4 shrink-0" />
            )}
            {notifsEnabled ? "Desativar notificações" : "Ativar notificações"}
          </button>

          <div className="my-1.5 border-t border-border-muted" />

          <form action={logoutAction}>
            <button
              type="submit"
              className="flex w-full items-center gap-2 rounded-control px-3 py-2 text-left text-sm text-danger-tint-fg hover:bg-danger-tint"
            >
              <LogOut className="h-4 w-4 shrink-0" />
              Sair
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
