import type { Expense, Transfer } from './types.ts'

// Calculates the minimal set of transfers to settle all debts.
// weights: relative share multipliers per person (defaults to 1 = equal split).
// Each expense may carry a participants list; only those people share its cost,
// with weights re-normalised within that subset.
export function calcSettlement(
  people: string[],
  expenses: Expense[],
  weights: Record<string, number> = {},
): Transfer[] {
  if (people.length < 2 || expenses.length === 0) return []

  const w = (p: string) => weights[p] ?? 1

  // Phase 1: accumulate net balance for each person.
  // Payer gets credit (+), each participant is debited their weighted share (−).
  const balance: Record<string, number> = {}
  for (const p of people) balance[p] = 0

  for (const exp of expenses) {
    balance[exp.paidBy] = (balance[exp.paidBy] ?? 0) + exp.amount
    const parts = exp.participants?.length ? exp.participants : people
    const partWeight = parts.reduce((s, p) => s + w(p), 0)
    for (const p of parts) {
      balance[p] = (balance[p] ?? 0) - exp.amount * w(p) / partWeight
    }
  }

  // Phase 2: split into creditors (net positive) and debtors (net negative).
  // Values below $0.005 are treated as zero to avoid floating-point noise.
  const creditors: { name: string; amount: number }[] = []
  const debtors: { name: string; amount: number }[] = []

  for (const [name, bal] of Object.entries(balance)) {
    const rounded = Math.round(bal * 100) / 100
    if (rounded > 0.005) creditors.push({ name, amount: rounded })
    else if (rounded < -0.005) debtors.push({ name, amount: -rounded })
  }

  // Phase 3: greedy two-pointer to minimise the number of transfers.
  // Always pair the largest creditor with the largest debtor; settle the
  // smaller of the two and advance that pointer.
  const transfers: Transfer[] = []
  creditors.sort((a, b) => b.amount - a.amount)
  debtors.sort((a, b) => b.amount - a.amount)

  let ci = 0
  let di = 0

  while (ci < creditors.length && di < debtors.length) {
    const c = creditors[ci]
    const d = debtors[di]
    const amount = Math.min(c.amount, d.amount)
    transfers.push({ from: d.name, to: c.name, amount: Math.round(amount * 100) / 100 })
    c.amount -= amount
    d.amount -= amount
    if (c.amount < 0.005) ci++
    if (d.amount < 0.005) di++
  }

  // Credits and debits must cancel out exactly; any remainder signals a bug.
  const unresolved =
    creditors.slice(ci).reduce((s, c) => s + c.amount, 0) +
    debtors.slice(di).reduce((s, d) => s + d.amount, 0)
  if (unresolved > 0.005) {
    console.warn(`[settl] calcSettlement: $${unresolved.toFixed(2)} unresolved after settlement loop`)
  }

  return transfers
}

export function sharePercent(person: string, people: string[], weights: Record<string, number>): number {
  const w = (p: string) => weights[p] ?? 1
  const totalWeight = people.reduce((s, p) => s + w(p), 0)
  return totalWeight === 0 ? 0 : (w(person) / totalWeight) * 100
}

export const CURRENCIES = ['CAD', 'HKD', 'JPY', 'USD'] as const
export const DEFAULT_CURRENCY = 'CAD'
const RATES_TTL = 12 * 60 * 60 * 1000 // 12 hours

export function ratesStale(updatedAt: number): boolean {
  return Date.now() - updatedAt > RATES_TTL
}

export async function fetchRates(): Promise<{ rates: Record<string, number>; updatedAt: number }> {
  const res = await fetch(
    'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json'
  )
  if (!res.ok) throw new Error('Failed to fetch exchange rates')
  const json = await res.json() as { usd: Record<string, number> }
  const keys = CURRENCIES.filter(c => c !== 'USD').map(c => c.toLowerCase())
  const rates: Record<string, number> = { USD: 1 }
  for (const c of keys) {
    rates[c.toUpperCase()] = json.usd[c]
  }
  return { rates, updatedAt: Date.now() }
}

export function convert(amount: number, from: string, to: string, rates: Record<string, number> = {}): number {
  if (from === to || !rates[from] || !rates[to]) return amount
  return (amount / rates[from]) * rates[to]
}

export function fmtCurrency(amount: number, currency: string): string {
  return `${fmt(Math.round(amount * 100) / 100)} ${currency}`
}

export function uid(): string {
  return Math.random().toString(36).slice(2, 10)
}

export function fmt(amount: number): string {
  return amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}
