import { Response } from 'express'
import pool from '../config/database'
import { AuthRequest } from '../middleware/auth'

/**
 * CREATE ATHLETE
 */
export const createAthlete = async (
  req: AuthRequest,
  res: Response
) => {
  try {

    const {
      full_name,
      birth_place,
      birth_date,
      gender,
      nik,
      photo_athlete
    } = req.body

    const official_id = req.user.id

    if (
      !full_name ||
      !birth_place ||
      !birth_date ||
      !nik ||
      !gender
    ) {
      return res.status(400).json({
        message: 'Data wajib belum lengkap'
      })
    }

    const [result]: any = await pool.query(
      `
      INSERT INTO athletes
      (
        official_id,
        full_name,
        birth_place,
        birth_date,
        gender,
        nik,
        photo_athlete
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      [
        official_id,
        full_name,
        birth_place || null,
        birth_date,
        gender,
        nik || null,
        photo_athlete || null
      ]
    )

    res.status(201).json({
      message: 'Athlete berhasil dibuat',
      athlete_id: result.insertId
    })

  } catch (err: any) {
    res.status(500).json({
      message: err.message
    })
  }
}

/**
 * GET MY ATHLETES
 */
export const getMyAthletes = async (
  req: AuthRequest,
  res: Response
) => {
  try {

    const official_id = req.user.id

    const [rows]: any = await pool.query(
      `
      SELECT *
      FROM athletes
      WHERE official_id = ?
      ORDER BY id DESC
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

/**
 * GET DETAIL ATHLETE
 */
export const getAthleteDetail = async (
  req: AuthRequest,
  res: Response
) => {
  try {

    const { id } = req.params

    const official_id = req.user.id

    const [rows]: any = await pool.query(
      `
      SELECT *
      FROM athletes
      WHERE id = ?
      AND official_id = ?
      `,
      [id, official_id]
    )

    if (rows.length === 0) {
      return res.status(404).json({
        message: 'Athlete tidak ditemukan'
      })
    }

    res.json(rows[0])

  } catch (err: any) {
    res.status(500).json({
      message: err.message
    })
  }
}

/**
 * UPDATE ATHLETE
 */
export const updateAthlete = async (
  req: AuthRequest,
  res: Response
) => {
  try {

    const { id } = req.params

    const official_id = req.user.id

    const {
      full_name,
      birth_place,
      birth_date,
      gender,
      nik,
      photo_athlete
    } = req.body

    const [existing]: any = await pool.query(
      `
      SELECT *
      FROM athletes
      WHERE id = ?
      AND official_id = ?`,
      [id, official_id]
    )

    if (existing.length === 0) {
      return res.status(404).json({
        message: 'Athlete tidak ditemukan'
      })
    }

    await pool.query(
      `
      UPDATE athletes
      SET
        full_name = ?,
        birth_place = ?,
        birth_date = ?,
        gender = ?,
        nik = ?,
        photo_athlete = ?
      WHERE id = ?
      `,
      [
        full_name,
        birth_place || null,
        birth_date,
        gender,
        nik || null,
        photo_athlete || null,
        id
      ]
    )

    res.json({
      message: 'Athlete berhasil diupdate'
    })

  } catch (err: any) {
    res.status(500).json({
      message: err.message
    })
  }
}

/**
 * DELETE ATHLETE
 */
export const deleteAthlete = async (
  req: AuthRequest,
  res: Response
) => {
  try {

    const { id } = req.params
    const official_id = req.user.id

    const [existing]: any = await pool.query(
      `
      SELECT id
      FROM athletes
      WHERE id = ?
      AND official_id = ?
      `,
      [id, official_id]
    )

    if (existing.length === 0) {
      return res.status(404).json({
        message: 'Athlete tidak ditemukan'
      })
    }

    await pool.query(
      `
      DELETE FROM athletes
      WHERE id = ?
      `,
      [id]
    )

    res.json({
      message: 'Athlete berhasil dihapus'
    })

  } catch (err: any) {
    res.status(500).json({
      message: err.message
    })
  }
}