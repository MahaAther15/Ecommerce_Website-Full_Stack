using ecommerce_backend.Dtos;
using ecommerce_backend.Models;
using ecommerce_backend.Repositories.Interfaces;
using ecommerce_backend.Services.Interfaces;
using Google.Apis.Auth;
using Microsoft.IdentityModel.Tokens;
using System.Security.Claims;
using System.Security.Cryptography;

namespace ecommerce_backend.Services.Implementations
{
    public class AuthService : IAuthService
    {
        // ==========================================
        // DEPENDENCIES
        // ==========================================

        // User repository - database operations
        private readonly IUserRepository _userRepository;

        // Password hashing service
        private readonly IPasswordHasher _passwordHasher;

        // JWT Access Token & Refresh Token generator
        private readonly IJwtTokenGenerator _jwtTokenGenerator;

        // Email service - password reset emails
        private readonly IEmailService _emailService;

        // Configuration - Google Client ID etc.
        private readonly IConfiguration _configuration;


        // ==========================================
        // CONSTRUCTOR
        // ==========================================

        public AuthService(
            IUserRepository userRepository,
            IPasswordHasher passwordHasher,
            IJwtTokenGenerator jwtTokenGenerator,
            IEmailService emailService,
            IConfiguration configuration)
        {
            _userRepository = userRepository;
            _passwordHasher = passwordHasher;
            _jwtTokenGenerator = jwtTokenGenerator;
            _emailService = emailService;
            _configuration = configuration;
        }


        // ==========================================
        // 1. REGISTER
        // ==========================================
        // Creates a new user
        // Generates Access Token + Refresh Token
        // ==========================================

        public async Task<AuthResponseDto> RegisterAsync(
            RegisterRequestDto request)
        {
            // 1. Check if email already exists
            if (await _userRepository.ExistsByEmailAsync(request.Email))
            {
                throw new InvalidOperationException(
                    "User with this email already exists.");
            }


            // 2. Hash user's password
            string passwordHash =
                _passwordHasher.HashPassword(request.Password);


            // 3. Generate Refresh Token
            string refreshToken =
                _jwtTokenGenerator.GenerateRefreshToken();


            // 4. Create User entity
            var newUser = new User
            {
                FullName = request.FullName,
                Email = request.Email,
                PasswordHash = passwordHash,

                Role = "Customer",

                // Local authentication
                AuthProvider = "Local",

                // Refresh token information
                RefreshToken = refreshToken,
                RefreshTokenExpiryTime =
                    DateTime.UtcNow.AddDays(7)
            };


            // 5. Save user to database
            var savedUser =
                await _userRepository.AddAsync(newUser);


            // 6. Generate Access Token
            string accessToken =
                _jwtTokenGenerator.GenerateToken(savedUser);


            // 7. Return authentication response
            return new AuthResponseDto
            {
                Token = accessToken,
                RefreshToken = refreshToken,

                FullName = savedUser.FullName,
                Email = savedUser.Email,
                Role = savedUser.Role
            };
        }


        // ==========================================
        // 2. LOGIN
        // ==========================================
        // Verifies email/password
        // Generates Access Token + Refresh Token
        // Rotates old Refresh Token
        // ==========================================

        public async Task<AuthResponseDto> LoginAsync(
            LoginRequestDto request)
        {
            // 1. Find user by email
            var user =
                await _userRepository.GetByEmailAsync(request.Email);


            // 2. Check user and password
            if (user == null ||
                !_passwordHasher.VerifyPassword(
                    request.Password,
                    user.PasswordHash))
            {
                throw new UnauthorizedAccessException(
                    "Invalid email or password.");
            }


            // 3. Generate new Access Token
            string accessToken =
                _jwtTokenGenerator.GenerateToken(user);


            // 4. Generate new Refresh Token
            string refreshToken =
                _jwtTokenGenerator.GenerateRefreshToken();


            // 5. Update Refresh Token in database
            user.RefreshToken = refreshToken;

            user.RefreshTokenExpiryTime =
                DateTime.UtcNow.AddDays(7);


            // 6. Save changes
            await _userRepository.UpdateAsync(user);


            // 7. Return response
            return new AuthResponseDto
            {
                Token = accessToken,
                RefreshToken = refreshToken,

                FullName = user.FullName,
                Email = user.Email,
                Role = user.Role
            };
        }


