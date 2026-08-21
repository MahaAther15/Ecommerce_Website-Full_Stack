using ecommerce_backend.Dtos.Product;
using ecommerce_backend.Models;

namespace ecommerce_backend.Repositories.Interfaces
{
    public interface IProductRepository
    {
        Task<PagedResult<Product>> GetAllAsync(ProductFilterDto filter);
        Task<Product?> GetByIdAsync(int id);
        Task<List<string>> GetCategoriesAsync();
        Task<List<Product>> GetFeaturedProductsAsync(int count);
        Task<Product> AddAsync(Product product);
        Task UpdateAsync(Product product);
        Task DeleteAsync(Product product);
        Task<bool> ExistsAsync(int id);
    }
}
