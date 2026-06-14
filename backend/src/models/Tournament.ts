import pool from '../config/database'

export interface TournamentRow {
  id: number
  name: string
  banner: string | null
  location: string
  start_date: string
  end_date: string
  quota: number
  registered_count: number
  status: 'coming_soon' | 'open' | 'closed' | 'ongoing' | 'finished'
  contact_person: string
  categories: string
  technical_handbook_url: string | null
  created_at: string
}

export const TournamentModel = {
  findAll: async (): Promise<TournamentRow[]> => {
    const [rows] = await pool.query(
      'SELECT * FROM tournaments ORDER BY created_at DESC'
    ) as any
    return rows
  },

  findById: async (id: number): Promise<TournamentRow | null> => {
    const [rows] = await pool.query(
      'SELECT * FROM tournaments WHERE id = ?',
      [id]
    ) as any
    return rows[0] || null
  },

  create: async (data: Partial<TournamentRow>): Promise<number> => {
    const [result] = await pool.query(
      `INSERT INTO tournaments 
        (name, location, start_date, end_date, quota, status, contact_person, categories)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.name,
        data.location,
        data.start_date,
        data.end_date,
        data.quota,
        data.status || 'coming_soon',
        data.contact_person,
        data.categories,
      ]
    ) as any
    return result.insertId
  },

  update: async (id: number, data: Partial<TournamentRow>): Promise<void> => {
    const fields = Object.keys(data).map((k) => `${k} = ?`).join(', ')
    const values = [...Object.values(data), id]
    await pool.query(`UPDATE tournaments SET ${fields} WHERE id = ?`, values)
  },

  delete: async (id: number): Promise<void> => {
    await pool.query('DELETE FROM tournaments WHERE id = ?', [id])
  },

  getSchedule: async (tournamentId: number) => {
    const [rows] = await pool.query(
      'SELECT * FROM tournament_schedules WHERE tournament_id = ? ORDER BY date ASC',
      [tournamentId]
    ) as any
    return rows
  },
}