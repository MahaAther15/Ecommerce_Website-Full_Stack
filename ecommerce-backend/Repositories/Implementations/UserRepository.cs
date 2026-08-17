using ecommerce_backend.Data;
using ecommerce_backend.Models;
using ecommerce_backend.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;
namespace ecommerce_backend.Repositories.Implementations
{
    public class UserRepository : IUserRepository
    {
        private readonly AppDbContext _context;
        public UserRepository(AppDbContext context){
            _context=context;
        }

        // implementing all method which we declared in IUserRepository.cs

        //method to get user by email from Db by using Async
        //async means wait untill user is fetched otherwise keep waiting 
        public async Task<User?> GetByEmailAsync(string email)
        {
            return await _context.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == email.ToLower());
        }

        // method to get user by id from Db by using Async
        public async Task<User?> GetByIdAsync(int id)
        {
            return await _context.Users.FindAsync(id);
        }

        // method to Add user in Db by using Async
        // SaveAsync is used to save the changes in the database by tracking it from memory
        //return added user
        public async Task<User> AddAsync(User user)
        {
            await _context.Users.AddAsync(user);
            await _context.SaveChangesAsync();
            return user;
        }

        //method to check if user exists by email from Db by using Async
        //AnyAsync is used to check if any user exists with the given email
        //return boolean value (true or false)
        public async Task<bool> ExistsByEmailAsync(string email)
        {
            return await _context.Users.AnyAsync(u=>u.Email.ToLower()==email.ToLower());
        }


    }
}