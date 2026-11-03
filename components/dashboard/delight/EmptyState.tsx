/**
 * Friendly empty states with a small line illustration in the brand green,
 * instead of a bare "Nothing here".
 */
const ART = {
  calendar: (
    <>
      <rect x="14" y="18" width="52" height="46" rx="8" />
      <path d="M14 32 H66 M28 12 V24 M52 12 V24" />
      <path d="M30 46 l6 6 l14 -14" />
    </>
  ),
  bell: (
    <>
      <path d="M26 52 V38 a14 14 0 0 1 28 0 V52 l6 6 H20 Z" />
      <path d="M35 62 a5 5 0 0 0 10 0" />
      <path d="M62 22 l6 -4 M64 32 h7 M18 22 l-6 -4 M16 32 H9" />
    </>
  ),
  check: (
    <>
      <circle cx="40" cy="40" r="26" />
      <path d="M28 41 l8 8 l16 -18" />
      <path d="M66 14 l3 -3 M70 22 h5 M14 14 l-3 -3" />
    </>
  ),
} as const

export function EmptyState({ art, title, children }: { art: keyof typeof ART; title: string; children?: React.ReactNode }) {
  return (
    <div className="flex items-center gap-4 rounded-xl bg-lp-sky-2 p-4">
      <svg viewBox="0 0 80 80" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" className="h-12 w-12 shrink-0 text-lp-azure" aria-hidden="true">
        {ART[art]}
      </svg>
      <div className="min-w-0 space-y-1 text-sm">
        <p className="font-medium text-lp-fg">{title}</p>
        {children}
      </div>
    </div>
  )
}
