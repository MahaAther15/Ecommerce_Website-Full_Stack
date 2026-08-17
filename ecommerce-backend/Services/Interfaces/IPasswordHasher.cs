namespace ecommerce_backend.Services.Interfaces
{
    public interface IPasswordHasher
    {
        string HashPassword (string password);
        bool VerifyPassword(string password,string storedHash);
    }
}