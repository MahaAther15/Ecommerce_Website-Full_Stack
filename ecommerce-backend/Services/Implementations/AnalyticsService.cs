using ecommerce_backend.Data;
using ecommerce_backend.Dtos;
using ecommerce_backend.Models;
using ecommerce_backend.Models.common;
using ecommerce_backend.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace ecommerce_backend.Services.Implementations
{
    public class AnalyticsService : IAnalyticsService
    {
        private readonly AppDbContext _context;

        public AnalyticsService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<ApiResponse<CompleteAnalyticsReportDto>> GetAnalyticsReportAsync(string timeRange)
        {
            DateTime now = DateTime.UtcNow;
            DateTime startDate = timeRange.ToLower() switch
            {
                "today" => now.Date,
                "7days" => now.AddDays(-7),
                "30days" => now.AddDays(-30),
                "month" => new DateTime(now.Year, now.Month, 1),
                "year" => new DateTime(now.Year, 1, 1),
                _ => DateTime.MinValue // All Time
            };

            DateTime previousPeriodStart = startDate == DateTime.MinValue 
                ? DateTime.MinValue 
                : startDate.AddDays(-(now - startDate).TotalDays);

            // 1. Orders in Range (Exclude Cancelled)
            var validOrders = await _context.Orders
                .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.Product)
                .Where(o => o.CreatedAt >= startDate && o.Status != OrderStatus.Cancelled)
                .ToListAsync();

            // 2. Previous Period Orders (For Growth Rate Calculation)
            var previousPeriodOrders = await _context.Orders
                .Where(o => o.CreatedAt >= previousPeriodStart && o.CreatedAt < startDate && o.Status != OrderStatus.Cancelled)
                .ToListAsync();

            // 3. Refunds in Range
            var refunds = await _context.ReturnRequests
                .Where(r => r.CreatedAt >= startDate && (r.Status == ReturnStatus.Approved || r.Status == ReturnStatus.Refunded))
                .ToListAsync();

            // 4. Damaged Stock Logs
            var damagedLogs = await _context.InventoryLogs
                .Include(l => l.Product)
                .Where(l => l.CreatedAt >= startDate && l.Action == InventoryAction.Damaged)
                .ToListAsync();

            // 5. Operating Expenses in Range
            var expenses = await _context.Expenses
                .Where(e => e.ExpenseDate >= startDate)
                .ToListAsync();

            // ─── REVENUE & COGS CALCULATIONS ───
            decimal grossRevenue = validOrders.Sum(o => o.FinalAmount);
            decimal previousRevenue = previousPeriodOrders.Sum(o => o.FinalAmount);
            decimal totalRefunded = refunds.Sum(r => r.RefundAmount);
            decimal netRevenue = Math.Max(0, grossRevenue - totalRefunded);

            // COGS (Each sold unit * Product Cost Price; default cost = 65% of price if not specified)
            decimal totalCogs = 0;
            int totalUnitsSold = 0;
            var categoryStats = new Dictionary<string, CategoryFinancialBreakdownDto>();

            foreach (var order in validOrders)
            {
                foreach (var item in order.OrderItems)
                {
                    totalUnitsSold += item.Quantity;
                    decimal unitCost = item.Product?.OriginalPrice ?? (item.UnitPrice * 0.65m);
                    decimal itemCogs = unitCost * item.Quantity;
                    decimal itemRevenue = item.UnitPrice * item.Quantity;

                    totalCogs += itemCogs;

                    // Category Breakdown
                    string cat = item.Product?.Category ?? "Uncategorized";
                    if (!categoryStats.ContainsKey(cat))
                    {
                        categoryStats[cat] = new CategoryFinancialBreakdownDto { CategoryName = cat };
                    }
                    categoryStats[cat].Revenue += itemRevenue;
                    categoryStats[cat].Cost += itemCogs;
                    categoryStats[cat].UnitsSold += item.Quantity;
                    categoryStats[cat].Profit += (itemRevenue - itemCogs);
                }
            }

            // ─── LOSS & EXPENSES ───
            int damagedUnits = damagedLogs.Sum(l => Math.Abs(l.QuantityChanged));
            decimal damagedLoss = damagedLogs.Sum(l => Math.Abs(l.QuantityChanged) * (l.Product?.OriginalPrice ?? (l.Product?.Price * 0.65m ?? 0)));
            decimal operatingExpenses = expenses.Sum(e => e.Amount);

            // ─── PROFITABILITY ───
            decimal grossProfit = netRevenue - totalCogs;
            decimal grossMarginPercent = netRevenue > 0 ? (grossProfit / netRevenue) * 100 : 0;

            decimal netProfit = grossProfit - operatingExpenses - damagedLoss;
            decimal netMarginPercent = netRevenue > 0 ? (netProfit / netRevenue) * 100 : 0;

            // ─── INVENTORY ASSET VALUE ───
            var allProducts = await _context.Products.ToListAsync();
            decimal inventoryAssetValue = allProducts.Sum(p => p.StockQuantity * (p.OriginalPrice ?? (p.Price * 0.65m)));

            // ─── GROWTH RATE ───
            decimal growthRate = 0;
            if (previousRevenue > 0)
            {
                growthRate = ((grossRevenue - previousRevenue) / previousRevenue) * 100;
            }

            // ─── TIMELINE AGGREGATION ───
            var timeline = validOrders
                .GroupBy(o => o.CreatedAt.ToString("yyyy-MM-dd"))
                .OrderBy(g => g.Key)
                .Select(g => new RevenueTimelinePointDto
                {
                    Label = g.Key,
                    Revenue = g.Sum(o => o.FinalAmount),
                    OrdersCount = g.Count(),
                    Profit = g.Sum(o => o.FinalAmount) * 0.35m
                })
                .ToList();

            var report = new CompleteAnalyticsReportDto
            {
                Financials = new FinancialSummaryDto
                {
                    GrossRevenue = grossRevenue,
                    NetRevenue = netRevenue,
                    COGS = totalCogs,
                    GrossProfit = grossProfit,
                    GrossMarginPercent = Math.Round(grossMarginPercent, 2),
                    OperatingExpense = operatingExpenses,
                    TotalLoss = damagedLoss,
                    NetProfit = netProfit,
                    NetMarginPercent = Math.Round(netMarginPercent, 2),
                    InventoryAssetValue = inventoryAssetValue,
                    GrowthratePercent = Math.Round(growthRate, 2)
                },
                Sales = new SalesMetricsDto
                {
                    TotalOrders = validOrders.Count,
                    CompleteOrders = validOrders.Count(o => o.Status == OrderStatus.Delivered),
                    PendingOrders = validOrders.Count(o => o.Status == OrderStatus.Pending || o.Status == OrderStatus.Confirmed),
                    CancelledOrders = await _context.Orders.CountAsync(o => o.CreatedAt >= startDate && o.Status == OrderStatus.Cancelled),
                    TotalUnitsSold = totalUnitsSold,
                    AverageOrderValue = validOrders.Count > 0 ? Math.Round(grossRevenue / validOrders.Count, 2) : 0
                },
                ReturnsAndLoss = new ReturnLossMetricsDto
                {
                    TotalReturnRequest = await _context.ReturnRequests.CountAsync(r => r.CreatedAt >= startDate),
                    ApprovedOrders = refunds.Count,
                    TotalRefundAmount = totalRefunded,
                    DamagedUnits = damagedUnits,
                    DamagedInventoryLoss = damagedLoss
                },
                Timeline = timeline,
                CategoryBreakdown = categoryStats.Values.ToList()
            };

            return new ApiResponse<CompleteAnalyticsReportDto> { Success = true, Data = report };
        }

        public async Task<ApiResponse<bool>> AddExpenseAsync(string title, decimal amount, string category, string? description, DateTime date)
        {
            if (string.IsNullOrWhiteSpace(title) || amount <= 0)
            {
                return new ApiResponse<bool> { Success = false, Message = "Invalid expense parameters." };
            }

            Enum.TryParse<ExpenseCategory>(category, true, out var parsedCategory);

            var exp = new Expense
            {
                Title = title,
                Amount = amount,
                Category = parsedCategory,
                Description = description,
                ExpenseDate = date
            };

            _context.Expenses.Add(exp);
            await _context.SaveChangesAsync();

            return new ApiResponse<bool> { Success = true, Message = "Expense logged successfully.", Data = true };
        }
    }
}
