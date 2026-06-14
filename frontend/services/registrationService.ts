import api from './api'

interface BatchRegistrationPayload {
  tournament_id: number
  contingent_name: string
  athletes: any[]
}

export const registrationService = {
  createBatch: async (payload: BatchRegistrationPayload) => {
    const response = await api.post('/registrations/batch', payload)
    return response.data
  },

  getMyRegistrations: async () => {
    const response = await api.get('/registrations/my')
    return response.data
  },

  getMySummary: async () => {
    const response = await api.get('/registrations/my-summary')
    return response.data
  },

  getByTournament: async (eventId: number) => {
    const response = await api.get(`/registrations/my-tournament/${eventId}`)
    return response.data
  },

  // ADMIN
  getTournamentRegistrations: async (eventId: number) => {
    const response = await api.get(`/registrations/tournament/${eventId}`)
    return response.data
    },

  getRegistrationsByOfficial: async (tournamentId: number, officialId: number, contingentName: string) => {
    const response = await api.get(
      `/registrations/tournament/${tournamentId}?official_id=${officialId}&contingent_name=${encodeURIComponent(contingentName)}`
    )
    return response.data
    },

  getExportUrl: (eventId: number, officialId?: number, contingentName?: string) => {
    let url = `${api.defaults.baseURL}/registrations/tournament/${eventId}/export`
    const params = new URLSearchParams()
    if (officialId) params.append('official_id', officialId.toString())
    if (contingentName) params.append('contingent_name', contingentName)

    const queryString = params.toString()
    return queryString ? `${url}?${queryString}` : url
    }
  }