CREATE DATABASE IF NOT EXISTS final_build_a_pc;
USE final_build_a_pc;

DROP TABLE IF EXISTS cases;
CREATE TABLE cases (
    id INT NOT NULL AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    size VARCHAR(20),
    price FLOAT,
    PRIMARY KEY (id),
    CONSTRAINT chk_case_price CHECK (price >= 0)
) ENGINE=InnoDB AUTO_INCREMENT=7141 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS cpus;
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
) ENGINE=InnoDB AUTO_INCREMENT=2832 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS displays;
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
) ENGINE=InnoDB AUTO_INCREMENT=29065 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS gpus;
CREATE TABLE gpus (
    id INT NOT NULL AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    memory_gb INT,
    tdp_w INT,
    price FLOAT,
    PRIMARY KEY (id),
    CONSTRAINT chk_gpu_price CHECK (price >= 0),
    CONSTRAINT chk_gpu_tdp CHECK (tdp_w >= 0)
) ENGINE=InnoDB AUTO_INCREMENT=7973 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS motherboards;
CREATE TABLE motherboards (
    id INT NOT NULL AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    size VARCHAR(50),
    socket VARCHAR(50),
    chipset VARCHAR(100),
    ram_slots INT,
    price FLOAT,
    PRIMARY KEY (id)
) ENGINE=InnoDB AUTO_INCREMENT=8521 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS psus;
CREATE TABLE psus (
    id INT NOT NULL AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    size VARCHAR(20),
    watt INT,
    price FLOAT,
    PRIMARY KEY (id),
    CONSTRAINT chk_psu_price CHECK (price >= 0),
    CONSTRAINT chk_psu_watt CHECK (watt > 0)
) ENGINE=InnoDB AUTO_INCREMENT=4969 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS ram;
CREATE TABLE ram (
    id INT NOT NULL AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    size_gb INT,
    type VARCHAR(50),
    price FLOAT,
    PRIMARY KEY (id),
    CONSTRAINT chk_ram_price CHECK (price >= 0),
    CONSTRAINT chk_ram_size CHECK (size_gb > 0)
) ENGINE=InnoDB AUTO_INCREMENT=14189 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS ssds;
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
) ENGINE=InnoDB AUTO_INCREMENT=7825 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS builds;
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
) ENGINE=InnoDB AUTO_INCREMENT=45 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS cpu_motherboard_socket_map;
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
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS gpu_psu_wattage_map;
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
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS motherboard_case_formfactor_map;
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
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DELIMITER $$

-- Calculates estimated power consumption when a new build is inserted.
CREATE TRIGGER trg_before_insert_power
BEFORE INSERT ON builds
FOR EACH ROW
BEGIN
    DECLARE cpu_tdp INT DEFAULT 0;
    DECLARE gpu_tdp INT DEFAULT 0;
    
    IF NEW.cpu_id IS NOT NULL THEN
        SELECT COALESCE(tdp, 0) INTO cpu_tdp FROM cpus WHERE id = NEW.cpu_id;
    END IF;
    
    IF NEW.gpu_id IS NOT NULL THEN
        SELECT COALESCE(tdp_w, 0) INTO gpu_tdp FROM gpus WHERE id = NEW.gpu_id;
    END IF;
    
    SET NEW.total_power_estimate = cpu_tdp + gpu_tdp + 100;
END$$

-- Ensures GPU and PSU are compatible before inserting a new build.
CREATE TRIGGER trg_validate_build_compatibility
BEFORE INSERT ON builds
FOR EACH ROW
BEGIN
    DECLARE gpu_psu_result VARCHAR(255);

    IF NEW.gpu_id IS NOT NULL AND NEW.psu_id IS NOT NULL THEN
        SET gpu_psu_result = check_compatibility_fnn('gpu', NEW.gpu_id, 'psu', NEW.psu_id);
        IF gpu_psu_result NOT LIKE 'Compatible%' THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'PSU wattage is insufficient for selected GPU';
        END IF;
    END IF;
END$$

