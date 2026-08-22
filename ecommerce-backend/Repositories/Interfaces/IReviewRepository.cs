using System.Collections.Generic;
using System.Threading.Tasks;
using ecommerce_backend.Models;

namespace ecommerce_backend.Repositories.Interfaces
{
    public interface IReviewRepository
    {
        Task<Review?> GetByIdAsync(int id);
        Task<IEnumerable<Review>> GetByProductIdAsync(int productId);
        Task<IEnumerable<Review>> GetByOrderIdAsync(int orderId, int userId);
        Task<bool> HasUserReviewedProductInOrderAsync(int userId, int productId, int orderId);
        Task<Review> AddAsync(Review review);
        Task UpdateProductRatingAggregateAsync(int productId);
        Task<bool> DeleteAsync(int id);
    }
}
