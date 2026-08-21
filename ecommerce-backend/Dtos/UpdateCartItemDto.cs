using System.ComponentModel.DataAnnotations;

namespace ecommerce_backend.Dtos.Cart
{
    public class UpdateCartItemDto
    {
        [Range(1, 100, ErrorMessage = "Quantity must be between 1 and 100.")]
        public int Quantity { get; set; }
    }
}
