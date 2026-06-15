import { Request, Response } from 'express'
import pool from '../config/database'
import fs from 'fs'
import path from 'path'

const ALLOWED_STATUS = [
  'coming_soon',
  'registration_open',
  'registration_closed',
  'ongoing',
  'finished',
]

/* ======================================================
   UPLOAD TOURNAMENT FILE (THB, Rekomendasi, Jadwal)
====================================================== */
export const uploadTournamentFile = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { type } = req.body // 'thb' | 'rekom' | 'schedule "blm di pake"' | 'banner'
    const file = req.file

    if (!file) {
      return res.status(400).json({ message: 'Tidak ada file yang diunggah' })
    }

    if (!['thb', 'rekom', 'banner'].includes(type)) {
      // Hapus file jika tipe tidak valid
      fs.unlinkSync(file.path)
      return res.status(400).json({ message: 'Tipe dokumen tidak valid' })
    }

    const fileUrl = `/uploads/${file.filename}`
    const column = type === 'thb' ? 'thb_url' : 
                   type === 'rekom' ? 'rekom_url' : 'banner_url'

    // Update database
    await pool.query(
      `UPDATE tournaments SET ${column} = ? WHERE id = ?`,
      [fileUrl, id]
    )

    res.json({
      message: `${type.toUpperCase()} berhasil diunggah`,
      url: fileUrl
    })

  } catch (err: any) {
    res.status(500).json({ message: err.message })
  }
}

