"use client";

import { useGoClick } from "./Shell";
import type { SiteSettings } from "@/lib/cms";

export default function Footer({ social }: { social?: SiteSettings["social"] }) {
  const goClick = useGoClick();

  return (
    <footer className="footer">
      <div className="container">
        <div className="ft-bottom mono muted">
          <span>© 2026 X AI Robotics · An initiative of techcadd</span>
          <span>
            <span className="pulse" /> Engineer the Future · Build Intelligent Machines
          </span>
          <a href="#top" onClick={goClick("#top")}>
            Back to top ↑
          </a>
        </div>
      </div>
    </footer>
  );
}
