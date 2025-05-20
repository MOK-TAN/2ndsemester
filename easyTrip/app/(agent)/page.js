"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/supabase/supabaseClient";
import { useAuth } from "@/context/AuthContext";

export default function AgentDashboard() {
  const { user, signOut } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [newBooking, setNewBooking] = useState({ customer: "", from: "", to: "", date: "", seats: 1 });
  const [commissions, setCommissions] = useState([]);
  const [offers, setOffers] = useState([]);
  const [offerDetails, setOfferDetails] = useState("");
  const [offerUserId, setOfferUserId] = useState("");

  // Fetch commissions and offers for this agent
  useEffect(() => {
    if (user) {
      fetchCommissions();
      fetchOffers();
    }
  }, [user]);

  const fetchCommissions = async () => {
    const { data, error } = await supabase
      .from("commissions")
      .select("*")
      .eq("agent_id", user.id);
    if (!error) setCommissions(data || []);
  };

  const fetchOffers = async () => {
    const { data, error } = await supabase
      .from("special_offers")
      .select("*")
      .eq("agent_id", user.id);
    if (!error) setOffers(data || []);
  };

  const handleChange = (e) => {
    setNewBooking({ ...newBooking, [e.target.name]: e.target.value });
  };

  // Simulated booking (local state only)
  const bookTicket = () => {
    if (newBooking.customer && newBooking.from && newBooking.to && newBooking.date && newBooking.seats > 0) {
      setBookings([...bookings, { ...newBooking, id: Date.now() }]);
      setNewBooking({ customer: "", from: "", to: "", date: "", seats: 1 });
    }
  };

  // Set a new offer for a user
  const handleSetOffer = async () => {
    if (!offerUserId || !offerDetails) return;
    await supabase.from("special_offers").insert({
      agent_id: user.id,
      user_id: offerUserId,
      offer_details: { text: offerDetails },
      valid_until: new Date(new Date().setDate(new Date().getDate() + 7)), // 1 week
    });
    setOfferDetails("");
    setOfferUserId("");
    fetchOffers();
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-6">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">🕵‍♂ Agent Dashboard</h1>

      {/* Booking Form */}
      <div className="bg-gray-100 p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-lg font-semibold mb-4">Book Ticket</h2>
        <div className="grid grid-cols-2 gap-4">
          <input className="border p-2 rounded" placeholder="Customer Name" name="customer" value={newBooking.customer} onChange={handleChange} />
          <input className="border p-2 rounded" placeholder="From (Location)" name="from" value={newBooking.from} onChange={handleChange} />
          <input className="border p-2 rounded" placeholder="To (Location)" name="to" value={newBooking.to} onChange={handleChange} />
          <input className="border p-2 rounded" type="date" name="date" value={newBooking.date} onChange={handleChange} />
          <input className="border p-2 rounded" type="number" min="1" name="seats" placeholder="Seats" value={newBooking.seats} onChange={handleChange} />
        </div>
        <button className="bg-green-600 text-white px-4 py-2 rounded mt-4" onClick={bookTicket}>Book Ticket</button>
      </div>

      {/* Bookings List */}
      <div className="space-y-4">
        {bookings.map((booking) => (
          <div key={booking.id} className="bg-white p-4 shadow-md rounded-lg flex justify-between items-center">
            <div>
              <h3 className="font-semibold text-gray-900">{booking.customer}</h3>
              <p className="text-sm text-gray-600">{booking.from} ➝ {booking.to}</p>
              <p className="text-sm text-gray-600">Date: {booking.date} | Seats: {booking.seats}</p>
            </div>
            <button className="bg-red-600 text-white px-3 py-1 rounded" onClick={() => setBookings(bookings.filter(b => b.id !== booking.id))}>
              Cancel
            </button>
          </div>
        ))}
      </div>

      {/* --- NEW: Commissions Section --- */}
      <div className="mt-10">
        <h2 className="text-lg font-semibold mb-2">Your Commissions</h2>
        {commissions.length === 0 ? (
          <p className="text-gray-600 text-sm">No commissions yet.</p>
        ) : (
          <ul className="space-y-2">
            {commissions.map((c) => (
              <li key={c.id} className="bg-gray-50 p-2 rounded">
                Booking: {c.booking_id} | Amount: ${c.amount}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* --- NEW: Special Offers Section --- */}
      <div className="mt-10">
        <h2 className="text-lg font-semibold mb-2">Special Offers</h2>
        <div className="flex flex-wrap gap-2 mb-2">
          <input
            type="text"
            placeholder="User ID"
            value={offerUserId}
            onChange={e => setOfferUserId(e.target.value)}
            className="border rounded px-2 py-1"
          />
          <input
            type="text"
            placeholder="Offer details"
            value={offerDetails}
            onChange={e => setOfferDetails(e.target.value)}
            className="border rounded px-2 py-1"
          />
          <button onClick={handleSetOffer} className="text-blue-600 border px-3 py-1 rounded">Set Offer</button>
        </div>
        <ul>
          {offers.map(o => (
            <li key={o.id} className="bg-gray-50 p-2 rounded">
              For User: {o.user_id} | {o.offer_details?.text} | Valid until: {o.valid_until}
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-10 flex justify-end">
        <button onClick={signOut} className="bg-red-600 text-white px-4 py-2 rounded">
          Log out
        </button>
      </div>
    </div>
  );
}

// --- Previous code for reference ---
// "use client";
//
// import { useState } from "react";
//
// export default function AgentDashboard() {
//   const [bookings, setBookings] = useState([]);
//   const [newBooking, setNewBooking] = useState({ customer: "", from: "", to: "", date: "", seats: 1 });
//
//   const handleChange = (e) => {
//     setNewBooking({ ...newBooking, [e.target.name]: e.target.value });
//   };
//
//   const bookTicket = () => {
//     if (newBooking.customer && newBooking.from && newBooking.to && newBooking.date && newBooking.seats > 0) {
//       setBookings([...bookings, { ...newBooking, id: Date.now() }]);
//       setNewBooking({ customer: "", from: "", to: "", date: "", seats: 1 });
//     }
//   };
//
//   return (
//     <div className="max-w-4xl mx-auto py-10 px-6">
//       <h1 className="text-2xl font-semibold text-gray-900 mb-6">🕵‍♂ Agent Dashboard</h1>
//
//       {/* Booking Form */}
//       <div className="bg-gray-100 p-6 rounded-lg shadow-md mb-6">
//         <h2 className="text-lg font-semibold mb-4">Book Ticket</h2>
//         <div className="grid grid-cols-2 gap-4">
//           <input className="border p-2 rounded" placeholder="Customer Name" name="customer" value={newBooking.customer} onChange={handleChange} />
//           <input className="border p-2 rounded" placeholder="From (Location)" name="from" value={newBooking.from} onChange={handleChange} />
//           <input className="border p-2 rounded" placeholder="To (Location)" name="to" value={newBooking.to} onChange={handleChange} />
//           <input className="border p-2 rounded" type="date" name="date" value={newBooking.date} onChange={handleChange} />
//           <input className="border p-2 rounded" type="number" min="1" name="seats" placeholder="Seats" value={newBooking.seats} onChange={handleChange} />
//         </div>
//         <button className="bg-green-600 text-white px-4 py-2 rounded mt-4" onClick={bookTicket}>Book Ticket</button>
//       </div>
//
//       {/* Bookings List */}
//       <div className="space-y-4">
//         {bookings.map((booking) => (
//           <div key={booking.id} className="bg-white p-4 shadow-md rounded-lg flex justify-between items-center">
//             <div>
//               <h3 className="font-semibold text-gray-900">{booking.customer}</h3>
//               <p className="text-sm text-gray-600">{booking.from} ➝ {booking.to}</p>
//               <p className="text-sm text-gray-600">Date: {booking.date} | Seats: {booking.seats}</p>
//             </div>
//             <button className="bg-red-600 text-white px-3 py-1 rounded" onClick={() => setBookings(bookings.filter(b => b.id !== booking.id))}>
//               Cancel
//             </button>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }


// "use client";

// import { useState } from "react";

// export default function AgentDashboard() {
//   const [bookings, setBookings] = useState([]);
//   const [newBooking, setNewBooking] = useState({ customer: "", from: "", to: "", date: "", seats: 1 });

//   const handleChange = (e) => {
//     setNewBooking({ ...newBooking, [e.target.name]: e.target.value });
//   };

//   const bookTicket = () => {
//     if (newBooking.customer && newBooking.from && newBooking.to && newBooking.date && newBooking.seats > 0) {
//       setBookings([...bookings, { ...newBooking, id: Date.now() }]);
//       setNewBooking({ customer: "", from: "", to: "", date: "", seats: 1 });
//     }
//   };

//   return (
//     <div className="max-w-4xl mx-auto py-10 px-6">
//       <h1 className="text-2xl font-semibold text-gray-900 mb-6">🕵‍♂ Agent Dashboard</h1>

//       {/* Booking Form */}
//       <div className="bg-gray-100 p-6 rounded-lg shadow-md mb-6">
//         <h2 className="text-lg font-semibold mb-4">Book Ticket</h2>
//         <div className="grid grid-cols-2 gap-4">
//           <input className="border p-2 rounded" placeholder="Customer Name" name="customer" value={newBooking.customer} onChange={handleChange} />
//           <input className="border p-2 rounded" placeholder="From (Location)" name="from" value={newBooking.from} onChange={handleChange} />
//           <input className="border p-2 rounded" placeholder="To (Location)" name="to" value={newBooking.to} onChange={handleChange} />
//           <input className="border p-2 rounded" type="date" name="date" value={newBooking.date} onChange={handleChange} />
//           <input className="border p-2 rounded" type="number" min="1" name="seats" placeholder="Seats" value={newBooking.seats} onChange={handleChange} />
//         </div>
//         <button className="bg-green-600 text-white px-4 py-2 rounded mt-4" onClick={bookTicket}>Book Ticket</button>
//       </div>

//       {/* Bookings List */}
//       <div className="space-y-4">
//         {bookings.map((booking) => (
//           <div key={booking.id} className="bg-white p-4 shadow-md rounded-lg flex justify-between items-center">
//             <div>
//               <h3 className="font-semibold text-gray-900">{booking.customer}</h3>
//               <p className="text-sm text-gray-600">{booking.from} ➝ {booking.to}</p>
//               <p className="text-sm text-gray-600">Date: {booking.date} | Seats: {booking.seats}</p>
//             </div>
//             <button className="bg-red-600 text-white px-3 py-1 rounded" onClick={() => setBookings(bookings.filter(b => b.id !== booking.id))}>
//               Cancel
//             </button>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }