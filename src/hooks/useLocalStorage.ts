import { useState, useEffect } from 'react'

type Updater<T> = T | ((prev: T) => T)

export function useLocalStorage<T>(key: string, initial: T): [T, (val: Updater<T>) => void] {
  const [value, setValue] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(key)
      return stored ? (JSON.parse(stored) as T) : initial
    } catch {
      return initial
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // quota exceeded — silently ignore
    }
  }, [key, value])

  function set(val: Updater<T>) {
    setValue(prev => (typeof val === 'function' ? (val as (p: T) => T)(prev) : val))
  }

  return [value, set]
}
