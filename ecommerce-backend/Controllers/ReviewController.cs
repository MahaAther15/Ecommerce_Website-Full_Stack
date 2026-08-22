using System.Security.Claims;
using System.Threading.Tasks;
using ecommerce_backend.Dtos.Review;
using ecommerce_backend.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ecommerce_backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ReviewController : ControllerBase
    {
        private readonly IReviewService _reviewService;

        public ReviewController(IReviewService reviewService)
        {
            _reviewService = reviewService;
        }

        private int GetCurrentUserId()
        {
            var idClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                       ?? User.FindFirst("sub")?.Value;
            return int.TryParse(idClaim, out var id) ? id : 0;
        }

        // 1. POST: api/review  ─── Submit Rating, Review & Photo (Multipart form-data)
        [Authorize]
        [HttpPost]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> AddReview([FromForm] CreateReviewDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var userId = GetCurrentUserId();
            var response = await _reviewService.AddReviewAsync(userId, dto);

            if (!response.Success) return BadRequest(response);
            return Ok(response);
        }

        // 2. GET: api/review/product/{productId}  ─── Get all reviews & stats for product page
        [AllowAnonymous]
        [HttpGet("product/{productId:int}")]
        public async Task<IActionResult> GetProductReviews(int productId)
        {
            var response = await _reviewService.GetProductReviewsAsync(productId);
            return Ok(response);
        }

        // 3. GET: api/review/order/{orderId}  ─── Get reviews written by user for this order
        [Authorize]
        [HttpGet("order/{orderId:int}")]
        public async Task<IActionResult> GetOrderReviews(int orderId)
        {
            var userId = GetCurrentUserId();
            var response = await _reviewService.GetOrderReviewsAsync(orderId, userId);
            return Ok(response);
        }

        // 4. DELETE: api/review/{id}  ─── Delete review (Owner or Admin)
        [Authorize]
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> DeleteReview(int id)
        {
            var userId = GetCurrentUserId();
            var isAdmin = User.IsInRole("Admin");
            var response = await _reviewService.DeleteReviewAsync(userId, id, isAdmin);

            if (!response.Success) return BadRequest(response);
            return Ok(response);
        }
    }
}
