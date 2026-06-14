import { Request, Response } from 'express'
import pool from '../config/database'

export const getWinnersByTournament = async (req: Request, res: Response) => {
  try {
    const { tournament_id } = req.query

    if (!tournament_id) {
      return res.status(400).json({ message: 'tournament_id wajib diisi.' })
    }

    const [rows] = await pool.query(
      `SELECT 
        w.id,
        w.rank,
        w.tournament_id,
        t.name AS tournament_name,
        w.athlete_id,
        a.full_name AS athlete_name,
        a.gender AS athlete_gender,
        w.contingent_id,
        c.name AS contingent_name,
        w.category_id,
        cat.name AS category_name,
        cat.min_weight,
        cat.max_weight,
        ct.type_name AS category_type
      FROM winners w
      LEFT JOIN tournaments t ON w.tournament_id = t.id
      LEFT JOIN athletes a ON w.athlete_id = a.id
      LEFT JOIN contingents c ON w.contingent_id = c.id
      LEFT JOIN categories cat ON w.category_id = cat.id
      LEFT JOIN category_types ct ON cat.cat_type_id = ct.id
      WHERE w.tournament_id = ?
      ORDER BY cat.name ASC, w.rank ASC`,
      [tournament_id]
    ) as any

    return res.json(rows)
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: 'Server error.' })
  }
}