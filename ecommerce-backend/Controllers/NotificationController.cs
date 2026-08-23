using System.Security.Claims;
using ecommerce_backend.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ecommerce_backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class NotificationController : ControllerBase
    {
        private readonly INotificationService _notificationService;

        public NotificationController(INotificationService notificationService)
        {
            _notificationService = notificationService;
        }

        // ── USER NOTIFICATIONS ──

        // 1. GET: api/notification/my (User notifications)
        [HttpGet("my")]
        public async Task<IActionResult> GetMyNotifications()
        {
            int userId = GetCurrentUserId();
            var res = await _notificationService.GetUserNotificationsAsync(userId);
            return Ok(res);
        }

        // 2. GET: api/notification/unread-count
        [HttpGet("unread-count")]
        public async Task<IActionResult> GetUnreadCount()
        {
            int userId = GetCurrentUserId();
            var res = await _notificationService.GetUserUnreadCountAsync(userId);
            return Ok(res);
        }

        // ── ADMIN NOTIFICATIONS & ACTIONABLE TO-DOS ──

        // 3. GET: api/notification/admin (Admin To-Dos & alerts)
        [Authorize(Roles = "Admin")]
        [HttpGet("admin")]
        public async Task<IActionResult> GetAdminNotifications()
        {
            var res = await _notificationService.GetAdminNotificationsAsync();
            return Ok(res);
        }

        // 4. GET: api/notification/admin/unread-count
        [Authorize(Roles = "Admin")]
        [HttpGet("admin/unread-count")]
        public async Task<IActionResult> GetAdminUnreadCount()
        {
            var res = await _notificationService.GetAdminUnreadCountAsync();
            return Ok(res);
        }

        // ── COMMON ACTIONS ──

        // 5. PUT: api/notification/{id}/read
        [HttpPut("{id}/read")]
        public async Task<IActionResult> MarkAsRead(int id)
        {
            var res = await _notificationService.MarkAsReadAsync(id);
            return Ok(res);
        }

        // 6. PUT: api/notification/mark-all-read
        [HttpPut("mark-all-read")]
        public async Task<IActionResult> MarkAllAsRead([FromQuery] bool isAdmin = false)
        {
            int userId = GetCurrentUserId();
            var res = await _notificationService.MarkAllAsReadAsync(userId, isAdmin);
            return Ok(res);
        }

        // 7. DELETE: api/notification/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteNotification(int id)
        {
            var res = await _notificationService.DeleteNotificationAsync(id);
            return Ok(res);
        }

        private int GetCurrentUserId()
        {
            var claim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return int.TryParse(claim, out int id) ? id : 0;
        }
    }
}
