using System.Security.Claims;
using ecommerce_backend.Models;
namespace ecommerce_backend.Services.Interfaces{
    // this method is used to generate jwt token
    // we generate token when user is successfully registered or logged in
    // Jwt is nothing but a string which is used to authenticate the user
    public interface IJwtTokenGenerator
    {
        string GenerateToken(User user);
        string GenerateRefreshToken();
        ClaimsPrincipal? GetPrincipalFromExpiredToken(string token);
    }
}
