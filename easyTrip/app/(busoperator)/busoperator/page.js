"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/supabase/supabaseClient";
import { useRouter } from "next/navigation";

// Add Bus Form State
const initialBusForm = {
  name: "",
  from_location: "",
  to_location: "",
  seats: "",
  departure: "",
  arrival: "",
  driver_name: "",
  staff_count: "",
};

export default function BusOperatorDashboard() {
  const { user, signOut } = useAuth();
  const router = useRouter();

  const [buses, setBuses] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [staff, setStaff] = useState([]);
  const [staffUserId, setStaffUserId] = useState("");
  const [staffRole, setStaffRole] = useState("driver");
  const [selectedBusId, setSelectedBusId] = useState("");
  const [busReviews, setBusReviews] = useState([]);
  const [responseText, setResponseText] = useState({});
  const [respondingReviewId, setRespondingReviewId] = useState(null);
  const [showBusForm, setShowBusForm] = useState(false);
  const [busForm, setBusForm] = useState(initialBusForm);
  const [isLoadingBookings, setIsLoadingBookings] = useState(false);

  useEffect(() => {
    if (user === false) {
      router.push("/busoperator/login");
    } else if (user) {
      // Fetch all data concurrently
      const fetchAllData = async () => {
        try {
          const [busesData, notificationsData] = await Promise.all([
            supabase
              .from("buses")
              .select("id, name, from_location, to_location, seats, departure, arrival, driver_name, staff_count")
              .eq("bus_operator_id", user.id),
            supabase
              .from("notifications")
              .select("id, message, is_read, created_at")
              .eq("recipient_id", user.id)
              .order("created_at", { ascending: false }),
          ]);

          if (busesData.error) {
            console.error("Error fetching buses:", busesData.error.message);
            setBuses([]);
          } else {
            setBuses(busesData.data || []);
          }

          if (notificationsData.error) {
            console.error("Error fetching notifications:", notificationsData.error.message);
            setNotifications([]);
          } else {
            setNotifications(notificationsData.data || []);
          }

          // Fetch bookings after buses
          if (busesData.data?.length) {
            setIsLoadingBookings(true);
            const busIds = busesData.data.map(b => b.id);
            const { data: bookingsData, error: bookingsError } = await supabase
              .from("bus_bookings")
              .select(`
                id,
                user_id,
                bus_id,
                seat_number,
                departure_date,
                status,
                agent_id,
                created_at,
                users!bus_bookings_user_id_fkey(full_name)
              `)
              .in("bus_id", busIds)
              .order("created_at", { ascending: false });
            
            setIsLoadingBookings(false);
            if (bookingsError) {
              console.error("Error fetching bookings:", bookingsError.message);
              setBookings([]);
            } else {
              setBookings(bookingsData || []);
            }
          }

          // Fetch staff and reviews concurrently
          if (busesData.data?.length) {
            const busIds = busesData.data.map(b => b.id);
            const [staffData, reviewsData] = await Promise.all([
              supabase
                .from("bus_staff")
                .select("*, users(full_name)")
                .in("bus_id", busIds),
              supabase
                .from("bus_reviews")
                .select("*, users(full_name)")
                .in("bus_id", busIds)
                .order("created_at", { ascending: false }),
            ]);

            if (staffData.error) {
              console.error("Error fetching staff:", staffData.error.message);
              setStaff([]);
            } else {
              setStaff(staffData.data || []);
            }

            if (reviewsData.error) {
              console.error("Error fetching reviews:", reviewsData.error.message);
              setBusReviews([]);
            } else {
              setBusReviews(reviewsData.data || []);
            }
          }
        } catch (error) {
          console.error("Error in fetchAllData:", error.message);
        }
      };

      fetchAllData();
    }
    // eslint-disable-next-line
  }, [user, router]);

  // Approve booking and notify user
  const handleApproveBooking = async (bookingId, userId, busName) => {
    const { error } = await supabase
      .from("bus_bookings")
      .update({ status: "Approved" })
      .eq("id", bookingId);
    if (error) {
      console.error("Error approving booking:", error.message);
      return;
    }

    if (userId) {
      const { error: notificationError } = await supabase
        .from("notifications")
        .insert({
          recipient_id: userId,
          booking_id: bookingId,
          type: "bus",
          message: `Your booking for bus "${busName}" was approved.`,
        });
      if (notificationError) {
        console.error("Error sending approval notification:", notificationError.message);
      }
    }

    // Refetch bookings
    const busIds = buses.map(b => b.id);
    const { data, error: bookingsError } = await supabase
      .from("bus_bookings")
      .select(`
        id,
        user_id,
        bus_id,
        seat_number,
        departure_date,
        status,
        agent_id,
        created_at,
        users!bus_bookings_user_id_fkey(full_name)
      `)
      .in("bus_id", busIds)
      .order("created_at", { ascending: false });
    
    if (bookingsError) {
      console.error("Error refetching bookings:", bookingsError.message);
      setBookings([]);
    } else {
      setBookings(data || []);
    }
  };

  // Reject booking and notify user
  const handleRejectBooking = async (bookingId, userId, busName) => {
    const { error } = await supabase
      .from("bus_bookings")
      .update({ status: "Rejected" })
      .eq("id", bookingId);
    if (error) {
      console.error("Error rejecting booking:", error.message);
      return;
    }

    if (userId) {
      const { error: notificationError } = await supabase
        .from("notifications")
        .insert({
          recipient_id: userId,
          booking_id: bookingId,
          type: "bus",
          message: `Your booking for bus "${busName}" was rejected.`,
        });
      if (notificationError) {
        console.error("Error sending rejection notification:", notificationError.message);
      }
    }

    // Refetch bookings
    const busIds = buses.map(b => b.id);
    const { data, error: bookingsError } = await supabase
      .from("bus_bookings")
      .select(`
        id,
        user_id,
        bus_id,
        seat_number,
        departure_date,
        status,
        agent_id,
        created_at,
        users!bus_bookings_user_id_fkey(full_name)
      `)
      .in("bus_id", busIds)
      .order("created_at", { ascending: false });
    
    if (bookingsError) {
      console.error("Error refetching bookings:", bookingsError.message);
      setBookings([]);
    } else {
      setBookings(data || []);
    }
  };

  // Respond to review
  const handleRespondToReview = async (reviewId) => {
    const response = responseText[reviewId];
    if (!response) return;

    const { error } = await supabase
      .from("bus_reviews")
      .update({ owner_response: response })
      .eq("id", reviewId);
    if (!error) {
      setResponseText((prev) => ({ ...prev, [reviewId]: "" }));
      setRespondingReviewId(null);
      const busIds = buses.map(b => b.id);
      const { data, error: reviewsError } = await supabase
        .from("bus_reviews")
        .select("*, users(full_name)")
        .in("bus_id", busIds)
        .order("created_at", { ascending: false });
      if (reviewsError) {
        console.error("Error refetching reviews:", reviewsError.message);
        setBusReviews([]);
      } else {
        setBusReviews(data || []);
      }
    } else {
      console.error("Error responding to review:", error.message);
    }
  };

  // Add Bus Handlers
  const handleBusFormChange = (e) => {
    const { name, value } = e.target;
    setBusForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddBus = async (e) => {
    e.preventDefault();
    const { name, from_location, to_location, seats, departure, arrival, driver_name, staff_count } = busForm;
    if (!name || !from_location || !to_location || !seats) return;

    const { error } = await supabase.from("buses").insert({
      name,
      from_location,
      to_location,
      seats: Number(seats),
      departure,
      arrival,
      bus_operator_id: user.id,
      driver_name,
      staff_count: staff_count ? Number(staff_count) : 0,
    });

    if (!error) {
      setBusForm(initialBusForm);
      setShowBusForm(false);
      const { data, error: busesError } = await supabase
        .from("buses")
        .select("id, name, from_location, to_location, seats, departure, arrival, driver_name, staff_count")
        .eq("bus_operator_id", user.id);
      if (busesError) {
        console.error("Error refetching buses:", busesError.message);
        setBuses([]);
      } else {
        setBuses(data || []);
      }
    } else {
      console.error("Error adding bus:", error.message);
    }
  };

  return (

        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 bg-gray-100 min-h-screen">
      {/* Navigation Bar */}
      <nav className="flex items-center justify-between mb-8 bg-white border-b border-gray-200 px-6 py-4 rounded-xl shadow-md sticky top-0 z-50">
        <span className="text-2xl font-bold text-indigo-600 flex items-center">
          <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M8 7h12m0 0l-4-4m4 4l-4 4m-12 4h12m-12 0l4 4m-4-4l4-4"
            />
          </svg>
          Bus Operator Dashboard
        </span>
        <div className="flex items-center space-x-6">
          {/* Bookings */}
          <button
            className="text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors flex items-center"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            Bookings
          </button>
          {/* Reviews */}
          <button
            className="text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors flex items-center"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
              />
            </svg>
            Reviews
          </button>
          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors flex items-center focus:outline-none"
            >
              <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
              Notifications
              {notifications.some((n) => !n.is_read) && (
                <span className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                  {notifications.filter((n) => !n.is_read).length}
                </span>
              )}
            </button>
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-xl shadow-xl z-10 p-4 animate-fade-in">
                <h2 className="text-sm font-semibold text-gray-900 mb-3">Notifications</h2>
                {notifications.length === 0 ? (
                  <p className="text-gray-600 text-sm">No notifications</p>
                ) : (
                  <ul className="max-h-64 overflow-y-auto space-y-2 text-sm">
                    {notifications.map((notification) => (
                      <li key={notification.id} className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-gray-800">{notification.message}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {notification.is_read ? "Read" : "Unread"}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
          {/* Profile */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold uppercase">
              {user?.full_name?.charAt(0) || "U"}
            </div>
            <span className="text-sm font-medium text-gray-700">{user?.full_name || "Operator"}</span>
          </div>
          {/* Sign Out */}
          <button
            onClick={signOut}
            className="text-sm font-medium text-red-600 hover:text-red-700 transition-colors flex items-center"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            Sign Out
          </button>
        </div>
      </nav>

      {/* Add Bus Form */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold text-gray-900">Your Buses</h2>
          <button
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
            onClick={() => setShowBusForm((v) => !v)}
          >
            {showBusForm ? "Cancel" : "Add Bus"}
          </button>
        </div>
        {showBusForm && (
          <form onSubmit={handleAddBus} className="mb-6 p-6 bg-white rounded-xl border border-gray-200 shadow-md animate-slide-up">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <input
                  name="name"
                  value={busForm.name}
                  onChange={handleBusFormChange}
                  placeholder="Bus Name"
                  className="border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <input
                  name="from_location"
                  value={busForm.from_location}
                  onChange={handleBusFormChange}
                  placeholder="From Location"
                  className="border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <input
                  name="to_location"
                  value={busForm.to_location}
                  onChange={handleBusFormChange}
                  placeholder="To Location"
                  className="border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <input
                  name="seats"
                  type="number"
                  value={busForm.seats}
                  onChange={handleBusFormChange}
                  placeholder="Seats"
                  className="border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <input
                  name="departure"
                  value={busForm.departure}
                  onChange={handleBusFormChange}
                  placeholder="Departure Time"
                  className="border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <input
                  name="arrival"
                  value={busForm.arrival}
                  onChange={handleBusFormChange}
                  placeholder="Arrival Time"
                  className="border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <input
                  name="driver_name"
                  value={busForm.driver_name}
                  onChange={handleBusFormChange}
                  placeholder="Driver Name"
                  className="border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <input
                  name="staff_count"
                  type="number"
                  value={busForm.staff_count}
                  onChange={handleBusFormChange}
                  placeholder="Staff Count"
                  className="border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
            <button
              type="submit"
              className="mt-6 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              Add Bus
            </button>
          </form>
        )}
        {/* Commented out original list display */}
        {/* <ul>
          {buses.map((b) => (
            <li key={b.id} className="mb-2 border-b pb-2">
              <span className="font-bold">{b.name}</span> | {b.from_location} ➝ {b.to_location} | Seats: {b.seats} | Driver: {b.driver_name || "N/A"} | Staff: {b.staff_count ?? 0}
            </li>
          ))}
        </ul> */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {buses.map((b) => (
            <div
              key={b.id}
              className="bg-white border border-gray-200 rounded-xl shadow-md p-6 space-y-2 hover:shadow-xl transition-all duration-300"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M8 7h12m0 0l-4-4m4 4l-4 4m-12 4h12m-12 0l4 4m-4-4l4-4"
                    />
                  </svg>
                  {b.name}
                </h3>
                <div className="flex space-x-2">
                  <button className="text-indigo-600 text-sm hover:underline">✏️ Edit</button>
                  <button className="text-red-600 text-sm hover:underline">🗑️ Delete</button>
                </div>
              </div>
              <p className="text-sm text-gray-700 flex items-center">
                <svg className="w-4 h-4 mr-1 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="font-medium">{b.from_location}</span> ➝ <span className="font-medium">{b.to_location}</span>
              </p>
              <p className="text-sm text-gray-700 flex items-center">
                <svg className="w-4 h-4 mr-1 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round çocuklar"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                  />
                </svg>
                Seats: <span className="font-medium">{b.seats}</span>
              </p>
              <p className="text-sm text-gray-700 flex items-center">
                <svg className="w-4 h-4 mr-1 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                Driver: <span className="font-medium">{b.driver_name || "N/A"}</span>
              </p>
              <p className="text-sm text-gray-700 flex items-center">
                <svg className="w-4 h-4 mr-1 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
                Staff: <span className="font-medium">{b.staff_count ?? 0}</span>
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Bookings Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
          <svg className="w-6 h-6 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
          Bookings
        </h2>
        {isLoadingBookings ? (
          <p className="text-gray-600 flex items-center">
            <svg className="w-4 h-4 mr-2 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Loading bookings...
          </p>
        ) : bookings.length === 0 ? (
          <p className="text-gray-600">No bookings available 😔</p>
        ) : (
          <div className="grid gap-4">
            {bookings.map((b) => (
              <div
                key={b.id}
                className="bg-white p-6 rounded-xl shadow-md border border-gray-200 flex flex-col md:flex-row items-start md:items-center justify-between hover:shadow-xl transition-all duration-300"
              >
                <div className="flex-1">
                  <p className="text-lg font-semibold text-gray-800 flex items-center">
                    <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                    {b.users?.full_name || "Unknown User"}
                  </p>
                  <p className="text-sm text-gray-600 mt-1 flex items-center">
                    <svg className="w-4 h-4 mr-1 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
                      />
                    </svg>
                    Booked seat {b.seat_number} on{" "}
                    <span className="font-medium">
                      {buses.find((bus) => bus.id === b.bus_id)?.name || "Unknown Bus"}
                    </span>
                  </p>
                  <p className="text-sm text-gray-600 mt-1 flex items-center">
                    <svg className="w-4 h-4 mr-1 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    Departure: {b.departure_date}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    <span
                      className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${
                        b.status.toLowerCase() === "pending"
                          ? "bg-yellow-100 text-yellow-700"
                          : b.status.toLowerCase() === "approved"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {b.status}
                    </span>
                  </p>
                </div>
                {b.status.toLowerCase() === "pending" && (
                  <div className="mt-4 md:mt-0 md:ml-6 flex gap-2">
                    <button
                      onClick={() =>
                        handleApproveBooking(
                          b.id,
                          b.user_id,
                          buses.find((bus) => bus.id === b.bus_id)?.name || "Unknown Bus"
                        )
                      }
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      Approve
                    </button>
                    <button
                      onClick={() =>
                        handleRejectBooking(
                          b.id,
                          b.user_id,
                          buses.find((bus) => bus.id === b.bus_id)?.name || "Unknown Bus"
                        )
                      }
                      className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center"
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Reject
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Bus Reviews Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
          <svg className="w-6 h-6 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
            />
          </svg>
          Bus Reviews
        </h2>
        <div className="grid gap-4">
          {busReviews.map((r) => (
            <div
              key={r.id}
              className="bg-white p-6 rounded-xl shadow-md border border-gray-200 hover:shadow-xl transition-all duration-300"
            >
              <div className="flex items-center mb-2">
                <span className="font-semibold text-gray-800 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M8 7h12m0 0l-4-4m4 4l-4 4m-12 4h12m-12 0l4 4m-4-4l4-4"
                    />
                  </svg>
                  {buses.find((b) => b.id === r.bus_id)?.name}
                </span>
                <span className="ml-2 text-yellow-500">⭐ {r.rating}★</span>
              </div>
              <div className="text-sm text-gray-700">{r.comment}</div>
              <div className="text-xs text-gray-500 mt-1 flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                By: {r.users?.full_name || r.user_id}
              </div>
              {r.owner_response && (
                <div className="text-sm text-indigo-700 mt-2">
                  <span className="font-semibold">Operator:</span> {r.owner_response}
                </div>
              )}
              {!r.owner_response && (
                <div className="mt-3 flex flex-col md:flex-row items-start md:items-center space-y-2 md:space-y-0 md:space-x-2">
                  <textarea
                    className="border border-gray-300 rounded-lg w-full p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Write a response..."
                    value={responseText[r.id] || ""}
                    onChange={(e) =>
                      setResponseText((prev) => ({ ...prev, [r.id]: e.target.value }))
                    }
                  />
                  <button
                    className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-gray-400"
                    onClick={() => handleRespondToReview(r.id)}
                    disabled={!responseText[r.id] || respondingReviewId === r.id}
                  >
                    Respond
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Custom Animation Styles */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fadeIn 0.3s ease-out;
        }
        .animate-slide-up {
          animation: slideUp 0.5s ease-out;
        }
      `}</style>
    </div>

    
  


//     <div className="max-w-5xl mx-auto py-10 px-6">


//         <nav className="flex items-center justify-between mb-6 bg-white border-b px-4 py-3 rounded shadow-sm">
//   <span className="text-2xl font-bold">🚌 Bus Operator Dashboard</span>
  
//   <div className="flex items-center space-x-6">
//     {/* Bookings */}
//     <button
      
//       className="text-sm font-medium text-gray-700 hover:text-blue-600 transition"
//     >
//       📑 Bookings
//     </button>

//     {/* Reviews */}
//     <button
      
//       className="text-sm font-medium text-gray-700 hover:text-blue-600 transition"
//     >
//       📝 Reviews
//     </button>

//     {/* Notifications */}
//     <div className="relative">
//       <button
//         onClick={() => setShowNotifications(!showNotifications)}
//         className="relative text-lg"
//       >
//         🔔
//         {notifications.some((n) => !n.is_read) && (
//           <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
//             {notifications.filter((n) => !n.is_read).length}
//           </span>
//         )}
//       </button>
//     </div>

//     {/* Profile */}
//     <div className="flex items-center space-x-2">
//       <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold uppercase">
//         {user?.full_name?.charAt(0) || "U"}
//       </div>
//       <span className="text-sm font-medium text-gray-700">{user?.full_name || "Operator"}</span>
//     </div>

//     {/* Sign Out */}
//     <button
//       onClick={signOut}
//       className="text-sm text-red-600 hover:underline font-medium"
//     >
//       🚪 Sign Out
//     </button>
//   </div>
// </nav>



//       <div className="relative mb-6">
//         {/* <button
//           onClick={() => setShowNotifications(!showNotifications)}
//           className="relative focus:outline-none"
//         >
//           <span className="text-2xl">🔔</span>
//           {notifications.some((n) => !n.is_read) && (
//             <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
//               {notifications.filter((n) => !n.is_read).length}
//             </span>
//           )}
//         </button> */}
//         {showNotifications && (
//           <div className="absolute right-0 mt-2 w-96 bg-white border border-gray-200 rounded shadow-lg z-10 p-3">
//             <h2 className="text-sm font-bold mb-2">Notifications</h2>
//             {notifications.length === 0 ? (
//               <p className="text-gray-600 text-sm">No notifications</p>
//             ) : (
//               <ul className="max-h-48 overflow-y-auto text-sm space-y-2">
//                 {notifications.map((notification) => (
//                   <li key={notification.id} className="p-2 bg-gray-100 rounded">
//                     <p>{notification.message}</p>
//                     <p className="text-xs text-gray-500">
//                       {notification.is_read ? "Read" : "Unread"}
//                     </p>
//                   </li>
//                 ))}
//               </ul>
//             )}
//           </div>
//         )}
//       </div>

//       {/* Add Bus Form */}
//       <section className="mb-8">
//         <div className="flex items-center justify-between mb-2">
//           <h2 className="text-xl font-semibold">Your Buses</h2>
//           <button
//             className="px-3 py-1 bg-blue-600 text-white rounded text-sm"
//             onClick={() => setShowBusForm((v) => !v)}
//           >
//             {showBusForm ? "Cancel" : "Add Bus"}
//           </button>
//         </div>
//         {showBusForm && (
//           <form onSubmit={handleAddBus} className="mb-4 p-4 bg-gray-50 rounded border">
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <input
//                 name="name"
//                 value={busForm.name}
//                 onChange={handleBusFormChange}
//                 placeholder="Bus Name"
//                 className="border rounded p-2"
//                 required
//               />
//               <input
//                 name="from_location"
//                 value={busForm.from_location}
//                 onChange={handleBusFormChange}
//                 placeholder="From Location"
//                 className="border rounded p-2"
//                 required
//               />
//               <input
//                 name="to_location"
//                 value={busForm.to_location}
//                 onChange={handleBusFormChange}
//                 placeholder="To Location"
//                 className="border rounded p-2"
//                 required
//               />
//               <input
//                 name="seats"
//                 type="number"
//                 value={busForm.seats}
//                 onChange={handleBusFormChange}
//                 placeholder="Seats"
//                 className="border rounded p-2"
//                 required
//               />
//               <input
//                 name="departure"
//                 value={busForm.departure}
//                 onChange={handleBusFormChange}
//                 placeholder="Departure Time"
//                 className="border rounded p-2"
//               />
//               <input
//                 name="arrival"
//                 value={busForm.arrival}
//                 onChange={handleBusFormChange}
//                 placeholder="Arrival Time"
//                 className="border rounded p-2"
//               />
//               <input
//                 name="driver_name"
//                 value={busForm.driver_name}
//                 onChange={handleBusFormChange}
//                 placeholder="Driver Name"
//                 className="border rounded p-2"
//               />
//               <input
//                 name="staff_count"
//                 type="number"
//                 value={busForm.staff_count}
//                 onChange={handleBusFormChange}
//                 placeholder="Staff Count"
//                 className="border rounded p-2"
//               />
//             </div>
//             <button type="submit" className="mt-4 px-4 py-2 bg-green-600 text-white rounded">
//               Add Bus
//             </button>
//           </form>
//         )}
//         {/* <ul>
//           {buses.map((b) => (
//             <li key={b.id} className="mb-2 border-b pb-2">
//               <span className="font-bold">{b.name}</span> | {b.from_location} ➝ {b.to_location} | Seats: {b.seats} | Driver: {b.driver_name || "N/A"} | Staff: {b.staff_count ?? 0}
//             </li>
//           ))}
//         </ul> */}

//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//   {buses.map((b) => (
//     <div key={b.id} className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 space-y-2 hover:shadow-md transition">
//       <div className="flex items-center justify-between">
//         <h3 className="text-lg font-bold">🚌 {b.name}</h3>
//         <div className="flex space-x-2">
//           <button className="text-blue-600 text-sm hover:underline">✏️ Edit</button>
//           <button className="text-red-600 text-sm hover:underline">🗑️ Delete</button>
//         </div>
//       </div>
//       <p className="text-sm text-gray-700">📍 <span className="font-medium">{b.from_location}</span> ➝ <span className="font-medium">{b.to_location}</span></p>
//       <p className="text-sm text-gray-700">🪑 Seats: <span className="font-medium">{b.seats}</span></p>
//       <p className="text-sm text-gray-700">👨‍✈️ Driver: <span className="font-medium">{b.driver_name || "N/A"}</span></p>
//       <p className="text-sm text-gray-700">👥 Staff: <span className="font-medium">{b.staff_count ?? 0}</span></p>
//     </div>
//   ))}
// </div>

//       </section>

//       {/* Bookings Section */}

//           <section className="mb-8">
//   <h2 className="text-xl font-semibold mb-2">Bookings 📋</h2>
//   {isLoadingBookings ? (
//     <p className="text-gray-600">Loading bookings... ⏳</p>
//   ) : bookings.length === 0 ? (
//     <p className="text-gray-600">No bookings available 😔</p>
//   ) : (
//     <div className="grid gap-4">
//       {bookings.map((b) => (
//         <div key={b.id} className="bg-white p-4 rounded-lg shadow-md border flex items-center justify-between">
//           <div>
//             <p className="font-bold">👤 {b.users?.full_name || "Unknown User"}</p>
//             <p className="text-gray-600">
//               🎫 Booked seat {b.seat_number} on 🚌 {buses.find((bus) => bus.id === b.bus_id)?.name || "Unknown Bus"}
//             </p>
//             <p className="text-gray-600">📅 Departure: {b.departure_date}</p>
//             <p className="text-gray-600">ℹ️ Status: {b.status}</p>
//           </div>
//           {b.status.toLowerCase() === "pending" && (
//             <div className="flex gap-2">
//               <button
//                 onClick={() => handleApproveBooking(b.id, b.user_id, buses.find((bus) => bus.id === b.bus_id)?.name || "Unknown Bus")}
//                 className="text-green-600 border px-2 py-1 rounded hover:bg-green-50"
//               >
//                 Approve ✅
//               </button>
//               <button
//                 onClick={() => handleRejectBooking(b.id, b.user_id, buses.find((bus) => bus.id === b.bus_id)?.name || "Unknown Bus")}
//                 className="text-red-600 border px-2 py-1 rounded hover:bg-red-50"
//               >
//                 Reject ❌
//               </button>
//             </div>
//           )}
//         </div>
//       ))}
//     </div>
//   )}
// </section>






//       {/* Bus Reviews Section */}

//       <section className="mb-8">
//   <h2 className="text-xl font-semibold mb-2">Bus Reviews 🚌</h2>
//   <div className="grid gap-4">
//     {busReviews.map((r) => (
//       <div key={r.id} className="bg-white p-4 rounded-lg shadow-md border">
//         <div className="flex items-center mb-2">
//           <span className="font-bold">🚌 {buses.find((b) => b.id === r.bus_id)?.name}</span>
//           <span className="ml-2 text-yellow-500">⭐ {r.rating}★</span>
//         </div>
//         <div className="text-sm text-gray-700">💬 {r.comment}</div>
//         <div className="text-xs text-gray-500">👤 By: {r.users?.full_name || r.user_id}</div>
//         {r.owner_response && (
//           <div className="text-xs text-blue-700 mt-1">
//             <span className="font-semibold">Operator:</span> 📢 {r.owner_response}
//           </div>
//         )}
//         {!r.owner_response && (
//           <div className="mt-2">
//             <textarea
//               className="border rounded w-full p-1 text-xs"
//               placeholder="Write a response..."
//               value={responseText[r.id] || ""}
//               onChange={(e) => setResponseText((prev) => ({ ...prev, [r.id]: e.target.value }))}
//             />
//             <button
//               className="mt-1 px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
//               onClick={() => handleRespondToReview(r.id)}
//               disabled={!responseText[r.id] || respondingReviewId === r.id}
//             >
//               Respond 📝
//             </button>
//           </div>
//         )}
//       </div>
//     ))}
//   </div>
// </section>

//     </div>
  );
}

      {/* <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Bookings</h2>
        {isLoadingBookings ? (
          <p className="text-gray-600">Loading bookings...</p>
        ) : bookings.length === 0 ? (
          <p className="text-gray-600">No bookings available</p>
        ) : (
          <ul>
            {bookings.map((b) => (
              <li key={b.id} className="mb-2 border-b pb-2 flex items-center justify-between">
                <span>
                  <span className="font-bold">{b.users?.full_name || "Unknown User"}</span> booked seat {b.seat_number} on {buses.find((bus) => bus.id === b.bus_id)?.name || "Unknown Bus"} | Departure: {b.departure_date} | Status: {b.status}
                </span>
                {b.status.toLowerCase() === "pending" && (
                  <span>
                    <button
                      onClick={() => handleApproveBooking(b.id, b.user_id, buses.find((bus) => bus.id === b.bus_id)?.name || "Unknown Bus")}
                      className="text-green-600 border px-2 py-1 rounded mr-2"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleRejectBooking(b.id, b.user_id, buses.find((bus) => bus.id === b.bus_id)?.name || "Unknown Bus")}
                      className="text-red-600 border px-2 py-1 rounded"
                    >
                      Reject
                    </button>
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </section> */}

      {/* <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Bus Reviews</h2>
        <ul>
          {busReviews.map((r) => (
            <li key={r.id} className="mb-4 border-b pb-2">
              <div>
                <span className="font-bold">{buses.find((b) => b.id === r.bus_id)?.name}</span>
                <span className="ml-2 text-yellow-500">{r.rating}★</span>
              </div>
              <div className="text-sm text-gray-700">{r.comment}</div>
              <div className="text-xs text-gray-500">By: {r.users?.full_name || r.user_id}</div>
              {r.owner_response && (
                <div className="text-xs text-blue-700 mt-1">
                  <span className="font-semibold">Operator:</span> {r.owner_response}
                </div>
              )}
              {!r.owner_response && (
                <div className="mt-2">
                  <textarea
                    className="border rounded w-full p-1 text-xs"
                    placeholder="Write a response..."
                    value={responseText[r.id] || ""}
                    onChange={(e) => setResponseText((prev) => ({ ...prev, [r.id]: e.target.value }))}
                  />
                  <button
                    className="mt-1 px-2 py-1 bg-blue-600 text-white text-xs rounded"
                    onClick={() => handleRespondToReview(r.id)}
                    disabled={!responseText[r.id] || respondingReviewId === r.id}
                  >
                    Respond
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      </section> */}

// "use client";

// import { useState, useEffect } from "react";
// import { useAuth } from "@/context/AuthContext";
// import { supabase } from "@/supabase/supabaseClient";
// import { useRouter } from "next/navigation";

// // Add Bus Form State
// const initialBusForm = {
//   name: "",
//   from_location: "",
//   to_location: "",
//   seats: "",
//   departure: "",
//   arrival: "",
//   driver_name: "",
//   staff_count: "",
// };

// export default function BusOperatorDashboard() {
//   const { user, signOut } = useAuth();
//   const router = useRouter();

//   const [buses, setBuses] = useState([]);
//   const [bookings, setBookings] = useState([]);
//   const [notifications, setNotifications] = useState([]);
//   const [showNotifications, setShowNotifications] = useState(false);
//   const [staff, setStaff] = useState([]);
//   const [staffUserId, setStaffUserId] = useState("");
//   const [staffRole, setStaffRole] = useState("driver");
//   const [selectedBusId, setSelectedBusId] = useState("");
//   const [busReviews, setBusReviews] = useState([]);
//   const [responseText, setResponseText] = useState({});
//   const [respondingReviewId, setRespondingReviewId] = useState(null);
//   const [showBusForm, setShowBusForm] = useState(false);
//   const [busForm, setBusForm] = useState(initialBusForm);

//   useEffect(() => {
//     if (user === false) {
//       router.push("/busoperator/login");
//     } else if (user) {
//       fetchBuses();
//       fetchBookings();
//       fetchNotifications();
//       fetchStaff();
//       fetchBusReviews();
//     }
//     // eslint-disable-next-line
//   }, [user, router]);

//   // Fetch buses owned by operator
//   const fetchBuses = async () => {
//     const { data, error } = await supabase
//       .from("buses")
//       .select("*")
//       .eq("bus_operator_id", user.id);
//     if (!error) setBuses(data || []);
//     else console.error("Error fetching buses:", error.message);
//   };

//   // Fetch bookings for operator's buses
//   const fetchBookings = async () => {
//     if (!buses.length) return;
//     const busIds = buses.map(b => b.id);
//     const { data, error } = await supabase
//       .from("bus_bookings")
//       .select("*, users(full_name)")
//       .in("bus_id", busIds);
//     if (!error) setBookings(data || []);
//     else console.error("Error fetching bookings:", error.message);
//   };

//   // Fetch notifications and bus bookings separately
//   const  fetchNotifications = async () => {
//     // Fetch notifications for the user
//     const { data: notificationsData, error: notificationsError } = await supabase
//       .from("notifications")
//       .select("*")
//       .eq("recipient_id", user.id)
//       .eq("type", "bus")
//       .order("created_at", { ascending: false });

//     if (notificationsError) {
//       console.error("Error fetching notifications:", notificationsError.message);
//       setNotifications([]);
//       return;
//     }

//     if (!buses.length) {
//       setNotifications(notificationsData || []);
//       return;
//     }

//     // Fetch bus bookings for the operator's buses
//     const busIds = buses.map(b => b.id);
//     const { data: bookingsData, error: bookingsError } = await supabase
//       .from("bus_bookings")
//       .select(`
//         id,
//         user_id,
//         bus_id,
//         seat_number,
//         status,
//         buses (name)
//       `)
//       .in("bus_id", busIds);

//     if (bookingsError) {
//       console.error("Error fetching bus bookings:", bookingsError.message);
//       setNotifications(notificationsData || []);
//       return;
//     }

//     // Match notifications with bookings
//     const enrichedNotifications = notificationsData.map(notification => {
//       const matchingBooking = bookingsData.find(
//         booking => booking.id === notification.booking_id
//       );
//       return {
//         ...notification,
//         bus_bookings: matchingBooking || null,
//       };
//     });

//     setNotifications(enrichedNotifications || []);
//   };

//   // Fetch staff assignments
//   const fetchStaff = async () => {
//     if (!buses.length) return;
//     const busIds = buses.map(b => b.id);
//     const { data, error } = await supabase
//       .from("bus_staff")
//       .select("*, users(full_name)")
//       .in("bus_id", busIds);
//     if (!error) setStaff(data || []);
//     else console.error("Error fetching staff:", error.message);
//   };

//   // Fetch bus reviews
//   const fetchBusReviews = async () => {
//     if (!buses.length) return;
//     const busIds = buses.map(b => b.id);
//     const { data, error } = await supabase
//       .from("bus_reviews")
//       .select("*, users(full_name)")
//       .in("bus_id", busIds)
//       .order("created_at", { ascending: false });
//     if (!error) setBusReviews(data || []);
//     else console.error("Error fetching reviews:", error.message);
//   };

//   // Approve booking and notify user
//   const handleApproveBooking = async (bookingId, userId, busName, notificationId) => {
//     const { error } = await supabase
//       .from("bus_bookings")
//       .update({ status: "Approved" })
//       .eq("id", bookingId);
//     if (error) {
//       console.error("Error approving booking:", error.message);
//       return;
//     }

//     await supabase.from("notifications").insert({
//       recipient_id: userId,
//       booking_id: bookingId,
//       type: "bus",
//       message: `Your booking for bus "${busName}" was approved.`,
//     });

//     if (notificationId) {
//       await supabase
//         .from("notifications")
//         .update({ is_read: true })
//         .eq("id", notificationId);
//     }

//     fetchBookings();
//     fetchNotifications();
//   };

//   // Reject booking and notify user
//   const handleRejectBooking = async (bookingId, userId, busName, notificationId) => {
//     const { error } = await supabase
//       .from("bus_bookings")
//       .update({ status: "Rejected" })
//       .eq("id", bookingId);
//     if (error) {
//       console.error("Error rejecting booking:", error.message);
//       return;
//     }

//     await supabase.from("notifications").insert({
//       recipient_id: userId,
//       booking_id: bookingId,
//       type: "bus",
//       message: `Your booking for bus "${busName}" was rejected.`,
//     });

//     if (notificationId) {
//       await supabase
//         .from("notifications")
//         .update({ is_read: true })
//         .eq("id", notificationId);
//     }

//     fetchBookings();
//     fetchNotifications();
//   };

//   // Respond to review
//   const handleRespondToReview = async (reviewId) => {
//     const response = responseText[reviewId];
//     if (!response) return;

//     const { error } = await supabase
//       .from("bus_reviews")
//       .update({ owner_response: response })
//       .eq("id", reviewId);
//     if (!error) {
//       setResponseText((prev) => ({ ...prev, [reviewId]: "" }));
//       setRespondingReviewId(null);
//       fetchBusReviews();
//     } else {
//       console.error("Error responding to review:", error.message);
//     }
//   };

//   // Add Bus Handlers
//   const handleBusFormChange = (e) => {
//     const { name, value } = e.target;
//     setBusForm((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleAddBus = async (e) => {
//     e.preventDefault();
//     const { name, from_location, to_location, seats, departure, arrival, driver_name, staff_count } = busForm;
//     if (!name || !from_location || !to_location || !seats) return;

//     const { error } = await supabase.from("buses").insert({
//       name,
//       from_location,
//       to_location,
//       seats: Number(seats),
//       departure,
//       arrival,
//       bus_operator_id: user.id,
//       driver_name,
//       staff_count: staff_count ? Number(staff_count) : 0,
//     });

//     if (!error) {
//       setBusForm(initialBusForm);
//       setShowBusForm(false);
//       fetchBuses();
//     } else {
//       console.error("Error adding bus:", error.message);
//     }
//   };

//   return (
//     <div className="max-w-5xl mx-auto py-10 px-6">
//       <nav className="flex justify-between mb-6">
//         <span className="text-2xl font-bold">🚌 Bus Operator Dashboard</span>
//         <button onClick={signOut} className="text-red-600">Sign Out</button>
//       </nav>
//       <div className="relative mb-6">
//         <button
//           onClick={() => setShowNotifications(!showNotifications)}
//           className="relative focus:outline-none"
//         >
//           <span className="text-2xl">🔔</span>
//           {notifications.some((n) => !n.is_read) && (
//             <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
//               {notifications.filter((n) => !n.is_read).length}
//             </span>
//           )}
//         </button>
//         {showNotifications && (
//           <div className="absolute right-0 mt-2 w-96 bg-white border border-gray-200 rounded shadow-lg z-10 p-3">
//             <h2 className="text-sm font-bold mb-2">Notifications</h2>
//             {notifications.length === 0 ? (
//               <p className="text-gray-600 text-sm">No notifications</p>
//             ) : (
//               <ul className="max-h-48 overflow-y-auto text-sm space-y-2">
//                 {notifications.map((notification) => (
//                   <li key={notification.id} className="p-2 bg-gray-100 rounded">
//                     <p>{notification.message}</p>
//                     {notification.type === "bus" &&
//                       notification.bus_bookings?.status === "Pending" && (
//                         <div className="mt-2 flex space-x-2">
//                           <button
//                             onClick={() =>
//                               handleApproveBooking(
//                                 notification.bus_bookings.id,
//                                 notification.bus_bookings.user_id,
//                                 notification.bus_bookings.buses?.name || "Unknown Bus",
//                                 notification.id
//                               )
//                             }
//                             className="text-green-600 hover:underline text-xs"
//                           >
//                             Approve
//                           </button>
//                           <button
//                             onClick={() =>
//                               handleRejectBooking(
//                                 notification.bus_bookings.id,
//                                 notification.bus_bookings.user_id,
//                                 notification.bus_bookings.buses?.name || "Unknown Bus",
//                                 notification.id
//                               )
//                             }
//                             className="text-red-600 hover:underline text-xs"
//                           >
//                             Reject
//                           </button>
//                         </div>
//                       )}
//                   </li>
//                 ))}
//               </ul>
//             )}
//           </div>
//         )}
//       </div>

//       {/* Add Bus Form */}
//       <section className="mb-8">
//         <div className="flex items-center justify-between mb-2">
//           <h2 className="text-xl font-semibold">Your Buses</h2>
//           <button
//             className="px-3 py-1 bg-blue-600 text-white rounded text-sm"
//             onClick={() => setShowBusForm((v) => !v)}
//           >
//             {showBusForm ? "Cancel" : "Add Bus"}
//           </button>
//         </div>
//         {showBusForm && (
//           <form onSubmit={handleAddBus} className="mb-4 p-4 bg-gray-50 rounded border">
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <input
//                 name="name"
//                 value={busForm.name}
//                 onChange={handleBusFormChange}
//                 placeholder="Bus Name"
//                 className="border rounded p-2"
//                 required
//               />
//               <input
//                 name="from_location"
//                 value={busForm.from_location}
//                 onChange={handleBusFormChange}
//                 placeholder="From Location"
//                 className="border rounded p-2"
//                 required
//               />
//               <input
//                 name="to_location"
//                 value={busForm.to_location}
//                 onChange={handleBusFormChange}
//                 placeholder="To Location"
//                 className="border rounded p-2"
//                 required
//               />
//               <input
//                 name="seats"
//                 type="number"
//                 value={busForm.seats}
//                 onChange={handleBusFormChange}
//                 placeholder="Seats"
//                 className="border rounded p-2"
//                 required
//               />
//               <input
//                 name="departure"
//                 value={busForm.departure}
//                 onChange={handleBusFormChange}
//                 placeholder="Departure Time"
//                 className="border rounded p-2"
//               />
//               <input
//                 name="arrival"
//                 value={busForm.arrival}
//                 onChange={handleBusFormChange}
//                 placeholder="Arrival Time"
//                 className="border rounded p-2"
//               />
//               <input
//                 name="driver_name"
//                 value={busForm.driver_name}
//                 onChange={handleBusFormChange}
//                 placeholder="Driver Name"
//                 className="border rounded p-2"
//               />
//               <input
//                 name="staff_count"
//                 type="number"
//                 value={busForm.staff_count}
//                 onChange={handleBusFormChange}
//                 placeholder="Staff Count"
//                 className="border rounded p-2"
//               />
//             </div>
//             <button type="submit" className="mt-4 px-4 py-2 bg-green-600 text-white rounded">
//               Add Bus
//             </button>
//           </form>
//         )}
//         <ul>
//           {buses.map((b) => (
//             <li key={b.id} className="mb-2 border-b pb-2">
//               <span className="font-bold">{b.name}</span> | {b.from_location} ➝ {b.to_location} | Seats: {b.seats} | Driver: {b.driver_name || "N/A"} | Staff: {b.staff_count ?? 0}
//             </li>
//           ))}
//         </ul>
//       </section>

//       {/* Bookings Section */}
//       <section className="mb-8">
//         <h2 className="text-xl font-semibold mb-2">Bookings</h2>
//         <ul>
//           {bookings.map((b) => (
//             <li key={b.id} className="mb-2 border-b pb-2 flex items-center justify-between">
//               <span>
//                 <span className="font-bold">{b.users?.full_name}</span> booked seat {b.seat_number} on {buses.find((bus) => bus.id === b.bus_id)?.name} | Status: {b.status}
//               </span>
//               {b.status === "Pending" && (
//                 <span>
//                   <button
//                     onClick={() => handleApproveBooking(b.id, b.user_id, buses.find((bus) => bus.id === b.bus_id)?.name || "Unknown Bus", null)}
//                     className="text-green-600 border px-2 py-1 rounded mr-2"
//                   >
//                     Approve
//                   </button>
//                   <button
//                     onClick={() => handleRejectBooking(b.id, b.user_id, buses.find((bus) => bus.id === b.bus_id)?.name || "Unknown Bus", null)}
//                     className="text-red-600 border px-2 py-1 rounded"
//                   >
//                     Reject
//                   </button>
//                 </span>
//               )}
//             </li>
//           ))}
//         </ul>
//       </section>

//       {/* Bus Reviews Section */}
//       <section className="mb-8">
//         <h2 className="text-xl font-semibold mb-2">Bus Reviews</h2>
//         <ul>
//           {busReviews.map((r) => (
//             <li key={r.id} className="mb-4 border-b pb-2">
//               <div>
//                 <span className="font-bold">{buses.find((b) => b.id === r.bus_id)?.name}</span>
//                 <span className="ml-2 text-yellow-500">{r.rating}★</span>
//               </div>
//               <div className="text-sm text-gray-700">{r.comment}</div>
//               <div className="text-xs text-gray-500">By: {r.users?.full_name || r.user_id}</div>
//               {r.owner_response && (
//                 <div className="text-xs text-blue-700 mt-1">
//                   <span className="font-semibold">Operator:</span> {r.owner_response}
//                 </div>
//               )}
//               {!r.owner_response && (
//                 <div className="mt-2">
//                   <textarea
//                     className="border rounded w-full p-1 text-xs"
//                     placeholder="Write a response..."
//                     value={responseText[r.id] || ""}
//                     onChange={(e) => setResponseText((prev) => ({ ...prev, [r.id]: e.target.value }))}
//                   />
//                   <button
//                     className="mt-1 px-2 py-1 bg-blue-600 text-white text-xs rounded"
//                     onClick={() => handleRespondToReview(r.id)}
//                     disabled={!responseText[r.id] || respondingReviewId === r.id}
//                   >
//                     Respond
//                   </button>
//                 </div>
//               )}
//             </li>
//           ))}
//         </ul>
//       </section>
//     </div>
//   );
// }

// "use client";

// import { useState, useEffect } from "react";
// import { useAuth } from "@/context/AuthContext";
// import { supabase } from "@/supabase/supabaseClient";
// import { useRouter } from "next/navigation";

// // --- NEW: Add Bus Form State ---
// const initialBusForm = {
//   name: "",
//   from_location: "",
//   to_location: "",
//   seats: "",
//   departure: "",
//   arrival: "",
//   driver_name: "",
//   staff_count: "",
// };

// export default function BusOperatorDashboard() {
//   const { user, signOut } = useAuth();
//   const router = useRouter();

//   const [buses, setBuses] = useState([]);
//   const [bookings, setBookings] = useState([]);
//   const [notifications, setNotifications] = useState([]);
//   const [showNotifications, setShowNotifications] = useState(false);
//   const [staff, setStaff] = useState([]);
//   const [staffUserId, setStaffUserId] = useState("");
//   const [staffRole, setStaffRole] = useState("driver");
//   const [selectedBusId, setSelectedBusId] = useState("");

//   // --- NEW: For review/response ---
//   const [busReviews, setBusReviews] = useState([]);
//   const [responseText, setResponseText] = useState({});
//   const [respondingReviewId, setRespondingReviewId] = useState(null);

//   // --- NEW: Add Bus Form State ---
//   const [showBusForm, setShowBusForm] = useState(false);
//   const [busForm, setBusForm] = useState(initialBusForm);

//   useEffect(() => {
//     if (user === false) {
//       router.push("/busoperator/login");
//     } else if (user) {
//       fetchBuses();
//       fetchBookings();
//       fetchNotifications();
//       fetchStaff();
//       fetchBusReviews(); // fetch reviews
//     }
//     // eslint-disable-next-line
//   }, [user, router]);

//   // Fetch buses owned by operator
//   const fetchBuses = async () => {
//     const { data, error } = await supabase
//       .from("buses")
//       .select("*")
//       .eq("bus_operator_id", user.id);
//     if (!error) setBuses(data || []);
//   };

//   // Fetch bookings for operator's buses
//   const fetchBookings = async () => {
//     if (!buses.length) return;
//     const busIds = buses.map(b => b.id);
//     const { data, error } = await supabase
//       .from("bus_bookings")
//       .select("*, users(full_name)")
//       .in("bus_id", busIds);
//     if (!error) setBookings(data || []);
//   };

//   // Fetch notifications
//   const fetchNotifications = async () => {
//     const { data, error } = await supabase
//       .from("notifications")
//       .select("*")
//       .eq("recipient_id", user.id)
//       .order("created_at", { ascending: false });
//     if (!error) setNotifications(data || []);
//   };

//   // Fetch staff assignments
//   const fetchStaff = async () => {
//     if (!buses.length) return;
//     const busIds = buses.map(b => b.id);
//     const { data, error } = await supabase
//       .from("bus_staff")
//       .select("*, users(full_name)")
//       .in("bus_id", busIds);
//     if (!error) setStaff(data || []);
//   };



//   // --- NEW: Approve/Reject booking and notify user ---
//   const handleApproveBooking = async (booking) => {
//     await supabase
//       .from("bus_bookings")
//       .update({ status: "Approved" })
//       .eq("id", booking.id);

//     const bus = buses.find(b => b.id === booking.bus_id);
//     await supabase.from("notifications").insert({
//       recipient_id: booking.user_id,
//       booking_id: booking.id,
//       type: "bus",
//       message: `Your booking for bus "${bus?.name}" was approved.`,
//     });

//     fetchBookings();
//     fetchNotifications();
//   };

//   const handleRejectBooking = async (booking) => {
//     await supabase
//       .from("bus_bookings")
//       .update({ status: "Rejected" })
//       .eq("id", booking.id);

//     const bus = buses.find(b => b.id === booking.bus_id);
//     await supabase.from("notifications").insert({
//       recipient_id: booking.user_id,
//       booking_id: booking.id,
//       type: "bus",
//       message: `Your booking for bus "${bus?.name}" was rejected.`,
//     });

//     fetchBookings();
//     fetchNotifications();
//   };

//   // --- NEW: Fetch bus reviews ---
//   const fetchBusReviews = async () => {
//     if (!buses.length) return;
//     const busIds = buses.map(b => b.id);
//     const { data, error } = await supabase
//       .from("bus_reviews")
//       .select("*, users(full_name)")
//       .in("bus_id", busIds)
//       .order("created_at", { ascending: false });
//     if (!error) setBusReviews(data || []);
//   };

//   // --- NEW: Respond to review ---
//   const handleRespondToReview = async (reviewId) => {
//     await supabase
//       .from("bus_reviews")
//       .update({ owner_response: responseText[reviewId] })
//       .eq("id", reviewId);
//     setResponseText((prev) => ({ ...prev, [reviewId]: "" }));
//     setRespondingReviewId(null);
//     fetchBusReviews();
//   };

//   // --- NEW: Add Bus Handlers ---
//   const handleBusFormChange = (e) => {
//     const { name, value } = e.target;
//     setBusForm((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleAddBus = async (e) => {
//     e.preventDefault();
//     const { name, from_location, to_location, seats, departure, arrival, driver_name, staff_count } = busForm;
//     if (!name || !from_location || !to_location || !seats) return;
//     await supabase.from("buses").insert({
//       name,
//       from_location,
//       to_location,
//       seats: Number(seats),
//       departure,
//       arrival,
//       bus_operator_id: user.id,
//       driver_name,
//       staff_count: staff_count ? Number(staff_count) : 0,
//     });
//     setBusForm(initialBusForm);
//     setShowBusForm(false);
//     fetchBuses();
//   };

//   return (
//     <div className="max-w-5xl mx-auto py-10 px-6">
//       <nav className="flex justify-between mb-6">
//         <span className="text-2xl font-bold">🚌 Bus Operator Dashboard</span>
//         <button onClick={signOut} className="text-red-600">Sign Out</button>
//       </nav>
//       <div className="relative mb-6">
//         <button
//           onClick={() => setShowNotifications(!showNotifications)}
//           className="relative focus:outline-none"
//         >
//           <span className="text-2xl">🔔</span>
//           {notifications.some((n) => !n.is_read) && (
//             <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
//               {notifications.filter((n) => !n.is_read).length}
//             </span>
//           )}
//         </button>
//         {showNotifications && (
//           <div className="absolute right-0 mt-2 w-96 bg-white border border-gray-200 rounded shadow-lg z-10 p-3">
//             <h2 className="text-sm font-bold mb-2">Notifications</h2>
//             {notifications.length === 0 ? (
//               <p className="text-gray-600 text-sm">No notifications</p>
//             ) : (
//               <ul className="max-h-48 overflow-y-auto text-sm space-y-2">
//                 {notifications.map((notification) => (
//                   <li key={notification.id} className="p-2 bg-gray-100 rounded">
//                     <p>{notification.message}</p>
//                   </li>
//                 ))}
//               </ul>
//             )}
//           </div>
//         )}
//       </div>

//       {/* --- NEW: Add Bus Form --- */}
//       <section className="mb-8">
//         <div className="flex items-center justify-between mb-2">
//           <h2 className="text-xl font-semibold">Your Buses</h2>
//           <button
//             className="px-3 py-1 bg-blue-600 text-white rounded text-sm"
//             onClick={() => setShowBusForm((v) => !v)}
//           >
//             {showBusForm ? "Cancel" : "Add Bus"}
//           </button>
//         </div>
//         {showBusForm && (
//           <form onSubmit={handleAddBus} className="mb-4 p-4 bg-gray-50 rounded border">
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <input name="name" value={busForm.name} onChange={handleBusFormChange} placeholder="Bus Name" className="border rounded p-2" required />
//               <input name="from_location" value={busForm.from_location} onChange={handleBusFormChange} placeholder="From Location" className="border rounded p-2" required />
//               <input name="to_location" value={busForm.to_location} onChange={handleBusFormChange} placeholder="To Location" className="border rounded p-2" required />
//               <input name="seats" type="number" value={busForm.seats} onChange={handleBusFormChange} placeholder="Seats" className="border rounded p-2" required />
//               <input name="departure" value={busForm.departure} onChange={handleBusFormChange} placeholder="Departure Time" className="border rounded p-2" />
//               <input name="arrival" value={busForm.arrival} onChange={handleBusFormChange} placeholder="Arrival Time" className="border rounded p-2" />
//               <input name="driver_name" value={busForm.driver_name} onChange={handleBusFormChange} placeholder="Driver Name" className="border rounded p-2" />
//               <input name="staff_count" type="number" value={busForm.staff_count} onChange={handleBusFormChange} placeholder="Staff Count" className="border rounded p-2" />
//             </div>
//             <button type="submit" className="mt-4 px-4 py-2 bg-green-600 text-white rounded">Add Bus</button>
//           </form>
//         )}
//         <ul>
//           {buses.map(b => (
//             <li key={b.id} className="mb-2 border-b pb-2">
//               {/* <span className="font-bold">{b.name}</span> | {b.from_location} ➝ {b.to_location} | Seats: {b.seats} */}
//               <span className="font-bold">{b.name}</span> | {b.from_location} ➝ {b.to_location} | Seats: {b.seats} | Driver: {b.driver_name || "N/A"} | Staff: {b.staff_count ?? 0}
//             </li>
//           ))}
//         </ul>
//       </section>

//       {/* Bookings Section */}
//       <section className="mb-8">
//         <h2 className="text-xl font-semibold mb-2">Bookings</h2>
//         <ul>
//           {bookings.map(b => (
//             <li key={b.id} className="mb-2 border-b pb-2 flex items-center justify-between">
//               <span>
//                 <span className="font-bold">{b.users?.full_name}</span> booked seat {b.seat_number} on {buses.find(bus => bus.id === b.bus_id)?.name} | Status: {b.status}
//               </span>
//               {b.status === "Pending" && (
//                 <span>
//                   <button
//                     onClick={() => handleApproveBooking(b)}
//                     className="text-green-600 border px-2 py-1 rounded mr-2"
//                   >
//                     Approve
//                   </button>
//                   <button
//                     onClick={() => handleRejectBooking(b)}
//                     className="text-red-600 border px-2 py-1 rounded"
//                   >
//                     Reject
//                   </button>
//                 </span>
//               )}
//             </li>
//           ))}
//         </ul>
//       </section>

//       {/* Bus Reviews Section */}
//       <section className="mb-8">
//         <h2 className="text-xl font-semibold mb-2">Bus Reviews</h2>
//         <ul>
//           {busReviews.map(r => (
//             <li key={r.id} className="mb-4 border-b pb-2">
//               <div>
//                 <span className="font-bold">{buses.find(b => b.id === r.bus_id)?.name}</span>
//                 <span className="ml-2 text-yellow-500">{r.rating}★</span>
//               </div>
//               <div className="text-sm text-gray-700">{r.comment}</div>
//               <div className="text-xs text-gray-500">By: {r.users?.full_name || r.user_id}</div>
//               {r.owner_response && (
//                 <div className="text-xs text-blue-700 mt-1">
//                   <span className="font-semibold">Operator:</span> {r.owner_response}
//                 </div>
//               )}
//               {/* Respond to review */}
//               {!r.owner_response && (
//                 <div className="mt-2">
//                   <textarea
//                     className="border rounded w-full p-1 text-xs"
//                     placeholder="Write a response..."
//                     value={responseText[r.id] || ""}
//                     onChange={e => setResponseText(prev => ({ ...prev, [r.id]: e.target.value }))}
//                   />
//                   <button
//                     className="mt-1 px-2 py-1 bg-blue-600 text-white text-xs rounded"
//                     onClick={() => handleRespondToReview(r.id)}
//                     disabled={!responseText[r.id] || respondingReviewId === r.id}
//                   >
//                     Respond
//                   </button>
//                 </div>
//               )}
//             </li>
//           ))}
//         </ul>
//       </section>

      
//     </div>
//   );
// }


// "use client";

// import { useState, useEffect } from "react";
// import { useAuth } from "@/context/AuthContext";
// import { supabase } from "@/supabase/supabaseClient";
// import { useRouter } from "next/navigation";

// // ...existing imports and code...

// export default function BusOperatorDashboard() {
//   const { user, signOut } = useAuth();
//   const router = useRouter();

//   const [buses, setBuses] = useState([]);
//   const [bookings, setBookings] = useState([]);
//   const [notifications, setNotifications] = useState([]);
//   const [showNotifications, setShowNotifications] = useState(false);
//   const [staff, setStaff] = useState([]);
//   const [staffUserId, setStaffUserId] = useState("");
//   const [staffRole, setStaffRole] = useState("driver");
//   const [selectedBusId, setSelectedBusId] = useState("");

//   // --- NEW: For review/response ---
//   const [busReviews, setBusReviews] = useState([]);
//   const [responseText, setResponseText] = useState({});
//   const [respondingReviewId, setRespondingReviewId] = useState(null);

//   useEffect(() => {
//     if (user === false) {
//       router.push("/busoperator/login");
//     } else if (user) {
//       fetchBuses();
//       fetchBookings();
//       fetchNotifications();
//       fetchStaff();
//       fetchBusReviews(); // fetch reviews
//     }
//   }, [user, router]);

//   // Fetch buses owned by operator
//   const fetchBuses = async () => {
//     const { data, error } = await supabase
//       .from("buses")
//       .select("*")
//       .eq("bus_operator_id", user.id);
//     if (!error) setBuses(data || []);
//   };

//   // Fetch bookings for operator's buses
//   const fetchBookings = async () => {
//     if (!buses.length) return;
//     const busIds = buses.map(b => b.id);
//     const { data, error } = await supabase
//       .from("bus_bookings")
//       .select("*, users(full_name)")
//       .in("bus_id", busIds);
//     if (!error) setBookings(data || []);
//   };

//   // Fetch notifications
//   const fetchNotifications = async () => {
//     const { data, error } = await supabase
//       .from("notifications")
//       .select("*")
//       .eq("recipient_id", user.id)
//       .order("created_at", { ascending: false });
//     if (!error) setNotifications(data || []);
//   };

//   // Fetch staff assignments
//   const fetchStaff = async () => {
//     if (!buses.length) return;
//     const busIds = buses.map(b => b.id);
//     const { data, error } = await supabase
//       .from("bus_staff")
//       .select("*, users(full_name)")
//       .in("bus_id", busIds);
//     if (!error) setStaff(data || []);
//   };

//   // Assign staff
//   const handleAssignStaff = async () => {
//     if (!selectedBusId || !staffUserId || !staffRole) return;
//     await supabase.from("bus_staff").insert({
//       bus_id: selectedBusId,
//       staff_id: staffUserId,
//       role: staffRole,
//     });
//     setStaffUserId("");
//     setStaffRole("driver");
//     setSelectedBusId("");
//     fetchStaff();
//   };

//   // --- NEW: Approve/Reject booking and notify user ---
//   const handleApproveBooking = async (booking) => {
//     await supabase
//       .from("bus_bookings")
//       .update({ status: "Approved" })
//       .eq("id", booking.id);

//     const bus = buses.find(b => b.id === booking.bus_id);
//     await supabase.from("notifications").insert({
//       recipient_id: booking.user_id,
//       booking_id: booking.id,
//       type: "bus",
//       message: `Your booking for bus "${bus?.name}" was approved.`,
//     });

//     fetchBookings();
//     fetchNotifications();
//   };

//   const handleRejectBooking = async (booking) => {
//     await supabase
//       .from("bus_bookings")
//       .update({ status: "Rejected" })
//       .eq("id", booking.id);

//     const bus = buses.find(b => b.id === booking.bus_id);
//     await supabase.from("notifications").insert({
//       recipient_id: booking.user_id,
//       booking_id: booking.id,
//       type: "bus",
//       message: `Your booking for bus "${bus?.name}" was rejected.`,
//     });

//     fetchBookings();
//     fetchNotifications();
//   };

//   // --- NEW: Fetch bus reviews ---
//   const fetchBusReviews = async () => {
//     if (!buses.length) return;
//     const busIds = buses.map(b => b.id);
//     const { data, error } = await supabase
//       .from("bus_reviews")
//       .select("*, users(full_name)")
//       .in("bus_id", busIds)
//       .order("created_at", { ascending: false });
//     if (!error) setBusReviews(data || []);
//   };

//   // --- NEW: Respond to review ---
//   const handleRespondToReview = async (reviewId) => {
//     await supabase
//       .from("bus_reviews")
//       .update({ owner_response: responseText[reviewId] })
//       .eq("id", reviewId);
//     setResponseText((prev) => ({ ...prev, [reviewId]: "" }));
//     setRespondingReviewId(null);
//     fetchBusReviews();
//   };

//   return (
//     <div className="max-w-5xl mx-auto py-10 px-6">
//       <nav className="flex justify-between mb-6">
//         <span className="text-2xl font-bold">🚌 Bus Operator Dashboard</span>
//         <button onClick={signOut} className="text-red-600">Sign Out</button>
//       </nav>
//       <div className="relative mb-6">
//         <button
//           onClick={() => setShowNotifications(!showNotifications)}
//           className="relative focus:outline-none"
//         >
//           <span className="text-2xl">🔔</span>
//           {notifications.some((n) => !n.is_read) && (
//             <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
//               {notifications.filter((n) => !n.is_read).length}
//             </span>
//           )}
//         </button>
//         {showNotifications && (
//           <div className="absolute right-0 mt-2 w-96 bg-white border border-gray-200 rounded shadow-lg z-10 p-3">
//             <h2 className="text-sm font-bold mb-2">Notifications</h2>
//             {notifications.length === 0 ? (
//               <p className="text-gray-600 text-sm">No notifications</p>
//             ) : (
//               <ul className="max-h-48 overflow-y-auto text-sm space-y-2">
//                 {notifications.map((notification) => (
//                   <li key={notification.id} className="p-2 bg-gray-100 rounded">
//                     <p>{notification.message}</p>
//                   </li>
//                 ))}
//               </ul>
//             )}
//           </div>
//         )}
//       </div>

//       {/* Buses Section */}
//       <section className="mb-8">
//         <h2 className="text-xl font-semibold mb-2">Your Buses</h2>
//         <ul>
//           {buses.map(b => (
//             <li key={b.id} className="mb-2 border-b pb-2">
//               <span className="font-bold">{b.name}</span> | {b.from_location} ➝ {b.to_location} | Seats: {b.seats}
//             </li>
//           ))}
//         </ul>
//       </section>

//       {/* Bookings Section */}
//       <section className="mb-8">
//         <h2 className="text-xl font-semibold mb-2">Bookings</h2>
//         <ul>
//           {bookings.map(b => (
//             <li key={b.id} className="mb-2 border-b pb-2 flex items-center justify-between">
//               <span>
//                 <span className="font-bold">{b.users?.full_name}</span> booked seat {b.seat_number} on {buses.find(bus => bus.id === b.bus_id)?.name} | Status: {b.status}
//               </span>
//               {b.status === "Pending" && (
//                 <span>
//                   <button
//                     onClick={() => handleApproveBooking(b)}
//                     className="text-green-600 border px-2 py-1 rounded mr-2"
//                   >
//                     Approve
//                   </button>
//                   <button
//                     onClick={() => handleRejectBooking(b)}
//                     className="text-red-600 border px-2 py-1 rounded"
//                   >
//                     Reject
//                   </button>
//                 </span>
//               )}
//             </li>
//           ))}
//         </ul>
//       </section>

//       {/* Bus Reviews Section */}
//       <section className="mb-8">
//         <h2 className="text-xl font-semibold mb-2">Bus Reviews</h2>
//         <ul>
//           {busReviews.map(r => (
//             <li key={r.id} className="mb-4 border-b pb-2">
//               <div>
//                 <span className="font-bold">{buses.find(b => b.id === r.bus_id)?.name}</span>
//                 <span className="ml-2 text-yellow-500">{r.rating}★</span>
//               </div>
//               <div className="text-sm text-gray-700">{r.comment}</div>
//               <div className="text-xs text-gray-500">By: {r.users?.full_name || r.user_id}</div>
//               {r.owner_response && (
//                 <div className="text-xs text-blue-700 mt-1">
//                   <span className="font-semibold">Operator:</span> {r.owner_response}
//                 </div>
//               )}
//               {/* Respond to review */}
//               {!r.owner_response && (
//                 <div className="mt-2">
//                   <textarea
//                     className="border rounded w-full p-1 text-xs"
//                     placeholder="Write a response..."
//                     value={responseText[r.id] || ""}
//                     onChange={e => setResponseText(prev => ({ ...prev, [r.id]: e.target.value }))}
//                   />
//                   <button
//                     className="mt-1 px-2 py-1 bg-blue-600 text-white text-xs rounded"
//                     onClick={() => handleRespondToReview(r.id)}
//                     disabled={!responseText[r.id] || respondingReviewId === r.id}
//                   >
//                     Respond
//                   </button>
//                 </div>
//               )}
//             </li>
//           ))}
//         </ul>
//       </section>

//       {/* Assign Staff Section */}
//       <section className="mb-8">
//         <h2 className="text-xl font-semibold mb-2">Assign Staff</h2>
//         <div className="mb-2 flex flex-wrap items-center gap-2">
//           <select value={selectedBusId} onChange={e => setSelectedBusId(e.target.value)} className="border rounded px-2 py-1">
//             <option value="">Select Bus</option>
//             {buses.map(b => (
//               <option key={b.id} value={b.id}>{b.name}</option>
//             ))}
//           </select>
//           <input
//             type="text"
//             placeholder="Staff User ID"
//             value={staffUserId}
//             onChange={e => setStaffUserId(e.target.value)}
//             className="border rounded px-2 py-1"
//           />
//           <select value={staffRole} onChange={e => setStaffRole(e.target.value)} className="border rounded px-2 py-1">
//             <option value="driver">Driver</option>
//             <option value="assistant">Assistant</option>
//           </select>
//           <button onClick={handleAssignStaff} className="text-blue-600 border px-3 py-1 rounded">Assign</button>
//         </div>
//         <ul>
//           {staff.map(s => (
//             <li key={s.id}>
//               {s.users?.full_name || s.staff_id} as {s.role} on bus {buses.find(b => b.id === s.bus_id)?.name}
//             </li>
//           ))}
//         </ul>
//       </section>
//     </div>
//   );
// }
