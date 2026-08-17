using ecommerce_backend.Dtos;
using ecommerce_backend.Models;
using ecommerce_backend.Repositories.Interfaces;
using ecommerce_backend.Services.Interfaces;

namespace ecommerce_backend.Services.Implementations
{
    public class AuthService : IAuthService
    {
        // inject user repository
        private readonly IUserRepository _userRepository;
        // inject password hasher
        private readonly IPasswordHasher _passwordHasher;
        // inject jwt token generator
        private readonly IJwtTokenGenerator _jwtTokenGenerator;

        // constructor
        public AuthService(
            IUserRepository userRepository,
            IPasswordHasher passwordHasher,
            IJwtTokenGenerator jwtTokenGenerator)
        {
            _userRepository = userRepository;
            _passwordHasher = passwordHasher;
            _jwtTokenGenerator = jwtTokenGenerator;
        }

        public async Task<AuthResponseDto> RegisterAsync(RegisterRequestDto request)
        {
            // 1. Business Logic: Email duplicate check
            if (await _userRepository.ExistsByEmailAsync(request.Email))
            {
                throw new InvalidOperationException("User with this email already exists.");
            }

            // 2. Hash Password via PasswordHasher service
            string passwordHash = _passwordHasher.HashPassword(request.Password);

            // 3. Create Entity & Save via Repository
            var newUser = new User
            {
                FullName = request.FullName,
                Email = request.Email,
                PasswordHash = passwordHash,
                Role = "Customer"
            };

            var savedUser = await _userRepository.AddAsync(newUser);

            // 4. Generate JWT Token via JwtTokenGenerator service
            string token = _jwtTokenGenerator.GenerateToken(savedUser);

            return new AuthResponseDto
            {
                Token = token,
                FullName = savedUser.FullName,
                Email = savedUser.Email,
                Role = savedUser.Role
            };
        }

        public async Task<AuthResponseDto> LoginAsync(LoginRequestDto request)
        {
            // 1. Fetch user from Database via Repository
            var user = await _userRepository.GetByEmailAsync(request.Email);
            if (user == null)
            {
                throw new UnauthorizedAccessException("Invalid email or password.");
            }

            // 2. Verify Password via PasswordHasher service
            bool isValidPassword = _passwordHasher.VerifyPassword(request.Password, user.PasswordHash);
            if (!isValidPassword)
            {
                throw new UnauthorizedAccessException("Invalid email or password.");
            }

            // 3. Generate JWT Token via JwtTokenGenerator service
            string token = _jwtTokenGenerator.GenerateToken(user);

            return new AuthResponseDto
            {
                Token = token,
                FullName = user.FullName,
                Email = user.Email,
                Role = user.Role
            };
        }
    }
}
