# 🛒 E-Commerce Full Stack Web Application

A modern, production-grade, enterprise-ready Full Stack E-Commerce platform built using **ASP.NET Core 10 Web API** on the backend and **Next.js 15 (React 19) + TypeScript** on the frontend.

---

## 🏗️ Architecture Overview

```
Ecommerce(Full Stack)/
├── ecommerce-backend/              # ASP.NET Core 10 Web API (Clean Architecture)
│   ├── Controllers/               # API Endpoints (Auth, User, Product, Category, Brand, Cart, Order, Address, Payment)
│   ├── Data/                      # AppDbContext, Migrations & DbSeeder
│   ├── Dtos/                      # Data Transfer Objects & Request Validators
│   ├── Middlewares/               # 16-Layer Middleware Pipeline (Exceptions, Security, Logging)
│   ├── Models/                    # Domain Entities (User, Product, Category, Brand, Cart, Order, Address)
│   ├── Repositories/              # Data Access Layer (EF Core abstraction)
│   └── Services/                  # Business Logic, Payment, Orders, Cart, Media Engine
│
└── ecommerce-frontend/             # Next.js 15 App Router (TypeScript + Modern CSS)
    ├── src/app/
    │   ├── admin/                 # Admin Dashboard Pages (Products, Categories, Brands, Orders)
    │   ├── Components/
    │   │   ├── Admin/             # Admin Sidebar Layout & Route Protection (AdminGuard)
    │   │   ├── Auth/              # Login, Register, OAuth Modals
    │   │   ├── Layout/            # Main Navbar, Footer, Breadcrumbs
    │   │   ├── Products/          # Product Grids, Cards, Quick View
    │   │   ├── Payment/           # Modular Payment Components (PaymentForm, OrderSummary, PaymnetMethos, PaymentDetails)
    │   │   ├── cart/              # Cart Tables, Summaries, Coupon Section
    │   │   └── Wishlist/          # Wishlist Container, Item Cards, Toast Badge
    │   ├── libs/                  # API Clients (Auth, Product, Category, Brand, Cart, Order, Address, User)
    │   ├── redux/                 # Redux Toolkit (Auth, Product, Cart, Wishlist, Order Slices)
    │   ├── types/                 # TypeScript Contract Definitions
    │   ├── shop/                  # Public Product Catalog & Dynamic Filtering
    │   ├── profile/               # User Settings, Address Management & Danger Zone
    │   ├── cart/                  # Shopping Cart State & Calculations
    │   ├── payment/               # Checkout & Multi-Method Payment Page
    │   ├── orders/                # Customer Order History & Tracking
    │   └── wishlist/              # Wishlist Collection & Toast Alerts
```

---

## 🛠️ Tech Stack

| Domain | Technologies |
| :--- | :--- |
| **Backend** | ASP.NET Core 10 Web API, C#, Entity Framework Core, SQL Server / LocalDB |
| **Security & RBAC** | JWT Bearer (`Role` Claims), HttpOnly Cookies, Google OAuth 2.0 (`Google.Apis.Auth`), BCrypt Hashing |
| **Media / CDN** | Cloudinary .NET SDK (`IPhotoService`) for cloud image optimization |
| **Email Service** | MailKit, MimeKit (SMTP Gmail Integration) |
| **Frontend** | Next.js 15 (App Router), React 19, TypeScript, Vanilla CSS / Custom Modular Design |
| **State Management**| Redux Toolkit (`authSlice`, `productSlice`, `cartSlice`, `wishlistSlice`, `orderSlice`) |
| **Client Auth** | `@react-oauth/google`, Silent Auto-Refresh HTTP Interceptor, Route Guards |

---

# 📦 1. Core Domain Features & Functionalities

