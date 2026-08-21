using ecommerce_backend.Data;
using ecommerce_backend.Dtos.Address;
using ecommerce_backend.Models;
using ecommerce_backend.Models.common;
using ecommerce_backend.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace ecommerce_backend.Services.Implementations
{
    public class AddressService : IAddressService
    {
        private readonly AppDbContext _context;

        public AddressService(AppDbContext context)
        {
            _context = context;
        }

        // 1. Get All Addresses of Current User
        public async Task<ApiResponse<IEnumerable<AddressDto>>> GetUserAddressesAsync(int userId)
        {
            var addresses = await _context.Set<Address>()
                .Where(a => a.UserId == userId)
                .OrderByDescending(a => a.IsDefault)
                .ThenByDescending(a => a.CreatedAt)
                .ToListAsync();

            return ApiResponse<IEnumerable<AddressDto>>.SuccessResponse(
                addresses.Select(MapToDto),
                "Addresses fetched successfully."
            );
        }

        // 2. Get Single Address by ID
        public async Task<ApiResponse<AddressDto>> GetAddressByIdAsync(int userId, int addressId)
        {
            var address = await _context.Set<Address>()
                .FirstOrDefaultAsync(a => a.Id == addressId && a.UserId == userId);

            if (address == null)
                return ApiResponse<AddressDto>.ErrorResponse("Address not found.", 404);

            return ApiResponse<AddressDto>.SuccessResponse(MapToDto(address), "Address retrieved.");
        }

        // 3. Create New Address
        public async Task<ApiResponse<AddressDto>> CreateAddressAsync(int userId, CreateAddressDto dto)
        {
            var userAddresses = await _context.Set<Address>()
                .Where(a => a.UserId == userId)
                .ToListAsync();

            // Agar user ka pehla address hai ya IsDefault true hai
            bool isFirstAddress = !userAddresses.Any();
            bool shouldBeDefault = dto.IsDefault || isFirstAddress;

            if (shouldBeDefault && userAddresses.Any())
            {
                foreach (var addr in userAddresses)
                {
                    addr.IsDefault = false;
                }
            }

            var newAddress = new Address
            {
                UserId = userId,
                FullName = dto.FullName,
                PhoneNumber = dto.PhoneNumber,
                StreetAddress = dto.StreetAddress,
                City = dto.City,
                State = dto.State,
                PostalCode = dto.PostalCode,
                Country = dto.Country,
                AddressType = dto.AddressType,
                IsDefault = shouldBeDefault,
                CreatedAt = DateTime.UtcNow
            };

            await _context.Set<Address>().AddAsync(newAddress);
            await _context.SaveChangesAsync();

            return ApiResponse<AddressDto>.SuccessResponse(MapToDto(newAddress), "Address saved successfully.");
        }

        // 4. Update Existing Address
        public async Task<ApiResponse<AddressDto>> UpdateAddressAsync(int userId, int addressId, UpdateAddressDto dto)
        {
            var address = await _context.Set<Address>()
                .FirstOrDefaultAsync(a => a.Id == addressId && a.UserId == userId);

            if (address == null)
                return ApiResponse<AddressDto>.ErrorResponse("Address not found.", 404);

            if (dto.IsDefault && !address.IsDefault)
            {
                var otherAddresses = await _context.Set<Address>()
                    .Where(a => a.UserId == userId && a.Id != addressId)
                    .ToListAsync();

                foreach (var other in otherAddresses)
                {
                    other.IsDefault = false;
                }
            }

            address.FullName = dto.FullName;
            address.PhoneNumber = dto.PhoneNumber;
            address.StreetAddress = dto.StreetAddress;
            address.City = dto.City;
            address.State = dto.State;
            address.PostalCode = dto.PostalCode;
            address.Country = dto.Country;
            address.AddressType = dto.AddressType;
            address.IsDefault = dto.IsDefault;
            address.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return ApiResponse<AddressDto>.SuccessResponse(MapToDto(address), "Address updated successfully.");
        }

        // 5. Delete Address
        public async Task<ApiResponse<bool>> DeleteAddressAsync(int userId, int addressId)
        {
            var address = await _context.Set<Address>()
                .FirstOrDefaultAsync(a => a.Id == addressId && a.UserId == userId);

            if (address == null)
                return ApiResponse<bool>.ErrorResponse("Address not found.", 404);

            bool wasDefault = address.IsDefault;
            _context.Set<Address>().Remove(address);
            await _context.SaveChangesAsync();

            // Agar default address delete hua hai to next available address ko default bana dein
            if (wasDefault)
            {
                var nextAddress = await _context.Set<Address>()
                    .Where(a => a.UserId == userId)
                    .OrderByDescending(a => a.CreatedAt)
                    .FirstOrDefaultAsync();

                if (nextAddress != null)
                {
                    nextAddress.IsDefault = true;
                    await _context.SaveChangesAsync();
                }
            }

            return ApiResponse<bool>.SuccessResponse(true, "Address deleted successfully.");
        }

        // 6. Set As Default Address
        public async Task<ApiResponse<AddressDto>> SetDefaultAddressAsync(int userId, int addressId)
        {
            var addresses = await _context.Set<Address>()
                .Where(a => a.UserId == userId)
                .ToListAsync();

            var targetAddress = addresses.FirstOrDefault(a => a.Id == addressId);
            if (targetAddress == null)
                return ApiResponse<AddressDto>.ErrorResponse("Address not found.", 404);

            foreach (var addr in addresses)
            {
                addr.IsDefault = (addr.Id == addressId);
                addr.UpdatedAt = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();

            return ApiResponse<AddressDto>.SuccessResponse(MapToDto(targetAddress), "Default address updated.");
        }

        private static AddressDto MapToDto(Address address)
        {
            return new AddressDto
            {
                Id = address.Id,
                UserId = address.UserId,
                FullName = address.FullName,
                PhoneNumber = address.PhoneNumber,
                StreetAddress = address.StreetAddress,
                City = address.City,
                State = address.State,
                PostalCode = address.PostalCode,
                Country = address.Country,
                AddressType = address.AddressType,
                IsDefault = address.IsDefault,
                CreatedAt = address.CreatedAt
            };
        }
    }
}
