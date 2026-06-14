import api from './api'

export const athleteService = {

  // GET MY ATHLETES
  getMyAthletes: async () => {

    const response = await api.get('/athletes/my')

    return response.data
  },

  // CREATE ATHLETE
  createAthlete: async (data: any) => {

    const response = await api.post(
      '/athletes',
      data
    )

    return response.data
  },

  updateAthlete: async (
    id: number,
    data: any
  ) => {

    const response = await api.put(
      `/athletes/${id}`,
      data
    )

    return response.data
  },

  // DELETE ATHLETE
  deleteAthlete: async (id: number) => {

    const response = await api.delete(
      `/athletes/${id}`
    )

    return response.data
  },

}