-- Prevents inserting a build if the chosen PSU is insufficient for the total power load.
CREATE TRIGGER check_psu_sufficient_before_insert
BEFORE INSERT ON builds
FOR EACH ROW
BEGIN
    DECLARE psu_wattage INT DEFAULT 0;
    DECLARE estimated_power INT DEFAULT 0;

    IF NEW.cpu_id IS NOT NULL THEN
        SELECT COALESCE(tdp, 0) INTO @cpu_tdp FROM cpus WHERE id = NEW.cpu_id;
        SET estimated_power = estimated_power + @cpu_tdp;
    END IF;

    IF NEW.gpu_id IS NOT NULL THEN
        SELECT COALESCE(tdp_w, 0) INTO @gpu_tdp FROM gpus WHERE id = NEW.gpu_id;
        SET estimated_power = estimated_power + @gpu_tdp;
    END IF;

    SET estimated_power = estimated_power + 100;

    IF NEW.psu_id IS NOT NULL THEN
        SELECT COALESCE(watt, 0) INTO psu_wattage FROM psus WHERE id = NEW.psu_id;
        IF psu_wattage < estimated_power THEN
            SIGNAL SQLSTATE '45000' 
            SET MESSAGE_TEXT = 'PSU wattage is insufficient for the estimated power consumption of this build';
        END IF;
    END IF;
END$$

-- Prevents updating a build if the new component config exceeds PSU capacity.
CREATE TRIGGER check_psu_sufficient_before_update
BEFORE UPDATE ON builds
FOR EACH ROW
BEGIN
    DECLARE psu_wattage INT DEFAULT 0;
    DECLARE estimated_power INT DEFAULT 0;

    IF NEW.cpu_id IS NOT NULL THEN
        SELECT COALESCE(tdp, 0) INTO @cpu_tdp FROM cpus WHERE id = NEW.cpu_id;
        SET estimated_power = estimated_power + @cpu_tdp;
    END IF;

    IF NEW.gpu_id IS NOT NULL THEN
        SELECT COALESCE(tdp_w, 0) INTO @gpu_tdp FROM gpus WHERE id = NEW.gpu_id;
        SET estimated_power = estimated_power + @gpu_tdp;
    END IF;

    SET estimated_power = estimated_power + 100;

    IF NEW.psu_id IS NOT NULL THEN
        SELECT COALESCE(watt, 0) INTO psu_wattage FROM psus WHERE id = NEW.psu_id;
        IF psu_wattage < estimated_power THEN
            SIGNAL SQLSTATE '45000' 
            SET MESSAGE_TEXT = 'PSU wattage is insufficient for the estimated power consumption of this build';
        END IF;
    END IF;
END$$

DELIMITER ;

DELIMITER $$

-- Checks compatibility between two components (CPU/Mobo, GPU/PSU, Mobo/Case).
CREATE FUNCTION `check_compatibility_fnn`(
    p_comp1_name VARCHAR(50),
    p_comp1_id INT,
    p_comp2_name VARCHAR(50),
    p_comp2_id INT
) RETURNS varchar(255) CHARSET utf8mb4
    READS SQL DATA
    DETERMINISTIC
