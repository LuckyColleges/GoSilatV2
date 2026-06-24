import express from 'express'
import {
  getAllUsers,
  updateUserRole,
  deleteUser,
  getAllRegistrations,
  updateRegistrationStatus,
  updatePaymentStatusByContingent,
  getDashboardStats,
  createWinner,
  deleteWinner,
  getAllCategories,
  createCategory,
  uploadWinnersExcel,
  getTournamentWinnersDetail,
  updateTournamentWinner,
  getAllCategoryTypes,
  exportWinnersToExcel
} from '../controllers/adminController'
import { authenticate, authorizeRoles } from '../middleware/auth'
import { upload } from '../middleware/upload'

const router = express.Router()

// All admin routes are protected
router.use(authenticate)
router.use(authorizeRoles(1)) // Assuming 1 is Admin role_id

router.get('/users', getAllUsers)
router.put('/users/:id/role', updateUserRole)
router.delete('/users/:id', deleteUser)

router.get('/registrations', getAllRegistrations)
router.put('/registrations/status', updateRegistrationStatus)
router.put('/registrations/payment-status', updatePaymentStatusByContingent)

router.get('/dashboard/stats', getDashboardStats)

// WINNERS
router.post('/winners', createWinner)
router.post('/tournaments/:id/upload-winners', upload.single('file'), uploadWinnersExcel)
router.delete('/winners/:id', deleteWinner)
router.get('/tournaments/:id/winners-detail', getTournamentWinnersDetail)
router.put('/tournaments/:id/winners', updateTournamentWinner)
router.get('/tournaments/:id/export-winners', exportWinnersToExcel)

// CATEGORIES
router.get('/categories', getAllCategories)
router.post('/categories', createCategory)
router.get('/category-types', getAllCategoryTypes)

export default router
