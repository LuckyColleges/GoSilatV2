import pool from '../config/database'
import bcrypt from 'bcryptjs'

export interface UserRow {
  id: number
  name: string
  email: string
  password: string
  role: 'official' | 'admin'
  phone: string | null
  created_at: string
}

export const UserModel = {
  findByEmail: async (email: string): Promise<UserRow | null> => {
    const [rows] = await pool.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    ) as any
    return rows[0] || null
  },

  findById: async (id: number): Promise<UserRow | null> => {
    const [rows] = await pool.query(
      'SELECT * FROM users WHERE id = ?',
      [id]
    ) as any
    return rows[0] || null
  },

  create: async (data: {
    name: string
    email: string
    password: string
    phone?: string
    role?: string
  }): Promise<number> => {
    const hashedPassword = await bcrypt.hash(data.password, 12)
    const [result] = await pool.query(
      'INSERT INTO users (name, email, password, phone, role) VALUES (?, ?, ?, ?, ?)',
      [data.name, data.email, hashedPassword, data.phone || null, data.role || 'official']
    ) as any
    return result.insertId
  },

  findAll: async (): Promise<UserRow[]> => {
    const [rows] = await pool.query(
      'SELECT id, name, email, role, phone, created_at FROM users'
    ) as any
    return rows
  },

  delete: async (id: number): Promise<void> => {
    await pool.query('DELETE FROM users WHERE id = ?', [id])
  },
}