"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

// Shared open/close state for the two mobile full-screen takeovers (the
// nav "Menu" panel and the "Cart" panel). They're two separate component
// trees (header-content.tsx / cart.tsx) but the reference designs let you
// jump directly from one to the other via a corner trigger ("Menu" shown
// on the Cart screen, "Cart (n)" shown on the Menu screen) — so only one
// can be open at a time and switching is a single state change, not a
// close-then-open. Desktop is unaffected: the desktop nav and desktop
// cart drawer keep their own independent, local open state.
type Panel = "menu" | "cart" | null;

type MobilePanelContextType = {
  activePanel: Panel;
  openMenu: () => void;
  openCart: () => void;
  close: () => void;
};

const MobilePanelContext = createContext<MobilePanelContextType | undefined>(
  undefined,
);

export function MobilePanelProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [activePanel, setActivePanel] = useState<Panel>(null);

  const openMenu = useCallback(() => setActivePanel("menu"), []);
  const openCart = useCallback(() => setActivePanel("cart"), []);
  const close = useCallback(() => setActivePanel(null), []);

  // Single source of truth for the body-scroll lock while either
  // takeover is open — both panels are portaled to document.body, so
  // this can't live on a wrapping element's own scroll container.
  useEffect(() => {
    document.body.style.overflow = activePanel ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [activePanel]);

  return (
    <MobilePanelContext.Provider
      value={{ activePanel, openMenu, openCart, close }}
    >
      {children}
    </MobilePanelContext.Provider>
  );
}

export function useMobilePanel() {
  const context = useContext(MobilePanelContext);
  if (context === undefined) {
    throw new Error(
      "useMobilePanel must be used within a MobilePanelProvider",
    );
  }
  return context;
}
