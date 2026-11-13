"use client";

import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { cmsBrowserUrl } from "@/lib/cms";
import { LogoMark } from "./Logo";
import ChiChi from "./ChiChi";

export const SERVICE_OPTIONS = [
  "Robotics Programme",
  "R&D Incubation",
  "School & College Workshops",
  "Robot Shows & Events",
  "Lab Setup & Franchise",
  "Custom Robot Builds",
  "Something else",
];

const HIGHLIGHTS = [
  "Hands-on robotics, AI & embedded systems",
  "ROS 2, computer vision and CAD in real builds",
  "Workshops, labs and institutional partnerships",
];

type Field = "name" | "phone" | "email" | "service";
type Errors = Partial<Record<Field, string>>;
type Status = "idle" | "sending" | "sent" | "error";

/** Client-side checks that mirror what the CMS will accept, plus a required phone/service. */
function validate(v: Record<Field, string>): Errors {
  const errors: Errors = {};
  if (v.name.length < 2) errors.name = "Enter your name.";
  if (!/^[+()\d\s-]{7,20}$/.test(v.phone) || v.phone.replace(/\D/g, "").length < 7)
    errors.phone = "Enter a valid contact number.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email)) errors.email = "Enter a valid email address.";
  if (!v.service) errors.service = "Choose a service.";
  return errors;
}

/**
 * "Request a service" pop-up. Two panels: XAI Robotics + Chi Chi on the left,
 * the form on the right. Submissions go to the CMS (POST /api/public/enquiries)
 * and land in Enquiries like the contact form.
 */
export default function ServiceModal({
  open,
  onClose,
  responseTime,
}: {
  open: boolean;
  onClose: () => void;
  responseTime: string;
}) {
  const id = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const firstFieldRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<Errors>({});
  const [notice, setNotice] = useState("");

  // Focus the form on open, restore focus on close, Esc to close, Tab stays inside.
  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    const t = window.setTimeout(() => firstFieldRef.current?.focus(), 60);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") return onClose();
      if (e.key !== "Tab" || !dialogRef.current) return;
      const focusables = dialogRef.current.querySelectorAll<HTMLElement>(
        "a[href], button:not([disabled]), input:not([type=hidden]):not([tabindex='-1']), select, textarea"
      );
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last?.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(t);
      document.removeEventListener("keydown", onKey);
      previous?.focus?.();
    };
  }, [open, onClose]);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "sending" || status === "sent") return;
    const form = new FormData(e.currentTarget);
    const value = (key: string) => String(form.get(key) ?? "").trim();
    const values = { name: value("name"), phone: value("phone"), email: value("email"), service: value("service") };

    const local = validate(values);
    setErrors(local);
    if (Object.keys(local).length > 0) {
      setStatus("error");
      setNotice("Please check the highlighted fields.");
      return;
    }

    const url = cmsBrowserUrl("/public/enquiries");
    if (!url) {
      setStatus("error");
      setNotice("The form isn't connected yet. Please try again later.");
      return;
    }

    setStatus("sending");
    setNotice("");
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          ...values,
          role: "Service request",
          message: "",
          website: value("website"), // honeypot
        }),
      });
      if (response.ok) {
        setStatus("sent");
        setNotice(`Thanks, ${values.name.split(" ")[0]}! Our team will contact you ${responseTime || "soon"}.`);
        return;
      }
      const data = (await response.json().catch(() => ({}))) as {
        message?: string;
        fieldErrors?: Record<string, string>;
      };
      const mapped: Errors = {};
      for (const [key, text] of Object.entries(data.fieldErrors ?? {})) {
        if (key === "name" || key === "phone" || key === "email" || key === "service") mapped[key] = text;
      }
      setErrors(mapped);
      setStatus("error");
      setNotice(
        Object.keys(mapped).length > 0
          ? "Please check the highlighted fields."
          : data.message || "Something went wrong. Please try again."
      );
    } catch {
      setStatus("error");
      setNotice("We couldn't reach our server. Please try again.");
    }
  }

  if (!open) return null;

  const field = (name: Field) => ({
    id: `${id}-${name}`,
    name,
    "aria-invalid": errors[name] ? true : undefined,
    "aria-describedby": errors[name] ? `${id}-${name}-err` : undefined,
    onChange: () => errors[name] && setErrors((prev) => ({ ...prev, [name]: undefined })),
  });
  const error = (name: Field) =>
    errors[name] ? (
      <small className="sm-error" id={`${id}-${name}-err`}>
        {errors[name]}
      </small>
    ) : null;

  return (
    <div className="sm-overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div
        className="sm-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${id}-title`}
        ref={dialogRef}
        data-lenis-prevent
      >
        <button type="button" className="sm-close" aria-label="Close" onClick={onClose}>
          <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
            <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </button>

        {/* Left: XAI Robotics + Chi Chi */}
        <aside className="sm-side">
          <div className="sm-brand">
            <LogoMark size={36} />
            <span className="mono">XAI Robotics</span>
          </div>
          <h2 className="sm-side-title">Where AI meets the physical world</h2>
          <p className="sm-side-text">
            Since August 2025, starting with Chi Chi — our AI robotic dog — we&apos;ve been bringing practical robotics
            to students, educators, institutions and industry across India.
          </p>
          <ul className="sm-points">
            {HIGHLIGHTS.map((h) => (
              <li key={h}>{h}</li>
            ))}
          </ul>
          <ChiChi className="sm-chichi" />
        </aside>

        {/* Right: the form */}
        <div className="sm-main">
          {status === "sent" ? (
            <div className="sm-done" role="status">
              <span className="sm-done-icon" aria-hidden="true">
                ✓
              </span>
              <h2 id={`${id}-title`}>Request received</h2>
              <p className="muted">{notice}</p>
              <button type="button" className="btn btn-primary" onClick={onClose}>
                Close
              </button>
            </div>
          ) : (
            <>
              <p className="mono muted sm-eyebrow">Request a service</p>
              <h2 id={`${id}-title`} className="sm-title">
                Let&apos;s build something intelligent
              </h2>
              <p className="muted sm-lede">Share a few details and our team will get back to you.</p>

              <form className="sm-form" onSubmit={submit} noValidate>
                <label className="sm-field">
                  <span>Name</span>
                  <input {...field("name")} ref={firstFieldRef} autoComplete="name" placeholder="Your full name" />
                  {error("name")}
                </label>
                <label className="sm-field">
                  <span>Contact number</span>
                  <input {...field("phone")} type="tel" autoComplete="tel" placeholder="+91 98765 43210" />
                  {error("phone")}
                </label>
                <label className="sm-field">
                  <span>Email ID</span>
                  <input {...field("email")} type="email" autoComplete="email" placeholder="you@example.com" />
                  {error("email")}
                </label>
                <label className="sm-field">
                  <span>Service interested</span>
                  <select {...field("service")} defaultValue="">
                    <option value="" disabled>
                      Select a service
                    </option>
                    {SERVICE_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                  {error("service")}
                </label>
                {/* Honeypot: hidden from people, filled by bots. */}
                <input type="text" name="website" className="sm-hp" tabIndex={-1} autoComplete="off" aria-hidden="true" />

                <button type="submit" className="btn btn-primary sm-submit" disabled={status === "sending"}>
                  {status === "sending" ? "Sending…" : "Request a service"} <span aria-hidden>→</span>
                </button>
                {notice && (
                  <p className="sm-notice" role="alert">
                    {notice}
                  </p>
                )}
                <p className="sm-privacy muted">We only use your details to reply to this request.</p>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
