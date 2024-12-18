using System.ComponentModel.DataAnnotations;

namespace ATMBank.Models {
   public class User {
    [Key]
    public int UserId { get; set; }

    [Required]
    public string Name { get; set; }

    [Required]
    [EmailAddress]
    public string Email { get; set; }

    [Required]
    public string Password { get; set; }

     public ICollection<Account> Accounts { get; set; }

    public List<Transaction> Transactions { get; set; } = new List<Transaction>();
}

}
