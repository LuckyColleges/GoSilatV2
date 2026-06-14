import api from './api'

interface LoginPayload {
  login: string
  password: string
}

interface RegisterPayload {
  full_name: string
  email: string
  password: string
}

const login = async (
  payload: LoginPayload
) => {

  const response = await api.post(
    '/auth/login',
    payload
  )

  return response.data
}

const register = async (
  payload: RegisterPayload
) => {

  const response = await api.post(
    '/auth/register',
    payload
  )

  return response.data
}

export const authService = {
  login,
  register,
}