using System.ComponentModel.DataAnnotations;
using ecommerce_backend.Models;
namespace ecommerce_backend.Dtos.ReturnRefund
{
    public class CreateReturnRequestDto
    {
        [Required]
        public int OrderId { get; set; }

        [Required]
        public ReturnReason Reason { get; set; }

        [MaxLength(1000)]
        public string? Comments { get; set; }
        [MaxLength(100)]
        public string? RefundAccountDetails { get; set; }
    }
}