using ecommerce_backend.Dtos;
using ecommerce_backend.Models.common;
namespace ecommerce_backend.Services.Interfaces
{
    public interface IAnalyticsService
    {
        Task<ApiResponse<CompleteAnalyticsReportDto>> GetAnalyticsReportAsync(string timeRange);
        Task<ApiResponse<bool>> AddExpenseAsync(string title, decimal amount, string category, string? description, DateTime date);
    }
}