# SeshNx WebApp

**The operating system for music creators, studios, and industry professionals.**

SeshNx is a comprehensive platform designed to streamline the music production workflow. It combines social networking, studio booking, talent discovery, marketplace features, and educational tools into a single Progressive Web App (PWA).

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
* **Firebase**:
    * **Auth**: User authentication and session management.
    * **Firestore**: Primary database for profiles, feeds, marketplace, and bookings.
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