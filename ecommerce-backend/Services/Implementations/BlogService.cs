using System.Text.RegularExpressions;
using ecommerce_backend.Data;
using ecommerce_backend.Dtos;
using ecommerce_backend.Models;
using ecommerce_backend.Models.common;
using ecommerce_backend.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace ecommerce_backend.Services.Implementations
{
    public class BlogService : IBlogService
    {
        private readonly AppDbContext _context;
        private readonly IPhotoService _photoService;

        public BlogService(AppDbContext context, IPhotoService photoService)
        {
            _context = context;
            _photoService = photoService;
        }

        public async Task<ApiResponse<IEnumerable<BlogDto>>> GetAllBlogsAsync()
        {
            var blogs = await _context.Blogs
                .OrderByDescending(b => b.Date)
                .ToListAsync();

            return new ApiResponse<IEnumerable<BlogDto>>
            {
                Success = true,
                Data = blogs.Select(MapToDto)
            };
        }

        public async Task<ApiResponse<BlogDto>> GetBlogByIdAsync(string id)
        {
            var blog = await _context.Blogs.FirstOrDefaultAsync(b => b.Id == id);
            if (blog == null)
            {
                return new ApiResponse<BlogDto> { Success = false, Message = "Blog not found." };
            }

            return new ApiResponse<BlogDto> { Success = true, Data = MapToDto(blog) };
        }

        public async Task<ApiResponse<BlogDto>> GetBlogBySlugAsync(string slug)
        {
            var blog = await _context.Blogs.FirstOrDefaultAsync(b => b.Slug == slug);
            if (blog == null)
            {
                return new ApiResponse<BlogDto> { Success = false, Message = "Blog not found." };
            }

            return new ApiResponse<BlogDto> { Success = true, Data = MapToDto(blog) };
        }

        public async Task<ApiResponse<IEnumerable<BlogDto>>> GetBlogsByCategoryAsync(string category)
        {
            var blogs = await _context.Blogs
                .Where(b => b.Category.ToLower() == category.ToLower())
                .OrderByDescending(b => b.Date)
                .ToListAsync();

            return new ApiResponse<IEnumerable<BlogDto>>
            {
                Success = true,
                Data = blogs.Select(MapToDto)
            };
        }

        public async Task<ApiResponse<IEnumerable<BlogDto>>> SearchBlogsAsync(string query)
        {
            if (string.IsNullOrWhiteSpace(query))
            {
                return await GetAllBlogsAsync();
            }

            var q = query.ToLower();
            var blogs = await _context.Blogs
                .Where(b => b.Title.ToLower().Contains(q) ||
                            b.description.ToLower().Contains(q) ||
                            b.Category.ToLower().Contains(q) ||
                            b.Author.ToLower().Contains(q))
                .ToListAsync();

            return new ApiResponse<IEnumerable<BlogDto>>
            {
                Success = true,
                Data = blogs.Select(MapToDto)
            };
        }

        public async Task<ApiResponse<IEnumerable<string>>> GetBlogCategoriesAsync()
        {
            var categories = await _context.Blogs
                .Select(b => b.Category)
                .Distinct()
                .ToListAsync();

            return new ApiResponse<IEnumerable<string>> { Success = true, Data = categories };
        }

        // ─── Create Blog (With Cloudinary Image Upload) ────────────
        public async Task<ApiResponse<BlogDto>> CreateBlogAsync(CreateBlogDto dto)
        {
            string imageUrl = dto.ImageUrl ?? string.Empty;

            // 1. Cloudinary upload if file provided
            if (dto.ImageFile != null && dto.ImageFile.Length > 0)
            {
                var uploadResult = await _photoService.AddPhotoAsync(dto.ImageFile);
                if (uploadResult.Error != null)
                {
                    return new ApiResponse<BlogDto> { Success = false, Message = uploadResult.Error.Message };
                }
                imageUrl = uploadResult.SecureUrl?.ToString() ?? string.Empty;
            }

            var slug = GenerateSlug(dto.Title);

            // Generate sequential ID: b7, b8, b9...
            var existingIds = await _context.Blogs
                .Select(b => b.Id)
                .ToListAsync();

            int maxNumber = 0;
            foreach (var id in existingIds)
            {
                if (id.StartsWith("b", StringComparison.OrdinalIgnoreCase))
                {
                    var numPart = id.Substring(1);
                    if (int.TryParse(numPart, out int num) && num > maxNumber)
                    {
                        maxNumber = num;
                    }
                }
            }

            string nextBlogId = $"b{maxNumber + 1}";

            var blog = new Blog
            {
                Id = nextBlogId,
                Title = dto.Title,
                Slug = slug,
                description = dto.Description,
                ImageUrl = imageUrl,
                Date = DateTime.UtcNow,
                Author = dto.Author,
                AuthorRole = dto.AuthorRole,
                Category = dto.Category,
                ReadTime = dto.ReadTime,
                Quote = dto.Quote,
                FullContent = dto.FullContent ?? new List<string>(),
                KeyTakeAways = dto.KeyTakeAways ?? new List<string>()
            };

            _context.Blogs.Add(blog);
            await _context.SaveChangesAsync();

            return new ApiResponse<BlogDto>
            {
                Success = true,
                Message = "Blog created successfully with Cloudinary image!",
                Data = MapToDto(blog)
            };
        }

        // ─── Update Blog ──────────────────────────────────────────
        public async Task<ApiResponse<BlogDto>> UpdateBlogAsync(string id, UpdateBlogDto dto)
        {
            var blog = await _context.Blogs.FirstOrDefaultAsync(b => b.Id == id);
            if (blog == null)
            {
                return new ApiResponse<BlogDto> { Success = false, Message = "Blog not found." };
            }

            if (dto.ImageFile != null && dto.ImageFile.Length > 0)
            {
                var uploadResult = await _photoService.AddPhotoAsync(dto.ImageFile);
                if (uploadResult.Error == null)
                {
                    blog.ImageUrl = uploadResult.SecureUrl?.ToString() ?? blog.ImageUrl;
                }
            }
            else if (!string.IsNullOrEmpty(dto.ImageUrl))
            {
                blog.ImageUrl = dto.ImageUrl;
            }

            if (!string.IsNullOrEmpty(dto.Title))
            {
                blog.Title = dto.Title;
                blog.Slug = GenerateSlug(dto.Title);
            }

            if (!string.IsNullOrEmpty(dto.Description)) blog.description = dto.Description;
            if (!string.IsNullOrEmpty(dto.Category)) blog.Category = dto.Category;
            if (!string.IsNullOrEmpty(dto.Author)) blog.Author = dto.Author;
            if (!string.IsNullOrEmpty(dto.AuthorRole)) blog.AuthorRole = dto.AuthorRole;
            if (!string.IsNullOrEmpty(dto.ReadTime)) blog.ReadTime = dto.ReadTime;
            if (!string.IsNullOrEmpty(dto.Quote)) blog.Quote = dto.Quote;
            if (dto.FullContent != null) blog.FullContent = dto.FullContent;
            if (dto.KeyTakeAways != null) blog.KeyTakeAways = dto.KeyTakeAways;

            await _context.SaveChangesAsync();

            return new ApiResponse<BlogDto>
            {
                Success = true,
                Message = "Blog updated successfully.",
                Data = MapToDto(blog)
            };
        }

        // ─── Delete Blog ──────────────────────────────────────────
        public async Task<ApiResponse<bool>> DeleteBlogAsync(string id)
        {
            var blog = await _context.Blogs.FirstOrDefaultAsync(b => b.Id == id);
            if (blog == null)
            {
                return new ApiResponse<bool> { Success = false, Message = "Blog not found." };
            }

            _context.Blogs.Remove(blog);
            await _context.SaveChangesAsync();

            return new ApiResponse<bool> { Success = true, Message = "Blog deleted successfully.", Data = true };
        }

        private static BlogDto MapToDto(Blog b)
        {
            return new BlogDto
            {
                Id = b.Id,
                Title = b.Title,
                Slug = b.Slug,
                Description = b.description,
                ImageUrl = b.ImageUrl,
                Date = b.Date.ToString("dd/MM"),
                Author = b.Author,
                AuthorRole = b.AuthorRole,
                Category = b.Category,
                ReadTime = b.ReadTime,
                Quote = b.Quote,
                FullContent = b.FullContent,
                KeyTakeAways = b.KeyTakeAways
            };
        }

        private static string GenerateSlug(string title)
        {
            string slug = title.ToLower().Trim();
            slug = Regex.Replace(slug, @"[^a-z0-9\s-]", "");
            slug = Regex.Replace(slug, @"\s+", "-").Trim('-');
            return slug;
        }
    }
}
