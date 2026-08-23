using ecommerce_backend.Models;

namespace ecommerce_backend.Repositories.Interfaces
{
    public interface IAnalyticrepository
    {
        Task<List<Order>> GetOrdersAsync(DateTime startDate, DateTime? endDate = null);
        Task<List<Order>> GetPreviousPeriodOrdersAsync(DateTime prevStartDate, DateTime prevEndDate);
        Task<List<ReturnRequest>> GetApprovedRefundsAsync(DateTime startDate, DateTime? endDate = null);
        Task<List<InventoryLog>> GetDamagedInventoryLogsAsync(DateTime startDate, DateTime? endDate = null);
        Task<List<Expense>> GetExpensesAsync(DateTime startDate, DateTime? endDate = null);
        Task<List<Product>> GetAllProductsAsync();
        Task<int> GetCancelledOrdersCountAsync(DateTime startDate);
        Task<int> GetTotalReturnRequestsCountAsync(DateTime startDate);
        Task<bool> AddExpenseAsync(Expense expense);
    }
}
