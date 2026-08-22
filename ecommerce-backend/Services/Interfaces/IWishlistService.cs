using System.Threading.Tasks;
using ecommerce_backend.Dtos.Wishlist;
using ecommerce_backend.Models.common;

namespace ecommerce_backend.Services.Interfaces
{
    public interface IWishlistService
    {
        Task<ApiResponse<WishlistDto>> GetUserWishlistAsync(int userId);
        Task<ApiResponse<WishlistDto>> ToggleWishlistItemAsync(int userId, int productId);
        Task<ApiResponse<WishlistDto>> RemoveFromWishlistAsync(int userId, int productId);
        Task<ApiResponse<bool>> ClearWishlistAsync(int userId);
    }
}
