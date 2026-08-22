using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using ecommerce_backend.Data;
using ecommerce_backend.Models;
using ecommerce_backend.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace ecommerce_backend.Repositories.Implementations
{
    public class ReviewRepository : IReviewRepository
    {
        private readonly AppDbContext _context;

        public ReviewRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<Review?> GetByIdAsync(int id)
        {
            return await _context.Reviews
                .Include(r => r.User)
                .FirstOrDefaultAsync(r => r.Id == id);
        }

        public async Task<IEnumerable<Review>> GetByProductIdAsync(int productId)
        {
            return await _context.Reviews
                .Include(r => r.User)
                .Where(r => r.ProductId == productId)
                .OrderByDescending(r => r.CreatedAt)
                .ToListAsync();
        }

        public async Task<IEnumerable<Review>> GetByOrderIdAsync(int orderId, int userId)
        {
            return await _context.Reviews
                .Where(r => r.OrderId == orderId && r.UserId == userId)
                .ToListAsync();
        }

        public async Task<bool> HasUserReviewedProductInOrderAsync(int userId, int productId, int orderId)
        {
            return await _context.Reviews
                .AnyAsync(r => r.UserId == userId && r.ProductId == productId && r.OrderId == orderId);
        }

        public async Task<Review> AddAsync(Review review)
        {
            await _context.Reviews.AddAsync(review);
            await _context.SaveChangesAsync();
            await UpdateProductRatingAggregateAsync(review.ProductId);
            return review;
        }

        public async Task UpdateProductRatingAggregateAsync(int productId)
        {
            var product = await _context.Products.FindAsync(productId);
            if (product == null) return;

            var productReviews = await _context.Reviews
                .Where(r => r.ProductId == productId)
                .ToListAsync();

            if (productReviews.Any())
            {
                product.ReviewCount = productReviews.Count;
                product.Rating = Math.Round(productReviews.Average(r => r.Rating), 1);
            }
            else
            {
                product.ReviewCount = 0;
                product.Rating = 0.0;
            }

            product.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var review = await _context.Reviews.FindAsync(id);
            if (review == null) return false;

            int productId = review.ProductId;
            _context.Reviews.Remove(review);
            await _context.SaveChangesAsync();
            await UpdateProductRatingAggregateAsync(productId);
            return true;
        }
    }
}
