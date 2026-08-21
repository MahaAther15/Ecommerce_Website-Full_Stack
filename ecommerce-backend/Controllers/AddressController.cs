using System.Security.Claims;
using ecommerce_backend.Dtos.Address;
using ecommerce_backend.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ecommerce_backend.Controllers
{
    [Authorize] // Sirf logged-in user apna address access kar sakta hai
    [ApiController]
    [Route("api/[controller]")]
    public class AddressController : ControllerBase
    {
        private readonly IAddressService _addressService;

        public AddressController(IAddressService addressService)
        {
            _addressService = addressService;
        }

        // Token se User ID nikalna
        private int GetCurrentUserId()
        {
            var idClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                       ?? User.FindFirst("sub")?.Value;
            return int.TryParse(idClaim, out var id) ? id : 0;
        }

        // 1. GET: api/address ─── List all user addresses
        [HttpGet]
        public async Task<IActionResult> GetMyAddresses()
        {
            var userId = GetCurrentUserId();
            var response = await _addressService.GetUserAddressesAsync(userId);
            return Ok(response);
        }

        // 2. GET: api/address/{id} ─── Get single address
        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetAddressById(int id)
        {
            var userId = GetCurrentUserId();
            var response = await _addressService.GetAddressByIdAsync(userId, id);
            if (!response.Success) return NotFound(response);
            return Ok(response);
        }

        // 3. POST: api/address ─── Create new address
        [HttpPost]
        public async Task<IActionResult> CreateAddress([FromBody] CreateAddressDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            var userId = GetCurrentUserId();
            var response = await _addressService.CreateAddressAsync(userId, dto);
            if (!response.Success) return BadRequest(response);
            return Ok(response);
        }

        // 4. PUT: api/address/{id} ─── Update existing address
        [HttpPut("{id:int}")]
        public async Task<IActionResult> UpdateAddress(int id, [FromBody] UpdateAddressDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            var userId = GetCurrentUserId();
            var response = await _addressService.UpdateAddressAsync(userId, id, dto);
            if (!response.Success) return BadRequest(response);
            return Ok(response);
        }

        // 5. DELETE: api/address/{id} ─── Delete address
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> DeleteAddress(int id)
        {
            var userId = GetCurrentUserId();
            var response = await _addressService.DeleteAddressAsync(userId, id);
            if (!response.Success) return BadRequest(response);
            return Ok(response);
        }

        // 6. PUT: api/address/{id}/set-default ─── Set as default address
        [HttpPut("{id:int}/set-default")]
        public async Task<IActionResult> SetDefaultAddress(int id)
        {
            var userId = GetCurrentUserId();
            var response = await _addressService.SetDefaultAddressAsync(userId, id);
            if (!response.Success) return BadRequest(response);
            return Ok(response);
        }
    }
}
