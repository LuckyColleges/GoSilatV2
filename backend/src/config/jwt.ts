import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'gosilat_secret'

export default JWT_SECRET