import api from './api'

export const getWinnersByTournament = async (tournament_id: number) => {
  const response = await api.get('/winners', {
    params: { tournament_id }
  })
  return response.data
}