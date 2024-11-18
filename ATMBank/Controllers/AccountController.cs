using ATMBank.Data;
using ATMBank.Models;
using ATMBank.Models.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ATMBank.Controllers
{
    [ApiController]
    [Route("api/accounts")]
    [Authorize] // Yêu cầu JWT token
    public class AccountController : ControllerBase
    {
        private readonly ATMContext _context;

        public AccountController(ATMContext context)
        {
            _context = context;
        }

        // API lấy thông tin tài khoản của người dùng hiện tại
        [HttpGet]
        public IActionResult GetUserAccounts()
        {
            // Lấy UserId từ JWT token
            var userId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? "0");

            // Lấy danh sách tài khoản thuộc về người dùng
            var accounts = _context.Accounts
                .Where(a => a.UserId == userId)
                .ToList();

            return Ok(accounts);
        }


        [HttpPost("check/account")]
        public async Task<IActionResult> CheckReceiver([FromBody] CheckReceiverRequest request)
        {
            Console.WriteLine($"Received request for AccountId: {request.AccountId}");
            var account = await _context.Accounts
                .Include(a => a.User)
                .FirstOrDefaultAsync(a => a.AccountId == request.AccountId);

            if (account == null)
            {
                Console.WriteLine("Account not found.");
                return NotFound(new { error = "Tài khoản người nhận không tồn tại." });
            }

            Console.WriteLine($"Account found: {account.User.Name}");
            return Ok(new
            {
                receiver_name = account.User.Name,
                account_id = account.AccountId
            });
        }



        // API lấy thông tin chi tiết của một tài khoản
        [HttpGet("{accountId}")]
        public IActionResult GetAccountById(int accountId)
        {
            // Lấy UserId từ JWT token
            var userId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? "0");

            // Tìm tài khoản và đảm bảo thuộc về người dùng
            var account = _context.Accounts
                .FirstOrDefault(a => a.AccountId == accountId && a.UserId == userId);

            if (account == null)
            {
                return NotFound("Account not found or access denied.");
            }

            return Ok(account);
        }

        // API tạo tài khoản mới
        [HttpPost]
        public IActionResult CreateAccount([FromBody] Account account)
        {
            // Lấy UserId từ JWT token
            var userId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? "0");

            // Gắn UserId cho tài khoản mới
            account.UserId = userId;
            account.Balance = 0; // Khởi tạo số dư mặc định là 0

            _context.Accounts.Add(account);
            _context.SaveChanges();

            return Ok("Account created successfully.");
        }

        // API cập nhật số dư tài khoản
        [HttpPost("update-balance")]
        public IActionResult UpdateAccountBalance([FromBody] UpdateBalanceRequest request)
        {
            var userId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? "0");

            // Tìm tài khoản và đảm bảo tài khoản thuộc về người dùng
            var account = _context.Accounts.FirstOrDefault(a => a.AccountId == request.AccountId && a.UserId == userId);

            if (account == null)
            {
                return NotFound(new { error = "Account not found or access denied." });
            }

            // Cập nhật số dư
            account.Balance += request.Amount;
            _context.SaveChanges();

            return Ok(new { message = "Account balance updated successfully." });
        }


        // API xóa tài khoản
        [HttpDelete("{accountId}")]
        public IActionResult DeleteAccount(int accountId)
        {
            // Lấy UserId từ JWT token
            var userId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? "0");

            // Tìm tài khoản và đảm bảo thuộc về người dùng
            var account = _context.Accounts
                .FirstOrDefault(a => a.AccountId == accountId && a.UserId == userId);

            if (account == null)
            {
                return NotFound("Account not found or access denied.");
            }

            // Xóa tài khoản
            _context.Accounts.Remove(account);
            _context.SaveChanges();

            return Ok("Account deleted successfully.");
        }
    }
}
