import api from './api'

export const adminService = {
  // USER MANAGEMENT
  getUsers: async () => {
    const response = await api.get('/admin/users')
    return response.data
  },

  updateUserRole: async (id: number, roleId: number) => {
    const response = await api.put(`/admin/users/${id}/role`, { role_id: roleId })
    return response.data
  },

  deleteUser: async (id: number) => {
    const response = await api.delete(`/admin/users/${id}`)
    return response.data
  },

  // REGISTRATION APPROVAL
  getRegistrations: async () => {
    const response = await api.get('/admin/registrations')
    return response.data
  },

  updateRegistrationStatus: async (params: {
    official_id: number
    tournament_id: number
    contingent_name: string
    status: 'approved' | 'rejected' | 'pending'
  }) => {
    const { official_id, tournament_id, contingent_name, status } = params
    const response = await api.put(
      `/admin/registrations/status?official_id=${official_id}&tournament_id=${tournament_id}&contingent_name=${encodeURIComponent(
        contingent_name
      )}`,
      { status }
    )
    return response.data
  },

  updatePaymentStatus: async (params: {
    official_id: number
    tournament_id: number
    contingent_name: string
    payment_status: 'paid' | 'failed' | 'pending'
  }) => {
    const { official_id, tournament_id, contingent_name, payment_status } = params
    const response = await api.put(
      `/admin/registrations/payment-status?official_id=${official_id}&tournament_id=${tournament_id}&contingent_name=${encodeURIComponent(
        contingent_name
      )}`,
      { payment_status }
    )
    return response.data
  },

  // DASHBOARD
  getDashboardStats: async () => {
    const response = await api.get('/admin/dashboard/stats')
    return response.data
  },

  // WINNERS
  createWinner: async (data: any) => {
    const response = await api.post('/admin/winners', data)
    return response.data
  },

  deleteWinner: async (id: number) => {
    const response = await api.delete(`/admin/winners/${id}`)
    return response.data
  },

  // CATEGORIES
  getAllCategories: async () => {
    const response = await api.get('/admin/categories')
    return response.data
  },

  createCategory: async (data: any) => {
    const response = await api.post('/admin/categories', data)
    return response.data
  },

  uploadWinners: async (tournamentId: number, file: any) => {
    const formData = new FormData()
    formData.append('type', 'winner')
    
    if (typeof file === 'string') {
        const filename = file.split('/').pop()
        const match = /\.(\w+)$/.exec(filename || '')
        const ext = match ? match[1] : 'xlsx'
        
        formData.append('file', {
            uri: file,
            name: filename || `winners.${ext}`,
            type: `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`,
        } as any)
    } else {
        formData.append('file', file)
    }

    const response = await api.post(`/admin/tournaments/${tournamentId}/upload-winners`, formData)
    return response.data
  },

  getWinnersDetail: async (tournamentId: number) => {
    const response = await api.get(`/admin/tournaments/${tournamentId}/winners-detail`)
    return response.data
  },

  updateWinnerDetail: async (tournamentId: number, data: any) => {
    const response = await api.put(`/admin/tournaments/${tournamentId}/winners`, data)
    return response.data
  },

  getCategoryTypes: async () => {
    const response = await api.get('/admin/category-types')
    return response.data
  },

  getExportWinnersUrl: (tournamentId: number) => {
    return `${api.defaults.baseURL}/admin/tournaments/${tournamentId}/export-winners`
  },
}
