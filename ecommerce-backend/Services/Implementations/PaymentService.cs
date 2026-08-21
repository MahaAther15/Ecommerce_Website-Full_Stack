using ecommerce_backend.Dtos.Payment;
using ecommerce_backend.Models;
using ecommerce_backend.Models.common;
using ecommerce_backend.Repositories.Interfaces;
using ecommerce_backend.Services.Interfaces;

namespace ecommerce_backend.Services.Implementations
{
    public class PaymentService : IPaymentService
    {
        private readonly IOrderRepository _orderRepo;

        public PaymentService(IOrderRepository orderRepo)
        {
            _orderRepo = orderRepo;
        }

        public async Task<ApiResponse<PaymentResultDto>> ProcessPaymentAsync(int userId, ProcessPaymentDto dto)
        {
            // 1. Order fetch karo
            var order = await _orderRepo.GetOrderByIdAsync(dto.OrderId);
            if (order == null)
            {
                return ApiResponse<PaymentResultDto>.ErrorResponse("Order not found.", 404);
            }

            // 2. Check karo ke order usi logged-in user ka hai ya nahi
            if (order.UserId != userId)
            {
                return ApiResponse<PaymentResultDto>.ErrorResponse("Unauthorized to make payment for this order.", 403);
            }

            // 3. Check karo kahin order pehle se to Paid nahi hai
            if (order.IsPaid)
            {
                return ApiResponse<PaymentResultDto>.ErrorResponse("This order is already marked as paid.", 400);
            }

            // 4. Order Cancelled to nahi hai
            if (order.Status == OrderStatus.Cancelled)
            {
                return ApiResponse<PaymentResultDto>.ErrorResponse("Cannot process payment for a cancelled order.", 400);
            }

            // 5. Payment Process Logic (Card / JazzCash / EasyPaisa / COD)
            string transactionId = $"TXN-{Guid.NewGuid().ToString().Substring(0, 8).ToUpper()}";

            if (dto.PaymentMethod == "Cash On Delivery")
            {
                // COD ke case mein IsPaid false rahega jab tak delivery na ho jaye
                order.PaymentMethod = "Cash On Delivery";
                order.Status = OrderStatus.Confirmed;
            }
            else
            {
                // Card / JazzCash / EasyPaisa ke case mein immediate success & marked paid
                order.PaymentMethod = dto.PaymentMethod;
                order.IsPaid = true;
                order.PaidAt = DateTime.UtcNow;
                order.Status = OrderStatus.Confirmed;
            }

            order.UpdatedAt = DateTime.UtcNow;
            await _orderRepo.UpdateOrderAsync(order);

            var result = new PaymentResultDto
            {
                OrderId = order.Id,
                TransactionId = transactionId,
                AmountPaid = order.FinalAmount,
                PaymentMethod = order.PaymentMethod,
                Status = order.IsPaid ? "Paid" : "Pending COD",
                PaidAt = order.PaidAt ?? DateTime.UtcNow
            };

            return ApiResponse<PaymentResultDto>.SuccessResponse(result, "Payment processed successfully!");
        }

        public async Task<ApiResponse<PaymentResultDto>> GetPaymentStatusAsync(int userId, int orderId)
        {
            var order = await _orderRepo.GetOrderByIdAsync(orderId);
            if (order == null)
            {
                return ApiResponse<PaymentResultDto>.ErrorResponse("Order not found.", 404);
            }

            if (order.UserId != userId)
            {
                return ApiResponse<PaymentResultDto>.ErrorResponse("Unauthorized.", 403);
            }

            var result = new PaymentResultDto
            {
                OrderId = order.Id,
                TransactionId = $"TXN-HIST-{order.Id}",
                AmountPaid = order.FinalAmount,
                PaymentMethod = order.PaymentMethod,
                Status = order.IsPaid ? "Paid" : "Pending",
                PaidAt = order.PaidAt ?? order.CreatedAt
            };

            return ApiResponse<PaymentResultDto>.SuccessResponse(result, "Payment details fetched.");
        }
    }
}
