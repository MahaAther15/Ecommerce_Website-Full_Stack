using ecommerce_backend.Dtos.Order;
using ecommerce_backend.Models;
using ecommerce_backend.Models.common;
using ecommerce_backend.Repositories.Interfaces;
using ecommerce_backend.Services.Interfaces;

namespace ecommerce_backend.Services.Implementations
{
    public class OrderService : IOrderService
    {
        private readonly IOrderRepository _orderRepo;
        private readonly ICartRepository _cartRepo;
        private readonly IProductRepository _productRepo;

        public OrderService(
            IOrderRepository orderRepo,
            ICartRepository cartRepo,
            IProductRepository productRepo)
        {
            _orderRepo = orderRepo;
            _cartRepo = cartRepo;
            _productRepo = productRepo;
        }

        public async Task<ApiResponse<OrderDto>> PlaceOrderAsync(int userId, PlaceOrderDto dto)
        {
            // 1. User ka cart fetch karo
            var cart = await _cartRepo.GetCartByUserIdAsync(userId);
            if (cart == null || !cart.Items.Any())
                return ApiResponse<OrderDto>.ErrorResponse("Your cart is empty. Add products before placing an order.", 400);

            // 2. Har CartItem ke liye stock validate karo
            foreach (var item in cart.Items)
            {
                var product = await _productRepo.GetByIdAsync(item.ProductId);
                if (product == null || !product.IsActive)
                    return ApiResponse<OrderDto>.ErrorResponse($"'{item.Product?.Title}' is no longer available.", 400);

                if (product.StockQuantity < item.Quantity)
                    return ApiResponse<OrderDto>.ErrorResponse($"Only {product.StockQuantity} units of '{product.Title}' in stock.", 400);
            }

            // 3. OrderItems create karo + stock decrement karo
            var orderItems = new List<OrderItem>();
            decimal totalAmount = 0;

            foreach (var item in cart.Items)
            {
                var product = await _productRepo.GetByIdAsync(item.ProductId);
                product!.StockQuantity -= item.Quantity;
                await _productRepo.UpdateAsync(product);

                var orderItem = new OrderItem
                {
                    ProductId = item.ProductId,
                    ProductTitle = item.Product?.Title ?? product.Title,
                    ProductImage = item.Product?.ImageUrl ?? product.ImageUrl,
                    UnitPrice = item.Product?.Price ?? product.Price,
                    Quantity = item.Quantity
                };
                orderItems.Add(orderItem);
                totalAmount += orderItem.UnitPrice * orderItem.Quantity;
            }

            // 4. Shipping fee calculate (e.g., free above Rs. 2000)
            decimal shippingFee = totalAmount >= 2000 ? 0 : 150;
            decimal finalAmount = totalAmount + shippingFee;

            // 5. Order create karo
            var order = new Order
            {
                UserId = userId,
                OrderItems = orderItems,
                TotalAmount = totalAmount,
                ShippingFee = shippingFee,
                FinalAmount = finalAmount,
                Status = OrderStatus.Pending,
                ShippingAddress = dto.ShippingAddress,
                City = dto.City,
                PostalCode = dto.PostalCode,
                Country = dto.Country,
                PhoneNumber = dto.PhoneNumber,
                PaymentMethod = dto.PaymentMethod,
                CreatedAt = DateTime.UtcNow
            };

            await _orderRepo.CreateOrderAsync(order);

            // Assign sequential Order Number e.g. ORD-10001, ORD-10002
            order.OrderNumber = $"ORD-{10000 + order.Id}";
            await _orderRepo.UpdateOrderAsync(order);

            // 6. Cart clear karo
            await _cartRepo.ClearCartAsync(cart.Id);

            return ApiResponse<OrderDto>.SuccessResponse(MapToDto(order), "Order placed successfully!");
        }

