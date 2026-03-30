import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container footer-content">
        <div>
          <strong>DriveLink</strong>
          <p>Google Drive OAuth website with automatic access token handoff to a deep link.</p>
        </div>
        <div className="footer-links">
          <Link href="/">Home</Link>
          <a
            href="https://developers.google.com/identity/gsi/web/guides/get-google-api-clientid"
            rel="noreferrer"
            target="_blank"
          >
            Client ID setup
          </a>
        </div>
      </div>
    </footer>
  );
}
