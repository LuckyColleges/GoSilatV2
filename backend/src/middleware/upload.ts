import multer from 'multer'
import path from 'path'
import crypto from 'crypto'

// Konfigurasi penyimpanan
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/')
  },
  filename: (req, file, cb) => {
    // Generate random name
    const randomName = crypto.randomBytes(16).toString('hex')
    const ext = path.extname(file.originalname)
    cb(null, `${randomName}${ext}`)
  },
})

// Filter file (Gambar, PDF, Excel)
const fileFilter = (req: any, file: any, cb: any) => {
  const type = req.body.type
  const ext = path.extname(file.originalname).toLowerCase()

  const imageExt = ['.jpg', '.jpeg', '.png', '.webp']
  const excelExt = ['.xlsx', '.xls']
  const pdfExt = ['.pdf']

  // Jika type tersedia di body (urutan field benar di FormData)
  if (type === 'banner') {
    return imageExt.includes(ext) ? cb(null, true) : cb(new Error('Banner harus berupa file gambar'), false)
  }
  
  if (type === 'winner') {
    return excelExt.includes(ext) ? cb(null, true) : cb(new Error('Pemenang harus berupa file Excel (.xlsx atau .xls)'), false)
  }

  if (type === 'thb' || type === 'rekom') {
    return pdfExt.includes(ext) ? cb(null, true) : cb(new Error('File harus berupa .pdf'), false)
  }
  
  // Fallback: Jika type belum tersedia (beberapa browser/library tidak menjamin urutan)
  // Kita izinkan jika ekstensinya termasuk salah satu yang didukung sistem
  const allAllowed = [...imageExt, ...excelExt, ...pdfExt]
  if (allAllowed.includes(ext)) {
    return cb(null, true)
  }

  return cb(new Error('Format file tidak didukung'), false)
}

export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // Limit 5MB
  },
})
