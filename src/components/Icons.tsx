import type { SVGProps } from "react";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-3 ${className}`}>
      <svg
        aria-hidden="true"
        viewBox="0 0 40 40"
        className="h-9 w-9 shrink-0"
        fill="none"
      >
        <circle cx="20" cy="20" r="19" fill="#f8f2e9" />
        <circle cx="20" cy="20" r="19" stroke="#e3d3c0" />
        <path
          d="M20 8.5c4.6 3.3 7.2 7 7.2 11a7.2 7.2 0 1 1-14.4 0c0-4 2.6-7.7 7.2-11Z"
          fill="#b4634a"
          fillOpacity="0.16"
        />
        <path
          d="M20 30.5c0-6.2 2.9-10.6 7.4-13.4"
          stroke="#b4634a"
          strokeWidth="1.1"
          strokeLinecap="round"
        />
        <path
          d="M20 30.5c0-6.2-2.9-10.6-7.4-13.4"
          stroke="#b4634a"
          strokeWidth="1.1"
          strokeLinecap="round"
        />
        <circle cx="20" cy="31.4" r="1.5" fill="#b4634a" />
      </svg>
      <span className="font-display text-xl tracking-[0.34em] text-ink uppercase">
        Decu<span className="text-terracotta">care</span>
      </span>
    </span>
  );
}

export function Icon({
  name,
  className = "h-6 w-6",
}: {
  name: "hands" | "leaf" | "truck" | "star" | "quote" | "mail" | "phone" | "pin";
  className?: string;
}) {
  const common: SVGProps<SVGSVGElement> = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.3,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    className,
    "aria-hidden": true,
  };

  switch (name) {
    case "hands":
      return (
        <svg {...common}>
          <path d="M8 13V5.5a1.5 1.5 0 0 1 3 0V12" />
          <path d="M11 11.5v-2a1.5 1.5 0 0 1 3 0V12" />
          <path d="M14 12v-1a1.5 1.5 0 0 1 3 0v4.5A5.5 5.5 0 0 1 11.5 21h-.7a5 5 0 0 1-3.6-1.6L4 15.8a1.6 1.6 0 0 1 2.3-2.2L8 15.3" />
        </svg>
      );
    case "leaf":
      return (
        <svg {...common}>
          <path d="M4 20c0-8 5-14 16-15 1 11-5 16-13 16H4Z" />
          <path d="M8 18c1.5-4.5 4.5-8 9-10" />
        </svg>
      );
    case "truck":
      return (
        <svg {...common}>
          <path d="M2 7h11v10H2z" />
          <path d="M13 10h4l4 4v3h-8z" />
          <circle cx="6" cy="18.5" r="1.6" />
          <circle cx="17" cy="18.5" r="1.6" />
        </svg>
      );
    case "star":
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
          <path d="M12 2.6l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.5 6.1 20.6l1.2-6.5L2.5 9.5l6.6-.9L12 2.6Z" />
        </svg>
      );
    case "quote":
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
          <path d="M9.6 5.5C6.5 6.9 4.5 9.6 4.5 12.9c0 3.3 1.9 5.6 4.4 5.6 2 0 3.5-1.5 3.5-3.4 0-1.9-1.3-3.3-3.1-3.3-.4 0-.8 0-1.1.2.3-1.7 1.6-3.3 3.4-4.3l-2-2.2Zm9 0c-3.1 1.4-5.1 4.1-5.1 7.4 0 3.3 1.9 5.6 4.4 5.6 2 0 3.5-1.5 3.5-3.4 0-1.9-1.3-3.3-3.1-3.3-.4 0-.8 0-1.1.2.3-1.7 1.6-3.3 3.4-4.3l-2-2.2Z" />
        </svg>
      );
    case "mail":
      return (
        <svg {...common}>
          <rect x="2.5" y="5" width="19" height="14" rx="2.5" />
          <path d="M3.5 7l8.5 6 8.5-6" />
        </svg>
      );
    case "phone":
      return (
        <svg {...common}>
          <path d="M6 3.5h3l1.5 4-2 1.5a10 10 0 0 0 5 5l1.5-2 4 1.5v3c0 1.1-.9 2-2 2C10 18.5 5.5 14 5.5 5.5c0-1.1.4-2 .5-2Z" />
        </svg>
      );
    case "pin":
      return (
        <svg {...common}>
          <path d="M12 21s7-6.3 7-11a7 7 0 1 0-14 0c0 4.7 7 11 7 11Z" />
          <circle cx="12" cy="10" r="2.6" />
        </svg>
      );
  }
}
