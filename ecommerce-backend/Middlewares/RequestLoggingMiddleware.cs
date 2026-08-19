using System.Diagnostics;
using System.Security.Claims;
using Serilog;

namespace ecommerce_backend.Middlewares
{
    public class RequestLoggingMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<RequestLoggingMiddleware> _logger;

        public RequestLoggingMiddleware(RequestDelegate next, ILogger<RequestLoggingMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            // Skip logging for static files or swagger if desired
            var path = context.Request.Path.Value ?? string.Empty;
            if (path.StartsWith("/swagger") || path.StartsWith("/uploads") || path.EndsWith(".ico"))
            {
                await _next(context);
                return;
            }

            var stopwatch = Stopwatch.StartNew();
            var method = context.Request.Method;
            var clientIp = context.Connection.RemoteIpAddress?.ToString() ?? "unknown";

            try
            {
                // Let the request execute downstream
                await _next(context);
            }
            finally
            {
                stopwatch.Stop();
                var elapsedMs = stopwatch.ElapsedMilliseconds;
                var statusCode = context.Response.StatusCode;

                // Extract logged-in User Email / ID (if authenticated)
                var userEmail = context.User.FindFirst(ClaimTypes.Email)?.Value 
                             ?? context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value 
                             ?? "Anonymous";

                // Log format based on status code
                if (statusCode >= 500)
                {
                    _logger.LogError(
                        "HTTP {Method} {Path} responded {StatusCode} in {Elapsed}ms [IP: {ClientIp}, User: {User}]",
                        method, path, statusCode, elapsedMs, clientIp, userEmail);
                }
                else if (statusCode >= 400)
                {
                    _logger.LogWarning(
                        "HTTP {Method} {Path} responded {StatusCode} in {Elapsed}ms [IP: {ClientIp}, User: {User}]",
                        method, path, statusCode, elapsedMs, clientIp, userEmail);
                }
                else
                {
                    _logger.LogInformation(
                        "HTTP {Method} {Path} responded {StatusCode} in {Elapsed}ms [IP: {ClientIp}, User: {User}]",
                        method, path, statusCode, elapsedMs, clientIp, userEmail);
                }
            }
        }
    }

    // Extension method for clean registration
    public static class RequestLoggingMiddlewareExtensions
    {
        public static IApplicationBuilder UseRequestLogging(this IApplicationBuilder app)
        {
            return app.UseMiddleware<RequestLoggingMiddleware>();
        }
    }
}
