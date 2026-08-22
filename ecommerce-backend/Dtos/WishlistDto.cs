namespace ecommerce_backend.Dtos.Wishlist
{
    public class WishlistItemDto
    {
        public int Id { get; set; }
        public int ProductId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Brand { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public string ImageUrl { get; set; } = string.Empty;
        public int StockQuantity { get; set; }
        public DateTime AddedAt { get; set; }
    }

    public class WishlistDto
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public List<WishlistItemDto> Items { get; set; } = new();
        public int TotalItems => Items.Count;
    }

    public class AddToWishlistDto
    {
        public int ProductId { get; set; }
    }
}
