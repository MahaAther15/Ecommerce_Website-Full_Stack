using System.ComponentModel.DataAnnotations;

namespace ecommerce_backend.Dtos.Product
{
    public class CreateProductDto
    {
        [Required(ErrorMessage = "Title is required")]
        [StringLength(150, MinimumLength = 3)]
        public string Title { get; set; } = string.Empty;

        [Required(ErrorMessage = "Brand is required")]
        public string Brand { get; set; } = string.Empty;

        [Required(ErrorMessage = "Description is required")]
        public string Description { get; set; } = string.Empty;

        [Required(ErrorMessage = "Price is required")]
        [Range(0.01, 1000000, ErrorMessage = "Price must be greater than 0")]
        public decimal Price { get; set; }

        public decimal? OriginalPrice { get; set; }

        [Required(ErrorMessage = "Category is required")]
        public string Category { get; set; } = string.Empty;

        [Required(ErrorMessage = "Image URL is required")]
        public string ImageUrl { get; set; } = string.Empty;

        [Range(0, 100000, ErrorMessage = "Stock cannot be negative")]
        public int StockQuantity { get; set; } = 0;

        public bool IsFeatured { get; set; } = false;
    }
}
