using Microsoft.AspNetCore.Http;

namespace ecommerce_backend.Dtos
{
    public class UpdateBlogDto
    {
        public string? Title { get; set; }
        public string? Description { get; set; }
        public string? Category { get; set; }
        public string? Author { get; set; }
        public string? AuthorRole { get; set; }
        public string? ReadTime { get; set; }
        public string? Quote { get; set; }
        public List<string>? FullContent { get; set; }
        public List<string>? KeyTakeAways { get; set; }
        public IFormFile? ImageFile { get; set; }
        public string? ImageUrl { get; set; }
    }
}
