using ecommerce_backend.Dtos.Inventory;
using ecommerce_backend.Models.common;

namespace ecommerce_backend.Services.Interfaces
{
    public interface IInventoryService
    {
        Task<ApiResponse<InventorySummaryDto>> GetSummaryAsync();
        Task<ApiResponse<IEnumerable<InventoryItemDto>>> GetAllInventoryAsync(string? filter = "all", string? search = null);
        Task<ApiResponse<InventoryItemDto>> AdjustStockAsync(AdjustStockDto dto);
        Task<ApiResponse<IEnumerable<InventoryLogDto>>> GetProductLogsAsync(int productId);
    }
}