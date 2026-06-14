import { Response } from 'express'
import pool from '../config/database'
import { AuthRequest } from '../middleware/auth'

/**
 * CREATE CONTINGENT
 */
export const createContingent = async (
  req: AuthRequest,
  res: Response
) => {
  try {

    const {
      name,
    } = req.body

    const official_id = req.user.id

    if (!name) {
      return res.status(400).json({
        message: 'Nama contingent wajib'
      })
    }

    const [result]: any = await pool.query(
      `
      INSERT INTO contingents
      (
        official_id,
        name,
      )
      VALUES (?, ?, ?, ?, ?)
      `,
      [
        official_id,
        name,
      ]
    )

    res.status(201).json({
      message: 'Contingent berhasil dibuat',
      contingent_id: result.insertId
    })

  } catch (err: any) {
    res.status(500).json({
      message: err.message
    })
  }
}

/**
 * GET MY CONTINGENTS
 */
export const getMyContingents = async (
  req: AuthRequest,
  res: Response
) => {
  try {

    const official_id = req.user.id

    const [rows]: any = await pool.query(
      `
      SELECT *
      FROM contingents
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
 * GET DETAIL CONTINGENT
 */
export const getContingentDetail = async (
  req: AuthRequest,
  res: Response
) => {
  try {

    const { id } = req.params

    const official_id = req.user.id

    const [rows]: any = await pool.query(
      `
      SELECT *
      FROM contingents
      WHERE id = ?
      AND official_id = ?
      `,
      [id, official_id]
    )

    if (rows.length === 0) {
      return res.status(404).json({
        message: 'Contingent tidak ditemukan'
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
 * UPDATE CONTINGENT
 */
export const updateContingent = async (
  req: AuthRequest,
  res: Response
) => {
  try {

    const { id } = req.params

    const {
      name,
      logo,
      address,
      coach_name
    } = req.body

    const official_id = req.user.id

    const [existing]: any = await pool.query(
      `
      SELECT *
      FROM contingents
      WHERE id = ?
      AND official_id = ?
      `,
      [id, official_id]
    )

    if (existing.length === 0) {
      return res.status(404).json({
        message: 'Contingent tidak ditemukan'
      })
    }

    await pool.query(
      `
      UPDATE contingents
      SET
        name = ?,
        logo = ?,
        address = ?,
        coach_name = ?
      WHERE id = ?
      `,
      [
        name,
        logo || null,
        address || null,
        coach_name || null,
        id
      ]
    )

    res.json({
      message: 'Contingent berhasil diupdate'
    })

  } catch (err: any) {
    res.status(500).json({
      message: err.message
    })
  }
}

/**
 * DELETE CONTINGENT
 */
export const deleteContingent = async (
  req: AuthRequest,
  res: Response
) => {
  try {

    const { id } = req.params

    const official_id = req.user.id

    const [existing]: any = await pool.query(
      `
      SELECT *
      FROM contingents
      WHERE id = ?
      AND official_id = ?
      `,
      [id, official_id]
    )

    if (existing.length === 0) {
      return res.status(404).json({
        message: 'Contingent tidak ditemukan'
      })
    }

    await pool.query(
      `
      DELETE FROM contingents
      WHERE id = ?
      `,
      [id]
    )

    res.json({
      message: 'Contingent berhasil dihapus'
    })

  } catch (err: any) {
    res.status(500).json({
      message: err.message
    })
  }
}