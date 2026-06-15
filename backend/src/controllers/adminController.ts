import { Request, Response } from 'express'
import pool from '../config/database'

/**
 * GET ALL USERS
 */
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const [rows]: any = await pool.query(
      `
      SELECT 
        u.id, 
        u.name, 
        u.email, 
        u.role_id, 
        r.role_name,
        u.phone_number, 
        u.created_at
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id
      ORDER BY u.created_at DESC
      `
    )

    res.json({
      total: rows.length,
      data: rows
    })
  } catch (err: any) {
    res.status(500).json({ message: err.message })
  }
}

/**
 * UPDATE USER ROLE
 */
export const updateUserRole = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { role_id } = req.body

    if (!role_id) {
      return res.status(400).json({ message: 'role_id wajib diisi' })
    }

    await pool.query(
      'UPDATE users SET role_id = ? WHERE id = ?',
      [role_id, id]
    )

    res.json({ message: 'Role user berhasil diupdate' })
  } catch (err: any) {
    res.status(500).json({ message: err.message })
  }
}

/**
 * DELETE USER
 */
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    // Prevent deleting self? (Optional but good)
    // if (Number(id) === (req as any).user.id) {
    //   return res.status(400).json({ message: 'Tidak bisa menghapus akun sendiri' })
    // }

    await pool.query('DELETE FROM users WHERE id = ?', [id])

    res.json({ message: 'User berhasil dihapus' })
  } catch (err: any) {
    res.status(500).json({ message: err.message })
  }
}

/**
 * GET ALL REGISTRATIONS (for Approval)
 * Grouped by official and tournament to match frontend expectation
 */
export const getAllRegistrations = async (req: Request, res: Response) => {
  try {
    const [rows]: any = await pool.query(
      `
      SELECT 
        r.official_id,
        u.name AS official_name,
        t.id AS tournament_id,
        t.name AS event_name,
        ct.name AS contingent_name,
        COUNT(r.id) AS athlete_count,
        r.status_reg,
        MAX(r.created_at) AS submitted_at
      FROM registrations r
      JOIN users u ON r.official_id = u.id
      JOIN tournaments t ON r.tournament_id = t.id
      JOIN contingents ct ON r.contingent_id = ct.id
      GROUP BY r.official_id, r.tournament_id, r.status_reg, ct.id
      ORDER BY submitted_at DESC
      `
    )

    res.json({
      total: rows.length,
      data: rows
    })
  } catch (err: any) {
    res.status(500).json({ message: err.message })
  }
}

/**
 * UPDATE REGISTRATION STATUS (Approve/Reject)
 * This updates all registrations for a specific official, tournament, and contingent
 */
export const updateRegistrationStatus = async (req: Request, res: Response) => {
  try {
    const { official_id, tournament_id, contingent_name } = req.query
    const { status } = req.body // 'approved' | 'rejected'

    if (!status || !['approved', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({ message: 'Status tidak valid' })
    }

    if (!official_id || !tournament_id || !contingent_name) {
      return res.status(400).json({ message: 'Parameter tidak lengkap' })
    }

    // Since the UI groups by contingent name, we might need to find the contingent_id or just use the name
    const [result]: any = await pool.query(
      `
      UPDATE registrations r
      JOIN contingents ct ON r.contingent_id = ct.id
      SET r.status_reg = ?
      WHERE r.official_id = ? 
        AND r.tournament_id = ?
        AND ct.name = ?
      `,
      [status, Number(official_id), Number(tournament_id), contingent_name]
    )

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Data pendaftaran tidak ditemukan' })
    }

    res.json({ message: `Pendaftaran berhasil di-${status}` })
  } catch (err: any) {
    res.status(500).json({ message: err.message })
  }
}

/**
 * UPDATE PAYMENT STATUS BY CONTINGENT
 */
export const updatePaymentStatusByContingent = async (req: Request, res: Response) => {
  try {
    const { official_id, tournament_id, contingent_name } = req.query
    const { payment_status } = req.body // 'paid' | 'failed' | 'pending'

    if (!payment_status || !['paid', 'failed', 'pending'].includes(payment_status)) {
      return res.status(400).json({ message: 'Status pembayaran tidak valid' })
    }

    if (!official_id || !tournament_id || !contingent_name) {
      return res.status(400).json({ message: 'Parameter tidak lengkap' })
    }

    const [result]: any = await pool.query(
      `
      UPDATE registrations r
      JOIN contingents ct ON r.contingent_id = ct.id
      SET r.payment_status = ?
      WHERE r.official_id = ? 
        AND r.tournament_id = ?
        AND ct.name = ?
      `,
      [payment_status, Number(official_id), Number(tournament_id), contingent_name]
    )

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Data pendaftaran tidak ditemukan' })
    }

    res.json({ message: `Status pembayaran kontingen berhasil diupdate menjadi ${payment_status}` })
  } catch (err: any) {
    res.status(500).json({ message: err.message })
  }
}

/**
 * GET DASHBOARD STATS
 */
export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const [userCount]: any = await pool.query('SELECT COUNT(*) as count FROM users')
    const [tournamentCount]: any = await pool.query('SELECT COUNT(*) as count FROM tournaments')
    const [athleteCount]: any = await pool.query('SELECT COUNT(*) as count FROM athletes')
    const [registrationCount]: any = await pool.query('SELECT COUNT(*) as count FROM registrations')
    const [pendingCount]: any = await pool.query("SELECT COUNT(*) as count FROM registrations WHERE status_reg = 'pending'")

    res.json({
      users: userCount[0].count,
      tournaments: tournamentCount[0].count,
      athletes: athleteCount[0].count,
      registrations: registrationCount[0].count,
      pendingRegistrations: pendingCount[0].count
    })
  } catch (err: any) {
    res.status(500).json({ message: err.message })
  }
}

