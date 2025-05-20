"use client";

import { createContext, useState, useContext } from "react";
import { supabase } from "../supabase/supabaseClient";

const HotelOwnerContext = createContext();

export const HotelOwnerProvider = ({ children }) => {
  const [hotels, setHotels] = useState([]);

  // 🔄 Fetch hotels owned by the logged-in user
  const fetchHotels = async () => {
    const { data: user, error: userError } = await supabase.auth.getUser();

    if (userError || !user?.user) {
      console.error("User not authenticated or error fetching user", userError?.message);
      return { error: userError, data: [] };
    }

    const { data: hotelData, error: hotelError } = await supabase
      .from("hotels")
      .select("*")
      .eq("hotel_owner_id", user.user.id)
      .order("created_at", { ascending: false });

    if (hotelError) {
      console.error("Error fetching hotels:", hotelError.message);
      return { error: hotelError, data: [] };
    }

    setHotels(hotelData || []);
    return { data: hotelData, error: null };
  };

  // ➕ Add a new hotel
  const addHotel = async (newHotel) => {
    const { data: user, error: userError } = await supabase.auth.getUser();

    if (userError || !user?.user) {
      console.error("User not authenticated or error fetching user", userError?.message);
      return { error: userError, data: null };
    }

    try {
      const { data: hotel, error: hotelError } = await supabase
        .from("hotels")
        .insert([
          {
            name: newHotel.name,
            location: newHotel.location,
            price: newHotel.price,
            description: newHotel.description,
            room_type: newHotel.room_type || 'Standard',
            hotel_owner_id: user.user.id,
            images: newHotel.images || [],
          },
        ])
        .select()
        .single();

      if (hotelError) throw hotelError;

      setHotels([...hotels, hotel]);
      return { data: hotel, error: null };
    } catch (error) {
      console.error("Error adding hotel:", error.message);
      return { error, data: null };
    }
  };

  // ✏️ Update existing hotel
  const updateHotel = async (id, updatedData) => {
    try {
      const { data: hotel, error: hotelError } = await supabase
        .from("hotels")
        .update({
          name: updatedData.name,
          location: updatedData.location,
          price: updatedData.price,
          description: updatedData.description,
          room_type: updatedData.room_type || 'Standard',
          images: updatedData.images || [],
        })
        .eq("id", id)
        .select()
        .single();

      if (hotelError) throw hotelError;

      setHotels(hotels.map((h) => (h.id === id ? hotel : h)));
      return { data: hotel, error: null };
    } catch (error) {
      console.error("Error updating hotel:", error.message);
      return { error, data: null };
    }
  };

  // ❌ Delete hotel by ID
  const deleteHotel = async (id) => {
    const { error } = await supabase.from("hotels").delete().eq("id", id);

    if (error) {
      console.error("Error deleting hotel:", error.message);
      return { error, data: null };
    }

    setHotels(hotels.filter((hotel) => hotel.id !== id));
    return { data: true, error: null };
  };

  return (
    <HotelOwnerContext.Provider
      value={{
        hotels,
        fetchHotels,
        addHotel,
        updateHotel,
        deleteHotel,
      }}
    >
      {children}
    </HotelOwnerContext.Provider>
  );
};

export const useHotelOwnerContext = () => useContext(HotelOwnerContext);







// "use client";

// import { createContext, useState, useContext } from "react";
// import { supabase } from "../supabase/supabaseClient";

// const HotelOwnerContext = createContext();

// export const HotelOwnerProvider = ({ children }) => {
//   const [hotels, setHotels] = useState([]);
//   const [reviews, setReviews] = useState([]);

//   // 🔄 Fetch hotels owned by the logged-in user, including associated rooms
//   const fetchHotels = async () => {
//     const { data: user, error: userError } = await supabase.auth.getUser();

//     if (userError || !user?.user) {
//       console.error("User not authenticated or error fetching user", userError?.message);
//       return { error: userError, data: [] };
//     }

//     // Fetch hotels with associated rooms
//     const { data: hotelData, error: hotelError } = await supabase
//       .from("hotels")
//       .select("*, rooms(*)")
//       .eq("hotel_owner_id", user.user.id)
//       .order("created_at", { ascending: false });