BEGIN
    DECLARE v_cpu_socket VARCHAR(50);
    DECLARE v_mb_socket VARCHAR(50);
    DECLARE v_gpu_tdp INT;
    DECLARE v_psu_watt INT;
    DECLARE v_mb_size VARCHAR(50);
    DECLARE v_case_size VARCHAR(50);
    DECLARE v_cpu_id INT;
    DECLARE v_mb_id INT;
    DECLARE v_gpu_id INT;
    DECLARE v_psu_id INT;
    DECLARE v_case_id INT;
    DECLARE v_col_exists INT DEFAULT 0;
    SET @db = DATABASE();

    IF (p_comp1_name = 'cpu' AND p_comp2_name = 'motherboard') OR (p_comp1_name = 'motherboard' AND p_comp2_name = 'cpu') THEN
        SET v_cpu_id = IF(p_comp1_name = 'cpu', p_comp1_id, p_comp2_id);
        SET v_mb_id = IF(p_comp1_name = 'motherboard', p_comp1_id, p_comp2_id);
        
        SELECT COUNT(*) INTO v_col_exists FROM information_schema.columns WHERE table_schema = @db AND table_name = 'cpus' AND column_name = 'socket';
        IF v_col_exists = 0 THEN RETURN 'Check Not Performed (Missing cpus.socket)'; END IF;
        
        SELECT COUNT(*) INTO v_col_exists FROM information_schema.columns WHERE table_schema = @db AND table_name = 'motherboards' AND column_name = 'socket';
        IF v_col_exists = 0 THEN RETURN 'Check Not Performed (Missing motherboards.socket)'; END IF;
        
        SELECT socket INTO v_cpu_socket FROM cpus WHERE id = v_cpu_id;
        SELECT socket INTO v_mb_socket FROM motherboards WHERE id = v_mb_id;

        IF v_cpu_socket IS NULL THEN RETURN 'Incompatible: CPU socket data is missing.'; END IF;
        IF v_mb_socket IS NULL THEN RETURN 'Incompatible: Motherboard socket data is missing.'; END IF;

        IF v_cpu_socket != v_mb_socket THEN
            RETURN CONCAT('Incompatible: CPU socket is ', v_cpu_socket, ', but Motherboard socket is ', v_mb_socket);
        END IF;
        
        RETURN 'Compatible';
    END IF;

    IF (p_comp1_name = 'gpu' AND p_comp2_name = 'psu') OR (p_comp1_name = 'psu' AND p_comp2_name = 'gpu') THEN
        SET v_gpu_id = IF(p_comp1_name = 'gpu', p_comp1_id, p_comp2_id);
        SET v_psu_id = IF(p_comp1_name = 'psu', p_comp1_id, p_comp2_id);

        SELECT COUNT(*) INTO v_col_exists FROM information_schema.columns WHERE table_schema = @db AND table_name = 'gpus' AND column_name = 'tdp_w';
        IF v_col_exists = 0 THEN RETURN 'Check Not Performed (Missing gpus.tdp_w)'; END IF;
        
        SELECT COUNT(*) INTO v_col_exists FROM information_schema.columns WHERE table_schema = @db AND table_name = 'psus' AND column_name = 'watt';
        IF v_col_exists = 0 THEN RETURN 'Check Not Performed (Missing psus.watt)'; END IF;
        
        SELECT tdp_w INTO v_gpu_tdp FROM gpus WHERE id = v_gpu_id;
        SELECT watt INTO v_psu_watt FROM psus WHERE id = v_psu_id;

        IF v_gpu_tdp IS NULL THEN RETURN 'Incompatible: GPU TDP data is missing.'; END IF;
        IF v_psu_watt IS NULL THEN RETURN 'Incompatible: PSU wattage data is missing.'; END IF;

        IF v_psu_watt < v_gpu_tdp THEN
            RETURN CONCAT('Incompatible: GPU needs ', v_gpu_tdp, 'W, but PSU only provides ', v_psu_watt, 'W');
        END IF;
        
        RETURN 'Compatible';
    END IF;

    IF (p_comp1_name = 'motherboard' AND p_comp2_name = 'case') OR (p_comp1_name = 'case' AND p_comp2_name = 'motherboard') THEN
        SET v_mb_id = IF(p_comp1_name = 'motherboard', p_comp1_id, p_comp2_id);
        SET v_case_id = IF(p_comp1_name = 'case', p_comp1_id, p_comp2_id);

        SELECT COUNT(*) INTO v_col_exists FROM information_schema.columns WHERE table_schema = @db AND table_name = 'motherboards' AND column_name = 'size';
        IF v_col_exists = 0 THEN RETURN 'Check Not Performed (Missing motherboards.size)'; END IF;
        
        SELECT COUNT(*) INTO v_col_exists FROM information_schema.columns WHERE table_schema = @db AND table_name = 'cases' AND column_name = 'size';
        IF v_col_exists = 0 THEN RETURN 'Check Not Performed (Missing cases.size)'; END IF;
        
        SELECT UPPER(TRIM(size)) INTO v_mb_size FROM motherboards WHERE id = v_mb_id;
        SELECT UPPER(TRIM(size)) INTO v_case_size FROM cases WHERE id = v_case_id;

        IF v_mb_size IS NULL THEN RETURN 'Incompatible: Motherboard size data is missing.'; END IF;
        IF v_case_size IS NULL THEN RETURN 'Incompatible: Case size data is missing.'; END IF;
        
        IF v_case_size = 'E-ATX' THEN
            IF v_mb_size NOT IN ('E-ATX', 'ATX', 'MICRO-ATX', 'MICRO ATX', 'MATX', 'MINI-ITX', 'MINI ITX', 'ITX') THEN
                RETURN CONCAT('Incompatible: Case is E-ATX but motherboard size ', v_mb_size, ' is not supported');
            END IF;
        ELSEIF v_case_size = 'ATX' THEN
            IF v_mb_size NOT IN ('ATX', 'MICRO-ATX', 'MICRO ATX', 'MATX', 'MINI-ITX', 'MINI ITX', 'ITX') THEN
                RETURN CONCAT('Incompatible: Case is ATX but cannot fit ', v_mb_size, ' motherboard');
            END IF;
        ELSEIF v_case_size IN ('MICRO-ATX', 'MICRO ATX', 'MATX') THEN
            IF v_mb_size NOT IN ('MICRO-ATX', 'MICRO ATX', 'MATX', 'MINI-ITX', 'MINI ITX', 'ITX') THEN
                RETURN CONCAT('Incompatible: Case is Micro-ATX but cannot fit ', v_mb_size, ' motherboard');
            END IF;
        ELSEIF v_case_size IN ('MINI-ITX', 'MINI ITX', 'ITX') THEN
            IF v_mb_size NOT IN ('MINI-ITX', 'MINI ITX', 'ITX') THEN
                RETURN CONCAT('Incompatible: Case is Mini-ITX but cannot fit ', v_mb_size, ' motherboard');
            END IF;
        ELSE
            IF v_mb_size != v_case_size THEN
                RETURN CONCAT('Incompatible: Motherboard is ', v_mb_size, ', but Case is ', v_case_size);
            END IF;
        END IF;
        
        RETURN 'Compatible';
    END IF;

    RETURN 'Compatible (No specific check for this combination)';