/**
 * WINNER MANAGEMENT
 */
import * as XLSX from 'xlsx'
import fs from 'fs'

/**
 * WINNER MANAGEMENT
 */
export const uploadWinnersExcel = async (req: Request, res: Response) => {
  console.log('BODY:', req.body)
  console.log('FILE:', req.file)

  const connection = await pool.getConnection()
  try {
    const { id: tournament_id } = req.params
    const file = req.file

    if (!file) {
      return res.status(400).json({ message: 'Tidak ada file yang diunggah' })
    }

    // 1. READ EXCEL
    const workbook = XLSX.readFile(file.path)
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]
    const data: any[] = XLSX.utils.sheet_to_json(worksheet)

    if (data.length === 0) {
      fs.unlinkSync(file.path)
      return res.status(400).json({ message: 'File Excel kosong' })
    }

    await connection.beginTransaction()

    // 2. CLEAR EXISTING WINNERS FOR THIS TOURNAMENT (Optional, depend on requirement)
    // await connection.query('DELETE FROM winners WHERE tournament_id = ?', [tournament_id])

    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[]
    }

    for (const row of data) {
      try {
        const nik = row.nik || row.NIK
        const nama = row.nama || row.Nama || row.name || row.Name
        const cat_name = row.kategori || row.Kategori
        const tingkat = row.tingkat || row.Tingkat
        const gender = (row.gender || row.Gender || '').toLowerCase()
        const rank = row.rank || row.Rank || row.juara || row.Juara

        if (!nik || !cat_name || !tingkat || !rank) {
          throw new Error(`Data tidak lengkap di baris: ${JSON.stringify(row)}`)
        }

        // A. FIND ATHLETE
        const [athletes]: any = await connection.query('SELECT id FROM athletes WHERE nik = ?', [nik])
        if (athletes.length === 0) {
          throw new Error(`Atlit ${nama || ''} (NIK: ${nik}) tidak ditemukan di database master atlit`)
        }
        const athlete_id = athletes[0].id

        // B. FIND CATEGORY
        const [categories]: any = await connection.query(
          'SELECT id FROM categories WHERE name = ? AND tingkat = ? AND gender = ?',
          [cat_name, tingkat, gender]
        )
        if (categories.length === 0) {
          throw new Error(`Kategori ${cat_name} (${tingkat}, ${gender}) untuk atlit ${nama || nik} tidak ditemukan`)
        }
        const category_id = categories[0].id

        // C. FIND CONTINGENT FROM REGISTRATION
        const [regs]: any = await connection.query(
          'SELECT contingent_id FROM registrations WHERE tournament_id = ? AND athlete_id = ? LIMIT 1',
          [tournament_id, athlete_id]
        )
        const contingent_id = regs.length > 0 ? regs[0].contingent_id : null

        // D. INSERT WINNER
        // Check if already exists to avoid duplicate
        const [existing]: any = await connection.query(
          'SELECT id FROM winners WHERE tournament_id = ? AND athlete_id = ? AND category_id = ?',
          [tournament_id, athlete_id, category_id]
        )

        if (existing.length > 0) {
          await connection.query(
            'UPDATE winners SET rank = ? WHERE id = ?',
            [rank, existing[0].id]
          )
        } else {
          await connection.query(
            'INSERT INTO winners (tournament_id, athlete_id, contingent_id, category_id, rank) VALUES (?, ?, ?, ?, ?)',
            [tournament_id, athlete_id, contingent_id, category_id, rank]
          )
        }

        results.success++
      } catch (err: any) {
        results.failed++
        results.errors.push(err.message)
      }
    }

    await connection.commit()
    fs.unlinkSync(file.path) // Delete temp file

    res.json({
      message: 'Proses upload selesai',
      summary: results
    })

  } catch (err: any) {
    await connection.rollback()
    if (req.file) fs.unlinkSync(req.file.path)
    res.status(500).json({ message: err.message })
  } finally {
    connection.release()
  }
}

export const createWinner = async (req: Request, res: Response) => {
  try {
    const { tournament_id, athlete_id, contingent_id, category_id, rank } = req.body
    await pool.query(
      'INSERT INTO winners (tournament_id, athlete_id, contingent_id, category_id, rank) VALUES (?, ?, ?, ?, ?)',
      [tournament_id, athlete_id, contingent_id, category_id, rank]
    )
    res.status(201).json({ message: 'Pemenang berhasil ditambahkan' })
  } catch (err: any) {
    res.status(500).json({ message: err.message })
  }
}

export const deleteWinner = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    await pool.query('DELETE FROM winners WHERE id = ?', [id])
    res.json({ message: 'Pemenang berhasil dihapus' })
  } catch (err: any) {
    res.status(500).json({ message: err.message })
  }
}

/**
 * CATEGORY MANAGEMENT
 */
export const getAllCategories = async (req: Request, res: Response) => {
  try {
    const [rows]: any = await pool.query('SELECT * FROM categories ORDER BY tingkat ASC, name ASC')
    res.json(rows)
  } catch (err: any) {
    res.status(500).json({ message: err.message })
  }
}

export const createCategory = async (req: Request, res: Response) => {
  try {
    const { name, tingkat, min_age, max_age, cat_type_id, gender, min_weight, max_weight } = req.body
    await pool.query(
      `INSERT INTO categories (name, tingkat, min_age, max_age, cat_type_id, gender, min_weight, max_weight) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, tingkat, min_age, max_age, cat_type_id, gender, min_weight, max_weight]
    )
    res.status(201).json({ message: 'Kategori berhasil dibuat' })
  } catch (err: any) {
    res.status(500).json({ message: err.message })
  }
}

