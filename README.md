# 🛒 E-Commerce Full Stack Web Application

A modern, production-grade, enterprise-ready Full Stack E-Commerce platform built using **ASP.NET Core 10 Web API** on the backend and **Next.js 15 (React 19) + TypeScript** on the frontend.

---

## 🏗️ Architecture Overview

```
Ecommerce(Full Stack)/
├── ecommerce-backend/              # ASP.NET Core 10 Web API (Clean Architecture)
│   ├── Controllers/               # API Endpoints (Auth, User, Product, Category, Brand, Cart, Order, Address, Payment, Inventory, Review, ReturnRefund, Blog, Analytics, Notification)
│   ├── Data/                      # AppDbContext, Migrations & DbSeeder
│   ├── Dtos/                      # Data Transfer Objects & Request Validators
│   ├── Middlewares/               # 16-Layer Middleware Pipeline (Exceptions, Security, Logging, RateLimiting)
│   ├── Models/                    # Domain Entities (User, Product, Category, Brand, Cart, Order, Address, InventoryLog, Review, ReturnRequest, Blog, Expense, Notification)
│   ├── Repositories/              # Data Access Layer (Interfaces & EF Core Implementations)
│   └── Services/                  # Business Logic & Orchestration Engines
│
└── ecommerce-frontend/             # Next.js 15 App Router (TypeScript + Modern Vanilla CSS)
    ├── src/app/
    │   ├── admin/                 # Admin Dashboard (Products, Categories, Brands, Orders, Users, Inventory, Returns, Blogs, Analytics)
    │   ├── Components/
    │   │   ├── Admin/             # Admin Sidebar, Header Bar, Guards & Modals
    │   │   ├── Auth/              # Login, Register, Google OAuth Modals
    │   │   ├── Layout/            # Main Navbar, Footer, Breadcrumbs
    │   │   ├── Products/          # Product Grids, Cards, Quick View, Pagination
    │   │   ├── Payment/           # Modular Payment Components (PaymentForm, OrderSummary, PaymentMethods, PaymentDetails)
    │   │   ├── cart/              # Cart Tables, Summaries, Dynamic Sync
    │   │   ├── Wishlist/          # Wishlist Container, Item Cards, Toast Badges
    │   │   ├── Blogs/             # Blog Cards, Article Reader, Pagination
    │   │   └── Notification/      # Notification Dropdown & Live To-Do Engine
    │   ├── libs/                  # API Client Layer (Auth, Product, Category, Brand, Cart, Order, Address, User, Inventory, Review, ReturnRefund, Blog, Analytics, Notification)
    │   ├── redux/                 # Redux Toolkit Slices (auth, product, cart, wishlist, order, returnRefund, review)
    │   ├── types/                 # TypeScript Contract Definitions
    │   ├── shop/                  # Product Catalog, Sorting & Multi-faceted Filtering
    │   ├── profile/               # Customer Settings, Pakistani Phone Validator, Addresses & Danger Zone
    │   ├── cart/                  # Shopping Cart State & Real-time Calculations
    │   ├── payment/               # Multi-Method Checkout (COD, Card, JazzCash, EasyPaisa)
    │   ├── orders/                # Customer Order History, Tracking & Return/Refund Submissions
    │   ├── wishlist/              # Wishlist Collection & Dynamic Badges
    │   └── blogs/                 # Public Knowledge Base & Article Explorer
```

---

## 🛠️ Tech Stack

| Domain | Technologies |
| :--- | :--- |
| **Backend** | ASP.NET Core 10 Web API, C#, Entity Framework Core 10, SQL Server / LocalDB |
| **Security & RBAC** | JWT Bearer (`Role` Claims), HttpOnly Cookies, Google OAuth 2.0 (`Google.Apis.Auth`), BCrypt Hashing |
| **Media / CDN** | Cloudinary .NET SDK (`IPhotoService`) for cloud image uploads & transformations |
| **Email Service** | MailKit, MimeKit (SMTP Gmail Integration) |
| **Frontend** | Next.js 15 (App Router), React 19, TypeScript, Vanilla CSS / Custom Modern Design System |
| **State Management**| Redux Toolkit (`authSlice`, `productSlice`, `cartSlice`, `wishlistSlice`, `orderSlice`, `returnRefundSlice`, `reviewSlice`) |
| **Client Auth** | `@react-oauth/google`, Silent Auto-Refresh HTTP Interceptor, Route Guards (`AdminGuard`) |

