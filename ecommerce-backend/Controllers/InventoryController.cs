using ecommerce_backend.Dtos.Inventory;
using ecommerce_backend.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ecommerce_backend.Controllers
{
    [Authorize(Roles = "Admin")] // 🔒 Sirf Admin access kar sakta hai
    [ApiController]
    [Route("api/[controller]")]
    public class InventoryController : ControllerBase
    {
        private readonly IInventoryService _inventoryService;

        public InventoryController(IInventoryService inventoryService)
        {
            _inventoryService = inventoryService;
        }

        // 1. GET: api/inventory/summary
        [HttpGet("summary")]
        public async Task<IActionResult> GetSummary()
        {
            var response = await _inventoryService.GetSummaryAsync();
            return Ok(response);
        }

        // 2. GET: api/inventory?filter=all&search=shirt
        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] string? filter = "all", [FromQuery] string? search = null)
        {
            var response = await _inventoryService.GetAllInventoryAsync(filter, search);
            return Ok(response);
        }

        // 3. POST: api/inventory/adjust (Quick Restock / Damage / Adjustment)
        [HttpPost("adjust")]
        public async Task<IActionResult> AdjustStock([FromBody] AdjustStockDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            var response = await _inventoryService.AdjustStockAsync(dto);
            if (!response.Success) return BadRequest(response);
            return Ok(response);
        }

        // 4. GET: api/inventory/{productId}/logs (Audit Trail History)
        [HttpGet("{productId:int}/logs")]
        public async Task<IActionResult> GetLogs(int productId)
        {
            var response = await _inventoryService.GetProductLogsAsync(productId);
            return Ok(response);
        }
    }
}
