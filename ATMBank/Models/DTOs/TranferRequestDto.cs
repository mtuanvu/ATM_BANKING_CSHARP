namespace ATMBank.Models.DTOs {
public class TransferRequestDto
{
    public int AccountId { get; set; } // ID tài khoản nguồn
    public int DestinationAccountId { get; set; } // ID tài khoản đích
    public decimal Amount { get; set; } // Số tiền chuyển
    public string SenderName { get; set; } // Tên người gửi
    public string ReceiverName { get; set; } // Tên người nhận
    public string Description { get; set; } // Mô tả giao dịch
}
}