export interface Winner {
  id: number
  rank: number
  tournament_id: number
  tournament_name: string
  athlete_id: number
  athlete_name: string
  athlete_gender: string
  contingent_id: number
  contingent_name: string
  category_id: number
  category_name: string
  min_weight: number
  max_weight: number
  category_type: string
  category_tingkat?: string
}