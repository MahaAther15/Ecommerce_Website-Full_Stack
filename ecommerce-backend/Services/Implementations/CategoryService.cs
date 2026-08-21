using System.Text.RegularExpressions;
using ecommerce_backend.Dtos.Category;
using ecommerce_backend.Models;
using ecommerce_backend.Models.common;
using ecommerce_backend.Repositories.Interfaces;
using ecommerce_backend.Services.Interfaces;

namespace ecommerce_backend.Services.Implementations
{
    public class CategoryService : ICategoryService
    {
        private readonly ICategoryRepository _categoryRepository;

        public CategoryService(ICategoryRepository categoryRepository)
        {
            _categoryRepository = categoryRepository;
        }

        public async Task<ApiResponse<List<CategoryDto>>> GetAllCategoriesAsync()
        {
            var categories = await _categoryRepository.GetAllAsync();
            var dtos = categories.Select(MapToDto).ToList();
            return ApiResponse<List<CategoryDto>>.SuccessResponse(dtos, "Categories retrieved successfully.");
        }

        public async Task<ApiResponse<CategoryDto>> GetCategoryByIdAsync(int id)
        {
            var category = await _categoryRepository.GetByIdAsync(id);
            if (category == null)
                return ApiResponse<CategoryDto>.ErrorResponse("Category not found.", 404);

            return ApiResponse<CategoryDto>.SuccessResponse(MapToDto(category), "Category fetched.");
        }

        public async Task<ApiResponse<CategoryDto>> CreateCategoryAsync(CreateCategoryDto dto)
        {
            if (await _categoryRepository.ExistsByNameAsync(dto.Name))
                return ApiResponse<CategoryDto>.ErrorResponse("Category with this name already exists.", 400);

            var category = new Category
            {
                Name = dto.Name.Trim(),
                Slug = GenerateSlug(dto.Name),
                Description = dto.Description?.Trim(),
                ImageUrl = dto.ImageUrl,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            var created = await _categoryRepository.AddAsync(category);
            return ApiResponse<CategoryDto>.SuccessResponse(MapToDto(created), "Category created successfully.");
        }

        public async Task<ApiResponse<CategoryDto>> UpdateCategoryAsync(int id, CreateCategoryDto dto)
        {
            var category = await _categoryRepository.GetByIdAsync(id);
            if (category == null)
                return ApiResponse<CategoryDto>.ErrorResponse("Category not found.", 404);

            if (await _categoryRepository.ExistsByNameAsync(dto.Name, id))
                return ApiResponse<CategoryDto>.ErrorResponse("Another category with this name already exists.", 400);

            category.Name = dto.Name.Trim();
            category.Slug = GenerateSlug(dto.Name);
            category.Description = dto.Description?.Trim();
            category.ImageUrl = dto.ImageUrl;

            await _categoryRepository.UpdateAsync(category);
            return ApiResponse<CategoryDto>.SuccessResponse(MapToDto(category), "Category updated successfully.");
        }

        public async Task<ApiResponse<bool>> DeleteCategoryAsync(int id)
        {
            var category = await _categoryRepository.GetByIdAsync(id);
            if (category == null)
                return ApiResponse<bool>.ErrorResponse("Category not found.", 404);

            await _categoryRepository.DeleteAsync(category);
            return ApiResponse<bool>.SuccessResponse(true, "Category deleted successfully.");
        }

        private static string GenerateSlug(string phrase)
        {
            string str = phrase.ToLower().Trim();
            str = Regex.Replace(str, @"[^a-z0-9\s-]", "");
            str = Regex.Replace(str, @"\s+", " ").Trim();
            str = Regex.Replace(str, @"\s", "-");
            return str;
        }

        private static CategoryDto MapToDto(Category c) => new()
        {
            Id = c.Id,
            Name = c.Name,
            Slug = c.Slug,
            Description = c.Description,
            ImageUrl = c.ImageUrl
        };
    }
}
