# Build A PC

**A Full-Stack Database Management System for Custom PC Building**



---

## Overview

**Build A PC** is a centralized, database-driven application designed to simplify the complex process of building custom computers. It solves the problem of fragmented hardware information by consolidating component specifications into a single platform.

Unlike standard e-commerce sites, this system features a **smart database layer** that automatically validates hardware compatibility (e.g., CPU Socket matching, GPU physical clearance, PSU wattage requirements) using stored procedures and triggers, ensuring users create functional and safe builds.

---

## Key Features

* **Intelligent Search & Filtering:** Filter components by category, price, and specifications.
* **Automated Compatibility Checks:**
    * **Socket Validation:** Ensures CPU matches the Motherboard socket.
    * **Power Validation:** Checks if the PSU provides enough wattage for the GPU and system.
    * **Form Factor Logic:** Validates that the Motherboard fits physically inside the selected Case.
* **Real-time Power Estimation:** Database triggers automatically calculate the total TDP of a build.
* **Build Management:** Users can save, edit, and delete custom build configurations.
* **Admin Dashboard:** Dedicated interface for administrators to manage the parts catalog (CRUD operations).
* **User Roles:** Distinction between Admin (full access) and Standard Users (restricted transactional access).

---

## Tech Stack

This project follows a **3-Tier Architecture**:

### Frontend (Presentation Layer)
* **React.js:** Single Page Application (SPA) for a responsive UI.
* **CSS3:** Custom styling for dashboards and build tools.

### Backend (Application Layer)
* **FastAPI (Python):** High-performance REST API connecting the client to the database.
* **mysql-connector-python:** Secure database driver.

### Database (Data Layer)
* **MySQL 8.0:** Relational Database Management System.
* **Advanced SQL Features:** Extensive use of Triggers, Stored Procedures, and Functions to encapsulate business logic directly in the DB.

---

## Database Architecture

<img width="5020" height="2816" alt="drawSQL-image-export-2025-11-20" src="https://github.com/user-attachments/assets/8d4a8b21-dfc9-4c65-9c48-dbf9868ec36d" />


The system utilizes a **Star Schema** design centered around the `builds` fact table, connected to various component dimension tables.

### Core Entities
* `builds` (Transaction Log)
* `cpus`, `gpus`, `motherboards`, `ram`, `psus`, `cases`, `ssds`, `displays` (Inventory)



### Advanced SQL Implementation

The "brain" of the application is implemented directly in the database using the following objects:

#### 1. Stored Procedures
**Transactional & Admin Operations:**
* `update_build`: Handles complex build updates with transaction control (COMMIT/ROLLBACK).
* `delete_build`: Safely removes build records.
* `create_normal_user`: Dynamically manages user creation and grants restricted privileges (DCL).
* `admin_update_attribute`: Allows administrators to update specific component attributes dynamically.

**Data Retrieval & Analysis:**
* `get_build_details`: Retrieves comprehensive details for a build by joining all component tables.
* `get_build_summary`: Generates a financial and specification summary for a build.
* `search_parts`: Advanced filtering for components based on keywords and price ranges.
* `get_compatible_parts`: Finds parts that match the current build's constraints (e.g., find compatible CPU for selected Motherboard).
* `get_compatible_psus`: Suggests power supplies based on GPU and Case selection.
* `get_high_power_builds`: Identifies builds exceeding average power consumption.
* `get_part_counts`: Provides inventory statistics.
* `compare_parts_by_id`: Compares specifications of multiple selected parts.
* `find_component_by_name`: Quick search utility for the frontend.
* `estimate_power`: Recalculates total wattage for a specific build ID.

#### 2. Functions
* `check_compatibility_fnn`: The core logic engine. It accepts two components (e.g., CPU and Motherboard) and returns "Compatible" or a specific error message detailing the mismatch (Socket, Size, or Wattage).
* `check_power_compatibility`: Helper function for specific power validation logic.
* `COLUMN_EXISTS`: Utility function to verify schema structure before dynamic SQL execution.

#### 3. Triggers
* `trg_before_insert_power`: Automatically calculates and sets the `total_power_estimate` when a new build is created.
* `trg_validate_build_compatibility`: Prevents the insertion of a build if the GPU and PSU are fundamentally incompatible.
* `check_psu_sufficient_before_insert`: Aborts the INSERT operation if the selected PSU cannot support the estimated wattage.
* `check_psu_sufficient_before_update`: Aborts the UPDATE operation if changing a part makes the existing PSU insufficient.

---

## Installation & Setup

Follow these steps to run the project locally.

### Prerequisites
* MySQL Server 8.0+
* Python 3.9+
* Node.js & npm

### 1. Database Setup
1.  Open your MySQL client (Workbench or Command Line).
2.  Navigate to the `SQL/` folder in this repository.
3.  Import the complete dump file to set up the schema, data, and procedures in one go:
    ```bash
    mysql -u root -p < SQL/final_build_a_pc_dump.sql
    ```
    *(Alternatively, you can execute the content of the file using MySQL Workbench's "Data Import" feature).*

### 2. Backend Setup
1.  Navigate to the backend directory:
    ```bash
    cd backend
    ```
2.  Install the required Python dependencies:
    ```bash
    pip install -r requirements.txt
    ```
3.  Start the FastAPI server:
    ```bash
    uvicorn main:app --reload
    ```
    *The API will run at `http://127.0.0.1:8000`.*

### 3. Frontend Setup
1.  Open a new terminal and navigate to the frontend directory:
    ```bash
    cd frontend
    ```
2.  Install Node modules:
    ```bash
    npm install
    ```
3.  Start the React application:
    ```bash
    npm start
    ```
    *The application will open at `http://localhost:3000`.*

---

## Screenshots

### Admin Dashboard
![part_management](https://github.com/user-attachments/assets/3a469a3c-29e2-435d-bb03-5a0d0053b4e0)
![part_management2](https://github.com/user-attachments/assets/88f96594-6655-4a5e-878a-c1bd2c2d6620)


### Build Creation Tool
![build_test](https://github.com/user-attachments/assets/1e222cac-d64d-4266-b911-269606ac9570)




## References
* **PCPartPicker** (Inspiration): [https://pcpartpicker.com/](https://pcpartpicker.com/)
* **Dataset Source:** [GitHub - docyx/pc-part-dataset](https://github.com/docyx/pc-part-dataset)
