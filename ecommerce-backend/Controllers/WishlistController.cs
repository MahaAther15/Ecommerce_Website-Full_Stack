using System.Security.Claims;
using ecommerce_backend.Dtos.Wishlist;
using ecommerce_backend.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ecommerce_backend.Controllers
{
    [Authorize] // 🔒 Sirf logged-in user apni wishlist access kar sakega
    [ApiController]
    [Route("api/[controller]")]
    public class WishlistController : ControllerBase
    {
        private readonly IWishlistService _wishlistService;

        public WishlistController(IWishlistService wishlistService)
        {
            _wishlistService = wishlistService;
        }

        private int GetCurrentUserId()
        {
            var idClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                       ?? User.FindFirst("sub")?.Value;
            return int.TryParse(idClaim, out var id) ? id : 0;
        }

        // 1. GET: api/wishlist
        [HttpGet]
        public async Task<IActionResult> GetWishlist()
        {
            var userId = GetCurrentUserId();
            var response = await _wishlistService.GetUserWishlistAsync(userId);
            return Ok(response);
        }

        // 2. POST: api/wishlist/toggle
        [HttpPost("toggle")]
        public async Task<IActionResult> ToggleWishlist([FromBody] AddToWishlistDto dto)
        {
            var userId = GetCurrentUserId();
            var response = await _wishlistService.ToggleWishlistItemAsync(userId, dto.ProductId);
            return Ok(response);
        }

        // 3. DELETE: api/wishlist/items/{productId}
        [HttpDelete("items/{productId:int}")]
        public async Task<IActionResult> RemoveFromWishlist(int productId)
        {
            var userId = GetCurrentUserId();
            var response = await _wishlistService.RemoveFromWishlistAsync(userId, productId);
            return Ok(response);
        }

        // 4. DELETE: api/wishlist/clear
        [HttpDelete("clear")]
        public async Task<IActionResult> ClearWishlist()
        {
            var userId = GetCurrentUserId();
            var response = await _wishlistService.ClearWishlistAsync(userId);
            return Ok(response);
        }
    }
}
