using ecommerce_backend.Dtos.Address;
using ecommerce_backend.Models.common;

namespace ecommerce_backend.Services.Interfaces
{
    public interface IAddressService
    {
        Task<ApiResponse<IEnumerable<AddressDto>>> GetUserAddressesAsync(int userId);
        Task<ApiResponse<AddressDto>> GetAddressByIdAsync(int userId, int addressId);
        Task<ApiResponse<AddressDto>> CreateAddressAsync(int userId, CreateAddressDto dto);
        Task<ApiResponse<AddressDto>> UpdateAddressAsync(int userId, int addressId, UpdateAddressDto dto);
        Task<ApiResponse<bool>> DeleteAddressAsync(int userId, int addressId);
        Task<ApiResponse<AddressDto>> SetDefaultAddressAsync(int userId, int addressId);
    }
}
