import { useState } from 'react'
import { uid, fmt } from '../utils.ts'
import { useAppContext } from '../context/AppContext.tsx'
import PersonSelect from './PersonSelect.tsx'

export default function ExpenseList() {
  const { state, patch } = useAppContext()
  const { people, expenses } = state

  const [desc, setDesc] = useState('')
  const [amount, setAmount] = useState('')
  const [paidBy, setPaidBy] = useState(people[0] ?? '')

  function addExpense() {
    const parsed = parseFloat(amount)
    if (!desc.trim() || isNaN(parsed) || parsed <= 0 || !paidBy) return
    patch({ expenses: [...expenses, { id: uid(), description: desc.trim(), amount: parsed, paidBy }] })
    setDesc('')
    setAmount('')
  }

  function removeExpense(id: string) {
    patch({ expenses: expenses.filter(e => e.id !== id) })
  }

  const total = expenses.reduce((s, e) => s + e.amount, 0)
  const canAdd = desc.trim() && parseFloat(amount) > 0 && !!paidBy
  const uniquePayers = new Set(expenses.map(e => e.paidBy)).size
  const canSettle = expenses.length > 0 && people.length >= 2 && uniquePayers >= 2

  return (
    <div className="step-card">
      <div className="step-header">
        <span className="step-badge">2</span>
        <div>
          <h2>Add expenses</h2>
          <p className="step-sub">Who paid what? Splits follow the ratios you set.</p>
        </div>
      </div>

      <div className="expense-form">
        <div className="field">
          <label htmlFor="exp-desc">What for?</label>
          <input
            id="exp-desc"
            type="text"
            placeholder="e.g. Dinner, Taxi, Groceries"
            value={desc}
            onChange={e => setDesc(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addExpense()}
            maxLength={80}
          />
        </div>

        <div className="field-row">
          <div className="field">
            <label htmlFor="exp-amount">Amount</label>
            <div className="amount-wrap">
              <span className="currency-prefix">$</span>
              <input
                id="exp-amount"
                type="number"
                inputMode="decimal"
                placeholder="0.00"
                min="0.01"
                step="0.01"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addExpense()}
              />
            </div>
          </div>

          <div className="field">
            <label>Paid by</label>
            <PersonSelect people={people} value={paidBy} onChange={setPaidBy} />
          </div>
        </div>

        <button className="btn-secondary" onClick={addExpense} disabled={!canAdd}>
          + Add expense
        </button>
      </div>

      {expenses.length > 0 && (
        <>
          <ul className="expense-list">
            {expenses.map(e => (
              <li key={e.id} className="expense-item">
                <div className="expense-info">
                  <span className="expense-desc">{e.description}</span>
                  <span className="expense-meta">paid by {e.paidBy}</span>
                </div>
                <div className="expense-right">
                  <span className="expense-amount">${fmt(e.amount)}</span>
                  <button
                    className="remove-btn"
                    onClick={() => removeExpense(e.id)}
                    aria-label="Remove expense"
                  >
                    ×
                  </button>
                </div>
              </li>
            ))}
          </ul>

          <div className="total-row">
            <span className="total-label">Total</span>
            <span className="total-amount">${fmt(total)}</span>
          </div>
        </>
      )}

      <div className="nav-row">
        <button className="btn-ghost" onClick={() => patch({ step: 'setup' })}>← People</button>
        <button className="btn-primary" onClick={() => patch({ step: 'settlement' })} disabled={!canSettle}>
          Settle up →
        </button>
      </div>
    </div>
  )
}
