using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ecommerce_backend.Models
{
    public enum InventoryAction
    {
        Restock,    // Supplier se naya stock aaya (+)
        Sale,       // Order place hone par bika (-)
        Return,     // Customer ne order cancel / return kiya (+)
        Damaged,    // Warehouse me item damage hua (-)
        Adjustment  // Admin ne manual correction ki (+/-)
    }

    public class InventoryLog
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int ProductId { get; set; }

        [ForeignKey("ProductId")]
        public Product Product { get; set; } = null!;

        [Required]
        public InventoryAction Action { get; set; }

        // Kitni quantity change hui (e.g. +50 ya -2)
        public int QuantityChanged { get; set; }

        // Change hone se pehle kitna stock tha
        public int PreviousStock { get; set; }

        // Change hone ke baad kitna stock bana
        public int NewStock { get; set; }

        [MaxLength(250)]
        public string Note { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
