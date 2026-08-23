using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
namespace ecommerce_backend.Models
{
    public enum ExpenseCategory{
        Marketing,
        Shipping,
        Packaging,
        Software,
        Salaries,
        Utilities,
        Category,
        Other
    }
    public class Expense
    {
        [Key]
        [Required]
        public int Id{get;set;}

        [Required]
        [MaxLength(200)]
        public string Title{get;set;}=string.Empty;

        [Required]
        [Column(TypeName="decimal(18,2)")]
        public decimal Amount{get;set;}

        [Required]
        public ExpenseCategory Category {get;set;}

        [MaxLength(500)]
        public string? Description { get; set; }
        
        public DateTime ExpenseDate { get; set; } = DateTime.UtcNow;
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    }
}