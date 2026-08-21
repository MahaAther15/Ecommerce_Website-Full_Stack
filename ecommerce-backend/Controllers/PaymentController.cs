using System.Security.Claims;
using ecommerce_backend.Dtos.Payment;
using ecommerce_backend.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ecommerce_backend.Controllers
{
    [Authorize] // Sirf logged-in users access kar sakte hain
    [ApiController]
    [Route("api/[controller]")]
    public class PaymentController : ControllerBase
    {
        private readonly IPaymentService _paymentService;

        public PaymentController(IPaymentService paymentService)
        {
            _paymentService = paymentService;
        }

        // Token se Current Logged-in User ki ID nikalna
        private int GetCurrentUserId()
        {
            var idClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                       ?? User.FindFirst("sub")?.Value;
            return int.TryParse(idClaim, out var id) ? id : 0;
        }

        /// <summary>
        /// 1. POST: api/payment/process
        /// Process payment for an existing order (Card, JazzCash, EasyPaisa, COD)
        /// </summary>
        [HttpPost("process")]
        public async Task<IActionResult> ProcessPayment([FromBody] ProcessPaymentDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var userId = GetCurrentUserId();
            var response = await _paymentService.ProcessPaymentAsync(userId, dto);

            if (!response.Success)
                return BadRequest(response);

            return Ok(response);
        }

        /// <summary>
        /// 2. GET: api/payment/status/{orderId}
        /// Get payment details and verification status for an order
        /// </summary>
        [HttpGet("status/{orderId:int}")]
        public async Task<IActionResult> GetPaymentStatus(int orderId)
        {
            var userId = GetCurrentUserId();
            var response = await _paymentService.GetPaymentStatusAsync(userId, orderId);

            if (!response.Success)
                return NotFound(response);

            return Ok(response);
        }
    }
}