END$$

-- Placeholder function to check power compatibility between GPU and PSU.
CREATE FUNCTION `check_power_compatibility`(gpu_id INT, psu_id INT) RETURNS varchar(255) CHARSET utf8mb4
    DETERMINISTIC
BEGIN
  RETURN 'Compatible';
END$$

-- Utility function to check if a specific column exists in a given table.
CREATE FUNCTION `COLUMN_EXISTS`(
    db_name VARCHAR(64), 
    tbl_name VARCHAR(64), 
    col_name VARCHAR(64)
) RETURNS tinyint(1)
    READS SQL DATA
BEGIN
    RETURN (
        SELECT COUNT(*) 
        FROM information_schema.columns
        WHERE table_schema = db_name
        AND table_name = tbl_name
        AND column_name = col_name
    ) > 0;
END$$

-- Allows admins to update a specific column value dynamically using prepared statements.
CREATE PROCEDURE `admin_update_attribute`(
    IN p_table VARCHAR(50),
    IN p_column VARCHAR(50),
    IN p_value VARCHAR(255),
    IN p_id INT
)
BEGIN
    SET @sql = CONCAT('UPDATE ', p_table, ' SET ', p_column, ' = ? WHERE id = ?');
    PREPARE stmt FROM @sql;
    SET @p_value = p_value;
    SET @p_id = p_id;
    EXECUTE stmt USING @p_value, @p_id;
    DEALLOCATE PREPARE stmt;
    SELECT CONCAT('Updated ', p_table, ' id ', p_id, ' set ', p_column, ' = ', p_value) AS message;
END$$

-- Retrieves component details for a list of IDs within a specific category.
CREATE PROCEDURE `compare_parts_by_id`(
    IN category VARCHAR(50),
    IN id_list TEXT
)
BEGIN
    DECLARE query_text TEXT;
    CASE category
        WHEN 'cpus' THEN
            SET @query_text = CONCAT('SELECT id, name, core_count, core_clock, boost_clock, tdp, price FROM cpus WHERE id IN (', id_list, ');');
        WHEN 'gpus' THEN
            SET @query_text = CONCAT('SELECT id, name, memory_gb, tdp_w, price FROM gpus WHERE id IN (', id_list, ');');
        WHEN 'ram' THEN
            SET @query_text = CONCAT('SELECT id, name, size_gb, type, price FROM ram WHERE id IN (', id_list, ');');
        WHEN 'motherboards' THEN
            SET @query_text = CONCAT('SELECT id, name, size, socket, chipset, ram_slots, price FROM motherboards WHERE id IN (', id_list, ');');
        ELSE
            SET @query_text = 'SELECT "Invalid category – use cpus, gpus, ram, or motherboards" AS message;';
    END CASE;
    PREPARE stmt FROM @query_text;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
END$$

-- Creates a new user with limited permissions (SELECT globally, full access on builds).
CREATE PROCEDURE `create_normal_user`(
    IN new_username VARCHAR(100), 
    IN new_pwd VARCHAR(100)
)
BEGIN
    DECLARE quoted_user VARCHAR(250);
    DECLARE quoted_pass VARCHAR(250);
    
    SET quoted_user = QUOTE(new_username);
    SET quoted_pass = QUOTE(new_pwd);

    SET @sql = '';

    SET @sql = CONCAT('CREATE USER ', quoted_user, '@''localhost'' IDENTIFIED BY ', quoted_pass, ';');
    PREPARE stmt FROM @sql;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
    
    SET @sql = CONCAT('GRANT USAGE ON *.* TO ', quoted_user, '@''localhost'';');
    PREPARE stmt FROM @sql;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;

    SET @sql = CONCAT('GRANT SELECT ON `final_build_a_pc`.* TO ', quoted_user, '@''localhost'';');
    PREPARE stmt FROM @sql;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;

    SET @sql = CONCAT('GRANT INSERT, UPDATE, DELETE ON `final_build_a_pc`.`builds` TO ', quoted_user, '@''localhost'';');
    PREPARE stmt FROM @sql;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
