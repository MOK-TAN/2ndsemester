


// "use client";

// import { useState } from 'react';
// import Link from 'next/link';

// export default function Home() {

//   const [isDropdownOpen, setIsDropdownOpen] = useState(false);

//   const toggleDropdown = () => {
//     setIsDropdownOpen(!isDropdownOpen);
//   };

//   return (
//     <div className="bg-white">





//       <header className="absolute inset-x-0 top-0 z-50">
//         <nav className="flex items-center justify-between p-6 lg:px-8" aria-label="Global">
//           <div className="flex lg:flex-1 justify-center">
//             <a href="/" className="-m-1.5 p-1.5">
//               <span className="text-gray-900">EasyTrip.com</span>
//             </a>
//           </div>
//           <div className="hidden lg:flex lg:gap-x-12">
//             <a href="/about" className="text-sm font-semibold text-gray-900">About Us</a>
//             <a href="/contact" className="text-sm font-semibold text-gray-900">Contact Us</a>
//             <a href="#" className="text-sm font-semibold text-gray-900">Reviews</a>
//             <a href="#" className="text-sm font-semibold text-gray-900">Company</a>
//           </div>
          
//           {/* Dropdown for login */}
//           <div className="hidden lg:flex lg:flex-1 lg:justify-end group relative">
//             <a href="#" className="text-sm font-semibold text-gray-900">
//               Log in <span aria-hidden="true">&rarr;</span>
//             </a>
//             <div className="absolute hidden mt-2 w-48 bg-white shadow-lg rounded-lg group-hover:block">
//               <div className="py-2">
//                 <a
//                   href="/agent/login"
//                   className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
//                 >
//                   Agent Login
//                 </a>
//                 <a
//                   href="/user/login"
//                   className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
//                 >
//                   User Login
//                 </a>
//                 <a
//                   href="/busoperator/login"
//                   className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
//                 >
//                   Bus Operator Login
//                 </a>

//                 <a
//                   href="/hotelowner/login"
//                   className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
//                 >
//                   Hotel owner Login
//                 </a>
//               </div>
//             </div>
//           </div>
//         </nav>
//       </header>

//       <section className="relative bg-gray-50 py-16 sm:py-24 lg:py-40">
//         <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
//           <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
//             Find Your Next Trip with EasyTrip
//           </h2>
//           <p className="mt-4 text-lg text-gray-600">
//             Search and book your next vacation with ease. Discover the best deals, destinations, and experiences tailored just for you.
//           </p>
          
//           <form className="mt-8 max-w-md mx-auto">
//             <div className="flex justify-center">
//               <div className="relative w-full">
//                 <input
//                   type="text"
//                   id="location-search"
//                   className="block w-full py-3 pl-4 pr-12 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
//                   placeholder="Enter a destination"
//                 />
//                 <button
//                   type="submit"
//                   className="absolute top-0 right-0 px-4 py-3 text-sm font-medium text-white bg-indigo-600 rounded-r-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
//                 >
//                   Search
//                 </button>
//               </div>
//             </div>
//           </form>
//         </div>
//       </section>
// const handleSubmit = (e) => {
  //   e.preventDefault();
  //   if (query.trim()) {
  //     setError('');
  //     router.push('/user/login');
  //   } else {
  //     setError('Please enter something');
  //   }
  // };

"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

  // const [query, setQuery] = useState('');
  // const [suggestions, setSuggestions] = useState([]);
  // const router = useRouter();

  // const destinations = ['Pokhara', 'Kathmandu', 'Lumbini', 'Chitwan', 'Bhaktapur'];

  // const handleChange = (e) => {
  //   const value = e.target.value;
  //   setQuery(value);
  //   if (value.length > 0) {
  //     const filtered = destinations.filter((d) =>
  //       d.toLowerCase().includes(value.toLowerCase())
  //     );
  //     setSuggestions(filtered);
  //   } else {
  //     setSuggestions([]);
  //   }
  // };

  // const handleSelect = (destination) => {
  //   setQuery(destination);
  //   setSuggestions([]);
  //   router.push('/user/login');
  // };

  // const handleSubmit = (e) => {
  //   e.preventDefault();
  //   if (query.trim()) {
  //     router.push('/user/login');
  //   }
  // };

