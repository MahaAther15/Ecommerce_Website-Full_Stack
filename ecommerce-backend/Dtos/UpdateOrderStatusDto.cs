using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;
using ecommerce_backend.Models;

namespace ecommerce_backend.Dtos.Order
{
    public class UpdateOrderStatusDto
    {
        [Required]
        [JsonConverter(typeof(JsonStringEnumConverter))]
        public OrderStatus Status { get; set; }
    }
}
