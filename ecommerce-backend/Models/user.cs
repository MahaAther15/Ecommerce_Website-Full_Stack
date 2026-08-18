namespace ecommerce_backend.Models
{
    public class User
    {
        //user personal info (login/logout,profile update)
        public int Id{get;set;}
        public string FullName{get;set;}=string.Empty;
        public string Email{get;set;}=string.Empty;
        public string PasswordHash{get;set;}=string.Empty;
        public string Role {get;set;}="Customer";

        // user info for address 
        // string? ==> means these fields can be empty(optional for registration)
        public string? PhoneNumber{get;set;}=string.Empty;
        public string? Address{get;set;}=String.Empty;
        public string? City{get;set;}=String.Empty;
        public string? PostalCode{get;set;}=String.Empty;
        public string? Country{get;set;}=String.Empty;
        public string? State{get;set;}=String.Empty;

        // this field is automatically set when user account is created 
        public DateTime CreatedAt{get;set;}=DateTime.UtcNow;

        // password reset functionality fields
        public string? PasswordResetToken{get;set;}=String.Empty;
        public DateTime? ResetTokenExpiry{get;set;}=null;

        // GOOGLE AUTH FIELDS
        public string? GoogleId { get; set; }
        public string AuthProvider { get; set; } = "Local"; 

        // JWT refresh token fields
        public string? RefreshToken { get; set; }
        public DateTime? RefreshTokenExpiryTime { get; set; }
    }

}