using System.Security.Claims;
using ecommerce_backend.Dtos;
using ecommerce_backend.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ecommerce_backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize] // 🔒 SIRF LOGGED-IN USERS (With Valid JWT Token) ACCESS KAR SAKTE HAIN
    public class UserController : ControllerBase
    {
        private readonly IUserService _userService;

        public UserController(IUserService userService)
        {
            _userService = userService;
        }

        // Helper Method: JWT Token ke Claims se Logged-In User ki ID nikalna
        private int GetUserIdFromToken()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value 
                              ?? User.FindFirst("sub")?.Value;

            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
            {
                throw new UnauthorizedAccessException("Invalid or missing user identity in token.");
            }

            return userId;
        }

        // 1. GET /api/user/profile
        [HttpGet("profile")]
        public async Task<IActionResult> GetProfile()
        {
            try
            {
                int userId = GetUserIdFromToken();
                var profile = await _userService.GetProfileAsync(userId);
                return Ok(profile);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while fetching profile.", error = ex.Message });
            }
        }

        // 2. PUT /api/user/profile
        [HttpPut("profile")]
        public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileRequestDto request)
        {
            try
            {
                int userId = GetUserIdFromToken();
                var updatedProfile = await _userService.UpdateProfileAsync(userId, request);
                return Ok(updatedProfile);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while updating profile.", error = ex.Message });
            }
        }
        // 3. DELETE /api/user/profile
        [HttpDelete("profile")]
        public async Task<IActionResult> DeleteAccount([FromBody] DeleteAccountRequestDto request)
        {
            try
            {
                int userId = GetUserIdFromToken(); // 🔑 JWT Token se ID nikalna
                await _userService.DeleteAccountAsync(userId, request);
                return Ok(new { message = "Your account has been deleted successfully." });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while deleting account.", error = ex.Message });
            }
        }

        // 4. GET /api/user/admin/all (Admin Only)
        [HttpGet("admin/all")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAllUsers()
        {
            try
            {
                var users = await _userService.GetAllUsersAsync();
                return Ok(new { success = true, data = users });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = "An error occurred while fetching users.", error = ex.Message });
            }
        }
    }
}
