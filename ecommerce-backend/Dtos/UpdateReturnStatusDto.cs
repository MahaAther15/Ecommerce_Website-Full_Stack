using System.ComponentModel.DataAnnotations;
using ecommerce_backend.Models;

namespace ecommerce_backend.Dtos.ReturnRefund
{
    public class UpdateReturnStatusDto
    {
        [Required]
        public ReturnStatus Status { get; set; }

        [MaxLength(500)]
        public string? AdminNotes { get; set; }
    }
}
