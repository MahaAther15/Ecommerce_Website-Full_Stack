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


        // method to forgot password
        // it takes forgot password request as parameter
        // it returns void
        Task ForgotPasswordAsync(ForgotPasswordRequestDto request);

        // method to reset password
        // it takes reset password request as parameter
        // it returns void
        Task ResetPasswordAsync(ResetPasswordRequestDto request);

        // GOOGLE LOGIN method interface
    Task<AuthResponseDto> GoogleLoginAsync(GoogleLoginRequestDto request);


    // 4. REFRESH ACCESS TOKEN (Keep User Logged In After 30 Minutes)
    // When the access token expires, frontend sends this request with the old access token and active refresh token.
Task<AuthResponseDto> RefreshTokenAsync(RefreshTokenRequestDto request);    }
}