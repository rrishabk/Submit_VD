import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-medium text-gray-900">Verseodin trial — start here</h1>
      <p className="mt-3 text-sm text-gray-600">
        Two features to build. Open the docs and the routes below to get oriented.
      </p>

      <div className="mt-10 space-y-4">
        <Link
          href="/traffic"
          className="block rounded-xl border border-gray-200 bg-white p-5 transition-colors hover:border-orange-300 hover:bg-orange-50/30"
        >
          <div className="text-base font-medium text-gray-900">/traffic — AI Traffic Dashboard</div>
          <div className="mt-1 text-sm text-gray-500">
            Stacked bar chart of AI bot visits + Top Pages + Top Crawlers. ~3h budget.
          </div>
        </Link>

        <Link
          href="/actions"
          className="block rounded-xl border border-gray-200 bg-white p-5 transition-colors hover:border-orange-300 hover:bg-orange-50/30"
        >
          <div className="text-base font-medium text-gray-900">/actions — Action Centre</div>
          <div className="mt-1 text-sm text-gray-500">
            Triage queue of derived recommendations with Accept / Dismiss. ~3h budget.
          </div>
        </Link>
      </div>

      <div className="mt-10 rounded-xl border border-gray-200 bg-gray-50 p-5 text-sm text-gray-700">
        <div className="font-medium text-gray-900">First steps</div>
        <ol className="mt-3 list-decimal space-y-1 pl-5">
          <li>
            Read{" "}
            <code className="rounded bg-gray-200 px-1.5 py-0.5 text-[12px]">README.md</code>
          </li>
          <li>
            Read{" "}
            <code className="rounded bg-gray-200 px-1.5 py-0.5 text-[12px]">
              docs/FEATURE_1.md
            </code>{" "}
            and{" "}
            <code className="rounded bg-gray-200 px-1.5 py-0.5 text-[12px]">
              docs/FEATURE_2.md
            </code>
          </li>
          <li>
            Run{" "}
            <code className="rounded bg-gray-200 px-1.5 py-0.5 text-[12px]">npm run seed</code>{" "}
            to generate <code className="rounded bg-gray-200 px-1.5 py-0.5 text-[12px]">public/visits.json</code> +{" "}
            <code className="rounded bg-gray-200 px-1.5 py-0.5 text-[12px]">public/monitoring-events.json</code>
          </li>
          <li>Build inside the route pages above. Replace these placeholders.</li>
        </ol>
      </div>
    </main>
  );
}
