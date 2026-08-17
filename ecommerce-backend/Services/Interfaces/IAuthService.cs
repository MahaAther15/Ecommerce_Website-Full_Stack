using ecommerce_backend.Dtos;
namespace ecommerce_backend.Services.Interfaces
{
    public interface IAuthService
    {
        // method to register a new user
        // it takes user registration request as parameter
        // it returns auth response as string
        Task<AuthResponseDto> RegisterAsync(RegisterRequestDto request);
        // method to login a user
        // it takes user login request as parameter
        // it returns auth response as string
        Task<AuthResponseDto> LoginAsync(LoginRequestDto request);
    }
}