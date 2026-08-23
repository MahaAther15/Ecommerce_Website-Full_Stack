namespace ecommerce_backend.Dtos
{
    public class BlogDto
    {
        public string Id { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string Slug { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string? ImageUrl { get; set; }
        public string Date { get; set; } = string.Empty;
        public string Author { get; set; } = string.Empty;
        public string AuthorRole { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public string ReadTime { get; set; } = string.Empty;
        public string Quote { get; set; } = string.Empty;
        public List<string> FullContent { get; set; } = new();
        public List<string> KeyTakeAways { get; set; } = new();
    }
}
