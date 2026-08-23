using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;

namespace ecommerce_backend.Dtos
{
    public class CreateBlogDto
    {
        [Required(ErrorMessage = "Title is required")]
        [MaxLength(200)]
        public string Title { get; set; } = string.Empty;

        [Required(ErrorMessage = "Description is required")]
        [MaxLength(500)]
        public string Description { get; set; } = string.Empty;

        [Required(ErrorMessage = "Category is required")]
        public string Category { get; set; } = string.Empty;

        [Required(ErrorMessage = "Author name is required")]
        public string Author { get; set; } = string.Empty;

        [Required(ErrorMessage = "Author role is required")]
        public string AuthorRole { get; set; } = string.Empty;

        public string ReadTime { get; set; } = "5 min read";

        [Required(ErrorMessage = "Quote is required")]
        public string Quote { get; set; } = string.Empty;

        public List<string> FullContent { get; set; } = new();
        public List<string> KeyTakeAways { get; set; } = new();

        // Cloudinary Image Upload (File or fallback URL)
        public IFormFile? ImageFile { get; set; }
        public string? ImageUrl { get; set; }
    }
}
