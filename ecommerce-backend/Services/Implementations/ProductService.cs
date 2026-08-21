using ecommerce_backend.Dtos.Product;
using ecommerce_backend.Models;
using ecommerce_backend.Models.common;
using ecommerce_backend.Repositories.Interfaces;
using ecommerce_backend.Services.Interfaces;

namespace ecommerce_backend.Services.Implementations
{
    public class ProductService : IProductService
    {
        private readonly IProductRepository _productRepository;

        public ProductService(IProductRepository productRepository)
        {
            _productRepository = productRepository;
        }

        public async Task<ApiResponse<PagedResult<ProductDto>>> GetProductsAsync(ProductFilterDto filter)
        {
            var pagedProducts = await _productRepository.GetAllAsync(filter);

            var mappedItems = pagedProducts.Items.Select(MapToDto).ToList();

            var result = new PagedResult<ProductDto>
            {
                Items = mappedItems,
                TotalItems = pagedProducts.TotalItems,
                PageNumber = pagedProducts.PageNumber,
                PageSize = pagedProducts.PageSize
            };

            return ApiResponse<PagedResult<ProductDto>>.SuccessResponse(result, "Products retrieved successfully.");
        }

        public async Task<ApiResponse<ProductDto>> GetProductByIdAsync(int id)
        {
            var product = await _productRepository.GetByIdAsync(id);
            if (product == null)
                return ApiResponse<ProductDto>.ErrorResponse("Product not found.", 404);

            return ApiResponse<ProductDto>.SuccessResponse(MapToDto(product), "Product fetched successfully.");
        }

        public async Task<ApiResponse<List<string>>> GetCategoriesAsync()
        {
            var categories = await _productRepository.GetCategoriesAsync();
            return ApiResponse<List<string>>.SuccessResponse(categories, "Categories retrieved.");
        }

        public async Task<ApiResponse<List<ProductDto>>> GetFeaturedProductsAsync(int count)
        {
            var products = await _productRepository.GetFeaturedProductsAsync(count);
            return ApiResponse<List<ProductDto>>.SuccessResponse(products.Select(MapToDto).ToList(), "Featured products retrieved.");
        }

        public async Task<ApiResponse<ProductDto>> CreateProductAsync(CreateProductDto dto)
        {
            var product = new Product
            {
                Title = dto.Title,
                Brand = dto.Brand,
                Description = dto.Description,
                Price = dto.Price,
                OriginalPrice = dto.OriginalPrice,
                Category = dto.Category,
                ImageUrl = dto.ImageUrl,
                StockQuantity = dto.StockQuantity,
                IsFeatured = dto.IsFeatured,
                CreatedAt = DateTime.UtcNow
            };

            var created = await _productRepository.AddAsync(product);
            return ApiResponse<ProductDto>.SuccessResponse(MapToDto(created), "Product created successfully.");
        }

        public async Task<ApiResponse<ProductDto>> UpdateProductAsync(int id, CreateProductDto dto)
        {
            var product = await _productRepository.GetByIdAsync(id);
            if (product == null)
                return ApiResponse<ProductDto>.ErrorResponse("Product not found.", 404);

            product.Title = dto.Title;
            product.Brand = dto.Brand;
            product.Description = dto.Description;
            product.Price = dto.Price;
            product.OriginalPrice = dto.OriginalPrice;
            product.Category = dto.Category;
            product.ImageUrl = dto.ImageUrl;
            product.StockQuantity = dto.StockQuantity;
            product.IsFeatured = dto.IsFeatured;

            await _productRepository.UpdateAsync(product);
            return ApiResponse<ProductDto>.SuccessResponse(MapToDto(product), "Product updated successfully.");
        }

        public async Task<ApiResponse<bool>> DeleteProductAsync(int id)
        {
            var product = await _productRepository.GetByIdAsync(id);
            if (product == null)
                return ApiResponse<bool>.ErrorResponse("Product not found.", 404);

            await _productRepository.DeleteAsync(product);
            return ApiResponse<bool>.SuccessResponse(true, "Product deleted successfully.");
        }

        private static ProductDto MapToDto(Product p) => new()
        {
            Id = p.Id,
            Title = p.Title,
            Brand = p.Brand,
            Description = p.Description,
            Price = p.Price,
            OriginalPrice = p.OriginalPrice,
            Category = p.Category,
            ImageUrl = p.ImageUrl,
            StockQuantity = p.StockQuantity,
            Rating = p.Rating,
            ReviewCount = p.ReviewCount,
            IsFeatured = p.IsFeatured
        };
    }
}