END$$


CREATE USER 'admin'@'localhost' IDENTIFIED BY 'admin1234';

GRANT ALL PRIVILEGES ON `final_build_a_pc`.* TO 'admin'@'localhost' WITH GRANT OPTION;

-- Deletes a specific build by ID if it exists in the database.
CREATE PROCEDURE `delete_build`(IN buildId INT)
BEGIN
    IF EXISTS (SELECT 1 FROM builds WHERE build_id = buildId) THEN
        DELETE FROM builds WHERE build_id = buildId;
        SELECT CONCAT('Build ', buildId, ' deleted successfully.') AS message;
    ELSE
        SELECT 'Build ID not found.' AS error_message;
    END IF;
END$$

-- Updates the total estimated power for a build based on its CPU and GPU TDP.
CREATE PROCEDURE `estimate_power`(IN p_build_id INT)
BEGIN
    DECLARE cpu_power INT DEFAULT 0;
    DECLARE gpu_power INT DEFAULT 0;
    DECLARE total_power FLOAT DEFAULT 0;
    DECLARE v_cpu_id INT;
    DECLARE v_gpu_id INT;
    
    SELECT cpu_id, gpu_id INTO v_cpu_id, v_gpu_id
    FROM builds WHERE build_id = p_build_id;
    
    IF v_cpu_id IS NOT NULL THEN
        SELECT COALESCE(tdp, 0) INTO cpu_power FROM cpus WHERE id = v_cpu_id;
    END IF;
    
    IF v_gpu_id IS NOT NULL THEN
        SELECT COALESCE(tdp_w, 0) INTO gpu_power FROM gpus WHERE id = v_gpu_id;
    END IF;
    
    SET total_power = cpu_power + gpu_power + 100;
    
    UPDATE builds SET total_power_estimate = total_power WHERE build_id = p_build_id;
END$$

-- Searches all component tables for items matching the search term.
CREATE PROCEDURE `find_component_by_name`(IN search_term VARCHAR(255))
BEGIN
    SET @search_pattern = CONCAT('%', REPLACE(TRIM(search_term), ' ', '%'), '%');
    
    SELECT 'cpus' AS component_type, id, name FROM cpus WHERE name LIKE @search_pattern
    UNION
    SELECT 'gpus', id, name FROM gpus WHERE name LIKE @search_pattern
    UNION
    SELECT 'motherboards', id, name FROM motherboards WHERE name LIKE @search_pattern
    UNION
    SELECT 'psus', id, name FROM psus WHERE name LIKE @search_pattern
    UNION
    SELECT 'ram', id, name FROM ram WHERE name LIKE @search_pattern
    UNION
    SELECT 'cases', id, name FROM cases WHERE name LIKE @search_pattern
    UNION
    SELECT 'ssds', id, name FROM ssds WHERE name LIKE @search_pattern
    UNION
    SELECT 'displays', id, name FROM displays WHERE name LIKE @search_pattern
    LIMIT 10;
END$$

-- Fetches all details for builds by joining with component tables.
CREATE PROCEDURE `get_build_details`()
BEGIN
    SELECT 
        b.build_id, 
        b.build_name, 
        c.name AS cpu, 
        g.name AS gpu,
        m.name AS motherboard,
        r.name AS ram,
        p.name AS psu,
        cs.name AS case_name
    FROM builds b
    LEFT JOIN cpus c ON b.cpu_id = c.id
    LEFT JOIN gpus g ON b.gpu_id = g.id
    LEFT JOIN motherboards m ON b.motherboard_id = m.id
    LEFT JOIN ram r ON b.ram_id = r.id
    LEFT JOIN psus p ON b.psu_id = p.id
    LEFT JOIN cases cs ON b.case_id = cs.id;
END$$

DELIMITER $$

-- Demonstrates various join types (INNER, LEFT, RIGHT, UNION) for fetching build data.
CREATE PROCEDURE get_builds_with_all_joins()
BEGIN
    SELECT 
        b.build_id, b.build_name, c.name AS cpu_name
    FROM builds b
    INNER JOIN cpus c ON b.cpu_id = c.id;

    SELECT 
        b.build_id, b.build_name, c.name AS cpu_name
    FROM builds b
    LEFT JOIN cpus c ON b.cpu_id = c.id;

    SELECT 
        b.build_id, b.build_name, c.name AS cpu_name
    FROM builds b
    RIGHT JOIN cpus c ON b.cpu_id = c.id;

    SELECT 
        b.build_id, b.build_name, c.name AS cpu_name
    FROM builds b
    LEFT JOIN cpus c ON b.cpu_id = c.id
    UNION
    SELECT 
        b.build_id, b.build_name, c.name AS cpu_name
    FROM builds b
    RIGHT JOIN cpus c ON b.cpu_id = c.id;
