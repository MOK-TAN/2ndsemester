-- Drop existing foreign keys
ALTER TABLE hotels DROP CONSTRAINT IF EXISTS hotels_owner_id_fkey;
ALTER TABLE bus_operators DROP CONSTRAINT IF EXISTS bus_operators_operator_id_fkey;
ALTER TABLE bus_routes DROP CONSTRAINT IF EXISTS bus_routes_operator_id_fkey;
ALTER TABLE hotel_bookings DROP CONSTRAINT IF EXISTS hotel_bookings_user_id_fkey;
ALTER TABLE hotel_bookings DROP CONSTRAINT IF EXISTS hotel_bookings_hotel_id_fkey;
ALTER TABLE bus_bookings DROP CONSTRAINT IF EXISTS bus_bookings_user_id_fkey;
ALTER TABLE bus_bookings DROP CONSTRAINT IF EXISTS bus_bookings_route_id_fkey;
ALTER TABLE reviews DROP CONSTRAINT IF EXISTS reviews_user_id_fkey;
ALTER TABLE reviews DROP CONSTRAINT IF EXISTS reviews_hotel_id_fkey;
ALTER TABLE reviews DROP CONSTRAINT IF EXISTS reviews_bus_route_id_fkey;

-- Add improved foreign key constraints
-- Hotels
ALTER TABLE hotels
ADD CONSTRAINT hotels_owner_id_fkey
FOREIGN KEY (owner_id)
REFERENCES users(id)
ON DELETE RESTRICT;

-- Bus Operators
ALTER TABLE bus_operators
ADD CONSTRAINT bus_operators_operator_id_fkey
FOREIGN KEY (operator_id)
REFERENCES users(id)
ON DELETE RESTRICT;

-- Bus Routes
ALTER TABLE bus_routes
ADD CONSTRAINT bus_routes_operator_id_fkey
FOREIGN KEY (operator_id)
REFERENCES bus_operators(id)
ON DELETE CASCADE;

-- Hotel Bookings
ALTER TABLE hotel_bookings
ADD CONSTRAINT hotel_bookings_user_id_fkey
FOREIGN KEY (user_id)
REFERENCES users(id)
ON DELETE RESTRICT;

ALTER TABLE hotel_bookings
ADD CONSTRAINT hotel_bookings_hotel_id_fkey
FOREIGN KEY (hotel_id)
REFERENCES hotels(id)
ON DELETE RESTRICT;

-- Bus Bookings
ALTER TABLE bus_bookings
ADD CONSTRAINT bus_bookings_user_id_fkey
FOREIGN KEY (user_id)
REFERENCES users(id)
ON DELETE RESTRICT;

ALTER TABLE bus_bookings
ADD CONSTRAINT bus_bookings_route_id_fkey
FOREIGN KEY (route_id)
REFERENCES bus_routes(id)
ON DELETE RESTRICT;

-- Reviews
ALTER TABLE reviews
ADD CONSTRAINT reviews_user_id_fkey
FOREIGN KEY (user_id)
REFERENCES users(id)
ON DELETE RESTRICT;

ALTER TABLE reviews
ADD CONSTRAINT reviews_hotel_id_fkey
FOREIGN KEY (hotel_id)
REFERENCES hotels(id)
ON DELETE CASCADE;

ALTER TABLE reviews
ADD CONSTRAINT reviews_bus_route_id_fkey
FOREIGN KEY (bus_route_id)
REFERENCES bus_routes(id)
ON DELETE CASCADE;

-- Add additional constraints for data integrity
-- Ensure check_out_date is after check_in_date
ALTER TABLE hotel_bookings
ADD CONSTRAINT check_dates_valid
CHECK (check_out_date > check_in_date);

-- Ensure booking_date is not in the past
ALTER TABLE bus_bookings
ADD CONSTRAINT check_booking_date_valid
CHECK (booking_date >= CURRENT_DATE);

-- Ensure seats_available is not negative
ALTER TABLE bus_routes
ADD CONSTRAINT check_seats_available_valid
CHECK (seats_available >= 0);

-- Ensure total_seats is positive
ALTER TABLE bus_routes
ADD CONSTRAINT check_total_seats_valid
CHECK (total_seats > 0);

-- Ensure seats_available is not greater than total_seats
ALTER TABLE bus_routes
ADD CONSTRAINT check_seats_available_not_greater_than_total
CHECK (seats_available <= total_seats);

-- Ensure price_per_night is positive
ALTER TABLE hotels
ADD CONSTRAINT check_price_per_night_valid
CHECK (price_per_night > 0);

-- Ensure bus route price is positive
ALTER TABLE bus_routes
ADD CONSTRAINT check_bus_route_price_valid
CHECK (price > 0); 