using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ecommerce_backend.Models
{
    public enum OrderStatus
    {
        Pending,
        Confirmed,
        Processing,
        Shipped,
        Delivered,
        Cancelled,
        Refunded
    }

    public class Order
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int UserId { get; set; }

        [ForeignKey("UserId")]
        public User User { get; set; } = null!;

        public ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();

        // Pricing
        public decimal TotalAmount { get; set; }
        public decimal ShippingFee { get; set; } = 0;
        public decimal Discount { get; set; } = 0;
        public decimal FinalAmount { get; set; }

        // Status
        public OrderStatus Status { get; set; } = OrderStatus.Pending;

        // Shipping Address (snapshot at time of order)
        [MaxLength(200)]
        public string? ShippingAddress { get; set; }

        [MaxLength(100)]
        public string? City { get; set; }

        [MaxLength(20)]
        public string? PostalCode { get; set; }

        [MaxLength(100)]
        public string? Country { get; set; }

        [MaxLength(20)]
        public string? PhoneNumber { get; set; }

        // Payment
        [MaxLength(50)]
        public string PaymentMethod { get; set; } = "Cash On Delivery";

        public bool IsPaid { get; set; } = false;

        public DateTime? PaidAt { get; set; }

        // Timestamps
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
        public DateTime? DeliveredAt { get; set; }
    }
}
