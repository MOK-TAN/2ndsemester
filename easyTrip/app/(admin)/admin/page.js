"use client";

import { useState, useEffect } from "react";
import { useAdmin } from "../../../context/adminContext";
import { useAuth } from "@/context/AuthContext";

const AdminDashboard = () => {
  const {
    usersByRole,
    fetchUsers,
    loading,
    createUser,
    updateUser,
    deleteUser,
    toggleUserActive,
    // commissions,
  } = useAdmin();

  const [formData, setFormData] = useState({ email: "", full_name: "", phone_number: "", role: "user", password: "" });
  const [editingId, setEditingId] = useState(null);
  const [currentCategory, setCurrentCategory] = useState("users");

  // --- NEW: Modal state ---
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [agentUserCount, setAgentUserCount] = useState(null);
  const [ownerHotels, setOwnerHotels] = useState([]);
  const [loadingExtra, setLoadingExtra] = useState(false);

  const { user, signOut } = useAuth();

  useEffect(() => {
    fetchUsers();
  }, []);

  // --- NEW: Fetch agent's users count ---
  const fetchAgentUserCount = async (agentId) => {
    setLoadingExtra(true);
    const res = await fetch(`/api/admin/agent-users?agent_id=${agentId}`);
    const data = await res.json();
    setAgentUserCount(data.count || 0);
    setLoadingExtra(false);
  };

  // --- NEW: Fetch hotel owner's hotels ---
  const fetchOwnerHotels = async (ownerId) => {
    setLoadingExtra(true);
    const res = await fetch(`/api/admin/hotels?owner_id=${ownerId}`);
    const data = await res.json();
    setOwnerHotels(data.hotels || []);
    setLoadingExtra(false);
  };

  // --- NEW: Open modal and fetch extra data if needed ---
  const handleUserClick = (user) => {
    setSelectedUser(user);
    setShowModal(true);
    setAgentUserCount(null);
    setOwnerHotels([]);
    if (user.role === "agent") {
      fetchAgentUserCount(user.id);
    }
    if (user.role === "hotel_owner") {
      fetchOwnerHotels(user.id);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedUser(null);
    setAgentUserCount(null);
    setOwnerHotels([]);
  };

  const handleEdit = (user) => {
    setEditingId(user.id);
    setFormData({
      email: user.email,
      full_name: user.full_name,
      phone_number: user.phone_number,
      role: user.role,
      password: "",
    });
    setShowModal(false); // Close modal when editing
  };

  const handleDelete = (id) => {
    deleteUser(id);
    setShowModal(false);
  };

  const handleToggleActive = (user) => {
    if (toggleUserActive) {
      toggleUserActive(user.id, user.is_active);
    }
    setShowModal(false);
  };

  // --- NEW: Add/Edit hotel for hotel owner ---
  const handleAddHotel = (ownerId) => {
    // Open a hotel add modal or redirect to hotel add page (implement as needed)
    alert(`Add hotel for owner ${ownerId}`);
  };

  const handleEditHotel = (hotel) => {
    // Open a hotel edit modal or redirect to hotel edit page (implement as needed)
    alert(`Edit hotel ${hotel.id}`);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSave = () => {
    if (editingId) {
      updateUser({
        id: editingId,
        email: formData.email,
        full_name: formData.full_name,
        phone_number: formData.phone_number,
        role: formData.role,
      });
    } else {
      createUser(formData);
    }
    setFormData({ email: "", full_name: "", phone_number: "", role: "user", password: "" });
    setEditingId(null);
  };

  return (
    <div className="bg-white p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-semibold text-gray-900 text-center">Admin Dashboard</h1>

      {/* Tabs */}
      <div className="flex justify-center space-x-6 mt-6">
        {["users", "agents", "hotelOwners", "busOperators"].map((category) => (
          <button
            key={category}
            onClick={() => setCurrentCategory(category)}
            className={`text-sm font-semibold px-4 py-2 rounded-md transition ${currentCategory === category ? "bg-blue-500 text-white" : "text-gray-900 hover:bg-gray-200"}`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Form */}
      <div className="mt-6 bg-gray-100 p-6 rounded-md">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">{editingId ? "Edit" : "Add"} {currentCategory}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Email"
            className="p-4 border border-gray-300 rounded-md text-sm"
          />
          <input
            type="text"
            name="full_name"
            value={formData.full_name}
            onChange={handleChange}
            placeholder="Full Name"
            className="p-4 border border-gray-300 rounded-md text-sm"
          />
          <input
            type="text"
            name="phone_number"
            value={formData.phone_number}
            onChange={handleChange}
            placeholder="Phone Number"
            className="p-4 border border-gray-300 rounded-md text-sm"
          />
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="p-4 border border-gray-300 rounded-md text-sm"
          >
            <option value="user">User</option>
            <option value="hotel_owner">Hotel Owner</option>
            <option value="bus_operator">Bus Operator</option>
            <option value="agent">Agent</option>
          </select>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Password"
            className="p-4 border border-gray-300 rounded-md text-sm"
          />
          <button
            onClick={handleSave}
            className="px-6 py-3 bg-blue-500 text-white rounded-md text-sm font-semibold mt-4 w-full"
          >
            {editingId ? "Update" : "Add"}
          </button>
        </div>
      </div>

      {/* List */}
      <div className="mt-8 bg-white p-6 rounded-md shadow-lg">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Users</h2>
        <div className="space-y-4">
          {usersByRole[currentCategory]?.map((user) => (
            <div
              key={user.id}
              className="flex justify-between items-center p-4 border-b cursor-pointer hover:bg-gray-50"
              onClick={() => handleUserClick(user)}
            >
              <div>
                <h3 className="text-xl font-semibold">{user.full_name}</h3>
                <p className="text-gray-500">{user.email}</p>
                <p className="text-gray-500">{user.role}</p>
                <p className={`text-xs mt-1 ${user.is_active ? "text-green-600" : "text-red-600"}`}>
                  {user.is_active ? "Active" : "Suspended"}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* --- NEW: Modal for user details and actions --- */}
      {showModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-700"
              onClick={handleCloseModal}
            >
              &times;
            </button>
            <h2 className="text-xl font-semibold mb-2">{selectedUser.full_name}</h2>
            <p className="text-gray-600 mb-1">Email: {selectedUser.email}</p>
            <p className="text-gray-600 mb-1">Role: {selectedUser.role}</p>
            <p className={`text-xs mb-2 ${selectedUser.is_active ? "text-green-600" : "text-red-600"}`}>
              {selectedUser.is_active ? "Active" : "Suspended"}
            </p>

            {/* --- Agent: Show associated user count --- */}
            {selectedUser.role === "agent" && (
              <div className="mb-2">
                {loadingExtra ? (
                  <span>Loading user count...</span>
                ) : (
                  <span>
                    Associated Users: <b>{agentUserCount ?? 0}</b>
                  </span>
                )}
              </div>
            )}

            {/* --- Hotel Owner: Show hotels and add/edit options --- */}
            {selectedUser.role === "hotel_owner" && (
              <div className="mb-2">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-semibold">Hotels:</span>
                  <button
                    className="text-sm text-blue-600 hover:underline"
                    onClick={() => handleAddHotel(selectedUser.id)}
                  >
                    Add Hotel
                  </button>
                </div>
                {loadingExtra ? (
                  <span>Loading hotels...</span>
                ) : ownerHotels.length === 0 ? (
                  <span className="text-gray-500">No hotels found.</span>
                ) : (
                  <ul className="space-y-1">
                    {ownerHotels.map((hotel) => (
                      <li key={hotel.id} className="flex justify-between items-center">
                        <span>{hotel.name}</span>
                        <button
                          className="text-xs text-blue-600 hover:underline"
                          onClick={() => handleEditHotel(hotel)}
                        >
                          Edit
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            <div className="flex space-x-2 mt-4">
              <button
                onClick={() => handleEdit(selectedUser)}
                className="px-4 py-2 bg-blue-500 text-white rounded"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(selectedUser.id)}
                className="px-4 py-2 bg-red-500 text-white rounded"
              >
                Delete
              </button>
              <button
                onClick={() => handleToggleActive(selectedUser)}
                className={`px-4 py-2 ${selectedUser.is_active ? "bg-yellow-500" : "bg-green-500"} text-white rounded`}
              >
                {selectedUser.is_active ? "Suspend" : "Activate"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mt-8 flex justify-end">
        <button
          onClick={signOut}
          className="bg-red-600 text-white px-4 py-2 rounded"
        >
          Log out
        </button>
      </div>
    </div>
  );
};

export default AdminDashboard;


// "use client";

// import { useState, useEffect } from "react";
// import { useAdmin } from "../../../context/adminContext"; // Adjust path as needed
// import { useAuth } from "@/context/AuthContext";

// const AdminDashboard = () => {
//   // Add toggleUserActive and commissions to destructure
//   const {
//     usersByRole,
//     fetchUsers,
//     loading,
//     createUser,
//     updateUser,
//     deleteUser,
//     toggleUserActive,
//     commissions,
//     // fetchCommissions,
//   } = useAdmin();

//   const [formData, setFormData] = useState({ email: "", full_name: "", phone_number: "", role: "user", password: "" });
//   const [editingId, setEditingId] = useState(null);
//   const [currentCategory, setCurrentCategory] = useState("users");

//   const { user, signOut } = useAuth();

//   useEffect(() => {
//     fetchUsers();
//     // if (fetchCommissions) fetchCommissions();
//   }, []);

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData({ ...formData, [name]: value });
//   };

//   const handleSave = () => {
//     if (editingId) {
//       updateUser({
//         id: editingId,
//         email: formData.email,
//         full_name: formData.full_name,
//         phone_number: formData.phone_number,
//         role: formData.role,
//       });
//     } else {
//       createUser(formData);
//     }
//     setFormData({ email: "", full_name: "", phone_number: "", role: "user", password: "" });
//     setEditingId(null);
//   };

//   const handleEdit = (user) => {
//     setEditingId(user.id);
//     setFormData({
//       email: user.email,
//       full_name: user.full_name,
//       phone_number: user.phone_number,
//       role: user.role,
//       password: "",
//     });
//   };

//   const handleDelete = (id) => {
//     deleteUser(id);
//   };

//   // --- NEW: Suspend/Activate user ---
//   const handleToggleActive = (user) => {
//     if (toggleUserActive) {
//       toggleUserActive(user.id, user.is_active);
//     }
//   };

//   return (
//     <div className="bg-white p-8 max-w-4xl mx-auto">
//       <h1 className="text-2xl font-semibold text-gray-900 text-center">Admin Dashboard</h1>

//       {/* Tabs */}
//       <div className="flex justify-center space-x-6 mt-6">
//         {["users", "agents", "hotelOwners", "busOperators"].map((category) => (
//           <button
//             key={category}
//             onClick={() => setCurrentCategory(category)}
//             className={`text-sm font-semibold px-4 py-2 rounded-md transition ${currentCategory === category ? "bg-blue-500 text-white" : "text-gray-900 hover:bg-gray-200"}`}
//           >
//             {category}
//           </button>
//         ))}
//       </div>

//       {/* Form */}
//       <div className="mt-6 bg-gray-100 p-6 rounded-md">
//         <h2 className="text-xl font-semibold text-gray-900 mb-4">{editingId ? "Edit" : "Add"} {currentCategory}</h2>
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//           <input
//             type="email"
//             name="email"
//             value={formData.email}
//             onChange={handleChange}
//             placeholder="Email"
//             className="p-4 border border-gray-300 rounded-md text-sm"
//           />
//           <input
//             type="text"
//             name="full_name"
//             value={formData.full_name}
//             onChange={handleChange}
//             placeholder="Full Name"
//             className="p-4 border border-gray-300 rounded-md text-sm"
//           />
//           <input
//             type="text"
//             name="phone_number"
//             value={formData.phone_number}
//             onChange={handleChange}
//             placeholder="Phone Number"
//             className="p-4 border border-gray-300 rounded-md text-sm"
//           />
//           <select
//             name="role"
//             value={formData.role}
//             onChange={handleChange}
//             className="p-4 border border-gray-300 rounded-md text-sm"
//           >
//             <option value="user">User</option>
//             <option value="hotel_owner">Hotel Owner</option>
//             <option value="bus_operator">Bus Operator</option>
//             <option value="agent">Agent</option>
//           </select>
//           <input
//             type="password"
//             name="password"
//             value={formData.password}
//             onChange={handleChange}
//             placeholder="Password"
//             className="p-4 border border-gray-300 rounded-md text-sm"
//           />
//           <button
//             onClick={handleSave}
//             className="px-6 py-3 bg-blue-500 text-white rounded-md text-sm font-semibold mt-4 w-full"
//           >
//             {editingId ? "Update" : "Add"}
//           </button>
//         </div>
//       </div>

//       {/* List */}
//       <div className="mt-8 bg-white p-6 rounded-md shadow-lg">
//         <h2 className="text-lg font-semibold text-gray-900 mb-4">Users</h2>
//         <div className="space-y-4">
//           {usersByRole[currentCategory].map((user) => (
//             <div key={user.id} className="flex justify-between items-center p-4 border-b">
//               <div>
//                 <h3 className="text-xl font-semibold">{user.full_name}</h3>
//                 <p className="text-gray-500">{user.email}</p>
//                 <p className="text-gray-500">{user.role}</p>
//                 {/* --- NEW: Show active/suspended status --- */}
//                 <p className={`text-xs mt-1 ${user.is_active ? "text-green-600" : "text-red-600"}`}>
//                   {user.is_active ? "Active" : "Suspended"}
//                 </p>
//               </div>
//               <div className="flex space-x-2">
//                 <button
//                   onClick={() => handleEdit(user)}
//                   className="text-sm font-semibold text-blue-600 hover:underline"
//                 >
//                   Edit
//                 </button>
//                 <button
//                   onClick={() => handleDelete(user.id)}
//                   className="text-sm font-semibold text-red-600 hover:underline"
//                 >
//                   Delete
//                 </button>
//                 {/* --- NEW: Suspend/Activate button --- */}
//                 <button
//                   onClick={() => handleToggleActive(user)}
//                   className={`text-sm font-semibold ${user.is_active ? "text-yellow-600" : "text-green-600"} hover:underline`}
//                 >
//                   {user.is_active ? "Suspend" : "Activate"}
//                 </button>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* --- NEW: Commissions Section --- */}
//       {/* <div className="mt-8 bg-white p-6 rounded-md shadow-lg">
//         <h2 className="text-lg font-semibold text-gray-900 mb-4">Commissions per Agent</h2>
//         {commissions && commissions.length > 0 ? (
//           <ul className="space-y-2">
//             {commissions.map((c, i) => (
//               <li key={i} className="bg-gray-50 p-2 rounded">
//                 Agent: {c.agent_id} | Amount: ${c.amount}
//               </li>
//             ))}
//           </ul>
//         ) : (
//           <p className="text-gray-600 text-sm">No commissions data.</p>
//         )}
//       </div> */}

//       <div className="mt-8 flex justify-end">
//         <button
//           onClick={signOut}
//           className="bg-red-600 text-white px-4 py-2 rounded"
//         >
//           Log out
//         </button>
//       </div>
//     </div>
//   );
// };

// export default AdminDashboard;


// "use client";

// import { useState, useEffect } from "react";
// import { useAdmin } from "../../../context/adminContext"; // Adjust path as needed

// import { useAuth } from "@/context/AuthContext";

// const AdminDashboard = () => {
//   const { usersByRole, fetchUsers, loading, createUser, updateUser, deleteUser } = useAdmin();
//   const [formData, setFormData] = useState({ email: "", full_name: "", phone_number: "", role: "user", password: "" });
//   const [editingId, setEditingId] = useState(null);
//   const [currentCategory, setCurrentCategory] = useState("users");

    
//   const { user, signOut } = useAuth();

//   useEffect(() => {
//     fetchUsers();
//   }, []);

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData({ ...formData, [name]: value });
//   };

//   const handleSave = () => {
//     if (editingId) {
//       updateUser({
//         id: editingId,
//         email: formData.email,
//         full_name: formData.full_name,
//         phone_number: formData.phone_number,
//         role: formData.role,
//       });
//     } else {
//       createUser(formData);
//     }
//     setFormData({ email: "", full_name: "", phone_number: "", role: "user", password: "" });
//     setEditingId(null);
//   };

//   const handleEdit = (user) => {
//     setEditingId(user.id);
//     setFormData({
//       email: user.email,
//       full_name: user.full_name,
//       phone_number: user.phone_number,
//       role: user.role,
//       password: "",
//     });
//   };

//   const handleDelete = (id) => {
//     deleteUser(id);
//   };

//   return (
//     <div className="bg-white p-8 max-w-4xl mx-auto">
//       <h1 className="text-2xl font-semibold text-gray-900 text-center">Admin Dashboard</h1>

//       {/* Tabs */}
//       <div className="flex justify-center space-x-6 mt-6">
//         {["users", "agents", "hotelOwners", "busOperators"].map((category) => (
//           <button
//             key={category}
//             onClick={() => setCurrentCategory(category)}
//             className={`text-sm font-semibold px-4 py-2 rounded-md transition ${currentCategory === category ? "bg-blue-500 text-white" : "text-gray-900 hover:bg-gray-200"}`}
//           >
//             {category}
//           </button>
//         ))}
//       </div>

//       {/* Form */}
//       <div className="mt-6 bg-gray-100 p-6 rounded-md">
//         <h2 className="text-xl font-semibold text-gray-900 mb-4">{editingId ? "Edit" : "Add"} {currentCategory}</h2>
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//           <input
//             type="email"
//             name="email"
//             value={formData.email}
//             onChange={handleChange}
//             placeholder="Email"
//             className="p-4 border border-gray-300 rounded-md text-sm"
//           />
//           <input
//             type="text"
//             name="full_name"
//             value={formData.full_name}
//             onChange={handleChange}
//             placeholder="Full Name"
//             className="p-4 border border-gray-300 rounded-md text-sm"
//           />
//           <input
//             type="text"
//             name="phone_number"
//             value={formData.phone_number}
//             onChange={handleChange}
//             placeholder="Phone Number"
//             className="p-4 border border-gray-300 rounded-md text-sm"
//           />
//           <select
//             name="role"
//             value={formData.role}
//             onChange={handleChange}
//             className="p-4 border border-gray-300 rounded-md text-sm"
//           >
//             <option value="user">User</option>
//             <option value="hotel_owner">Hotel Owner</option>
//             <option value="bus_operator">Bus Operator</option>
//             <option value="agent">Agent</option>
//           </select>
//           <input
//             type="password"
//             name="password"
//             value={formData.password}
//             onChange={handleChange}
//             placeholder="Password"
//             className="p-4 border border-gray-300 rounded-md text-sm"
//           />
//           <button
//             onClick={handleSave}
//             className="px-6 py-3 bg-blue-500 text-white rounded-md text-sm font-semibold mt-4 w-full"
//           >
//             {editingId ? "Update" : "Add"}
//           </button>
//         </div>
//       </div>

//       {/* List */}
//       <div className="mt-8 bg-white p-6 rounded-md shadow-lg">
//         <h2 className="text-lg font-semibold text-gray-900 mb-4">Users</h2>
//         <div className="space-y-4">
//           {usersByRole[currentCategory].map((user) => (
//             <div key={user.id} className="flex justify-between items-center p-4 border-b">
//               <div>
//                 <h3 className="text-xl font-semibold">{user.full_name}</h3>
//                 <p className="text-gray-500">{user.email}</p>
//                 <p className="text-gray-500">{user.role}</p>
//               </div>
//               <div className="flex space-x-2">
//                 <button
//                   onClick={() => handleEdit(user)}
//                   className="text-sm font-semibold text-blue-600 hover:underline"
//                 >
//                   Edit
//                 </button>
//                 <button
//                   onClick={() => handleDelete(user.id)}
//                   className="text-sm font-semibold text-red-600 hover:underline"
//                 >
//                   Delete
//                 </button>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>
    
//      <div className="mt-8 flex justify-end">
//         <button
//           onClick={signOut}
//           className="bg-red-600 text-white px-4 py-2 rounded"
//         >
//           Log out
//         </button>
//         </div>
    
//     </div>
//   );
// };

// export default AdminDashboard;
