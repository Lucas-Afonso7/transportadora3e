import Image from "next/image";
import { Phone, Mail, MapPin, Globe, MessageCircle } from "lucide-react";
import { InstagramIcon } from "@/components/icons/InstagramIcon";
import { formatPhoneBR } from "@/lib/format";

export function Footer({ whatsappPhone }: { whatsappPhone: string }) {
  const whatsappLink = `https://wa.me/${whatsappPhone}`;

  return (
    <div className="mt-10 rounded-card border border-border bg-surface p-6 shadow-card">
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
        <div className="flex items-center justify-center sm:justify-start">
          <Image
            src="/logo-3e.png"
            alt="Transportadora 3E"
            width={120}
            height={120}
            className="h-auto w-28"
          />
        </div>

        <div className="text-center sm:text-left">
          <h3 className="mb-2 text-sm font-semibold text-fg">Contato</h3>
          <p className="mb-1 flex items-center justify-center gap-2 text-sm text-fg-muted sm:justify-start">
            <Phone
              className="h-4 w-4 text-brand-600 dark:text-brand-400"
              strokeWidth={1.75}
            />
            {formatPhoneBR(whatsappPhone)}
          </p>
          <p className="mb-1 flex items-center justify-center gap-2 text-sm text-fg-muted sm:justify-start">
            <Mail
              className="h-4 w-4 text-brand-600 dark:text-brand-400"
              strokeWidth={1.75}
            />
            contato@transporte3e.com.br
          </p>
          <p className="flex items-center justify-center gap-2 text-sm text-fg-muted sm:justify-start">
            <MapPin
              className="h-4 w-4 text-brand-600 dark:text-brand-400"
              strokeWidth={1.75}
            />
            Ibirité - MG
          </p>
        </div>

        <div className="text-center sm:text-left">
          <h3 className="mb-2 text-sm font-semibold text-fg">
            Redes sociais
          </h3>
          <div className="flex justify-center gap-4 sm:justify-start">
            <a
              href="https://www.instagram.com/transporte3e/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="text-fg-muted hover:text-brand-600 dark:hover:text-brand-400"
            >
              <InstagramIcon className="h-5 w-5" />
            </a>
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp"
              className="text-fg-muted hover:text-brand-600 dark:hover:text-brand-400"
            >
              <MessageCircle className="h-5 w-5" strokeWidth={1.75} />
            </a>
            <a
              href="https://transporte3e.com.br/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Site"
              className="text-fg-muted hover:text-brand-600 dark:hover:text-brand-400"
            >
              <Globe className="h-5 w-5" strokeWidth={1.75} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
