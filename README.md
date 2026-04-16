# 🏎️ Vintage Rides Hub

A Premium, Heritage-Themed Full-Stack Car Rental Platform.

![Vintage Rides Hub Mockup](https://raw.githubusercontent.com/935Sumit/car_rental/main/public/vintage-banner.jpg)

**Vintage Rides Hub** is a sophisticated web application designed for automobile enthusiasts to discover and book classic vintage cars. Built with a focus on premium aesthetics and seamless user experience, it features a unique **"Liquid Glass"** design system and is powered by a modern tech stack including React and Supabase.

---

## ✨ Features

### 👤 User-Centric Experience
-   **Heritage Discovery:** Browse a curated collection of classic cars with high-quality visuals and detailed specifications.
-   **Advanced Filtering:** Instantly sort by fuel type (Petrol/Diesel), transmission (Manual/Automatic), and brand.
-   **Smart Booking System:** 
    -   Real-time availability checking with date range selection.
    -   Dynamic pricing with automatic discount calculation (5% to 40% based on duration).
    -   Chauffeur service option (+₹500/day).
    -   Coupon code integration for extra savings.
-   **Professional Invoicing:** Generate and download official PDF invoices upon successful booking.
-   **Personalized Dashboard:** Track active rentals, view booking history, and manage your saved "Favorite" collection.
-   **Profile Management:** Update personal details, including secure driving license verification.

### 🛠️ Admin Management Suite
-   **Comprehensive Dashboard:** Real-time statistics on total revenue, active bookings, fleet size, and user base.
-   **Booking Calendar:** Visual calendar interface to track rentals across different months.
-   **Fleet Management:** Add, update, or remove vehicles from the catalog. Support for multiple image uploads with live previews.
-   **Booking Control:** Manage all user bookings—confirm, extend, or cancel as needed.
-   **User Oversight:** View and manage the registered user base with search and filtering capabilities.

### 🎨 Design & Aesthetics
-   **Liquid Glass UI:** A custom design system using deep browns, gold accents, and rich cream backgrounds.
-   **Micro-Animations:** Fluid transitions and interactive elements powered by **Framer Motion**.
-   **Responsive Design:** Fully optimized for all devices, from mobile ultra-slim views to immersive desktops.

---

## 🛠️ Technology Stack

| Layer | Technologies Used |
| :--- | :--- |
| **Frontend** | React 18, Vite, Framer Motion, React Router 6, React Icons |
| **Backend/DB** | Supabase (PostgreSQL), Supabase Auth, Supabase Storage |
| **Styling** | Vanilla CSS3 (Custom Design System with CSS Variables) |
| **Utilities** | jspdf & html2canvas (Invoice Generation) |
| **Deployment** | Vercel |

---

## 🚀 Getting Started

### Prerequisites
-   Node.js (v18 or higher)
-   Supabase Account

### Setup Instructions

1.  **Clone the Repository:**
    ```bash
    git clone https://github.com/935Sumit/car_rental.git
    cd vintage-rides-hub
    ```

2.  **Install Dependencies:**
    ```bash
    npm install
    ```

3.  **Environment Variables:**
    Create a `.env` file in the root directory and add your credentials:
    ```env
    VITE_SUPABASE_URL=your_supabase_project_url
    VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
    ```
    *(Refer to `.env.example` for additional optional variables like Razorpay keys)*

4.  **Run Development Server:**
    ```bash
    npm run dev
    ```
    Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 📁 Project Structure

```bash
src/
├── admin/              # Admin Dashboard pages & components
├── assets/             # Brand identity icons and assets
├── components/         # Reusable UI (Header, Search, Modals, etc.)
├── context/            # Global state (AuthContext, CarContext)
├── pages/              # Public & User-authenticated views (Home, Profile, etc.)
├── supabase/           # Client configuration & API helpers
├── utils/              # Helper functions (Invoice generator, formatters)
└── index.css           # Global theme tokens (Colors, Typography, Glassmorphism)
```

---

## 🛡️ Security & Authentication
-   **Secure Auth:** Powered by Supabase Auth with protected route handling.
-   **Admin Access:** Strict role-based access to the management suite.
-   **Data Persistence:** Real-time database updates ensuring no double-bookings.

---

## 📄 License
This project is developed as part of an **Internship Portfolio**. Please contact the author for permissions regarding usage.

_Created with ❤️ for automotive heritage._
