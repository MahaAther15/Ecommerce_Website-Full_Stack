using ecommerce_backend.Models;

namespace ecommerce_backend.Repositories.Interfaces
{
    public interface INotificationRepository
    {
        Task<List<Notification>> GetUserNotificationsAsync(int userId, int limit = 20);
        Task<List<Notification>> GetAdminNotificationsAsync(int limit = 30);
        Task<int> GetUnreadCountAsync(int userId);
        Task<int> GetAdminUnreadCountAsync();
        Task<Notification?> GetByIdAsync(int id);
        Task<bool> AddAsync(Notification notification);
        Task<bool> MarkAsReadAsync(int notificationId);
        Task<bool> MarkAllAsReadForUserAsync(int userId);
        Task<bool> MarkAllAsReadForAdminAsync();
        Task<bool> DeleteAsync(int notificationId);
    }
}
