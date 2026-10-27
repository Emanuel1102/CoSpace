import type { ReactNode } from "react";
import { SiteFooter } from "@/shared/components/site-footer";
import { SiteNavbar } from "@/shared/components/site-navbar";

interface PublicLayoutProps {
  children: ReactNode;
}

export default function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <>
      <SiteNavbar variant="public" />
      {children}
      <SiteFooter />
    </>
  );
}
