import pool from '../config/database'
import bcrypt from 'bcryptjs'
import dotenv from 'dotenv'

dotenv.config()

/**
 * Script untuk membuat Admin secara manual lewat CLI
 * Cara jalankan: npm run create-admin
 */

const createAdmin = async () => {
  
  // isi manual di sini data user nya
  const name = 'Xia';
  const email = 'xiaxiaxia@gmail.com';
  const password = 'epep';

  if (!name || !email || !password) {
    console.error('❌ Error: Data tidak lengkap!')
    console.log('tolong isi data di dalam const name, email, password di dalam hardcodenya')
    process.exit(1)
  }

  try {
    console.log(`⏳ Sedang membuat akun admin untuk: ${email}...`)

    // 1. Cek apakah email sudah ada
    const [existing]: any = await pool.query('SELECT id FROM users WHERE email = ?', [email])
    if (existing.length > 0) {
      console.error('❌ Error: Email sudah terdaftar!')
      process.exit(1)
    }

    // 2. Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // 3. Insert ke database (role_id 1 = Admin)
    await pool.query(
      'INSERT INTO users (name, email, password, role_id) VALUES (?, ?, ?, ?)',
      [name, email, hashedPassword, 1]
    )

    console.log('✅ BERHASIL: Akun Admin telah dibuat!')
    console.log('-----------------------------------')
    console.log(`Name     : ${name}`)
    console.log(`Email    : ${email}`)
    console.log(`Password : ${password}`)
    console.log('-----------------------------------')
    
    process.exit(0)
  } catch (error: any) {
    console.error('❌ Error saat membuat admin:', error.message)
    process.exit(1)
  }
}

createAdmin()
