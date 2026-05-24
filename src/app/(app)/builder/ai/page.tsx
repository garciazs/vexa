import { Suspense } from "react";
import { AIBuilderView } from "@/components/builder/ai-builder-view";

export default function AIBuilderPage() {
  return (
    <Suspense fallback={null}>
      <AIBuilderView />
    </Suspense>
  );
}
