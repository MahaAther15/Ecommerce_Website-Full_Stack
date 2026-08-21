using ecommerce_backend.Models;
using ecommerce_backend.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace ecommerce_backend.Data
{
    public static class DbSeeder
    {
        public static async Task SeedProductsAsync(AppDbContext context, IPhotoService photoService, string imagesFolderPath)
        {
            // Agar database mein pehle se products hain to dobara seed na ho
            if (await context.Products.AnyAsync()) return;

            var seedData = new List<(string Brand, string Title, string ImageFileName, decimal Price, string Category, bool IsFeatured)>
            {
                // Featured Products (f1 to f8)
                ("Adidas", "Cartoon Astronaut T-Shirts", "f1.jpg", 78m, "featured", true),
                ("Nike", "Classic Windbreaker Jacket", "f2.jpg", 120m, "featured", true),
                ("H&M", "Graphic Cotton T-Shirt", "f3.jpg", 25m, "featured", true),
                ("Uniqlo", "Premium Oxford Shirt", "f4.jpg", 45m, "featured", true),
                ("Ralph Lauren", "Classic Fit Polo Shirt", "f5.jpg", 85m, "featured", true),
                ("Zara", "Oversized Urban T-Shirt", "f6.jpg", 35m, "featured", true),
                ("Adidas", "TechFit Workout T-Shirt", "f7.jpg", 60m, "featured", true),
                ("H&M", "Slim Fit Linen Shirt", "f8.jpg", 139m, "featured", true),

                // New Arrivals (n1 to n8)
                ("Adidas", "Cartoon Astronaut T-Shirts", "n1.jpg", 78m, "newArrival", false),
                ("Nike", "Classic Windbreaker Jacket", "n2.jpg", 120m, "newArrival", false),
                ("H&M", "Graphic Cotton T-Shirt", "n3.jpg", 25m, "newArrival", false),
                ("Uniqlo", "Premium Oxford Shirt", "n4.jpg", 45m, "newArrival", false),
                ("Ralph Lauren", "Classic Fit Polo Shirt", "n5.jpg", 85m, "newArrival", false),
                ("Zara", "Oversized Urban T-Shirt", "n6.jpg", 35m, "newArrival", false),
                ("Adidas", "TechFit Workout T-Shirt", "n7.jpg", 60m, "newArrival", false),
                ("H&M", "Slim Fit Linen Shirt", "n8.jpg", 139m, "newArrival", false)
            };

            var productsToInsert = new List<Product>();

            foreach (var item in seedData)
            {
                var fullImagePath = Path.Combine(imagesFolderPath, item.ImageFileName);
                string imageUrl = "";

                // Cloudinary par upload agar file exist karti ho
                if (File.Exists(fullImagePath))
                {
                    var uploadResult = await photoService.AddPhotoFromPathAsync(fullImagePath);
                    imageUrl = uploadResult.SecureUrl?.ToString() ?? "";
                }

                productsToInsert.Add(new Product
                {
                    Brand = item.Brand,
                    Title = item.Title,
                    Description = $"Premium quality {item.Brand} {item.Title}. Comfortable, stylish and durable fabric for all seasons.",
                    Price = item.Price,
                    OriginalPrice = item.Price + 20, // Example original price
                    Category = item.Category,
                    ImageUrl = imageUrl,
                    StockQuantity = 50,
                    Rating = 5.0,
                    ReviewCount = 12,
                    IsFeatured = item.IsFeatured,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                });
            }

            await context.Products.AddRangeAsync(productsToInsert);
            await context.SaveChangesAsync();
        }
        public static async Task SeedAdminUserAsync(AppDbContext context, IPasswordHasher passwordHasher)
{
    string adminEmail = "admin@ecommerce.com";

    // Check karein agar admin pehle se mojood nahi hai
    if (!await context.Users.AnyAsync(u => u.Email == adminEmail))
    {
        var adminUser = new User
        {
            FullName = "Super Admin",
            Email = adminEmail,
            PasswordHash = passwordHasher.HashPassword("Admin@12345"), // 👈 Admin Password yahan decide hoga
            Role = "Admin", // 👈 Role must be "Admin"
            AuthProvider = "Local",
            CreatedAt = DateTime.UtcNow
        };

        await context.Users.AddAsync(adminUser);
        await context.SaveChangesAsync();
    }
}

    }
}
