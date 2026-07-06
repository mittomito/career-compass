import type { Company, FlowStep } from '../types'

export function useCurrentStep(company: Company): {
  step: FlowStep | undefined
  index: number
  total: number
} {
  const index = company.flow.findIndex((s) => s.id === company.currentStepId)
  return { step: index >= 0 ? company.flow[index] : undefined, index, total: company.flow.length }
}
