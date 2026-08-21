using ecommerce_backend.Models;

namespace ecommerce_backend.Repositories.Interfaces
{
    public interface ICartRepository
    {
        Task<Cart?> GetCartByUserIdAsync(int userId);
        Task<Cart> CreateCartAsync(int userId);
        Task<CartItem?> GetCartItemAsync(int cartId, int productId);
        Task AddCartItemAsync(CartItem item);
        Task UpdateCartItemAsync(CartItem item);
        Task DeleteCartItemAsync(CartItem item);
        Task ClearCartAsync(int cartId);
    }
}
