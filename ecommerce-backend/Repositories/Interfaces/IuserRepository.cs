using ecommerce_backend.Models;

namespace ecommerce_backend.Repositories.Interfaces
{
    public interface IUserRepository
    {

        // Async methods to interact with database by using async keyword we can make our application faster
        // by allowing our application to perform other operations while waiting for the database to respond

        // method to get user by email from Db by using Async
        Task<User?> GetByEmailAsync(string email);
        Task<User?> GetByIdAsync(int id);
        Task<User> AddAsync(User user);
        Task<bool> ExistsByEmailAsync(string email);
    }
}