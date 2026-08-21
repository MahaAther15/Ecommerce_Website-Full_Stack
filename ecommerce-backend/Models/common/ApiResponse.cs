namespace ecommerce_backend.Models.common
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
        public static ApiResponse<T> SuccessResponse(T data, string message)
{
    return new ApiResponse<T>
    {
        Success = true,
        Data = data,
        Message = message
    };
}
public static ApiResponse<T> ErrorResponse(string message, int statusCode = 500)
{
    return new ApiResponse<T>
    {
        Success = false,
        Message = message,
        Data = default,
        ErrorDetails = $"Status Code: {statusCode}"
    };
    }
    }
}   