// admin only
using System.ComponentModel.DataAnnotations;
using ecommerce_backend.Models;

namespace ecommerce_backend.Dtos.Order
{
    public class UpdateOrderStatusDto
    {
        [Required]
        public OrderStatus Status { get; set; }
    }
}
