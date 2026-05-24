"use client";

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { PremiumUpgradeModal } from "@/components/billing/premium-upgrade-modal";
import { useWorkspace } from "@/lib/store/workspace-provider";

type UpgradeModalOptions = {
  title?: string;
  description?: string;
  existingPageId?: string;
};

type UpgradeModalContextValue = {
  openUpgradeModal: (opts?: UpgradeModalOptions) => void;
  closeUpgradeModal: () => void;
};

const UpgradeModalContext = createContext<UpgradeModalContextValue | null>(null);

export function UpgradeModalProvider({ children }: { children: ReactNode }) {
  const { data } = useWorkspace();
  const [open, setOpen] = useState(false);
  const [opts, setOpts] = useState<UpgradeModalOptions>({});

  const openUpgradeModal = useCallback((options?: UpgradeModalOptions) => {
    setOpts(options ?? {});
    setOpen(true);
  }, []);

  const closeUpgradeModal = useCallback(() => setOpen(false), []);

  const workspaceId = data?.workspace.id ?? "";
  const email = data?.user.email ?? "";
  const firstPageId = data?.landingPages[0]?.id;

  return (
    <UpgradeModalContext.Provider value={{ openUpgradeModal, closeUpgradeModal }}>
      {children}
      {data && (
        <PremiumUpgradeModal
          open={open}
          onClose={closeUpgradeModal}
          workspaceId={workspaceId}
          email={email}
          title={opts.title}
          description={opts.description}
          existingPageId={opts.existingPageId ?? firstPageId}
        />
      )}
    </UpgradeModalContext.Provider>
  );
}

export function useUpgradeModal() {
  const ctx = useContext(UpgradeModalContext);
  if (!ctx) {
    return {
      openUpgradeModal: () => {},
      closeUpgradeModal: () => {},
    };
  }
  return ctx;
}
