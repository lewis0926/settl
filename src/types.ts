export interface Expense {
  id: string
  description: string
  amount: number
  paidBy: string
}

export type Step = 'setup' | 'expenses' | 'settlement'

export interface AppState {
  step: Step
  people: string[]
  weights: Record<string, number>
  expenses: Expense[]
}

export interface Transfer {
  from: string
  to: string
  amount: number
}
