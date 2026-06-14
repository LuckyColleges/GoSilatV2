import { Router } from 'express'
import { getWinnersByTournament } from '../controllers/winnerController'

const router = Router()

// GET /api/winners?tournament_id=1
router.get('/', getWinnersByTournament)

export default router