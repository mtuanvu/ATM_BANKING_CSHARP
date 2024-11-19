namespace ATMBank.Models.DTOs {
public class TransferRequestDto
{
    public int AccountId { get; set; }
    public int DestinationAccountId { get; set; }
    public decimal Amount { get; set; }
    public string SenderName { get; set; }
    public string ReceiverName { get; set; }
    public string Description { get; set; }
}
}