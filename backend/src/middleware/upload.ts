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

  if (type === 'banner') {
    const imageExt = ['.jpg', '.jpeg', '.png', '.webp']
    return imageExt.includes(ext) ? cb(null, true) : cb(new Error('Banner harus berupa file gambar'), false)
  }
  
  if (type === 'winner') {
    const excelExt = ['.xlsx', '.xls']
    return excelExt.includes(ext) ? cb(null, true) : cb(new Error('Pemenang harus berupa file Excel (.xlsx atau .xls)'), false)
  }
  
  const pdfExt = ['.pdf']
  return pdfExt.includes(ext) ? cb(null, true) : cb(new Error('THB/Rekom harus berupa file .pdf'), false)
}

export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // Limit 5MB
  },
})
