using ecommerce_backend.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ecommerce_backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BrandController : ControllerBase
    {
        private readonly IBrandService _brandService;

        public BrandController(IBrandService brandService)
        {
            _brandService = brandService;
        }

        // 1. GET: api/brand (Public - Shop filter ke liye)
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var response = await _brandService.GetAllBrandsAsync();
            return Ok(response);
        }

        // 2. GET: api/brand/{id} (Public)
        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id)
        {
            var response = await _brandService.GetBrandByIdAsync(id);
            if (!response.Success) return NotFound(response);
            return Ok(response);
        }

        // 3. POST: api/brand (Admin Only)
        [Authorize(Roles = "Admin")]
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateBrandDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            var response = await _brandService.CreateBrandAsync(dto);
            if (!response.Success) return BadRequest(response);
            return CreatedAtAction(nameof(GetById), new { id = response.Data?.Id }, response);
        }

        // 4. PUT: api/brand/{id} (Admin Only)
        [Authorize(Roles = "Admin")]
        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, [FromBody] CreateBrandDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            var response = await _brandService.UpdateBrandAsync(id, dto);
            if (!response.Success) return BadRequest(response);
            return Ok(response);
        }

        // 5. DELETE: api/brand/{id} (Admin Only)
        [Authorize(Roles = "Admin")]
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var response = await _brandService.DeleteBrandAsync(id);
            if (!response.Success) return NotFound(response);
            return Ok(response);
        }
    }
}