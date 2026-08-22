using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using ecommerce_backend.Data;
using ecommerce_backend.Dtos.Review;
using ecommerce_backend.Models;
using ecommerce_backend.Models.common;
using ecommerce_backend.Repositories.Interfaces;
using ecommerce_backend.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace ecommerce_backend.Services.Implementations
{
    public class ReviewService : IReviewService
    {
        private readonly IReviewRepository _reviewRepo;
        private readonly IPhotoService _photoService;
        private readonly AppDbContext _context;

        public ReviewService(IReviewRepository reviewRepo, IPhotoService photoService, AppDbContext context)
        {
            _reviewRepo = reviewRepo;
            _photoService = photoService;
            _context = context;
        }

        public async Task<ApiResponse<ReviewResponseDto>> AddReviewAsync(int userId, CreateReviewDto dto)
        {
            // 1. Check order existence and status
            var order = await _context.Orders
                .Include(o => o.OrderItems)
                .FirstOrDefaultAsync(o => o.Id == dto.OrderId && o.UserId == userId);

            if (order == null)
            {
                return ApiResponse<ReviewResponseDto>.Fail("Order not found or does not belong to you.");
            }

            if (order.Status != OrderStatus.Delivered)
            {
                return ApiResponse<ReviewResponseDto>.Fail("You can only review products from orders that have been Delivered.");
            }

            // 2. Ensure product was actually in this order
            var hasPurchased = order.OrderItems.Any(oi => oi.ProductId == dto.ProductId);
            if (!hasPurchased)
            {
                return ApiResponse<ReviewResponseDto>.Fail("This product was not part of this order.");
            }

            // 3. Check for duplicate review for this order
            var alreadyReviewed = await _reviewRepo.HasUserReviewedProductInOrderAsync(userId, dto.ProductId, dto.OrderId);
            if (alreadyReviewed)
            {
                return ApiResponse<ReviewResponseDto>.Fail("You have already reviewed this product for this order.");
            }

            // 4. Handle Cloudinary Photo Upload if provided
            string? imageUrl = null;
            string? imagePublicId = null;

            if (dto.Image != null && dto.Image.Length > 0)
            {
                var uploadResult = await _photoService.AddPhotoAsync(dto.Image);
                if (uploadResult.Error != null)
                {
                    return ApiResponse<ReviewResponseDto>.Fail($"Image upload failed: {uploadResult.Error.Message}");
                }
                imageUrl = uploadResult.SecureUrl.ToString();
                imagePublicId = uploadResult.PublicId;
            }

            // 5. Create Review Entity
            var review = new Review
            {
                UserId = userId,
                ProductId = dto.ProductId,
                OrderId = dto.OrderId,
                Rating = dto.Rating,
                Title = dto.Title,
                Comment = dto.Comment,
                ImageUrl = imageUrl,
                ImagePublicId = imagePublicId,
                IsVerifiedPurchase = true,
                CreatedAt = DateTime.UtcNow
            };

            await _reviewRepo.AddAsync(review);

            var user = await _context.Users.FindAsync(userId);

            var responseDto = new ReviewResponseDto
            {
                Id = review.Id,
                UserId = review.UserId,
                UserName = user?.FullName ?? "Customer",
                ProductId = review.ProductId,
                OrderId = review.OrderId,
                Rating = review.Rating,
                Title = review.Title,
                Comment = review.Comment,
                ImageUrl = review.ImageUrl,
                IsVerifiedPurchase = review.IsVerifiedPurchase,
                CreatedAt = review.CreatedAt
            };

            return ApiResponse<ReviewResponseDto>.SuccessResponse(responseDto, "Review submitted successfully!");
        }

        public async Task<ApiResponse<ProductReviewSummaryDto>> GetProductReviewsAsync(int productId)
        {
            var reviews = (await _reviewRepo.GetByProductIdAsync(productId)).ToList();

            var starCounts = new Dictionary<int, int> { { 5, 0 }, { 4, 0 }, { 3, 0 }, { 2, 0 }, { 1, 0 } };
            foreach (var r in reviews)
            {
                if (starCounts.ContainsKey(r.Rating))
                    starCounts[r.Rating]++;
            }

            var summary = new ProductReviewSummaryDto
            {
                TotalReviews = reviews.Count,
                AverageRating = reviews.Any() ? Math.Round(reviews.Average(r => r.Rating), 1) : 0.0,
                StarCounts = starCounts,
                Reviews = reviews.Select(r => new ReviewResponseDto
                {
                    Id = r.Id,
                    UserId = r.UserId,
                    UserName = r.User?.FullName ?? "Anonymous",
                    ProductId = r.ProductId,
                    OrderId = r.OrderId,
                    Rating = r.Rating,
                    Title = r.Title,
                    Comment = r.Comment,
                    ImageUrl = r.ImageUrl,
                    IsVerifiedPurchase = r.IsVerifiedPurchase,
                    CreatedAt = r.CreatedAt
                }).ToList()
            };

            return ApiResponse<ProductReviewSummaryDto>.SuccessResponse(summary, "Product reviews retrieved successfully.");
        }

        public async Task<ApiResponse<IEnumerable<ReviewResponseDto>>> GetOrderReviewsAsync(int orderId, int userId)
        {
            var reviews = await _reviewRepo.GetByOrderIdAsync(orderId, userId);
            var result = reviews.Select(r => new ReviewResponseDto
            {
                Id = r.Id,
                UserId = r.UserId,
                ProductId = r.ProductId,
                OrderId = r.OrderId,
                Rating = r.Rating,
                Title = r.Title,
                Comment = r.Comment,
                ImageUrl = r.ImageUrl,
                IsVerifiedPurchase = r.IsVerifiedPurchase,
                CreatedAt = r.CreatedAt
            });

            return ApiResponse<IEnumerable<ReviewResponseDto>>.SuccessResponse(result, "Order reviews retrieved.");
        }

        public async Task<ApiResponse<bool>> DeleteReviewAsync(int userId, int reviewId, bool isAdmin)
        {
            var review = await _reviewRepo.GetByIdAsync(reviewId);
            if (review == null) return ApiResponse<bool>.Fail("Review not found.");

            if (review.UserId != userId && !isAdmin)
            {
                return ApiResponse<bool>.Fail("You are not authorized to delete this review.");
            }

            if (!string.IsNullOrEmpty(review.ImagePublicId))
            {
                await _photoService.DeletePhotoAsync(review.ImagePublicId);
            }

            await _reviewRepo.DeleteAsync(reviewId);
            return ApiResponse<bool>.SuccessResponse(true, "Review deleted successfully.");
        }
    }
}
