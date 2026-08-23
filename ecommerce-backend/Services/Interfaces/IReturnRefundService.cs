using ecommerce_backend.Dtos.ReturnRefund;
using ecommerce_backend.Models.common;

namespace ecommerce_backend.Services.Interfaces
{
    public interface IReturnRefundService
    {
        Task<ApiResponse<ReturnRequestDto>> CreateReturnRequestAsync(int userId, CreateReturnRequestDto dto);
        Task<ApiResponse<ReturnRequestDto>> GetReturnRequestByOrderIdAsync(int userId, int orderId);
        Task<ApiResponse<IEnumerable<ReturnRequestDto>>> GetMyReturnRequestsAsync(int userId);
        
        // Admin Operations
        Task<ApiResponse<IEnumerable<ReturnRequestDto>>> GetAllReturnRequestsAsync();
        Task<ApiResponse<ReturnRequestDto>> UpdateReturnStatusAsync(int returnRequestId, UpdateReturnStatusDto dto);
    }
}
