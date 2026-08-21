using ecommerce_backend.Models;

namespace ecommerce_backend.Repositories.Interfaces
{
    public interface IBrandRepository
    {
        Task<List<Brand>> GetAllAsync();
        Task<Brand?> GetByIdAsync(int id);
        Task<Brand?> GetBySlugAsync(string slug);
        Task<Brand> AddAsync(Brand brand);
Task UpdateAsync(Brand brand);
Task DeleteAsync(Brand brand);
    }
}
