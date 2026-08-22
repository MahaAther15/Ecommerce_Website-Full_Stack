using ecommerce_backend.Dtos;
using ecommerce_backend.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;

namespace ecommerce_backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        // This is register method endpoint 
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequestDto request)
        {
            try
            {
                var response = await _authService.RegisterAsync(request);
                SetRefreshTokenCookie(response.RefreshToken);
                return Ok(response);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred during registration.", error = ex.Message });
            }
        }

        // This is login method endpoint
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequestDto request)
        {
            try
            {
                var response = await _authService.LoginAsync(request);
                SetRefreshTokenCookie(response.RefreshToken);
                return Ok(response);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred during login.", error = ex.Message });
            }
        }

        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequestDto request)
        {
            try
            {
                await _authService.ForgotPasswordAsync(request);
                return Ok(new { message = "If the email exists in our system, a password reset link has been sent to your email." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to process request.", error = ex.Message });
            }
        }
        // ==========================================
        // NAYA ENDPOINT: Reset Password
        // ==========================================
        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequestDto request)
        {
            try
            {
                await _authService.ResetPasswordAsync(request);
                return Ok(new { message = "Password has been reset successfully. You can now login with your new password." });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to reset password.", error = ex.Message });
            }
        }
        // ==========================================
        // GOOGLE LOGIN ENDPOINT
        // ==========================================
        [HttpPost("google-login")]
        public async Task<IActionResult> GoogleLogin([FromBody] GoogleLoginRequestDto request)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(request.IdToken))
                {
                    return BadRequest(new { message = "Google IdToken is required." });
                }

                var response = await _authService.GoogleLoginAsync(request);
                SetRefreshTokenCookie(response.RefreshToken);
                return Ok(response);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred during Google authentication.", error = ex.Message });
            }
        }
    
        // AuthController.cs ke andar private helper methods:

        // 1. Helper to set secure HttpOnly Cookie
        private void SetRefreshTokenCookie(string refreshToken)
        {
            var cookieOptions = new CookieOptions
            {
                HttpOnly = true,                                 // 🛡️ JS access disabled (XSS Safe)
                Expires = DateTime.UtcNow.AddDays(7),            // ⏳ 7 Days lifetime
                Secure = false,                                   // 🔒 HTTPS only (Dev me localhost par bhi kaam karta hai)
                SameSite = SameSiteMode.Lax,                     // 🛡️ CSRF Protection (Development ke liye Lax best hai)
                IsEssential = true
            };

            // Response header me Set-Cookie attach karein
            Response.Cookies.Append("refreshToken", refreshToken, cookieOptions);
        }

        // 2. Helper to clear Cookie on Logout
        private void DeleteRefreshTokenCookie()
        {
            Response.Cookies.Delete("refreshToken", new CookieOptions
            {
                HttpOnly = true,
                Secure = false,
                SameSite = SameSiteMode.Lax
            });
        }
        [HttpPost("logout")]
        public IActionResult Logout()
        {
            // Browser se HttpOnly cookie delete kar do
            DeleteRefreshTokenCookie();
            return Ok(new { message = "Logged out successfully." });
        }

        [HttpPost("refresh-token")]
        public async Task<IActionResult> RefreshToken([FromBody] RefreshTokenRequestDto request)
        {
            try
            {
                // 1. Pehle Cookie se refreshToken check karein, agar cookie na ho to request body se lein
                string? refreshToken = Request.Cookies["refreshToken"];
                if (string.IsNullOrWhiteSpace(refreshToken))
                {
                    refreshToken = request.RefreshToken;
                }

                if (string.IsNullOrWhiteSpace(refreshToken))
                {
                    return Unauthorized(new { message = "No refresh token provided." });
                }

                // 2. DTO ko cookie wale token se update karein
                request.RefreshToken = refreshToken;

                var response = await _authService.RefreshTokenAsync(request);

                // 3. Naya rotated Refresh Token dobara HttpOnly cookie me set karein
                SetRefreshTokenCookie(response.RefreshToken);

                return Ok(response);
            }
            catch (SecurityTokenException ex)
            {
                return Unauthorized(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Token refresh failed.", error = ex.Message });
            }
        }




    }
}
