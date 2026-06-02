import { useState } from 'react'
import { useAppContext } from '../context/AppContext.tsx'
import { sharePercent } from '../utils.ts'
import AddPersonModal from './AddPersonModal.tsx'

export default function PeopleSetup() {
  const { state, patch } = useAppContext()
  const { people, weights, expenses } = state
  const [showModal, setShowModal] = useState(false)

  function addPerson(name: string) {
    if (!people.includes(name)) {
      patch({ people: [...people, name], weights: { ...weights, [name]: 1 } })
    }
    setShowModal(false);
  }

  function removePerson(name: string) {
    const newWeights = { ...weights }
    delete newWeights[name]
    patch({
      people: people.filter(p => p !== name),
      expenses: expenses.filter(e => e.paidBy !== name),
      weights: newWeights,
    })
  }

  function setWeight(name: string, raw: string) {
    const val = parseFloat(raw)
    if (isNaN(val) || val <= 0) return
    patch({ weights: { ...weights, [name]: val } })
  }

  const allEqual = people.length > 1 && people.every(p => (weights[p] ?? 1) === (weights[people[0]] ?? 1))

  return (
    <div className="step-card">
      <div className="step-header">
        <span className="step-badge">1</span>
        <div>
          <h2>Who's splitting?</h2>
          <p className="step-sub">Add everyone in the group, then adjust ratios if needed.</p>
        </div>
      </div>

      <button className="btn-secondary" onClick={() => setShowModal(true)}>
        + Add person
      </button>

      {people.length > 0 && (
        <div className="people-ratios">
          <div className="people-ratios-header">
            <span className="section-label">People</span>
            <span className="section-label">Ratio</span>
            <span className="section-label">Share</span>
            <span />
          </div>
          <ul className="ratios-list">
            {people.map(p => {
              const pct = sharePercent(p, people, weights)
              return (
                <li key={p} className="ratio-item">
                  <span className="ratio-name">{p}</span>
                  <div className="ratio-input-wrap">
                    <input
                      type="number"
                      className="ratio-input"
                      value={weights[p] ?? 1}
                      min="0.1"
                      step="0.1"
                      onChange={e => setWeight(p, e.target.value)}
                      aria-label={`Weight for ${p}`}
                    />
                    <span className="ratio-x">×</span>
                  </div>
                  <span className="ratio-pct">{pct.toFixed(pct % 1 === 0 ? 0 : 1)}%</span>
                  <button
                    className="ratio-remove"
                    onClick={() => removePerson(p)}
                    aria-label={`Remove ${p}`}
                  >
                    ×
                  </button>
                </li>
              )
            })}
          </ul>
          {!allEqual && people.length > 1 && (
            <div className="ratios-footer">
              <span className="ratios-badge">Custom split active</span>
              <button
                className="btn-ghost"
                style={{ fontSize: 12, padding: '4px 0' }}
                onClick={() => patch({ weights: Object.fromEntries(people.map(p => [p, 1])) })}
              >
                Reset to equal
              </button>
            </div>
          )}
        </div>
      )}

      <button
        className="btn-primary full-width"
        onClick={() => patch({ step: 'expenses' })}
        disabled={people.length < 2}
      >
        {people.length < 2
          ? `Add ${2 - people.length} more person${people.length === 0 ? 's' : ''} to continue`
          : `Continue with ${people.length} people →`}
      </button>

      {showModal && (
        <AddPersonModal onAdd={addPerson} onClose={() => setShowModal(false)} />
      )}
    </div>
  )
}
