using ecommerce_backend.Dtos;
using ecommerce_backend.Models.common;

namespace ecommerce_backend.Services.Interfaces
{
    public interface IBlogService
    {
        // ─── Public Queries (For Frontend) ─────────────────────────
        Task<ApiResponse<IEnumerable<BlogDto>>> GetAllBlogsAsync();
        Task<ApiResponse<BlogDto>> GetBlogByIdAsync(string id);
        Task<ApiResponse<BlogDto>> GetBlogBySlugAsync(string slug);
        Task<ApiResponse<IEnumerable<BlogDto>>> GetBlogsByCategoryAsync(string category);
        Task<ApiResponse<IEnumerable<BlogDto>>> SearchBlogsAsync(string query);
        Task<ApiResponse<IEnumerable<string>>> GetBlogCategoriesAsync();

        // ─── Admin Management (Create with Cloudinary / Update / Delete) ───
        Task<ApiResponse<BlogDto>> CreateBlogAsync(CreateBlogDto dto);
        Task<ApiResponse<BlogDto>> UpdateBlogAsync(string id, UpdateBlogDto dto);
        Task<ApiResponse<bool>> DeleteBlogAsync(string id);
    }
}
