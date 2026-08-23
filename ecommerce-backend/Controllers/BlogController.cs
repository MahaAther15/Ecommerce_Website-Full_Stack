using ecommerce_backend.Dtos;
using ecommerce_backend.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ecommerce_backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BlogController : ControllerBase
    {
        private readonly IBlogService _blogService;

        public BlogController(IBlogService blogService)
        {
            _blogService = blogService;
        }

        // ─── PUBLIC ENDPOINTS ─────────────────────────────────────────────

        // 1. GET: api/blog ─── Get All Blogs
        [HttpGet]
        public async Task<IActionResult> GetAllBlogs()
        {
            var response = await _blogService.GetAllBlogsAsync();
            return Ok(response);
        }

        // 2. GET: api/blog/{id} ─── Get Blog by ID
        [HttpGet("{id}")]
        public async Task<IActionResult> GetBlogById(string id)
        {
            var response = await _blogService.GetBlogByIdAsync(id);
            if (!response.Success)
            {
                // Fallback: try by slug if not found by id
                response = await _blogService.GetBlogBySlugAsync(id);
            }
            if (!response.Success) return NotFound(response);
            return Ok(response);
        }

        // 3. GET: api/blog/slug/{slug} ─── Get Blog by Slug
        [HttpGet("slug/{slug}")]
        public async Task<IActionResult> GetBlogBySlug(string slug)
        {
            var response = await _blogService.GetBlogBySlugAsync(slug);
            if (!response.Success) return NotFound(response);
            return Ok(response);
        }

        // 4. GET: api/blog/category/{category} ─── Get Blogs by Category
        [HttpGet("category/{category}")]
        public async Task<IActionResult> GetBlogsByCategory(string category)
        {
            var response = await _blogService.GetBlogsByCategoryAsync(category);
            return Ok(response);
        }

        // 5. GET: api/blog/search?q=... ─── Search Blogs
        [HttpGet("search")]
        public async Task<IActionResult> SearchBlogs([FromQuery] string q)
        {
            var response = await _blogService.SearchBlogsAsync(q);
            return Ok(response);
        }

        // 6. GET: api/blog/categories ─── Get All Unique Categories
        [HttpGet("categories")]
        public async Task<IActionResult> GetCategories()
        {
            var response = await _blogService.GetBlogCategoriesAsync();
            return Ok(response);
        }

        // ─── ADMIN PROTECTED ENDPOINTS ────────────────────────────────────

        // 7. POST: api/blog ─── Create Blog (Uploads Image to Cloudinary)
        [Authorize(Roles = "Admin")]
        [HttpPost]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> CreateBlog([FromForm] CreateBlogDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            var response = await _blogService.CreateBlogAsync(dto);
            if (!response.Success) return BadRequest(response);
            return CreatedAtAction(nameof(GetBlogById), new { id = response.Data?.Id }, response);
        }

        // 8. PUT: api/blog/{id} ─── Update Blog (Can re-upload Cloudinary image)
        [Authorize(Roles = "Admin")]
        [HttpPut("{id}")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> UpdateBlog(string id, [FromForm] UpdateBlogDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            var response = await _blogService.UpdateBlogAsync(id, dto);
            if (!response.Success) return BadRequest(response);
            return Ok(response);
        }

        // 9. DELETE: api/blog/{id} ─── Delete Blog
        [Authorize(Roles = "Admin")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteBlog(string id)
        {
            var response = await _blogService.DeleteBlogAsync(id);
            if (!response.Success) return BadRequest(response);
            return Ok(response);
        }
    }
}
