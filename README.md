# CampusX — College Student Marketplace (MERN)

> **"Buy smarter. Sell faster. Trade within your campus."**  
> *Currency: INR (₹) • Tailored for Indian College & University Communities*

---


Project Live Video Link : https://drive.google.com/file/d/1ewMMd-joxiPhc7QrV5tZOMb5vLGNZkKO/view?usp=sharing


## 1. Project Overview & Academic Submission

**CampusX** is a complete, production-ready, full-stack marketplace web application engineered specifically for college students. Inspired by platforms like OLX, CampusX provides a safe, trusted, hyper-local platform where students can buy, sell, discover, and exchange second-hand academic resources, electronics, bicycles, and hostel living essentials within their campus perimeter.

### Problem Statement
College students face unique challenges every semester:
1. **High Textbook & Equipment Costs**: New semester engineering textbooks, scientific calculators (e.g., Casio ClassWiz), lab coats, and drafters cost thousands of rupees, only to be used for 4 to 6 months.
2. **Hostel Relocation Friction**: Senior students graduating or changing hostels need to quickly dispose of bicycles, table lamps, coolers, and storage racks, while juniors hunt for the exact same items.
3. **Generic Classifieds Risks**: Public marketplaces like OLX or Facebook Marketplace involve complete strangers, unsafe off-campus travel, delivery scams, and high transaction costs.
4. **Campus Notice Board Inefficiency**: WhatsApp batch groups and physical hostel notice boards get buried quickly, offer zero search or filtering capabilities, and leak private contact numbers.

### Objectives
- Create a hyper-local campus marketplace tailored for Indian college environments.
- Provide secure student authentication with strict credential verification.
- **Implement the explicit requirement**: Upon account creation/registration, users are **NOT** automatically logged in; they must explicitly authenticate with their credentials.
- Enable end-to-end listing lifecycle (create, image upload, edit, delete, mark as sold, exchange listings).
- Facilitate direct buyer-seller messaging without exposing personal phone numbers.
- Provide a campus moderation system for reporting suspicious listings.

---

## 2. Technology Stack

### Frontend
- **Framework**: React 18 with Vite
- **Routing**: React Router v7
- **Styling**: Tailwind CSS with custom theme extensions
- **Icons**: Lucide React
- **HTTP Client**: Axios with credentials, request/response interceptors
- **State Management**: React Context (`AuthContext`)
- **Notifications**: React Hot Toast

### Backend
- **Runtime**: Node.js (ES Modules)
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM (Atlas & embedded MongoMemoryServer for instant zero-config local testing)
- **Authentication**: JSON Web Tokens (JWT) stored in secure HttpOnly cookies (`campusx_token`) with Bearer header fallback
- **Password Security**: bcryptjs password hashing (salted)
- **File Uploads**: Multer with memory & disk storage adapters
- **Cloud Storage**: Cloudinary integration with local `/uploads` static file fallback

---

## 3. Architecture & Folder Structure

