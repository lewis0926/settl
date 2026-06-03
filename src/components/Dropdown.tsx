import { useState, useRef, useEffect } from 'react'
import { IconChevron, IconCheck } from './Icons.tsx'

interface Props {
  options: string[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export default function Dropdown({ options, value, onChange, placeholder = 'Select…' }: Props) {
  const [open, setOpen] = useState(false)
  const [focusedIndex, setFocusedIndex] = useState(-1)
  const ref = useRef<HTMLDivElement>(null)
  const optionRefs = useRef<(HTMLButtonElement | null)[]>([])

  function openDropdown() {
    const current = options.indexOf(value)
    setFocusedIndex(current >= 0 ? current : 0)
    setOpen(true)
  }

  function select(option: string) {
    onChange(option)
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
        setFocusedIndex(i => (i + 1) % options.length)
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setFocusedIndex(i => (i - 1 + options.length) % options.length)
      } else if (e.key === 'Enter' && focusedIndex >= 0) {
        e.preventDefault()
        select(options[focusedIndex])
      }
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [open, focusedIndex, options])

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
        <span className={value ? '' : 'placeholder'}>{value || placeholder}</span>
        <IconChevron />
      </button>

      {open && (
        <div className="paid-select-menu">
          <ul className="paid-select-options">
            {options.map((opt, i) => (
              <li key={opt}>
                <button
                  ref={el => { optionRefs.current[i] = el }}
                  type="button"
                  className={`paid-select-option${opt === value ? ' selected' : ''}${i === focusedIndex ? ' focused' : ''}`}
                  onClick={() => select(opt)}
                  onMouseEnter={() => setFocusedIndex(i)}
                >
                  {opt}
                  {opt === value && <IconCheck className="check" />}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
