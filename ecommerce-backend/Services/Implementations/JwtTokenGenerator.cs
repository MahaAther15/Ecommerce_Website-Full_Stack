using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using ecommerce_backend.Models;
using ecommerce_backend.Services.Interfaces;
using Microsoft.IdentityModel.Tokens;
namespace ecommerce_backend.Services.Implementations{

    public class JwtTokenGenerator:IJwtTokenGenerator{
        // it injects configuration in startup file to get the secret key and issuer
        private readonly IConfiguration _configuration;

        // constructor for jwtTokenGenerator
        public JwtTokenGenerator(IConfiguration configuration){
            _configuration=configuration;
        }
        // method to generate jwt token
        // it takes user object as parameter
        // it returns jwt token as string
        public string GenerateToken(User user){
            var jwtSettings = _configuration.GetSection("JwtSettings");
            var secretKey = jwtSettings["SecretKey"]!;
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
                new Claim(JwtRegisteredClaimNames.Email, user.Email),
                new Claim("fullName", user.FullName),
                new Claim(ClaimTypes.Role, user.Role),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
            };
            var token = new JwtSecurityToken(
                issuer: jwtSettings["Issuer"],
                audience: jwtSettings["Audience"],
                claims: claims,
                // setting expiry time for token
                // it is taken from appsettings.json file
                // expore within 24 hours
                expires: DateTime.UtcNow.AddHours(Convert.ToDouble(jwtSettings["ExpiryInHours"] ?? "24")),
                signingCredentials: credentials
            );
            return new JwtSecurityTokenHandler().WriteToken(token);
            
            
        }
        
    }
}