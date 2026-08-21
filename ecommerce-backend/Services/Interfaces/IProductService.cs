using ecommerce_backend.Dtos.Product;
using ecommerce_backend.Models.common;
namespace ecommerce_backend.Services.Interfaces
{
    public interface IProductService
    {
        Task<ApiResponse<PagedResult<ProductDto>>> GetProductsAsync(ProductFilterDto filter);
        Task<ApiResponse<ProductDto>> GetProductByIdAsync(int id);
        Task<ApiResponse<List<string>>> GetCategoriesAsync();
        Task<ApiResponse<List<ProductDto>>> GetFeaturedProductsAsync(int count);
        Task<ApiResponse<ProductDto>> CreateProductAsync(CreateProductDto dto);
        Task<ApiResponse<ProductDto>> UpdateProductAsync(int id, CreateProductDto dto);
        Task<ApiResponse<bool>> DeleteProductAsync(int id);
    }
}
