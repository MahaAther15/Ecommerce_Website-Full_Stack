using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ecommerce_backend.Models
{
    public class OrderItem
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int OrderId { get; set; }

        [ForeignKey("OrderId")]
        public Order Order { get; set; } = null!;

        [Required]
        public int ProductId { get; set; }

        [ForeignKey("ProductId")]
        public Product Product { get; set; } = null!;

        // Product snapshot at time of order (price may change later)
        [Required]
        [MaxLength(200)]
        public string ProductTitle { get; set; } = string.Empty;

        [MaxLength(200)]
        public string? ProductImage { get; set; }

        public decimal UnitPrice { get; set; }

        [Required]
        [Range(1, 1000)]
        public int Quantity { get; set; }

        public decimal SubTotal => UnitPrice * Quantity;
    }
}
