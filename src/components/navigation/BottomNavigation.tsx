"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, House, MapTrifold, CalendarDots, IdentificationBadge } from "@phosphor-icons/react";

const items = [
  { href: "/", label: "Início", icon: House },
  { href: "/explorar", label: "Explorar", icon: Compass },
  { href: "/lugares", label: "Lugares", icon: MapTrifold },
  { href: "/eventos", label: "Eventos", icon: CalendarDots },
  { href: "/perfil", label: "Perfil", icon: IdentificationBadge },
];

export function BottomNavigation() {
  const pathname = usePathname();
  return <nav className="bottom-nav" aria-label="Navegação móvel">{items.map(({ href, label, icon: Icon }) => {
    const active = href === "/" ? pathname === href : pathname.startsWith(href);
    return <Link href={href} key={href} className={active ? "active" : ""}>{href === "/" ? <Image className="bottom-nav__logo" src="/icons/achei-icon-192.png" alt="" width={26} height={26} /> : <Icon size={24} weight={active ? "fill" : "regular"} />}<span>{label}</span></Link>;
  })}</nav>;
}
