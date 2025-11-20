-- ------------------------------------------------------
-- DCL: User Management & Security
-- ------------------------------------------------------

-- 1. Create the Super Admin (Full Privileges)
CREATE USER IF NOT EXISTS 'admin'@'localhost' IDENTIFIED BY 'admin1234';
GRANT ALL PRIVILEGES ON `final_build_a_pc`.* TO 'admin'@'localhost' WITH GRANT OPTION;

DELIMITER $$

DROP PROCEDURE IF EXISTS `create_normal_user`$$

CREATE PROCEDURE `create_normal_user`(
    IN new_username VARCHAR(100), 
    IN new_pwd VARCHAR(100)
)
BEGIN
    -- Declare variables to hold the safely-quoted inputs
    DECLARE quoted_user VARCHAR(250);
    DECLARE quoted_pass VARCHAR(250);
    
    -- Use QUOTE() to safely escape inputs and prevent SQL injection.
    SET quoted_user = QUOTE(new_username);
    SET quoted_pass = QUOTE(new_pwd);

    -- This variable will hold the dynamic SQL query
    SET @sql = '';

    -- 1. Create the new user on 'localhost' with the given password
    SET @sql = CONCAT('CREATE USER IF NOT EXISTS ', quoted_user, '@''localhost'' IDENTIFIED BY ', quoted_pass, ';');
    PREPARE stmt FROM @sql;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
    
    -- 2. Grant the new user the ability to connect (USAGE).
    SET @sql = CONCAT('GRANT USAGE ON *.* TO ', quoted_user, '@''localhost'';');
    PREPARE stmt FROM @sql;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;

    -- 3. Grant the user SELECT-only access to the entire database (Read Catalog)
    SET @sql = CONCAT('GRANT SELECT ON `final_build_a_pc`.* TO ', quoted_user, '@''localhost'';');
    PREPARE stmt FROM @sql;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;

    -- 4. Grant INSERT, UPDATE, DELETE specifically on the builds table (User Data)
    SET @sql = CONCAT('GRANT INSERT, UPDATE, DELETE ON `final_build_a_pc`.`builds` TO ', quoted_user, '@''localhost'';');
    PREPARE stmt FROM @sql;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
    
END$$

DELIMITER ;

-- Example Execution:
-- CALL create_normal_user('test_client', 'client123');