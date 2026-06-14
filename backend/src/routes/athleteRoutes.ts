import express from 'express'

import {
  createAthlete,
  getMyAthletes,
  getAthleteDetail,
  updateAthlete,
  deleteAthlete
} from '../controllers/athleteController'

import {
  authenticate,
  authorizeRoles
} from '../middleware/auth'

const router = express.Router()

// OFFICIAL ONLY
// buat atlit
router.post(
  '/',
  authenticate,
  authorizeRoles(2),
  createAthlete
)

// lihat atlit si official
router.get(
  '/my',
  authenticate,
  authorizeRoles(2),
  getMyAthletes
)

//lihat atlit bedasarkan id
router.get(
  '/:id',
  authenticate,
  authorizeRoles(2),
  getAthleteDetail
)

// edit athlit
router.put(
  '/:id',
  authenticate,
  authorizeRoles(2),
  updateAthlete
)

// hgapus athlit
router.delete(
  '/:id',
  authenticate,
  authorizeRoles(2),
  deleteAthlete
)

export default router