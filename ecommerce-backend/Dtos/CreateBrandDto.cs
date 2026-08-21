using System.ComponentModel.DataAnnotations;

public class CreateBrandDto
{
    [Required(ErrorMessage = "Brand name is required.")]
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;

    [MaxLength(500)]
    public string? Description { get; set; }

    public string? LogoUrl { get; set; }
}
