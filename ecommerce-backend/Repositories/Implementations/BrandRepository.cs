using ecommerce_backend.Data;
using ecommerce_backend.Models;
using ecommerce_backend.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace ecommerce_backend.Repositories.Implementations
{
    public class BrandRepository : IBrandRepository
    {
        private readonly AppDbContext _context;

        public BrandRepository(AppDbContext context)
        {
            _context = context;
        }

        // 1. Get All Active Brands (Alphabetically Ordered)
        public async Task<List<Brand>> GetAllAsync()
        {
            return await _context.Brands
                .AsNoTracking()
                .Where(b => b.IsActive)
                .OrderBy(b => b.Name)
                .ToListAsync();
        }

        // 2. Get Brand by Primary Key ID
        public async Task<Brand?> GetByIdAsync(int id)
        {
            return await _context.Brands
                .FirstOrDefaultAsync(b => b.Id == id && b.IsActive);
        }

        // 3. Get Brand by URL Slug
        public async Task<Brand?> GetBySlugAsync(string slug)
        {
            return await _context.Brands
                .FirstOrDefaultAsync(b => b.Slug.ToLower() == slug.ToLower() && b.IsActive);
        }

        // 4. Add New Brand
        public async Task<Brand> AddAsync(Brand brand)
        {
            await _context.Brands.AddAsync(brand);
            await _context.SaveChangesAsync();
            return brand;
        }

        // 5. Update Existing Brand
        public async Task UpdateAsync(Brand brand)
        {
            brand.UpdatedAt = DateTime.UtcNow;
            _context.Brands.Update(brand);
            await _context.SaveChangesAsync();
        }

        // 6. Delete Brand (Soft Delete)
        public async Task DeleteAsync(Brand brand)
        {
            brand.IsActive = false;
            brand.UpdatedAt = DateTime.UtcNow;
            _context.Brands.Update(brand);
            await _context.SaveChangesAsync();
        }
    }
}
