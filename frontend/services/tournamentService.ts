import api from './api'

import { Tournament } from '../types/tournament'

export const tournamentService = {

  // GET ALL TOURNAMENTS
  getAll: async (): Promise<Tournament[]> => {

    const response = await api.get('/tournaments')

    return response.data.data
  },

  // GET DETAIL TOURNAMENT
  getById: async (
    id: number
  ): Promise<Tournament> => {

    const response = await api.get(
      `/tournaments/${id}`
    )

    return response.data.data
  },

  // GET CATEGORIES
  getCategories: async (id: number) => {
    const response = await api.get(`/tournaments/${id}/categories`)
    return response.data.data
  },

  getTingkatOptions: async (id: number): Promise<string[]> => {
    const response = await api.get(`/tournaments/${id}/tingkat`)
    return response.data.data
  },

  getCategoryTypes: async () => {
    const response = await api.get('/tournaments/category-types')
    return response.data.data
  },

  create: async (data: any) => {
    const response = await api.post('/tournaments', data)
    return response.data
  },

  update: async (id: number, data: any) => {
    const response = await api.put(`/tournaments/${id}`, data)
    return response.data
  },

  delete: async (id: number) => {
    const response = await api.delete(`/tournaments/${id}`)
    return response.data
  },

  uploadFile: async (id: number, type: 'thb' | 'rekom' | 'schedule' | 'banner' , file: any) => {
    const formData = new FormData()
    formData.append('type', type)
    
    // Check if web atau native
    if (typeof file === 'string') {
        // Assume it's a URI from document picker
        const filename = file.split('/').pop()
        const match = /\.(\w+)$/.exec(filename || '')
        const ext = match ? match[1] : 'pdf'
        
        const mimeType =
          ext === 'jpg' || ext === 'jpeg'
            ? 'image/jpeg'
            : ext === 'png'
            ? 'image/png'
            : ext === 'webp'
            ? 'image/webp'
            : 'application/octet-stream'

        formData.append('file', {
            uri: file,
            name: filename || `upload.${ext}`,
            type: type === 'banner' ? `image/${ext}` : `application/pdf`,
        } as any)
    } else {
        // Standard file object (web)
        formData.append('file', file)
    }

    const response = await api.post(`/tournaments/${id}/upload-file`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },
}
