namespace ecommerce_backend.Dtos
{
    public class FinancialSummaryDto
    {
        public decimal GrossRevenue { get; set; }
        public decimal NetRevenue { get; set; }
        public decimal COGS { get; set; }
        public decimal GrossProfit { get; set; }
        public decimal GrossMarginPercent { get; set; }
        public decimal OperatingExpense { get; set; }
        public decimal TotalLoss { get; set; }
        public decimal NetProfit { get; set; }
        public decimal NetMarginPercent { get; set; }
        public decimal InventoryAssetValue { get; set; }
        public decimal GrowthratePercent { get; set; }
    }

    public class SalesMetricsDto
    {
        public int TotalOrders { get; set; }
        public int CompleteOrders { get; set; }
        public int PendingOrders { get; set; }
        public int CancelledOrders { get; set; }
        public decimal AverageOrderValue { get; set; }
        public int TotalUnitsSold { get; set; }
    }

    public class ReturnLossMetricsDto
    {
        public int TotalReturnRequest { get; set; }
        public int ApprovedOrders { get; set; }
        public int DamagedUnits { get; set; }
        public decimal TotalRefundAmount { get; set; }
        public decimal DamagedInventoryLoss { get; set; }
    }

    public class RevenueTimelinePointDto
    {
        public string Label { get; set; } = string.Empty;
        public decimal Revenue { get; set; }
        public decimal Profit { get; set; }
        public decimal Expense { get; set; }
        public int OrdersCount { get; set; }
    }

    public class CategoryFinancialBreakdownDto
    {
        public string CategoryName { get; set; } = string.Empty;
        public decimal Revenue { get; set; }
        public decimal Cost { get; set; }
        public decimal Profit { get; set; }
        public int UnitsSold { get; set; }
    }

    public class CompleteAnalyticsReportDto
    {
        public FinancialSummaryDto Financials { get; set; } = new();
        public SalesMetricsDto Sales { get; set; } = new();
        public ReturnLossMetricsDto ReturnsAndLoss { get; set; } = new();
        public List<RevenueTimelinePointDto> Timeline { get; set; } = new();
        public List<CategoryFinancialBreakdownDto> CategoryBreakdown { get; set; } = new();
    }
}