```
                     ┌────────────────────────────────────────────────────────┐
                     │              Full E-Commerce User Journey              │
                     └───────────────────────────┬────────────────────────────┘
                                                 │
      ┌────────────────────┬─────────────────────┼────────────────────┬────────────────────┐
      ▼                    ▼                     ▼                    ▼                    ▼
┌───────────┐        ┌───────────┐         ┌───────────┐        ┌───────────┐        ┌───────────┐
│  Catalog  │  ───►  │   Cart    │  ───►   │ Addresses │  ───►  │  Payment  │  ───►  │  Orders   │
│ & Brands  │        │  Sync DB  │         │ (Home/Off)│        │ Multi-Pay │        │ Lifecycle │
└───────────┘        └───────────┘         └───────────┘        └───────────┘        └───────────┘
```

---

## 🏷️ 1.1 Brand Management
* **Domain Model (`Brand.cs`):** Contains `Id`, `Name`, `Slug`, `LogoUrl`, `Description`, `IsActive`, and `CreatedAt`.
* **Business Logic (`BrandService.cs`):**
  * Automatic URL slug formatting from brand names (e.g., `"Nike Sportswear"` ➔ `"nike-sportswear"`).
  * Unique brand name validation and entity lifecycle handling.
* **Admin Control Plane (`/admin/brands`):**
  * Live CRUD dashboard for brand partners with direct logo image uploads and active status toggles.

---

## 🛒 1.2 Cart & CartItems System
* **Domain Models (`Cart.cs`, `CartItem.cs`):**
  * `Cart`: Belongs to a specific `UserId`, has timestamps, and navigation collection of `CartItem`.
  * `CartItem`: Links `CartId`, `ProductId`, `Quantity`, and navigation to `Product`.
* **Business Logic (`CartService.cs`):**
  * **Database Cart Sync:** Automatically creates or retrieves a user's persistent cart upon authentication.
  * **Stock Validation:** Checks real-time `Product.StockQuantity` before adding or incrementing item quantities.
  * **Item Manipulation:** Supports `AddToCart`, `UpdateQuantity`, `RemoveItem`, and `ClearCart`.
* **Frontend Sync (`cartSlice.ts` & `cartApi.ts`):**
  * Client-side Redux store + `localStorage` fallback for guest users with seamless database syncing on login and checkout.

---

## 📦 1.3 Order & OrderItems Architecture
* **Domain Models (`Order.cs`, `OrderItem.cs`):**
  * `Order`: Tracks `UserId`, `TotalAmount`, `ShippingFee`, `Discount`, `FinalAmount`, `Status` (Enum), `ShippingAddress`, `City`, `PostalCode`, `Country`, `PhoneNumber`, `PaymentMethod`, `IsPaid`, `PaidAt`, `CreatedAt`, and `DeliveredAt`.
  * `OrderStatus` Enum: `Pending`, `Confirmed`, `Processing`, `Shipped`, `Delivered`, `Cancelled`, `Refunded`.
  * `OrderItem`: Historical snapshot of `ProductId`, `ProductTitle`, `ProductImage`, `UnitPrice`, and `Quantity` at the exact time of purchase.
* **Business Logic (`OrderService.cs`):**
  * **Atomic Checkout Transaction:** Converts the user's active DB cart into an `Order`, calculates shipping rules (e.g. Free Shipping above Rs. 2,000), decrements inventory stock in real-time, and clears the user's cart.
  * **Order Cancellation & Stock Restoration:** If a pending order is cancelled by the user, the exact purchased quantities are safely restored back to the product catalog inventory.
  * **Admin Order Fulfillment:** Administrative endpoints to update order lifecycle statuses (`Pending` ➔ `Confirmed` ➔ `Shipped` ➔ `Delivered`).

---

## 🏠 1.4 Address Management System
* **Domain Model (`Address.cs`):**
  * Fields: `Id`, `UserId`, `FullName`, `PhoneNumber`, `StreetAddress`, `City`, `State`, `PostalCode`, `Country`, `AddressType` (`"Home"`, `"Office"`, `"Other"`), `IsDefault`, and audit timestamps.
* **Business Logic (`AddressService.cs`):**
  * Allows customers to save and manage multiple delivery locations.
  * Ensures that only one address per user is marked as `IsDefault = true` at any given time.
  * Deleting a default address automatically promotes the next available saved address.
