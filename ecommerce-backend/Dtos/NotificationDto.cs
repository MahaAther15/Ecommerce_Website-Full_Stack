using ecommerce_backend.Models;
namespace ecommerce_backend.Dtos
{
    public class NotificationDto
    {
        public int Id { get; set; }
        public int? UserId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public string Priority { get; set; } = string.Empty;
        public string? ActionUrl { get; set; }
        public bool IsRead { get; set; }
        public bool IsAdminNotification { get; set; }
        public string TimeAgo { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
    }
    public class CreateNotificationDto
    {
        public int? UserId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public NotificationType Type { get; set; }
        public NotificationPriority Priority { get; set; } = NotificationPriority.Normal;
        public string? ActionUrl { get; set; }
        public bool IsAdminNotification { get; set; } = false;
    }
}