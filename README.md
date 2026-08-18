# 🛒 E-Commerce Full Stack Web Application

A modern, production-grade, enterprise-ready Full Stack E-Commerce platform built using **ASP.NET Core 10 Web API** on the backend and **Next.js 15 (React 19) + TypeScript** on the frontend.

---

## 🏗️ Architecture Overview

```
Ecommerce(Full Stack)/
├── ecommerce-backend/              # ASP.NET Core 10 Web API (Clean Architecture)
│   ├── Controllers/               # API Endpoints (Auth, User Profile)
│   ├── Data/                      # AppDbContext & EF Core Configurations
│   ├── Dtos/                      # Data Transfer Objects with Data Annotations
│   ├── Migrations/                # EF Core Database Migrations
│   ├── Models/                    # Domain Entities (User)
│   ├── Repositories/              # Repository Layer (Data Access)
│   └── Services/                  # Business Logic Layer & Security Engines
│
└── ecommerce-frontend/             # Next.js 15 App Router (TypeScript + Tailwind/CSS)
    ├── src/app/
    │   ├── Components/            # Modular UI Components (Auth, Layout, Products, etc.)
    │   ├── libs/                  # API Clients & Auth Interceptors (authApi, userApi)
    │   ├── types/                 # TypeScript Interfaces & Models
    │   ├── login/                 # Login Page (Local + Google OAuth)
    │   ├── register/              # Register Page (Local + Google OAuth)
    │   ├── forgot-password/       # Password Reset Request Page
    │   ├── reset-password/        # Token-based Password Reset Page
    │   ├── profile/               # User Dashboard & Danger Zone Settings
    │   ├── shop/                  # Product Catalog & Filters
    │   ├── cart/                  # Shopping Cart Management
    │   ├── wishlist/              # Wishlist Storage
    │   └── payment/               # Checkout & Payment Page
```

---

## 🛠️ Tech Stack

| Domain | Technologies |
| :--- | :--- |
| **Backend** | ASP.NET Core 10 Web API, C#, Entity Framework Core, SQL Server / LocalDB |
| **Security & Auth** | JWT Bearer, HttpOnly Cookies, Google OAuth 2.0 (`Google.Apis.Auth`), BCrypt / PBKDF2 Password Hashing |
| **Email Service** | MailKit, MimeKit (SMTP Gmail Integration) |
| **Frontend** | Next.js 15 (App Router), React 19, TypeScript, Vanilla CSS / Tailwind CSS |
| **Client Auth** | `@react-oauth/google`, Silent Auto-Refresh HTTP Interceptor |

---

# 📦 1. Backend Features & Implementation Details

### 1.1 Domain Entities & Models (`Models/`)
* **`User.cs` Entity:**
  * **Primary Attributes:** `Id`, `FullName`, `Email`, `PasswordHash`, `Role` (Default: "Customer").
  * **Shipping & Address Details:** `PhoneNumber`, `Address`, `City`, `PostalCode`, `Country`, `State`.
  * **Audit Timestamps:** `CreatedAt` (UTC timestamp).
  * **Password Reset Engine:** `PasswordResetToken` (Cryptographic hex string), `ResetTokenExpiry` (1-hour TTL).
  * **OAuth Credentials:** `GoogleId`, `AuthProvider` ("Local" or "Google").
  * **Refresh Token System:** `RefreshToken` (64-byte random string), `RefreshTokenExpiryTime` (7 days duration).

---

### 1.2 Database & EF Core (`Data/` & `Migrations/`)
* **`AppDbContext.cs`:**
  * Implements `DbContext` managing the `Users` table.
  * **Fluent API Constraints:**
    * Unique Index on `User.Email` to prevent duplicates.
    * Required fields and string length boundaries (`MaxLength(150)` for Email, `MaxLength(100)` for FullName).
    * Default column value for `Role` (`"Customer"`).
* **EF Core Migrations History:**
  1. `InitialCreate`: Initial user table setup.
  2. `AddUserProfileFields`: Added address, phone, and profile info.
  3. `AddPasswordResetFields`: Added token-based password reset properties.
  4. `AddGoogleAuthFields`: Added `GoogleId` and `AuthProvider`.
  5. `AddRefreshTokenFieldsToUser`: Added `RefreshToken` and `RefreshTokenExpiryTime`.

---

