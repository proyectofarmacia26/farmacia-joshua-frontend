-- Ejecuta esto en Supabase SQL Editor para actualizar la dirección
UPDATE configuracion SET valor = 'San Martín Zapotitlán, Retalhuleu' WHERE clave = 'farmacia_direccion';
UPDATE configuracion SET valor = 'Farmacia Joshua' WHERE clave = 'farmacia_nombre';
SELECT clave, valor FROM configuracion ORDER BY clave;
