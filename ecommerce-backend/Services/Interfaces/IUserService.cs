using ecommerce_backend.Dtos;

namespace ecommerce_backend.Services.Interfaces
{
    public interface IUserService
    {
        Task<UserProfileResponseDto> GetProfileAsync(int userId);
        Task<UserProfileResponseDto> UpdateProfileAsync(int userId, UpdateProfileRequestDto request);
        Task DeleteAccountAsync(int userId, DeleteAccountRequestDto request);
        Task<IEnumerable<UserProfileResponseDto>> GetAllUsersAsync();
    }
}