```
mern-project/
├── .gitignore
├── package.json               # Root scripts (concurrent dev runner, test, seed)
├── README.md                  # Comprehensive project documentation
├── backend/                   # Backend Node.js / Express API
│   ├── config/
│   │   ├── db.js             # Mongoose connection + auto-embedded fallback
│   │   └── cloudinary.js     # Cloudinary configuration & fallback detection
│   ├── middleware/
│   │   ├── auth.js           # JWT verification, cookie parsing, admin guard
│   │   ├── errorHandler.js   # Centralized error handler (CastError, duplicate key, validation)
│   │   └── upload.js         # Multer configuration (5MB limit, MIME checks)
│   ├── models/
│   │   ├── User.js           # Student & admin accounts (with bcrypt hashing)
│   │   ├── Listing.js        # Products for sale & exchange
│   │   ├── Wishlist.js       # Persistent user saved items
│   │   ├── Conversation.js   # Buyer-seller chat threads
│   │   ├── Message.js        # Chat messages with read timestamps
│   │   └── Report.js         # Moderation reports
│   ├── routes/
│   │   ├── authRoutes.js     # Register, login, logout, me, profile, change-password
│   │   ├── listingRoutes.js  # CRUD, filtering, search, pagination, status toggle
│   │   ├── wishlistRoutes.js # Get, add, remove wishlist items
│   │   ├── conversationRoutes.js # Thread creation, message sending, message fetching
│   │   ├── reportRoutes.js   # Submit report, admin moderation endpoints
│   │   └── userRoutes.js     # Public student profiles & active listings
│   ├── seed.js               # Realistic Indian campus demo dataset
│   ├── server.js             # Express application initialization & middleware
│   ├── test/
│   │   └── api.test.js       # 20 automated backend integration tests (100% pass)
│   ├── .env.example
│   └── package.json
└── frontend/                  # Frontend React + Vite SPA

    ├── public/
    │   └── logo.svg          # CampusX brand logo
    ├── src/
    │   ├── api/
    │   │   └── axios.js      # Configured Axios instance with interceptors
    │   ├── components/
    │   │   ├── Navbar.jsx    # Header with search, categories, sell CTA, user dropdown
    │   │   ├── Footer.jsx    # Campus safety guidelines, categories, academic note
    │   │   ├── ListingCard.jsx # Product card with badge, price, wishlist toggle
    │   │   ├── CategoryBar.jsx # 1-click horizontal category filter bar
    │   │   ├── ImageUploader.jsx # Drag/drop upload + image URL input (up to 5)
    │   │   ├── ProtectedRoute.jsx # Route authentication & admin guard
    │   │   └── ReportModal.jsx # Suspicious listing report modal
    │   ├── context/
    │   │   └── AuthContext.jsx # Auth state, login, register, logout, session check
    │   ├── pages/
    │   │   ├── HomePage.jsx  # Hero, search, filters, product grid, pagination
    │   │   ├── RegisterPage.jsx # Student registration (NO auto-login requirement)
    │   │   ├── LoginPage.jsx # Student login with 1-click demo accounts
    │   │   ├── ListingDetailsPage.jsx # Gallery, price, seller card, chat CTA
    │   │   ├── CreateListingPage.jsx # Multi-image listing creation
    │   │   ├── EditListingPage.jsx # Listing updates, status toggle, delete
    │   │   ├── MyListingsPage.jsx # Active & sold tabs, quick actions
    │   │   ├── WishlistPage.jsx # Persistent saved items grid
    │   │   ├── MessagesPage.jsx # 2-pane buyer-seller messaging (live auto-poll)
    │   │   ├── ProfilePage.jsx # Account settings, password change
    │   │   ├── AdminReportsPage.jsx # Admin moderation dashboard
    │   │   └── NotFoundPage.jsx # 404 handler
    │   ├── App.jsx           # App layout, router definitions, toast config
    │   ├── main.jsx          # React DOM entry
    │   └── index.css         # Tailwind & custom scrollbar styling
    ├── index.html
    ├── vite.config.js
    ├── tailwind.config.js
    ├── postcss.config.js
    └── package.json
```

---

## 4. Key Functional Features

### A. Authentication & User Accounts (Explicit No-Auto-Login Policy)
- **Account Registration (`POST /api/auth/register`)**:
  - Captures Full Name, College Email, Password, College/University, Department, and Year of Study.
  - Validates duplicate email accounts.
  - Hashes passwords using bcrypt with salt rounds.
  - **Core Requirement**: Does **NOT** issue an authentication token or session cookie upon registration.
  - Successfully registers the account, returns `{ requiresLogin: true }`, and redirects the user to the `/login` page with an informative notice: *"Account created successfully! Please log in with your credentials to access CampusX."*
- **Explicit Login (`POST /api/auth/login`)**:
  - Validates student email and password.
  - Sets an **HttpOnly, SameSite=Lax** session cookie (`campusx_token`).
  - Returns user profile data and backup token for flexible clients.
- **Session Persistence**: Session automatically validated on reload via `GET /api/auth/me`.
- **Profile & Password Management**: Students can edit their department, year, profile avatar, and change passwords safely.

### B. Marketplace & Discovery
- **Server-Side Filtering**:
  - **Category**: Books & Study Materials, Electronics, Calculators & Lab Equipment, Cycles & Transport, Hostel Essentials, Furniture, Clothing & Accessories, Sports & Fitness, Other.
  - **Condition**: Like New, Good, Fair.
  - **Listing Type**: For Sale (₹ price) vs Exchange (preferred items).
  - **Campus / College**: Filter items by specific university (e.g. IIT Bombay, Delhi University, BITS Pilani, VIT Vellore).
  - **Price Range**: Min (₹) and Max (₹) price filters.
- **Live Search**: Case-insensitive keyword search on product titles and descriptions.
- **Sorting**: Newest First, Price: Low to High, Price: High to Low, Oldest.
- **Pagination**: Server-side page limit calculation and page navigation controls.

