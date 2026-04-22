# San Isidro Health Center Management System

A professional and easy-to-use tool designed for managing health records at the local barangay level.

## About the System

This platform was built to help health officers manage patient records, track immunizations, and monitor medicine inventory without the complexity of traditional software. It's fast, works directly in your browser, and keeps everything organized in one place.

## Parallel Computing & Background Processing

The San Isidro Health Center system is built for performance. It utilizes **Parallel Computing** via the **Web Workers API** to handle data-intensive tasks without freezing the user interface.

**How it works:**
*   **Zero-Lag Reports**: When you click "Generate Report," the system offloads the data analysis to a separate background thread.
*   **Main Thread Freedom**: While the background worker is busy processing your records, the main dashboard remains fully interactive. You can still add patients or check medicine stock.
*   **Inline Logic**: We use an "Inline Worker" approach, ensuring parallel computing works perfectly in modern browsers like **Opera GX** even when running the system locally.

**Benefits:**
*   Simulates processing of **10 million records** with zero UI impact.
*   Provides real-time progress updates (0% to 100%) during background tasks.
*   Ensures a smooth, "premium" software experience.

## Core Features

*   **Patient Profiling**: Full CRUD (Create, Read, Update, Delete) for patient management.
*   **Data Analytics**: Visual doughnut and bar charts for demographics and inventory trends.
*   **Reports History**: Generate and store JSON snapshots of your health center's data.
*   **Immunization Tracking**: Real-time scheduling and status management for vaccinations.
*   **Medicine Inventory**: Smart stock tracking with low-supply alerts.

## Technology Used

We kept the system lightweight and modern using:
*   **HTML & CSS**: For a clean, professional healthcare look.
*   **JavaScript**: To handle all the logic and navigation smoothly.
*   **LocalStorage**: To save your data directly in your browser so it's there when you return.

## Project Structure

*   `index.html`: The main entry point and UI shell.
*   `/assets/css/style.css`: Professional healthcare styling and animations.
*   `/assets/js/app.js`: The central "brain" containing logic, CRUD, and the **Inline Parallel Worker**.
*   `/assets/js/data.js`: Initial dummy data for system setup.
