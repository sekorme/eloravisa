"use client"

import { useId, useMemo, useRef, useState } from "react"
import { Check, Search } from "lucide-react"
import { cn } from "@/lib/utils"

/**
 * Type-to-search country field (a combobox). Shows `popular` before the user
 * types, then up to 8 matches. Only names from `options` can be chosen.
 */
export function CountryPicker({
  id,
  label,
  value,
  onChange,
  options,
  popular,
  placeholder = "Start typing a country",
}: {
  id: string
  label: string
  value: string
  onChange: (name: string) => void
  options: string[]
  popular: string[]
  placeholder?: string
}) {
  const [query, setQuery] = useState<string | null>(null)
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  const listId = useId()
  const inputRef = useRef<HTMLInputElement>(null)

  const text = query ?? value
  const matches = useMemo(() => {
    const q = (query ?? "").trim().toLowerCase()
    if (!q) return popular.filter((p) => options.includes(p))
    const starts = options.filter((o) => o.toLowerCase().startsWith(q))
    const contains = options.filter((o) => !o.toLowerCase().startsWith(q) && o.toLowerCase().includes(q))
    return [...starts, ...contains].slice(0, 8)
  }, [query, options, popular])

  const choose = (name: string) => {
    onChange(name)
    setQuery(null)
    setOpen(false)
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setOpen(true)
      setActive((i) => Math.min(i + 1, matches.length - 1))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setActive((i) => Math.max(i - 1, 0))
    } else if (e.key === "Enter" && open && matches[active]) {
      e.preventDefault()
      choose(matches[active])
    } else if (e.key === "Escape") {
      setOpen(false)
      setQuery(null)
    }
  }

  return (
    <div className="relative space-y-2">
      <label htmlFor={id} className="text-sm font-medium">{label}</label>
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-lp-muted" aria-hidden="true" />
        <input
          ref={inputRef}
          id={id}
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={open && matches[active] ? `${listId}-${active}` : undefined}
          autoComplete="off"
          placeholder={placeholder}
          value={text}
          onChange={(e) => {
            setQuery(e.target.value)
            setActive(0)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => {
            // Let a click on an option land first; an exact typed name also counts.
            setTimeout(() => {
              setOpen(false)
              if (query !== null) {
                const exact = options.find((o) => o.toLowerCase() === query.trim().toLowerCase())
                if (exact) onChange(exact)
                setQuery(null)
              }
            }, 120)
          }}
          onKeyDown={onKeyDown}
          className="h-11 w-full rounded-xl border border-lp-line bg-lp-card pl-9 pr-3 text-base text-lp-fg outline-none transition focus:border-lp-azure focus:ring-2 focus:ring-lp-azure/20"
        />
      </div>
      {open && matches.length > 0 && (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-20 mt-1 max-h-64 w-full overflow-y-auto rounded-xl border border-lp-line bg-lp-card p-1 shadow-lg"
        >
          {!query && <li className="px-3 pb-1 pt-2 text-[11px] uppercase tracking-[0.14em] text-lp-muted" aria-hidden="true">Popular</li>}
          {matches.map((name, i) => (
            <li
              key={name}
              id={`${listId}-${i}`}
              role="option"
              aria-selected={name === value}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => choose(name)}
              onMouseEnter={() => setActive(i)}
              className={cn(
                "flex cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-sm",
                i === active && "bg-lp-sky",
              )}
            >
              {name}
              {name === value && <Check className="h-4 w-4 text-lp-azure" />}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
