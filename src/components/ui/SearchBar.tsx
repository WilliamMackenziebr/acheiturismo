import { MagnifyingGlass } from "@phosphor-icons/react/dist/ssr";

export function SearchBar({ placeholder = "O que você quer achar?" }: { placeholder?: string }) {
  return <label className="search-bar"><MagnifyingGlass size={24} /><input aria-label="Buscar" placeholder={placeholder} /></label>;
}