---

# 📦 1. Core Domain Features & Modules

```
                     ┌────────────────────────────────────────────────────────┐
                     │              Full E-Commerce Ecosystem                 │
                     └───────────────────────────┬────────────────────────────┘
                                                 │
       ┌────────────────────┬────────────────────┼────────────────────┬────────────────────┐
       ▼                    ▼                    ▼                    ▼                    ▼
 ┌───────────┐        ┌───────────┐        ┌───────────┐        ┌───────────┐        ┌───────────┐
 │ Storefront│        │ Fulfillment│       │ After-Sale│        │ Analytics │        │Actionable │
 │& Catalog  │  ───►  │& Payments │ ───►   │ & Reviews │ ───►   │& Inventory│ ───►   │  To-Dos   │
 └───────────┘        └───────────┘        └───────────┘        └───────────┘        └───────────┘
```

---

## 🛍️ 1.1 Storefront & Catalog Management
* **Products (`Product.cs`):** Full CRUD with title, description, price, discounted price, category, brand, stock, SKU, Cloudinary image upload, and active state toggles.
* **Categories & Brands (`Category.cs`, `Brand.cs`):** Automatic SEO slug generation (e.g. `"Nike Sportswear"` ➔ `"nike-sportswear"`), logos, and filtered item relationships.
* **Shop Explorer (`/shop`, `/products`):** Multi-faceted search, price range filter, category/brand filters, and modern responsive pagination buttons.

---

## 🛒 1.2 Cart, Wishlist & Sync Engine
* **Persistent DB Cart (`Cart.cs`, `CartItem.cs`):** Real-time stock validation, guest-to-authenticated cart merging, item quantity modifiers, and subtotal calculation.
* **Wishlist System (`Wishlist.cs`, `WishlistItem.cs`):** Authenticated wishlist collection with database uniqueness constraints and header count indicators.

---

## 💳 1.3 Checkout & Multi-Channel Payment System
* **Saved Addresses (`Address.cs`):** Multiple address management (`Home`, `Office`, `Other`) with single-default address promotion.
* **Payment Processing (`PaymentService.cs`):**
  1. 💵 **Cash On Delivery (COD):** Marked as `Pending COD` until physical delivery.
  2. 💳 **Credit / Debit Card:** Form verification with live card masking and validation.
  3. 📱 **JazzCash Mobile Wallet:** Direct payment through registered JazzCash mobile numbers with MPIN prompt.
  4. 👛 **EasyPaisa Mobile Wallet:** Instant payment authorization via EasyPaisa mobile account.
* **Order Transition (`Order.cs`, `OrderItem.cs`):** Atomic checkout transaction converting active cart into orders, generating unique order reference numbers (`ORD-XXXXXXXX`), deducting stock, and calculating shipping rules.

---

## 📦 1.4 Inventory Management & Audit Trail Logging
* **Domain Model (`InventoryLog.cs`):** Tracks every stock delta with audit action types:
  - `InitialStock`, `Restock`, `SaleDeduction`, `ReturnRestock`, `DamagedDiscard`, `ManualAdjustment`.
  - Captures `PreviousStock`, `NewStock`, `QuantityChanged`, `Note`, and `CreatedAt`.
* **Admin Control Plane (`/admin/inventory`):**
  - KPI Cards: Total Products, In-Stock, Low Stock (`<= 5`), Out of Stock (`0`), and Total Units in warehouse.
  - Quick restock and manual adjustment modals with instant audit logging.
  - Complete historical audit trail drawer per product.

---

## ⭐ 1.5 Customer Reviews & Ratings System
* **Domain Model (`Review.cs`):** Captures `UserId`, `ProductId`, `OrderId`, `Rating` (1 to 5 stars), `Comment`, `ReviewImageUrl` (Cloudinary photo upload), and `IsVerifiedPurchase`.
* **Validation & Constraints:** Restrict cascade to eliminate SQL Server delete cycles; enforces verified purchase eligibility before review submission.
* **Interactive UI:** Aggregated average ratings, 5-star distribution breakdown bar, user review cards with images, and submission modal.

---