//     if (hotelError) {
//       console.error("Error fetching hotels:", hotelError.message);
//       return { error: hotelError, data: [] };
//     }

//     setHotels(hotelData || []);
//     return { data: hotelData, error: null };
//   };

//   // ➕ Add a new hotel with images and rooms
//   const addHotel = async (newHotel) => {
//     const { data: user, error: userError } = await supabase.auth.getUser();

//     if (userError || !user?.user) {
//       console.error("User not authenticated or error fetching user", userError?.message);
//       return { error: userError, data: null };
//     }

//     try {
//       // Insert hotel
//       const { data: hotel, error: hotelError } = await supabase
//         .from("hotels")
//         .insert([
//           {
//             name: newHotel.name,
//             location: newHotel.location,
//             price: newHotel.price,
//             description: newHotel.description,
//             image_urls: newHotel.image_urls || [],
//             hotel_owner_id: user.user.id,
//           },
//         ])
//         .select()
//         .single();

//       if (hotelError) throw hotelError;

//       // Insert rooms if provided
//       if (newHotel.rooms?.length) {
//         const roomsData = newHotel.rooms.map((room) => ({
//           hotel_id: hotel.id,
//           room_type: room.room_type,
//           number_of_beds: room.number_of_beds,
//         }));
//         const { error: roomsError } = await supabase.from("rooms").insert(roomsData);
//         if (roomsError) throw roomsError;
//       }

//       // Fetch the complete hotel with rooms
//       const { data: updatedHotel, error: fetchError } = await supabase
//         .from("hotels")
//         .select("*, rooms(*)")
//         .eq("id", hotel.id)
//         .single();

//       if (fetchError) throw fetchError;

//       setHotels([...hotels, updatedHotel]);
//       return { data: updatedHotel, error: null };
//     } catch (error) {
//       console.error("Error adding hotel:", error.message);
//       return { error, data: null };
//     }
//   };

//   // ✏️ Update existing hotel, including images and rooms
//   const updateHotel = async (id, updatedData) => {
//     try {
//       // Update hotel
//       const { data: hotel, error: hotelError } = await supabase
//         .from("hotels")
//         .update({
//           name: updatedData.name,
//           location: updatedData.location,
//           price: updatedData.price,
//           description: updatedData.description,
//           image_urls: updatedData.image_urls || [],
//         })
//         .eq("id", id)
//         .select()
//         .single();

//       if (hotelError) throw hotelError;

//       // Delete existing rooms
//       const { error: deleteError } = await supabase
//         .from("rooms")
//         .delete()
//         .eq("hotel_id", id);
//       if (deleteError) throw deleteError;

//       // Insert new rooms if provided
//       if (updatedData.rooms?.length) {
//         const roomsData = updatedData.rooms.map((room) => ({
//           hotel_id: id,
//           room_type: room.room_type,
//           number_of_beds: room.number_of_beds,
//         }));
//         const { error: roomsError } = await supabase.from("rooms").insert(roomsData);
//         if (roomsError) throw roomsError;
//       }

//       // Fetch the complete updated hotel with rooms
//       const { data: updatedHotel, error: fetchError } = await supabase
//         .from("hotels")
//         .select("*, rooms(*)")
//         .eq("id", id)
//         .single();

//       if (fetchError) throw fetchError;

//       setHotels(hotels.map((hotel) => (hotel.id === id ? updatedHotel : hotel)));
//       return { data: updatedHotel, error: null };
//     } catch (error) {
//       console.error("Error updating hotel:", error.message);
//       return { error, data: null };
//     }
//   };

//   // ❌ Delete hotel by ID (rooms are automatically deleted via CASCADE)
//   const deleteHotel = async (id) => {
//     const { error } = await supabase.from("hotels").delete().eq("id", id);

//     if (error) {
//       console.error("Error deleting hotel:", error.message);
//       return { error, data: null };
//     }

//     setHotels(hotels.filter((hotel) => hotel.id !== id));
//     return { data: true, error: null };
//   };

//   // 🔄 Fetch reviews for this owner's hotels
//   const fetchReviews = async () => {
//     const { data: user, error: userError } = await supabase.auth.getUser();

//     if (userError || !user?.user) {
//       console.error("User not authenticated or error fetching user", userError?.message);
//       return { error: userError, data: [] };
//     }

