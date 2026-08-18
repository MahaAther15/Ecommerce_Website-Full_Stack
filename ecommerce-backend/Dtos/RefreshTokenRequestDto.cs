// This DTO receives the expired access token and the active refresh token from the frontend.
using System.ComponentModel.DataAnnotations;

namespace ecommerce_backend.Dtos
{
    public class RefreshTokenRequestDto
    {
        [Required(ErrorMessage = "Access token is required.")]
        public string AccessToken { get; set; } = string.Empty;

        [Required(ErrorMessage = "Refresh token is required.")]
        public string RefreshToken { get; set; } = string.Empty;
    }
}
