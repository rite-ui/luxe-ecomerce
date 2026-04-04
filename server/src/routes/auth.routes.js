// server/src/routes/auth.routes.js
import {Router} from 'express';
import {
    register,login,logout,getMe,updateMe,
    changePassword, forgotPassword,resetPassword,toggleWishlist,
} from '../controllers/authContoller.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/register',    register);
router.post('/login',       login);
router.get('/logout',   protect, logout);
router.get('/me',       protect, getMe);
router.put('/me',       protect, updateMe);
router.put('/change-password', protect, changePassword);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:token', resetPassword);
router.put('/wishlist/:productId', toggleWishlist);

export default router;