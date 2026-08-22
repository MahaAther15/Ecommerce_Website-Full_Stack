using System.Text;
using ecommerce_backend.Data;
using ecommerce_backend.Repositories.Interfaces;
using ecommerce_backend.Repositories.Implementations;
using ecommerce_backend.Services.Interfaces;
using ecommerce_backend.Services.Implementations;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using ecommerce_backend.Middlewares;  // Import the middleware
using Microsoft.AspNetCore.HttpOverrides; // For Client IP, X-Forwarded-Proto
using System.Threading.RateLimiting;  // Import rate limiting namespace
using Microsoft.AspNetCore.RateLimiting; // Import rate limiting namespace
using Serilog; // Import serilog for logging
using Microsoft.AspNetCore.ResponseCompression; // Import response compression namespace


var builder=WebApplication.CreateBuilder(args);

// 1. Add DbContext (SQL Server / SQLite)
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));


// 2. Register Services
builder.Services.AddScoped<IPasswordHasher, PasswordHasher>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IJwtTokenGenerator, JwtTokenGenerator>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IEmailService, EmailService>();
builder.Services.AddScoped<IProductService, ProductService>();
builder.Services.AddScoped<IPhotoService, PhotoService>();
builder.Services.AddScoped<ICategoryService, CategoryService>();
builder.Services.AddScoped<IBrandService, BrandService>();
builder.Services.AddScoped<ICartService, CartService>();
builder.Services.AddScoped<IOrderService, OrderService>();
builder.Services.AddScoped<IPaymentService, PaymentService>();
builder.Services.AddScoped<IAddressService, AddressService>();
builder.Services.AddScoped<IWishlistService, WishlistService>();
builder.Services.AddScoped<IInventoryService, InventoryService>();
builder.Services.AddScoped<IReviewService, ReviewService>();



// Configure Forwarded Headers Options
builder.Services.Configure<ForwardedHeadersOptions>(options =>
{
    options.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto | ForwardedHeaders.XForwardedHost;
    
    // In production behind a proxy (like NGINX or Docker network), clear default limits:
    options.KnownIPNetworks.Clear();
    options.KnownProxies.Clear();
});
// (Optional) Configure HTTPS options
builder.Services.AddHttpsRedirection(options =>
{
    options.RedirectStatusCode = StatusCodes.Status307TemporaryRedirect; // or 308 Permanent
    options.HttpsPort = 7257; // Your HTTPS port in launchSettings.json (if needed)
});

// Add HSTS for production security
builder.Services.AddHsts(options =>
{
    options.Preload = true;
    options.IncludeSubDomains = true;
    options.MaxAge = TimeSpan.FromDays(60); // Tell browser to remember HTTPS for 60 days
});

// Configure Rate Limiting (100 requests per minute per IP)
builder.Services.AddRateLimiter(options =>
{
    // Customize the 429 response when limit is exceeded
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
    
    options.OnRejected = async (context, token) =>
    {
        context.HttpContext.Response.ContentType = "application/json";
        
        var response = new
        {
            success = false,
            message = "Too many requests. You are allowed only 100 requests per minute. Please try again later.",
            statusCode = 429
        };
        
        await context.HttpContext.Response.WriteAsJsonAsync(response, cancellationToken: token);
    };

    // Global IP-based Fixed Window Rate Limiter (100 req / 1 min)
    options.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext, string>(httpContext =>
    {
        // Get client IP address (from ForwardedHeaders)
        var clientIp = httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";

        return RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: clientIp,
            factory: partition => new FixedWindowRateLimiterOptions
            {
                AutoReplenishment = true,
                PermitLimit = 100,                         // 100 requests
                Window = TimeSpan.FromMinutes(1),          // per 1 minute
                QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
                QueueLimit = 0                             // Reject immediately when limit reached
            });
    });
});
// Configure Serilog (Console + Daily Rotating File)
Log.Logger = new LoggerConfiguration()
    .MinimumLevel.Information()
    .Enrich.FromLogContext()
    .WriteTo.Console()
    .WriteTo.File(
        path: "Logs/log-.txt",
        rollingInterval: RollingInterval.Day,
        retainedFileCountLimit: 14) // Keep 14 days of logs
    .CreateLogger();

