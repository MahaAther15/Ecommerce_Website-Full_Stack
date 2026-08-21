using ecommerce_backend.Dtos.Order;
using ecommerce_backend.Models;
using ecommerce_backend.Models.common;

namespace ecommerce_backend.Services.Interfaces
{
    public interface IOrderService
    {
        Task<ApiResponse<OrderDto>> PlaceOrderAsync(int userId, PlaceOrderDto dto);
        Task<ApiResponse<OrderDto>> GetOrderByIdAsync(int userId, int orderId);
        Task<ApiResponse<IEnumerable<OrderDto>>> GetMyOrdersAsync(int userId);
        Task<ApiResponse<IEnumerable<OrderDto>>> GetAllOrdersAsync(); // Admin
        Task<ApiResponse<OrderDto>> UpdateOrderStatusAsync(int orderId, UpdateOrderStatusDto dto); // Admin
        Task<ApiResponse<bool>> CancelOrderAsync(int userId, int orderId);
    }
}
