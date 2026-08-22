using System;
using System.Collections.Generic;

namespace ecommerce_backend.Dtos.Review
{
    public class ReviewResponseDto
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string UserName { get; set; } = string.Empty;
        public int ProductId { get; set; }
        public int OrderId { get; set; }
        public int Rating { get; set; }
        public string? Title { get; set; }
        public string Comment { get; set; } = string.Empty;
        public string? ImageUrl { get; set; }
        public bool IsVerifiedPurchase { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class ProductReviewSummaryDto
    {
        public double AverageRating { get; set; }
        public int TotalReviews { get; set; }
        public Dictionary<int, int> StarCounts { get; set; } = new Dictionary<int, int>();
        public List<ReviewResponseDto> Reviews { get; set; } = new List<ReviewResponseDto>();
    }
}