/* ======================================================
   CREATE TOURNAMENT
====================================================== */
export const createTournament = async (
  req: Request,
  res: Response
) => {
  const connection = await pool.getConnection()
  try {
    await connection.beginTransaction()

    const {
      name,
      description,
      location,
      banner_url,

      start_date,
      end_date,

      reg_open,
      reg_close,

      contact_person,

      quota,
      registered_count,

      thb_url,
      rekom_url,

      status,
      categories // Array of tingkat strings
    } = req.body

    // VALIDATION
    if (
      !name ||
      !location ||
      !start_date ||
      !end_date
    ) {
      await connection.rollback()
      return res.status(400).json({
        message:
          'Nama, lokasi, tanggal mulai, dan tanggal selesai wajib diisi',
      })
    }

    if (!categories || !Array.isArray(categories) || categories.length === 0) {
      await connection.rollback()
      return res.status(400).json({
        message: 'Pilih minimal 1 kategori tingkat pertandingan',
      })
    }

    const [result]: any = await connection.query(
      `
      INSERT INTO tournaments (
        name,
        description,
        location,
        banner_url,

        start_date,
        end_date,

        reg_open,
        reg_close,

        contact_person,

        quota,
        registered_count,

        thb_url,
        rekom_url,

        status
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        name,
        description || null,
        location,
        banner_url || null,

        start_date,
        end_date,

        reg_open || null,
        reg_close || null,

        contact_person || null,

        quota || 0,
        registered_count || 0,

        thb_url || null,
        rekom_url || null,

        status || 'coming_soon',
      ]
    )

    const tournamentId = result.insertId

    // 2. INSERT CATEGORIES
    for (const tingkat of categories) {
      await connection.query(
        'INSERT INTO tournament_categories (tournament_id, cat_tingkat) VALUES (?, ?)',
        [tournamentId, tingkat]
      )
    }

    await connection.commit()

    res.status(201).json({
      message:
        'Tournament berhasil dibuat',
      tournament_id: tournamentId,
    })

  } catch (err: any) {
    await connection.rollback()
    res.status(500).json({
      message: err.message,
    })
  } finally {
    connection.release()
  }
}

/* ======================================================
   GET ALL TOURNAMENTS
====================================================== */
export const getTournaments = async (
  req: Request,
  res: Response
) => {
  try {

    const [rows]: any = await pool.query(
      `
      SELECT t.*, 
        (SELECT COUNT(r.id) FROM registrations r WHERE r.tournament_id = t.id) as registered_count,
        (SELECT GROUP_CONCAT(cat_tingkat) FROM tournament_categories WHERE tournament_id = t.id) as tingkat_list
      FROM tournaments t
      ORDER BY t.created_at DESC
      `
    )

    res.json({
      total: rows.length,
      data: rows,
    })

  } catch (err: any) {

    res.status(500).json({
      message: err.message,
    })

  }
}

/* ======================================================
   GET DETAIL TOURNAMENT
====================================================== */
export const getTournamentDetail =
  async (
    req: Request,
    res: Response
  ) => {
    try {

      const { id } = req.params

      const [rows]: any =
        await pool.query(
          `
          SELECT t.*,
            (SELECT COUNT(r.id) FROM registrations r WHERE r.tournament_id = t.id) as registered_count
          FROM tournaments t
          WHERE t.id = ?
          `,
          [id]
        )

      if (rows.length === 0) {
        return res.status(404).json({
          message:
            'Tournament tidak ditemukan',
        })
      }

      // GET CATEGORIES
      const [cats]: any = await pool.query(
        'SELECT cat_tingkat FROM tournament_categories WHERE tournament_id = ?',
        [id]
      )

      res.json({
        message:
          'Detail tournament berhasil diambil',
        data: {
          ...rows[0],
          categories: cats.map((c: any) => c.cat_tingkat)
        },
      })

    } catch (err: any) {

      res.status(500).json({
        message: err.message,
      })

    }
  }

/* ======================================================
   UPDATE TOURNAMENT
====================================================== */
export const updateTournament = async (
  req: Request,
  res: Response
) => {
  const connection = await pool.getConnection()
  try {
    await connection.beginTransaction()
    const { id } = req.params

    const {
      name,
      description,
      location,
      banner_url,

      start_date,
      end_date,

      reg_open,
      reg_close,

      contact_person,

      quota,
      registered_count,

      thb_url,
      rekom_url,

      status,
      categories // Array tingkat
    } = req.body

    // CHECK EXIST
    const [existing]: any =
      await connection.query(
        `
        SELECT id
        FROM tournaments
        WHERE id = ?
        `,
        [id]
      )

    if (existing.length === 0) {
      await connection.rollback()
      return res.status(404).json({
        message:
          'Tournament tidak ditemukan',
      })
    }

    if (!categories || !Array.isArray(categories) || categories.length === 0) {
      await connection.rollback()
      return res.status(400).json({
        message: 'Pilih minimal 1 kategori tingkat pertandingan',
      })
    }

    await connection.query(
      `
      UPDATE tournaments
      SET
        name = ?,
        description = ?,
        location = ?,
        banner_url = ?,

        start_date = ?,
        end_date = ?,

        reg_open = ?,
        reg_close = ?,

        contact_person = ?,

        quota = ?,
        registered_count = ?,

        thb_url = ?,
        rekom_url = ?,

        status = ?

      WHERE id = ?
      `,
      [
        name,
        description || null,
        location,
        banner_url || null,

        start_date,
        end_date,

        reg_open || null,
        reg_close || null,

        contact_person || null,

        quota || 0,
        registered_count || 0,

        thb_url || null,
        rekom_url || null,

        status,

        id,
      ]
    )

    // SYNC CATEGORIES
    await connection.query('DELETE FROM tournament_categories WHERE tournament_id = ?', [id])
    for (const tingkat of categories) {
      await connection.query(
        'INSERT INTO tournament_categories (tournament_id, cat_tingkat) VALUES (?, ?)',
        [id, tingkat]
      )
    }

    await connection.commit()

    res.json({
      message:
        'Tournament berhasil diupdate',
    })

  } catch (err: any) {
    await connection.rollback()
    res.status(500).json({
      message: err.message,
    })
  } finally {
    connection.release()
  }
}

/* ======================================================
   DELETE TOURNAMENT
====================================================== */
export const deleteTournament = async (
  req: Request,
  res: Response
) => {
  try {

    const { id } = req.params

    // CHECK EXIST
    const [existing]: any =
      await pool.query(
        `
        SELECT id
        FROM tournaments
        WHERE id = ?
        `,
        [id]
      )

    if (existing.length === 0) {
      return res.status(404).json({
        message:
          'Tournament tidak ditemukan',
      })
    }

    await pool.query(
      `
      DELETE FROM tournaments
      WHERE id = ?
      `,
      [id]
    )

    res.json({
      message:
        'Tournament berhasil dihapus',
    })

  } catch (err: any) {

    res.status(500).json({
      message: err.message,
    })

  }
}

// GET CATEGORIES BY TOURNAMENT
export const getCategories = async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    const [rows] = await pool.query(
      `SELECT 
        c.id,
        c.name,
        c.tingkat,
        c.gender,
        c.min_age,
        c.max_age,
        c.min_weight,
        c.max_weight,
        c.cat_type_id,
        ct.type_name
      FROM categories c
      LEFT JOIN category_types ct ON c.cat_type_id = ct.id
      WHERE c.tingkat IN (
        SELECT cat_tingkat FROM tournament_categories WHERE tournament_id = ?
      )
      ORDER BY c.tingkat ASC, c.name ASC`,
      [id]
    ) as any

    return res.json({
      data: rows
    })
  } catch (error) {
    return res.status(500).json({ message: 'Server error.' })
  }
}

export const getTingkatOptions = async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    const [rows] = await pool.query(
      `SELECT DISTINCT cat_tingkat
      FROM tournament_categories
      WHERE tournament_id = ?
      ORDER BY FIELD(cat_tingkat, 'usia_dini_1','usia_dini_2','pra_remaja','remaja','dewasa')`,
      [id]
    ) as any

    const tingkatList = rows.map((r: any) => r.cat_tingkat)
    return res.json({
      data: tingkatList
    })
  } catch (error) {
    return res.status(500).json({ message: 'Server error.' })
  }
}

export const getCategoryTypes = async (req: Request, res: Response) => {
  try {
    const [rows]: any = await pool.query('SELECT * FROM category_types ORDER BY id ASC')
    return res.json({
      data: rows
    })
  } catch (error) {
    return res.status(500).json({ message: 'Server error.' })
  }
}
