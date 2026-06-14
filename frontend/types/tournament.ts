  export type TournamentStatus =
    | 'coming_soon'
    | 'registration_open'
    | 'registration_closed'
    | 'ongoing'
    | 'finished'

  export interface Tournament {
    id: number

    name: string
    description?: string

    location: string

    start_date: string
    end_date: string

    reg_open?: string
    reg_close?: string

    contact_person?: string

    quota?: number
    registered_count?: number

    thb_url?: string
    rekom_url?: string

    status: TournamentStatus

    banner_url?: string

    categories?: string[]

    created_at?: string
    updated_at?: string
  }