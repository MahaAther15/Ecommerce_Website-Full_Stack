using System.ComponentModel.DataAnnotations;

namespace ecommerce_backend.Models
{
    public class Blog
    {
        [Key]
        [Required]
        [MaxLength(50)]
        public string Id { get; set; } = string.Empty;

        [Required]
        [MaxLength(250)]
        public string Title { get; set; } = string.Empty;

        [Required]
        [MaxLength(250)]
        public string Slug { get; set; } = string.Empty;

        [Required]
        [MaxLength(2000)]
        public string description { get; set; } = string.Empty;

        [MaxLength(500)]
        public string? ImageUrl { get; set; }

        [Required]
        public DateTime Date { get; set; }

        [Required]
        [MaxLength(100)]
        public string Author { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string AuthorRole { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string Category { get; set; } = string.Empty;

        [MaxLength(50)]
        public string ReadTime { get; set; } = "5 min read";

        [Required]
        [MaxLength(1000)]
        public string Quote { get; set; } = string.Empty;

        public List<string> FullContent { get; set; } = new();
        public List<string> KeyTakeAways { get; set; } = new();
    }
}