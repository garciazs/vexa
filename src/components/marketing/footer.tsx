import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { BRAND } from "@/lib/constants";

const footerLinks = {
  Produto: [
    { href: "#features", label: "Funcionalidades" },
    { href: "/pricing", label: "Preços" },
    { href: "/cadastro", label: "Começar grátis" },
  ],
  Empresa: [
    { href: "#", label: "Sobre" },
    { href: "#", label: "Blog" },
    { href: "#", label: "Carreiras" },
  ],
  Suporte: [
    { href: "/help", label: "Centro de ajuda" },
    { href: "#", label: "Contacto" },
    { href: "#", label: "Status" },
  ],
  Legal: [
    { href: "#", label: "Privacidade" },
    { href: "#", label: "Termos" },
    { href: "#", label: "RGPD" },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-border bg-surface/50">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Logo />
            <p className="mt-4 max-w-xs text-sm text-muted-foreground">{BRAND.tagline}</p>
          </div>
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="text-sm font-semibold text-foreground">{title}</h4>
              <ul className="mt-4 space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 sm:flex-row">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} VEXA. Todos os direitos reservados.
          </p>
          <p className="text-sm text-muted-foreground">Feito em Portugal 🇵🇹</p>
        </div>
      </div>
    </footer>
  );
}
