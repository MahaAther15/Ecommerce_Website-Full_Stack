// ye file email service send karegi

using ecommerce_backend.Services.Interfaces;
using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;
using Microsoft.Extensions.Configuration;
using System.Threading.Tasks;

namespace ecommerce_backend.Services.Implementations
{
    public class EmailService : IEmailService
    {
        private readonly IConfiguration _configuration;

        public EmailService(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public async Task SendPasswordResetEmailAsync(string toEmail, string resetToken)
        {
            var smtpSettings = _configuration.GetSection("SmtpSettings");
            var frontendUrl = _configuration["FrontendUrl"] ?? "http://localhost:3000";
            var senderEmail = smtpSettings["SenderEmail"] ?? "no-reply@carastore.com";
            var senderName = smtpSettings["SenderName"] ?? "Cara Store";
            var host = smtpSettings["Host"] ?? "smtp.gmail.com";
            var port = int.TryParse(smtpSettings["Port"], out var parsedPort) ? parsedPort : 587;
            var password = smtpSettings["Password"] ?? string.Empty;

            // 1. Password Reset Link create karein (Frontend page ka address with query param)
            string resetLink = $"{frontendUrl}/reset-password?token={resetToken}";

            // 2. Email message body banayein (HTML Styled)
            var message = new MimeMessage();
            message.From.Add(new MailboxAddress(senderName, senderEmail));
            message.To.Add(new MailboxAddress("", toEmail));
            message.Subject = "Reset Your Password - Cara Store";

            var bodyBuilder = new BodyBuilder
            {
                HtmlBody = $@"
                <div style='font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 25px; border: 1px solid #e0e0e0; border-radius: 12px;'>
                    <h2 style='color: #088178; text-align: center;'>Cara Store</h2>
                    <hr style='border: none; border-top: 1px solid #eee;' />
                    <p style='font-size: 15px; color: #333;'>Hello,</p>
                    <p style='font-size: 15px; color: #555; line-height: 1.5;'>
                        We received a request to reset your password. Click the button below to set a new password:
                    </p>
                    <div style='text-align: center; margin: 30px 0;'>
                        <a href='{resetLink}' 
                           style='background-color: #088178; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;'>
                            Reset Password
                        </a>
                    </div>
                    <p style='font-size: 13px; color: #888;'>
                        Or copy and paste this link into your browser:<br/>
                        <a href='{resetLink}' style='color: #088178;'>{resetLink}</a>
                    </p>
                    <p style='font-size: 13px; color: #999; margin-top: 25px;'>
                        This link will expire in <strong>1 hour</strong>. If you did not request this, please ignore this email.
                    </p>
                </div>"
            };

            message.Body = bodyBuilder.ToMessageBody();

            // 3. SMTP Client ke zariye email send karein
            using var client = new SmtpClient();
            try
            {
                // Connect to Gmail SMTP (Port 587 with StartTls)
                await client.ConnectAsync(
                    host,
                    port,
                    SecureSocketOptions.StartTls
                );

                // Authenticate with App Password
                await client.AuthenticateAsync(
                    senderEmail,
                    password
                );

                // Send email
                await client.SendAsync(message);
            }
            finally
            {
                await client.DisconnectAsync(true);
            }
        }
    }
}
