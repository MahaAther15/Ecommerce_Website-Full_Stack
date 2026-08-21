using ecommerce_backend.Dtos.Cart;
using ecommerce_backend.Models;
using ecommerce_backend.Models.common;
using ecommerce_backend.Repositories.Interfaces;
using ecommerce_backend.Services.Interfaces;

namespace ecommerce_backend.Services.Implementations
{
    public class CartService : ICartService
    {
        private readonly ICartRepository _cartRepo;
        private readonly IProductRepository _productRepo;

        public CartService(ICartRepository cartRepo, IProductRepository productRepo)
        {
            _cartRepo = cartRepo;
            _productRepo = productRepo;
        }

        public async Task<ApiResponse<CartDto>> GetCartAsync(int userId)
        {
            var cart = await GetOrCreateCartAsync(userId);
            return ApiResponse<CartDto>.SuccessResponse(MapToDto(cart), "Cart fetched successfully.");
        }

        public async Task<ApiResponse<CartDto>> AddToCartAsync(int userId, AddToCartDto dto)
        {
            var product = await _productRepo.GetByIdAsync(dto.ProductId);
            if (product == null || !product.IsActive)
                return ApiResponse<CartDto>.ErrorResponse("Product not found or inactive.", 404);

            var cart = await GetOrCreateCartAsync(userId);
            var existingItem = await _cartRepo.GetCartItemAsync(cart.Id, dto.ProductId);

            int targetQuantity = (existingItem?.Quantity ?? 0) + dto.Quantity;
            if (product.StockQuantity < targetQuantity)
                return ApiResponse<CartDto>.ErrorResponse($"Only {product.StockQuantity} units in stock.", 400);

            if (existingItem != null)
            {
                existingItem.Quantity = targetQuantity;
                await _cartRepo.UpdateCartItemAsync(existingItem);
            }
            else
            {
                var newItem = new CartItem
                {
                    CartId = cart.Id,
                    ProductId = dto.ProductId,
                    Quantity = dto.Quantity,
                    CreatedAt = DateTime.UtcNow
                };
                await _cartRepo.AddCartItemAsync(newItem);
            }

            var updatedCart = await _cartRepo.GetCartByUserIdAsync(userId);
            return ApiResponse<CartDto>.SuccessResponse(MapToDto(updatedCart!), "Item added to cart.");
        }

        public async Task<ApiResponse<CartDto>> UpdateQuantityAsync(int userId, int productId, int quantity)
        {
            var cart = await GetOrCreateCartAsync(userId);
            var existingItem = await _cartRepo.GetCartItemAsync(cart.Id, productId);
            if (existingItem == null)
                return ApiResponse<CartDto>.ErrorResponse("Item not found in cart.", 404);

            var product = await _productRepo.GetByIdAsync(productId);
            if (product != null && product.StockQuantity < quantity)
                return ApiResponse<CartDto>.ErrorResponse($"Only {product.StockQuantity} units in stock.", 400);

            if (quantity <= 0)
            {
                await _cartRepo.DeleteCartItemAsync(existingItem);
            }
            else
            {
                existingItem.Quantity = quantity;
                await _cartRepo.UpdateCartItemAsync(existingItem);
            }

            var updatedCart = await _cartRepo.GetCartByUserIdAsync(userId);
            return ApiResponse<CartDto>.SuccessResponse(MapToDto(updatedCart!), "Cart quantity updated.");
        }

        public async Task<ApiResponse<CartDto>> RemoveFromCartAsync(int userId, int productId)
        {
            var cart = await GetOrCreateCartAsync(userId);
            var existingItem = await _cartRepo.GetCartItemAsync(cart.Id, productId);
            if (existingItem == null)
                return ApiResponse<CartDto>.ErrorResponse("Item not found in cart.", 404);

            await _cartRepo.DeleteCartItemAsync(existingItem);
            var updatedCart = await _cartRepo.GetCartByUserIdAsync(userId);
            return ApiResponse<CartDto>.SuccessResponse(MapToDto(updatedCart!), "Item removed from cart.");
        }

        public async Task<ApiResponse<bool>> ClearCartAsync(int userId)
        {
            var cart = await GetOrCreateCartAsync(userId);
            await _cartRepo.ClearCartAsync(cart.Id);
            return ApiResponse<bool>.SuccessResponse(true, "Cart cleared successfully.");
        }

        private async Task<Cart> GetOrCreateCartAsync(int userId)
        {
            var cart = await _cartRepo.GetCartByUserIdAsync(userId);
            if (cart == null)
            {
                cart = await _cartRepo.CreateCartAsync(userId);
                cart = await _cartRepo.GetCartByUserIdAsync(userId);
            }
            return cart!;
        }

        private static CartDto MapToDto(Cart cart)
        {
            return new CartDto
            {
                Id = cart.Id,
                UserId = cart.UserId,
                Items = cart.Items.Select(i => new CartItemDto
                {
                    Id = i.Id,
                    ProductId = i.ProductId,
                    Title = i.Product?.Title ?? "",
                    Brand = i.Product?.Brand ?? "",
                    Price = i.Product?.Price ?? 0,
                    ImageUrl = i.Product?.ImageUrl ?? "",
                    Quantity = i.Quantity,
                    StockQuantity = i.Product?.StockQuantity ?? 0
                }).ToList()
            };
        }
    }
}
