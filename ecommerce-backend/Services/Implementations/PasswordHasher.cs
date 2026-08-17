using ecommerce_backend.Services.Interfaces;
namespace ecommerce_backend.Services.Implementations
{
    public class PasswordHasher:IPasswordHasher
    {
        //During Registration,When user entered password this function will
        // encrpyt password and then store hashed pass in DB
        public string HashPassword(string password)
        {
            
            return BCrypt.Net.BCrypt.HashPassword(password);
        }

        // During Login,When user enter login credentials,
        // we need to compare the entered password with the stored password
        // This method will verify whether the entered password is correct or not
        public bool VerifyPassword(string password,string storedHash){
            return BCrypt.Net.BCrypt.Verify(password,storedHash);
        }
        
        
        
    }

}