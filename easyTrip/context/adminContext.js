"use client";

import { createContext, useContext, useState } from "react";

const AdminContext = createContext();

export const AdminProvider = ({ children }) => {
  const [usersByRole, setUsersByRole] = useState({
    agents: [],
    users: [],
    hotelOwners: [],
    busOperators: [],
  });
  const [loading, setLoading] = useState(true);

  // Fetch users based on roles
  const fetchUsers = async () => {
    setLoading(true);
    console.log('fetching');
    const res = await fetch("/api/admin/users");

    const users = await res.json();
    console.log('fetched');
    const grouped = {
      agents: [],
      users: [],
      hotelOwners: [],
      busOperators: [],
    };

    users.forEach((user) => {
      console.log(user);
      console.log(user.role);
      switch (user.role) {
        case "agent":
          grouped.agents.push(user);
          break;
        case "user":
          grouped.users.push(user);
          break;
        case "hotel_owner":
          grouped.hotelOwners.push(user);
          break;
        case "bus_operator":
          grouped.busOperators.push(user);
          break;
        default:
          break;
      }
    });

    setUsersByRole(grouped);
    setLoading(false);
  };

  // Create a new user
  const createUser = async (user) => {
    await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(user),
    });
    fetchUsers();
  };

  // Update a user
  const updateUser = async (user) => {
    await fetch("/api/admin/users", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(user),
    });
    fetchUsers();
  };

  // Delete a user
  const deleteUser = async (id) => {
    await fetch("/api/admin/users", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    fetchUsers();
  };

  // Suspend/Activate user (with optional ban duration)
  const toggleUserActive = async (id, is_active, ban_minutes = null) => {
    await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, is_active: !is_active, ban_minutes }),
    });
    fetchUsers();
  };

  const value = {
    usersByRole,
    fetchUsers,
    loading,
    createUser,
    updateUser,
    deleteUser,
    toggleUserActive,
  };

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
};

export const useAdmin = () => useContext(AdminContext);


// "use client";

// import { createContext, useContext, useState } from "react";
// import { supabase } from "../supabase/supabaseClient";  // Import your Supabase client

// const AdminContext = createContext();

// export const AdminProvider = ({ children }) => {
//   const [usersByRole, setUsersByRole] = useState({
//     agents: [],
//     users: [],
//     hotelOwners: [],
//     busOperators: [],
//   });
//   const [loading, setLoading] = useState(true);

//   // Fetch users based on roles
//   const fetchUsers = async () => {
//     setLoading(true);

//     const { data, error } = await supabase.from("users").select("*");

//     if (error) {
//       console.error("Error fetching users:", error.message);
//     } else {
//       const grouped = {
//         agents: [],
//         users: [],
//         hotelOwners: [],
//         busOperators: [],
//       };

//       data.forEach((user) => {
//         switch (user.role) {
//           case "agent":
//             grouped.agents.push(user);
//             break;
//           case "user":
//             grouped.users.push(user);
//             break;
//           case "hotel_owner":
//             grouped.hotelOwners.push(user);
//             break;
//           case "bus_operator":
//             grouped.busOperators.push(user);
//             break;
//           default:
//             break;
//         }
//       });

//       setUsersByRole(grouped);
//     }

//     setLoading(false);
//   };

//   // Create a new user (admin creation of users)
//   const createUser = async ({ email, full_name, phone_number, role, password }) => {
//     try {
//       const { data, error } = await supabase.auth.admin.createUser({
//         email,
//         password,
//         user_metadata: {
//           full_name,
//           phone_number,
//         },
//         role,
//       });

//       if (error) throw new Error(error.message);

//       // After creating user in auth, insert in the "users" table
//       await supabase.from("users").insert([
//         {
//           id: data.id, // Use the UUID provided by auth
//           email,
//           full_name,
//           phone_number,
//           role,
//           avatar_url: null,
//           is_verified: false,
//           last_login: new Date(),
//         },
//       ]);

//       fetchUsers(); // Refresh list after adding user
//     } catch (error) {
//       console.error("Error creating user:", error.message);
//     }
//   };

//   // Update a user's details (email, full_name, etc.)
//   const updateUser = async ({ id, full_name, email, phone_number, role }) => {
//     try {
//       const { error } = await supabase.auth.admin.updateUserById(id, {
//         email,
//         user_metadata: {
//           full_name,
//           phone_number,
//         },
//         role,
//       });

//       if (error) throw new Error(error.message);

//       // Update user in the database table after updating auth details
//       await supabase.from("users").update({
//         email,
//         full_name,
//         phone_number,
//         role,
//         updated_at: new Date(),
//       }).eq("id", id);

//       fetchUsers(); // Refresh list after updating user
//     } catch (error) {
//       console.error("Error updating user:", error.message);
//     }
//   };

//   // Delete a user from the system
//   const deleteUser = async (id) => {
//     try {
//       // First delete from the users table
//       const { error: deleteError } = await supabase.from("users").delete().eq("id", id);
//       if (deleteError) throw new Error(deleteError.message);

//       // Then delete from Supabase Auth (auth system)
//       const { error: authDeleteError } = await supabase.auth.admin.deleteUser(id);
//       if (authDeleteError) throw new Error(authDeleteError.message);

//       fetchUsers(); // Refresh list after deleting user
//     } catch (error) {
//       console.error("Error deleting user:", error.message);
//     }
//   };

//   const value = {
//     usersByRole,
//     fetchUsers,
//     loading,
//     createUser,
//     updateUser,
//     deleteUser,
//   };

//   return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
// };

// export const useAdmin = () => useContext(AdminContext);


