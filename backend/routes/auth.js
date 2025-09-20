import { Router } from 'express'
import { UserController } from '../controllers/auth.js'

const router = Router()

router.post('/signup', UserController.signup)
router.post('/login', UserController.login)

export default router