using ATMBank.Data;
using ATMBank.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ATMBank.Models.DTOs;
using Microsoft.EntityFrameworkCore;

namespace ATMBank.Controllers
{
    [ApiController]
    [Route("api/transactions")]
    [Authorize]
    public class TransactionController : ControllerBase
    {
        private readonly ATMContext _context;

        public TransactionController(ATMContext context)
        {
            _context = context;
        }

        // API thêm giao dịch vào database
        [HttpPost("enqueue")]
        public async Task<IActionResult> EnqueueTransaction([FromBody] Transaction transaction)
        {
            // Lấy UserId từ JWT Token
            transaction.UserId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? "0");

            // Kiểm tra tài khoản có tồn tại không
            var account = await _context.Accounts.FirstOrDefaultAsync(a => a.AccountId == transaction.AccountId && a.UserId == transaction.UserId);
            if (account == null)
            {
                transaction.Status = "Failed"; // Trạng thái thất bại nếu tài khoản không tồn tại
                return BadRequest(new { error = "Tài khoản không tồn tại hoặc không thuộc về người dùng." });
            }

            // Kiểm tra số dư nếu giao dịch là rút tiền
            if (transaction.TransactionType == "withdraw" && account.Balance < transaction.Amount)
            {
                transaction.Status = "Failed";
                return BadRequest(new { error = "Số dư không đủ để thực hiện giao dịch." });
            }

            // Cập nhật số dư tài khoản
            if (transaction.TransactionType == "deposit")
            {
                account.Balance += transaction.Amount;
            }
            else if (transaction.TransactionType == "withdraw")
            {
                account.Balance -= transaction.Amount;
            }

            // Lưu thông tin giao dịch vào cơ sở dữ liệu
            transaction.Timestamp = DateTime.Now;
            transaction.Status = "Success";
            transaction.Description ??= "Giao dịch hoàn tất thành công";

            _context.Transactions.Add(transaction);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Giao dịch được thêm thành công." });
        }


[HttpPost("transfer")]
public async Task<IActionResult> Transfer([FromBody] TransferRequestDto transferRequest)
{
    // Lấy UserId từ JWT token
    var userId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? "0");

    // Lấy thông tin tài khoản nguồn
    var sourceAccount = await _context.Accounts
        .Include(a => a.User)
        .FirstOrDefaultAsync(a => a.AccountId == transferRequest.AccountId && a.UserId == userId);
    if (sourceAccount == null)
    {
        return BadRequest(new { error = "Tài khoản nguồn không tồn tại hoặc không thuộc về người dùng." });
    }

    // Lấy tên người gửi
    transferRequest.SenderName = sourceAccount.User.Name;

    // Lấy thông tin tài khoản đích
    var destinationAccount = await _context.Accounts
        .Include(a => a.User)
        .FirstOrDefaultAsync(a => a.AccountId == transferRequest.DestinationAccountId);
    if (destinationAccount == null)
    {
        return BadRequest(new { error = "Tài khoản đích không tồn tại." });
    }

    // Lấy tên người nhận
    transferRequest.ReceiverName = destinationAccount.User.Name;

    // Kiểm tra số dư tài khoản nguồn
    if (sourceAccount.Balance < transferRequest.Amount)
    {
        return BadRequest(new { error = "Số dư tài khoản nguồn không đủ để thực hiện giao dịch." });
    }

    // Cập nhật số dư
    sourceAccount.Balance -= transferRequest.Amount;
    destinationAccount.Balance += transferRequest.Amount;

    // Tạo giao dịch cho tài khoản nguồn
    var sourceTransaction = new Transaction
    {
        AccountId = transferRequest.AccountId,
        Amount = transferRequest.Amount,
        TransactionType = "Transfer",
        Status = "Success",
        Timestamp = DateTime.Now,
        Description = transferRequest.Description ?? $"Chuyển tiền tới tài khoản {transferRequest.DestinationAccountId} ({transferRequest.ReceiverName})",
        UserId = userId
    };

    // Tạo giao dịch cho tài khoản đích
    var destinationTransaction = new Transaction
    {
        AccountId = transferRequest.DestinationAccountId,
        Amount = transferRequest.Amount,
        TransactionType = "Transfer",
        Status = "Success",
        Timestamp = DateTime.Now,
        Description = transferRequest.Description ?? $"Nhận tiền từ tài khoản {transferRequest.AccountId} ({transferRequest.SenderName})",
        UserId = destinationAccount.UserId
    };

    _context.Transactions.Add(sourceTransaction);
    _context.Transactions.Add(destinationTransaction);
    await _context.SaveChangesAsync();

    return Ok(new { message = "Chuyển tiền thành công." });
}



        [HttpGet]
        public async Task<IActionResult> GetAllTransactions()
        {
            var userId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? "0");
            var transactions = await _context.Transactions.Where(t => t.UserId == userId).ToListAsync();
            return Ok(transactions);
        }
    }
}
