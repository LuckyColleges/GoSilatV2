import { Response } from 'express'
import pool from '../config/database'
import { AuthRequest } from '../middleware/auth'
import * as XLSX from 'xlsx'

/**
 * EXPORT REGISTRATIONS TO EXCEL
 */
export const exportRegistrationsToExcel = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { id } = req.params
    const { official_id, contingent_name } = req.query

    let query = `
      SELECT 
        r.id AS 'id_registrasi',
        a.full_name AS 'nama_atlit',
        a.nik AS 'nik',
        a.birth_place AS 'tempat_lahir',
        a.birth_date AS 'tanggal_lahir',
        a.gender AS 'gender',
        c.name AS 'kategori',
        c.tingkat AS 'tingkat',
        ct.name AS 'kontingen',
        r.school_name AS 'sekolah_perguruan',
        r.weight AS 'bb',
        r.height AS 'tb',
        r.payment_status AS 'status_pembayaran',
        u.name AS 'official'
      FROM registrations r
      JOIN athletes a ON r.athlete_id = a.id
      LEFT JOIN categories c ON r.category_id = c.id
      JOIN contingents ct ON r.contingent_id = ct.id
      JOIN users u ON r.official_id = u.id
      WHERE r.tournament_id = ?
    `
    const params: any[] = [id]

    if (official_id) {
      query += ` AND r.official_id = ?`
      params.push(official_id)
    }

    if (contingent_name) {
      query += ` AND ct.name = ?`
      params.push(contingent_name)
    }

    query += ` ORDER BY ct.name ASC, c.tingkat ASC, a.full_name ASC`

    const [rows]: any = await pool.query(query, params)

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Tidak ada data registrasi untuk diexport' })
    }

    const worksheet = XLSX.utils.json_to_sheet(rows)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Registrations')

    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' })

    res.setHeader('Content-Disposition', `attachment; filename="registrations_tournament_${id}.xlsx"`)
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    res.send(buffer)

  } catch (err: any) {
    res.status(500).json({ message: err.message })
  }
}

/**
 * CREATE REGISTRATION
 */
