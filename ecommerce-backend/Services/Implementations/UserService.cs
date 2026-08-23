using ecommerce_backend.Dtos;
using ecommerce_backend.Repositories.Interfaces;
using ecommerce_backend.Services.Interfaces;

namespace ecommerce_backend.Services.Implementations
{
    public class UserService : IUserService
    {
        private readonly IUserRepository _userRepository;

        public UserService(IUserRepository userRepository)
        {
            _userRepository = userRepository;
        }

        // 1. Fetch User Profile by ID
        public async Task<UserProfileResponseDto> GetProfileAsync(int userId)
        {
            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null)
            {
                throw new KeyNotFoundException("User not found.");
            }

            return new UserProfileResponseDto
            {
                Id = user.Id,
                FullName = user.FullName,
                Email = user.Email,
                Role = user.Role,
                PhoneNumber = user.PhoneNumber,
                Address = user.Address,
                City = user.City,
                PostalCode = user.PostalCode,
                Country = user.Country,
                State = user.State
            };
        }

        // 2. Update User Profile & Address
        public async Task<UserProfileResponseDto> UpdateProfileAsync(int userId, UpdateProfileRequestDto request)
        {
            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null)
            {
                throw new KeyNotFoundException("User not found.");
            }

            // Update user properties
            user.FullName = request.FullName;
            user.PhoneNumber = request.PhoneNumber;
            user.Address = request.Address;
            user.City = request.City;
            user.PostalCode = request.PostalCode;
            user.Country = request.Country;
            user.State = request.State;

            await _userRepository.UpdateAsync(user);

            return new UserProfileResponseDto
            {
                Id = user.Id,
                FullName = user.FullName,
                Email = user.Email,
                Role = user.Role,
                PhoneNumber = user.PhoneNumber,
                Address = user.Address,
                City = user.City,
                PostalCode = user.PostalCode,
                Country = user.Country,
                State = user.State
            };
        }
        // 3. Delete User Account Permanently with Email Confirmation
        public async Task DeleteAccountAsync(int userId, DeleteAccountRequestDto request)
        {
            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null)
            {
                throw new KeyNotFoundException("User account not found.");
            }
            // Check if typed email matches user's email
            if (string.IsNullOrWhiteSpace(request.ConfirmationEmail) || 
                !string.Equals(user.Email.Trim(), request.ConfirmationEmail.Trim(), StringComparison.OrdinalIgnoreCase))
            {
                throw new InvalidOperationException("Confirmation email does not match your account email.");
            }
            // Database se permanently delete karein
            await _userRepository.DeleteAsync(user);
        }

        public async Task<IEnumerable<UserProfileResponseDto>> GetAllUsersAsync()
        {
            var users = await _userRepository.GetAllUsersAsync();
            return users.Select(u => new UserProfileResponseDto
            {
                Id = u.Id,
                FullName = u.FullName,
                Email = u.Email,
                Role = u.Role,
                PhoneNumber = u.PhoneNumber,
                Address = u.Address,
                City = u.City,
                State = u.State,
                PostalCode = u.PostalCode,
                Country = u.Country
            });
        }
    }
}
