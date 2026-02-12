export default function TrainingHubPage() {
  const modules = [
    {
      title: "Start Selling PLR/MRR",
      bullets: [
        "Pick a niche and a simple offer",
        "Brand lightly (don’t overbuild)",
        "List consistently",
      ],
    },
    {
      title: "Where to Sell",
      bullets: ["Etsy", "Gumroad", "Shopify", "Marketplaces and bundles"],
    },
    {
      title: "Pricing & Positioning",
      bullets: [
        "Anchor price with bundles",
        "Use a clear promise (no income claims)",
        "Improve listing conversion with proof and clarity",
      ],
    },
    {
      title: "Marketing & Funnels",
      bullets: [
        "Collect emails",
        "Offer a small freebie",
        "Drive traffic to a single best-seller",
      ],
    },
    {
      title: "Etsy Optimization",
      bullets: ["Keywords", "Images", "Offer clarity", "Reviews and support"],
    },
    {
      title: "Scaling & Automation",
      bullets: ["Templates", "Batch creation", "Simple SOPs", "Outsource safely"],
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
          Training Hub
        </h1>
        <p className="mt-2 text-sm text-zinc-600">
          Short modules to help you list, sell, and scale.
        </p>
      </div>

      <div className="grid gap-4">
        {modules.map((m) => (
          <details
            key={m.title}
            className="group rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm"
          >
            <summary className="cursor-pointer list-none text-sm font-semibold text-zinc-900">
              {m.title}
            </summary>
            <div className="mt-3 space-y-3">
              <p className="text-sm text-zinc-600">
                Video and PDF placeholders will be added here.
              </p>
              <ul className="list-disc pl-5 text-sm text-zinc-700">
                {m.bullets.map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled
                  className="inline-flex h-9 items-center justify-center rounded-xl bg-zinc-900 px-3 text-xs font-semibold text-white opacity-50"
                >
                  Watch video
                </button>
                <button
                  type="button"
                  disabled
                  className="inline-flex h-9 items-center justify-center rounded-xl border border-zinc-200 bg-white px-3 text-xs font-semibold text-zinc-900 opacity-50"
                >
                  Download PDF
                </button>
              </div>
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}

