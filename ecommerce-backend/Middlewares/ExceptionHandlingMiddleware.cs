using System.Net;
using System.Text.Json;
using ecommerce_backend.Models.Common;

namespace ecommerce_backend.Middlewares
{
    public class ExceptionHandlingMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<ExceptionHandlingMiddleware> _logger;
        private readonly IHostEnvironment _env;

        public ExceptionHandlingMiddleware(
            RequestDelegate next,
            ILogger<ExceptionHandlingMiddleware> logger,
            IHostEnvironment env)
        {
            _next = next;
            _logger = logger;
            _env = env;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                // Pass control to the next middleware in the pipeline
                await _next(context);
            }
            catch (Exception ex)
            {
                // Catch any unhandled exception thrown downstream
                _logger.LogError(ex, "An unhandled exception occurred: {Message}", ex.Message);
                await HandleExceptionAsync(context, ex);
            }
        }

        private async Task HandleExceptionAsync(HttpContext context, Exception exception)
        {
            context.Response.ContentType = "application/json";

            var statusCode = HttpStatusCode.InternalServerError;
            var message = "An unexpected error occurred. Please try again later.";

            // Optional: Map custom application exception types to specific status codes
            switch (exception)
            {
                case KeyNotFoundException:
                    statusCode = HttpStatusCode.NotFound;
                    message = exception.Message;
                    break;
                case UnauthorizedAccessException:
                    statusCode = HttpStatusCode.Unauthorized;
                    message = "Unauthorized access.";
                    break;
                case ArgumentException or InvalidOperationException:
                    statusCode = HttpStatusCode.BadRequest;
                    message = exception.Message;
                    break;
                default:
                    statusCode = HttpStatusCode.InternalServerError;
                    break;
            }

            context.Response.StatusCode = (int)statusCode;

            // In Development, include stack trace details for debugging. In Production, keep it null for security.
            var errorDetails = _env.IsDevelopment() ? exception.StackTrace : null;

            var response = ApiResponse<object>.Fail(message, errorDetails);

            var jsonOptions = new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase
            };

            await context.Response.WriteAsync(JsonSerializer.Serialize(response, jsonOptions));
        }
    }

    // Extension method for clean registration in Program.cs
    public static class ExceptionHandlingMiddlewareExtensions
    {
        public static IApplicationBuilder UseGlobalExceptionHandling(this IApplicationBuilder app)
        {
            return app.UseMiddleware<ExceptionHandlingMiddleware>();
        }
    }
}
