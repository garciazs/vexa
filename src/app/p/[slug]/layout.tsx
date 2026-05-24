import { Suspense } from "react";

export default function PublicPageLayout({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={null}>{children}</Suspense>;
}
