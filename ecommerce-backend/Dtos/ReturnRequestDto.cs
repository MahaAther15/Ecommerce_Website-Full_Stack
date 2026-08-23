using ecommerce_backend.Dtos.Order;
using ecommerce_backend.Models;

namespace ecommerce_backend.Dtos.ReturnRefund
{
    public class ReturnRequestDto
    {
        public int Id { get; set; }
        public int OrderId { get; set; }
        public string OrderNumber { get; set; } = string.Empty;
        public int UserId { get; set; }
        public string UserFullName { get; set; } = string.Empty;
        public string UserEmail { get; set; } = string.Empty;
        public string Reason { get; set; } = string.Empty;
        public string? Comments { get; set; }
        public decimal RefundAmount { get; set; }
        public string Status { get; set; } = string.Empty;
        public string? AdminNotes { get; set; }
        public string? RefundAccountDetails { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? ProcessedAt { get; set; }
        public OrderDto? Order { get; set; }
    }
}
