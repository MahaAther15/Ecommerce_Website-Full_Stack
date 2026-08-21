using System.ComponentModel.DataAnnotations;

namespace ecommerce_backend.Dtos.Address
{
    // Address Response DTO
    public class AddressDto
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
        public string StreetAddress { get; set; } = string.Empty;
        public string City { get; set; } = string.Empty;
        public string? State { get; set; }
        public string? PostalCode { get; set; }
        public string Country { get; set; } = string.Empty;
        public string AddressType { get; set; } = "Home";
        public bool IsDefault { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    // Create Address DTO
    public class CreateAddressDto
    {
        [Required(ErrorMessage = "Receiver full name is required")]
        [MaxLength(100)]
        public string FullName { get; set; } = string.Empty;

        [Required(ErrorMessage = "Phone number is required")]
        [MaxLength(20)]
        public string PhoneNumber { get; set; } = string.Empty;

        [Required(ErrorMessage = "Street address is required")]
        [MaxLength(250)]
        public string StreetAddress { get; set; } = string.Empty;

        [Required(ErrorMessage = "City is required")]
        [MaxLength(100)]
        public string City { get; set; } = string.Empty;

        [MaxLength(100)]
        public string? State { get; set; }

        [MaxLength(20)]
        public string? PostalCode { get; set; }

        [MaxLength(100)]
        public string Country { get; set; } = "Pakistan";

        [MaxLength(50)]
        public string AddressType { get; set; } = "Home"; // Home, Office

        public bool IsDefault { get; set; } = false;
    }

    // Update Address DTO
    public class UpdateAddressDto : CreateAddressDto
    {
    }
}
