"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '../../../../context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { signIn, user } = useAuth();
  const router = useRouter();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      router.push('/admin');
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
      const { data, error } = await signIn(formData.email, formData.password);
      
      if (error) throw error;

      // Redirect to user page (dashboard) on successful login
      router.push('/admin');
    } catch (error) {
      console.error('Login error:', error);
      setError(error.message || 'Failed to sign in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="min-h-screen flex items-center justify-center py-16 sm:py-24 lg:py-32">
        <div className="max-w-md w-full px-6 lg:px-8 bg-white rounded-lg shadow-lg">
          <h2 className="text-3xl font-bold text-gray-900 text-center">Welcome Back Admin</h2>
          <p className="mt-4 text-lg text-gray-600 text-center">Sign in to your account</p>

          {error && (
            <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-8">
            {/* Email Field */}
            <div>
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

            {/* Password Field */}
            <div className="mt-6">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="mt-2 block w-full py-3 px-4 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                placeholder="Enter your password"
                disabled={loading}
              />
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
              <Link href="/admin/signup" className="text-indigo-600 font-semibold hover:text-indigo-700">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}




// export default function LoginPage(){
//     const {user, login,logout} = useAuth();

//     const router = useRouter();

//     return (
//         <>
//         <h1>Login as hotel owner</h1>

//         {user === true ? "true" : "false"}

//         <button onClick={() =>  { login(); router.push('/hotelowner')}} >login as hotel owner </button>
//         <button onClick={() => logout() } >Logout as hotel owner</button>

//         </>
//     )
// }

// middle ware that runs before the process. 

// see matching paths 
// the matcher lets you specify which routes or pattern middleware should apply to, ensuring that it only runs when needed.

// the matcher
// configuration pattern in next js middleware that defines which rotues 

// "use client";

// import {useEffect,useRouter} from 'next/navigation';  
// import {useState} from 'react';

// export default function login(){

//     const [loading,setLoading] =useState(false);
//     const router = useRouter();

//     const handleLogin = () => {
//         setLoading(true);
//         document.cookie = "ok=moktan";
//         router.push("/hotelowner/dashboard");
//     }



//     return (
//         <div style={{textAlign : "center", marginTop : "50px"   }} > 
//             <h1>Login page</h1>
//             <button onClick={handleLogin} disabled ={loading}  >
//                 {loading ? "Loggin in..." :"Login" }
//             </button>
//         </div>
//     )
// }