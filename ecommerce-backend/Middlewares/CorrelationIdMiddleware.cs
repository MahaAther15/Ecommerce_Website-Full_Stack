namespace ecommerce_backend.Middlewares
{
    public class CorrelationIdMiddleware
    {
        private const string CorrelationIdHeader = "X-Correlation-ID";
        private readonly RequestDelegate _next;

        public CorrelationIdMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            // If client sent an ID, use it; otherwise generate a new GUID
            var correlationId = context.Request.Headers[CorrelationIdHeader].FirstOrDefault() 
                                ?? Guid.NewGuid().ToString("N");

            // Attach to current request items (for Serilog) and response headers (for frontend)
            context.Items[CorrelationIdHeader] = correlationId;
            context.Response.Headers[CorrelationIdHeader] = correlationId;

            // Push to Serilog LogContext so all logs in this request have the CorrelationId
            using (Serilog.Context.LogContext.PushProperty("CorrelationId", correlationId))
            {
                await _next(context);
            }
        }
    }

    public static class CorrelationIdMiddlewareExtensions
    {
        public static IApplicationBuilder UseCorrelationId(this IApplicationBuilder app)
        {
            return app.UseMiddleware<CorrelationIdMiddleware>();
        }
    }
}
