"use client";

import { useRef, useState, type FormEvent } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { cmsBrowserUrl, type SiteSettings } from "@/lib/cms";

const LINES = ["Let's build", "what moves", "next."];

type Status = "idle" | "sending" | "sent" | "error";
type Field = "name" | "email" | "phone" | "role" | "interest" | "message";
type FieldErrors = Partial<Record<Field, string>>;

/** The CMS's field names, onto this form's: `service` is the interest, `role` is "I am a". */
const SERVER_FIELD: Record<string, Field> = {
  name: "name",
  email: "email",
  phone: "phone",
  role: "role",
  service: "interest",
  message: "message",
};

/** Mirrors the CMS's rule: the message is optional, but says something when given. */
function checkLocally(message: string): FieldErrors {
  return message && message.length < 10 ? { message: "Tell us a little more (at least 10 characters)." } : {};
}

/**
 * The homepage contact form. Posts from the browser straight to the CMS
 * (POST /api/public/enquiries), which files it under Enquiries and emails the
 * alert address in Settings → Email. Contact details beside it come from
 * Settings → General.
 */
export default function Contact({ site }: { site: SiteSettings }) {
  const root = useRef<HTMLElement>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [notice, setNotice] = useState("");
  const { contactEmail, phone, address, city, hours, responseTime } = site.general;
  const fallbackContact = contactEmail ? `, or email ${contactEmail}` : "";

  useGSAP(
    () => {
      gsap.from(".ct-line-inner", {
        yPercent: 110,
        duration: 1.4,
        stagger: 0.12,
        ease: "expo.out",
        scrollTrigger: { trigger: ".ct-title", start: "top 80%" },
      });
      gsap.from(".ct-reveal", {
        y: 30,
        opacity: 0,
        stagger: 0.08,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: { trigger: ".ct-form", start: "top 85%" },
      });

      // Magnetic button
      const btn = root.current!.querySelector<HTMLElement>(".magnetic")!;
      const xTo = gsap.quickTo(btn, "x", { duration: 0.6, ease: "elastic.out(1, 0.4)" });
      const yTo = gsap.quickTo(btn, "y", { duration: 0.6, ease: "elastic.out(1, 0.4)" });
      const move = (e: MouseEvent) => {
        const b = btn.getBoundingClientRect();
        xTo((e.clientX - (b.left + b.width / 2)) * 0.35);
        yTo((e.clientY - (b.top + b.height / 2)) * 0.35);
      };
      const leave = () => {
        xTo(0);
        yTo(0);
      };
      btn.addEventListener("mousemove", move);
      btn.addEventListener("mouseleave", leave);
      return () => {
        btn.removeEventListener("mousemove", move);
        btn.removeEventListener("mouseleave", leave);
      };
    },
    { scope: root }
  );

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "sending" || status === "sent") return;

    const form = new FormData(e.currentTarget);
    const value = (key: string) => String(form.get(key) ?? "").trim();
    const body = {
      name: value("name"),
      email: value("email"),
      phone: value("phone"),
      role: value("role"),
      service: value("interest"),
      message: value("message"),
      website: value("website"), // honeypot
    };

    const local = checkLocally(body.message);
    setErrors(local);
    if (Object.keys(local).length > 0) {
      setStatus("error");
      setNotice("Please check the highlighted fields.");
      return;
    }

    const url = cmsBrowserUrl("/public/enquiries");
    if (!url) {
      setStatus("error");
      setNotice(`The form isn't connected yet. Please try again later${fallbackContact}.`);
      return;
    }

    setStatus("sending");
    setNotice("");
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        setStatus("sent");
        setNotice(`Thanks, ${body.name.split(" ")[0]}. Our team will reply ${responseTime || "soon"}.`);
        return;
      }

      const data = (await response.json().catch(() => ({}))) as {
        message?: string;
        fieldErrors?: Record<string, string>;
      };
      const mapped: FieldErrors = {};
      for (const [key, text] of Object.entries(data.fieldErrors ?? {})) {
        const field = SERVER_FIELD[key];
        if (field) mapped[field] = text;
      }
      setErrors(mapped);
      setStatus("error");
      setNotice(
        Object.keys(mapped).length > 0
          ? "Please check the highlighted fields."
          : data.message || `Something went wrong. Please try again${fallbackContact}.`
      );
    } catch {
      setStatus("error");
      setNotice(`We couldn't reach our server. Please try again${fallbackContact}.`);
    }
  }

  const fieldClass = (field: Field, extra = "") =>
    ["field", extra, errors[field] ? "has-error" : ""].filter(Boolean).join(" ");
  const describedBy = (field: Field) => (errors[field] ? `ct-${field}-error` : undefined);
  const errorFor = (field: Field) =>
    errors[field] ? (
      <small className="field-error" id={`ct-${field}-error`}>
        {errors[field]}
      </small>
    ) : null;

  return (
    <section className="section contact" id="contact" ref={root}>
      <div className="ct-glow" aria-hidden="true" />
      <div className="container">
        <span className="section-tag">[16] Contact</span>
        <h2 className="ct-title">
          {LINES.map((l, i) => (
            <span key={l} className="ct-line">
              <span className={`ct-line-inner ${i === 2 ? "accent" : ""}`}>{l}</span>
            </span>
          ))}
        </h2>

        <div className="ct-grid">
          <div className="ct-info">
            <p className="muted ct-reveal">
              Book a free lab tour, enrol in the programme, bring a workshop to your institution or deploy robots in
              industry — tell us a little about yourself and our team replies {responseTime || "as soon as we can"}.
            </p>
            {contactEmail && (
              <a href={`mailto:${contactEmail}`} className="ct-mail ct-reveal">
                {contactEmail}
              </a>
            )}
            <div className="ct-meta mono muted ct-reveal">
              {address && <span>{address}</span>}
              {city && <span>{city}</span>}
              {phone && <a href={`tel:${phone.replace(/[^+\d]/g, "")}`}>{phone}</a>}
              {hours && <span>{hours}</span>}
            </div>
          </div>

          <form className="ct-form" onSubmit={submit}>
            {/* Honeypot: invisible to people; a bot that fills it is quietly ignored by the CMS. */}
            <div className="ct-hp" aria-hidden="true">
              <label>
                Website
                <input type="text" name="website" tabIndex={-1} autoComplete="off" defaultValue="" />
              </label>
            </div>
            <label className={fieldClass("name", "ct-reveal")}>
              <span>Name</span>
              <input
                required
                minLength={2}
                maxLength={120}
                name="name"
                placeholder="Ada Lovelace"
                autoComplete="name"
                aria-invalid={errors.name ? true : undefined}
                aria-describedby={describedBy("name")}
              />
              {errorFor("name")}
            </label>
            <label className={fieldClass("email", "ct-reveal")}>
              <span>Email</span>
              <input
                required
                type="email"
                maxLength={190}
                name="email"
                placeholder="you@email.com"
                autoComplete="email"
                aria-invalid={errors.email ? true : undefined}
                aria-describedby={describedBy("email")}
              />
              {errorFor("email")}
            </label>
            <label className={fieldClass("phone", "ct-reveal")}>
              <span>Phone / WhatsApp</span>
              <input
                type="tel"
                maxLength={40}
                name="phone"
                placeholder="+91 98765 43210"
                autoComplete="tel"
                aria-invalid={errors.phone ? true : undefined}
                aria-describedby={describedBy("phone")}
              />
              {errorFor("phone")}
            </label>
            <div className="field-row ct-reveal">
              <label className={fieldClass("role")}>
                <span>I am a</span>
                <select name="role" defaultValue="Student">
                  <option>Student</option>
                  <option>Parent</option>
                  <option>Institution / Franchise enquiry</option>
                  <option>Industry partner</option>
                </select>
                {errorFor("role")}
              </label>
              <label className={fieldClass("interest")}>
                <span>I&apos;m interested in</span>
                <select name="interest" defaultValue="6-Month Programme">
                  <option>6-Month Programme</option>
                  <option>A specific project</option>
                  <option>R&amp;D Lab</option>
                  <option>Workshop for my institution</option>
                  <option>Franchise / B2B</option>
                  <option>Free lab tour</option>
                </select>
                {errorFor("interest")}
              </label>
            </div>
            <label className={fieldClass("message", "ct-reveal")}>
              <span>Message (optional)</span>
              <textarea
                name="message"
                rows={3}
                maxLength={5000}
                placeholder="Tell us what you'd like to build…"
                aria-invalid={errors.message ? true : undefined}
                aria-describedby={describedBy("message")}
              />
              {errorFor("message")}
            </label>
            <div className="ct-reveal">
              <button
                type="submit"
                className="btn btn-primary magnetic"
                disabled={status === "sending" || status === "sent"}
                aria-busy={status === "sending"}
              >
                {status === "sent"
                  ? "Transmission received ✓"
                  : status === "sending"
                    ? "Transmitting…"
                    : "Initiate contact →"}
              </button>
              <p
                className={`ct-status ${status === "error" ? "is-error" : status === "sent" ? "is-ok" : ""}`}
                role="status"
                aria-live="polite"
              >
                {notice}
              </p>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