## 🔄 1.6 Returns & Refunds Lifecycle Engine
* **Domain Model (`ReturnRequest.cs`):** Captures `OrderId`, `UserId`, `Reason`, `Description`, `ProofImageUrl`, `RefundAmount`, `RefundMethod`, `Status` (`Pending`, `Approved`, `Rejected`, `Refunded`), `AdminNotes`, and `ResolvedAt`.
* **Customer Journey:** Initiates return request with reason and photo proof directly from the customer order history page (`/orders`).
* **Admin Management (`/admin/returns`):** Review incoming proof photos, approve or reject requests, adjust refund amounts, add admin resolution notes, and process payouts.

---

## 📰 1.7 Content Management & Blog Engine
* **Domain Model (`Blog.cs`):** Contains `Title`, `Slug`, `Excerpt`, `Content`, `CoverImageUrl`, `Author`, `Category`, `Tags`, `ReadTimeMinutes`, `IsPublished`, and audit timestamps.
* **Public Blog (`/blogs`, `/blogs/[id]`):** Article feed with search, category filtering, reading time estimates, related articles, and rich reading view.
* **Admin Blog Studio (`/admin/blogs`):** Full WYSIWYG/Markdown article composer, Cloudinary cover image uploader, tag selector, and draft/published toggle.

---

## 📊 1.8 Financial Analytics & Real-World Accounting Engine
* **Auditable Dynamic Source Calculation (No blind static tables):**
  - **Net Revenue:** `Gross Sales - Discounts - Processed Refunds`
  - **COGS (Cost of Goods Sold):** Direct capital invested in sold units.
  - **Gross Profit:** `Net Revenue - COGS`
  - **Damaged Stock Loss:** Aggregated financial write-offs from inventory audit logs.
  - **Operating Expenses (`Expense.cs`):** Marketing (Meta/Google Ads), Courier shipping charges, Software/Tools, Rent, and Packaging.
  - **Net Profit:** `Gross Profit - Damaged Loss - Operating Expenses`
  - **Inventory Asset Value:** Current total capital tied up in warehouse stock.
  - **Growth Tracking:** Month-over-Month (MoM) revenue growth % and daily timeline breakdown.
* **Admin Analytics Portal (`/admin/analytics`):** Real-time KPI summaries, visual revenue timeline graphs, expense logging modal, and category profitability distribution.

---

## 🔔 1.9 Actionable To-Dos & Live Notification Engine
* **Domain Model (`Notification.cs`):** Supports `UserId` (nullable for admin broadcasts), `Title`, `Message`, `Type` (`OrderPlaced`, `OrderShipped`, `OrderDelivered`, `AdminNewOrder`, `AdminLowStock`, `AdminReturnRequest`, `AdminNewReview`), `Priority`, `ActionUrl`, `IsRead`, `IsAdminNotification`, and `CreatedAt`.
* **Customer Notifications:** Matching teal badge counter left of Cart icon alerting users on order confirmation, package dispatch, and refund completion.
* **Admin Actionable To-Dos:** Top-header notification bell with automatic background sync alerting admins on:
  - 🚨 **Out of Stock (`0 units`)** and ⚠️ **Low Stock (`<= 5 units`)** warnings with direct restock links.
  - 🛍️ **New Orders** requiring packaging & fulfillment.
  - 🔄 **Incoming Return Requests** awaiting inspection.
  - ⭐ **New Product Reviews** submitted by customers.

---

## 👥 1.10 User Profile, Pakistani Phone Validation & Admin Directory
* **Customer Profile (`/profile`):**
  - **Pakistani Phone Validation:** Strict `03XX-XXXXXXX` 11-digit formatting, live digit counter, and submit validation.
  - **Saved Address Book:** Fast default address selector and address deletion safety.
  - **Account Danger Zone:** Secure account deletion with email confirmation check.
* **Admin User Directory (`/admin/users`):**
  - View all registered customers and administrators.
  - Metrics on total registrations, active customers, and admin accounts.
  - Live search by name/email, role filtering, and detailed profile viewer modal.

---

# 🌐 2. Comprehensive API Endpoints Matrix

