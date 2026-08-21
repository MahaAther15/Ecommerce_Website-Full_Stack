using ecommerce_backend.Dtos.Product;
using ecommerce_backend.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ecommerce_backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProductController : ControllerBase
    {
        private readonly IProductService _productService;

        public ProductController(IProductService productService)
        {
            _productService = productService;
        }

        // GET: api/product (Search, Filter, Pagination)
        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] ProductFilterDto filter)
        {
            var response = await _productService.GetProductsAsync(filter);
            return Ok(response);
        }

        // GET: api/product/{id}
        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id)
        {
            var response = await _productService.GetProductByIdAsync(id);
            if (!response.Success) return NotFound(response);
            return Ok(response);
        }

        // GET: api/product/categories
        [HttpGet("categories")]
        public async Task<IActionResult> GetCategories()
        {
            var response = await _productService.GetCategoriesAsync();
            return Ok(response);
        }

        // GET: api/product/featured
        [HttpGet("featured")]
        public async Task<IActionResult> GetFeatured([FromQuery] int count = 8)
        {
            var response = await _productService.GetFeaturedProductsAsync(count);
            return Ok(response);
        }
        // Admin dashboard se jab admin new image browse karega to yeh endpoint
        // IPhotoService ke through Cloudinary par upload karega aur secure HTTPS 
        // URL return karega.
        // POST: api/product/upload-image (Admin only)
        [Authorize(Roles = "Admin")]
        [HttpPost("upload-image")]
        public async Task<IActionResult> UploadImage([FromForm] IFormFile file, [FromServices] IPhotoService photoService)
        {
            if (file == null || file.Length == 0)
                return BadRequest(new { success = false, message = "No image file provided." });

            // Validate extension
            var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".webp" };
            var ext = Path.GetExtension(file.FileName).ToLower();
            if (!allowedExtensions.Contains(ext))
                return BadRequest(new { success = false, message = "Only JPG, JPEG, PNG, and WEBP files are allowed." });

            var uploadResult = await photoService.AddPhotoAsync(file);
            if (uploadResult.Error != null)
                return BadRequest(new { success = false, message = uploadResult.Error.Message });

            return Ok(new
            {
                success = true,
                imageUrl = uploadResult.SecureUrl?.ToString(),
                publicId = uploadResult.PublicId
            });
        }


        // POST: api/product (Admin only)
        [Authorize(Roles = "Admin")]
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateProductDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            var response = await _productService.CreateProductAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = response.Data?.Id }, response);
        }

        // PUT: api/product/{id} (Admin only)
        [Authorize(Roles = "Admin")]
        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, [FromBody] CreateProductDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            var response = await _productService.UpdateProductAsync(id, dto);
            if (!response.Success) return NotFound(response);
            return Ok(response);
        }

        // DELETE: api/product/{id} (Admin only)
        [Authorize(Roles = "Admin")]
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var response = await _productService.DeleteProductAsync(id);
            if (!response.Success) return NotFound(response);
            return Ok(response);
        }
    }
}
