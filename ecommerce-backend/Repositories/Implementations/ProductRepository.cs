using ecommerce_backend.Data;
using ecommerce_backend.Dtos.Product;
using ecommerce_backend.Models;
using ecommerce_backend.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace ecommerce_backend.Repositories.Implementations
{
    public class ProductRepository : IProductRepository
    {
        private readonly AppDbContext _context;

        public ProductRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<PagedResult<Product>> GetAllAsync(ProductFilterDto filter)
        {
            var query = _context.Products.AsNoTracking().Where(p => p.IsActive);

            // 1. Search filter
            if (!string.IsNullOrWhiteSpace(filter.Search))
            {
                var searchLower = filter.Search.Trim().ToLower();
                query = query.Where(p => p.Title.ToLower().Contains(searchLower) ||
                                         p.Description.ToLower().Contains(searchLower) ||
                                         p.Brand.ToLower().Contains(searchLower));
            }

            // 2. Category filter
            if (!string.IsNullOrWhiteSpace(filter.Category) && filter.Category.ToLower() != "all")
            {
                query = query.Where(p => p.Category.ToLower() == filter.Category.Trim().ToLower());
            }

            // 2b. Brand filter
            if (!string.IsNullOrWhiteSpace(filter.Brand) && filter.Brand.ToLower() != "all")
            {
                query = query.Where(p => p.Brand.ToLower() == filter.Brand.Trim().ToLower());
            }

            // 3. Price filter
            if (filter.MinPrice.HasValue)
                query = query.Where(p => p.Price >= filter.MinPrice.Value);

            if (filter.MaxPrice.HasValue)
                query = query.Where(p => p.Price <= filter.MaxPrice.Value);

            // 4. Sorting
            query = filter.SortBy?.ToLower() switch
            {
                "price_asc" or "price-low-high" or "low-to-high" => query.OrderBy(p => p.Price),
                "price_desc" or "price-high-low" or "high-to-low" => query.OrderByDescending(p => p.Price),
                "rating" or "best-rating" => query.OrderByDescending(p => p.Rating),
                "newest" or "new-arrivals" => query.OrderByDescending(p => p.CreatedAt),
                "title_asc" or "title-az" or "name-az" => query.OrderBy(p => p.Title),
                "title_desc" or "title-za" or "name-za" => query.OrderByDescending(p => p.Title),
                _ => query.OrderByDescending(p => p.Id)
            };

            var totalItems = await query.CountAsync();

            var items = await query
                .Skip((filter.PageNumber - 1) * filter.PageSize)
                .Take(filter.PageSize)
                .ToListAsync();

            return new PagedResult<Product>
            {
                Items = items,
                TotalItems = totalItems,
                PageNumber = filter.PageNumber,
                PageSize = filter.PageSize
            };
        }

        public async Task<Product?> GetByIdAsync(int id)
        {
            return await _context.Products.FirstOrDefaultAsync(p => p.Id == id && p.IsActive);
        }

        public async Task<List<string>> GetCategoriesAsync()
        {
            return await _context.Products
                .Where(p => p.IsActive)
                .Select(p => p.Category)
                .Distinct()
                .ToListAsync();
        }

        public async Task<List<Product>> GetFeaturedProductsAsync(int count)
        {
            return await _context.Products
                .AsNoTracking()
                .Where(p => p.IsActive && p.IsFeatured)
                .Take(count)
                .ToListAsync();
        }

        public async Task<Product> AddAsync(Product product)
        {
            await _context.Products.AddAsync(product);
            await _context.SaveChangesAsync();
            return product;
        }

        public async Task UpdateAsync(Product product)
        {
            product.UpdatedAt = DateTime.UtcNow;
            _context.Products.Update(product);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(Product product)
        {
            // Soft delete
            product.IsActive = false;
            product.UpdatedAt = DateTime.UtcNow;
            _context.Products.Update(product);
            await _context.SaveChangesAsync();
        }

        public async Task<bool> ExistsAsync(int id)
        {
            return await _context.Products.AnyAsync(p => p.Id == id && p.IsActive);
        }
    }
}
