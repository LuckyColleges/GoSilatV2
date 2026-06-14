import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { testConnection } from './config/database'
import { errorHandler } from './middleware/errorHandler'
import authRoutes from './routes/authRoutes'
import winnerRoutes from './routes/winnerRoutes'
import tournamentRoutes from './routes/tournamentRoutes'
import athleteRoutes from './routes/athleteRoutes'
import registrationRoutes from './routes/registrationRoutes'
import contingentRoutes from './routes/contingentRoutes'
import adminRoutes from './routes/adminRoutes'


dotenv.config()

const app = express()
const PORT = Number(process.env.PORT) || 3000

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use('/uploads', express.static('uploads'))

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/tournaments', tournamentRoutes)
app.use('/api/winners', winnerRoutes)
app.use('/api/athletes', athleteRoutes)
app.use('/api/registrations', registrationRoutes)
app.use('/api/contingents', contingentRoutes)
app.use('/api/admin', adminRoutes)

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'GoSilat API is running 🥋' })
})

// Error handler
app.use(errorHandler)

// Start server
const start = async () => {
  await testConnection()
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`)
  })
}

start()