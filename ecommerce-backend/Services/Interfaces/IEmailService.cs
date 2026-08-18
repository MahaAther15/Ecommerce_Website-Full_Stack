namespace ecommerce_backend.Services.Interfaces
{
    public interface IEmailService
    {
        Task SendPasswordResetEmailAsync(string toEmail,string resetToken);
        
    }
}