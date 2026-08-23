using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ecommerce_backend.Models
{
    public enum ReturnStatus
    {
        Pending,        // Customer submitted request
        UnderReview,    // Admin is checking the request
        Approved,       // Return approved, waiting for product arrival / refund
        Refunded,       // Refund processed successfully
        Rejected        // Return rejected
    }

    public enum ReturnReason
    {
        DefectiveOrDamaged,
        WrongItemReceived,
        ItemNotAsDescribed,
        QualityNotExpected,
        ChangedMind,
        Other
    }

    public class ReturnRequest
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int OrderId { get; set; }

        [ForeignKey("OrderId")]
        public Order Order { get; set; } = null!;

        [Required]
        public int UserId { get; set; }

        [ForeignKey("UserId")]
        public User User { get; set; } = null!;

        [Required]
        public ReturnReason Reason { get; set; }

        [MaxLength(1000)]
        public string? Comments { get; set; }

        public decimal RefundAmount { get; set; }

        public ReturnStatus Status { get; set; } = ReturnStatus.Pending;

        [MaxLength(500)]
        public string? AdminNotes { get; set; }

        // Bank / Payment details provided by user if COD
        [MaxLength(100)]
        public string? RefundAccountDetails { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? ProcessedAt { get; set; }
    }
}
