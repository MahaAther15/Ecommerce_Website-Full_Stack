using System.Collections.Generic;
using System.Threading.Tasks;
using ecommerce_backend.Dtos.Review;
using ecommerce_backend.Models.common;

namespace ecommerce_backend.Services.Interfaces
{
    public interface IReviewService
    {
        Task<ApiResponse<ReviewResponseDto>> AddReviewAsync(int userId, CreateReviewDto dto);
        Task<ApiResponse<ProductReviewSummaryDto>> GetProductReviewsAsync(int productId);
        Task<ApiResponse<IEnumerable<ReviewResponseDto>>> GetOrderReviewsAsync(int orderId, int userId);
        Task<ApiResponse<bool>> DeleteReviewAsync(int userId, int reviewId, bool isAdmin);
    }
}