export default function Home() {

    const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [error, setError] = useState("");
  const router = useRouter();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const destinations = [
    { name: "Pokhara", hotels: 5, bus: 3 },
    { name: "Kathmandu", hotels: 10, bus: 4 },
    { name: "Lumbini", hotels: 4, bus: 2 },
    { name: "Chitwan", hotels: 6, bus: 2 },
    { name: "Bhaktapur", hotels: 3, bus: 1 },
    { name: "Biratnagar", hotels: 7, bus: 3 },
    { name: "Butwal", hotels: 5, bus: 2 },
    { name: "Dharan", hotels: 6, bus: 3 },
    { name: "Nepalgunj", hotels: 4, bus: 2 },
    { name: "Hetauda", hotels: 3, bus: 2 },
    { name: "Itahari", hotels: 4, bus: 2 },
    { name: "Janakpur", hotels: 5, bus: 3 },
    { name: "Birgunj", hotels: 6, bus: 4 },
    { name: "Tansen", hotels: 2, bus: 1 },
    { name: "Dhangadhi", hotels: 4, bus: 2 },
    { name: "Bharatpur", hotels: 5, bus: 2 },
    { name: "Gorkha", hotels: 2, bus: 1 },
    { name: "Damak", hotels: 3, bus: 2 },
    { name: "Banepa", hotels: 2, bus: 1 },
    { name: "Panauti", hotels: 1, bus: 1 },
  ];

  const handleChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    setError("");
    if (value.length > 0) {
      const filtered = destinations.filter((d) =>
        d.name.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  };

  const handleSelect = (destination) => {
    setQuery(destination.name);
    setSuggestions([]);
    setError("");
    router.push("/user/login");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmedQuery = query.trim();
    const validPattern = /^[a-zA-Z\s]+$/;

    if (!trimmedQuery) {
      setError("Please enter something");
    } else if (!validPattern.test(trimmedQuery)) {
      setError("Invalid characters entered");
      setQuery("");
      setSuggestions([]);
    } else {
      setError("");
      router.push("/user/login");
    }
  };

  return (
    <div className="bg-gray-100">
      {/* Header */}

    <header className="bg-white shadow-md sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        <Link href="/" className="text-2xl font-bold text-indigo-600 hover:text-indigo-800 transition-colors">
          EasyTrip
        </Link>
        <div className="hidden lg:flex lg:gap-x-8">
          <Link href="/about" className="text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors">
            About Us
          </Link>
          <Link href="/contact" className="text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors">
            Contact Us
          </Link>
          <Link href="#" className="text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors">
            Reviews
          </Link>
          <Link href="#" className="text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors">
            Company
          </Link>
        </div>
        <div className="relative group">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            onMouseEnter={() => setIsDropdownOpen(true)}
            className="flex items-center text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors"
          >
            Log in / Sign up
            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
          <div
            onMouseLeave={() => setIsDropdownOpen(false)}
            className={`absolute right-0 mt-2 w-56 bg-white shadow-xl rounded-xl transition-all duration-300 ease-out ${
              isDropdownOpen ? "opacity-100 pointer-events-auto translate-y-0" : "opacity-0 pointer-events-none translate-y-2"
            } z-10`}
          >
            <div className="py-2">
              <Link
                href="/user/login"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50"
                onClick={() => setIsDropdownOpen(false)}
              >
                User Login
              </Link>
              <Link
                href="/busoperator/login"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50"
                onClick={() => setIsDropdownOpen(false)}
              >
                Bus Operator Login
              </Link>
              <Link
                href="/hotelowner/login"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50"
                onClick={() => setIsDropdownOpen(false)}
              >
                Hotel Owner Login
              </Link>
            </div>
            <div className="border-t border-gray-100 py-2">
              <Link
                href="/user/signup"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50"
                onClick={() => setIsDropdownOpen(false)}
              >
                User Signup
              </Link>
              <Link
                href="/busoperator/signup"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50"
                onClick={() => setIsDropdownOpen(false)}
              >
                Bus Operator Signup
              </Link>
              <Link
                href="/hotelowner/signup"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50"
                onClick={() => setIsDropdownOpen(false)}
              >
                Hotel Owner Signup
              </Link>
            </div>
          </div>
        </div>
      </nav>
      </header>



    {/* <header className="bg-white shadow-md sticky top-0 z-50">
  <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
    <Link href="/" className="text-2xl font-bold text-indigo-600 hover:text-indigo-800 transition-colors">
      EasyTrip
    </Link>
    <div className="hidden lg:flex lg:gap-x-8">
      <Link href="/about" className="text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors">
        About Us
      </Link>
      <Link href="/contact" className="text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors">
        Contact Us
      </Link>
      <Link href="#" className="text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors">
        Reviews
      </Link>
      <Link href="#" className="text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors">
        Company
      </Link>
    </div>
    <div className="relative group">
      <button className="flex items-center text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors">
        Log in / Sign up
        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
        </svg>
      </button>
      <div className="absolute right-0 mt-2 w-56 bg-white shadow-xl rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none group-hover:pointer-events-auto z-10">
        <div className="py-2">
          <Link href="/user/login" className="block px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50">
            User Login
          </Link>
          <Link href="/busoperator/login" className="block px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50">
            Bus Operator Login
          </Link>
          <Link href="/hotelowner/login" className="block px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50">
            Hotel Owner Login
          </Link>
        </div>
        <div className="border-t border-gray-100 py-2">
          <Link href="/user/signup" className="block px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50">
            User Signup
          </Link>
          <Link href="/busoperator/signup" className="block px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50">
            Bus Operator Signup
          </Link>
          <Link href="/hotelowner/signup" className="block px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50">
            Hotel Owner Signup
          </Link>
        </div>
      </div>
    </div>
  </nav>
</header> */}

      {/* Hero Section */}
      <section className="relative h-[65vh] flex items-center justify-center bg-gradient-to-b from-indigo-500 to-indigo-700 text-white">
  <div className="absolute inset-0 bg-cover bg-center opacity-20" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1950&q=80')" }}></div>
  <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 animate-fade-in">
      Discover Your Next Adventure with EasyTrip
    </h1>
    <p className="text-lg sm:text-xl text-indigo-50 mb-8 max-w-2xl mx-auto">
      Book hotels, buses, and trips seamlessly with the best deals and personalized experiences.
    </p>
    <form onSubmit={handleSubmit} className="mt-8 max-w-xl mx-auto relative animate-slide-up">
      <div className="flex bg-white shadow-xl rounded-lg overflow-hidden border border-gray-200">
        <input
          type="text"
          value={query}
          onChange={handleChange}
          className={`w-full py-4 pl-6 pr-12 text-sm text-gray-900 focus:outline-none ${
            error ? "border-red-500 focus:ring-red-500" : "border-transparent focus:ring-indigo-500"
          }`}
          placeholder="Search for a destination..."
        />
        <button
          type="submit"
          className="px-6 py-4 bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>
      </div>
      {error && <p className="mt-2 text-sm text-red-400 text-left">{error}</p>}
      {suggestions.length > 0 && (
        <ul className="absolute z-10 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto">
          {suggestions.map((item, idx) => (
            <li
              key={idx}
              onClick={() => handleSelect(item)}
              className="px-4 py-3 text-sm text-gray-700 hover:bg-indigo-50 cursor-pointer"
            >
              <div className="font-medium">{item.name}</div>
              <div className="text-xs text-gray-500">
                Hotels: {item.hotels} · Bus: {item.bus}
              </div>
            </li>
          ))}
        </ul>
      )}
    </form>
  </div>
</section>

      {/* Hotel List */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">Top Hotels</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-12">
            Explore our handpicked selection of premium hotels for your next stay.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                name: "Hotel Ocean View",
                desc: "A stunning hotel by the ocean with panoramic views.",
                price: "$250/night",
                location: "Miami, FL",
                image: "https://media-cdn.tripadvisor.com/media/photo-s/29/55/12/10/pokhara-boutique-hotel.jpg",
              },
              {
                name: "Mountain Retreat",
                desc: "A serene getaway nestled in the heart of the mountains.",
                price: "$180/night",
                location: "Aspen, CO",
                image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQskozQPbD6emQTHBe0pNdj5tF_Pd8dteWsBQ&s",
              },
              {
                name: "City Lights Hotel",
                desc: "A luxury hotel in the heart of the city with modern amenities.",
                price: "$350/night",
                location: "New York, NY",
                image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRww8AmUnjRzXgjZPabKl7hBBUn_y_nTw_GnQ&s",
              },
            ].map((hotel, index) => (
              <Link href="/user/login" key={index}>
                <div className="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                  <img src={hotel.image} alt={hotel.name} className="w-full h-56 object-cover" />
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 truncate">{hotel.name}</h3>
                    <div className="flex items-center gap-1.5 mt-2">
                      <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <p className="text-sm text-gray-600">{hotel.location}</p>
                    </div>
                    <p className="text-sm text-gray-500 line-clamp-2 mt-2">{hotel.desc}</p>
                    <div className="flex justify-between items-center mt-4">
                      <span className="text-lg font-bold text-indigo-600">{hotel.price}</span>
                      <button className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">
                        Book Now
                      </button>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Bus Routes Section */}
      <section className="py-16 sm:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">Popular Bus Routes</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-12">
            Travel comfortably with our most popular bus routes across Nepal.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "Kathmandu to Pokhara",
                desc: "A scenic ride through the Himalayan foothills.",
                price: "$15",
                time: "9:00 AM",
              },
              {
                title: "Kathmandu to Chitwan",
                desc: "Experience the natural beauty of Chitwan National Park.",
                price: "$20",
                time: "7:00 AM",
              },
              {
                title: "Kathmandu to Lumbini",
                desc: "A spiritual journey to the birthplace of Lord Buddha.",
                price: "$25",
                time: "10:00 AM",
              },
            ].map((route, index) => (
              <Link href="/user/login" key={index}>
                <div className="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 truncate">{route.title}</h3>
                    <div className="flex items-center gap-1.5 mt-2">
                      <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553-2.276A1 1 0 0021 13.618V2.382a1 1 0 00-1.553-.894L15 4m0 13V4" />
                      </svg>
                      <p className="text-sm text-gray-600">{route.desc}</p>
                    </div>
                    <div className="flex justify-between items-center mt-4">
                      <span className="text-lg font-bold text-indigo-600">{route.price}</span>
                      <div className="flex items-center gap-1.5">
                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-sm text-gray-600">{route.time}</span>
                      </div>
                    </div>
                    <button className="mt-4 w-full py-2 bg-indigo-100 text-indigo-600 text-sm font-medium rounded-lg hover:bg-indigo-200 transition-colors">
                      Book Now
                    </button>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">Why Book With EasyTrip?</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-12">
            Travel with confidence knowing you’re getting the best service and value.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                title: "Best Price Guarantee",
                desc: "We offer the lowest prices available. Found a lower price? We’ll match it.",
                icon: (
                  <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ),
              },
              {
                title: "24/7 Customer Support",
                desc: "Our team is here to help you anytime, anywhere.",
                icon: (
                  <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536-3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ),
              },
              {
                title: "Secure Payment",
                desc: "Pay safely using Khalti, eSewa, or your debit/credit card.",
                icon: (
                  <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 11c0-1.104-.896-2-2-2s-2 .896-2 2c0 .738.406 1.376 1 1.723V15a1 1 0 001 1h1a1 1 0 001-1v-2.277c.594-.347 1-.985 1-1.723zm9-3v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h14a2 2 0 012 2z" />
                  </svg>
                ),
              },
              {
                title: "Verified Reviews",
                desc: "Read honest feedback from real travelers before you book.",
                icon: (
                  <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.783-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                ),
              },
            ].map((item, index) => (
              <div key={index} className="p-6 bg-gray-50 rounded-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
                <div className="flex justify-center mb-4">{item.icon}</div>
                <h4 className="text-lg font-semibold text-gray-900">{item.title}</h4>
                <p className="text-sm text-gray-600 mt-2">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 sm:py-24 bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">What Our Travelers Say</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-12">
            Hear from our happy customers who’ve explored Nepal with us.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                quote: "EasyTrip made our honeymoon seamless. We loved the hotel and the price!",
                author: "Sita & Ram",
              },
              {
                quote: "Booking bus tickets and hotels from one site was very convenient.",
                author: "Binod Thapa",
              },
              {
                quote: "The payment options made me feel secure. Loved the experience!",
                author: "Anjali Gurung",
              },
            ].map((testimonial, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                <p className="text-gray-700 italic text-sm">"{testimonial.quote}"</p>
                <p className="mt-4 font-semibold text-gray-900">{testimonial.author}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer Section */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-semibold">EasyTrip</h3>
              <p className="text-sm text-gray-400 mt-2">
                Your trusted partner for booking hotels, buses, and trips across Nepal.
              </p>
              <div className="flex space-x-4 mt-4">
                <a href="#" className="text-gray-400 hover:text-white">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 14v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.91-1.39h-1v-3c0-.55-.45-1-1-1h-6v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.09 5.39z" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11 1C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 01-1.93.07 4.28 4.28 0 004 2.98c-1.65 1.3-3.73 2.07-5.96 2.07-.39 0-.78-.02-1.17-.06C3.92 20.26 6.36 21 8.99 21c7.93 0 12.27-6.57 12.27-12.27 0-.19 0-.37-.01-.56.84-.6 1.56-1.34 2.14-2.18l-.94.41z" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M4.98 3.5C4.24 3.5 3.5 4.24 3.5 4.98v14.04c0 .74.74 1.48 1.48 1.48h14.04c.74 0 1.48-.74 1.48-1.48V4.98c0-.74-.74-1.48-1.48-1.48H4.98zM8.64 17.25H6.5v-8.27h2.14v8.27zm-1.07-9.39c-.69 0-1.25-.56-1.25-1.25s.56-1.25 1.25-1.25 1.25.56 1.25 1.25-.56 1.25-1.25 1.25zm10.61 9.39h-2.14v-4.46c0-1.06-.02-2.43-1.48-2.43-1.48 0-1.71 1.16-1.71 2.36v4.53H10.5v-8.27h2.06v1.13h.03c.29-.55 1-1.13 2.06-1.13 2.2 0 2.61 1.45 2.61 3.34v4.93z" />
                  </svg>
                </a>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold">Explore</h3>
              <div className="mt-2 space-y-2 text-sm text-gray-400">
                <a href="#" className="block hover:text-white">About Us</a>
                <a href="#" className="block hover:text-white">Contact</a>
                <a href="#" className="block hover:text-white">Privacy Policy</a>
                <a href="#" className="block hover:text-white">Terms of Service</a>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold">Contact</h3>
              <p className="text-sm text-gray-400 mt-2">
                Email: support@easytrip.com
                <br />
                Phone: +977 123-456-7890
              </p>
            </div>
          </div>
          <div className="mt-8 text-center text-sm text-gray-400">
            © 2025 EasyTrip.com. All rights reserved.
          </div>
        </div>
      </footer>

      {/* Custom Animation Styles */}
      {/* <style jsx>{`
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
      `}</style> */}
    </div>
  );
}


//   const [query, setQuery] = useState('');
//   const [suggestions, setSuggestions] = useState([]);
//   const [error, setError] = useState('');
//   const router = useRouter();

// const destinations = [
//   { name: 'Pokhara', hotels: 5, bus: 3 },
//   { name: 'Kathmandu', hotels: 10, bus: 4 },
//   { name: 'Lumbini', hotels: 4, bus: 2 },
//   { name: 'Chitwan', hotels: 6, bus: 2 },
//   { name: 'Bhaktapur', hotels: 3, bus: 1 },
//   { name: 'Biratnagar', hotels: 7, bus: 3 },
//   { name: 'Butwal', hotels: 5, bus: 2 },
//   { name: 'Dharan', hotels: 6, bus: 3 },
//   { name: 'Nepalgunj', hotels: 4,  bus: 2 },
//   { name: 'Hetauda', hotels: 3, bus: 2 },
//   { name: 'Itahari', hotels: 4, bus: 2 },
//   { name: 'Janakpur', hotels: 5, bus: 3 },
//   { name: 'Birgunj', hotels: 6, bus: 4 },
//   { name: 'Tansen', hotels: 2, bus: 1 },
//   { name: 'Dhangadhi', hotels: 4, bus: 2 },
//   { name: 'Bharatpur', hotels: 5, bus: 2 },
//   { name: 'Gorkha', hotels: 2, bus: 1 },
//   { name: 'Damak', hotels: 3, bus: 2 },
//   { name: 'Banepa', hotels: 2, bus: 1 },
//   { name: 'Panauti', hotels: 1, bus: 1 }
// ];

//   const handleChange = (e) => {
//     const value = e.target.value;
//     setQuery(value);
//     setError('');
//     if (value.length > 0) {
//       const filtered = destinations.filter((d) =>
//         d.name.toLowerCase().includes(value.toLowerCase())
//       );
//       setSuggestions(filtered);
//     } else {
//       setSuggestions([]);
//     }
//   };

//   const handleSelect = (destination) => {
//     setQuery(destination.name);
//     setSuggestions([]);
//     setError('');
//     router.push('/user/login');
//   };

  

//     const handleSubmit = (e) => {
//     e.preventDefault();
//     const trimmedQuery = query.trim();
//     const validPattern = /^[a-zA-Z\s]+$/;

//     if (!trimmedQuery) {
//       setError('Please enter something');
//     } else if (!validPattern.test(trimmedQuery)) {
//       setError('Invalid characters entered');
//       setQuery('');
//       setSuggestions([]);
//     } else {
//       setError('');
//       router.push('/user/login');
//     }
//   };

//   return (
//     <div className="bg-white">
//       {/* Header */}
//       <header className="absolute inset-x-0 top-0 z-50">
//         <nav className="flex items-center justify-between p-6 lg:px-8" aria-label="Global">
//           <div className="flex lg:flex-1 justify-center">
//             <Link href="/" className="-m-1.5 p-1.5 text-gray-900">EasyTrip.com</Link>
//           </div>
//           <div className="hidden lg:flex lg:gap-x-12">
//             <Link href="/about" className="text-sm font-semibold text-gray-900">About Us</Link>
//             <Link href="/contact" className="text-sm font-semibold text-gray-900">Contact Us</Link>
//             <Link href="#" className="text-sm font-semibold text-gray-900">Reviews</Link>
//             <Link href="#" className="text-sm font-semibold text-gray-900">Company</Link>
//           </div>
//           {/* Login Dropdown */}
//           <div className="hidden lg:flex lg:flex-1 lg:justify-end group relative">
//             <span className="text-sm font-semibold text-gray-900 cursor-pointer">
//               Log in and Sign up <span aria-hidden="true">&rarr;</span>
//             </span>
//             <div className="absolute hidden mt-2 w-48 bg-white shadow-lg rounded-lg group-hover:block">
//               <div className="py-2">
//                 {/* <Link href="/agent/login" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Agent Login</Link> */}
//                 <Link href="/user/login" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">User Login</Link>
//                 <Link href="/busoperator/login" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Bus Operator Login</Link>
//                 <Link href="/hotelowner/login" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Hotel Owner Login</Link>
//               </div>

//               <div className="py-2">
//                 {/* <Link href="/agent/login" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Agent Login</Link> */}
//                 <Link href="/user/signup" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">User signup</Link>
//                 <Link href="/busoperator/signup" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Bus Operator signup</Link>
//                 <Link href="/hotelowner/signup" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Hotel Owner signup</Link>
//               </div>
//             </div>
            

            
//           </div>
//         </nav>
//       </header>





      

//     <section className="relative bg-gray-50 py-16 sm:py-24 lg:py-40">
//       <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
//         <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">Find Your Next Trip with EasyTrip</h2>
//         <p className="mt-4 text-lg text-gray-600">
//           Search and book your next vacation with ease. Discover the best deals, destinations, and experiences tailored just for you.
//         </p>

//         <form onSubmit={handleSubmit} className="mt-8 max-w-md mx-auto relative">
//           <div className="flex justify-center">
//             <div className="relative w-full">
//               <input
//                 type="text"
//                 value={query}
//                 onChange={handleChange}
//                 className={`block w-full py-3 pl-4 pr-12 text-sm border rounded-lg focus:outline-none ${
//                   error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-indigo-500'
//                 }`}
//                 placeholder="Enter a destination"
//               />
//               <button
//                 type="submit"
//                 className="absolute top-0 right-0 px-4 py-3 text-sm font-medium text-white bg-indigo-600 rounded-r-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
//               >
//                 Search
//               </button>
//             </div>
//           </div>
//           {error && <p className="mt-2 text-sm text-red-600 text-left">{error}</p>}

//           {suggestions.length > 0 && (
//             <ul className="absolute z-10 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto text-left">
//               {suggestions.map((item, idx) => (
//                 <li
//                   key={idx}
//                   onClick={() => handleSelect(item)}
//                   className="px-4 py-2 text-sm text-gray-700 hover:bg-indigo-100 cursor-pointer"
//                 >
//                   <div className="font-medium">{item.name}</div>
//                   <div className="text-xs text-gray-500">
//                     Hotels: {item.hotels} · Bus: {item.bus}
//                   </div>
//                 </li>
//               ))}
//             </ul>
//           )}
//         </form>
//       </div>
//     </section>

    

// {/* Hotel List */}
// <section className="bg-white py-16 sm:py-24 lg:py-32">
//   <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
//     <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">Top Hotels</h2>
//     <p className="mt-4 text-lg text-gray-600">Explore the best hotels and book your stay now!</p>

//     <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
      
//       {/* Hotel Card */}
//       {[{
//         name: "Hotel Ocean View",
//         desc: "A stunning hotel by the ocean with panoramic views.",
//         price: "$250/night",
//         location: "Miami, FL",
//         image: "https://media-cdn.tripadvisor.com/media/photo-s/29/55/12/10/pokhara-boutique-hotel.jpg"
//       }, {
//         name: "Mountain Retreat",
//         desc: "A serene getaway nestled in the heart of the mountains.",
//         price: "$180/night",
//         location: "Aspen, CO",
//         image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQskozQPbD6emQTHBe0pNdj5tF_Pd8dteWsBQ&s"
//       }, {
//         name: "City Lights Hotel",
//         desc: "A luxury hotel in the heart of the city with modern amenities.",
//         price: "$350/night",
//         location: "New York, NY",
//         image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRww8AmUnjRzXgjZPabKl7hBBUn_y_nTw_GnQ&s"
//       }].map((hotel, index) => (
//         <Link href='/user/login'  key={index} className="transform transition duration-300 hover:scale-105">
//           <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-2xl cursor-pointer">
//             <img src={hotel.image} alt={hotel.name} className="w-full h-56 object-cover" />
//             <div className="p-6">
//               <h3 className="text-lg font-semibold text-gray-900">{hotel.name}</h3>
//               <p className="text-sm text-gray-500 mt-2">{hotel.desc}</p>
//               <div className="flex justify-between items-center mt-4">
//                 <span className="text-xl font-semibold text-gray-900">{hotel.price}</span>
//                 <span className="text-sm text-gray-500">{hotel.location}</span>
//               </div>
//             </div>
//           </div>
//         </Link>
//       ))}
//     </div>
//   </div>
// </section>


// {/* Bus Routes Section */}
// <section className="bg-white py-16 sm:py-24 lg:py-32">
//   <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
//     <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">Popular Bus Routes</h2>
//     <p className="mt-4 text-lg text-gray-600">
//       Check out the most traveled bus routes and book your journey now!
//     </p>

//     <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">

//       {/* Bus Routes */}
//       {[
//         {
//           title: "Kathmandu to Pokhara",
//           desc: "A scenic ride through the Himalayan foothills.",
//           price: "$15",
//           time: "9:00 AM"
//         },
//         {
//           title: "Kathmandu to Chitwan",
//           desc: "Experience the natural beauty of Chitwan National Park.",
//           price: "$20",
//           time: "7:00 AM"
//         },
//         {
//           title: "Kathmandu to Lumbini",
//           desc: "A spiritual journey to the birthplace of Lord Buddha.",
//           price: "$25",
//           time: "10:00 AM"
//         }
//       ].map((route, index) => (
//         <Link href="/user/login" key={index}>
//           <div className="transform transition duration-300 hover:scale-105 bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-2xl cursor-pointer">
//             <div className="p-6">
//               <h3 className="text-lg font-semibold text-gray-900">{route.title}</h3>
//               <p className="text-sm text-gray-500 mt-2">{route.desc}</p>
//               <div className="flex justify-between items-center mt-4">
//                 <span className="text-xl font-semibold text-gray-900">{route.price}</span>
//                 <span className="text-sm text-gray-500">{route.time}</span>
//               </div>
//             </div>
//           </div>
//         </Link>
//       ))}
//     </div>
//   </div>
// </section>

//       {/* Trust Section */}
//       <section className="bg-gray-50 py-16 sm:py-24">
//         <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
//           <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">Why Book With EasyTrip?</h2>
//           <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 text-left">
//             <div>
//               <h4 className="text-lg font-semibold text-gray-900">Best Price Guarantee</h4>
//               <p className="text-sm text-gray-600 mt-2">We offer the lowest prices available. Found a lower price? We’ll match it.</p>
//             </div>
//             <div>
//               <h4 className="text-lg font-semibold text-gray-900">24/7 Customer Support</h4>
//               <p className="text-sm text-gray-600 mt-2">Our team is here to help you anytime, anywhere.</p>
//             </div>
//             <div>
//               <h4 className="text-lg font-semibold text-gray-900">Secure Payment</h4>
//               <p className="text-sm text-gray-600 mt-2">Pay safely using Khalti, eSewa, or your debit/credit card.</p>
//             </div>
//             <div>
//               <h4 className="text-lg font-semibold text-gray-900">Verified Reviews</h4>
//               <p className="text-sm text-gray-600 mt-2">Read honest feedback from real travelers before you book.</p>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* Testimonials Section */}
//       <section className="bg-white py-16 sm:py-24">
//         <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
//           <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">What Our Travelers Say</h2>
//           <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
//             <div className="bg-gray-50 p-6 rounded-lg shadow">
//               <p className="text-gray-700 italic">"EasyTrip made our honeymoon seamless. We loved the hotel and the price!"</p>
//               <p className="mt-4 font-semibold text-gray-900">- Sita & Ram</p>
//             </div>
//             <div className="bg-gray-50 p-6 rounded-lg shadow">
//               <p className="text-gray-700 italic">"Booking bus tickets and hotels from one site was very convenient."</p>
//               <p className="mt-4 font-semibold text-gray-900">- Binod Thapa</p>
//             </div>
//             <div className="bg-gray-50 p-6 rounded-lg shadow">
//               <p className="text-gray-700 italic">"The payment options made me feel secure. Loved the experience!"</p>
//               <p className="mt-4 font-semibold text-gray-900">- Anjali Gurung</p>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* Footer Section */}
//       <footer className="bg-gray-800 text-white py-12 mt-16">
//         <div className="max-w-7xl mx-auto px-6 lg:px-8">
//           <div className="flex justify-between items-center">
//             <div className="flex flex-col space-y-4">
//               <span className="text-lg font-semibold">EasyTrip.com</span>
//               <p className="text-sm">Your travel partner for booking the best hotels, buses, and trips.</p>
//             </div>

//             <div className="flex space-x-6">
//               <a href="#" className="text-sm hover:text-gray-400">About Us</a>
//               <a href="#" className="text-sm hover:text-gray-400">Contact</a>
//               <a href="#" className="text-sm hover:text-gray-400">Privacy Policy</a>
//               <a href="#" className="text-sm hover:text-gray-400">Terms of Service</a>
//             </div>
//           </div>
//           <div className="mt-8 text-center text-sm">
//             <p>&copy; 2025 EasyTrip.com. All rights reserved.</p>
//           </div>
//         </div>
//       </footer>
//     </div>
//   );
// }




 // <div>
    //   <h4>OUR ROUTES </h4>
    //   <br />
    //   <h5>USER ROUTES</h5>
    //   <Link href='/user/signup'>User sign up</Link><br />
    //   <Link href='/user/login'>User login up</Link><br />

    //   <br />
    //   <h5>ADMIN ROUTES</h5>x  ``
    //   <Link href='/admin/signup'>Admin sign up</Link><br />
    //   <Link href='/admin/login'>Admin login up</Link><br />

    //   <br />
    //   <h5>AGENT ROUTES</h5>
    //   <Link href='/agent/signup'>Agent sign up</Link><br />
    //   <Link href='/agent/login'>Agent login up</Link><br />

    //   <br />
    //   <h5>BUS OPERATOR ROUTES</h5>
    //   <Link href='/busoperator/signup'>busoperator sign up</Link><br />
    //   <Link href='/busoperator/login'>busoperator login up</Link><br />

    //   <br />
    //   <h5>HOTEL OWNER ROUTES</h5>
    //   <Link href='/hotelowner/signup'>hotelowner sign up</Link><br />
    //   <Link href='/hotelowner/login'>hotelowner login up</Link><br />


    {/* Hero Section with Search */}
      {/* <section className="relative bg-gray-50 py-16 sm:py-24 lg:py-40">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">Find Your Next Trip with EasyTrip</h2>
          <p className="mt-4 text-lg text-gray-600">
            Search and book your next vacation with ease. Discover the best deals, destinations, and experiences tailored just for you.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 max-w-md mx-auto relative">
            <div className="flex justify-center">
              <div className="relative w-full">
                <input
                  type="text"
                  value={query}
                  onChange={handleChange}
                  className="block w-full py-3 pl-4 pr-12 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  placeholder="Enter a destination"
                />
                <button
                  type="submit"
                  className="absolute top-0 right-0 px-4 py-3 text-sm font-medium text-white bg-indigo-600 rounded-r-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  Search
                </button>
              </div>
            </div>
            {suggestions.length > 0 && (
              <ul className="absolute z-10 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {suggestions.map((item, idx) => (
                  <li
                    key={idx}
                    onClick={() => handleSelect(item)}
                    className="px-4 py-2 text-sm text-gray-700 hover:bg-indigo-100 cursor-pointer"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            )}
          </form>
        </div>
      </section> */}
    // </div>