using System.Security.Claims;
using ecommerce_backend.Dtos.Order;
using ecommerce_backend.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ecommerce_backend.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class OrderController : ControllerBase
    {
        private readonly IOrderService _orderService;

        public OrderController(IOrderService orderService)
        {
            _orderService = orderService;
        }

        private int GetCurrentUserId()
        {
            var idClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                       ?? User.FindFirst("sub")?.Value;
            return int.TryParse(idClaim, out var id) ? id : 0;
        }

        // 1. POST: api/order  ─── Place Order (converts Cart → Order)
        [HttpPost]
        public async Task<IActionResult> PlaceOrder([FromBody] PlaceOrderDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            var userId = GetCurrentUserId();
            var response = await _orderService.PlaceOrderAsync(userId, dto);
            if (!response.Success) return BadRequest(response);
            return Ok(response);
        }

        // 2. GET: api/order/my  ─── My Order History (User)
        [HttpGet("my")]
        public async Task<IActionResult> GetMyOrders()
        {
            var userId = GetCurrentUserId();
            var response = await _orderService.GetMyOrdersAsync(userId);
            return Ok(response);
        }

        // 3. GET: api/order/{id}  ─── Single Order Detail (User owns it)
        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetOrderById(int id)
        {
            var userId = GetCurrentUserId();
            var response = await _orderService.GetOrderByIdAsync(userId, id);
            if (!response.Success) return NotFound(response);
            return Ok(response);
        }

        // 4. POST: api/order/{id}/cancel  ─── Cancel Pending Order (User)
        [HttpPost("{id:int}/cancel")]
        public async Task<IActionResult> CancelOrder(int id)
        {
            var userId = GetCurrentUserId();
            var response = await _orderService.CancelOrderAsync(userId, id);
            if (!response.Success) return BadRequest(response);
            return Ok(response);
        }

        // ─── ADMIN ONLY ─────────────────────────────────────────────────

        // 5. GET: api/order/admin/all  ─── All Orders (Admin Dashboard)
        [Authorize(Roles = "Admin")]
        [HttpGet("admin/all")]
        public async Task<IActionResult> GetAllOrders()
        {
            var response = await _orderService.GetAllOrdersAsync();
            return Ok(response);
        }

        // 6. PUT: api/order/admin/{id}/status  ─── Update Order Status (Admin)
        [Authorize(Roles = "Admin")]
        [HttpPut("admin/{id:int}/status")]
        public async Task<IActionResult> UpdateOrderStatus(int id, [FromBody] UpdateOrderStatusDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            var response = await _orderService.UpdateOrderStatusAsync(id, dto);
            if (!response.Success) return BadRequest(response);
            return Ok(response);
        }
    }
}
