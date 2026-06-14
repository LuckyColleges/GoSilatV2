import express from 'express'

import {
  createRegistration,
  createBatchRegistration,
  getMyRegistrations,
  getTournamentRegistrations,
  updateRegistration,
  deleteRegistration,
  getMyRegistrationSummary,
  getMyRegistrationsByTournament,
  exportRegistrationsToExcel
} from '../controllers/registrationController'

import {
  authenticate,
  authorizeRoles
} from '../middleware/auth'

const router = express.Router()

// ADMIN
router.get(
  '/tournament/:id/export',
  exportRegistrationsToExcel
)

// OFFICIAL
router.post(
  '/',
  authenticate,
  authorizeRoles(2),
  createRegistration
)

router.post(
  '/batch',
  authenticate,
  authorizeRoles(2),
  createBatchRegistration
)

router.get(
  '/my',
  authenticate,
  authorizeRoles(2),
  getMyRegistrations
)

router.get(
  '/my-summary',
  authenticate,
  authorizeRoles(2),
  getMyRegistrationSummary
)

router.get(
  '/my-tournament/:eventId',
  authenticate,
  authorizeRoles(2),
  getMyRegistrationsByTournament
)

router.delete(
  '/:id',
  authenticate,
  authorizeRoles(2),
  deleteRegistration
)

router.put(
  '/:id',
  authenticate,
  authorizeRoles(2),
  updateRegistration
)

// ADMIN
router.get(
  '/tournament/:id',
  authenticate,
  authorizeRoles(1),
  getTournamentRegistrations
)

export default router