        // ==========================================
        // 3. GOOGLE LOGIN
        // ==========================================
        // Validates Google ID Token
        // Creates user if doesn't exist
        // Links Google account if user exists
        // Generates Access + Refresh Token
        // ==========================================

        public async Task<AuthResponseDto> GoogleLoginAsync(
            GoogleLoginRequestDto request)
        {
            // ------------------------------------------
            // A. Get Google Client ID
            // ------------------------------------------

            string clientId =
                _configuration["GoogleAuth:ClientId"]
                ?? _configuration["GoogleAuthSettings:ClientId"]
                ?? "";


            // ------------------------------------------
            // B. Google Token Validation Settings
            // ------------------------------------------

            var validationSettings =
                new GoogleJsonWebSignature.ValidationSettings
                {
                    Audience = string.IsNullOrEmpty(clientId)
                        ? null
                        : new[] { clientId }
                };


            GoogleJsonWebSignature.Payload payload;


            // ------------------------------------------
            // C. Validate Google ID Token
            // ------------------------------------------

            try
            {
                payload =
                    await GoogleJsonWebSignature.ValidateAsync(
                        request.IdToken,
                        validationSettings);
            }
            catch (Exception)
            {
                throw new UnauthorizedAccessException(
                    "Invalid or expired Google Token.");
            }


            // ------------------------------------------
            // D. Find user by Google email
            // ------------------------------------------

            var user =
                await _userRepository.GetByEmailAsync(
                    payload.Email);


            // ------------------------------------------
            // E. Generate Refresh Token
            // ------------------------------------------

            string refreshToken =
                _jwtTokenGenerator.GenerateRefreshToken();


            // ------------------------------------------
            // F. User doesn't exist
            // Create new Google user
            // ------------------------------------------

            if (user == null)
            {
                user = new User
                {
                    FullName =
                        payload.Name ?? "Google User",

                    Email = payload.Email,

                    // Google user doesn't have local password
                    PasswordHash = string.Empty,

                    Role = "Customer",

                    GoogleId = payload.Subject,

                    AuthProvider = "Google",

                    RefreshToken = refreshToken,

                    RefreshTokenExpiryTime =
                        DateTime.UtcNow.AddDays(7)
                };


                // Save new Google user
                user =
                    await _userRepository.AddAsync(user);
            }


            // ------------------------------------------
            // G. User already exists
            // ------------------------------------------

            else
            {
                // If GoogleId doesn't exist,
                // link this Google account
                if (string.IsNullOrEmpty(user.GoogleId))
                {
                    user.GoogleId = payload.Subject;
                }


                // If existing user was Local,
                // allow Google authentication as well.
                //
                // This makes the account effectively
                // support both Local + Google login.
                if (string.IsNullOrEmpty(user.AuthProvider) ||
                    user.AuthProvider == "Local")
                {
                    user.AuthProvider = "Google";
                }


                // Rotate Refresh Token
                user.RefreshToken = refreshToken;

                user.RefreshTokenExpiryTime =
                    DateTime.UtcNow.AddDays(7);


                // Save changes
                await _userRepository.UpdateAsync(user);
            }


            // ------------------------------------------
            // H. Generate application Access Token
            // ------------------------------------------

            string accessToken =
                _jwtTokenGenerator.GenerateToken(user);


            // ------------------------------------------
            // I. Return authentication response
            // ------------------------------------------

            return new AuthResponseDto
            {
                Token = accessToken,
                RefreshToken = refreshToken,

                FullName = user.FullName,
                Email = user.Email,
                Role = user.Role
            };
        }


        // ==========================================
        // 4. REFRESH TOKEN
        // ==========================================
        // Used when Access Token expires
        //
        // Flow:
        //
        // Expired Access Token
        //        +
        // Refresh Token
        //        ↓
        // Validate both
        //        ↓
        // New Access Token
        //        +
        // New Refresh Token
        //
        // ==========================================

