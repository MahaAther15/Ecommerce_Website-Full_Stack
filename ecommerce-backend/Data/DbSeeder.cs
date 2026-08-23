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
                    PasswordHash = passwordHasher.HashPassword("Admin@12345"),
                    Role = "Admin",
                    AuthProvider = "Local",
                    CreatedAt = DateTime.UtcNow
                };

                await context.Users.AddAsync(adminUser);
                await context.SaveChangesAsync();
            }
        }

        public static async Task SeedBlogsAsync(AppDbContext context, IPhotoService? photoService = null, string? blogImagesFolderPath = null)
        {
            // Agar database mein pehle se blogs hain to dobara seed na ho
            if (await context.Blogs.AnyAsync()) return;

            var blogs = new List<Blog>
            {
                new Blog
                {
                    Id = "b1",
                    Title = "The Cotton Jersey Zip-Up Hoodie",
                    Slug = "the-cotton-jersey-zip-up-hoodie",
                    description = "Kickstarter man braid godard fashion trends. Discover how the classic cotton zip-up hoodie became a versatile staple.",
                    ImageUrl = "/img/blog/b1.jpg",
                    Date = new DateTime(2026, 1, 13),
                    Author = "Alex Morgan",
                    AuthorRole = "Senior Style Editor",
                    Category = "Fashion & Comfort",
                    ReadTime = "5 min read",
                    Quote = "Style is a way to say who you are without having to speak. A great cotton hoodie says you value both comfort and effortless confidence.",
                    FullContent = new List<string>
                    {
                        "The cotton jersey zip-up hoodie has evolved from casual sportswear into an essential cornerstone of modern streetwear and smart-casual wardrobes. Its soft jersey fabric provides exceptional breathability and warmth without sacrificing sleekness.",
                        "Whether layered beneath a structured tailored overcoat or paired with relaxed denim and retro sneakers, the zip-up hoodie effortlessly bridges the gap between functional comfort and high-street aesthetic.",
                        "When choosing the perfect hoodie, pay attention to the GSM (grams per square meter) weight of the cotton fabric, double-lined hoods, and heavy-duty metal zippers for longevity."
                    },
                    KeyTakeAways = new List<string>
                    {
                        "Opt for 100% organic heavy-weight cotton for premium durability.",
                        "Layering with a structured coat elevates a casual hoodie into smart-casual.",
                        "Neutral tones like oatmeal, charcoal, and heather gray offer maximum versatility."
                    }
                },
                new Blog
                {
                    Id = "b2",
                    Title = "How to Style a Quiff",
                    Slug = "how-to-style-a-quiff",
                    description = "Master the art of sculpting and maintaining a timeless quiff hairstyle with professional styling tips.",
                    ImageUrl = "/img/blog/b2.jpg",
                    Date = new DateTime(2026, 2, 13),
                    Author = "David Miller",
                    AuthorRole = "Grooming Specialist",
                    Category = "Grooming & Hair",
                    ReadTime = "4 min read",
                    Quote = "A well-crafted haircut is the ultimate accessory. The key to a stellar quiff lies in root volume and matte finish product control.",
                    FullContent = new List<string>
                    {
                        "The quiff remains one of the most iconic and adaptable hairstyles in men's grooming. Combining elements of the pompadour, 1950s flat top, and mohawk, it offers volume and character suited for all hair lengths.",
                        "To achieve a long-lasting quiff, start with damp hair. Apply a sea salt spray or lightweight volumizing mousse before blow-drying upwards with a round brush to build structure and lift at the roots.",
                        "Finish by working a dime-sized amount of matte clay or pomade through your hair, shaping the front section upward and slightly backward for a textured, natural finish."
                    },
                    KeyTakeAways = new List<string>
                    {
                        "Pre-styling with blow-dryer heat is 80% of building long-lasting volume.",
                        "Use matte clay for modern textured quiffs or high-shine pomade for vintage looks.",
                        "Regular trims every 3 to 4 weeks keep the sides tight and contrast sharp."
                    }
                },
                new Blog
                {
                    Id = "b3",
                    Title = "Must Have Scarf-Girl Items",
                    Slug = "must-have-scarf-girl-items",
                    description = "Essential seasonal scarves, accessories, and styling techniques for creating urban chic capsule wardrobes.",
                    ImageUrl = "/img/blog/b3.jpg",
                    Date = new DateTime(2026, 1, 12),
                    Author = "Sophia Chen",
                    AuthorRole = "Fashion Trend Analyst",
                    Category = "Trend Alert",
                    ReadTime = "6 min read",
                    Quote = "Accessories are where personal style shines brightest. A statement scarf turns even the simplest coat into a fashion highlight.",
                    FullContent = new List<string>
                    {
                        "As temperatures transition, scarves emerge as the ultimate transformer for any outfit. From oversized wool blanket scarves to delicate silk squares, the right scarf adds instant dimension, warmth, and luxury.",
                        "This season's 'Scarf-Girl' aesthetic centers around tactile textures—mohair blends, fringe details, and bold pattern blocking paired with understated monochrome outerwear.",
                        "Learn simple draping techniques: the French knot for elegant silk scarves, the casual front drape for chunky knits, or styling an oversized scarf as a cozy makeshift shawl."
                    },
                    KeyTakeAways = new List<string>
                    {
                        "Invest in natural fiber blends like cashmere and lambswool for skin softness.",
                        "Experiment with pattern contrast—pair plaid scarves with plain wool coats.",
                        "Keep accessories balanced: heavy scarves call for minimal jewelry."
                    }
                },
                new Blog
                {
                    Id = "b4",
                    Title = "Runway-Inspired Trends",
                    Slug = "runway-inspired-trends",
                    description = "Translating high-fashion runway statements into accessible, everyday streetwear silhouettes.",
                    ImageUrl = "/img/blog/b4.jpg",
                    Date = new DateTime(2026, 4, 17),
                    Author = "Emma Watson",
                    AuthorRole = "Runway Correspondent",
                    Category = "High Fashion",
                    ReadTime = "7 min read",
                    Quote = "Don't let fashion own you; decide what you are, what you want to express by the way you dress and how you live.",
                    FullContent = new List<string>
                    {
                        "Recent fashion weeks have showcased a powerful blend of nostalgic revival and futuristic minimalism. Designers are rethinking classic tailored suits, dramatic outerwear, and bold color palettes.",
                        "Translating runway trends into real life doesn't mean adopting head-to-toe avant-garde looks. Instead, pick one standout element—such as an oversized blazer, wide-leg trousers, or chrome metallic accessories.",
                        "Focus on silhouette proportions: balancing volume on top with streamlined tailoring below creates a curated runway-inspired look suited for everyday city life."
                    },
                    KeyTakeAways = new List<string>
                    {
                        "Focus on key silhouette trends like dramatic shoulders and wide hems.",
                        "Mix high-fashion statement pieces with minimal wardrobe basics.",
                        "Monochrome styling creates instant high-fashion sophistication."
                    }
                },
                new Blog
                {
                    Id = "b5",
                    Title = "Seasonal Wardrobe Transition",
                    Slug = "seasonal-wardrobe-transition",
                    description = "Seamlessly transition your daily wardrobe from chilly winter layers into breezy spring aesthetics.",
                    ImageUrl = "/img/blog/b5.jpg",
                    Date = new DateTime(2026, 3, 20),
                    Author = "Liam O'Connor",
                    AuthorRole = "Wardrobe Stylist",
                    Category = "Style & Seasons",
                    ReadTime = "4 min read",
                    Quote = "Great styling during seasonal transitions is all about versatile layering and breathable fabrics.",
                    FullContent = new List<string>
                    {
                        "Seasonal shifts require clever garment combinations. Instead of heavy parkas, transition toward lightweight trench coats, unlined denim jackets, and merino knitwear.",
                        "Incorporate lighter pastel and neutral hues to reflect brighter days while keeping core basics grounded with timeless denim.",
                        "Focus on breathable natural textiles like linen-cotton blends that keep you warm during cool mornings and comfortable in the afternoon sun."
                    },
                    KeyTakeAways = new List<string>
                    {
                        "Layer light knits over t-shirts for adjustable day-to-night temperature control.",
                        "Introduce spring accents like sage green, sky blue, and cream into your palette.",
                        "Store winter woolens properly in breathable garment bags."
                    }
                },
                new Blog
                {
                    Id = "b6",
                    Title = "Baggy Bold Trend",
                    Slug = "baggy-bold-trend",
                    description = "The resurgence of 90s relaxed denim, oversized blazers, and urban street culture aesthetics.",
                    ImageUrl = "/img/blog/b6.jpg",
                    Date = new DateTime(2026, 5, 19),
                    Author = "Marcus Vance",
                    AuthorRole = "Street Culture Columnist",
                    Category = "Streetwear",
                    ReadTime = "5 min read",
                    Quote = "Baggy fashion is more than a silhouette; it's a movement of freedom, movement, and unpretentious cool.",
                    FullContent = new List<string>
                    {
                        "The 90s baggy trend has made a triumphant comeback, replacing hyper-skinny fits with relaxed, confident, and expressive proportions across denim, cargo pants, and outerwear.",
                        "Key to nailing the baggy look is intentionality. Oversized garments should look purposeful, not ill-fitting. Tailoring at the waist and cuff breaks ensures a crisp drape over chunky sneakers or boots.",
                        "Pair wide-leg trousers with fitted tees or cropped jackets to maintain balance and prevent the silhouette from overwhelming your frame."
                    },
                    KeyTakeAways = new List<string>
                    {
                        "Ensure waist fits accurately while legs and thighs enjoy generous volume.",
                        "Balance proportions: pair loose bottoms with structured or fitted tops.",
                        "Complete the look with retro platform sneakers or chunky leather boots."
                    }
                }
            };

            // Agar Cloudinary PhotoService aur folder path available ho, images ko Cloudinary par bhi seed kar sakte hain
            if (photoService != null && !string.IsNullOrEmpty(blogImagesFolderPath))
            {
                foreach (var blog in blogs)
                {
                    var fileName = $"{blog.Id}.jpg";
                    var fullPath = Path.Combine(blogImagesFolderPath, fileName);
                    if (File.Exists(fullPath))
                    {
                        try
                        {
                            var uploadResult = await photoService.AddPhotoFromPathAsync(fullPath);
                            if (uploadResult.SecureUrl != null)
                            {
                                blog.ImageUrl = uploadResult.SecureUrl.ToString();
                            }
                        }
                        catch
                        {
                            // fallback to existing relative path
                        }
                    }
                }
            }

            await context.Blogs.AddRangeAsync(blogs);
            await context.SaveChangesAsync();
        }
    }
}
