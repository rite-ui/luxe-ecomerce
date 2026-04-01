// ─── Helper ───────────────────────────────────────────────────────────
export const  sendToken = (user, statusCode, res) => {
    const token = user.getSignedToken();
    res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: parseInt(process.env.JWT_EXPIRE) * 24 * 60 * 60 * 1000, // Convert days to milliseconds
    });
    return  res.status(statusCode).json({
    success: true,
    token,
    user: {
      _id:    user._id,
      name:   user.name,
      email:  user.email,
      role:   user.role,
      avatar: user.avatar,
    },
    });
}