| Domain / Controller | Method | Endpoint | Authorization | Description |
| :--- | :--- | :--- | :--- | :--- |
| **Auth** | `POST` | `/api/auth/register` | Public | Customer account registration |
| | `POST` | `/api/auth/login` | Public | Credentials authentication & JWT issue |
| | `POST` | `/api/auth/google-login` | Public | Google OAuth 2.0 verification |
| | `POST` | `/api/auth/refresh-token` | Public (Cookie) | Access & Refresh token rotation |
| | `POST` | `/api/auth/logout` | Public | Clears session & cookies |
| **User** | `GET` | `/api/user/profile` | `[Authorize]` | Logged-in user profile details |
| | `PUT` | `/api/user/profile` | `[Authorize]` | Updates profile information |
| | `DELETE`| `/api/user/profile` | `[Authorize]` | Deletes customer account |
| | `GET` | `/api/user/admin/all` | `[Authorize(Roles="Admin")]` | Lists all registered platform users |
| **Product** | `GET` | `/api/product` | Public | Paginated product catalog with filters |
| | `GET` | `/api/product/{id}` | Public | Single product details |
| | `POST`| `/api/product/upload-image`| `[Authorize(Roles="Admin")]` | Cloudinary image upload |
| | `POST`| `/api/product` | `[Authorize(Roles="Admin")]` | Creates catalog product |
| | `PUT` | `/api/product/{id}` | `[Authorize(Roles="Admin")]` | Updates product details |
| | `DELETE`| `/api/product/{id}`| `[Authorize(Roles="Admin")]` | Deletes product |
| **Category & Brand**| `GET` | `/api/category`, `/api/brand` | Public | List active categories & brands |
| | `POST`| `/api/category`, `/api/brand` | `[Authorize(Roles="Admin")]` | Create category / brand |
| | `PUT` | `/api/category/{id}`, `/api/brand/{id}` | `[Authorize(Roles="Admin")]` | Update category / brand |
| | `DELETE`| `/api/category/{id}`, `/api/brand/{id}` | `[Authorize(Roles="Admin")]` | Delete category / brand |
| **Cart & Wishlist** | `GET` | `/api/cart`, `/api/wishlist` | `[Authorize]` | Retrieve active user cart / wishlist |
| | `POST`| `/api/cart/items`, `/api/wishlist/toggle` | `[Authorize]` | Add to cart / toggle wishlist |
| | `PUT` | `/api/cart/items/{productId}` | `[Authorize]` | Modify cart item quantity |
| | `DELETE`| `/api/cart/items/{productId}`, `/api/cart/clear` | `[Authorize]` | Remove item / clear cart |
| **Order & Payment** | `POST`| `/api/order` | `[Authorize]` | Place order (Cart ➔ Order transition) |
| | `GET` | `/api/order/my`, `/api/order/{id}` | `[Authorize]` | Customer order history & tracking |
| | `POST`| `/api/order/{id}/cancel` | `[Authorize]` | Cancel order & restore catalog stock |
| | `GET` | `/api/order/admin/all` | `[Authorize(Roles="Admin")]` | Admin view of all customer orders |
| | `PUT` | `/api/order/admin/{id}/status` | `[Authorize(Roles="Admin")]` | Admin order lifecycle status update |
| | `POST`| `/api/payment/process` | `[Authorize]` | Process & verify multi-method payments |
| **Inventory** | `GET` | `/api/inventory/summary` | `[Authorize(Roles="Admin")]` | Warehouse summary KPIs |
| | `GET` | `/api/inventory/all` | `[Authorize(Roles="Admin")]` | Complete inventory stock table |
| | `POST`| `/api/inventory/adjust` | `[Authorize(Roles="Admin")]` | Stock adjustments with audit log |
| | `GET` | `/api/inventory/logs/{productId}` | `[Authorize(Roles="Admin")]` | Product-specific audit logs |
| **Reviews** | `GET` | `/api/review/product/{productId}` | Public | Reviews for specific product |
| | `POST`| `/api/review/create` | `[Authorize]` | Submit verified purchase review |
| | `GET` | `/api/review/can-review/{productId}` | `[Authorize]` | Check purchase review eligibility |
| **Returns / Refunds**| `POST`| `/api/returnrefund/request` | `[Authorize]` | Submit order return/refund request |
| | `GET` | `/api/returnrefund/my` | `[Authorize]` | Customer return request history |
| | `GET` | `/api/returnrefund/admin/all` | `[Authorize(Roles="Admin")]` | Admin return requests queue |
| | `PUT` | `/api/returnrefund/admin/{id}/status`| `[Authorize(Roles="Admin")]`| Approve/Reject/Refund return request |
| **Blog System** | `GET` | `/api/blog`, `/api/blog/{idOrSlug}` | Public | Public blog articles & detail |
| | `POST`| `/api/blog/admin/create` | `[Authorize(Roles="Admin")]` | Create article with Cloudinary cover |
| | `PUT` | `/api/blog/admin/{id}/toggle-publish` | `[Authorize(Roles="Admin")]` | Toggle draft / published status |
| **Analytics** | `GET` | `/api/analytics/report` | `[Authorize(Roles="Admin")]` | Real-time accounting & financial metrics |
| | `GET` | `/api/analytics/expenses` | `[Authorize(Roles="Admin")]` | Operating expenses list |
| | `POST`| `/api/analytics/expenses/add` | `[Authorize(Roles="Admin")]` | Log new operating expense |
| **Notifications** | `GET` | `/api/notification/my`, `/api/notification/unread-count` | `[Authorize]` | User alerts & unread counter |
| | `GET` | `/api/notification/admin`, `/api/notification/admin/unread-count` | `[Authorize(Roles="Admin")]` | Admin actionable To-Dos & count |
| | `PUT` | `/api/notification/{id}/read`, `/api/notification/mark-all-read` | `[Authorize]` | Mark single / all as read |