END$$

DELIMITER ;

-- Retrieves build component names via subqueries and calculates the total price sum.
CREATE PROCEDURE `get_build_summary`(IN input_build_id INT)
BEGIN
    SELECT 
        b.build_id,
        b.build_name,
        (SELECT name FROM cpus WHERE id = b.cpu_id) AS cpu_name,
        (SELECT name FROM motherboards WHERE id = b.motherboard_id) AS motherboard_name,
        (SELECT name FROM gpus WHERE id = b.gpu_id) AS gpu_name,
        (SELECT name FROM ram WHERE id = b.ram_id) AS ram_name,
        (SELECT name FROM psus WHERE id = b.psu_id) AS psu_name,
        (SELECT name FROM cases WHERE id = b.case_id) AS case_name,
        (SELECT name FROM ssds WHERE id = b.ssd_id) AS ssd_name,
        (SELECT name FROM displays WHERE id = b.display_id) AS display_name,
        (SELECT SUM(COALESCE(price,0)) 
         FROM (
            SELECT price FROM cpus WHERE id = b.cpu_id
            UNION ALL SELECT price FROM motherboards WHERE id = b.motherboard_id
            UNION ALL SELECT price FROM gpus WHERE id = b.gpu_id
            UNION ALL SELECT price FROM ram WHERE id = b.ram_id
            UNION ALL SELECT price FROM psus WHERE id = b.psu_id
            UNION ALL SELECT price FROM cases WHERE id = b.case_id
            UNION ALL SELECT price FROM ssds WHERE id = b.ssd_id
            UNION ALL SELECT price FROM displays WHERE id = b.display_id
         ) AS total_parts
        ) AS total_price
    FROM builds b
    WHERE b.build_id = input_build_id;
END$$