### C. Listing Lifecycle Management
- **Create Listing**:
  - Requires title (min 3 chars), category, condition, college, designated campus pickup location (e.g., *Hostel 12 Foyer* or *Library Quad*), description, and price.
  - Upload up to 5 photos via local file picker or direct web links (Unsplash, etc.).
  - Supports **Exchange Listings** with a description of preferred items (e.g., *"Looking to exchange scientific calculator for engineering mini-drafter"*).
- **Edit & Delete Listings**:
  - Strict server-side authorization check: only the listing owner (or administrator) can modify or delete.
  - Quick toggle between **Available** and **Sold** status.
  - When marked as Sold, the item displays a prominent "SOLD OUT" overlay and disables new contact requests.

### D. Persistent Wishlist
- Backed by MongoDB `Wishlist` collection with unique compound index `{ userId, listingId }` to prevent duplicates.
- Instant 1-click heart toggle on product cards and product details.
- Dedicated `/wishlist` page allowing review and removal.

### E. Buyer–Seller Communication
- **Privacy-First In-App Messaging**:
  - Clicking "Contact Seller" opens or creates a direct conversation thread between buyer and seller linked to the specific product.
  - Students never need to expose their phone numbers or WhatsApp contacts to strangers.
  - Self-messaging prevention (sellers cannot start chats with themselves on their own items).
  - Participant authorization: only the 2 student participants can view and exchange messages.
  - Auto-polling stream (refreshes every 4 seconds) for live chat updates.

### F. Campus Moderation & Reporting
- Any student can report suspicious listings choosing from standard reasons: *Inappropriate Item*, *Prohibited/Illegal Item*, *Misleading Information*, *Suspected Scam*, *Duplicate Listing*, *Other*.
- Duplicate reports from the same student for the same listing are blocked.
- Dedicated Admin Dashboard at `/admin/reports` (restricted to `role: 'admin'`) allowing moderators to review reports, dismiss them, or take down infringing listings permanently.

---

## 5. Database Schema (Mongoose Models)

| Model | Key Fields | Indexes & Constraints |
|---|---|---|
| **User** | `name`, `email`, `password` (hashed), `college`, `department`, `year`, `profileImage`, `role` ('student'/'admin') | Unique index on `email`, password `select: false` by default |
| **Listing** | `sellerId` (ref User), `title`, `description`, `price`, `listingType` ('sale'/'exchange'), `preferredExchange`, `category`, `condition`, `images` (array), `college`, `pickupLocation`, `status` ('available'/'sold'), `views` | Text index on `title`, `description`. Compound index on `(category, status, createdAt)`, `(college, status, createdAt)` |
| **Wishlist** | `userId` (ref User), `listingId` (ref Listing) | Unique compound index on `{ userId: 1, listingId: 1 }` |
| **Conversation**| `participants` ([User]), `listingId` (ref Listing), `lastMessage` (`text`, `senderId`, `createdAt`) | Index on `participants`, compound on `(listingId, participants)` |
| **Message** | `conversationId` (ref Conversation), `senderId` (ref User), `text`, `readAt` | Index on `(conversationId, createdAt)` |
| **Report** | `reporterId` (ref User), `listingId` (ref Listing), `reason`, `description`, `status` ('pending'/'reviewed'/'action_taken'/'dismissed') | Unique compound index on `{ reporterId: 1, listingId: 1 }` |

---

## 6. REST API Endpoints

### Authentication (`/api/auth`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Registers a new student. **Does NOT auto-login.** Returns `{ requiresLogin: true }` |
| `POST` | `/api/auth/login` | Public | Authenticates credentials and issues HttpOnly JWT cookie |
| `POST` | `/api/auth/logout` | Public | Clears HttpOnly authentication cookie |
| `GET` | `/api/auth/me` | Private | Returns currently logged-in student profile |
| `PATCH`| `/api/auth/profile` | Private | Updates student name, college, department, year, avatar |
| `PATCH`| `/api/auth/change-password` | Private | Verifies old password and hashes new password |

### Listings (`/api/listings`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/listings` | Public | Lists products with search, category, condition, price, college filters & pagination |
| `GET` | `/api/listings/mine` | Private | Returns all listings created by authenticated student |
| `GET` | `/api/listings/metadata`| Public | Returns valid categories and conditions |
| `GET` | `/api/listings/:id` | Public | Single listing details, view count increment, related products |
| `POST` | `/api/listings` | Private | Create listing with up to 5 image uploads |
| `PATCH`| `/api/listings/:id` | Private | Update listing (owner or admin only) |
| `PATCH`| `/api/listings/:id/status`| Private | Toggle between 'available' and 'sold' |
| `DELETE`| `/api/listings/:id` | Private | Delete listing and clean up wishlist references |

