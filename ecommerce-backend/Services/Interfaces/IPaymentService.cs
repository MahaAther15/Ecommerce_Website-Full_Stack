using ecommerce_backend.Dtos.Payment;
using ecommerce_backend.Models.common;

namespace ecommerce_backend.Services.Interfaces
{
    public interface IPaymentService
    {
        // 1. Order ke liye payment process karna
        Task<ApiResponse<PaymentResultDto>> ProcessPaymentAsync(int userId, ProcessPaymentDto dto);

        // 2. Kisi order ka payment status check karna
        Task<ApiResponse<PaymentResultDto>> GetPaymentStatusAsync(int userId, int orderId);
    }
}
