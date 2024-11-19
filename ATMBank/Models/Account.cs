using System.ComponentModel.DataAnnotations;

namespace ATMBank.Models {
    public class Account {
        [Key]
        public int AccountId { get; set; }
        public int UserId { get; set; }

        public User User { get; set; }

        public int Type { get; set; } 
        public decimal Balance { get; set; }
    }
}
