using System.ComponentModel.DataAnnotations;

namespace ecommerce_backend.Dtos.Payment
{
    // Payment Process Request DTO
    public class ProcessPaymentDto
    {
        [Required(ErrorMessage = "Order ID is required")]
        public int OrderId { get; set; }

        [Required(ErrorMessage = "Payment method is required")]
        public string PaymentMethod { get; set; } = "Cash On Delivery"; // Card, JazzCash, EasyPaisa, Cash On Delivery

        // Card / Online Payment Details (Optional for COD)
        public string? CardNumber { get; set; }
        public string? CardHolderName { get; set; }
        public string? ExpiryDate { get; set; }
        public string? Cvc { get; set; }

        // Mobile Wallet (JazzCash / EasyPaisa)
        public string? AccountNumber { get; set; }
        public string? TransactionReference { get; set; }
    }

    // Payment Response DTO
    public class PaymentResultDto
    {
        public int OrderId { get; set; }
        public string TransactionId { get; set; } = string.Empty;
        public decimal AmountPaid { get; set; }
        public string PaymentMethod { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty; // "Paid", "Pending", "Failed"
        public DateTime PaidAt { get; set; }
    }
}
