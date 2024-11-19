using System.ComponentModel.DataAnnotations;

namespace ATMBank.Models {
    public class Transaction {
        [Key]
        public int TransactionId { get; set; }
        public int UserId { get; set; }
        public int AccountId { get; set; }
        public decimal Amount { get; set; }
        public DateTime Timestamp { get; set; } = DateTime.Now;
        public string? Status { get; set; }
        public string TransactionType { get; set; }
        public string? Description { get; set; }
    }
}
