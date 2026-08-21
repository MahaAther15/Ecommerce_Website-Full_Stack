using System.Text.RegularExpressions;
using ecommerce_backend.Models;
using ecommerce_backend.Models.common;
using ecommerce_backend.Repositories.Interfaces;
using ecommerce_backend.Services.Interfaces;

namespace ecommerce_backend.Services.Implementations
{
    public class BrandService : IBrandService
    {
        private readonly IBrandRepository _brandRepository;

        public BrandService(IBrandRepository brandRepository)
        {
            _brandRepository = brandRepository;
        }

        public async Task<ApiResponse<List<BrandDto>>> GetAllBrandsAsync()
        {
            var brands = await _brandRepository.GetAllAsync();
            var dtos = brands.Select(MapToDto).ToList();
            return ApiResponse<List<BrandDto>>.SuccessResponse(dtos, "Brands retrieved successfully.");
        }

        public async Task<ApiResponse<BrandDto>> GetBrandByIdAsync(int id)
        {
            var brand = await _brandRepository.GetByIdAsync(id);
            if (brand == null)
                return ApiResponse<BrandDto>.ErrorResponse("Brand not found.", 404);

            return ApiResponse<BrandDto>.SuccessResponse(MapToDto(brand), "Brand fetched successfully.");
        }

        public async Task<ApiResponse<BrandDto>> CreateBrandAsync(CreateBrandDto dto)
        {
            var brand = new Brand
            {
                Name = dto.Name.Trim(),
                Slug = GenerateSlug(dto.Name),
                Description = dto.Description?.Trim(),
                LogoUrl = dto.LogoUrl,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            var created = await _brandRepository.AddAsync(brand);
            return ApiResponse<BrandDto>.SuccessResponse(MapToDto(created), "Brand created successfully.");
        }

        public async Task<ApiResponse<BrandDto>> UpdateBrandAsync(int id, CreateBrandDto dto)
        {
            var brand = await _brandRepository.GetByIdAsync(id);
            if (brand == null)
                return ApiResponse<BrandDto>.ErrorResponse("Brand not found.", 404);

            brand.Name = dto.Name.Trim();
            brand.Slug = GenerateSlug(dto.Name);
            brand.Description = dto.Description?.Trim();
            brand.LogoUrl = dto.LogoUrl;

            await _brandRepository.UpdateAsync(brand);
            return ApiResponse<BrandDto>.SuccessResponse(MapToDto(brand), "Brand updated successfully.");
        }

        public async Task<ApiResponse<bool>> DeleteBrandAsync(int id)
        {
            var brand = await _brandRepository.GetByIdAsync(id);
            if (brand == null)
                return ApiResponse<bool>.ErrorResponse("Brand not found.", 404);

            await _brandRepository.DeleteAsync(brand);
            return ApiResponse<bool>.SuccessResponse(true, "Brand deleted successfully.");
        }

        private static string GenerateSlug(string phrase)
        {
            string str = phrase.ToLower().Trim();
            str = Regex.Replace(str, @"[^a-z0-9\s-]", "");
            str = Regex.Replace(str, @"\s+", " ").Trim();
            str = Regex.Replace(str, @"\s", "-");
            return str;
        }

        private static BrandDto MapToDto(Brand b) => new()
        {
            Id = b.Id,
            Name = b.Name,
            Slug = b.Slug,
            Description = b.Description,
            LogoUrl = b.LogoUrl,
            IsActive = b.IsActive,
            CreatedAt = b.CreatedAt,
            UpdatedAt = b.UpdatedAt
        };
    }
}
