using ecommerce_backend.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
namespace ecommerce_backend.Controllers{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles="Admin")]
    public class AnalyticsController : ControllerBase
    {
        private readonly IAnalyticsService _analyticsService;

        public AnalyticsController(IAnalyticsService analyticsService)
        {
            _analyticsService = analyticsService;
        }

        [HttpGet("report")]
        public async Task<IActionResult> GetReport([FromQuery] string range = "30days")
        {
            var result = await _analyticsService.GetAnalyticsReportAsync(range);
            return Ok(result);
        }

        public class CreateExpenseRequest
        {
            public string Title { get; set; } = string.Empty;
            public decimal Amount { get; set; }
            public string Category { get; set; } = string.Empty;
            public string? Description { get; set; }
            public DateTime? Date { get; set; }
        }

        [HttpPost("expenses")]
        public async Task<IActionResult> AddExpense([FromBody] CreateExpenseRequest req)
        {
            var result = await _analyticsService.AddExpenseAsync(
                req.Title, 
                req.Amount, 
                req.Category, 
                req.Description, 
                req.Date ?? DateTime.UtcNow
            );
            if (!result.Success) return BadRequest(result);
            return Ok(result);
        }
    }
}