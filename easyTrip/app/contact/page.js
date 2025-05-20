"use client";

export default function ContactUs() {
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


      {/* Hero Section */}
      <header className="bg-gray-50 py-16 sm:py-24 lg:py-32 text-center">
        <h1 className="text-4xl font-bold text-gray-900">Contact Us</h1>
        <p className="mt-4 text-lg text-gray-600">
          We'd love to hear from you! Reach out to us for any queries or support.
        </p>
      </header>

      {/* Contact Info Section */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 py-16 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        {/* Office Image */}
        <div>
          <img
            src="/teamA.jpg"
            alt="Office Building"
            className="rounded-xl shadow-lg w-full h-96 object-cover"
          />
        </div>

        {/* Info */}
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Our Office</h2>
          <p className="text-gray-700 mb-6">
            EasyTrip.com Headquarters <br />
            Maitighar, Kathmandu, Nepal <br />
            Near City Tower, 4th Floor
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Contact Details</h2>
          <p className="text-gray-700">
            📞 +977-9800000000 <br />
            📧 support@easytrip.com <br />
            🕒 Mon - Fri: 9:00 AM to 6:00 PM
          </p>
        </div>
      </section>

      {/* Contact Form */}
      <section className="bg-gray-50 py-16 sm:py-24">
        <div className="max-w-2xl mx-auto px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl mb-6">Send Us a Message</h2>
          <form className="space-y-6 text-left">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">Your Name</label>
              <input
                type="text"
                id="name"
                className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-3 px-4 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="John Doe"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
              <input
                type="email"
                id="email"
                className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-3 px-4 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="john@example.com"
              />
            </div>
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700">Message</label>
              <textarea
                id="message"
                rows={4}
                className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-3 px-4 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Type your message here..."
              ></textarea>
            </div>
            <div>
              <button
                type="submit"
                className="w-full bg-indigo-600 text-white font-medium py-3 px-6 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                Submit
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Footer */}
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
