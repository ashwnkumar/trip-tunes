import Link from "next/link";
import React from "react";

function Footer() {
  return (
    <footer className="w-full border-t border-border bg-card py-8 px-4">
      <div className="max-w-7xl mx-auto text-center space-y-2">
        <p className="text-sm text-muted-foreground">
          © 2025 Trip Tunes. All Rights Reserved.
        </p>
        <p className="text-sm text-muted-foreground">
          Designed and Developed by{" "}
          <Link
            href="https://www.ashwinkumar-dev.vercel.app"
            className="text-primary hover:text-accent font-medium transition-colors"
          >
            Ashwin Kumar
          </Link>
        </p>
      </div>
    </footer>
  );
}

export default Footer;
