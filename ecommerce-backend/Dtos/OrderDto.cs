namespace ecommerce_backend.Dtos.Order
{
    public class OrderItemDto
    {
        public int Id { get; set; }
        public int ProductId { get; set; }
        public string ProductTitle { get; set; } = string.Empty;
        public string? ProductImage { get; set; }
        public decimal UnitPrice { get; set; }
        public int Quantity { get; set; }
        public decimal SubTotal => UnitPrice * Quantity;
    }

    public class OrderDto
    {
        public int Id { get; set; }
        public string OrderNumber { get; set; } = string.Empty;
        public int UserId { get; set; }
        public List<OrderItemDto> OrderItems { get; set; } = new();

        public decimal TotalAmount { get; set; }
        public decimal ShippingFee { get; set; }
        public decimal Discount { get; set; }
        public decimal FinalAmount { get; set; }

        public string Status { get; set; } = string.Empty;

        public string? ShippingAddress { get; set; }
        public string? City { get; set; }
        public string? PostalCode { get; set; }
        public string? Country { get; set; }
        public string? PhoneNumber { get; set; }

        public string PaymentMethod { get; set; } = string.Empty;
        public bool IsPaid { get; set; }

        public DateTime CreatedAt { get; set; }
    }
}
