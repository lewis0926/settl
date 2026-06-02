import { useAppContext } from '../context/AppContext.tsx'
import { calcSettlement, sharePercent, convert, fmt, fmtCurrency, CURRENCIES, DEFAULT_CURRENCY } from '../utils.ts'
import type { Expense } from '../types.ts'

export default function Settlement() {
  const { state, patch, reset } = useAppContext()
  const { people, weights, expenses, multiCurrency, rates, settleCurrency } = state

  const outCurrency = multiCurrency ? settleCurrency : DEFAULT_CURRENCY

  const normalised: Expense[] = expenses.map(e => ({
    ...e,
    amount: convert(e.amount, e.currency ?? DEFAULT_CURRENCY, outCurrency, rates),
    currency: outCurrency,
  }))

  const transfers = calcSettlement(people, normalised, weights)
  const total = normalised.reduce((s, e) => s + e.amount, 0)
  const perPerson = (name: string) => (sharePercent(name, people, weights) / 100) * total
  const display = (amount: number) => multiCurrency ? fmtCurrency(amount, outCurrency) : `$${fmt(amount)}`

  return (
    <div className="step-card">
      <div className="step-header">
        <span className="step-badge settled">✓</span>
        <div>
          <h2>Settlement</h2>
          <p className="step-sub">
            {display(total)} total · {people.length} people
          </p>
        </div>
      </div>

      {multiCurrency && (
        <div className="settle-currency-row">
          <span className="section-label">Display in</span>
          <div className="settle-currency-pills">
            {CURRENCIES.map(c => (
              <button
                key={c}
                className={`currency-pill${c === settleCurrency ? ' active' : ''}`}
                onClick={() => patch({ settleCurrency: c })}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      )}

      {transfers.length === 0 ? (
        <div className="all-even">
          <span className="all-even-icon">✓</span>
          <p>Everyone's already even — no transfers needed!</p>
        </div>
      ) : (
        <ul className="transfer-list">
          {transfers.map((t, i) => (
            <li key={i} className="transfer-item">
              <span className="transfer-from">{t.from}</span>
              <span className="transfer-arrow">pays</span>
              <span className="transfer-to">{t.to}</span>
              <span className="transfer-amount">{display(t.amount)}</span>
            </li>
          ))}
        </ul>
      )}

      <div className="breakdown">
        <h3>Expense breakdown</h3>
        <ul className="breakdown-list">
          {expenses.map(e => (
            <li key={e.id} className="breakdown-item">
              <span className="breakdown-desc">{e.description}</span>
              <span className="breakdown-meta">
                <span className="breakdown-paid">{e.paidBy}</span>
                <span className="breakdown-amount">
                  {multiCurrency && e.currency !== outCurrency
                    ? fmtCurrency(e.amount, e.currency)
                    : `$${fmt(e.amount)}`}
                </span>
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="breakdown">
        <h3>Per-person share{multiCurrency ? ` (${outCurrency})` : ''}</h3>
        <ul className="breakdown-list">
          {people.map(p => (
            <li key={p} className="breakdown-item">
              <span className="breakdown-desc">{p}</span>
              <span className="breakdown-meta">
                <span className="breakdown-paid">{sharePercent(p, people, weights).toFixed(0)}%</span>
                <span className="breakdown-amount">{display(perPerson(p))}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="nav-row">
        <button className="btn-ghost" onClick={() => patch({ step: 'expenses' })}>← Edit expenses</button>
        <button className="btn-danger" onClick={reset}>Start over</button>
      </div>
    </div>
  )
}
