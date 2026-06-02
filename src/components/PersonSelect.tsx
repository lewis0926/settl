import { useState, useRef, useEffect } from 'react'

interface Props {
  people: string[]
  value: string
  onChange: (person: string) => void
}

export default function PersonSelect({ people, value, onChange }: Props) {
  const [open, setOpen] = useState(false)
  const [focusedIndex, setFocusedIndex] = useState(-1)
  const ref = useRef<HTMLDivElement>(null)
  const optionRefs = useRef<(HTMLButtonElement | null)[]>([])

  function openDropdown() {
    const current = people.indexOf(value)
    setFocusedIndex(current >= 0 ? current : 0)
    setOpen(true)
  }

  function select(person: string) {
    onChange(person)
    setOpen(false)
  }

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    if (open) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  useEffect(() => {
    if (!open) return
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') { setOpen(false); return }
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setFocusedIndex(i => (i + 1) % people.length)
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setFocusedIndex(i => (i - 1 + people.length) % people.length)
      } else if (e.key === 'Enter' && focusedIndex >= 0) {
        e.preventDefault()
        select(people[focusedIndex])
      }
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [open, focusedIndex, people])

  useEffect(() => {
    if (open && focusedIndex >= 0) {
      optionRefs.current[focusedIndex]?.scrollIntoView({ block: 'nearest' })
    }
  }, [focusedIndex, open])

  return (
    <div className="paid-select" ref={ref}>
      <button
        type="button"
        className={`paid-select-trigger${open ? ' open' : ''}`}
        onClick={() => open ? setOpen(false) : openDropdown()}
      >
        <span className={value ? '' : 'placeholder'}>{value || 'Select person'}</span>
        <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
          <path d="M1 1l5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {open && (
        <div className="paid-select-menu">
          <ul className="paid-select-options">
            {people.map((p, i) => (
              <li key={p}>
                <button
                  ref={el => { optionRefs.current[i] = el }}
                  type="button"
                  className={`paid-select-option${p === value ? ' selected' : ''}${i === focusedIndex ? ' focused' : ''}`}
                  onClick={() => select(p)}
                  onMouseEnter={() => setFocusedIndex(i)}
                >
                  {p}
                  {p === value && <span className="check">✓</span>}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
