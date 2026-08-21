using System.ComponentModel.DataAnnotations;

namespace ecommerce_backend.Dtos.Order
{
    public class PlaceOrderDto
    {
        // Shipping Details
        [Required(ErrorMessage = "Shipping address is required.")]
        public string ShippingAddress { get; set; } = string.Empty;

        [Required(ErrorMessage = "City is required.")]
        public string City { get; set; } = string.Empty;

        public string? PostalCode { get; set; }

        public string Country { get; set; } = "Pakistan";

        [Required(ErrorMessage = "Phone number is required.")]
        public string PhoneNumber { get; set; } = string.Empty;

        // Payment
        public string PaymentMethod { get; set; } = "Cash On Delivery";
    }
}
