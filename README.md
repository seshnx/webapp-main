# SeshNx WebApp

**The Operating System for Music Creators**

SeshNx is a comprehensive platform designed to streamline the music production workflow. It combines social networking, studio booking, talent discovery, marketplace features, and educational tools into a single Progressive Web App (PWA).

**Part of the SeshNx Platform by Amalia Media LLC**

## 🚀 Features

* **Social Network**: User profiles, activity feeds, and networking tools for creators.
* **Booking System**: Management for studio sessions, equipment, and talent booking.
* **Real-time Chat**: Instant messaging, presence indicators, and group chats powered by Convex.
* **Marketplace**: Buy/Sell gear and "SeshFx" (digital assets).
* **Education (EDU)**: Learning management system for students, interns, and staff.
* **Studio Management**: Tools for managing studio operations, payments, and legal docs.
* **PWA Support**: Installable on mobile and desktop devices with offline capabilities.

## 🛠 Tech Stack

### Frontend
* **Framework**: React 18 (Vite)
* **Styling**: Tailwind CSS, clsx
* **Animations**: Framer Motion
* **State/Routing**: React Router DOM, Context API
* **Maps**: Leaflet / React-Leaflet
* **Audio**: Wavesurfer.js
* **Forms**: React Hook Form + Zod

### Backend & Database (Hybrid Architecture)
* **Supabase**:
    * **Auth**: User authentication and session management (PKCE flow).
    * **PostgreSQL**: Primary database for profiles, feeds, marketplace, and bookings.
    * **Storage**: Media and file storage.
* **Convex**:
    * **Reactive DB**: Specialized high-performance backend for the Chat system, presence, and read receipts.

### Infrastructure
* **Deployment**: Vercel
* **CI/CD**: GitHub Actions

## 🏗 Architecture

SeshNx uses a **Hybrid Architecture** to balance cost, ease of use, and real-time performance.

1.  **Identity**: Firebase Auth provides the `UID` used across both Firestore and Convex.
2.  **Core Data**: Firestore handles document-heavy data (Users, Products, Posts).
3.  **Real-Time**: Convex handles high-frequency updates (Messages, Typing Indicators) to avoid cold-start issues and complex synchronization logic.

## 📦 Installation & Setup

### Prerequisites
* Node.js (v18+ recommended)
* npm or yarn

### 1. Clone the repository
```bash
git clone [https://github.com/seshnx/webapp.git](https://github.com/seshnx/webapp.git)
cd webapp
```

### 2. Install dependencies
```bash
npm install
```

### 3. Start development server
```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## 🏗 Architecture

SeshNx uses a **Hybrid Architecture** to balance cost, ease of use, and real-time performance.

### Updated Backend Architecture (Current)
1.  **Identity**: Supabase Auth provides the `UID` used across both Supabase and Convex.
2.  **Core Data**: Supabase (PostgreSQL) handles document-heavy data (Users, Products, Posts).
3.  **Real-Time**: Convex handles high-frequency updates (Messages, Typing Indicators) to avoid cold-start issues and complex synchronization logic.
4.  **Payments**: Stripe integration for marketplace transactions.

### Previous Architecture (Legacy)
The codebase previously used Firebase. Legacy imports have been mapped to empty adapters in `vite.config.js`.

## 📚 Documentation

- `CLAUDE.md` - Architecture and development guidance
- `README_INTEGRATION.md` - Cross-platform integration guide
- `WEBAPP_BCM.md` - Business component mapping

## 🚀 Deployment

Deploy to Vercel:
```bash
npm run build:vercel
```

## 📄 License

Copyright (c) 2024 Amalia Media LLC. All rights reserved.

Proprietary software - Distribution prohibited without explicit permission.

## 🔧 Support

For technical support, bug reports, or feature requests, contact the development team.

---

*Part of the [SeshNx Platform](https://seshnx.com) by Amalia Media LLC*