namespace ecommerce_backend.Models.Common
{
   public class ApiResponse<T>
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public T? Data { get; set; }
        public string? ErrorDetails { get; set; }
        public static ApiResponse<T> Fail(string message, string? errorDetails = null)
        {
            return new ApiResponse<T>
            {
                Success = false,
                Message = message,
                Data = default,
                ErrorDetails = errorDetails
            };
        }
    }
}   