### Wishlist (`/api/wishlist`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/wishlist` | Private | Get student's saved items with populated listings |
| `POST` | `/api/wishlist/:listingId` | Private | Add listing to wishlist (idempotent) |
| `DELETE`| `/api/wishlist/:listingId` | Private | Remove listing from wishlist |

### Conversations & Messages (`/api/conversations`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/conversations` | Private | Get user's conversation threads |
| `POST` | `/api/conversations` | Private | Start or open conversation on a listing (cannot message self) |
| `GET` | `/api/conversations/:id/messages` | Private | Get message history for thread (marks incoming as read) |
| `POST` | `/api/conversations/:id/messages` | Private | Send a new message to buyer/seller |

### Reports & Moderation (`/api/reports`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/reports` | Private | Report a suspicious or prohibited listing |
| `GET` | `/api/reports/admin` | Admin | List all reports with reporter & listing data |
| `PATCH`| `/api/reports/admin/:id`| Admin | Moderate report (update status / take down listing) |

---

## 7. Local Installation & Setup

### Prerequisites
- Node.js (v18.x or v20.x+)
- npm (v9.x or v10.x+)
- MongoDB Atlas account (Optional; an embedded zero-config MongoDB instance starts automatically if no URI is provided!)

### Step 1: Clone or Navigate to the Workspace
```bash
cd "mern project"
```

### Step 2: Install Dependencies
```bash
# Install root orchestrator dependencies
npm install

# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install
cd ..
```

### Step 3: Environment Configuration
Create `.env` inside `backend/` (or copy from `backend/.env.example`):
```bash
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
JWT_SECRET=campusx_super_secret_jwt_key_2025

# Optional: MongoDB Atlas URI. Leave blank for embedded zero-config MongoDB!
MONGODB_URI=

# Optional: Cloudinary credentials. Leave blank to store images locally in /backend/uploads
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

Create `.env` inside `frontend/`:
```bash
# In local development Vite proxies /api, so leave blank:
VITE_API_URL=
```

### Step 4: Seed Demo Data
To seed realistic Indian college products, demo student profiles, and chat conversations:
```bash
npm run seed
```

### Step 5: Start Frontend and Backend Concurrently
From the project root:
```bash
npm run dev
```
- **Backend API**: http://localhost:5000
- **Frontend App**: http://localhost:5173

---

## 8. Demo User Accounts

The database comes pre-seeded with sample student and administrator profiles (password for all demo accounts is `password123`):

| Name | Email | College | Role | Focus |
|---|---|---|---|---|
| **Aarav Sharma** | `aarav.sharma@iitb.ac.in` | IIT Bombay | Student | Seller (Books, Drafters) |
| **Priya Patel** | `priya.patel@du.ac.in` | Delhi University | Student | Buyer (Calculators) |
| **Rohan Verma** | `rohan.verma@bits.ac.in` | BITS Pilani | Student | Seller (Cycles, Keyboards) |
| **Sneha Gupta** | `sneha.gupta@vit.ac.in` | VIT Vellore | Student | Seller (Hostel Gear) |
| **Admin Moderator** | `admin@campusx.edu` | CampusX Hub | Admin | Campus Moderator |

> **Pro Tip**: The Login page includes **1-Click Demo Profile buttons** for instant testing without typing credentials!

---

## 9. Automated Testing Verification

The project includes an automated integration test suite covering authentication, authorization, registration requirements, CRUD, wishlist, messaging, and reporting:

```bash
npm test
```

### Test Results
```text
▶ CampusX Full-Stack Backend API Tests
  ▶ 1. Authentication & Registration Requirements
    ✔ POST /api/auth/register: Registers user successfully BUT DOES NOT automatically log them in
    ✔ POST /api/auth/login: Student must explicitly log in to receive session cookie/token
    ✔ POST /api/auth/login: Invalid credentials return 401 error
    ✔ GET /api/auth/me: Returns current authenticated student profile
    ✔ Login student 2 (Priya Patel) for multi-user tests
  ▶ 2. Listings & Marketplace CRUD and Filters
    ✔ GET /api/listings: Returns active marketplace listings with pagination
    ✔ GET /api/listings: Filter by category and search keyword
    ✔ POST /api/listings: Authenticated student can create a listing
    ✔ POST /api/listings: Fails without required fields
    ✔ PATCH /api/listings/:id/status: Seller can toggle status to sold
    ✔ PATCH /api/listings/:id: Non-owner cannot edit another student's listing (403)
  ▶ 3. Wishlist Functionality
    ✔ POST /api/wishlist/:id: Adds item to student wishlist
    ✔ GET /api/wishlist: Returns student's wishlist
    ✔ DELETE /api/wishlist/:id: Removes item from wishlist
  ▶ 4. Buyer-Seller Messaging
    ✔ POST /api/conversations: Student cannot message themselves on their own listing (400)
    ✔ POST /api/conversations: Student 2 contacts seller (Student 1) regarding listing
    ✔ POST /api/conversations/:id/messages: Seller replies to buyer
    ✔ GET /api/conversations/:id/messages: Retrieves messages for participant
  ▶ 5. Reporting & Moderation
    ✔ POST /api/reports: Student reports a listing with valid reason
    ✔ POST /api/reports: Duplicate report by same user returns 400
