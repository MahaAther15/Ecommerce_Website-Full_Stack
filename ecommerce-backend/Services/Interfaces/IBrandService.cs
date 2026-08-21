using ecommerce_backend.Dtos.Category;
using ecommerce_backend.Models.common;

namespace ecommerce_backend.Services.Interfaces
{
    public interface IBrandService
    {
        Task<ApiResponse<List<BrandDto>>> GetAllBrandsAsync();
Task<ApiResponse<BrandDto>> GetBrandByIdAsync(int id);
Task<ApiResponse<BrandDto>> CreateBrandAsync(CreateBrandDto dto);
Task<ApiResponse<BrandDto>> UpdateBrandAsync(int id, CreateBrandDto dto);
Task<ApiResponse<bool>> DeleteBrandAsync(int id);
    }
}