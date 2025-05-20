"use client";
import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabase/supabaseClient';
import { useRouter } from 'next/navigation';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // --- UPDATED: Improved session and auth state management ---
  useEffect(() => {
    let authListener;
    const checkSession = async () => {
      // Check if there's an existing session when component mounts
      const { data: sessionData, error } = await supabase.auth.getSession();
      setUser(sessionData?.session?.user ?? null); // Set the user if session exists, otherwise null
      console.log(sessionData?.session?.user.user_metadata?.full_name);
      setLoading(false);

      // Set up the listener for authentication state changes (login/logout)
      const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user ?? null); // Update user state on auth state change
      });
      authListener = listener;
    };

    checkSession();

    // Cleanup the listener when the component unmounts
    return () => {
      authListener?.unsubscribe && authListener.unsubscribe();
    };
  }, []);

  // --- Keep previous signUp, signIn, signOut logic unchanged ---

  const signUp = async (email, password, userData) => {
    try {
      const role = userData.role || 'user';
      const fullName = userData.full_name;

      // 1. Password validation
      const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+=\[\]{};':"\\|,.<>\/?]).{8,}$/;
      if (!passwordRegex.test(password)) {
        throw new Error(
          'Password must be at least 8 characters long and include 1 capital letter, 1 number, and 1 special character.'
        );
      }

      // 2. Check if full_name already exists
      const { data: existingUsers, error: fetchError } = await supabase
        .from('users')
        .select('id')
        .eq('full_name', fullName);

      if (fetchError) throw fetchError;

      if (existingUsers && existingUsers.length > 0) {
        throw new Error('Username (full_name) already exists. Please choose another.');
      }

      // 3. Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            phone_number: userData.phone_number,
            role: role,
          }
        }
      });

      if (authError) throw authError;

      const userId = authData.user.id;

      // 4. Insert into custom 'users' table
      const { error: insertError } = await supabase.from('users').insert([
        {
          id: userId,
          email: email,
          full_name: fullName,
          phone_number: userData.phone_number,
          role: role
        }
      ]);

      if (insertError) throw insertError;

      return { data: authData, error: null, message: 'Signup successful!' };

    } catch (error) {
      return { data: null, error };
    }
  };

  const signIn = async (email, password) => {
    try {
      // First, check if email exists in users table
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('role, full_name')
        .eq('email', email)
        .single();

      if (userError) {
        throw new Error('Invalid email or password');
      }

      // If email exists, proceed with sign in
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (authError) {
        throw new Error('Invalid email or password');
      }

      // Return combined data
      return {
        data: {
          ...authData,
          role: userData.role,
          full_name: userData.full_name
        },
        error: null
      };
    } catch (error) {
      return { data: null, error };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
      router.push('/login');
    } catch (error) {
      console.error('Error signing out:', error.message);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      signUp,
      signIn,
      signOut,
      loading
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};

// --- Previous code for reference ---
// The previous code is above, unchanged except for improved session and auth state management.



// "use client";

// import { createContext, useContext, useState, useEffect } from 'react';
// import { supabase } from '../supabase/supabaseClient';
// import { useRouter } from 'next/navigation';


// const AuthContext = createContext({});

// export const AuthProvider = ({ children }) => {
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const router = useRouter(); 

//   // useEffect(() => {
//   //   // Check active sessions and sets the user
//   //   supabase.auth.getSession().then(({ data: { session } }) => {
//   //     setUser(session?.user ?? null);
//   //     setLoading(false);
//   //   });

//   //   // Listen for changes on auth state
//   //   const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
//   //     setUser(session?.user ?? null);
//   //   });

//   //   return () => subscription.unsubscribe();
//   // }, []);

// useEffect(() => {
//   const checkSession = async () => {
//     // Check if there's an existing session when component mounts
//     const { data: session, error } = await supabase.auth.getSession();
//     setUser(session?.user ?? null); // Set the user if session exists, otherwise null

//     // Set up the listener for authentication state changes (login/logout)
//     const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
//       setUser(session?.user ?? null); // Update user state on auth state change
//     });

//     // Cleanup the listener when the component unmounts
//     return () => {
//       authListener?.unsubscribe();
//     };
//   };

//   checkSession();
// }, []);

// const signUp = async (email, password, userData) => {
//   try {
//     const role = userData.role || 'user';
//     const fullName = userData.full_name;

//     // 1. Password validation
//     const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+=\[\]{};':"\\|,.<>\/?]).{8,}$/;
//     // if (!passwordRegex.test(password)) {
//     //   return {
//     //     data: null,
//     //     error: 'Password must be at least 8 characters long and include 1 capital letter, 1 number, and 1 special character.'
//     //   };
//     // }
//       if (!passwordRegex.test(password)) {
//       throw new Error(
//         'Password must be at least 8 characters long and include 1 capital letter, 1 number, and 1 special character.'
//       );
//     }


//     // 2. Check if full_name already exists
//     const { data: existingUsers, error: fetchError } = await supabase
//       .from('users')
//       .select('id')
//       .eq('full_name', fullName);

//       console.log('here before exist user');
//     if (fetchError) throw fetchError;

//      if (existingUsers && existingUsers.length > 0) {
//       throw new Error('Username (full_name) already exists. Please choose another.');
//     }

//     // if (existingUsers && existingUsers.length > 0) {
//     //   return {
//     //     data: null,
//     //     error: 'Username (full_name) already exists. Please choose another.'
//     //   };
//     // }

//     // 3. Create auth user
//     const { data: authData, error: authError } = await supabase.auth.signUp({
//       email,
//       password,
//       options: {
//         data: {
//           full_name: fullName,
//           phone_number: userData.phone_number,
//           role: role,
//         }
//       }
//     });

//     if (authError) throw authError;

//     const userId = authData.user.id;

//     // 4. Insert into custom 'users' table
//     const { error: insertError } = await supabase.from('users').insert([
//       {
//         id: userId,
//         email: email,
//         full_name: fullName,
//         phone_number: userData.phone_number,
//         role: role
//       }
//     ]);

//     if (insertError) throw insertError;

//     return { data: authData, error: null, message: 'Signup successful!' };

//   } catch (error) {
//     return { data: null, error };
//   }
// };


// const signUp = async (email, password, userData) => {
//   try {
//     const role = userData.role || 'user';
//     const fullName = userData.full_name;

//     // Password validation
//     const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+=\[\]{};':"\\|,.<>\/?]).{8,}$/;
//     if (!passwordRegex.test(password)) {
//       return { data: null, error: 'Password must be at least 8 characters long and include 1 capital letter, 1 number, and 1 special character.' };
//     }

//     // Check if full_name already exists
//     const { data: existingUser, error: fetchError } = await supabase
//       .from('users')
//       .select('id')
//       .eq('full_name', fullName)
//       .single();

//     if (existingUser) {
//       return { data: null, error: 'Username (full_name) already exists. Please choose another.' };
//     }

//     if (fetchError && fetchError.code !== 'PGRST116') {
//       // Not a "No rows found" error
//       throw fetchError;
//     }

//     // 1. Create auth user
//     const { data: authData, error: authError } = await supabase.auth.signUp({
//       email,
//       password,
//       options: {
//         data: {
//           full_name: fullName,
//           phone_number: userData.phone_number,
//           role: role,
//         }
//       }
//     });

//     if (authError) throw authError;

//     const userId = authData.user.id;

//     // 2. Insert into 'users' table
//     const { error: insertError } = await supabase.from('users').insert([
//       {
//         id: userId,
//         email: email,
//         full_name: fullName,
//         phone_number: userData.phone_number,
//         role: role
//       }
//     ]);

//     if (insertError) throw insertError;

//     return { data: authData, error: null, message: 'Signup successful!' };

//   } catch (error) {
//     return { data: null, error };
//   }
// };


//   const signUp = async (email, password, userData) => {
//     try {
//       const role = userData.role || 'user';

//       // 1. Create auth user
//       const { data: authData, error: authError } = await supabase.auth.signUp({
//         email,
//         password,
//         options: {
//           data: {
//             full_name: userData.full_name,
//             phone_number: userData.phone_number,
//             role: role,
//           }
//         }
//       });

//       if (authError) throw authError;

//       const userId = authData.user.id;

//       // 2. Insert into your custom 'users' table
//       const { error: insertError } = await supabase.from('users').insert([
//         {
//           id: userId, // use auth user ID as primary key
//           email: email,
//           full_name: userData.full_name,
//           phone_number: userData.phone_number,
//           role: role
//         }
//       ]);

//       if (insertError) throw insertError;

//       return { data: authData, error: null, message: 'Signup successful!' };

//     } catch (error) {
//       return { data: null, error };
//     }
// };


  


// const signUp = async (email, password, userData) => {
//   try {
//     const role = userData.role || 'user'; // fallback role

//     // First, create the auth user
//     const { data: authData, error: authError } = await supabase.auth.signUp({
//       email,
//       password,
//       options: {
//         data: {
//           full_name: userData.full_name,
//           phone_number: userData.phone_number,
//           role: role
//         }
//       }
//     });

//     if (authError) throw authError;

//     setUser(authData.user)
//     console.log('auth.user', authData.user)


//     return { data: authData, error: null, message: 'Signup successful!' };

//   } catch (error) {
//     return { data: null, error };
//   }
// };


 

  // const signIn = async (email, password) => {
  //   try {
  //     console.log('Attempting to sign in...'); // Debug log

      // First, check if email exists in users table
      // const { data: userData, error: userError } = await supabase
      //   .from('users')
      //   .select('role, full_name')  
      //   .eq('email', email)
      //   .single();

      // if (userError) {
      //   console.error('User data error:', userError); // Debug log
      //   throw new Error('Invalid email or password');
      // }

      // If email exists, proceed with sign in
      // const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      //   email,
      //   password
      // });

      // if (authError) {
      //   console.error('Auth error:', authError); // Debug log
      //   throw new Error('Invalid email or password');
      // }

      // console.log('Auth successful:', authData); // Debug log
      // console.log('User data retrieved:', userData); // Debug log

      // Return combined data
//       return { 
//         data: { 
//           ...authData, 
//           role: userData.role,
//           full_name: userData.full_name
//         }, 
//         error: null 
//       };
//     } catch (error) {
//       console.error('Sign in error:', error); // Debug log
//       return { data: null, error };
//     }
//   };

//   const signOut = async () => {
//     try {
//       const { error } = await supabase.auth.signOut();
//       if (error) throw error;
//       setUser(null);
//       router.push('/user/login');
//     } catch (error) {
//       console.error('Error signing out:', error.message);
//     }
//   };

//   return (
//     <AuthContext.Provider value={{
//       user,
//       signUp,
//       signIn,
//       signOut,
//       loading
//     }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };

// export const useAuth = () => {
//   return useContext(AuthContext);
// };