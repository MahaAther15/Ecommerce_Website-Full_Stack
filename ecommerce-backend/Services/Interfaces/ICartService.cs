using ecommerce_backend.Dtos.Cart;
using ecommerce_backend.Models.common;

namespace ecommerce_backend.Services.Interfaces
{
    public interface ICartService
    {
        Task<ApiResponse<CartDto>> GetCartAsync(int userId);
        Task<ApiResponse<CartDto>> AddToCartAsync(int userId, AddToCartDto dto);
        Task<ApiResponse<CartDto>> UpdateQuantityAsync(int userId, int productId, int quantity);
        Task<ApiResponse<CartDto>> RemoveFromCartAsync(int userId, int productId);
        Task<ApiResponse<bool>> ClearCartAsync(int userId);
    }
}
