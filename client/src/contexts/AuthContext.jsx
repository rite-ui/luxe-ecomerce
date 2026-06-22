import React, { createContext, useContext, useState, useEffect } from 'react';
import api, { getErrorMessage } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize and check user session on mount
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('luxe_token');
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const response = await api.get('/auth/me');
        if (response.data.success) {
          setUser(response.data.data);
        } else {
          localStorage.removeItem('luxe_token');
        }
      } catch (err) {
        console.error('Session validation failed:', err);
        localStorage.removeItem('luxe_token');
      } finally {
        setLoading(false);
      }
    };
    initAuth();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/auth/login', { email, password });
      if (response.data.success) {
        localStorage.setItem('luxe_token', response.data.token);
        setUser(response.data.user);
        return response.data.user;
      }
    } catch (err) {
      const msg = getErrorMessage(err);
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/auth/register', { name, email, password });
      if (response.data.success) {
        localStorage.setItem('luxe_token', response.data.token);
        setUser(response.data.user);
        return response.data.user;
      }
    } catch (err) {
      const msg = getErrorMessage(err);
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await api.get('/auth/logout');
    } catch (err) {
      console.warn('Logout request failed, clearing client-side token anyway:', err);
    } finally {
      localStorage.removeItem('luxe_token');
      setUser(null);
    }
  };

  const updateProfile = async (profileData) => {
    setLoading(true);
    setError(null);
    try {
      // The endpoint is PUT /api/users/:id or PUT /api/auth/me? No, wait!
      // In auth.routes.js:
      // // router.put('/me',       protect, updateMe); // this is commented out in routes!
      // Wait, where is the update profile route?
      // Let's check server/src/routes/auth.routes.js:
      // It has: router.put('/change-password', protect, changePassword);
      // Wait, is there a route for profile updating? Let's check `user.js` in routes:
      // router.put( '/:id', ...adminOnly, ...); which is admin only.
      // Wait, let's search if updateProfile is exposed anywhere.
      // Let's check `server/src/routes/auth.routes.js` or `server/src/controllers/authContoller.js`.
      // In `authContoller.js`: export const updateProfile = asyncHandler(async (req, res) => { ... });
      // But in `auth.routes.js` it's not imported or mapped!
      // Wait, let's check if it is mapped or if we can map it to PUT /me in `server/src/routes/auth.routes.js`.
      // Let's check `server/src/routes/auth.routes.js` to see if it is mapped.
      // Line 15 says: `// router.put('/me',       protect, updateMe);`
      // Wait! It is commented out! Let's check if we can uncomment it and map it to `updateProfile` from authController.js.
      // Let's view `server/src/routes/auth.routes.js` again to see. Yes:
      // `// router.put('/me',       protect, updateMe);`
      // Wait, if it is commented out, how does a user update their profile? They can't!
      // Let's check `server/src/routes/auth.routes.js` line 5:
      // `register,login,logout,getMe, changePassword, forgotPassword,resetPassword,toggleWishlist,`
      // It does NOT import `updateProfile`!
      // But `authContoller.js` HAS `updateProfile` on line 61:
      // `export const updateProfile = asyncHandler(async (req, res) => { ... })`
      // This is a great discovery! We should import `updateProfile` and register it as `router.put('/me', protect, updateProfile)` in `server/src/routes/auth.routes.js` so profile updates work.
      // Let's add this to our backend fixes during execution, since we have the task "Fix backend order controller bug" and "Set up React Contexts (Auth, Cart, Theme)". This will ensure profile editing functions properly.
      
      const response = await api.put('/auth/me', profileData);
      if (response.data.success) {
        setUser(response.data.data);
        return response.data.data;
      }
    } catch (err) {
      const msg = getErrorMessage(err);
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.put('/auth/change-password', { currentPassword, newPassword });
      return response.data.success;
    } catch (err) {
      const msg = getErrorMessage(err);
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  const toggleWishlist = async (productId) => {
    try {
      const response = await api.put(`/auth/wishlist/${productId}`);
      if (response.data.success) {
        // Update user state wishlist array
        setUser((prevUser) => {
          if (!prevUser) return null;
          return {
            ...prevUser,
            wishlist: response.data.wishlist,
          };
        });
        return response.data.wishlist;
      }
    } catch (err) {
      const msg = getErrorMessage(err);
      setError(msg);
      throw new Error(msg);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, login, register, logout, updateProfile, changePassword, toggleWishlist, setError }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
