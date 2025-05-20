"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '../../../../context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiEye, FiEyeOff } from 'react-icons/fi';

export default function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'User' // Default role
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // State for password visibility
  const { signIn, user } = useAuth();
  const router = useRouter();

  // Redirect if already logged in, based on user role
  useEffect(() => {
    if (user && user.role) {
      switch (user.role) {
        case 'User':
          router.push('/user');
          break;
        case 'Agent':
          router.push('/agent');
          break;
        case 'BusOperator':
          router.push('/busoperator');
          break;
        case 'HotelOwner':
          router.push('/hotelowner');
          break;
        default:
          router.push('/user'); // Fallback
      }
    }
  }, [user, router]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear error when user starts typing
    if (error) setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Pass the selected role to signIn
      const { data, error } = await signIn(formData.email, formData.password, formData.role);
      
      if (error) throw error;

      // Redirect based on selected role
      switch (formData.role) {
        case 'User':
          router.push('/user');
          break;
        case 'Agent':
          router.push('/agent');
          break;
        case 'BusOperator':
          router.push('/busoperator');
          break;
        case 'HotelOwner':
          router.push('/hotelowner');
          break;
        default:
          router.push('/user'); // Fallback
      }
    } catch (error) {
      console.error('Login error:', error);
      setError(error.message || 'Failed to sign in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="min-h-screen flex items-center justify-center py-16 sm:py-24 lg:py-32">
        <div className="max-w-md w-full px-6 lg:px-8 bg-white rounded-lg shadow-lg">
          <h2 className="text-3xl font-bold text-gray-900 text-center">Welcome Back</h2>
          <p className="mt-4 text-lg text-gray-600 text-center">Sign in to your account</p>

          {error && (
            <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-8">
            {/* Role Dropdown */}
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                Role
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                required
                className="mt-2 block w-full py-3 px-4 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none disabled:opacity-50"
                disabled={loading}
              >
                <option value="User">User</option>
                <option value="Agent">Agent</option>
                <option value="BusOperator">Bus Operator</option>
                <option value="HotelOwner">Hotel Owner</option>
              </select>
            </div>

            {/* Email Field */}
            <div className="mt-6">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="mt-2 block w-full py-3 px-4 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                placeholder="Enter your email"
                disabled={loading}
              />
            </div>

            {/* Password Field with Eye Icon */}
            <div className="mt-6">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="mt-2 block w-full py-3 px-4 pr-10 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  placeholder="Enter your password"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
                  disabled={loading}
                >
                  {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div className="mt-6">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </div>
          </form>

          {/* Sign up link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{" "}
              <Link href="/user/signup" className="text-indigo-600 font-semibold hover:text-indigo-700">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}