### 1.3 DTOs & Validation Layer (`Dtos/`)
* **Data Annotations Validation:** Automatic HTTP 400 Bad Request triggers before controller execution.
  * **`RegisterRequestDto`:** `FullName` `[Required]`, `Email` `[Required, EmailAddress]`, `Password` `[Required, MinLength(6)]`.
  * **`LoginRequestDto`:** `Email` `[Required, EmailAddress]`, `Password` `[Required]`.
  * **`AuthResponseDto`:** Returns `Token` (Access token), `RefreshToken`, `FullName`, `Email`, `Role`.
  * **`RefreshTokenRequestDto`:** Accepts `AccessToken` and `RefreshToken`.
  * **`ForgotPasswordRequestDto`:** `Email` `[Required, EmailAddress]`.
  * **`ResetPasswordRequestDto`:** `Token` `[Required]`, `NewPassword` `[Required, MinLength(6)]`.
  * **`GoogleLoginRequestDto`:** `IdToken` `[Required]`.
  * **`UserProfileDto` & `UpdateProfileDto`:** Structured user information transfer.
  * **`DeleteAccountRequestDto`:** `ConfirmationEmail` `[Required, EmailAddress]`.

---

### 1.4 Repositories (`Repositories/`)
* **`IUserRepository` & `UserRepository`:**
  * `GetByIdAsync(int id)`: Fetches user by Primary Key.
  * `GetByEmailAsync(string email)`: Fetches user by unique email.
  * `GetByResetTokenAsync(string token)`: Finds user by active password reset token.
  * `ExistsByEmailAsync(string email)`: Fast existence check for registration.
  * `AddAsync(User user)`: Inserts new user record.
  * `UpdateAsync(User user)`: Persists modified user state (profile, tokens).
  * `DeleteAsync(User user)`: Permanently removes user account from database.

---

### 1.5 Services & Business Logic (`Services/`)
* **`IJwtTokenGenerator` & `JwtTokenGenerator`:**
  * `GenerateToken(User user)`: Issues short-lived **30-Minute Access Token** containing claims (`sub`, `email`, `fullName`, `role`, `jti`).
  * `GenerateRefreshToken()`: Generates a cryptographically strong 64-byte random string.
  * `GetPrincipalFromExpiredToken(string token)`: Safely extracts claims from expired tokens using `ValidateLifetime = false`.
* **`IPasswordHasher` & `PasswordHasher`:**
  * Secure one-way hashing and verification for local credentials.
* **`IEmailService` & `EmailService`:**
  * Uses **MailKit / MimeKit** with Google SMTP credentials to dispatch HTML formatted Password Reset emails with secure one-click reset links.
* **`IAuthService` & `AuthService`:**
  * `RegisterAsync`: Validates duplicate email, hashes password, generates 30-min Access Token + 7-day Refresh Token, saves user.
  * `LoginAsync`: Verifies credentials, rotates Refresh Token, returns new token pair.
  * `GoogleLoginAsync`: Validates Google ID token via `GoogleJsonWebSignature.ValidateAsync`, links or registers user, issues JWTs.
  * `RefreshTokenAsync`: Validates expired Access Token + DB Refresh Token, generates fresh pair (**Token Rotation**), updates database.
  * `ForgotPasswordAsync`: Generates unique 32-byte crypto token, sets 1-hour expiry, dispatches reset email.
  * `ResetPasswordAsync`: Validates token & expiry, updates password hash, invalidates reset token.
* **`IUserService` & `UserService`:**
  * `GetProfileAsync`: Returns user profile data.
  * `UpdateProfileAsync`: Updates contact and shipping address details.
  * `DeleteAccountAsync`: Validates confirmation email (`StringComparison.OrdinalIgnoreCase`) and deletes account.

---

### 1.6 API Controllers (`Controllers/`)
* **`AuthController.cs`:**
  * `POST /api/auth/register`: User signup. Sets `HttpOnly` cookie.
  * `POST /api/auth/login`: User signin. Sets `HttpOnly` cookie.
  * `POST /api/auth/google-login`: Google OAuth token exchange. Sets `HttpOnly` cookie.
  * `POST /api/auth/refresh-token`: Silent token refresh via `HttpOnly` cookie or request body.
  * `POST /api/auth/forgot-password`: Triggers password reset email.
  * `POST /api/auth/reset-password`: Updates password via token link.
  * `POST /api/auth/logout`: Clears `HttpOnly` cookie from browser.
* **`UserController.cs` (`[Authorize]`):**
  * `GET /api/user/profile`: Fetches current user profile using JWT claims.
  * `PUT /api/user/profile`: Updates profile details.
  * `DELETE /api/user/profile`: Deletes user account with confirmation email validation.

---

### 1.7 Security & Cookie Engine
* **`HttpOnly` Cookie Configuration:**
  * **`HttpOnly = true`:** Protects refresh token from XSS attacks (inaccessible to JavaScript).
  * **`SameSite = SameSiteMode.Lax`:** Protects against Cross-Site Request Forgery (CSRF).
  * **`Expires = DateTime.UtcNow.AddDays(7)`:** 7-day persistent session.
* **CORS Policy (`Program.cs`):**
  * Configured with `WithOrigins("http://localhost:3000")`, `AllowAnyHeader()`, `AllowAnyMethod()`, and **`AllowCredentials()`** to enable cross-origin cookie exchange.

