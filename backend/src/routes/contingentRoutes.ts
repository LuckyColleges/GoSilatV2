import express from 'express'

import {
  createContingent,
  getMyContingents,
  getContingentDetail,
  updateContingent,
  deleteContingent
} from '../controllers/contingentController'

import {
  authenticate,
  authorizeRoles
} from '../middleware/auth'

const router = express.Router()

router.post(
  '/',
  authenticate,
  authorizeRoles(2),
  createContingent
)

router.get(
  '/my',
  authenticate,
  authorizeRoles(2),
  getMyContingents
)

router.get(
  '/:id',
  authenticate,
  authorizeRoles(2),
  getContingentDetail
)

router.put(
  '/:id',
  authenticate,
  authorizeRoles(2),
  updateContingent
)

router.delete(
  '/:id',
  authenticate,
  authorizeRoles(2),
  deleteContingent
)

export default router