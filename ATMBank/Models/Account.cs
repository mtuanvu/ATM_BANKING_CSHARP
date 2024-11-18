using System.ComponentModel.DataAnnotations;

namespace ATMBank.Models {
    public class Account {
        [Key]
        public int AccountId { get; set; }
        public int UserId { get; set; }
        public decimal Balance { get; set; }
    }
}
