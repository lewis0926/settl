import { useState, useEffect } from 'react'
import { uid, fmt, fmtCurrency, fetchRates, ratesStale, CURRENCIES, DEFAULT_CURRENCY } from '../utils.ts'
import { useAppContext } from '../context/AppContext.tsx'
import Dropdown from './Dropdown.tsx'
import { IconTrash, IconPencil } from './Icons.tsx'

export default function ExpenseList() {
  const { state, patch } = useAppContext()
  const { people, expenses, multiCurrency, splitByPerson, ratesUpdated } = state

  const [desc, setDesc] = useState('')
  const [amount, setAmount] = useState('')
  const [paidBy, setPaidBy] = useState(people[0] ?? '')
  const [currency, setCurrency] = useState(DEFAULT_CURRENCY)
  const [participants, setParticipants] = useState<string[]>([...people])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [loadingRates, setLoadingRates] = useState(false)
  const [ratesError, setRatesError] = useState('')

  useEffect(() => {
    setParticipants([...people])
  }, [JSON.stringify(people)])

  async function toggleMultiCurrency() {
    if (multiCurrency) {
      patch({ multiCurrency: false })
      return
    }
    if (!ratesStale(ratesUpdated)) {
      patch({ multiCurrency: true })
      return
    }
    setLoadingRates(true)
    setRatesError('')
    try {
      const { rates: newRates, updatedAt } = await fetchRates()
      patch({ multiCurrency: true, rates: newRates, ratesUpdated: updatedAt })
    } catch {
      setRatesError('Could not fetch rates. Check connection and try again.')
    } finally {
      setLoadingRates(false)
    }
  }

  function toggleSplitByPerson() {
    patch({ splitByPerson: !splitByPerson })
    setParticipants([...people])
  }

  function toggleParticipant(person: string) {
    setParticipants(prev =>
      prev.includes(person) ? prev.filter(p => p !== person) : [...prev, person]
    )
  }

  function startEdit(id: string) {
    const e = expenses.find(ex => ex.id === id)
    if (!e) return
    setEditingId(id)
    setDesc(e.description)
    setAmount(String(e.amount))
    setPaidBy(e.paidBy)
    setCurrency(e.currency ?? DEFAULT_CURRENCY)
    setParticipants(e.participants ?? [...people])
  }

  function cancelEdit() {
    setEditingId(null)
    setDesc('')
    setAmount('')
    setParticipants([...people])
  }

  function saveExpense() {
    const parsed = parseFloat(amount)
    if (!desc.trim() || isNaN(parsed) || parsed <= 0 || !paidBy) return
    const parts = splitByPerson ? participants : undefined
    const updated = {
      id: editingId ?? uid(),
      description: desc.trim(),
      amount: parsed,
      currency: multiCurrency ? currency : DEFAULT_CURRENCY,
      paidBy,
      ...(parts !== undefined ? { participants: parts } : {}),
    }
    patch({
      expenses: editingId
        ? expenses.map(e => e.id === editingId ? updated : e)
        : [...expenses, updated],
    })
    setEditingId(null)
    setDesc('')
    setAmount('')
    setParticipants([...people])
  }

  function removeExpense(id: string) {
    if (editingId === id) cancelEdit()
    patch({ expenses: expenses.filter(e => e.id !== id) })
  }

  const canAdd = !!desc.trim() && parseFloat(amount) > 0 && !!paidBy
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

      <div className="multicur-bar">
        <div className="multicur-info">
          <span className="multicur-title">Multi-currency</span>
          <span className="multicur-sub">CAD · HKD · JPY · USD</span>
        </div>
        <button
          className={`multicur-btn${multiCurrency ? ' on' : ''}`}
          onClick={toggleMultiCurrency}
          disabled={loadingRates}
        >
          <span className="multicur-dot" />
          {loadingRates ? 'Loading…' : multiCurrency ? 'ON' : 'OFF'}
        </button>
      </div>

      <div className="multicur-bar">
        <div className="multicur-info">
          <span className="multicur-title">Split by person</span>
          <span className="multicur-sub">Exclude people from specific expenses</span>
        </div>
        <button
          className={`multicur-btn${splitByPerson ? ' on' : ''}`}
          onClick={toggleSplitByPerson}
        >
          <span className="multicur-dot" />
          {splitByPerson ? 'ON' : 'OFF'}
        </button>
      </div>

      {ratesError && <p className="rates-error">{ratesError}</p>}

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

        <div className={`field-row${multiCurrency ? ' three-col' : ''}`}>
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

          {multiCurrency && (
            <div className="field">
              <label>Currency</label>
              <Dropdown options={[...CURRENCIES]} value={currency} onChange={setCurrency} />
            </div>
          )}

          <div className="field">
            <label>Paid by</label>
            <Dropdown options={people} value={paidBy} onChange={setPaidBy} placeholder="Select person" />
          </div>
        </div>

        {splitByPerson && (
          <div className="field">
            <label>Involved</label>
            <div className="participant-pills">
              {people.map(p => (
                <button
                  key={p}
                  type="button"
                  className={`participant-pill${participants.includes(p) ? ' on' : ''}`}
                  onClick={() => toggleParticipant(p)}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="form-actions">
          <button className="btn-secondary" onClick={saveExpense} disabled={!canAdd}>
            {editingId ? 'Save changes' : '+ Add expense'}
          </button>
          {editingId && (
            <button className="btn-ghost" onClick={cancelEdit}>Cancel</button>
          )}
        </div>
      </div>

      {expenses.length > 0 && (
        <>
          <ul className="expense-list">
            {expenses.map(e => (
              <li key={e.id} className={`expense-item${editingId === e.id ? ' editing' : ''}`}>
                <div className="expense-info">
                  <span className="expense-desc">{e.description}</span>
                  <span className="expense-meta">
                    paid by {e.paidBy}
                    {splitByPerson && e.participants && e.participants.length < people.length && (
                      <> · {e.participants.length} of {people.length} people</>
                    )}
                  </span>
                </div>
                <div className="expense-right">
                  <span className="expense-amount">
                    {multiCurrency ? fmtCurrency(e.amount, e.currency) : `$${fmt(e.amount)}`}
                  </span>
                  <button className="edit-btn" onClick={() => editingId === e.id ? cancelEdit() : startEdit(e.id)} aria-label="Edit expense">
                    <IconPencil />
                  </button>
                  <button className="remove-btn" onClick={() => removeExpense(e.id)} aria-label="Remove expense">
                    <IconTrash />
                  </button>
                </div>
              </li>
            ))}
          </ul>

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
