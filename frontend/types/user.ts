export type UserRole = 'guest' | 'official' | 'admin'

export interface User {
  id: number
  name: string
  email: string
  role?: UserRole
  role_id: number
  phone?: string
  phone_number?: string
  createdAt?: string
}

export interface AuthResponse {
  token: string
  user: User
}

export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload {
  name: string
  email: string
  password: string
  phone?: string
}