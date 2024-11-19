namespace ATMBank.Models.DTOs
{
    public class CreateAccountRequest
    {
        public int Type { get; set; }
        public decimal Balance { get; set; }
    }
}
