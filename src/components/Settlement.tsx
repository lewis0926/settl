import { useAppContext } from '../context/AppContext.tsx'
import { calcSettlement, fmt } from '../utils.ts'

export default function Settlement() {
  const { state, patch, reset } = useAppContext()
  const { people, expenses } = state

  const transfers = calcSettlement(people, expenses)
  const total = expenses.reduce((s, e) => s + e.amount, 0)
  const perPerson = total / people.length

  return (
    <div className="step-card">
      <div className="step-header">
        <span className="step-badge settled">✓</span>
        <div>
          <h2>Settlement</h2>
          <p className="step-sub">
            ${fmt(total)} total · ${fmt(perPerson)} per person · {people.length} people
          </p>
        </div>
      </div>

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
              <span className="transfer-amount">${fmt(t.amount)}</span>
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
                <span className="breakdown-amount">${fmt(e.amount)}</span>
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