-- Dynamically finds parts compatible with the currently selected components.
CREATE PROCEDURE `get_compatible_parts`(
    IN p_target_table VARCHAR(64),
    IN p_cpu_id INT,
    IN p_motherboard_id INT,
    IN p_ram_id INT,
    IN p_gpu_id INT,
    IN p_case_id INT,
    IN p_psu_id INT
)
BEGIN
    DECLARE v_cpu_socket VARCHAR(50);
    DECLARE v_mb_socket VARCHAR(50);
    DECLARE v_mb_size VARCHAR(20);
    DECLARE v_case_size VARCHAR(20);
    DECLARE v_gpu_tdp INT DEFAULT 0;
    DECLARE v_total_tdp INT DEFAULT 0;

    IF p_target_table = 'cpus' THEN
        IF p_motherboard_id IS NOT NULL THEN
            SELECT socket INTO v_mb_socket FROM motherboards WHERE id = p_motherboard_id;
            SET @sql = CONCAT('SELECT * FROM cpus WHERE socket = ''', v_mb_socket, '''');
        ELSE
            SET @sql = 'SELECT * FROM cpus';
        END IF;
    END IF;

    IF p_target_table = 'motherboards' THEN
        SET @sql = 'SELECT * FROM motherboards WHERE 1=1';
        IF p_cpu_id IS NOT NULL THEN
            SELECT socket INTO v_cpu_socket FROM cpus WHERE id = p_cpu_id;
            SET @sql = CONCAT(@sql, ' AND socket = ''', v_cpu_socket, '''');
        END IF;
        IF p_case_id IS NOT NULL THEN
            SELECT size INTO v_case_size FROM cases WHERE id = p_case_id;
            IF v_case_size = 'E-ATX' THEN
                SET @sql = CONCAT(@sql, " AND size IN ('E-ATX','ATX','Micro-ATX','Mini-ITX')");
            ELSEIF v_case_size = 'ATX' THEN
                SET @sql = CONCAT(@sql, " AND size IN ('ATX','Micro-ATX','Mini-ITX')");
            ELSEIF v_case_size = 'Micro-ATX' THEN
                SET @sql = CONCAT(@sql, " AND size IN ('Micro-ATX','Mini-ITX')");
            ELSEIF v_case_size = 'Mini-ITX' THEN
                SET @sql = CONCAT(@sql, " AND size = 'Mini-ITX'");
            END IF;
        END IF;
    END IF;

    IF p_target_table = 'cases' THEN
        SET @sql = 'SELECT * FROM cases WHERE 1=1';
        IF p_motherboard_id IS NOT NULL THEN
            SELECT size INTO v_mb_size FROM motherboards WHERE id = p_motherboard_id;
            IF v_mb_size = 'E-ATX' THEN
                SET @sql = CONCAT(@sql, " AND size IN ('E-ATX')");
            ELSEIF v_mb_size = 'ATX' THEN
                SET @sql = CONCAT(@sql, " AND size IN ('E-ATX','ATX')");
            ELSEIF v_mb_size = 'Micro-ATX' THEN
                SET @sql = CONCAT(@sql, " AND size IN ('E-ATX','ATX','Micro-ATX')");
            ELSEIF v_mb_size = 'Mini-ITX' THEN
                SET @sql = CONCAT(@sql, " AND size IN ('E-ATX','ATX','Micro-ATX','Mini-ITX')");
            END IF;
        END IF;
    END IF;

    IF p_target_table = 'psus' THEN
        SET v_total_tdp = 100;
        IF p_gpu_id IS NOT NULL THEN
            SELECT COALESCE(tdp_w, 0) INTO v_gpu_tdp FROM gpus WHERE id = p_gpu_id;
            SET v_total_tdp = v_total_tdp + v_gpu_tdp;
        END IF;
        SET @sql = 'SELECT * FROM psus WHERE 1=1';
        SET @sql = CONCAT(@sql, ' AND (watt IS NULL OR watt >= ', v_total_tdp, ')');
        IF p_case_id IS NOT NULL THEN
            SELECT size INTO v_case_size FROM cases WHERE id = p_case_id;
            SET @sql = CONCAT(@sql, " AND size = '", v_case_size, "'");
        END IF;
    END IF;

    IF p_target_table NOT IN ('cpus','motherboards','cases','psus') THEN
        SET @sql = CONCAT('SELECT * FROM `', p_target_table, '`');
    END IF;

    PREPARE stmt FROM @sql;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
END$$

-- Finds PSUs capable of powering the selected GPU within the selected Case.
CREATE PROCEDURE `get_compatible_psus`(
    IN p_gpu_id INT,
    IN p_case_id INT
)
BEGIN
    DECLARE v_gpu_tdp INT DEFAULT 0;
    DECLARE v_case_size VARCHAR(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
    DECLARE v_total_tdp INT DEFAULT 100;

    IF p_gpu_id IS NOT NULL THEN
        SELECT COALESCE((SELECT tdp_w FROM gpus WHERE id = p_gpu_id), 0) INTO v_gpu_tdp;
        SET v_total_tdp = v_total_tdp + v_gpu_tdp;
    END IF;

    IF p_case_id IS NOT NULL THEN
        SELECT CONVERT(size USING utf8mb4) COLLATE utf8mb4_unicode_ci INTO v_case_size FROM cases WHERE id = p_case_id;
        SELECT * FROM psus 
        WHERE (watt IS NULL OR watt >= v_total_tdp)
          AND CONVERT(size USING utf8mb4) COLLATE utf8mb4_unicode_ci = v_case_size;
    ELSE
        SELECT * FROM psus WHERE (watt IS NULL OR watt >= v_total_tdp);
    END IF;
END$$

-- Retrieves builds that consume more power than the average build.
CREATE PROCEDURE `get_high_power_builds`()
BEGIN
    SELECT 
        build_id,
        build_name,
        total_power_estimate
    FROM builds
    WHERE total_power_estimate > (SELECT AVG(total_power_estimate) FROM builds)
    ORDER BY total_power_estimate DESC;
END$$

-- Returns aggregate price statistics (min, max, avg) and counts for all component categories.
CREATE PROCEDURE `get_part_counts`()
BEGIN
    SELECT 'cpus' AS category, MIN(price) AS min_price, MAX(price) AS max_price, AVG(price) AS avg_price, COUNT(*) AS total_parts FROM cpus
    UNION ALL
    SELECT 'gpus' AS category, MIN(price) AS min_price, MAX(price) AS max_price, AVG(price) AS avg_price, COUNT(*) AS total_parts FROM gpus
    UNION ALL
    SELECT 'ram' AS category, MIN(price) AS min_price, MAX(price) AS max_price, AVG(price) AS avg_price, COUNT(*) AS total_parts FROM ram
    UNION ALL
    SELECT 'motherboards' AS category, MIN(price) AS min_price, MAX(price) AS max_price, AVG(price) AS avg_price, COUNT(*) AS total_parts FROM motherboards
    UNION ALL
    SELECT 'psus' AS category, MIN(price) AS min_price, MAX(price) AS max_price, AVG(price) AS avg_price, COUNT(*) AS total_parts FROM psus
    UNION ALL
    SELECT 'cases' AS category, MIN(price) AS min_price, MAX(price) AS max_price, AVG(price) AS avg_price, COUNT(*) AS total_parts FROM cases
    UNION ALL
    SELECT 'ssds' AS category, MIN(price) AS min_price, MAX(price) AS max_price, AVG(price) AS avg_price, COUNT(*) AS total_parts FROM ssds
    UNION ALL
    SELECT 'displays' AS category, MIN(price) AS min_price, MAX(price) AS max_price, AVG(price) AS avg_price, COUNT(*) AS total_parts FROM displays;
END$$

-- Dynamic search procedure for components allowing keyword search and price range filtering.
CREATE PROCEDURE `search_parts`(
    IN category VARCHAR(50),
    IN keyword VARCHAR(255),
    IN min_price FLOAT,
    IN max_price FLOAT
)
BEGIN
    DECLARE table_name VARCHAR(50);
    
    CASE category
        WHEN 'cpus' THEN SET table_name = 'cpus';
        WHEN 'gpus' THEN SET table_name = 'gpus';
        WHEN 'motherboards' THEN SET table_name = 'motherboards';
        WHEN 'ram' THEN SET table_name = 'ram';
        WHEN 'psus' THEN SET table_name = 'psus';
        WHEN 'cases' THEN SET table_name = 'cases';
        WHEN 'cpu_coolers' THEN SET table_name = 'cpu_coolers';
        WHEN 'displays' THEN SET table_name = 'displays';
        WHEN 'ssds' THEN SET table_name = 'ssds';
        ELSE SET table_name = NULL;
    END CASE;
    
    IF table_name IS NULL THEN
        SELECT 'Invalid category. Valid options: cpus, gpus, motherboards, ram, psus, cases, cpu_coolers, displays, ssds.' AS error_message;
    ELSE
        SET @query_text = CONCAT('SELECT * FROM `', table_name, '` WHERE name LIKE ? AND (price IS NULL OR price BETWEEN ? AND ?) ORDER BY price ASC;');
        
        PREPARE stmt FROM @query_text;
        
        SET @kw = CONCAT('%', keyword, '%');
        SET @minp = min_price;
        SET @maxp = max_price;
        
        EXECUTE stmt USING @kw, @minp, @maxp;
        
        DEALLOCATE PREPARE stmt;
    END IF;
END$$

-- Updates build components safely using a transaction, rolling back if any incompatibility is found.
CREATE PROCEDURE `update_build`(
    IN p_build_id INT,
    IN p_build_name VARCHAR(255),
    IN p_cpu_id INT,
    IN p_gpu_id INT,
    IN p_motherboard_id INT,
    IN p_ram_id INT,
    IN p_psu_id INT,
    IN p_case_id INT,
    IN p_ssd_id INT,
    IN p_display_id INT
)
BEGIN
    START TRANSACTION;

    UPDATE builds
    SET
        build_name = COALESCE(p_build_name, build_name),
        cpu_id = COALESCE(p_cpu_id, cpu_id),
        gpu_id = COALESCE(p_gpu_id, gpu_id),
        motherboard_id = COALESCE(p_motherboard_id, motherboard_id),
        ram_id = COALESCE(p_ram_id, ram_id),
        psu_id = COALESCE(p_psu_id, psu_id),
        case_id = COALESCE(p_case_id, case_id),
        ssd_id = COALESCE(p_ssd_id, ssd_id),
        display_id = COALESCE(p_display_id, display_id)
    WHERE build_id = p_build_id;

    SELECT cpu_id, gpu_id, motherboard_id, psu_id, case_id
    INTO @cpu, @gpu, @motherboard, @psu, @case
    FROM builds WHERE build_id = p_build_id;

    IF check_compatibility_fnn('cpu', @cpu, 'motherboard', @motherboard) <> 'Compatible' COLLATE utf8mb4_0900_ai_ci THEN
        ROLLBACK;
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='CPU and Motherboard incompatible';
    END IF;

    IF check_compatibility_fnn('gpu', @gpu, 'psu', @psu) <> 'Compatible' COLLATE utf8mb4_0900_ai_ci THEN
        ROLLBACK;
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='GPU and PSU incompatible';
    END IF;

    IF check_compatibility_fnn('motherboard', @motherboard, 'case', @case) <> 'Compatible' COLLATE utf8mb4_0900_ai_ci THEN
        ROLLBACK;
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Motherboard and Case incompatible';
    END IF;

    COMMIT;
END$$

DELIMITER ;