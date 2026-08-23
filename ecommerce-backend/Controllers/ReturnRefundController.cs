using System.Security.Claims;
using ecommerce_backend.Dtos.ReturnRefund;
using ecommerce_backend.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ecommerce_backend.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class ReturnRefundController : ControllerBase
    {
        private readonly IReturnRefundService _returnRefundService;

        public ReturnRefundController(IReturnRefundService returnRefundService)
        {
            _returnRefundService = returnRefundService;
        }

        private int GetCurrentUserId()
        {
            var idClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                       ?? User.FindFirst("sub")?.Value;
            return int.TryParse(idClaim, out var id) ? id : 0;
        }

        // 1. POST: api/ReturnRefund  ─── Request Return & Refund (Customer)
        [HttpPost]
        public async Task<IActionResult> CreateReturnRequest([FromBody] CreateReturnRequestDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            var userId = GetCurrentUserId();
            var response = await _returnRefundService.CreateReturnRequestAsync(userId, dto);
            if (!response.Success) return BadRequest(response);
            return Ok(response);
        }

        // 2. GET: api/ReturnRefund/order/{orderId}  ─── Check Return Status by OrderId (Customer)
        [HttpGet("order/{orderId:int}")]
        public async Task<IActionResult> GetReturnRequestByOrderId(int orderId)
        {
            var userId = GetCurrentUserId();
            var response = await _returnRefundService.GetReturnRequestByOrderIdAsync(userId, orderId);
            if (!response.Success) return NotFound(response);
            return Ok(response);
        }

        // 3. GET: api/ReturnRefund/my  ─── Customer's Return Requests
        [HttpGet("my")]
        public async Task<IActionResult> GetMyReturnRequests()
        {
            var userId = GetCurrentUserId();
            var response = await _returnRefundService.GetMyReturnRequestsAsync(userId);
            return Ok(response);
        }

        // ─── ADMIN ENDPOINTS ──────────────────────────────────────────────

        // 4. GET: api/ReturnRefund/admin/all  ─── View All Returns & Refunds (Admin)
        [Authorize(Roles = "Admin")]
        [HttpGet("admin/all")]
        public async Task<IActionResult> GetAllReturnRequests()
        {
            var response = await _returnRefundService.GetAllReturnRequestsAsync();
            return Ok(response);
        }

        // 5. PUT: api/ReturnRefund/admin/{id}/status  ─── Approve / Process Refund (Admin)
        [Authorize(Roles = "Admin")]
        [HttpPut("admin/{id:int}/status")]
        public async Task<IActionResult> UpdateReturnStatus(int id, [FromBody] UpdateReturnStatusDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            var response = await _returnRefundService.UpdateReturnStatusAsync(id, dto);
            if (!response.Success) return BadRequest(response);
            return Ok(response);
        }
    }
}
