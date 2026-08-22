using ecommerce_backend.Data;
using ecommerce_backend.Models.common;
using ecommerce_backend.Dtos.Wishlist;
using ecommerce_backend.Models;
using ecommerce_backend.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace ecommerce_backend.Services.Implementations
{
    public class WishlistService : IWishlistService
    {
        private readonly AppDbContext _context;

        public WishlistService(AppDbContext context)
        {
            _context = context;
        }

        private async Task<Wishlist> GetOrCreateWishlistEntityAsync(int userId)
        {
            var wishlist = await _context.Wishlists
                .Include(w => w.Items)
                .ThenInclude(i => i.Product)
                .FirstOrDefaultAsync(w => w.UserId == userId);

            if (wishlist == null)
            {
                wishlist = new Wishlist { UserId = userId };
                _context.Wishlists.Add(wishlist);
                await _context.SaveChangesAsync();
            }

            return wishlist;
        }

        private WishlistDto MapToDto(Wishlist wishlist)
        {
            return new WishlistDto
            {
                Id = wishlist.Id,
                UserId = wishlist.UserId,
                Items = wishlist.Items.Select(i => new WishlistItemDto
                {
                    Id = i.Id,
                    ProductId = i.ProductId,
                    Title = i.Product?.Title ?? "Product",
                    Brand = i.Product?.Brand ?? "",
                    Price = i.Product?.Price ?? 0,
                    ImageUrl = i.Product?.ImageUrl ?? "",
                    StockQuantity = i.Product?.StockQuantity ?? 0,
                    AddedAt = i.AddedAt
                }).OrderByDescending(x => x.AddedAt).ToList()
            };
        }

        public async Task<ApiResponse<WishlistDto>> GetUserWishlistAsync(int userId)
        {
            var wishlist = await GetOrCreateWishlistEntityAsync(userId);
            return ApiResponse<WishlistDto>.SuccessResponse(
                MapToDto(wishlist),
                "Wishlist retrieved successfully."
            );
        }

        public async Task<ApiResponse<WishlistDto>> ToggleWishlistItemAsync(int userId, int productId)
        {
            var product = await _context.Products.FindAsync(productId);
            if (product == null)
                return ApiResponse<WishlistDto>.ErrorResponse("Product not found.", 404);

            var wishlist = await GetOrCreateWishlistEntityAsync(userId);
            var existingItem = wishlist.Items.FirstOrDefault(i => i.ProductId == productId);

            if (existingItem != null)
            {
                _context.WishlistItems.Remove(existingItem);
            }
            else
            {
                wishlist.Items.Add(new WishlistItem
                {
                    WishlistId = wishlist.Id,
                    ProductId = productId,
                    AddedAt = DateTime.UtcNow
                });
            }

            wishlist.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return ApiResponse<WishlistDto>.SuccessResponse(MapToDto(wishlist), existingItem != null ? "Removed from wishlist." : "Added to wishlist.");
        }

        public async Task<ApiResponse<WishlistDto>> RemoveFromWishlistAsync(int userId, int productId)
        {
            var wishlist = await GetOrCreateWishlistEntityAsync(userId);
            var item = wishlist.Items.FirstOrDefault(i => i.ProductId == productId);
            if (item != null)
            {
                _context.WishlistItems.Remove(item);
                wishlist.UpdatedAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();
            }

            return ApiResponse<WishlistDto>.SuccessResponse(MapToDto(wishlist), "Item removed.");
        }

        public async Task<ApiResponse<bool>> ClearWishlistAsync(int userId)
        {
            var wishlist = await _context.Wishlists
                .Include(w => w.Items)
                .FirstOrDefaultAsync(w => w.UserId == userId);

            if (wishlist != null && wishlist.Items.Any())
            {
                _context.WishlistItems.RemoveRange(wishlist.Items);
                wishlist.UpdatedAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();
            }

            return ApiResponse<bool>.SuccessResponse(true, "Wishlist cleared.");
        }
    }
}
