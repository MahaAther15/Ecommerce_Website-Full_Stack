using System.Security.Claims;
using ecommerce_backend.Dtos.Cart;
using ecommerce_backend.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ecommerce_backend.Controllers
{
    [Authorize] // 👈 User must be logged in
    [ApiController]
    [Route("api/[controller]")]
    public class CartController : ControllerBase
    {
        private readonly ICartService _cartService;

        public CartController(ICartService cartService)
        {
            _cartService = cartService;
        }

        // Helper to extract authenticated user's ID from JWT claims
        private int GetCurrentUserId()
        {
            var idClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                       ?? User.FindFirst("sub")?.Value;

            return int.TryParse(idClaim, out var id) ? id : 0;
        }

        // 1. GET: api/cart
        [HttpGet]
        public async Task<IActionResult> GetCart()
        {
            var userId = GetCurrentUserId();
            var response = await _cartService.GetCartAsync(userId);
            return Ok(response);
        }

        // 2. POST: api/cart/items (Add to Cart)
        [HttpPost("items")]
        public async Task<IActionResult> AddToCart([FromBody] AddToCartDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            var userId = GetCurrentUserId();
            var response = await _cartService.AddToCartAsync(userId, dto);
            if (!response.Success) return BadRequest(response);
            return Ok(response);
        }

        // 3. PUT: api/cart/items/{productId} (Update Quantity)
        [HttpPut("items/{productId:int}")]
        public async Task<IActionResult> UpdateQuantity(int productId, [FromBody] UpdateCartItemDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            var userId = GetCurrentUserId();
            var response = await _cartService.UpdateQuantityAsync(userId, productId, dto.Quantity);
            if (!response.Success) return BadRequest(response);
            return Ok(response);
        }

        // 4. DELETE: api/cart/items/{productId} (Remove Item)
        [HttpDelete("items/{productId:int}")]
        public async Task<IActionResult> RemoveFromCart(int productId)
        {
            var userId = GetCurrentUserId();
            var response = await _cartService.RemoveFromCartAsync(userId, productId);
            if (!response.Success) return NotFound(response);
            return Ok(response);
        }

        // 5. DELETE: api/cart/clear (Empty entire cart)
        [HttpDelete("clear")]
        public async Task<IActionResult> ClearCart()
        {
            var userId = GetCurrentUserId();
            var response = await _cartService.ClearCartAsync(userId);
            return Ok(response);
        }
    }
}
