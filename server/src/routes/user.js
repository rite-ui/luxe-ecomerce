import Router from 'express';
import asyncHandler from 'express-async-handler';
import User from '../models/user.model.js';
import { protect , authorize } from '../middleware/authMiddleware.js';

const router = Router();
const adminOnly = [protect, authorize('admin')];

router.get('/', ...adminOnly, asyncHandler(async (req, res) => {
    const users = (await User.find()).sort({ createdAt: -1 });
    res.json({ success: true, count: users.length, data: users });
}));

router.get('/:id', ...adminOnly, asyncHandler(async (req, res) =>{
    const user = await User.findById(req.params.id);
    if (!user) {res.status(404); throw new Error('User not found'); }
    res.json({ success: true, data: user });
}));

router.put( '/:id', ...adminOnly, asyncHandler(async (req, res) =>{
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true});
    if (!user) {res.status(404); throw new Error('User not found'); }
    res.json({ success: true, data: user });
}));

router.delete('/:id', ...adminOnly, asyncHandler(async (req, res) => {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {res.status(404); throw new Error('User not found'); }
    if (user.role === 'admin') {res.status(400); throw new Error('Cannot delete admin user'); }
    await user.deleteOne();
    res.json({ success: true, message: 'User Removed' });
}));

export default router;