        public async Task<ApiResponse<OrderDto>> GetOrderByIdAsync(int userId, int orderId)
        {
            var order = await _orderRepo.GetOrderByIdAsync(orderId);
            if (order == null)
                return ApiResponse<OrderDto>.ErrorResponse("Order not found.", 404);

            // User sirf apna order dekh sakta hai
            if (order.UserId != userId)
                return ApiResponse<OrderDto>.ErrorResponse("Unauthorized access to this order.", 403);

            return ApiResponse<OrderDto>.SuccessResponse(MapToDto(order), "Order fetched successfully.");
        }

        public async Task<ApiResponse<IEnumerable<OrderDto>>> GetMyOrdersAsync(int userId)
        {
            var orders = await _orderRepo.GetOrdersByUserIdAsync(userId);
            return ApiResponse<IEnumerable<OrderDto>>.SuccessResponse(
                orders.Select(MapToDto),
                "Orders fetched successfully."
            );
        }

        public async Task<ApiResponse<IEnumerable<OrderDto>>> GetAllOrdersAsync()
        {
            var orders = await _orderRepo.GetAllOrdersAsync();
            return ApiResponse<IEnumerable<OrderDto>>.SuccessResponse(
                orders.Select(MapToDto),
                "All orders fetched successfully."
            );
        }

        public async Task<ApiResponse<OrderDto>> UpdateOrderStatusAsync(int orderId, UpdateOrderStatusDto dto)
        {
            var order = await _orderRepo.GetOrderByIdAsync(orderId);
            if (order == null)
                return ApiResponse<OrderDto>.ErrorResponse("Order not found.", 404);

            order.Status = dto.Status;
            if (dto.Status == OrderStatus.Delivered)
            {
                order.DeliveredAt = DateTime.UtcNow;
                order.IsPaid = true;
                order.PaidAt = DateTime.UtcNow;
            }
            await _orderRepo.UpdateOrderAsync(order);

            return ApiResponse<OrderDto>.SuccessResponse(MapToDto(order), $"Order status updated to '{dto.Status}'.");
        }

        public async Task<ApiResponse<bool>> CancelOrderAsync(int userId, int orderId)
        {
            var order = await _orderRepo.GetOrderByIdAsync(orderId);
            if (order == null)
                return ApiResponse<bool>.ErrorResponse("Order not found.", 404);

            if (order.UserId != userId)
                return ApiResponse<bool>.ErrorResponse("Unauthorized.", 403);

            // Sirf Pending orders cancel ho sakte hain
            if (order.Status != OrderStatus.Pending)
                return ApiResponse<bool>.ErrorResponse("Only pending orders can be cancelled.", 400);

            // Stock wapas restore karo
            foreach (var item in order.OrderItems)
            {
                var product = await _productRepo.GetByIdAsync(item.ProductId);
                if (product != null)
                {
                    product.StockQuantity += item.Quantity;
                    await _productRepo.UpdateAsync(product);
                }
            }

            order.Status = OrderStatus.Cancelled;
            await _orderRepo.UpdateOrderAsync(order);

            return ApiResponse<bool>.SuccessResponse(true, "Order cancelled successfully. Stock restored.");
        }

        private static OrderDto MapToDto(Order order)
        {
            return new OrderDto
            {
                Id = order.Id,
                OrderNumber = !string.IsNullOrEmpty(order.OrderNumber) ? order.OrderNumber : $"ORD-{10000 + order.Id}",
                UserId = order.UserId,
                OrderItems = order.OrderItems.Select(i => new OrderItemDto
                {
                    Id = i.Id,
                    ProductId = i.ProductId,
                    ProductTitle = i.ProductTitle,
                    ProductImage = i.ProductImage,
                    UnitPrice = i.UnitPrice,
                    Quantity = i.Quantity
                }).ToList(),
                TotalAmount = order.TotalAmount,
                ShippingFee = order.ShippingFee,
                Discount = order.Discount,
                FinalAmount = order.FinalAmount,
                Status = order.Status.ToString(),
                ShippingAddress = order.ShippingAddress,
                City = order.City,
                PostalCode = order.PostalCode,
                Country = order.Country,
                PhoneNumber = order.PhoneNumber,
                PaymentMethod = order.PaymentMethod,
                IsPaid = order.IsPaid,
                CreatedAt = order.CreatedAt
            };
        }
    }
}
