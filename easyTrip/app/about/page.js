"use client";

export default function AboutUs() {
  return (
    <div className="bg-white">

<header className="absolute inset-x-0 top-0 z-50">
        <nav className="flex items-center justify-between p-6 lg:px-8" aria-label="Global">
          <div className="flex lg:flex-1 justify-center">
            <a href="/" className="-m-1.5 p-1.5">
              <span className="text-gray-900">EasyTrip.com</span>
            </a>
          </div>
          <div className="hidden lg:flex lg:gap-x-12">
            <a href="/about" className="text-sm font-semibold text-gray-900">About Us</a>
            <a href="/contact" className="text-sm font-semibold text-gray-900">Contact Us</a>
            <a href="#" className="text-sm font-semibold text-gray-900">Reviews</a>
            <a href="#" className="text-sm font-semibold text-gray-900">Company</a>
          </div>
          
          {/* Dropdown for login */}
          <div className="hidden lg:flex lg:flex-1 lg:justify-end group relative">
            <a href="#" className="text-sm font-semibold text-gray-900">
              Log in <span aria-hidden="true">&rarr;</span>
            </a>
            <div className="absolute hidden mt-2 w-48 bg-white shadow-lg rounded-lg group-hover:block">
              <div className="py-2">
                <a
                  href="/agent/login"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Agent Login
                </a>
                <a
                  href="/user/login"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  User Login
                </a>
                <a
                  href="/busoperator/login"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Bus Operator Login
                </a>

                <a
                  href="/hotelowner/login"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Hotel owner Login
                </a>
              </div>
            </div>
          </div>
        </nav>
      </header>


      <header className="bg-gray-50 py-16 sm:py-24 lg:py-32 text-center">
        <h1 className="text-4xl font-bold text-gray-900">Meet Our Team</h1>
        <p className="mt-4 text-lg text-gray-600">
          Passionate people behind EasyTrip.com working to make your travel smooth and easy.
        </p>
      </header>

      <section className="py-16 sm:py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">

            {/* Developer Cards */}
            {Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className="bg-white rounded-xl shadow-lg overflow-hidden">
                <img
                  src={`https://via.placeholder.com/400x250?text=Developer+${idx + 1}`}
                  alt={`Developer ${idx + 1}`}
                  className="w-full h-56 object-cover"
                />
                <div className="p-6 text-center">
                  <h3 className="text-lg font-semibold text-gray-900">Dev {idx + 1}</h3>
                  <p className="text-sm text-gray-500 mt-1">Frontend / Backend Developer</p>
                  <p className="mt-3 text-sm text-gray-600">
                    Building scalable and efficient web components for EasyTrip.
                  </p>
                </div>
              </div>
            ))}

            {/* Business Analyst Card */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <img
                src="https://via.placeholder.com/400x250?text=Business+Analyst"
                alt="Business Analyst"
                className="w-full h-56 object-cover"
              />
              <div className="p-6 text-center">
                <h3 className="text-lg font-semibold text-gray-900">Business Analyst</h3>
                <p className="text-sm text-gray-500 mt-1">BA - Strategy & UX</p>
                <p className="mt-3 text-sm text-gray-600">
                  Analyzing needs, designing user flows, and aligning business goals.
                </p>
              </div>
            </div>

            {/* Project Manager Card */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <img
                src="https://via.placeholder.com/400x250?text=Project+Manager"
                alt="Project Manager"
                className="w-full h-56 object-cover"
              />
              <div className="p-6 text-center">
                <h3 className="text-lg font-semibold text-gray-900">Project Manager</h3>
                <p className="text-sm text-gray-500 mt-1">PM - Execution & Planning</p>
                <p className="mt-3 text-sm text-gray-600">
                  Ensures the team stays on track and meets deadlines efficiently.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Footer - Same as Homepage */}
      <footer className="bg-gray-800 text-white py-12 mt-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex flex-col space-y-4">
              <span className="text-lg font-semibold">EasyTrip.com</span>
              <p className="text-sm">Your travel partner for booking the best hotels, buses, and trips.</p>
            </div>

            <div className="flex space-x-6">
              <a href="#" className="text-sm hover:text-gray-400">About Us</a>
              <a href="#" className="text-sm hover:text-gray-400">Contact</a>
              <a href="#" className="text-sm hover:text-gray-400">Privacy Policy</a>
              <a href="#" className="text-sm hover:text-gray-400">Terms of Service</a>
            </div>
          </div>
          <div className="mt-8 text-center text-sm">
            <p>&copy; 2025 EasyTrip.com. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
