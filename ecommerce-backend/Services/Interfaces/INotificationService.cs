using ecommerce_backend.Dtos;
using ecommerce_backend.Models;
using ecommerce_backend.Models.common;

namespace ecommerce_backend.Services.Interfaces
{
    public interface INotificationService
    {
        Task<ApiResponse<List<NotificationDto>>> GetUserNotificationsAsync(int userId);
        Task<ApiResponse<List<NotificationDto>>> GetAdminNotificationsAsync();
        Task<ApiResponse<int>> GetUserUnreadCountAsync(int userId);
        Task<ApiResponse<int>> GetAdminUnreadCountAsync();
        Task<ApiResponse<bool>> MarkAsReadAsync(int notificationId);
        Task<ApiResponse<bool>> MarkAllAsReadAsync(int userId, bool isAdmin);
        Task<ApiResponse<bool>> DeleteNotificationAsync(int notificationId);

        // Helper event triggers called across system
        Task NotifyUserAsync(int userId, string title, string message, NotificationType type, string? actionUrl = null);
        Task NotifyAdminAsync(string title, string message, NotificationType type, NotificationPriority priority = NotificationPriority.Normal, string? actionUrl = null);
        Task SyncActionableAdminTodosAsync(); // Auto scan for low stock / unfulfilled orders
    }
}
