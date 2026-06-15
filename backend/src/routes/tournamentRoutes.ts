import express from 'express'

import {
  createTournament,
  getTournaments,
  getTournamentDetail,
  updateTournament,
  deleteTournament,
  getCategories,
  getTingkatOptions,
  uploadTournamentFile,
  getCategoryTypes
} from '../controllers/tournamentController'

import {
  authenticate,
  authorizeRoles
} from '../middleware/auth'

import { upload } from '../middleware/upload'

const router = express.Router()

// PUBLIC
router.get('/', getTournaments)
router.get('/category-types', getCategoryTypes)
router.get('/:id', getTournamentDetail)
router.get('/:id/categories', getCategories)
router.get('/:id/tingkat', getTingkatOptions)


// ADMIN ONLY
router.post(
  '/',
  authenticate,
  authorizeRoles(1),
  createTournament
)

router.post(
  '/:id/upload-file',
  authenticate,
  authorizeRoles(1),
  upload.single('file'),
  uploadTournamentFile
)

router.put(
  '/:id',
  authenticate,
  authorizeRoles(1),
  updateTournament
)

router.delete(
  '/:id',
  authenticate,
  authorizeRoles(1),
  deleteTournament
)

export default router