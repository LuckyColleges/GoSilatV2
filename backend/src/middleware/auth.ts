import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import JWT_SECRET from '../config/jwt'

export interface AuthRequest extends Request {
  user?: any
}

export const authenticate = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    // AMBIL HEADER
    const authHeader = req.headers.authorization

    if (!authHeader) {
      return res.status(401).json({
        message: 'Token tidak ditemukan'
      })
    }

    // FORMAT:
    // Bearer eyJhbGc...

    const token = authHeader.split(' ')[1]

    if (!token) {
      return res.status(401).json({
        message: 'Token invalid'
      })
    }

    // VERIFY TOKEN
    const decoded = jwt.verify(
      token,
      JWT_SECRET
    )

    req.user = decoded

    next()

  } catch (err) {
    return res.status(401).json({
      message: 'Unauthorized'
    })
  }
}

// /////// /sdgbsdgfufsdefw
export const authorizeRoles = (
  ...allowedRoles: number[]
) => {
  return (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) => {

    // user dari JWT
    const user = req.user

    if (!user) {
      return res.status(401).json({
        message: 'Unauthorized'
      })
    }

    // cek role
    if (!allowedRoles.includes(user.role_id)) {
      return res.status(403).json({
        message: 'Forbidden'
      })
    }

    next()
  }
}