using System.ComponentModel.DataAnnotations;
using ecommerce_backend.Models;

namespace ecommerce_backend.Dtos.Inventory
{
    public class InventoryItemDto
    {
        public int ProductId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public string Brand { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public string ImageUrl { get; set; } = string.Empty;
        public int StockQuantity { get; set; }
        public string StockStatus => StockQuantity switch
        {
            <= 0 => "Out of Stock",
            <= 5 => "Low Stock",
            _ => "In Stock"
        };
        public DateTime? LastUpdated { get; set; }
    }

    public class AdjustStockDto
    {
        [Required]
        public int ProductId { get; set; }

        [Required]
        public int Quantity { get; set; } // Positive for add (+), Negative for remove (-)

        [Required]
        public InventoryAction Action { get; set; }

        [MaxLength(250)]
        public string Note { get; set; } = string.Empty;
    }

    public class InventoryLogDto
    {
        public int Id { get; set; }
        public int ProductId { get; set; }
        public string Action { get; set; } = string.Empty;
        public int QuantityChanged { get; set; }
        public int PreviousStock { get; set; }
        public int NewStock { get; set; }
        public string Note { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
    }

    public class InventorySummaryDto
    {
        public int TotalProducts { get; set; }
        public int InStockProducts { get; set; }
        public int LowStockProducts { get; set; }
        public int OutOfStockProducts { get; set; }
        public int TotalStockUnits { get; set; }
    }
}
