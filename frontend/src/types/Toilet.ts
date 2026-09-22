export type Toilet = {
  id: number
  source: string
  name: string | null
  latitude: number
  longitude: number
  toiletType: string | null
  accessibilityStatus: 'ACCESSIBLE' | 'DIFFICULT_ACCESS' | 'NOT_ACCESSIBLE' | 'NOT_ASSESSED' | null
  comments: string | null
  sourceModifiedAt: string | null
}
