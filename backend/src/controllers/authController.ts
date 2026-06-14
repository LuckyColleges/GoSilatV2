import { Request, Response } from 'express'
import pool from '../config/database'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import JWT_SECRET from '../config/jwt'

export const register = async (req: Request, res: Response) => {
  try {
    const {
      name,
      email,
      password,
      phone_number,
      role_id
    } = req.body

    // VALIDASI
    if (!name || !email || !password) {
      return res.status(400).json({
        message: 'Data wajib belum lengkap'
      })
    }

    // CHECK EMAIL
    const [existing]: any = await pool.query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    )

    if (existing.length > 0) {
      return res.status(400).json({
        message: 'Email sudah digunakan'
      })
    }

    // HASH PASSWORD
    const hashedPassword = await bcrypt.hash(password, 10)

    // INSERT USER
    const [result]: any = await pool.query(
      `
      INSERT INTO users
      (name, email, password, phone_number, role_id)
      VALUES (?, ?, ?, ?, ?)
      `,
      [
        name,
        email,
        hashedPassword,
        phone_number || null,
        role_id || 2
      ]
    )

    res.status(201).json({
      message: 'Register berhasil',
      user_id: result.insertId
    })

  } catch (err: any) {
    res.status(500).json({
      message: err.message
    })
  }
}

export const login = async (req: Request, res: Response) => {
  try {
    const { login, password } = req.body

    // VALIDASI
    if (!login || !password) {
      return res.status(400).json({
        message: 'Login user dan password wajib di isi'
      })
    }

    // CEK USER
    const [rows]: any = await pool.query(
      `
      SELECT *
      FROM users
      WHERE email = ?
      OR name = ?
      `,
      [login, login]
    )

    if (rows.length === 0) {
      return res.status(401).json({
        message: 'User tidak ditemukan'
      })
    }

    const user = rows[0]

    // CEK PASSWORD
    const isMatch = await bcrypt.compare(
      password,
      user.password
    )

    if (!isMatch) {
      return res.status(401).json({
        message: 'Password salah'
      })
    }

    // GENERATE TOKEN
    const token = jwt.sign(
      {
        id: user.id,
        role_id: user.role_id
      },
      JWT_SECRET,
      {
        expiresIn: '7d'
      }
    )

    res.json({
      message: 'Login berhasil',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role_id: user.role_id
      }
    })

  } catch (err: any) {
    res.status(500).json({
      message: err.message
    })
  }
}