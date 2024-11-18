namespace ATMBank.Models.DTOs
{
    public class UpdateBalanceRequest
    {
        public int AccountId { get; set; }
        public decimal Amount { get; set; }
    }
}
