import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ShieldAlert } from 'lucide-react';

const Login = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-16 bg-[var(--bg-primary)]">
      <div className="w-full max-w-md space-y-8 border border-[var(--border-color)] p-8 sm:p-12 bg-[var(--bg-primary)] transition-colors duration-300">
        <div className="text-center space-y-2">
          <h2 className="font-serif text-3xl font-semibold tracking-wide text-[var(--text-primary)]">
            Welcome Back
          </h2>
          <p className="text-xs uppercase tracking-widest text-[var(--text-tertiary)]">
            Access your private account
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-3 text-xs flex items-center space-x-2 text-left">
            <ShieldAlert size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form className="mt-8 space-y-6 text-left" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label htmlFor="email-address" className="text-[10px] uppercase tracking-widest text-[var(--text-tertiary)]">
                Email Address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] px-4 py-3 text-xs outline-none focus:border-[var(--text-primary)] text-[var(--text-primary)]"
                placeholder="email@example.com"
              />
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-[10px] uppercase tracking-widest text-[var(--text-tertiary)]">
                  Password
                </label>
                {/* Optional Forgot Password Link */}
                <a href="#" className="text-[9px] uppercase tracking-wider text-[var(--text-tertiary)] hover:text-[var(--text-primary)]">
                  Forgot?
                </a>
              </div>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] px-4 py-3 text-xs outline-none focus:border-[var(--text-primary)] text-[var(--text-primary)]"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-luxe-primary py-3 text-xs"
            >
              {loading ? 'Entering...' : 'Log In'}
            </button>
          </div>
        </form>

        <div className="text-center pt-4 border-t border-[var(--border-color)]">
          <p className="text-xs text-[var(--text-tertiary)]">
            New to our collections?{' '}
            <Link to="/register" className="font-semibold border-b border-[var(--text-primary)] text-[var(--text-primary)] hover:opacity-85 pb-0.5">
              Create an Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
