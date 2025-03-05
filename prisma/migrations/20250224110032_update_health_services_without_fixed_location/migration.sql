UPDATE "HealthService"
SET "hasFixedLocation" = FALSE 
WHERE "name" IN ('Ambulance Emergency Care', 'Ambulance Patient Transport', 'Home based care');