---

# 🛡️ 3. Security & Middleware Pipeline

The backend implements an enterprise **16-layer middleware architecture**:
1. **`ExceptionHandlingMiddleware`:** Global try-catch converting unhandled exceptions to standardized `ApiResponse<T>` payloads.
2. **`CorrelationIdMiddleware`:** `X-Correlation-ID` tracing header propagation for distributed request tracking.
3. **`SecurityHeadersMiddleware`:** `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `X-XSS-Protection: 1; mode=block`.
4. **`RequestLoggingMiddleware`:** Telemetry logging endpoint, HTTP verb, authenticated user identity, and response execution times.
5. **`UseResponseCompression()`:** Brotli and Gzip payload compression for optimal speed.
6. **`UseCors("AllowFrontend")`:** Strict CORS binding to frontend domain with credential support.
7. **`UseRateLimiter()`:** Sliding window rate limiter to protect against brute-force and DDoS attacks.
8. **`UseAuthentication()` & `UseAuthorization()`:** JWT Bearer tokens & Role-Based Access Control (`[Authorize(Roles = "Admin")]`).

---

# 🚀 4. How to Run Locally

### 1. Backend (.NET 10 Web API)
```bash
cd ecommerce-backend
dotnet restore
dotnet ef database update
dotnet run
```
* **API Host:** `http://localhost:5024`
* **Swagger API Docs:** `http://localhost:5024/swagger`

### 2. Frontend (Next.js 15 App Router)
```bash
cd ecommerce-frontend
npm install
npm run dev
```
* **Storefront:** `http://localhost:3000`
* **Shop Catalog:** `http://localhost:3000/shop`
* **Blog Studio & Reader:** `http://localhost:3000/blogs`
* **Customer Profile:** `http://localhost:3000/profile`
* **Admin Dashboard:** `http://localhost:3000/admin/products`
* **Admin Analytics:** `http://localhost:3000/admin/analytics`
* **Admin Inventory:** `http://localhost:3000/admin/inventory`
* **Admin Returns:** `http://localhost:3000/admin/returns`
* **Admin Users:** `http://localhost:3000/admin/users`

---

## 🔒 Quality & Production Checklist

- [x] **Role-Based Access Control (RBAC):** Admin endpoints secured via JWT `ClaimTypes.Role`.
- [x] **Financial Integrity:** Source-based accounting calculating real Gross/Net Profit, COGS, and losses.
- [x] **Inventory Tracking:** Real-time stock decrement, automated low/out-of-stock To-Dos, and full audit logs.
- [x] **Pakistani Standard Validation:** 11-digit phone number formatting (`03XX-XXXXXXX`).
- [x] **After-Sales Lifecycle:** Return & refund workflows with image uploads and admin resolution notes.
- [x] **Content Management:** Full-featured Blog engine with slug routing and publication workflows.
- [x] **Live Notifications:** Unread badge counters for customers and actionable To-Dos for store admins.
- [x] **Modern UI/UX:** Responsive pagination, toast feedback, modal drawers, and glassmorphism styling.