        public async Task<AuthResponseDto> RefreshTokenAsync(
            RefreshTokenRequestDto request)
        {
            // ------------------------------------------
            // A. Extract user identity from expired token
            // ------------------------------------------

            var principal =
                _jwtTokenGenerator
                    .GetPrincipalFromExpiredToken(
                        request.AccessToken);


            if (principal == null)
            {
                throw new SecurityTokenException(
                    "Invalid access token.");
            }


            // ------------------------------------------
            // B. Get email from JWT claims
            // ------------------------------------------

            var email =
                principal.FindFirst(ClaimTypes.Email)?.Value
                ?? principal.FindFirst("email")?.Value;


            if (string.IsNullOrEmpty(email))
            {
                throw new SecurityTokenException(
                    "Invalid token claims.");
            }


            // ------------------------------------------
            // C. Get user from database
            // ------------------------------------------

            var user =
                await _userRepository.GetByEmailAsync(email);


            if (user == null)
            {
                throw new UnauthorizedAccessException(
                    "User not found.");
            }


            // ------------------------------------------
            // D. Validate Refresh Token
            // ------------------------------------------

            if (user.RefreshToken != request.RefreshToken)
            {
                throw new SecurityTokenException(
                    "Invalid refresh token.");
            }


            // ------------------------------------------
            // E. Check Refresh Token expiration
            // ------------------------------------------

            if (user.RefreshTokenExpiryTime <= DateTime.UtcNow)
            {
                throw new SecurityTokenException(
                    "Refresh token has expired. Please sign in again.");
            }


            // ------------------------------------------
            // F. Generate NEW Access Token
            // ------------------------------------------

            string newAccessToken =
                _jwtTokenGenerator.GenerateToken(user);


            // ------------------------------------------
            // G. Generate NEW Refresh Token
            // ------------------------------------------

            string newRefreshToken =
                _jwtTokenGenerator.GenerateRefreshToken();


            // ------------------------------------------
            // H. Rotate Refresh Token
            // ------------------------------------------

            user.RefreshToken = newRefreshToken;

            user.RefreshTokenExpiryTime =
                DateTime.UtcNow.AddDays(7);


            // Save updated token
            await _userRepository.UpdateAsync(user);


            // ------------------------------------------
            // I. Return new tokens
            // ------------------------------------------

            return new AuthResponseDto
            {
                Token = newAccessToken,
                RefreshToken = newRefreshToken,

                FullName = user.FullName,
                Email = user.Email,
                Role = user.Role
            };
        }


        // ==========================================
        // 5. FORGOT PASSWORD
        // ==========================================
        //
        // User enters email
        //       ↓
        // Find user
        //       ↓
        // Generate secure reset token
        //       ↓
        // Save token + expiry
        //       ↓
        // Send reset email
        //
        // ==========================================

        public async Task ForgotPasswordAsync(
            ForgotPasswordRequestDto request)
        {
            // 1. Find user by email
            var user =
                await _userRepository.GetByEmailAsync(
                    request.Email);


            // IMPORTANT:
            // Don't reveal whether email exists.
            //
            // This prevents attackers from checking
            // which emails are registered.

            if (user == null)
            {
                return;
            }


            // 2. Generate secure random reset token
            string resetToken =
                Convert.ToHexString(
                    RandomNumberGenerator.GetBytes(32));


            // 3. Save reset token
            user.PasswordResetToken = resetToken;


            // 4. Token expires after 1 hour
            user.ResetTokenExpiry =
                DateTime.UtcNow.AddHours(1);


            // 5. Update database
            await _userRepository.UpdateAsync(user);


            // 6. Send password reset email
            await _emailService.SendPasswordResetEmailAsync(
                user.Email,
                resetToken);
        }


        // ==========================================
        // 6. RESET PASSWORD
        // ==========================================
        //
        // User clicks reset link
        //       ↓
        // Frontend sends token + new password
        //       ↓
        // Backend validates token
        //       ↓
        // Hash new password
        //       ↓
        // Save password
        //       ↓
        // Delete reset token
        //
        // ==========================================

        public async Task ResetPasswordAsync(
            ResetPasswordRequestDto request)
        {
            // 1. Find user by reset token
            var user =
                await _userRepository.GetByResetTokenAsync(
                    request.Token);


            if (user == null)
            {
                throw new InvalidOperationException(
                    "Invalid or expired password reset token.");
            }


            // 2. Check token expiry
            if (user.ResetTokenExpiry == null ||
                user.ResetTokenExpiry < DateTime.UtcNow)
            {
                throw new InvalidOperationException(
                    "Password reset link has expired. Please request a new one.");
            }


            // 3. Hash the new password
            user.PasswordHash =
                _passwordHasher.HashPassword(
                    request.NewPassword);


            // 4. Delete reset token
            // This makes the token one-time use.
            user.PasswordResetToken = null;

            user.ResetTokenExpiry = null;


            // 5. Save new password
            await _userRepository.UpdateAsync(user);
        }
    }
}