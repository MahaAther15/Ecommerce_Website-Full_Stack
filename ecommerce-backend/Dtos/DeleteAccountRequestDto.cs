using System.ComponentModel.DataAnnotations;
namespace ecommerce_backend.Dtos
{
    public class DeleteAccountRequestDto
    {
        // User jo email ya confirmation text type karega
        [Required(ErrorMessage = "Confirmation email is required.")]
        [EmailAddress]
        public string ConfirmationEmail { get; set; } = string.Empty;
    }
}
