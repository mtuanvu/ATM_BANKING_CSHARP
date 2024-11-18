using System.ComponentModel.DataAnnotations;

namespace ATMBank.Models {
    public class Transaction {
        [Key]
        public int TransactionId { get; set; }
        public int UserId { get; set; }
        public int AccountId { get; set; } // Thêm để xác định tài khoản liên quan
        public decimal Amount { get; set; }
        public DateTime Timestamp { get; set; } = DateTime.Now;
        public string? Status { get; set; } // Pending, Success, Failed
        public string TransactionType { get; set; } // deposit, withdraw
        public string? Description { get; set; }
    }
}