ℹ tests 20 | suites 6 | pass 20 | fail 0 (100% Pass)
```

---

## 10. Live Demonstration Script for Examiners

1. **Test Registration & Explicit Login (Primary Requirement)**:
   - Click **Sign Up** in the navigation bar.
   - Fill in student details (e.g. *Kabir Mehta, kabir@iitd.ac.in, password123, IIT Delhi, 2nd Year*).
   - Click **Create Account**.
   - Observe that the account is created, a success toast appears, and the user is redirected to `/login` with an amber notice explaining that **accounts are not automatically logged in**.
   - Enter credentials on `/login` and sign in.
2. **Browse & Filter Listings**:
   - Filter by category (e.g., *Calculators & Lab Equipment*).
   - Filter by college (e.g., *BITS Pilani*).
   - Sort by *Price: Low to High*.
   - Use search bar to search for *"calculator"*.
3. **Wishlist Persistence**:
   - Tap the Heart icon on any listing.
   - Navigate to `/wishlist` to confirm persistence.
   - Refresh the page to verify persistence across sessions.
4. **Create & Manage a Listing**:
   - Click **Sell Item** in top right.
   - Fill in details: *"Scientific Drafter & Sheet Tube"*, Price: ₹450, Category: *Calculators & Lab Equipment*, Condition: *Like New*, Pickup: *Drawing Hall 2 Entrance*.
   - Upload an image or paste a photo link.
   - Publish and review the public page.
   - Go to **My Listings**, toggle status to **Sold**, verify the "SOLD OUT" badge.
5. **Buyer–Seller In-App Messaging**:
   - Log in as a different student (e.g., Priya Patel using the 1-click button).
   - Open Aarav's Mathematics textbook listing.
   - Click **Contact Seller & Chat**.
   - Send a message: *"Hi Aarav, can we meet near Central Library steps at 4 PM?"*.
   - In another browser tab/window, log in as Aarav Sharma and see the incoming message in `/messages`.
6. **Report a Listing**:
   - On any item, click **Report Item**.
   - Select reason *"Misleading Information"*, type an explanation, and submit.
   - Log in as **Admin Moderator** (`admin@campusx.edu`) and visit `/admin/reports` to inspect and moderate.

---

## 11. Production Deployment Guide

### Frontend Deployment (Vercel)
1. Push code to GitHub.
2. Import project in Vercel. Set root directory to `frontend`.
3. Add environment variable:
   - `VITE_API_URL`: Your deployed Render backend URL (e.g. `https://campusx-api.onrender.com/api`).
4. Build command: `npm run build`, Output directory: `dist`.

### Backend Deployment (Render)
1. In Render, create a **Web Service** with root directory `backend`.
2. Build command: `npm install`, Start command: `npm start`.
3. Add environment variables:
   - `NODE_ENV`: `production`
   - `PORT`: `5000`
   - `CLIENT_URL`: Your Vercel frontend URL (e.g. `https://campusx-student.vercel.app`)
   - `MONGODB_URI`: Your MongoDB Atlas connection string (`mongodb+srv://...`)
   - `JWT_SECRET`: A high-entropy random secret key
   - `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`: (If using Cloudinary)

---

## 12. Known Limitations & Future Enhancements

- **Email Domain Verification**: While college domain checks are enforced when configured via `ALLOWED_EMAIL_DOMAINS`, true email delivery verification (OTP / magic link) requires a live SMTP service (e.g. SendGrid / AWS SES).
- **Messaging Architecture**: The current version uses reliable, lightweight interval auto-polling (4s) for student conversations; full WebSockets (Socket.io) can be attached for zero-latency messaging in v2.
- **In-App Payments**: Transactions are designed for in-person campus handover via UPI or cash; escrow payment integration (e.g., Razorpay) could be added in future iterations.

---

*Submitted for End-Term Full-Stack Software Engineering Evaluation • CampusX Team*

