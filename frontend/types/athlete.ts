export interface Athlete {
  id: number
  official_id: number
  full_name: string
  birth_place: string
  birth_date: string
  gender: string
  nik: string
  photo_athlete?: string | null
}

export interface Contingent {
  id: number
  name: string            // Nama kontingen
  officialId: number
  tournamentId: number
  status: 'pending' | 'approved' | 'rejected'
  athletes: Athlete[]
}