---

# 💻 2. Frontend Features & Implementation Details

### 2.1 Pages & Routing (`src/app/`)
* **Home Page (`/`):**
  * Hero carousel with promotional banners.
  * Featured products grid, trending categories, and newsletter signup.
* **Shop Page (`/shop`):**
  * Product catalog with category filters, sorting, and pagination.
* **About Page (`/about`):**
  * Brand story, mission, and company values.
* **Blogs Page (`/blogs`):**
  * E-commerce articles and fashion/tech updates.
* **Contact Page (`/contact`):**
  * Interactive contact form, Google Map embed, and customer support channels.
* **Cart Page (`/cart`):**
  * Dynamic item listing, quantity modifier, subtotal & taxes calculator, checkout navigation.
* **Wishlist Page (`/wishlist`):**
  * Saved favorite products with direct "Add to Cart" transfer.
* **Payment / Checkout Page (`/payment`):**
  * Shipping address preview, order summary, and payment method selection.

---

### 2.2 Authentication Pages & Features (`src/app/Components/Auth/`)
* **Login Page (`/login`):**
  * Email and Password login form with live error validation.
  * **"Continue with Google"** button (`@react-oauth/google`) with customized 350px width.
  * Link to Forgot Password.
* **Register Page (`/register`):**
  * Full name, email, and password registration form.
  * Integrated **Google OAuth** signup button.
* **Forgot Password Page (`/forgot-password`):**
  * Clean UI to request password reset link via email.
  * Real-time success and error alert banners.
* **Reset Password Page (`/reset-password?token=...`):**
  * Reads reset token from URL query parameters.
  * New password & Confirm password input with validation.
* **Profile Dashboard (`/profile`):**
  * **Tab Navigation:**
    1. **Dashboard:** User overview, welcome card, and quick stats.
    2. **Profile:** Edit personal info (Full Name, Phone Number).
    3. **Addresses:** Edit shipping details (Address, City, State, Postal Code, Country).
    4. **Orders:** Order history and status tracking placeholder.
    5. **Settings & Danger Zone:**
       * Account security overview.
       * Logout button.
       * **GitHub-Style Danger Zone (Delete Account Modal):**
         * Red-themed confirmation modal.
         * User must re-type their exact email address before delete button enables.
         * In-modal green success badge (`"Account deleted successfully"`) with smooth 1.5s redirect to `/login`.

---

### 2.3 API Integration & HTTP Interceptor (`src/app/libs/`)
* **`authApi.ts`:**
  * `setAuthSession(data)`: Saves 30-min Access Token & user metadata in `localStorage`.
  * `getAuthToken()` / `logout()`: Session management helpers.
  * `refreshTokenApi()`: Dispatches request with `credentials: "include"` to trigger background silent token renewal.
  * **`authenticatedFetch(url, options)`:**
    * Automatically injects `Authorization: Bearer <token>`.
    * Attaches `credentials: "include"` for cookie handling.
    * **Silent Refresh Interceptor:** Intercepts `401 Unauthorized` responses, calls `refreshTokenApi()` in the background, updates the token, and retries the original request seamlessly without user interruption.
* **`userApi.ts`:**
  * `getUserProfileApi()`: Fetches profile using `authenticatedFetch`.
  * `updateUserProfileApi(data)`: Updates profile and address using `authenticatedFetch`.
  * `deleteUserAccountApi(email)`: Submits delete confirmation payload.

---

## 🚀 How to Run Locally

### 1. Backend Setup:
```bash
cd ecommerce-backend
# Update appsettings.json with your SQL Server connection string & Google OAuth Client ID
dotnet restore
dotnet ef database update
dotnet run
```
* Backend starts at: `http://localhost:5024` (Swagger available at `/swagger`)

### 2. Frontend Setup:
```bash
cd ecommerce-frontend
# Create .env.local with:
# NEXT_PUBLIC_API_URL=http://localhost:5024
# NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com

npm install
npm run dev
```
* Frontend starts at: `http://localhost:3000`

---

## 🔒 Security Summary Checklist
- [x] **XSS Protection:** Refresh Token stored inside `HttpOnly` cookie.
- [x] **CSRF Protection:** `SameSite=Lax` applied to authentication cookies.
- [x] **Short-Lived Access Tokens:** JWTs expire in **30 minutes**.
- [x] **Token Rotation:** Every token refresh cycle generates and invalidates the previous refresh token.
- [x] **Safe Account Deletion:** Requires explicit user email verification matching before execution.
- [x] **OAuth Security:** Server-side verification of Google ID tokens via `GoogleJsonWebSignature`.
- [x] **Password Protection:** Cryptographic hashing on all local user passwords.