builder.Host.UseSerilog();



// 3. Register Repositories
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IProductRepository, ProductRepository>();
builder.Services.AddScoped<ICategoryRepository, CategoryRepository>();
builder.Services.AddScoped<IBrandRepository, BrandRepository>();
builder.Services.AddScoped<ICartRepository, CartRepository>();
builder.Services.AddScoped<IOrderRepository, OrderRepository>();
builder.Services.AddScoped<IReviewRepository, ReviewRepository>();


// 4. Configure JWT Authentication
var jwtSettings = builder.Configuration.GetSection("JwtSettings");
var secretKey = jwtSettings["SecretKey"]!;

// Program.cs me AddCors section:
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:3000") // Frontend URL
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials(); // 👈 Cookies send aur receive karne ke liye yeh ZAROORI hai
    });
});

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtSettings["Issuer"],
        ValidAudience = jwtSettings["Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey))
    };
});
builder.Services.AddAuthorization();
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new System.Text.Json.Serialization.JsonStringEnumConverter());
    });

// In builder.Services section:
builder.Services.AddResponseCompression(options =>
{
    options.EnableForHttps = true;
    options.Providers.Add<BrotliCompressionProvider>();
    options.Providers.Add<GzipCompressionProvider>();
});

var app = builder.Build();

// Seed Database
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    var photoService = scope.ServiceProvider.GetRequiredService<IPhotoService>();
    var passwordHasher = scope.ServiceProvider.GetRequiredService<IPasswordHasher>();
    
    // Frontend images folder path
    var imagesPath = Path.GetFullPath(Path.Combine(builder.Environment.ContentRootPath, "..", "ecommerce-frontend", "public", "img", "products"));
    
    await DbSeeder.SeedProductsAsync(context, photoService, imagesPath);
    await DbSeeder.SeedAdminUserAsync(context, passwordHasher);
}

// Middleware 1 ==> Catch all exception errors from backend and give controlled error page to frontend
app.UseGlobalExceptionHandling();

// Middleware 2 ==> Attach Correlation ID for end-to-end request tracing
app.UseCorrelationId();

// Middleware 3 ==> Security Headers (Anti-XSS, Anti-Clickjacking)
app.UseSecurityHeaders();

// Middleware 4 ==> Forwarded Headers Middleware (Client IP from Proxy)
app.UseForwardedHeaders();

// Middleware 5 ==> Serilog Request Logging Middleware
app.UseRequestLogging();

// Middleware 6 & 7 ==> Security: Enable HSTS and HTTPS Redirection in Production
if (!app.Environment.IsDevelopment())
{
    app.UseHsts();
    app.UseHttpsRedirection();
}

// Middleware 8 ==> Enable Response Compression (Fast JSON Delivery)
app.UseResponseCompression();

// Middleware 9 ==> Enable Static Files (Product images served directly)
app.UseStaticFiles();

// Middleware 10 ==> Selects the matching Endpoint
app.UseRouting();

// Middleware 11 ==> Enable CORS
app.UseCors("AllowFrontend");

// Middleware 12 ==> Enable Rate Limiting
app.UseRateLimiter();

// Middleware 13 ==> Enable Authentication
app.UseAuthentication();

// Middleware 14 ==> Enable Authorization
app.UseAuthorization();

// Middleware 15 ==> Map Controllers
app.MapControllers();

// Auto-seed Admin User if not already present
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var context = services.GetRequiredService<AppDbContext>();
        var passwordHasher = services.GetRequiredService<IPasswordHasher>();
        await DbSeeder.SeedAdminUserAsync(context, passwordHasher);
    }
    catch (Exception ex)
    {
        Log.Error(ex, "An error occurred during database seeding of admin user.");
    }
}

// Middleware 16 ==> Run
app.Run();