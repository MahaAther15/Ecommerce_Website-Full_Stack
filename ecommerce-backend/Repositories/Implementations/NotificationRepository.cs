using ecommerce_backend.Data;
using ecommerce_backend.Models;
using ecommerce_backend.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace ecommerce_backend.Repositories.Implementations
{
    public class NotificationRepository : INotificationRepository
    {
        private readonly AppDbContext _context;

        public NotificationRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<Notification>> GetUserNotificationsAsync(int userId, int limit = 20)
        {
            return await _context.Notifications
                .Where(n => n.UserId == userId && !n.IsAdminNotification)
                .OrderByDescending(n => n.CreatedAt)
                .Take(limit)
                .ToListAsync();
        }

        public async Task<List<Notification>> GetAdminNotificationsAsync(int limit = 30)
        {
            return await _context.Notifications
                .Where(n => n.IsAdminNotification)
                .OrderByDescending(n => n.CreatedAt)
                .Take(limit)
                .ToListAsync();
        }

        public async Task<int> GetUnreadCountAsync(int userId)
        {
            return await _context.Notifications
                .CountAsync(n => n.UserId == userId && !n.IsAdminNotification && !n.IsRead);
        }

        public async Task<int> GetAdminUnreadCountAsync()
        {
            return await _context.Notifications
                .CountAsync(n => n.IsAdminNotification && !n.IsRead);
        }

        public async Task<Notification?> GetByIdAsync(int id)
        {
            return await _context.Notifications.FindAsync(id);
        }

        public async Task<bool> AddAsync(Notification notification)
        {
            await _context.Notifications.AddAsync(notification);
            return await _context.SaveChangesAsync() > 0;
        }

        public async Task<bool> MarkAsReadAsync(int notificationId)
        {
            var item = await _context.Notifications.FindAsync(notificationId);
            if (item == null) return false;
            item.IsRead = true;
            return await _context.SaveChangesAsync() > 0;
        }

        public async Task<bool> MarkAllAsReadForUserAsync(int userId)
        {
            var unread = await _context.Notifications
                .Where(n => n.UserId == userId && !n.IsAdminNotification && !n.IsRead)
                .ToListAsync();

            unread.ForEach(n => n.IsRead = true);
            return await _context.SaveChangesAsync() > 0;
        }

        public async Task<bool> MarkAllAsReadForAdminAsync()
        {
            var unread = await _context.Notifications
                .Where(n => n.IsAdminNotification && !n.IsRead)
                .ToListAsync();

            unread.ForEach(n => n.IsRead = true);
            return await _context.SaveChangesAsync() > 0;
        }

        public async Task<bool> DeleteAsync(int notificationId)
        {
            var item = await _context.Notifications.FindAsync(notificationId);
            if (item == null) return false;
            _context.Notifications.Remove(item);
            return await _context.SaveChangesAsync() > 0;
        }
    }
}