* **Frontend Integration (`ProfileDashboard.tsx` & `addressApi.ts`):**
  * **Profile Dashboard:** Interactive Saved Addresses management tab with Add/Edit modal, type badges (`🏠 Home`, `🏢 Office`), default indicators, and delete controls.
  * **1-Click Checkout Selector:** Checkout page displays saved address cards, pre-selecting the default address for fast auto-filled order placement.

---

## 💳 1.5 Payment Processing System
* **DTOs & Logic (`PaymentDto.cs`, `PaymentService.cs`, `PaymentController.cs`):**
  * Supports multiple payment channels:
    1. 💵 **Cash On Delivery (COD):** Marked as `Pending COD` until package delivery.
    2. 💳 **Credit / Debit Card:** Processes Cardholder details, Card Number, Expiry, and CVV/CVC.
    3. 📱 **JazzCash Mobile Wallet:** Direct payment through registered JazzCash mobile numbers with MPIN prompt.
    4. 👛 **EasyPaisa Mobile Wallet:** Instant payment authorization via EasyPaisa mobile account.
  * Updates order entity to `IsPaid = true`, logs `PaidAt` timestamp, and issues a unique transaction reference code (`TXN-XXXXXXXX`).
* **Frontend Components (`src/app/Components/Payment/`):**
  * `PaymnetMethos.tsx`: Interactive payment option cards with icons and active states.
  * `PaymentDetails.tsx`: Dynamic form inputs that adapt based on the selected payment method.
  * `OrderSummary.tsx`: Live pricing breakdown with Free Shipping calculator and Trust badges.
  * `PaymentForm.tsx`: Assembles delivery addresses, payment selectors, and order submission.

---

# 🌐 2. Comprehensive API Endpoints Matrix

| Controller | Method | Endpoint | Authorization | Description |
| :--- | :--- | :--- | :--- | :--- |
| **Auth** | `POST` | `/api/auth/register` | Public | Registers customer account |
| | `POST` | `/api/auth/login` | Public | Authenticates credentials & issues JWT |
| | `POST` | `/api/auth/google-login` | Public | Google OAuth verification |
| | `POST` | `/api/auth/refresh-token` | Public (Cookie) | Rotates access & refresh tokens |
| | `POST` | `/api/auth/logout` | Public | Clears authentication session |
| **Product** | `GET` | `/api/product` | Public | Search, filter, and paginated product list |
| | `GET` | `/api/product/{id}` | Public | Retrieves single product details |
| | `GET` | `/api/product/featured`| Public | Retrieves featured catalog items |
| | `POST`| `/api/product/upload-image`| `[Authorize(Roles="Admin")]` | Uploads image binary to Cloudinary |
| | `POST`| `/api/product` | `[Authorize(Roles="Admin")]` | Creates new catalog item |
| | `PUT` | `/api/product/{id}` | `[Authorize(Roles="Admin")]` | Updates existing product |
| | `DELETE`| `/api/product/{id}`| `[Authorize(Roles="Admin")]` | Removes product from catalog |
| **Category**| `GET` | `/api/category` | Public | Retrieves all active categories |
| | `GET` | `/api/category/{id}` | Public | Retrieves category by ID |
| | `POST`| `/api/category` | `[Authorize(Roles="Admin")]` | Creates category with auto-slug |
| | `PUT` | `/api/category/{id}`| `[Authorize(Roles="Admin")]` | Updates category metadata |
| | `DELETE`| `/api/category/{id}`| `[Authorize(Roles="Admin")]` | Deletes category |
| **Brand** | `GET` | `/api/brand` | Public | Retrieves all active brands |
| | `GET` | `/api/brand/{id}` | Public | Retrieves brand by ID |
| | `POST`| `/api/brand` | `[Authorize(Roles="Admin")]` | Creates new brand partner |
| | `PUT` | `/api/brand/{id}` | `[Authorize(Roles="Admin")]` | Updates brand details |
| | `DELETE`| `/api/brand/{id}` | `[Authorize(Roles="Admin")]` | Deletes brand |
| **Cart** | `GET` | `/api/cart` | `[Authorize]` | Gets current user's database cart |
| | `POST`| `/api/cart/items` | `[Authorize]` | Adds product to user cart |
| | `PUT` | `/api/cart/items/{productId}` | `[Authorize]` | Updates cart item quantity |
| | `DELETE`| `/api/cart/items/{productId}` | `[Authorize]` | Removes item from cart |
| | `DELETE`| `/api/cart/clear` | `[Authorize]` | Empties the entire user cart |
| **Order** | `POST`| `/api/order` | `[Authorize]` | Places order (Cart ➔ Order transition) |
| | `GET` | `/api/order/my` | `[Authorize]` | Retrieves logged-in user order history |
| | `GET` | `/api/order/{id}` | `[Authorize]` | Retrieves single order details |
| | `POST`| `/api/order/{id}/cancel` | `[Authorize]` | Cancels pending order & restores stock |
| | `GET` | `/api/order/admin/all` | `[Authorize(Roles="Admin")]` | Admin view of all customer orders |
| | `PUT` | `/api/order/admin/{id}/status` | `[Authorize(Roles="Admin")]` | Admin status update (Processing/Delivered)|
| **Address**| `GET` | `/api/address` | `[Authorize]` | Lists user's saved delivery addresses |
| | `GET` | `/api/address/{id}` | `[Authorize]` | Gets single saved address |
| | `POST`| `/api/address` | `[Authorize]` | Creates new delivery address |
| | `PUT` | `/api/address/{id}` | `[Authorize]` | Updates saved address |
| | `DELETE`| `/api/address/{id}` | `[Authorize]` | Deletes saved address |
| | `PUT` | `/api/address/{id}/set-default` | `[Authorize]` | Sets address as active default |
| **Payment**| `POST`| `/api/payment/process` | `[Authorize]` | Processes & verifies payment for order |
| | `GET` | `/api/payment/status/{orderId}` | `[Authorize]` | Checks payment verification status |

