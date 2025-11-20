CREATE DATABASE IF NOT EXISTS final_build_a_pc;
USE final_build_a_pc;

DROP TABLE IF EXISTS cpu_motherboard_socket_map;
DROP TABLE IF EXISTS gpu_psu_wattage_map;
DROP TABLE IF EXISTS motherboard_case_formfactor_map;
DROP TABLE IF EXISTS builds;
DROP TABLE IF EXISTS ssds;
DROP TABLE IF EXISTS ram;
DROP TABLE IF EXISTS psus;
DROP TABLE IF EXISTS motherboards;
DROP TABLE IF EXISTS gpus;
DROP TABLE IF EXISTS displays;
DROP TABLE IF EXISTS cpus;
DROP TABLE IF EXISTS cases;

CREATE TABLE cases (
    id INT NOT NULL AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    size VARCHAR(20),
    price FLOAT,
    PRIMARY KEY (id),
    CONSTRAINT chk_case_price CHECK (price >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE cpus (
    id INT NOT NULL AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    socket VARCHAR(50),
    price FLOAT,
    core_count INT,
    core_clock FLOAT,
    boost_clock FLOAT,
    microarchitecture VARCHAR(100),
    tdp INT,
    graphics VARCHAR(255),
    PRIMARY KEY (id),
    CONSTRAINT chk_cpu_price CHECK (price >= 0),
    CONSTRAINT chk_cpu_tdp CHECK (tdp >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE displays (
    id INT NOT NULL AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    panel VARCHAR(50),
    resolution VARCHAR(50),
    refresh_rate INT,
    price FLOAT,
    PRIMARY KEY (id),
    CONSTRAINT chk_display_price CHECK (price >= 0),
    CONSTRAINT chk_display_refresh CHECK (refresh_rate >= 30)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE gpus (
    id INT NOT NULL AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    memory_gb INT,
    tdp_w INT,
    price FLOAT,
    PRIMARY KEY (id),
    CONSTRAINT chk_gpu_price CHECK (price >= 0),
    CONSTRAINT chk_gpu_tdp CHECK (tdp_w >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE motherboards (
    id INT NOT NULL AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    size VARCHAR(50),
    socket VARCHAR(50),
    chipset VARCHAR(100),
    ram_slots INT,
    price FLOAT,
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE psus (
    id INT NOT NULL AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    size VARCHAR(20),
    watt INT,
    price FLOAT,
    PRIMARY KEY (id),
    CONSTRAINT chk_psu_price CHECK (price >= 0),
    CONSTRAINT chk_psu_watt CHECK (watt > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE ram (
    id INT NOT NULL AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    size_gb INT,
    type VARCHAR(50),
    price FLOAT,
    PRIMARY KEY (id),
    CONSTRAINT chk_ram_price CHECK (price >= 0),
    CONSTRAINT chk_ram_size CHECK (size_gb > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE ssds (
    id INT NOT NULL AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    size_gb INT,
    bus VARCHAR(50),
    format_type VARCHAR(50),
    price FLOAT,
    PRIMARY KEY (id),
    CONSTRAINT chk_ssd_price CHECK (price >= 0),
    CONSTRAINT chk_ssd_size CHECK (size_gb > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE builds (
    build_id INT NOT NULL AUTO_INCREMENT,
    build_name VARCHAR(255) NOT NULL,
    cpu_id INT,
    gpu_id INT,
    motherboard_id INT,
    ram_id INT,
    psu_id INT,
    case_id INT,
    cpu_cooler_id INT,
    display_id INT,
    ssd_id INT,
    total_power_estimate FLOAT,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (build_id),
    KEY fk_build_case (case_id),
    KEY fk_build_cpu (cpu_id),
    KEY fk_build_display (display_id),
    KEY fk_build_gpu (gpu_id),
    KEY fk_build_motherboard (motherboard_id),
    KEY fk_build_psu (psu_id),
    KEY fk_build_ram (ram_id),
    KEY fk_build_ssd (ssd_id),
    CONSTRAINT fk_build_case FOREIGN KEY (case_id) REFERENCES cases (id) ON DELETE SET NULL,
    CONSTRAINT fk_build_cpu FOREIGN KEY (cpu_id) REFERENCES cpus (id) ON DELETE SET NULL,
    CONSTRAINT fk_build_display FOREIGN KEY (display_id) REFERENCES displays (id) ON DELETE SET NULL,
    CONSTRAINT fk_build_gpu FOREIGN KEY (gpu_id) REFERENCES gpus (id) ON DELETE SET NULL,
    CONSTRAINT fk_build_motherboard FOREIGN KEY (motherboard_id) REFERENCES motherboards (id) ON DELETE SET NULL,
    CONSTRAINT fk_build_psu FOREIGN KEY (psu_id) REFERENCES psus (id) ON DELETE SET NULL,
    CONSTRAINT fk_build_ram FOREIGN KEY (ram_id) REFERENCES ram (id) ON DELETE SET NULL,
    CONSTRAINT fk_build_ssd FOREIGN KEY (ssd_id) REFERENCES ssds (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE cpu_motherboard_socket_map (
    map_id INT NOT NULL AUTO_INCREMENT,
    cpu_id INT NOT NULL,
    motherboard_id INT NOT NULL,
    socket_type VARCHAR(50) NOT NULL,
    PRIMARY KEY (map_id),
    KEY cpu_id (cpu_id),
    KEY motherboard_id (motherboard_id),
    CONSTRAINT cpu_motherboard_socket_map_ibfk_1 FOREIGN KEY (cpu_id) REFERENCES cpus (id) ON DELETE CASCADE,
    CONSTRAINT cpu_motherboard_socket_map_ibfk_2 FOREIGN KEY (motherboard_id) REFERENCES motherboards (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE gpu_psu_wattage_map (
    map_id INT NOT NULL AUTO_INCREMENT,
    gpu_id INT NOT NULL,
    psu_id INT NOT NULL,
    required_wattage INT NOT NULL,
    PRIMARY KEY (map_id),
    KEY gpu_id (gpu_id),
    KEY psu_id (psu_id),
    CONSTRAINT gpu_psu_wattage_map_ibfk_1 FOREIGN KEY (gpu_id) REFERENCES gpus (id) ON DELETE CASCADE,
    CONSTRAINT gpu_psu_wattage_map_ibfk_2 FOREIGN KEY (psu_id) REFERENCES psus (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE motherboard_case_formfactor_map (
    map_id INT NOT NULL AUTO_INCREMENT,
    motherboard_id INT NOT NULL,
    case_id INT NOT NULL,
    form_factor VARCHAR(50) NOT NULL,
    PRIMARY KEY (map_id),
    KEY motherboard_id (motherboard_id),
    KEY case_id (case_id),
    CONSTRAINT motherboard_case_formfactor_map_ibfk_1 FOREIGN KEY (motherboard_id) REFERENCES motherboards (id) ON DELETE CASCADE,
    CONSTRAINT motherboard_case_formfactor_map_ibfk_2 FOREIGN KEY (case_id) REFERENCES cases (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;