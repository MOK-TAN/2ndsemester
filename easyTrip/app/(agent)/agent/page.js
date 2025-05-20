"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/supabase/supabaseClient";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

export default function AgentDashboard() {
  const { user, signOut } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [newBooking, setNewBooking] = useState({ customer: "", from: "", to: "", date: "", seats: 1 });
  const [commission, setCommissions] = useState([    { id: 1, booking: 101, amount: 50.00 },
    { id: 2, booking: 102, amount: 75.50 },
    { id: 3, booking: 103, amount: 30.25 },
    { id: 4, booking: 104, amount: 100.00 },]);
  const commissions = [
    { id: 1, booking: 101, amount: 50.00 },
    { id: 2, booking: 102, amount: 75.50 },
    { id: 3, booking: 103, amount: 30.25 },
    { id: 4, booking: 104, amount: 100.00 }
  ]
  const [offers, setOffers] = useState([]);
  const [offerDetails, setOfferDetails] = useState("");
  const [offerUserId, setOfferUserId] = useState("");

  // --- NEW: Hotels and Buses for Agent to Book ---
  const [hotels, setHotels] = useState([]);
  const [buses, setBuses] = useState([]);
  const [showHotelDialog, setShowHotelDialog] = useState(false);
  const [showBusDialog, setShowBusDialog] = useState(false);
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [selectedBus, setSelectedBus] = useState(null);
  const [bookingUser, setBookingUser] = useState({ name: "", contact: "" });
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  // --- Track booked hotels ---
  const [bookedHotelIds, setBookedHotelIds] = useState({});

  useEffect(() => {
    if (user) {
      fetchCommissions();
      fetchOffers();
      fetchHotels();
      fetchBuses();
      fetchBookedHotels();
      fetchNotifications();
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

  // --- Fetch all hotels and buses for booking ---
  const fetchHotels = async () => {
    const { data, error } = await supabase
      .from("hotels")
      .select("*");
    if (!error) setHotels(data || []);
  };

  const fetchBuses = async () => {
    const { data, error } = await supabase
      .from("buses")
      .select("*");
    if (!error) setBuses(data || []);
  };

  const fetchNotifications = async () => {
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("recipient_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching notifications:", error.message);
    } else {
      setNotifications(data || []);
    }
  };

  // --- Fetch all booked hotels (by anyone, status Pending or Approved) ---
  const fetchBookedHotels = async () => {
    const { data, error } = await supabase
      .from("hotel_bookings")
      .select("hotel_id")
      .in("status", ["Pending", "Approved"]);
    if (!error && data) {
      const ids = {};
      data.forEach(b => { ids[b.hotel_id] = true; });
      setBookedHotelIds(ids);
    }
  };

  const handleChange = (e) => {
    setNewBooking({ ...newBooking, [e.target.name]: e.target.value });
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

  // --- Book Hotel for User Dialog ---
  const openHotelDialog = (hotel) => {
    setSelectedHotel(hotel);
    setBookingUser({ name: "", contact: "" });
    setShowHotelDialog(true);
  };

  const openBusDialog = (bus) => {
    setSelectedBus(bus);
    setBookingUser({ name: "", contact: "" });
    setShowBusDialog(true);
  };

  const closeDialogs = () => {
    setShowHotelDialog(false);
    setShowBusDialog(false);
    setSelectedHotel(null);
    setSelectedBus(null);
    setBookingUser({ name: "", contact: "" });
  };

  // --- Book hotel for user (DB insert + notification) ---
  const handleBookHotelForUser = async () => {
    if (!selectedHotel || !bookingUser.name || !bookingUser.contact) return;

    // Insert booking into hotel_bookings table
    const { data: booking, error } = await supabase.from("hotel_bookings").insert({
      user_id: null, // or the user's id if you have it 
      hotel_id: selectedHotel.id,
      room_type: selectedHotel.room_type || "Standard",
      check_in: new Date().toISOString().split("T")[0],
      check_out: new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split("T")[0],
      status: "Pending",
      agent_id: user.id,
      customer_name: bookingUser.name,
      customer_contact: bookingUser.contact,
    }).select().single();

    if (error) {
      alert("Booking failed: " + error.message);
      return;
    }

    // Fetch hotel owner's ID
    const { data: hotelData, error: hotelError } = await supabase
      .from("hotels")
      .select("hotel_owner_id")
      .eq("id", selectedHotel.id)
      .single();

    if (hotelError) {
      alert("Booking succeeded, but failed to notify hotel owner: " + hotelError.message);
      closeDialogs();
      fetchBookedHotels();
      return;
    }

    // Send notification to hotel owner
    await supabase.from("notifications").insert({
      recipient_id: hotelData.hotel_owner_id,
      booking_id: booking.id,
      type: "hotel",
      message: `Booking requested by agent for ${selectedHotel.name} (Customer: ${bookingUser.name})`,
    });

    closeDialogs();
    fetchBookedHotels(); // refresh booked state
  };

  // --- Book bus for user (local state only, update as needed for DB) ---
  const handleBookBusForUser = async () => {
    setBookings([
      ...bookings,
      {
        id: Date.now(),
        customer: bookingUser.name,
        contact: bookingUser.contact,
        bus: selectedBus.name,
        type: "bus",
      },
    ]);
    closeDialogs();
  };

  // --- Reject (cancel) a hotel booking ---
  const handleRejectBooking = async (bookingId, hotelId) => {
    const { error } = await supabase
      .from("hotel_bookings")
      .update({ status: "Rejected" })
      .eq("id", bookingId);

    if (error) {
      alert("Error rejecting booking: " + error.message);
    } else {
      setBookedHotelIds((prev) => {
        const updated = { ...prev };
        delete updated[hotelId];
        return updated;
      });
      fetchBookedHotels();
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-6">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">🕵‍♂ Agent Dashboard</h1>

      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between h-16 items-center">
          <Link href="/user" className="text-xl font-bold text-indigo-600">
            EasyTrip
          </Link>
          <div className="flex items-center space-x-6">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative text-sm text-gray-600 hover:text-indigo-600"
            >
              Notifications
              {notifications.some((n) => !n.is_read) && (
                <span className="absolute -top-2 -right-3 bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  {notifications.filter((n) => !n.is_read).length}
                </span>
              )}
            </button>
            
            <button onClick={signOut} className="text-sm text-red-600">
              Sign Out
            </button>
          </div>
        </div>
      </nav>

      {/* Notifications Dropdown */}
      {showNotifications && (
        <div className="absolute right-4 top-16 bg-white shadow-lg rounded-lg w-80 p-4 z-50">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Notifications</h3>
          {notifications.length === 0 ? (
            <p className="text-sm text-gray-600">No notifications available.</p>
          ) : (
            <ul className="space-y-4">
              {notifications.map((notification) => (
                <li key={notification.id} className="p-4 bg-gray-100 rounded-lg">
                  <p>{notification.message}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}


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
        <button className="bg-green-600 text-white px-4 py-2 rounded mt-4" onClick={() => {}}>Book Ticket</button>
      </div>

      {/* --- Hotels Section --- */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Hotels</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {hotels.map((hotel) => (
            <div key={hotel.id} className="bg-white p-4 rounded shadow flex flex-col">
              <h3 className="font-bold text-lg">{hotel.name}</h3>
              <p className="text-gray-600">Location: {hotel.location}</p>
              <p className="text-gray-600">Price: ${hotel.price}</p>
              <p className="text-gray-600">Room Type: {hotel.room_type}</p>
              <p className="text-gray-600">Description: {hotel.description}</p>
              <button
                className={`mt-3 px-3 py-1 rounded ${bookedHotelIds[hotel.id] ? "bg-gray-400 text-white cursor-not-allowed" : "bg-blue-600 text-white"}`}
                onClick={() => openHotelDialog(hotel)}
                disabled={!!bookedHotelIds[hotel.id]}
              >
                {bookedHotelIds[hotel.id] ? "Booked" : "Book for User"}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* --- Buses Section --- */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Buses</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {buses.map((bus) => (
            <div key={bus.id} className="bg-white p-4 rounded shadow flex flex-col">
              <h3 className="font-bold text-lg">{bus.name}</h3>
              <p className="text-gray-600">From: {bus.from_location}</p>
              <p className="text-gray-600">To: {bus.to_location}</p>
              <p className="text-gray-600">Seats: {bus.seats}</p>
              <button
                className="mt-3 bg-blue-600 text-white px-3 py-1 rounded"
                onClick={() => openBusDialog(bus)}
              >
                Book for User
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Book Hotel Dialog */}
      {showHotelDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
            <h3 className="text-lg font-bold mb-2">Book Hotel: {selectedHotel?.name}</h3>
            <input
              className="border p-2 rounded w-full mb-2"
              placeholder="Booking User Name"
              value={bookingUser.name}
              onChange={e => setBookingUser({ ...bookingUser, name: e.target.value })}
            />
            <input
              className="border p-2 rounded w-full mb-4"
              placeholder="Contact"
              value={bookingUser.contact}
              onChange={e => setBookingUser({ ...bookingUser, contact: e.target.value })}
            />
            <div className="flex justify-end gap-2">
              <button className="px-4 py-2 rounded bg-gray-300" onClick={closeDialogs}>Cancel</button>
              <button className="px-4 py-2 rounded bg-green-600 text-white" onClick={handleBookHotelForUser}>Book</button>
            </div>
          </div>
        </div>
      )}

      {/* Book Bus Dialog */}
      {showBusDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
            <h3 className="text-lg font-bold mb-2">Book Bus: {selectedBus?.name}</h3>
            <input
              className="border p-2 rounded w-full mb-2"
              placeholder="Booking User Name"
              value={bookingUser.name}
              onChange={e => setBookingUser({ ...bookingUser, name: e.target.value })}
            />
            <input
              className="border p-2 rounded w-full mb-4"
              placeholder="Contact"
              value={bookingUser.contact}
              onChange={e => setBookingUser({ ...bookingUser, contact: e.target.value })}
            />
            <div className="flex justify-end gap-2">
              <button className="px-4 py-2 rounded bg-gray-300" onClick={closeDialogs}>Cancel</button>
              <button className="px-4 py-2 rounded bg-green-600 text-white" onClick={handleBookBusForUser}>Book</button>
            </div>
          </div>
        </div>
      )}

      {/* Bookings List (local state, for demo) */}
      <div className="mt-10">
        <h2 className="text-lg font-semibold mb-2">Bookings </h2>
        <div className="space-y-4">
          {bookings.map((booking) => (
            <div key={booking.id} className="bg-white p-4 shadow-md rounded-lg flex justify-between items-center">
              <div>
                <h3 className="font-semibold text-gray-900">{booking.customer}</h3>
                <p className="text-sm text-gray-600">{booking.type === "hotel" ? `Hotel: ${booking.hotel}` : `Bus: ${booking.bus}`}</p>
                <p className="text-sm text-gray-600">Contact: {booking.contact}</p>
              </div>
              <button className="bg-red-600 text-white px-3 py-1 rounded" onClick={() => setBookings(bookings.filter(b => b.id !== booking.id))}>
                Cancel
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Commissions Section */}
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



      <div className="mt-10 flex justify-end">
        <button onClick={signOut} className="bg-red-600 text-white px-4 py-2 rounded">
          Log out
        </button>
      </div>
    </div>
  );
}

      {/* Special Offers Section */}
      {/* <div className="mt-10">
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
      </div> */}


// "use client";

// import { useState, useEffect } from "react";
// import { supabase } from "@/supabase/supabaseClient";
// import { useAuth } from "@/context/AuthContext";

// export default function AgentDashboard() {
//   const { user, signOut } = useAuth();
//   const [bookings, setBookings] = useState([]);
  
//   const [commissions, setCommissions] = useState([]);
//   const [offers, setOffers] = useState([]);
//   const [offerDetails, setOfferDetails] = useState("");
//   const [offerUserId, setOfferUserId] = useState("");

//   // --- NEW: Hotels and Buses for Agent to Book ---
//   const [hotels, setHotels] = useState([]);
//   const [buses, setBuses] = useState([]);
//   const [showHotelDialog, setShowHotelDialog] = useState(false);
//   const [showBusDialog, setShowBusDialog] = useState(false);
//   const [selectedHotel, setSelectedHotel] = useState(null);
//   const [selectedBus, setSelectedBus] = useState(null);
//   const [bookingUser, setBookingUser] = useState({ name: "", contact: "" });

//   // --- Track booked hotels ---
//   const [bookedHotelIds, setBookedHotelIds] = useState({});

//   // Fetch commissions, offers, hotels, buses, and booked hotels for this agent
//   useEffect(() => {
//     if (user) {
//       fetchCommissions();
//       fetchOffers();
//       fetchHotels();
//       fetchBuses();
//       fetchBookedHotels();
//     }
//   }, [user]);

//   const fetchCommissions = async () => {
//     const { data, error } = await supabase
//       .from("commissions")
//       .select("*")
//       .eq("agent_id", user.id);
//     if (!error) setCommissions(data || []);
//   };

//   const fetchOffers = async () => {
//     const { data, error } = await supabase
//       .from("special_offers")
//       .select("*")
//       .eq("agent_id", user.id);
//     if (!error) setOffers(data || []);
//   };

//   // --- Fetch all hotels and buses for booking ---
//   const fetchHotels = async () => {
//     const { data, error } = await supabase
//       .from("hotels")
//       .select("*");
//     if (!error) setHotels(data || []);
//   };

//   const fetchBuses = async () => {
//     const { data, error } = await supabase
//       .from("buses")
//       .select("*");
//     if (!error) setBuses(data || []);
//   };

//   // --- Fetch all booked hotels (by anyone, status Pending or Approved) ---
//   const fetchBookedHotels = async () => {
//     const { data, error } = await supabase
//       .from("hotel_bookings")
//       .select("hotel_id")
//       .in("status", ["Pending", "Approved"]);
//     if (!error && data) {
//       const ids = {};
//       data.forEach(b => { ids[b.hotel_id] = true; });
//       setBookedHotelIds(ids);
//     }
//   };






//   // Set a new offer for a user
//   const handleSetOffer = async () => {
//     if (!offerUserId || !offerDetails) return;
//     await supabase.from("special_offers").insert({
//       agent_id: user.id,
//       user_id: offerUserId,
//       offer_details: { text: offerDetails },
//       valid_until: new Date(new Date().setDate(new Date().getDate() + 7)), // 1 week
//     });
//     setOfferDetails("");
//     setOfferUserId("");
//     fetchOffers();
//   };

//   // --- NEW: Book Hotel for User Dialog ---
//   const openHotelDialog = (hotel) => {
//     setSelectedHotel(hotel);
//     setBookingUser({ name: "", contact: "" });
//     setShowHotelDialog(true);
//   };

//   const openBusDialog = (bus) => {
//     setSelectedBus(bus);
//     setBookingUser({ name: "", contact: "" });
//     setShowBusDialog(true);
//   };

//   const closeDialogs = () => {
//     setShowHotelDialog(false);
//     setShowBusDialog(false);
//     setSelectedHotel(null);
//     setSelectedBus(null);
//     setBookingUser({ name: "", contact: "" });
//   };

//   // --- Simulate booking for user (replace with DB logic as needed) ---
// const handleBookHotelForUser = async () => {
//   if (!selectedHotel || !bookingUser.name || !bookingUser.contact) return;

//   const { error } = await supabase.from("hotel_bookings").insert({
//     user_id: null, // or the user's id if you have it
//     hotel_id: selectedHotel.id,
//     room_type: selectedHotel.room_type || "Standard",
//     check_in: new Date().toISOString().split("T")[0],
//     check_out: new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split("T")[0],
//     status: "Pending",
//     agent_id: user.id,
//     customer_name: bookingUser.name,
//     customer_contact: bookingUser.contact,
//   });

//   if (!error) {
//     closeDialogs();
//     fetchBookedHotels();
//   } else {
//     alert("Booking failed: " + error.message);
//   }
// };

//   const handleBookBusForUser = async () => {
//     // You can add DB logic here to insert into bus_bookings
//     setBookings([
//       ...bookings,
//       {
//         id: Date.now(),
//         customer: bookingUser.name,
//         contact: bookingUser.contact,
//         bus: selectedBus.name,
//         type: "bus",
//       },
//     ]);
//     closeDialogs();
//   };

//   return (
//     <div className="max-w-4xl mx-auto py-10 px-6">
//       <h1 className="text-2xl font-semibold text-gray-900 mb-6">🕵‍♂ Agent Dashboard</h1>


//       {/* --- NEW: Hotels Section --- */}
//       <div className="mt-8">
//         <h2 className="text-xl font-semibold mb-4">Hotels</h2>
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//           {hotels.map((hotel) => (
//             <div key={hotel.id} className="bg-white p-4 rounded shadow flex flex-col">
//               <h3 className="font-bold text-lg">{hotel.name}</h3>
//               <p className="text-gray-600">Location: {hotel.location}</p>
//               <p className="text-gray-600">Price: ${hotel.price}</p>
//               <p className="text-gray-600">Room Type: {hotel.room_type}</p>
//               <p className="text-gray-600">Description: {hotel.description}</p>
//               <button
//                 className={`mt-3 px-3 py-1 rounded ${bookedHotelIds[hotel.id] ? "bg-gray-400 text-white cursor-not-allowed" : "bg-blue-600 text-white"}`}
//                 onClick={() => openHotelDialog(hotel)}
//                 disabled={!!bookedHotelIds[hotel.id]}
//               >
//                 {bookedHotelIds[hotel.id] ? "Booked" : "Book for User"}
//               </button>
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* --- NEW: Buses Section --- */}
//       <div className="mt-8">
//         <h2 className="text-xl font-semibold mb-4">Buses</h2>
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//           {buses.map((bus) => (
//             <div key={bus.id} className="bg-white p-4 rounded shadow flex flex-col">
//               <h3 className="font-bold text-lg">{bus.name}</h3>
//               <p className="text-gray-600">From: {bus.from_location}</p>
//               <p className="text-gray-600">To: {bus.to_location}</p>
//               <p className="text-gray-600">Seats: {bus.seats}</p>
//               <button
//                 className="mt-3 bg-blue-600 text-white px-3 py-1 rounded"
//                 onClick={() => openBusDialog(bus)}
//               >
//                 Book for User
//               </button>
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* --- NEW: Book Hotel Dialog --- */}
//       {showHotelDialog && (
//         <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
//           <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
//             <h3 className="text-lg font-bold mb-2">Book Hotel: {selectedHotel?.name}</h3>
//             <input
//               className="border p-2 rounded w-full mb-2"
//               placeholder="Booking User Name"
//               value={bookingUser.name}
//               onChange={e => setBookingUser({ ...bookingUser, name: e.target.value })}
//             />
//             <input
//               className="border p-2 rounded w-full mb-4"
//               placeholder="Contact"
//               value={bookingUser.contact}
//               onChange={e => setBookingUser({ ...bookingUser, contact: e.target.value })}
//             />
//             <div className="flex justify-end gap-2">
//               <button className="px-4 py-2 rounded bg-gray-300" onClick={closeDialogs}>Cancel</button>
//               <button className="px-4 py-2 rounded bg-green-600 text-white" onClick={handleBookHotelForUser}>Book</button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* --- NEW: Book Bus Dialog --- */}
//       {showBusDialog && (
//         <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
//           <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
//             <h3 className="text-lg font-bold mb-2">Book Bus: {selectedBus?.name}</h3>
//             <input
//               className="border p-2 rounded w-full mb-2"
//               placeholder="Booking User Name"
//               value={bookingUser.name}
//               onChange={e => setBookingUser({ ...bookingUser, name: e.target.value })}
//             />
//             <input
//               className="border p-2 rounded w-full mb-4"
//               placeholder="Contact"
//               value={bookingUser.contact}
//               onChange={e => setBookingUser({ ...bookingUser, contact: e.target.value })}
//             />
//             <div className="flex justify-end gap-2">
//               <button className="px-4 py-2 rounded bg-gray-300" onClick={closeDialogs}>Cancel</button>
//               <button className="px-4 py-2 rounded bg-green-600 text-white" onClick={handleBookBusForUser}>Book</button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Bookings List */}
//       <div className="mt-10">
//         <h2 className="text-lg font-semibold mb-2">Bookings (Local State)</h2>
//         <div className="space-y-4">
//           {bookings.map((booking) => (
//             <div key={booking.id} className="bg-white p-4 shadow-md rounded-lg flex justify-between items-center">
//               <div>
//                 <h3 className="font-semibold text-gray-900">{booking.customer}</h3>
//                 <p className="text-sm text-gray-600">{booking.type === "hotel" ? `Hotel: ${booking.hotel}` : `Bus: ${booking.bus}`}</p>
//                 <p className="text-sm text-gray-600">Contact: {booking.contact}</p>
//               </div>
//               <button className="bg-red-600 text-white px-3 py-1 rounded" onClick={() => setBookings(bookings.filter(b => b.id !== booking.id))}>
//                 Cancel
//               </button>
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* --- Commissions Section --- */}
//       <div className="mt-10">
//         <h2 className="text-lg font-semibold mb-2">Your Commissions</h2>
//         {commissions.length === 0 ? (
//           <p className="text-gray-600 text-sm">No commissions yet.</p>
//         ) : (
//           <ul className="space-y-2">
//             {commissions.map((c) => (
//               <li key={c.id} className="bg-gray-50 p-2 rounded">
//                 Booking: {c.booking_id} | Amount: ${c.amount}
//               </li>
//             ))}
//           </ul>
//         )}
//       </div>

//       {/* --- Special Offers Section --- */}
//       <div className="mt-10">
//         <h2 className="text-lg font-semibold mb-2">Special Offers</h2>
//         <div className="flex flex-wrap gap-2 mb-2">
//           <input
//             type="text"
//             placeholder="User ID"
//             value={offerUserId}
//             onChange={e => setOfferUserId(e.target.value)}
//             className="border rounded px-2 py-1"
//           />
//           <input
//             type="text"
//             placeholder="Offer details"
//             value={offerDetails}
//             onChange={e => setOfferDetails(e.target.value)}
//             className="border rounded px-2 py-1"
//           />
//           <button onClick={handleSetOffer} className="text-blue-600 border px-3 py-1 rounded">Set Offer</button>
//         </div>
//         <ul>
//           {offers.map(o => (
//             <li key={o.id} className="bg-gray-50 p-2 rounded">
//               For User: {o.user_id} | {o.offer_details?.text} | Valid until: {o.valid_until}
//             </li>
//           ))}
//         </ul>
//       </div>

//       <div className="mt-10 flex justify-end">
//         <button onClick={signOut} className="bg-red-600 text-white px-4 py-2 rounded">
//           Log out
//         </button>
//       </div>
//     </div>
//   );
// }


// "use client";

// import { useState, useEffect } from "react";
// import { supabase } from "@/supabase/supabaseClient";
// import { useAuth } from "@/context/AuthContext";

// export default function AgentDashboard() {
//   const { user, signOut } = useAuth();
//   const [bookings, setBookings] = useState([]);
//   const [newBooking, setNewBooking] = useState({ customer: "", from: "", to: "", date: "", seats: 1 });
//   const [commissions, setCommissions] = useState([]);
//   const [offers, setOffers] = useState([]);
//   const [offerDetails, setOfferDetails] = useState("");
//   const [offerUserId, setOfferUserId] = useState("");

//   // --- NEW: Hotels and Buses for Agent to Book ---
//   const [hotels, setHotels] = useState([]);
//   const [buses, setBuses] = useState([]);
//   const [showHotelDialog, setShowHotelDialog] = useState(false);
//   const [showBusDialog, setShowBusDialog] = useState(false);
//   const [selectedHotel, setSelectedHotel] = useState(null);
//   const [selectedBus, setSelectedBus] = useState(null);
//   const [bookingUser, setBookingUser] = useState({ name: "", contact: "" });

//   // Fetch commissions, offers, hotels, and buses for this agent
//   useEffect(() => {
//     if (user) {
//       fetchCommissions();
//       fetchOffers();
//       fetchHotels();
//       fetchBuses();
//     }
//   }, [user]);

//   const fetchCommissions = async () => {
//     const { data, error } = await supabase
//       .from("commissions")
//       .select("*")
//       .eq("agent_id", user.id);
//     if (!error) setCommissions(data || []);
//   };

//   const fetchOffers = async () => {
//     const { data, error } = await supabase
//       .from("special_offers")
//       .select("*")
//       .eq("agent_id", user.id);
//     if (!error) setOffers(data || []);
//   };

//   // --- Fetch all hotels and buses for booking ---
//   const fetchHotels = async () => {
//     const { data, error } = await supabase
//       .from("hotels")
//       .select("*");
//     if (!error) setHotels(data || []);
//   };

//   const fetchBuses = async () => {
//     const { data, error } = await supabase
//       .from("buses")
//       .select("*");
//     if (!error) setBuses(data || []);
//   };

//   const handleChange = (e) => {
//     setNewBooking({ ...newBooking, [e.target.name]: e.target.value });
//   };

//   // Simulated booking (local state only)
//   const bookTicket = () => {
//     if (newBooking.customer && newBooking.from && newBooking.to && newBooking.date && newBooking.seats > 0) {
//       setBookings([...bookings, { ...newBooking, id: Date.now() }]);
//       setNewBooking({ customer: "", from: "", to: "", date: "", seats: 1 });
//     }
//   };

//   // Set a new offer for a user
//   const handleSetOffer = async () => {
//     if (!offerUserId || !offerDetails) return;
//     await supabase.from("special_offers").insert({
//       agent_id: user.id,
//       user_id: offerUserId,
//       offer_details: { text: offerDetails },
//       valid_until: new Date(new Date().setDate(new Date().getDate() + 7)), // 1 week
//     });
//     setOfferDetails("");
//     setOfferUserId("");
//     fetchOffers();
//   };

//   // --- NEW: Book Hotel for User Dialog ---
//   const openHotelDialog = (hotel) => {
//     setSelectedHotel(hotel);
//     setBookingUser({ name: "", contact: "" });
//     setShowHotelDialog(true);
//   };

//   const openBusDialog = (bus) => {
//     setSelectedBus(bus);
//     setBookingUser({ name: "", contact: "" });
//     setShowBusDialog(true);
//   };

//   const closeDialogs = () => {
//     setShowHotelDialog(false);
//     setShowBusDialog(false);
//     setSelectedHotel(null);
//     setSelectedBus(null);
//     setBookingUser({ name: "", contact: "" });
//   };

//   // --- Simulate booking for user (replace with DB logic as needed) ---
//   const handleBookHotelForUser = async () => {
//     // You can add DB logic here to insert into hotel_bookings
//     setBookings([
//       ...bookings,
//       {
//         id: Date.now(),
//         customer: bookingUser.name,
//         contact: bookingUser.contact,
//         hotel: selectedHotel.name,
//         type: "hotel",
//       },
//     ]);
//     closeDialogs();
//   };

//   const handleBookBusForUser = async () => {
//     // You can add DB logic here to insert into bus_bookings
//     setBookings([
//       ...bookings,
//       {
//         id: Date.now(),
//         customer: bookingUser.name,
//         contact: bookingUser.contact,
//         bus: selectedBus.name,
//         type: "bus",
//       },
//     ]);
//     closeDialogs();
//   };

//   return (
//     <div className="max-w-4xl mx-auto py-10 px-6">
//       <h1 className="text-2xl font-semibold text-gray-900 mb-6">🕵‍♂ Agent Dashboard</h1>

//       {/* --- NEW: Hotels Section --- */}
//       <div className="mt-8">
//         <h2 className="text-xl font-semibold mb-4">Hotels</h2>
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//           {hotels.map((hotel) => (
//             <div key={hotel.id} className="bg-white p-4 rounded shadow flex flex-col">
//               <h3 className="font-bold text-lg">{hotel.name}</h3>
//               <p className="text-gray-600">Location: {hotel.location}</p>
//               <p className="text-gray-600">Price: ${hotel.price}</p>
//               <p className="text-gray-600">Room Type: {hotel.room_type}</p>
//               <p className="text-gray-600">Description: {hotel.description}</p>
//               <button
//                 className="mt-3 bg-blue-600 text-white px-3 py-1 rounded"
//                 onClick={() => openHotelDialog(hotel)}
//               >
//                 Book for User
//               </button>
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* --- NEW: Buses Section --- */}
//       <div className="mt-8">
//         <h2 className="text-xl font-semibold mb-4">Buses</h2>
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//           {buses.map((bus) => (
//             <div key={bus.id} className="bg-white p-4 rounded shadow flex flex-col">
//               <h3 className="font-bold text-lg">{bus.name}</h3>
//               <p className="text-gray-600">From: {bus.from_location}</p>
//               <p className="text-gray-600">To: {bus.to_location}</p>
//               <p className="text-gray-600">Seats: {bus.seats}</p>
//               <button
//                 className="mt-3 bg-blue-600 text-white px-3 py-1 rounded"
//                 onClick={() => openBusDialog(bus)}
//               >
//                 Book for User
//               </button>
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* --- NEW: Book Hotel Dialog --- */}
//       {showHotelDialog && (
//         <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
//           <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
//             <h3 className="text-lg font-bold mb-2">Book Hotel: {selectedHotel?.name}</h3>
//             <input
//               className="border p-2 rounded w-full mb-2"
//               placeholder="Booking User Name"
//               value={bookingUser.name}
//               onChange={e => setBookingUser({ ...bookingUser, name: e.target.value })}
//             />
//             <input
//               className="border p-2 rounded w-full mb-4"
//               placeholder="Contact"
//               value={bookingUser.contact}
//               onChange={e => setBookingUser({ ...bookingUser, contact: e.target.value })}
//             />
//             <div className="flex justify-end gap-2">
//               <button className="px-4 py-2 rounded bg-gray-300" onClick={closeDialogs}>Cancel</button>
//               <button className="px-4 py-2 rounded bg-green-600 text-white" onClick={handleBookHotelForUser}>Book</button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* --- NEW: Book Bus Dialog --- */}
//       {showBusDialog && (
//         <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
//           <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
//             <h3 className="text-lg font-bold mb-2">Book Bus: {selectedBus?.name}</h3>
//             <input
//               className="border p-2 rounded w-full mb-2"
//               placeholder="Booking User Name"
//               value={bookingUser.name}
//               onChange={e => setBookingUser({ ...bookingUser, name: e.target.value })}
//             />
//             <input
//               className="border p-2 rounded w-full mb-4"
//               placeholder="Contact"
//               value={bookingUser.contact}
//               onChange={e => setBookingUser({ ...bookingUser, contact: e.target.value })}
//             />
//             <div className="flex justify-end gap-2">
//               <button className="px-4 py-2 rounded bg-gray-300" onClick={closeDialogs}>Cancel</button>
//               <button className="px-4 py-2 rounded bg-green-600 text-white" onClick={handleBookBusForUser}>Book</button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Bookings List */}
//       <div className="mt-10">
//         <h2 className="text-lg font-semibold mb-2">Bookings (Local State)</h2>
//         <div className="space-y-4">
//           {bookings.map((booking) => (
//             <div key={booking.id} className="bg-white p-4 shadow-md rounded-lg flex justify-between items-center">
//               <div>
//                 <h3 className="font-semibold text-gray-900">{booking.customer}</h3>
//                 <p className="text-sm text-gray-600">{booking.type === "hotel" ? `Hotel: ${booking.hotel}` : `Bus: ${booking.bus}`}</p>
//                 <p className="text-sm text-gray-600">Contact: {booking.contact}</p>
//               </div>
//               <button className="bg-red-600 text-white px-3 py-1 rounded" onClick={() => setBookings(bookings.filter(b => b.id !== booking.id))}>
//                 Cancel
//               </button>
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* --- Commissions Section --- */}
//       <div className="mt-10">
//         <h2 className="text-lg font-semibold mb-2">Your Commissions</h2>
//         {commissions.length === 0 ? (
//           <p className="text-gray-600 text-sm">No commissions yet.</p>
//         ) : (
//           <ul className="space-y-2">
//             {commissions.map((c) => (
//               <li key={c.id} className="bg-gray-50 p-2 rounded">
//                 Booking: {c.booking_id} | Amount: ${c.amount}
//               </li>
//             ))}
//           </ul>
//         )}
//       </div>

//       {/* --- Special Offers Section --- */}
//       <div className="mt-10">
//         <h2 className="text-lg font-semibold mb-2">Special Offers</h2>
//         <div className="flex flex-wrap gap-2 mb-2">
//           <input
//             type="text"
//             placeholder="User ID"
//             value={offerUserId}
//             onChange={e => setOfferUserId(e.target.value)}
//             className="border rounded px-2 py-1"
//           />
//           <input
//             type="text"
//             placeholder="Offer details"
//             value={offerDetails}
//             onChange={e => setOfferDetails(e.target.value)}
//             className="border rounded px-2 py-1"
//           />
//           <button onClick={handleSetOffer} className="text-blue-600 border px-3 py-1 rounded">Set Offer</button>
//         </div>
//         <ul>
//           {offers.map(o => (
//             <li key={o.id} className="bg-gray-50 p-2 rounded">
//               For User: {o.user_id} | {o.offer_details?.text} | Valid until: {o.valid_until}
//             </li>
//           ))}
//         </ul>
//       </div>

//       <div className="mt-10 flex justify-end">
//         <button onClick={signOut} className="bg-red-600 text-white px-4 py-2 rounded">
//           Log out
//         </button>
//       </div>
//     </div>
//   );
// }



// "use client";

// import { useState, useEffect } from "react";
// import { supabase } from "@/supabase/supabaseClient";
// import { useAuth } from "@/context/AuthContext";

// export default function AgentDashboard() {
//   const { user, signOut } = useAuth();
//   const [bookings, setBookings] = useState([]);
//   const [newBooking, setNewBooking] = useState({ customer: "", from: "", to: "", date: "", seats: 1 });
//   const [commissions, setCommissions] = useState([]);
//   const [offers, setOffers] = useState([]);
//   const [offerDetails, setOfferDetails] = useState("");
//   const [offerUserId, setOfferUserId] = useState("");

//   // Fetch commissions and offers for this agent
//   useEffect(() => {
//     if (user) {
//       fetchCommissions();
//       fetchOffers();
//     }
//   }, [user]);

//   const fetchCommissions = async () => {
//     const { data, error } = await supabase
//       .from("commissions")
//       .select("*")
//       .eq("agent_id", user.id);
//     if (!error) setCommissions(data || []);
//   };

//   const fetchOffers = async () => {
//     const { data, error } = await supabase
//       .from("special_offers")
//       .select("*")
//       .eq("agent_id", user.id);
//     if (!error) setOffers(data || []);
//   };

//   const handleChange = (e) => {
//     setNewBooking({ ...newBooking, [e.target.name]: e.target.value });
//   };

//   // Simulated booking (local state only)
//   const bookTicket = () => {
//     if (newBooking.customer && newBooking.from && newBooking.to && newBooking.date && newBooking.seats > 0) {
//       setBookings([...bookings, { ...newBooking, id: Date.now() }]);
//       setNewBooking({ customer: "", from: "", to: "", date: "", seats: 1 });
//     }
//   };

//   // Set a new offer for a user
//   const handleSetOffer = async () => {
//     if (!offerUserId || !offerDetails) return;
//     await supabase.from("special_offers").insert({
//       agent_id: user.id,
//       user_id: offerUserId,
//       offer_details: { text: offerDetails },
//       valid_until: new Date(new Date().setDate(new Date().getDate() + 7)), // 1 week
//     });
//     setOfferDetails("");
//     setOfferUserId("");
//     fetchOffers();
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

//       {/* --- NEW: Commissions Section --- */}
//       <div className="mt-10">
//         <h2 className="text-lg font-semibold mb-2">Your Commissions</h2>
//         {commissions.length === 0 ? (
//           <p className="text-gray-600 text-sm">No commissions yet.</p>
//         ) : (
//           <ul className="space-y-2">
//             {commissions.map((c) => (
//               <li key={c.id} className="bg-gray-50 p-2 rounded">
//                 Booking: {c.booking_id} | Amount: ${c.amount}
//               </li>
//             ))}
//           </ul>
//         )}
//       </div>

//       {/* --- NEW: Special Offers Section --- */}
//       <div className="mt-10">
//         <h2 className="text-lg font-semibold mb-2">Special Offers</h2>
//         <div className="flex flex-wrap gap-2 mb-2">
//           <input
//             type="text"
//             placeholder="User ID"
//             value={offerUserId}
//             onChange={e => setOfferUserId(e.target.value)}
//             className="border rounded px-2 py-1"
//           />
//           <input
//             type="text"
//             placeholder="Offer details"
//             value={offerDetails}
//             onChange={e => setOfferDetails(e.target.value)}
//             className="border rounded px-2 py-1"
//           />
//           <button onClick={handleSetOffer} className="text-blue-600 border px-3 py-1 rounded">Set Offer</button>
//         </div>
//         <ul>
//           {offers.map(o => (
//             <li key={o.id} className="bg-gray-50 p-2 rounded">
//               For User: {o.user_id} | {o.offer_details?.text} | Valid until: {o.valid_until}
//             </li>
//           ))}
//         </ul>
//       </div>

//       <div className="mt-10 flex justify-end">
//         <button onClick={signOut} className="bg-red-600 text-white px-4 py-2 rounded">
//           Log out
//         </button>
//       </div>
//     </div>
//   );
// }