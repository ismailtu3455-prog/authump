"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [{ href: "/", label: "Google Drive" }];

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="site-header">
      <div className="container header-content">
        <Link className="brand-mark" href="/">
          <span>GD</span>
          <strong>DriveLink</strong>
        </Link>

        <nav className="main-nav">
          {navItems.map((item) => (
            <Link
              key={item.href}
              className={pathname === item.href ? "nav-link nav-link-active" : "nav-link"}
              href={item.href}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="header-actions">
          <a
            className="button button-secondary"
            href="https://developers.google.com/identity/oauth2/web/guides/use-token-model"
            rel="noreferrer"
            target="_blank"
          >
            GIS Token Model
          </a>
        </div>
      </div>
    </header>
  );
}
