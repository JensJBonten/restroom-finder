import type { Toilet } from '../types/Toilet'

const accessibilityLabels: Record<NonNullable<Toilet['accessibilityStatus']>, string> = {
  ACCESSIBLE: 'Tilgjengelig',
  DIFFICULT_ACCESS: 'Vanskelig tilgjengelig',
  NOT_ACCESSIBLE: 'Ikke tilgjengelig',
  NOT_ASSESSED: 'Ikke vurdert',
}

export function formatAccessibility(status: Toilet['accessibilityStatus']): string {
  return status === null ? 'Ikke registrert' : accessibilityLabels[status]
}

export function formatToiletName(name: Toilet['name']): string {
  return name ?? 'Offentlig toalett'
}
