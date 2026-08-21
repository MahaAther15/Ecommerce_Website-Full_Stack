using System.ComponentModel.DataAnnotations;

namespace ecommerce_backend.Dtos.Cart
{
    public class AddToCartDto
    {
        [Required]
        public int ProductId { get; set; }

        [Range(1, 100, ErrorMessage = "Quantity must be between 1 and 100.")]
        public int Quantity { get; set; } = 1;
    }
}
