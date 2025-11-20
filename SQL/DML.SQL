INSERT INTO cases (id, name, size, price) VALUES 
(1, 'Corsair 4000D Airflow Tempered Glass Midi-Tower', 'E-ATX', 123.80),
(2, 'Aerocool Skyline ARGB', 'ATX', 120.53),
(3, 'Aerocool Skyline ARGB V2 Midi-Tower - black', 'ATX', 181.24),
(4, 'Antec P5 Mini - black', 'Micro-ATX', 94.62),
(5, 'Be quiet! Pure Base 500DX - black', 'ATX', 79.39);

INSERT INTO cpus (id, name, socket, price, core_count, core_clock, boost_clock, microarchitecture, tdp, graphics) VALUES 
(2, 'AMD Ryzen 7 7800X3D', 'AM5', 340.05, 8, 4.2, 5.0, 'Zen 4', 120, 'Radeon'),
(3, 'AMD Ryzen 5 7600X', 'AM5', 170.49, 6, 4.7, 5.3, 'Zen 4', 105, 'Radeon'),
(4, 'AMD Ryzen 5 9600X', 'AM5', 204.99, 6, 3.9, 5.4, 'Zen 5', 65, 'Radeon'),
(5, 'AMD Ryzen 7 7700X', 'AM5', 242.98, 8, 4.5, 5.4, 'Zen 4', 105, 'Radeon'),
(6, 'AMD Ryzen 9 9950X3D', 'AM5', 649.99, 16, 4.3, 5.7, 'Zen 5', 170, 'Radeon');

INSERT INTO displays (id, name, panel, resolution, refresh_rate, price) VALUES 
(1, 'Acer CB242Y bir', 'IPS', '1920 x 1080', 75, 229.89),
(2, 'Acer CB242Y bir', 'IPS', '1920 x 1080', 75, 910.91),
(3, 'Acer CB242Y bmiprx', 'IPS', '1920 x 1080', 75, 528.54),
(5, 'AOC 24G2U', 'IPS', '1920 x 1080', 144, 664.27);

INSERT INTO gpus (id, name, memory_gb, tdp_w, price) VALUES 
(1, 'Sapphire Pulse Radeon RX 6600 Gaming Radeon RX 6600', 8, 132, 1424.70),
(2, 'ASRock Arc B580 Challenger OC Intel Arc B580', 12, 190, 1735.83),
(3, 'ASRock Arc B580 Steel Legend OC Intel Arc B580', 12, 190, 555.06),
(4, 'ASRock Radeon RX 9070 XT Taichi OC Radeon RX 9070', 16, 304, 1117.81),
(5, 'ASUS Dual RTX5060TI-16G GeForce RTX 5060 Ti', 16, 180, 1923.87);

INSERT INTO motherboards (id, name, size, socket, chipset, ram_slots, price) VALUES 
(1, 'MSI B550-A Pro', 'ATX', 'AM4', 'B550', 4, 299.92),
(2, 'ASRock B650 Live Mixer', 'ATX', 'AM5', 'B650', 4, 209.42),
(3, 'ASRock B650 PG Lightning', 'ATX', 'AM5', 'B650', 4, 597.33),
(4, 'ASRock B650 Pro RS', 'ATX', 'AM5', 'B650', 4, 183.39),
(5, 'ASRock B650 Steel Legend WiFi', 'ATX', 'AM5', 'B650E', 4, 99.96);

INSERT INTO psus (id, name, size, watt, price) VALUES 
(1, 'Seasonic Core GM 80 Plus Gold, semi-modular', 'ATX', 650, 349.49),
(2, 'Aerocool Project 7', 'ATX', 750, 173.96),
(3, 'Aerocool Project 7', 'ATX', 650, 141.33),
(4, 'be quiet! Dark Power Pro P11 modular', 'ATX', 750, 144.75),
(5, 'be quiet! Dark Power Pro P11 modular', 'ATX', 1200, 259.78);

INSERT INTO ssds (id, name, size_gb, bus, format_type, price) VALUES 
(1, 'Crucial P2 1000 GB', 1000, 'NVM', 'NVMProtocol', 372.73),
(2, 'ADATA XPG SX8200 Pro Series 2000 GB', 2000, 'NVM', 'NVMProtocol', 342.56),
(3, 'ADATA XPG SX8200 Pro Series 512 GB', 512, 'NVM', 'NVMProtocol', 554.62),
(4, 'ADATA XPG SX8200 Series', 960, 'NVM', 'NVMProtocol', 585.42),
(5, 'ADATA XPG SX8200 Series', 240, 'NVM', 'NVMProtocol', 103.23);

INSERT INTO ram (id, name, size_gb, type, price) VALUES 
(1, 'Corsair Vengeance 32GB', 32, 'DDR5', 120.00),
(2, 'G.Skill Trident Z5 32GB', 32, 'DDR5', 135.00),
(3, 'Kingston Fury 16GB', 16, 'DDR5', 75.00);

INSERT INTO cpu_motherboard_socket_map (map_id, cpu_id, motherboard_id, socket_type) VALUES 
(1, 2, 3, 'AM5'); 

INSERT INTO gpu_psu_wattage_map (map_id, gpu_id, psu_id, required_wattage) VALUES 
(1, 1, 1, 132),
(2, 1, 2, 132),
(3, 1, 3, 132),
(4, 2, 1, 190),
(5, 2, 2, 190);

INSERT INTO motherboard_case_formfactor_map (map_id, motherboard_id, case_id, form_factor) VALUES 
(1, 1, 1, 'ATX'),
(2, 1, 2, 'ATX'),
(3, 1, 3, 'ATX'),
(4, 2, 1, 'ATX'),
(5, 2, 2, 'ATX');

INSERT INTO builds (build_id, build_name, cpu_id, gpu_id, motherboard_id, ram_id, psu_id, case_id, display_id, ssd_id, total_power_estimate, created_at) VALUES 
(25, 'gaming rig', 2, 4, 5, 1, 2, 1, 2, 4, 524, '2025-11-04 19:45:20'),
(28, 'fefe', NULL, 4, 1, 1, 2, NULL, NULL, NULL, 524, '2025-11-05 20:48:55'),
(29, 'fefe', NULL, 4, 5, 1, 2, NULL, NULL, NULL, 400, '2025-11-05 20:52:08'),
(30, 'fr', 4, NULL, 2, 3, NULL, NULL, NULL, NULL, 165, '2025-11-05 21:07:04'),
(31, 'Build Test', 6, 5, 5, 2, 5, 1, 1, 3, 295, '2025-11-06 08:08:01');

UPDATE builds
SET build_name = 'Updated Gaming Rig',
    cpu_id = 5,
    ram_id = 2,
    total_power_estimate = 600
WHERE build_id = 25;

UPDATE cpus 
SET price = 320.00 
WHERE id = 2;

UPDATE cases 
SET name = 'Corsair 4000D Airflow (Black Edition)' 
WHERE id = 1;

UPDATE gpus 
SET price = 1350.00 
WHERE id = 1;

DELETE FROM builds 
WHERE build_id = 30;

DELETE FROM builds 
WHERE cpu_id IS NULL AND gpu_id IS NULL;