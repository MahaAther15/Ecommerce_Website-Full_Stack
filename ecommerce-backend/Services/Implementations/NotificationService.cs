using ecommerce_backend.Data;
using ecommerce_backend.Dtos;
using ecommerce_backend.Models;
using ecommerce_backend.Models.common;
using ecommerce_backend.Repositories.Interfaces;
using ecommerce_backend.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace ecommerce_backend.Services.Implementations
{
    public class NotificationService : INotificationService
    {
        private readonly INotificationRepository _repo;
        private readonly AppDbContext _context;

        public NotificationService(INotificationRepository repo, AppDbContext context)
        {
            _repo = repo;
            _context = context;
        }

        public async Task<ApiResponse<List<NotificationDto>>> GetUserNotificationsAsync(int userId)
        {
            var items = await _repo.GetUserNotificationsAsync(userId);
            return new ApiResponse<List<NotificationDto>>
            {
                Success = true,
                Data = items.Select(MapToDto).ToList()
            };
        }

        public async Task<ApiResponse<List<NotificationDto>>> GetAdminNotificationsAsync()
        {
            // Auto check for fresh real-time To-Dos before returning
            await SyncActionableAdminTodosAsync();

            var items = await _repo.GetAdminNotificationsAsync();
            return new ApiResponse<List<NotificationDto>>
            {
                Success = true,
                Data = items.Select(MapToDto).ToList()
            };
        }

        public async Task<ApiResponse<int>> GetUserUnreadCountAsync(int userId)
        {
            int count = await _repo.GetUnreadCountAsync(userId);
            return new ApiResponse<int> { Success = true, Data = count };
        }

        public async Task<ApiResponse<int>> GetAdminUnreadCountAsync()
        {
            await SyncActionableAdminTodosAsync();
            int count = await _repo.GetAdminUnreadCountAsync();
            return new ApiResponse<int> { Success = true, Data = count };
        }

        public async Task<ApiResponse<bool>> MarkAsReadAsync(int notificationId)
        {
            bool result = await _repo.MarkAsReadAsync(notificationId);
            return new ApiResponse<bool> { Success = result, Data = result };
        }

        public async Task<ApiResponse<bool>> MarkAllAsReadAsync(int userId, bool isAdmin)
        {
            bool result = isAdmin ? await _repo.MarkAllAsReadForAdminAsync() : await _repo.MarkAllAsReadForUserAsync(userId);
            return new ApiResponse<bool> { Success = result, Data = result };
        }

        public async Task<ApiResponse<bool>> DeleteNotificationAsync(int notificationId)
        {
            bool result = await _repo.DeleteAsync(notificationId);
            return new ApiResponse<bool> { Success = result, Data = result };
        }

        // ── Helper triggers ──
        public async Task NotifyUserAsync(int userId, string title, string message, NotificationType type, string? actionUrl = null)
        {
            var notif = new Notification
            {
                UserId = userId,
                Title = title,
                Message = message,
                Type = type,
                ActionUrl = actionUrl,
                IsAdminNotification = false,
                CreatedAt = DateTime.UtcNow
            };
            await _repo.AddAsync(notif);
        }

        public async Task NotifyAdminAsync(string title, string message, NotificationType type, NotificationPriority priority = NotificationPriority.Normal, string? actionUrl = null)
        {
            var notif = new Notification
            {
                Title = title,
                Message = message,
                Type = type,
                Priority = priority,
                ActionUrl = actionUrl,
                IsAdminNotification = true,
                CreatedAt = DateTime.UtcNow
            };
            await _repo.AddAsync(notif);
        }

        // Actionable To-Do Generator for Admin (Scans low stock & out of stock products)
        public async Task SyncActionableAdminTodosAsync()
        {
            // Check for Low Stock (<= 5) & Out of Stock (<= 0)
            var depletedProducts = await _context.Products
                .Where(p => p.IsActive && p.StockQuantity <= 5)
                .ToListAsync();

            foreach (var p in depletedProducts)
            {
                string targetUrl = $"/admin/inventory?productId={p.Id}";
                bool exists = await _context.Notifications.AnyAsync(n => 
                    n.IsAdminNotification && 
                    n.Type == NotificationType.AdminLowStock && 
                    n.ActionUrl == targetUrl &&
                    !n.IsRead);

                if (!exists)
                {
                    bool isOutOfStock = p.StockQuantity <= 0;
                    await NotifyAdminAsync(
                        title: isOutOfStock ? $"🚨 Out of Stock: {p.Title}" : $"⚠️ Low Stock Alert: {p.Title}",
                        message: isOutOfStock 
                            ? $"Product is completely sold out (0 units in warehouse). Click to restock." 
                            : $"Only {p.StockQuantity} unit(s) remaining in warehouse. Click to restock.",
                        type: NotificationType.AdminLowStock,
                        priority: isOutOfStock ? NotificationPriority.Urgent : NotificationPriority.High,
                        actionUrl: targetUrl
                    );
                }
            }
        }

        private static NotificationDto MapToDto(Notification n)
        {
            return new NotificationDto
            {
                Id = n.Id,
                UserId = n.UserId,
                Title = n.Title,
                Message = n.Message,
                Type = n.Type.ToString(),
                Priority = n.Priority.ToString(),
                ActionUrl = n.ActionUrl,
                IsRead = n.IsRead,
                IsAdminNotification = n.IsAdminNotification,
                TimeAgo = GetTimeAgo(n.CreatedAt),
                CreatedAt = n.CreatedAt
            };
        }

        private static string GetTimeAgo(DateTime dt)
        {
            var span = DateTime.UtcNow - dt;
            if (span.TotalMinutes < 1) return "Just now";
            if (span.TotalMinutes < 60) return $"{(int)span.TotalMinutes}m ago";
            if (span.TotalHours < 24) return $"{(int)span.TotalHours}h ago";
            return dt.ToString("dd MMM");
        }
    }
}
