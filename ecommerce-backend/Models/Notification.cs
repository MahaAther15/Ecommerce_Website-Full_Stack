using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
namespace ecommerce_backend.Models
{
    public enum NotificationType {
        // user perspective types
        OrderPlaced,
        OrderShipped,
        OrderDelivered,
        PaymentReceived,
        RefundApproved,
        CartReminder,
        WishlistAlert,
        
        // admin perspective types
        AdminNewOrder,
        AdminLowStock,
        AdminReturnRequest,
        AdminNewReview,
        AdminSystemAlert 
    }
    public enum NotificationPriority
    {
        Low,
        Normal,
        High,
        Urgent
    }
    public class Notification{
        [Key]
        public int Id{get;set;}

        // nullable=agar user id null hn to ye admin notification hn
        public int? UserId{get;set;}

        [ForeignKey("UserId")]
        public User? User {get;set;}

        [Required]
        [MaxLength(150)]
        public string Title{get;set;}=string.Empty;

        [Required]
        [MaxLength(500)]
        public string Message{get;set;}=string.Empty;

        [Required]
        public NotificationType Type{get;set;}

        public NotificationPriority Priority {get;set;}=NotificationPriority.Normal;

        [MaxLength(250)]
        public string? ActionUrl { get; set; } // e.g. "/orders/102" ya "/admin/returns"
        public bool IsRead { get; set; } = false;
        // True = Admin ke liye alert, False = Customer ke liye
        public bool IsAdminNotification { get; set; } = false;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // 
    }
}