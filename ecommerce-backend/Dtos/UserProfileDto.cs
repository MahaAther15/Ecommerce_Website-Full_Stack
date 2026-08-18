// this file will have 2 DTOS for 
// 1. User Update Profile Request (Jo user frontend se edit karke bhejega) 
// 2. User Response DTO (Jo user ki details frontend ko bheje ga)

namespace ecommerce_backend.Dtos
{
    // to send data to frontend (response)
    public class UserProfileResponseDto
    {
        public int Id {get;set;}
        public string FullName {get;set;}=String.Empty;
        public string Email{get;set;}=String.Empty;
        public string Role{get;set;}=String.Empty;
        public string? PhoneNumber { get; set; }
        public string? Address { get; set; }
        public string? City { get; set; }
        public string? State { get; set; }
        public string? PostalCode { get; set; }
        public string? Country { get; set; }

    }

    // to get data from frontend (request)
    public class UpdateProfileRequestDto
    {
        public string FullName { get; set; } = string.Empty;
        public string? PhoneNumber { get; set; }
        public string? Address { get; set; }
        public string? City { get; set; }
        public string? PostalCode { get; set; }
        public string? Country { get; set; }
        public string? State { get; set; }

    }
}
