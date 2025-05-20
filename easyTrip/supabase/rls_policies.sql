-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE hotels ENABLE ROW LEVEL SECURITY;
ALTER TABLE bus_operators ENABLE ROW LEVEL SECURITY;
ALTER TABLE bus_routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE hotel_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE bus_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view their own data"
ON users FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can update their own data"
ON users FOR UPDATE
USING (auth.uid() = id);

-- Hotels policies
CREATE POLICY "Anyone can view hotels"
ON hotels FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Hotel owners can manage their hotels"
ON hotels FOR ALL
TO authenticated
USING (owner_id = auth.uid());

-- Bus Operators policies
CREATE POLICY "Anyone can view bus operators"
ON bus_operators FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Bus operators can manage their own data"
ON bus_operators FOR ALL
TO authenticated
USING (operator_id = auth.uid());

-- Bus Routes policies
CREATE POLICY "Anyone can view bus routes"
ON bus_routes FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Bus operators can manage their routes"
ON bus_routes FOR ALL
TO authenticated
USING (EXISTS (
    SELECT 1 FROM bus_operators
    WHERE bus_operators.id = bus_routes.operator_id
    AND bus_operators.operator_id = auth.uid()
));

-- Hotel Bookings policies
CREATE POLICY "Users can view their own bookings"
ON hotel_bookings FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can create their own bookings"
ON hotel_bookings FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Hotel owners can view bookings for their hotels"
ON hotel_bookings FOR SELECT
TO authenticated
USING (EXISTS (
    SELECT 1 FROM hotels
    WHERE hotels.id = hotel_bookings.hotel_id
    AND hotels.owner_id = auth.uid()
));

-- Bus Bookings policies
CREATE POLICY "Users can view their own bus bookings"
ON bus_bookings FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can create their own bus bookings"
ON bus_bookings FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Bus operators can view bookings for their routes"
ON bus_bookings FOR SELECT
TO authenticated
USING (EXISTS (
    SELECT 1 FROM bus_routes
    JOIN bus_operators ON bus_operators.id = bus_routes.operator_id
    WHERE bus_routes.id = bus_bookings.route_id
    AND bus_operators.operator_id = auth.uid()
));

-- Reviews policies
CREATE POLICY "Anyone can view reviews"
ON reviews FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can create their own reviews"
ON reviews FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own reviews"
ON reviews FOR UPDATE
TO authenticated
USING (user_id = auth.uid()); 