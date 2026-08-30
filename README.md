# 🛒 Cara E-Commerce — Full Stack Enterprise Platform

A modern, production-grade, full-stack E-Commerce ecosystem built with **ASP.NET Core 10 Web API** on the backend and **Next.js 16 (React 19) + TypeScript** on the frontend. Engineered with clean architecture, enterprise security patterns, automated accounting, and real-time operational workflows.

---

## 📑 Table of Contents
1. [Tech Stack, Tools & Packages](#-tech-stack-tools--packages)
2. [Project & File Structure](#-project--file-structure)
3. [Core Functionalities & Domain Modules](#-core-functionalities--domain-modules)
4. [System Workflows & Architecture](#-system-workflows--architecture)
5. [API Endpoints Matrix](#-api-endpoints-matrix)
6. [Security & Middleware Pipeline](#-security--middleware-pipeline)
7. [Installation & Local Setup](#-installation--local-setup)

---

## 🛠️ Tech Stack, Tools & Packages

### Backend (.NET 10 Web API)
* **Framework:** ASP.NET Core 10.0 (`net10.0`)
* **Language:** C# 13 (Nullable reference types, Implicit Usings)
* **Database & ORM:** SQL Server / LocalDB, Entity Framework Core 10 (`Microsoft.EntityFrameworkCore.SqlServer`, `Design`, `Tools`)
* **Security & Auth:** JWT Bearer (`Microsoft.AspNetCore.Authentication.JwtBearer`), BCrypt Hashing (`BCrypt.Net-Next`), Google OAuth 2.0 (`Google.Apis.Auth`)
* **Media & Cloud Storage:** Cloudinary .NET SDK (`CloudinaryDotNet`) for image transformations and uploads
* **Communication & Mailing:** MailKit & MimeKit (SMTP Gmail Integration)
* **Logging & Observability:** Serilog (`Serilog.AspNetCore`, `Serilog.Sinks.Console`, `Serilog.Sinks.File`)
* **API Documentation:** Swagger / OpenAPI Integration

### Frontend (Next.js 16 + React 19)
* **Framework:** Next.js 16 (App Router architecture)
* **UI Library:** React 19 (`react`, `react-dom`)
* **Language:** TypeScript 5
* **State Management:** Redux Toolkit (`@reduxjs/toolkit`, `react-redux`)
* **Authentication:** `@react-oauth/google` with HttpOnly Cookie Token Rotation
* **Styling:** Modern Vanilla CSS + TailwindCSS v4 + Glassmorphism Design System

---

## 📂 Project & File Structure

```
Ecommerce(Full Stack)/
├── ecommerce-backend/                     # ASP.NET Core 10 Web API (Clean Architecture)
│   ├── Controllers/                       # 16 RESTful API Controllers
│   │   ├── AddressController.cs           # Customer Address Book Management
│   │   ├── AnalyticsController.cs         # Real-time Accounting & Financial Reports
│   │   ├── AuthController.cs              # Registration, Login, Refresh, Google OAuth
│   │   ├── BlogController.cs              # Public & Admin Blog Engine
│   │   ├── BrandController.cs             # Brand CRUD & Slug Operations
│   │   ├── CartController.cs              # Cart State & Item Modifications
│   │   ├── CategoryController.cs          # Category Hierarchy & SEO Slugs
│   │   ├── InventoryController.cs         # Stock Auditing & Restocking
│   │   ├── NotificationController.cs      # User Alerts & Admin Actionable To-Dos
│   │   ├── OrderController.cs             # Checkout, Lifecycle & Cancellation
│   │   ├── PaymentController.cs           # Multi-Method Payment Gateways
│   │   ├── ProductController.cs           # Catalog & Cloudinary Media Uploads
│   │   ├── ReturnRefundController.cs      # Returns Submission & Admin Resolution
│   │   ├── ReviewController.cs            # Verified Purchase Reviews & Ratings
│   │   ├── UserController.cs              # Profile Management & Admin User Directory
│   │   └── WishlistController.cs          # Customer Wishlist Toggle & Retrieval
│   ├── Data/                              # AppDbContext, Seeders & EF Migrations
│   ├── Dtos/                              # Request/Response Data Transfer Objects
│   ├── Middlewares/                       # 16-Layer Middleware Defense Pipeline
│   ├── Models/                            # Domain Entities (Order, Product, InventoryLog, etc.)
│   ├── Repositories/                      # Data Access Layer (Interfaces & Implementations)
│   ├── Services/                          # Business Logic & Orchestration Layer
│   ├── appsettings.json                   # App Settings & DB Connection Configuration
│   └── Program.cs                         # Dependency Injection & Middleware Pipeline
│
└── ecommerce-frontend/                    # Next.js 16 App Router (TypeScript)
    ├── src/app/
    │   ├── admin/                         # Admin Management Suite
    │   │   ├── analytics/                 # Financial KPI Dashboard & Expenses
    │   │   ├── blogs/                     # Article Composer & Publishing Studio
    │   │   ├── brands/                    # Brand Management
    │   │   ├── categories/                # Category Management
    │   │   ├── inventory/                 # Stock Management & Audit Trail Logs
    │   │   ├── orders/                    # Order Fulfillment & Status Dispatch
    │   │   ├── products/                  # Product Catalog Management
    │   │   ├── returns/                   # Return & Refund Verification Queue
    │   │   ├── settings/                  # Store Settings & Preferences
    │   │   └── users/                     # Registered User & Role Directory
    │   ├── Components/                    # Modular Reusable UI Components
    │   │   ├── Admin/                     # Admin Sidebar, Header & Guards
    │   │   ├── Auth/                      # Login, Register & OAuth Modals
    │   │   ├── Layout/                    # Main Header, Navbar, Footer, Breadcrumbs
    │   │   ├── Products/                  # Product Cards, Quick View, Modals
    │   │   ├── Payment/                   # Multi-Method Checkout Form & Summaries
    │   │   ├── cart/                      # Cart Drawer & Calculation Tables
    │   │   ├── Wishlist/                  # Wishlist Grid & Sync Badges
    │   │   ├── Blogs/                     # Blog Feed & Reader Components
    │   │   └── Notification/              # Real-Time Notification Bell & Dropdowns
    │   ├── libs/                          # Strongly-Typed HTTP API Clients
    │   ├── redux/                         # Redux Store & Feature Slices
    │   ├── types/                         # TypeScript Domain & DTO Contracts
    │   ├── shop/                          # Storefront Catalog with Multi-Filters
    │   ├── cart/                          # Dynamic Shopping Cart Page
    │   ├── checkout/                      # Address Selection & Order Placement
    │   ├── payment/                       # Payment Gateway Selection
    │   ├── orders/                        # Customer Order History & Return Filing
    │   ├── wishlist/                      # Customer Wishlist Portal
    │   ├── profile/                       # Pakistani Phone Validator & Addresses
    │   ├── blogs/                         # Knowledge Base & Public Articles
    │   ├── login/ & register/             # Standalone Authentication Pages
    │   └── globals.css                    # Unified Design System & Styling
    ├── .env.local                         # Frontend Environment Configurations
    └── package.json                       # Dependencies & NPM Scripts
```

---

## ⚡ Core Functionalities & Domain Modules

### 1. Storefront & Catalog Management
* **Dynamic Product Catalog:** Filter by categories, brands, price ranges, search keywords, and stock availability.
* **Cloudinary Media Engine:** Direct high-speed asset uploads with automated image optimization.
* **SEO Slug Generator:** Automatic URL-friendly slugs for categories, brands, and articles.

### 2. Shopping Cart & Wishlist System
* **Persistent Cart State:** Real-time stock validation, quantity modifiers, and guest-to-authenticated cart merging.
* **Wishlist Synchronization:** Instant add/remove toggles with live header counter badges.

### 3. Checkout & Multi-Channel Payments
* **Address Book:** Supports `Home`, `Office`, and `Other` address classifications with default selection.
* **4 Supported Payment Methods:**
  1. 💵 **Cash On Delivery (COD):** Marked as `Pending COD` until dispatch.
  2. 💳 **Credit / Debit Card:** Form verification with live card masking and validation.
  3. 📱 **JazzCash:** Direct mobile account number entry with MPIN authorization prompt.
  4. 👛 **EasyPaisa:** Seamless wallet authorization and instant checkout verification.

### 4. Inventory Management & Immutable Audit Trail
* **Stock Delta Tracking:** Logs every stock fluctuation with specific audit types (`InitialStock`, `Restock`, `SaleDeduction`, `ReturnRestock`, `DamagedDiscard`, `ManualAdjustment`).
* **Admin Warehouse Dashboard:** Real-time metrics for total warehouse units, low-stock (`<= 5`), and out-of-stock items (`0`).

### 5. Returns & Refunds Lifecycle
* **Customer Return Submissions:** Direct return requests from order history with proof image upload and refund reason.
* **Admin Inspection Queue:** Approve, reject, adjust refund amounts, write resolution notes, and process payout settlements.

### 6. Verified Customer Reviews
* **Purchase-Gated Reviews:** Restricts reviews strictly to customers with completed purchases.
* **Photo Attachments & Ratings:** Star ratings (1-5), verified purchase badges, review photo attachments, and aggregate ratings breakdown.

### 7. Content Management & Blog Engine
* **Blog Studio:** Markdown/WYSIWYG article creator with Cloudinary cover uploads, reading time estimator, and draft/published status toggle.
* **Public Blog Hub:** Search, category tags, and responsive reading view.

### 8. Financial Analytics & Accounting Engine
* **Source-Calculated Ledger (No blind hardcoding):**
  * `Net Revenue = Gross Sales - Discounts - Refunds`
  * `Gross Profit = Net Revenue - COGS (Cost of Goods Sold)`
  * `Net Profit = Gross Profit - Damaged Stock Loss - Operating Expenses`
* **Expense Logging:** Track marketing campaigns (Meta/Google Ads), courier shipping charges, SaaS tools, packaging, and rent.

### 9. Actionable To-Dos & Live Notifications
* **Customer Notifications:** Real-time alerts for order confirmations, dispatch updates, and return approvals.
* **Admin Operational To-Dos:** Header alerts for low/out-of-stock items, pending fulfillment orders, incoming return requests, and new reviews.

### 10. User Profile & Pakistani Validation Standards
* **Pakistani Mobile Format:** Strict `03XX-XXXXXXX` 11-digit regex validation and live format masking.
* **Account Security & Danger Zone:** Password updates, address management, and safe account deletion.

---

## 🔄 System Workflows & Architecture

```
                  ┌──────────────────────────────────────────┐
                  │          Storefront / Customer           │
                  └────────────────────┬─────────────────────┘
                                       │ (Place Order)
                                       ▼
                  ┌──────────────────────────────────────────┐
                  │         Checkout & Payment Gate          │
                  │   (COD / Card / JazzCash / EasyPaisa)    │
                  └────────────────────┬─────────────────────┘
                                       │
            ┌──────────────────────────┴──────────────────────────┐
            ▼                                                     ▼
┌───────────────────────────────┐             ┌───────────────────────────────┐
│     Inventory Stock Engine    │             │   Admin Operational Center    │
│  - Decrement Catalog Stock    │             │  - Real-time Order Alert      │
│  - Create Audit Log (Sale)    │ ──────────► │  - Low-Stock Notification     │
│  - Update Asset Valuation     │             │  - Package & Dispatch Flow    │
└───────────────────────────────┘             └───────────────────────────────┘
            │                                                     │
            ▼                                                     ▼
┌───────────────────────────────┐             ┌───────────────────────────────┐
│   After-Sales & Accounting    │             │       Customer Tracking       │
│  - Verified Purchase Reviews  │ ◄────────── │  - Live Order Status Timeline │
│  - Return / Refund Handling   │             │  - Return Request Submissions │
│  - Net Profit & Expense Calc  │             │  - Unread Notification Badge  │
└───────────────────────────────┘             └───────────────────────────────┘
```

---

## 🌐 API Endpoints Matrix

| Controller | Method | Endpoint | Access | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| **Auth** | `POST` | `/api/auth/register` | Public | Register new customer account |
| | `POST` | `/api/auth/login` | Public | Email/Password login (issues JWT + cookie) |
| | `POST` | `/api/auth/google-login` | Public | Google OAuth 2.0 authentication |
| | `POST` | `/api/auth/refresh-token` | Public | Token rotation via HttpOnly cookie |
| | `POST` | `/api/auth/logout` | Public | Invalidate refresh token & clear cookies |
| **User** | `GET` | `/api/user/profile` | User | Get current user profile |
| | `PUT` | `/api/user/profile` | User | Update personal details & phone |
| | `DELETE`| `/api/user/profile` | User | Delete personal account |
| | `GET` | `/api/user/admin/all` | Admin | Get full platform user directory |
| **Product** | `GET` | `/api/product` | Public | Paginated product list with multi-filters |
| | `GET` | `/api/product/{id}` | Public | Single product details |
| | `POST` | `/api/product/upload-image`| Admin | Upload product media to Cloudinary |
| | `POST` | `/api/product` | Admin | Create product listing |
| | `PUT` | `/api/product/{id}` | Admin | Modify product listing |
| | `DELETE`| `/api/product/{id}` | Admin | Delete product listing |
| **Category & Brand** | `GET` | `/api/category`, `/api/brand` | Public | List categories / brands |
| | `POST` | `/api/category`, `/api/brand` | Admin | Create category / brand with slug |
| | `PUT` | `/api/category/{id}`, `/api/brand/{id}` | Admin | Edit category / brand |
| | `DELETE`| `/api/category/{id}`, `/api/brand/{id}` | Admin | Remove category / brand |
| **Cart & Wishlist** | `GET` | `/api/cart`, `/api/wishlist` | User | Retrieve current user cart / wishlist |
| | `POST` | `/api/cart/items` | User | Add item to cart with quantity |
| | `POST` | `/api/wishlist/toggle` | User | Toggle product in wishlist |
| | `PUT` | `/api/cart/items/{productId}` | User | Update cart item quantity |
| | `DELETE`| `/api/cart/items/{productId}` | User | Remove item from cart |
| **Order & Payment** | `POST` | `/api/order` | User | Convert cart into order & deduct stock |
| | `GET` | `/api/order/my`, `/api/order/{id}` | User | Customer order history & tracking |
| | `POST` | `/api/order/{id}/cancel` | User | Cancel order & restore inventory |
| | `GET` | `/api/order/admin/all` | Admin | Full order fulfillment pipeline |
| | `PUT` | `/api/order/admin/{id}/status` | Admin | Advance order status (`Shipped`, `Delivered`) |
| | `POST` | `/api/payment/process` | User | Process & verify payment gateway transactions |
| **Inventory** | `GET` | `/api/inventory/summary` | Admin | Warehouse KPI summary cards |
| | `GET` | `/api/inventory/all` | Admin | Full product stock table |
| | `POST` | `/api/inventory/adjust` | Admin | Restock, damage write-off & adjustments |
| | `GET` | `/api/inventory/logs/{productId}` | Admin | Complete immutable audit trail per SKU |
| **Reviews** | `GET` | `/api/review/product/{productId}` | Public | Get product reviews & ratings breakdown |
| | `POST` | `/api/review/create` | User | Submit verified purchase review with photo |
| | `GET` | `/api/review/can-review/{productId}` | User | Check purchase eligibility for review |
| **Returns** | `POST` | `/api/returnrefund/request` | User | Submit return/refund claim with photo proof |
| | `GET` | `/api/returnrefund/my` | User | Customer return status tracking |
| | `GET` | `/api/returnrefund/admin/all` | Admin | Review pending customer return claims |
| | `PUT` | `/api/returnrefund/admin/{id}/status` | Admin | Approve / Reject / Settle refund |
| **Blogs** | `GET` | `/api/blog`, `/api/blog/{idOrSlug}` | Public | Public articles feed & article view |
| | `POST` | `/api/blog/admin/create` | Admin | Compose & publish article |
| | `PUT` | `/api/blog/admin/{id}/toggle-publish` | Admin | Toggle draft / published status |
| **Analytics** | `GET` | `/api/analytics/report` | Admin | Dynamic financial ledger & KPI metrics |
| | `GET` | `/api/analytics/expenses` | Admin | Operating expense records |
| | `POST` | `/api/analytics/expenses/add` | Admin | Record operating expense (ads, rent, shipping) |
| **Notifications** | `GET` | `/api/notification/my` | User | Customer order & refund notifications |
| | `GET` | `/api/notification/admin` | Admin | Actionable To-Do queue for administrators |
| | `PUT` | `/api/notification/{id}/read` | User/Admin| Mark notification as read |

---

## 🛡️ Security & Middleware Pipeline

The backend implements an enterprise **16-layer middleware architecture**:
1. **`ExceptionHandlingMiddleware`:** Catches all unhandled exceptions and formats responses into standard `ApiResponse<T>` schemas.
2. **`CorrelationIdMiddleware`:** Generates and propagates `X-Correlation-ID` headers across all logs and responses.
3. **`SecurityHeadersMiddleware`:** Enforces `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `X-XSS-Protection: 1; mode=block`, and Referrer policies.
4. **`RequestLoggingMiddleware`:** Structured telemetry logging capturing execution durations, HTTP methods, route paths, and user identities via Serilog.
5. **`ResponseCompression`:** Dual Brotli and Gzip payload compression for low-latency responses.
6. **`CORS Policy ("AllowFrontend")`:** Strict domain origin binding to `http://localhost:3000` with credential support.
7. **`RateLimiting`:** Sliding window rate limiter to safeguard sensitive endpoints against brute force and denial-of-service attempts.
8. **`JWT Authentication & RBAC`:** Role-based claims verification (`Customer`, `Admin`) across controllers and API actions.

---

## 🚀 Installation & Local Setup

### Prerequisites
* [.NET 10 SDK](https://dotnet.microsoft.com/download)
* [Node.js 18+](https://nodejs.org/) & `npm`
* SQL Server or LocalDB instance

---

### 1. Backend Setup (.NET 10 Web API)

```bash
# 1. Navigate to backend directory
cd ecommerce-backend

# 2. Restore NuGet dependencies
dotnet restore

# 3. Apply Entity Framework database migrations
dotnet ef database update

# 4. Launch backend server
dotnet run
```

* 🌐 **API Base URL:** `http://localhost:5024`
* 📖 **Interactive Swagger Docs:** `http://localhost:5024/swagger`

---

### 2. Frontend Setup (Next.js 16 App Router)

```bash
# 1. Navigate to frontend directory
cd ecommerce-frontend

# 2. Install Node dependencies
npm install

# 3. Start development server
npm run dev
```

* 🛍️ **Storefront & Catalog:** `http://localhost:3000`
* 🛒 **Shopping Cart & Checkout:** `http://localhost:3000/cart`
* 📦 **Order Tracking & History:** `http://localhost:3000/orders`
* 📰 **Blog Hub & Knowledge Base:** `http://localhost:3000/blogs`
* 📊 **Admin Dashboard & Analytics:** `http://localhost:3000/admin/products`

---

## 📊 Quality & Production Checklist

- [x] **Enterprise Role-Based Access Control (RBAC):** Admin endpoints secured via JWT `ClaimTypes.Role`.
- [x] **Financial Accounting:** Dynamic ledger computing Net Revenue, COGS, Gross/Net Profit, and Damaged Loss.
- [x] **Inventory Control:** Real-time stock decrements, low-stock warnings, and immutable audit logging.
- [x] **Regional Validation:** 11-digit Pakistani phone formatting (`03XX-XXXXXXX`).
- [x] **Multi-Channel Payments:** Support for COD, Card, JazzCash, and EasyPaisa.
- [x] **After-Sales Ecosystem:** Return & refund claims with image proof and resolution notes.
- [x] **Content Management:** Blog engine with slug routing and publication workflow.
- [x] **Real-Time Notifications:** Live customer alerts and admin actionable To-Dos.