//     const { data: myHotels, error: hotelError } = await supabase
//       .from("hotels")
//       .select("id")
//       .eq("hotel_owner_id", user.user.id);

//     if (hotelError) {
//       console.error("Error fetching hotel IDs:", hotelError.message);
//       return { error: hotelError, data: [] };
//     }

//     const hotelIds = (myHotels || []).map((h) => h.id);
//     if (!hotelIds.length) {
//       setReviews([]);
//       return { data: [], error: null };
//     }

//     const { data, error } = await supabase
//       .from("reviews")
//       .select("*, users(full_name), hotels(name)")
//       .in("hotel_id", hotelIds)
//       .order("created_at", { ascending: false });

//     if (error) {
//       console.error("Error fetching reviews:", error.message);
//       return { error, data: [] };
//     }

//     setReviews(data || []);
//     return { data, error: null };
//   };

//   // 💬 Respond to a review
//   const respondToReview = async (reviewId, response) => {
//     const { data, error } = await supabase
//       .from("reviews")
//       .update({ owner_response: response })
//       .eq("id", reviewId)
//       .select();

//     if (error) {
//       console.error("Error responding to review:", error.message);
//       return { error, data: null };
//     }

//     // Refetch reviews to update state
//     await fetchReviews();
//     return { data: data[0], error: null };
//   };

//   return (
//     <HotelOwnerContext.Provider
//       value={{
//         hotels,
//         fetchHotels,
//         addHotel,
//         updateHotel,
//         deleteHotel,
//         reviews,
//         fetchReviews,
//         respondToReview,
//       }}
//     >
//       {children}
//     </HotelOwnerContext.Provider>
//   );
// };

// export const useHotelOwnerContext = () => useContext(HotelOwnerContext);










// "use client";
// import { createContext, useState, useContext } from "react";
// import { supabase } from "../supabase/supabaseClient";

// const HotelOwnerContext = createContext();

// export const HotelOwnerProvider = ({ children }) => {
//   const [hotels, setHotels] = useState([]);

//   // 🔄 Fetch hotels owned by the logged-in user
//   const fetchHotels = async () => {
//     const { data: user, error: userError } = await supabase.auth.getUser();

//     if (userError || !user) {
//       console.error("User not authenticated or error fetching user", userError);
//       return;
//     }

//     const { data, error } = await supabase
//       .from("hotels")
//       .select("*")
//       .eq("hotel_owner_id", user.user.id);

//     if (error) {
//       console.error("Error fetching hotels:", error.message);
//     } else {
//       setHotels(data || []);
//     }
//   };

//   // ➕ Add a new hotel
//   const addHotel = async (newHotel) => {
//     const { data: user, error: userError } = await supabase.auth.getUser();

//     if (userError || !user) {
//       console.error("User not authenticated or error fetching user", userError);
//       return;
//     }

//     const { data, error } = await supabase
//       .from("hotels")
//       .insert([
//         {
//           ...newHotel,
//           hotel_owner_id: user.user.id, // Automatically associate the hotel with the logged-in owner
//         },
//       ])
//       .select();

//     if (error) {
//       console.error("Error adding hotel:", error.message);
//     } else {
//       setHotels([...hotels, data[0]]);
//     }
//   };

//   // ✏️ Update existing hotel
//   const updateHotel = async (id, updatedData) => {
//     const { data, error } = await supabase
//       .from("hotels")
//       .update(updatedData)
//       .eq("id", id)
//       .select();

//     if (error) {
//       console.error("Error updating hotel:", error.message);
//     } else {
//       setHotels(hotels.map((hotel) => (hotel.id === id ? data[0] : hotel)));
//     }
//   };

//   // ❌ Delete hotel by ID
//   const deleteHotel = async (id) => {
//     const { error } = await supabase.from("hotels").delete().eq("id", id);

//     if (error) {
//       console.error("Error deleting hotel:", error.message);
//     } else {
//       setHotels(hotels.filter((hotel) => hotel.id !== id));
//     }
//   };

