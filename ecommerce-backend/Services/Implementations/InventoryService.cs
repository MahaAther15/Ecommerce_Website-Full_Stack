using ecommerce_backend.Data;
using ecommerce_backend.Dtos.Inventory;
using ecommerce_backend.Models;
using ecommerce_backend.Models.common;
using ecommerce_backend.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace ecommerce_backend.Services.Implementations
{
    public class InventoryService : IInventoryService
    {
        private readonly AppDbContext _context;

        public InventoryService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<ApiResponse<InventorySummaryDto>> GetSummaryAsync()
        {
            var products = await _context.Products.Where(p => p.IsActive).ToListAsync();

            var summary = new InventorySummaryDto
            {
                TotalProducts = products.Count,
                InStockProducts = products.Count(p => p.StockQuantity > 5),
                LowStockProducts = products.Count(p => p.StockQuantity > 0 && p.StockQuantity <= 5),
                OutOfStockProducts = products.Count(p => p.StockQuantity <= 0),
                TotalStockUnits = products.Sum(p => p.StockQuantity)
            };

            return ApiResponse<InventorySummaryDto>.SuccessResponse(summary, "Summary retrieved.");
        }

        public async Task<ApiResponse<IEnumerable<InventoryItemDto>>> GetAllInventoryAsync(string? filter = "all", string? search = null)
        {
            var query = _context.Products.Where(p => p.IsActive).AsQueryable();

            if (!string.IsNullOrWhiteSpace(search))
            {
                search = search.Trim().ToLower();
                query = query.Where(p => p.Title.ToLower().Contains(search) || p.Category.ToLower().Contains(search) || p.Brand.ToLower().Contains(search));
            }

            if (filter?.ToLower() == "lowstock")
                query = query.Where(p => p.StockQuantity > 0 && p.StockQuantity <= 5);
            else if (filter?.ToLower() == "outofstock")
                query = query.Where(p => p.StockQuantity <= 0);

            var list = await query
                .OrderBy(p => p.StockQuantity) // Low stock items first
                .Select(p => new InventoryItemDto
                {
                    ProductId = p.Id,
                    Title = p.Title,
                    Category = p.Category,
                    Brand = p.Brand,
                    Price = p.Price,
                    ImageUrl = p.ImageUrl,
                    StockQuantity = p.StockQuantity,
                    LastUpdated = p.UpdatedAt ?? p.CreatedAt
                }).ToListAsync();

            return ApiResponse<IEnumerable<InventoryItemDto>>.SuccessResponse(list, "Inventory list retrieved.");
        }

        public async Task<ApiResponse<InventoryItemDto>> AdjustStockAsync(AdjustStockDto dto)
        {
            var product = await _context.Products.FindAsync(dto.ProductId);
            if (product == null)
                return ApiResponse<InventoryItemDto>.ErrorResponse("Product not found.", 404);

            int previousStock = product.StockQuantity;
            int newStock = previousStock + dto.Quantity;

            if (newStock < 0)
                return ApiResponse<InventoryItemDto>.ErrorResponse($"Cannot reduce stock below 0. Current stock is {previousStock}.", 400);

            // Update Product
            product.StockQuantity = newStock;
            product.UpdatedAt = DateTime.UtcNow;

            // Create Audit Log
            var log = new InventoryLog
            {
                ProductId = product.Id,
                Action = dto.Action,
                QuantityChanged = dto.Quantity,
                PreviousStock = previousStock,
                NewStock = newStock,
                Note = string.IsNullOrWhiteSpace(dto.Note) ? $"{dto.Action} adjustment" : dto.Note,
                CreatedAt = DateTime.UtcNow
            };

            _context.InventoryLogs.Add(log);
            await _context.SaveChangesAsync();

            var result = new InventoryItemDto
            {
                ProductId = product.Id,
                Title = product.Title,
                Category = product.Category,
                Brand = product.Brand,
                Price = product.Price,
                ImageUrl = product.ImageUrl,
                StockQuantity = product.StockQuantity,
                LastUpdated = product.UpdatedAt
            };

            return ApiResponse<InventoryItemDto>.SuccessResponse(result, "Stock successfully updated!");
        }

        public async Task<ApiResponse<IEnumerable<InventoryLogDto>>> GetProductLogsAsync(int productId)
        {
            var logs = await _context.InventoryLogs
                .Where(l => l.ProductId == productId)
                .OrderByDescending(l => l.CreatedAt)
                .Take(50)
                .Select(l => new InventoryLogDto
                {
                    Id = l.Id,
                    ProductId = l.ProductId,
                    Action = l.Action.ToString(),
                    QuantityChanged = l.QuantityChanged,
                    PreviousStock = l.PreviousStock,
                    NewStock = l.NewStock,
                    Note = l.Note,
                    CreatedAt = l.CreatedAt
                }).ToListAsync();

            return ApiResponse<IEnumerable<InventoryLogDto>>.SuccessResponse(logs, "Logs retrieved.");
        }
    }
}
