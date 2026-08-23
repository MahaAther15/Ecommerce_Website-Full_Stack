using ecommerce_backend.Data;
using ecommerce_backend.Dtos.Order;
using ecommerce_backend.Dtos.ReturnRefund;
using ecommerce_backend.Models;
using ecommerce_backend.Models.common;
using ecommerce_backend.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace ecommerce_backend.Services.Implementations
{
    public class ReturnRefundService : IReturnRefundService
    {
        private readonly AppDbContext _context;
        private readonly INotificationService _notificationService;

        public ReturnRefundService(AppDbContext context, INotificationService notificationService)
        {
            _context = context;
            _notificationService = notificationService;
        }

        public async Task<ApiResponse<ReturnRequestDto>> CreateReturnRequestAsync(int userId, CreateReturnRequestDto dto)
        {
            // 1. Verify Order exists and belongs to User
            var order = await _context.Orders
                .Include(o => o.OrderItems)
                .ThenInclude(i => i.Product)
                .Include(o => o.User)
                .FirstOrDefaultAsync(o => o.Id == dto.OrderId && o.UserId == userId);

            if (order == null)
            {
                return new ApiResponse<ReturnRequestDto> { Success = false, Message = "Order not found or unauthorized access." };
            }

            // 2. Validate Order is in Delivered status
            if (order.Status != OrderStatus.Delivered)
            {
                return new ApiResponse<ReturnRequestDto> { Success = false, Message = "Returns can only be requested for 'Delivered' orders." };
            }

            // 3. Check if return request already exists
            var existingRequest = await _context.ReturnRequests.FirstOrDefaultAsync(r => r.OrderId == dto.OrderId);
            if (existingRequest != null)
            {
                return new ApiResponse<ReturnRequestDto> { Success = false, Message = "A return request has already been submitted for this order." };
            }

            // 4. Create Return Request
            var returnRequest = new ReturnRequest
            {
                OrderId = order.Id,
                UserId = userId,
                Reason = dto.Reason,
                Comments = dto.Comments,
                RefundAccountDetails = dto.RefundAccountDetails,
                RefundAmount = order.FinalAmount,
                Status = ReturnStatus.Pending,
                CreatedAt = DateTime.UtcNow
            };

            _context.ReturnRequests.Add(returnRequest);
            await _context.SaveChangesAsync();

            // Trigger Notification
            try
            {
                await _notificationService.NotifyUserAsync(
                    userId: userId,
                    title: "Return Request Submitted",
                    message: $"Your return request for Order #{order.OrderNumber} has been received.",
                    type: NotificationType.RefundApproved,
                    actionUrl: $"/orders/{order.Id}"
                );

                await _notificationService.NotifyAdminAsync(
                    title: "New Return Request! ⚠️",
                    message: $"User #{userId} requested return for Order #{order.OrderNumber}. Reason: {dto.Reason}",
                    type: NotificationType.AdminReturnRequest,
                    priority: NotificationPriority.High,
                    actionUrl: "/admin/returns"
                );
            }
            catch { /* non-blocking */ }

            return new ApiResponse<ReturnRequestDto>
            {
                Success = true,
                Message = "Return and refund request submitted successfully.",
                Data = MapToDto(returnRequest, order)
            };
        }

        public async Task<ApiResponse<ReturnRequestDto>> GetReturnRequestByOrderIdAsync(int userId, int orderId)
        {
            var req = await _context.ReturnRequests
                .Include(r => r.Order)
                    .ThenInclude(o => o.OrderItems)
                    .ThenInclude(i => i.Product)
                .Include(r => r.User)
                .FirstOrDefaultAsync(r => r.OrderId == orderId && r.UserId == userId);

            if (req == null)
            {
                return new ApiResponse<ReturnRequestDto> { Success = false, Message = "No return request found for this order." };
            }

            return new ApiResponse<ReturnRequestDto> { Success = true, Data = MapToDto(req, req.Order) };
        }

        public async Task<ApiResponse<IEnumerable<ReturnRequestDto>>> GetMyReturnRequestsAsync(int userId)
        {
            var requests = await _context.ReturnRequests
                .Include(r => r.Order)
                .Include(r => r.User)
                .Where(r => r.UserId == userId)
                .OrderByDescending(r => r.CreatedAt)
                .ToListAsync();

            var dtos = requests.Select(r => MapToDto(r, r.Order));
            return new ApiResponse<IEnumerable<ReturnRequestDto>> { Success = true, Data = dtos };
        }

        public async Task<ApiResponse<IEnumerable<ReturnRequestDto>>> GetAllReturnRequestsAsync()
        {
            var requests = await _context.ReturnRequests
                .Include(r => r.Order)
                    .ThenInclude(o => o.OrderItems)
                    .ThenInclude(i => i.Product)
                .Include(r => r.User)
                .OrderByDescending(r => r.CreatedAt)
                .ToListAsync();

            var dtos = requests.Select(r => MapToDto(r, r.Order));
            return new ApiResponse<IEnumerable<ReturnRequestDto>> { Success = true, Data = dtos };
        }

        public async Task<ApiResponse<ReturnRequestDto>> UpdateReturnStatusAsync(int returnRequestId, UpdateReturnStatusDto dto)
        {
            var returnRequest = await _context.ReturnRequests
                .Include(r => r.Order)
                .Include(r => r.User)
                .FirstOrDefaultAsync(r => r.Id == returnRequestId);

            if (returnRequest == null)
            {
                return new ApiResponse<ReturnRequestDto> { Success = false, Message = "Return request not found." };
            }

            returnRequest.Status = dto.Status;
            returnRequest.AdminNotes = dto.AdminNotes;
            returnRequest.ProcessedAt = DateTime.UtcNow;

            // If Admin marks as Refunded, update order status as well
            if (dto.Status == ReturnStatus.Refunded)
            {
                returnRequest.Order.Status = OrderStatus.Refunded;
                returnRequest.Order.UpdatedAt = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();

            // Notify user about return / refund decision
            try
            {
                var title = dto.Status == ReturnStatus.Refunded ? "Refund Processed! 💰" : $"Return Request {dto.Status}";
                var msg = dto.Status == ReturnStatus.Refunded 
                    ? $"Your refund of ${returnRequest.RefundAmount:F2} has been processed." 
                    : $"Your return request status has been updated to: {dto.Status}";

                await _notificationService.NotifyUserAsync(
                    userId: returnRequest.UserId,
                    title: title,
                    message: msg,
                    type: NotificationType.RefundApproved,
                    actionUrl: $"/orders/{returnRequest.OrderId}"
                );
            }
            catch { /* non-blocking */ }

            return new ApiResponse<ReturnRequestDto>
            {
                Success = true,
                Message = $"Return request status updated to {dto.Status}.",
                Data = MapToDto(returnRequest, returnRequest.Order)
            };
        }

        private static ReturnRequestDto MapToDto(ReturnRequest req, Order order)
        {
            return new ReturnRequestDto
            {
                Id = req.Id,
                OrderId = req.OrderId,
                OrderNumber = order?.OrderNumber ?? $"ORD-{10000 + req.OrderId}",
                UserId = req.UserId,
                UserFullName = req.User?.FullName ?? "N/A",
                UserEmail = req.User?.Email ?? "N/A",
                Reason = req.Reason.ToString(),
                Comments = req.Comments,
                RefundAmount = req.RefundAmount,
                Status = req.Status.ToString(),
                AdminNotes = req.AdminNotes,
                RefundAccountDetails = req.RefundAccountDetails,
                CreatedAt = req.CreatedAt,
                ProcessedAt = req.ProcessedAt
            };
        }
    }
}
