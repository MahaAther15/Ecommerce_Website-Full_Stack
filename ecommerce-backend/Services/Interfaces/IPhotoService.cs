// initial images upload to cloudinary and also when admin create new product it will laso be uploaded on cloudinary 
using CloudinaryDotNet.Actions;
using Microsoft.AspNetCore.Http;

namespace ecommerce_backend.Services.Interfaces
{
    public interface IPhotoService
    {
        Task<ImageUploadResult> AddPhotoAsync(IFormFile file);
        Task<ImageUploadResult> AddPhotoFromPathAsync(string filePath);
        Task<DeletionResult> DeletePhotoAsync(string publicId);
    }
}