export const createRegistration = async (
  req: AuthRequest,
  res: Response
) => {
  try {

    const {
        tournament_id,
        athlete_id,
        category_id,
        contingent_id,
        weight,
        school_name,
        payment_status
        } = req.body

    const official_id = req.user.id

    // VALIDASI WAJIB
    if (
      !tournament_id ||
      !athlete_id ||
      !category_id ||
      !contingent_id
    ) {
      return res.status(400).json({
        message: 'Data wajib belum lengkap'
      })
    }

    /**
     * CEK ATHLETE MILIK OFFICIAL
     */
    const [athletes]: any = await pool.query(
      `
      SELECT *
      FROM athletes
      WHERE id = ?
      AND official_id = ?
      `,
      [athlete_id, official_id]
    )

    if (athletes.length === 0) {
      return res.status(403).json({
        message: 'Athlete bukan milik official ini'
      })
    }

    /**
     * CEK CONTINGENT MILIK OFFICIAL
     */
    const [contingents]: any = await pool.query(
        `
        SELECT *
        FROM contingents
        WHERE id = ?
        AND official_id = ?
        `,
        [contingent_id, official_id]
        )

        if (contingents.length === 0) {
        return res.status(403).json({
            message: 'Contingent bukan milik official ini'
        })
        }

    /**
     * CEK DUPLIKAT REGISTRATION
     */
    const [existing]: any = await pool.query(
      `
      SELECT id
      FROM registrations
      WHERE tournament_id = ?
      AND athlete_id = ?
      `,
      [tournament_id, athlete_id]
    )

    if (existing.length > 0) {
      return res.status(400).json({
        message: 'Athlete sudah terdaftar di tournament ini'
      })
    }

    /**
     * INSERT REGISTRATION
     */
    const [result]: any = await pool.query(
      `
      INSERT INTO registrations
      (
        tournament_id,
        athlete_id,
        category_id,
        contingent_id,
        official_id,
        weight,
        school_name,
        payment_status
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        tournament_id,
        athlete_id,
        category_id,
        contingent_id,
        official_id,
        weight || null,
        school_name || null,
        payment_status || 'pending'
      ]
    )

    res.status(201).json({
      message: 'Registration berhasil dibuat',
      registration_id: result.insertId
    })

  } catch (err: any) {
    res.status(500).json({
      message: err.message
    })
  }
}

/**
 * GET MY REGISTRATIONS
 */
export const getMyRegistrations = async (
  req: AuthRequest,
  res: Response
) => {
  try {

    const official_id = req.user.id

    const [rows]: any = await pool.query(
      `
      SELECT
        r.id,
        r.weight,
        r.school_name,
        r.payment_status,

        a.full_name AS athlete_name,

        t.name AS tournament_name,

        c.name AS category_name,

        ct.name AS contingent_name

      FROM registrations r

      JOIN athletes a
      ON r.athlete_id = a.id

      JOIN tournaments t
      ON r.tournament_id = t.id

      JOIN categories c
      ON r.category_id = c.id

      JOIN contingents ct
      ON r.contingent_id = ct.id

      WHERE r.official_id = ?

      ORDER BY r.id DESC
      `,
      [official_id]
    )

    res.json({
      total: rows.length,
      data: rows
    })

  } catch (err: any) {
    res.status(500).json({
      message: err.message
    })
  }
}

export const updateRegistration = async (
  req: AuthRequest,
  res: Response
) => {
  try {

    const { id } = req.params

    const {
      category_id,
      contingent_id,
      weight,
      school_name,
      payment_status
    } = req.body

    const official_id = req.user.id

    /**
     * CEK REGISTRATION MILIK OFFICIAL
     */
    const [existing]: any = await pool.query(
      `
      SELECT *
      FROM registrations
      WHERE id = ?
      AND official_id = ?
      `,
      [id, official_id]
    )

    if (existing.length === 0) {
      return res.status(404).json({
        message: 'Registration tidak ditemukan'
      })
    }

    // check kontingen milik oficial
    const [contingents]: any = await pool.query(
        `
        SELECT *
        FROM contingents
        WHERE id = ?
        AND official_id = ?
        `,
        [contingent_id, official_id]
        )

        if (contingents.length === 0) {
        return res.status(403).json({
            message: 'Contingent bukan milik official ini'
        })
        }

    /**
     * UPDATE
     */
    await pool.query(
      `
      UPDATE registrations
      SET
        category_id = ?,
        contingent_id = ?,
        weight = ?,
        school_name = ?,
        payment_status = ?
      WHERE id = ?
      `,
      [
        category_id,
        contingent_id,
        weight || null,
        school_name || null,
        payment_status || 'pending',
        id
      ]
    )

    res.json({
      message: 'Registration berhasil diupdate'
    })

  } catch (err: any) {
    res.status(500).json({
      message: err.message
    })
  }
}

export const getTournamentRegistrations = async (
  req: AuthRequest,
  res: Response
) => {
  try {

    const { id } = req.params
    const { official_id, contingent_name } = req.query

    let query = `
      SELECT
        r.id,
        r.weight,
        r.height,
        r.school_name,
        r.payment_status,
        r.status_reg,

        a.full_name AS athlete_name,
        a.nik AS nik,
        a.birth_date AS birth_date,

        c.name AS category_name,
        c.tingkat AS category_tingkat,

        u.name AS official_name,
        
        ct.name AS contingent_name

      FROM registrations r

      JOIN athletes a
      ON r.athlete_id = a.id

      LEFT JOIN categories c
      ON r.category_id = c.id

      JOIN users u
      ON r.official_id = u.id

      JOIN contingents ct
      ON r.contingent_id = ct.id

      WHERE r.tournament_id = ?
    `
    const params: any[] = [id]

    if (official_id && official_id !== 'undefined' && official_id !== '') {
      query += ` AND r.official_id = ?`
      params.push(official_id)
    }

    if (contingent_name && contingent_name !== 'undefined' && contingent_name !== '') {
      query += ` AND ct.name = ?`
      params.push(contingent_name)
    }

    query += ` ORDER BY ct.name ASC, r.id DESC`

    const [rows]: any = await pool.query(query, params)

    res.json({
      total: rows.length,
      data: rows
    })

  } catch (err: any) {
    res.status(500).json({
      message: err.message
    })
  }
}

/**
 * CREATE BATCH REGISTRATION
 */
export const createBatchRegistration = async (
  req: AuthRequest,
  res: Response
) => {
  const connection = await pool.getConnection()
  try {
    await connection.beginTransaction()

    const {
      tournament_id,
      contingent_name,
      athletes
    } = req.body

    const official_id = req.user.id

    if (!tournament_id || !contingent_name || !athletes || !Array.isArray(athletes)) {
      return res.status(400).json({ message: 'Data tidak lengkap' })
    }

    // CEK APAKAH OFFICIAL SUDAH PERNAH DAFTAR DI TOURNAMENT INI
    // Jika sudah ada, hapus dulu agar sinkron dengan data baru (Flexibility)
    await connection.query(
      'DELETE FROM registrations WHERE tournament_id = ? AND official_id = ?',
      [tournament_id, official_id]
    )

    // 1. Get or Create Contingent
    let contingent_id: number
    const [existingContingent]: any = await connection.query(
      'SELECT id FROM contingents WHERE name = ? AND official_id = ?',
      [contingent_name, official_id]
    )

    if (existingContingent.length > 0) {
      contingent_id = existingContingent[0].id
    } else {
      const [newContingent]: any = await connection.query(
        'INSERT INTO contingents (name, official_id) VALUES (?, ?)',
        [contingent_name, official_id]
      )
      contingent_id = newContingent.insertId
    }

    const registrationIds = []

    for (const athleteData of athletes) {
      let athlete_id = athleteData.id

      // 2. Create or Update Athlete
      if (!athlete_id) {
        // Check by NIK globally
        const [existingAthlete]: any = await connection.query(
          'SELECT id FROM athletes WHERE nik = ?',
          [athleteData.nik]
        )

        if (existingAthlete.length > 0) {
          athlete_id = existingAthlete[0].id
          // Update existing athlete with fresh data
          await connection.query(
            `UPDATE athletes SET 
              full_name = ?, birth_place = ?, birth_date = ?, gender = ?
             WHERE id = ?`,
            [athleteData.full_name, athleteData.birth_place, athleteData.birth_date, athleteData.gender, athlete_id]
          )
        } else {
          // Create new athlete
          const [newAthlete]: any = await connection.query(
            `INSERT INTO athletes (full_name, birth_place, birth_date, gender, nik, official_id)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [athleteData.full_name, athleteData.birth_place, athleteData.birth_date, athleteData.gender, athleteData.nik, official_id]
          )
          athlete_id = newAthlete.insertId
        }
      } else {
        // If ID provided, still update to sync data
        await connection.query(
          `UPDATE athletes SET 
            full_name = ?, birth_place = ?, birth_date = ?, gender = ?
           WHERE id = ?`,
          [athleteData.full_name, athleteData.birth_place, athleteData.birth_date, athleteData.gender, athlete_id]
        )
      }

      // 3. Register for tournament
      // Check if already registered
      const [isRegistered]: any = await connection.query(
        'SELECT id FROM registrations WHERE tournament_id = ? AND athlete_id = ?',
        [tournament_id, athlete_id]
      )

      if (isRegistered.length > 0) {
        // Already registered, skip or update? User didn't specify, let's skip for now but we could throw error if needed
        continue
      }

      const [regResult]: any = await connection.query(
        `INSERT INTO registrations 
          (tournament_id, athlete_id, contingent_id, category_id, official_id, weight, height, school_name, payment_status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          tournament_id,
          athlete_id,
          contingent_id,
          athleteData.category_id || null,
          official_id,
          athleteData.weight || null,
          athleteData.height || null,
          athleteData.school_name || null,
          'pending'
        ]
      )
      registrationIds.push(regResult.insertId)
    }

    await connection.commit()
    res.status(201).json({
      message: `${registrationIds.length} atlit berhasil didaftarkan`,
      registration_ids: registrationIds
    })

  } catch (err: any) {
    await connection.rollback()
    res.status(500).json({ message: err.message })
  } finally {
    connection.release()
  }
}

/**
 * DELETE REGISTRATION
 */
export const deleteRegistration = async (
  req: AuthRequest,
  res: Response
) => {
  try {

    const { id } = req.params

    const official_id = req.user.id

    const [existing]: any = await pool.query(
      `
      SELECT *
      FROM registrations
      WHERE id = ?
      AND official_id = ?
      `,
      [id, official_id]
    )

    if (existing.length === 0) {
      return res.status(404).json({
        message: 'Registration tidak ditemukan'
      })
    }

    await pool.query(
      `
      DELETE FROM registrations
      WHERE id = ?
      `,
      [id]
    )

    res.json({
      message: 'Registration berhasil dihapus'
    })

  } catch (err: any) {
    res.status(500).json({
      message: err.message
    })
  }
}

/**
 * GET MY REGISTRATION SUMMARY (Grouped by Tournament)
 */
export const getMyRegistrationSummary = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const official_id = req.user.id

    const [rows]: any = await pool.query(
      `
      SELECT 
        t.id AS tournament_id,
        t.name AS tournament_name,
        t.location AS tournament_location,
        r.status_reg,
        r.payment_status,
        COUNT(r.id) AS athlete_count,
        MAX(r.created_at) AS registered_at
      FROM registrations r
      JOIN tournaments t ON r.tournament_id = t.id
      WHERE r.official_id = ?
      GROUP BY t.id
      ORDER BY registered_at DESC
      `,
      [official_id]
    )

    res.json({
      data: rows
    })
  } catch (err: any) {
    res.status(500).json({ message: err.message })
  }
}

/**
 * GET MY REGISTRATIONS FOR SPECIFIC TOURNAMENT
 */
export const getMyRegistrationsByTournament = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { eventId } = req.params
    const official_id = req.user.id

    const [rows]: any = await pool.query(
      `
      SELECT 
        r.*,
        a.full_name, a.nik, a.birth_place, a.birth_date, a.gender,
        c.name AS category_name, c.tingkat AS category_tingkat,
        ct.name AS contingent_name
      FROM registrations r
      JOIN athletes a ON r.athlete_id = a.id
      LEFT JOIN categories c ON r.category_id = c.id
      JOIN contingents ct ON r.contingent_id = ct.id
      WHERE r.official_id = ? AND r.tournament_id = ?
      `,
      [official_id, eventId]
    )

    res.json({
      data: rows
    })
  } catch (err: any) {
    res.status(500).json({ message: err.message })
  }
}

