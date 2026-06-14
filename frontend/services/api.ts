import axios from 'axios'
import { Config } from '../constants/config'
import { useAuthStore } from '../store/authStore'
import AsyncStorage from '@react-native-async-storage/async-storage'

const api = axios.create({
  baseURL: Config.API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

/**
 * REQUEST INTERCEPTOR
 * Auto attach bearer token
 */

api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('auth_token')
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
  },
  (error) => Promise.reject(error)
)

/**
 * RESPONSE INTERCEPTOR
 * Handle global error
 */
api.interceptors.response.use(

  (response) => response,

  (error) => {

    if (error.response?.status === 401) {

      console.log('Unauthorized / Token expired')

      // Optional:
      // auto logout

      useAuthStore.getState().logout()
    }

    return Promise.reject(error)
  }
)

export default api