---

# 🛡️ 3. Security & Middleware Pipeline

The backend implements a **16-layer middleware architecture**:
1. **`ExceptionHandlingMiddleware`:** Global try-catch converting exceptions to standard `ApiResponse<T>` envelopes.
2. **`CorrelationIdMiddleware`:** `X-Correlation-ID` tracing header propagation.
3. **`SecurityHeadersMiddleware`:** `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `X-XSS-Protection`.
4. **`RequestLoggingMiddleware`:** Structured telemetry logging method, endpoint, user identity, and response times.
5. **`UseResponseCompression()`:** Brotli and Gzip payload compression.
6. **`UseCors("AllowFrontend")`:** Strict CORS binding to frontend domain with credential support.
7. **`UseRateLimiter()`:** Sliding window rate limiter to protect against brute-force attacks.
8. **`UseAuthentication()` & `UseAuthorization()`:** JWT Bearer & RBAC (`[Authorize(Roles = "Admin")]`).

---

# 🚀 4. How to Run Locally

### 1. Backend (.NET 10 Web API)
```bash
cd ecommerce-backend
dotnet restore
dotnet ef database update
dotnet run
```
* API Host: `http://localhost:5024`
* Swagger Documentation: `http://localhost:5024/swagger`

### 2. Frontend (Next.js 15 App Router)
```bash
cd ecommerce-frontend
npm install
npm run dev
```
* Storefront Application: `http://localhost:3000`
* Checkout / Payment: `http://localhost:3000/payment`
* Customer Profile & Addresses: `http://localhost:3000/profile`
* Admin Dashboard: `http://localhost:3000/admin/products`

---

## 🔒 Security & Quality Checklist

- [x] **Role-Based Access Control (RBAC):** Admin-only endpoints secured via JWT `ClaimTypes.Role`.
- [x] **Database Constraints & Precision:** Financial figures formatted with `decimal(18,2)` precision.
- [x] **Inventory Integrity:** Real-time stock validation and automatic rollback on order cancellation.
- [x] **Address Privacy:** User address CRUD isolated strictly to the authenticated `UserId`.
- [x] **Safe Account Operations:** Verification confirmation required for sensitive actions.
