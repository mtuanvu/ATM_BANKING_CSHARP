using ATMBank.Data;
using ATMBank.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ATMBank.Controllers {
    [ApiController]
    [Route("api/transactions")]
    [Authorize]
    public class TransactionController : ControllerBase {
        private readonly ATMContext _context;

        public TransactionController(ATMContext context) {
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
                return BadRequest("Account not found or does not belong to the user.");
            }

            // Kiểm tra số dư nếu giao dịch là rút tiền
            if (transaction.TransactionType == "withdraw" && account.Balance < transaction.Amount)
            {
                return BadRequest("Insufficient funds for this transaction.");
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

            // Lưu giao dịch vào database
            transaction.Timestamp = DateTime.Now;
            transaction.Status = "Success";
            transaction.Description ??= "Transaction completed successfully";

            _context.Transactions.Add(transaction);
            await _context.SaveChangesAsync();

            return Ok("Transaction added successfully.");
        }

        // API lấy tất cả giao dịch của người dùng
        [HttpGet]
        public async Task<IActionResult> GetAllTransactions() {
            var userId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? "0");
            var transactions = await _context.Transactions.Where(t => t.UserId == userId).ToListAsync();
            return Ok(transactions);
        }
    }
}
