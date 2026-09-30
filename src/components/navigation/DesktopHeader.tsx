import Image from "next/image";
import Link from "next/link";
import { Heart, IdentificationBadge } from "@phosphor-icons/react/dist/ssr";
import { Container } from "@/components/ui/Container";

export function DesktopHeader() {
  return <header className="desktop-header"><Container className="desktop-header__inner">
    <Link href="/" className="brand"><Image src="/images/logo-achei-oficial.webp" alt="Achei o Turismo" width={54} height={54} priority /><span>ACHEI O<br />TURISMO</span></Link>
    <nav aria-label="Navegação principal"><Link href="/explorar">Explorar</Link><Link href="/lugares">Lugares</Link><Link href="/onde-comer">Onde comer</Link><Link href="/onde-ficar">Onde ficar</Link><Link href="/eventos">Eventos</Link></nav>
    <div className="header-actions"><Link href="/favoritos" aria-label="Favoritos"><Heart size={24} /></Link><Link href="/perfil" aria-label="Perfil"><IdentificationBadge size={27} /></Link></div>
  </Container></header>;
}
