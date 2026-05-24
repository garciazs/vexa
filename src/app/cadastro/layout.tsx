import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Criar conta",
};

export default function CadastroLayout({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={null}>{children}</Suspense>;
}
