using ecommerce_backend.Models;
using Microsoft.EntityFrameworkCore;

namespace ecommerce_backend.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        // Database Tables
        public DbSet<User> Users { get; set; }
        public DbSet<Product> Products { get; set; }
        public DbSet<Category> Categories { get; set; }
        public DbSet<Brand> Brands {get;set;}
        public DbSet<Cart> Carts { get; set; }
        public DbSet<CartItem> CartItems { get; set; }
        public DbSet<Order> Orders { get; set; }
        public DbSet<OrderItem> OrderItems { get; set; }
        public DbSet<Address> Addresses { get; set; }
        public DbSet<Wishlist> Wishlists { get; set; }
        public DbSet<WishlistItem> WishlistItems { get; set; }
        public DbSet<InventoryLog> InventoryLogs { get; set; }
        public DbSet<Review> Reviews { get; set; }




        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // User Table Configuration & Constraints
            modelBuilder.Entity<User>(entity =>
            {
                // Email Index Unique (Duplicate Email Register hone se bachane ke liye)
                entity.HasIndex(u => u.Email)
                      .IsUnique();

                entity.Property(u => u.Email)
                      .IsRequired()
                      .HasMaxLength(150);

                entity.Property(u => u.FullName)
                      .IsRequired()
                      .HasMaxLength(100);

                entity.Property(u => u.PasswordHash)
                      .IsRequired();

                entity.Property(u => u.Role)
                      .HasDefaultValue("Customer");
            });
            
            // Ek product user ki wishlist me duplicate na ho
            modelBuilder.Entity<WishlistItem>()
            .HasIndex(w => new { w.WishlistId, w.ProductId })
            .IsUnique(); 

            // Order Number Index
            modelBuilder.Entity<Order>()
                .HasIndex(o => o.OrderNumber);

            modelBuilder.Entity<InventoryLog>()
                .HasIndex(log => log.ProductId);

            // Review Table Constraints (Restrict cascade to avoid SQL Server cycles)
            modelBuilder.Entity<Review>(entity =>
            {
                entity.HasOne(r => r.User)
                      .WithMany()
                      .HasForeignKey(r => r.UserId)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(r => r.Order)
                      .WithMany()
                      .HasForeignKey(r => r.OrderId)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(r => r.Product)
                      .WithMany()
                      .HasForeignKey(r => r.ProductId)
                      .OnDelete(DeleteBehavior.Cascade);
            });
        }
    }
}
