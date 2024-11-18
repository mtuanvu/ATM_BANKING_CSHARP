using ATMBank.Data;
using ATMBank.Models;
using ATMBank.Models.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ATMBank.Controllers {
    [ApiController]
    [Route("api/accounts")]
    [Authorize] // Yêu cầu JWT token
    public class AccountController : ControllerBase {
        private readonly ATMContext _context;

        public AccountController(ATMContext context) {
            _context = context;
        }

        // API lấy thông tin tài khoản của người dùng hiện tại
        [HttpGet]
        public IActionResult GetUserAccounts() {
            // Lấy UserId từ JWT token
            var userId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? "0");

            // Lấy danh sách tài khoản thuộc về người dùng
            var accounts = _context.Accounts
                .Where(a => a.UserId == userId)
                .ToList();

            return Ok(accounts);
        }

        // API lấy thông tin chi tiết của một tài khoản
        [HttpGet("{accountId}")]
        public IActionResult GetAccountById(int accountId) {
            // Lấy UserId từ JWT token
            var userId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? "0");

            // Tìm tài khoản và đảm bảo thuộc về người dùng
            var account = _context.Accounts
                .FirstOrDefault(a => a.AccountId == accountId && a.UserId == userId);

            if (account == null) {
                return NotFound("Account not found or access denied.");
            }

            return Ok(account);
        }

        // API tạo tài khoản mới
        [HttpPost]
        public IActionResult CreateAccount([FromBody] Account account) {
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
        [HttpPut("{accountId}/balance")]
        public IActionResult UpdateAccountBalance(int accountId, [FromBody] UpdateBalanceRequest request)
        {
            // Lấy UserId từ JWT token
            var userId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? "0");

            // Tìm tài khoản và đảm bảo tài khoản thuộc về người dùng
            var account = _context.Accounts.FirstOrDefault(a => a.AccountId == accountId && a.UserId == userId);

            if (account == null)
            {
                return NotFound("Account not found or access denied.");
            }

            // Cập nhật số dư
            account.Balance += request.Amount;
            _context.SaveChanges();

           return Ok(new { message = "Account balance updated successfully." });
        }

        // API xóa tài khoản
        [HttpDelete("{accountId}")]
        public IActionResult DeleteAccount(int accountId) {
            // Lấy UserId từ JWT token
            var userId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? "0");

            // Tìm tài khoản và đảm bảo thuộc về người dùng
            var account = _context.Accounts
                .FirstOrDefault(a => a.AccountId == accountId && a.UserId == userId);

            if (account == null) {
                return NotFound("Account not found or access denied.");
            }

            // Xóa tài khoản
            _context.Accounts.Remove(account);
            _context.SaveChanges();

            return Ok("Account deleted successfully.");
        }
    }
}