//   // --- NEW: Fetch reviews for this owner's hotels ---
//   const [reviews, setReviews] = useState([]);
//   const fetchReviews = async () => {
//     const { data: user, error: userError } = await supabase.auth.getUser();
//     if (userError || !user) {
//       console.error("User not authenticated or error fetching user", userError);
//       return;
//     }
//     // Get all hotel IDs owned by this owner
//     const { data: myHotels } = await supabase
//       .from("hotels")
//       .select("id")
//       .eq("hotel_owner_id", user.user.id);
//     const hotelIds = (myHotels || []).map(h => h.id);
//     if (!hotelIds.length) {
//       setReviews([]);
//       return;
//     }
//     // Fetch reviews for these hotels
//     const { data, error } = await supabase
//       .from("reviews")
//       .select("*, users(full_name)")
//       .in("hotel_id", hotelIds)
//       .order("created_at", { ascending: false });
//     if (error) {
//       console.error("Error fetching reviews:", error.message);
//     } else {
//       setReviews(data || []);
//     }
//   };

//   // --- NEW: Respond to a review ---
//   const respondToReview = async (reviewId, response) => {
//     const { error } = await supabase
//       .from("reviews")
//       .update({ owner_response: response })
//       .eq("id", reviewId);
//     if (error) {
//       console.error("Error responding to review:", error.message);
//     } else {
//       fetchReviews();
//     }
//   };

//   return (
//     <HotelOwnerContext.Provider
//       value={{
//         hotels,
//         fetchHotels,
//         addHotel,
//         updateHotel,
//         deleteHotel,
//         // --- NEW: Expose reviews and review actions ---
//         reviews,
//         fetchReviews,
//         respondToReview,
//       }}
//     >
//       {children}
//     </HotelOwnerContext.Provider>
//   );
// };

// export const useHotelOwnerContext = () => useContext(HotelOwnerContext);

// --- Previous code for reference ---
// The previous code is above, unchanged except for the additions of reviews logic.

// "use client";
// import { createContext, useState, useContext } from "react";
// import { supabase } from "../supabase/supabaseClient";

// const HotelOwnerContext = createContext();

// export const HotelOwnerProvider = ({ children }) => {
//   const [hotels, setHotels] = useState([]);

//   // 🔄 Fetch hotels owned by the logged-in user
//   const fetchHotels = async () => {
//     const { data: user, error: userError } = await supabase.auth.getUser();

//     if (userError || !user) {
//       console.error("User not authenticated or error fetching user", userError);
//       return;
//     }

//     const { data, error } = await supabase
//       .from("hotels")
//       .select("*")
//       .eq("hotel_owner_id", user.user.id);

//     if (error) {
//       console.error("Error fetching hotels:", error.message);
//     } else {
//       setHotels(data || []);
//     }
//   };

//   // ➕ Add a new hotel
//   const addHotel = async (newHotel) => {
//     const { data: user, error: userError } = await supabase.auth.getUser();

//     if (userError || !user) {
//       console.error("User not authenticated or error fetching user", userError);
//       return;
//     }

//     const { data, error } = await supabase
//       .from("hotels")
//       .insert([
//         {
//           ...newHotel,
//           hotel_owner_id: user.user.id, // Automatically associate the hotel with the logged-in owner
//         },
//       ])
//       .select();

//     if (error) {
//       console.error("Error adding hotel:", error.message);
//     } else {
//       setHotels([...hotels, data[0]]);
//     }
//   };

//   // ✏️ Update existing hotel
//   const updateHotel = async (id, updatedData) => {
//     const { data, error } = await supabase
//       .from("hotels")
//       .update(updatedData)
//       .eq("id", id)
//       .select();

//     if (error) {
//       console.error("Error updating hotel:", error.message);
//     } else {
//       setHotels(hotels.map((hotel) => (hotel.id === id ? data[0] : hotel)));
//     }
//   };

//   // ❌ Delete hotel by ID
//   const deleteHotel = async (id) => {
//     const { error } = await supabase.from("hotels").delete().eq("id", id);

//     if (error) {
//       console.error("Error deleting hotel:", error.message);
//     } else {
//       setHotels(hotels.filter((hotel) => hotel.id !== id));
//     }
//   };

//   return (
//     <HotelOwnerContext.Provider
//       value={{
//         hotels,
//         fetchHotels,
//         addHotel,
//         updateHotel,
//         deleteHotel,
//       }}
//     >
//       {children}
//     </HotelOwnerContext.Provider>
//   );
// };

// export const useHotelOwnerContext = () => useContext(HotelOwnerContext);