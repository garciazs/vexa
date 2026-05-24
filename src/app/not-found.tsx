import Link from "next/link";
import { BRAND } from "@/lib/constants";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#030304] px-4 text-center text-white">
      <p className="text-sm font-medium text-zinc-500">{BRAND.name}</p>
      <h1 className="mt-4 text-3xl font-bold tracking-tight">Página não encontrada</h1>
      <p className="mt-3 max-w-md text-zinc-400">
        O endereço que procurou não existe ou a página ainda não foi publicada.
      </p>
      <Link
        href="/"
        className="mt-8 rounded-full bg-white px-6 py-2.5 text-sm font-medium text-black transition hover:bg-zinc-200"
      >
        Ir para {BRAND.name}
      </Link>
    </div>
  );
}
