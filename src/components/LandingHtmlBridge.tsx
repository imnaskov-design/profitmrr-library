"use client";

import { useEffect } from "react";

import { EmailCaptureCheckoutCta } from "@/components/EmailCaptureCheckoutCta";

type Props = {
  source?: string;
};

export function LandingHtmlBridge({ source = "landing" }: Props) {
  useEffect(() => {
    const styleId = "profitmrr-material-icons-fallback";
    const existing = document.getElementById(styleId);

    if (!existing) {
      const style = document.createElement("style");
      style.id = styleId;
      style.textContent = `
        .material-symbols-outlined {
          font-family: 'Material Symbols Outlined', 'Material Icons', sans-serif !important;
          font-weight: normal;
          font-style: normal;
          font-size: 24px;
          line-height: 1;
          letter-spacing: normal;
          text-transform: none;
          display: inline-block;
          white-space: nowrap;
          word-wrap: normal;
          direction: ltr;
          -webkit-font-feature-settings: 'liga';
          font-feature-settings: 'liga';
          -webkit-font-smoothing: antialiased;
        }
      `;
      document.head.appendChild(style);
    }

    function onClick(event: MouseEvent) {
      const target = event.target as HTMLElement | null;
      if (!target) return;

      const checkoutTrigger = target.closest("[data-checkout-cta]") as HTMLElement | null;
      if (checkoutTrigger) {
        event.preventDefault();
        const bridgeEvent = new CustomEvent("profitmrr:checkout-bridge", {
          detail: { source },
        });

        window.dispatchEvent(bridgeEvent);
      }
    }

    window.addEventListener("click", onClick);
    return () => window.removeEventListener("click", onClick);
  }, [source]);

  return (
    <div className="fixed -left-[9999px] top-0 h-0 w-0 overflow-hidden" aria-hidden>
      <EmailCaptureCheckoutCta
        source={source}
        buttonLabel="Hidden Checkout Trigger"
        buttonClassName="h-0 w-0 overflow-hidden p-0 opacity-0"
      />
    </div>
  );
}
