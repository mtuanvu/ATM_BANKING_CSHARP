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
    [Authorize]
    public class AccountController : ControllerBase
    {
        private readonly ATMContext _context;

        public AccountController(ATMContext context)
        {
            _context = context;
        }

        //Get My Account
        [HttpGet]
        public IActionResult GetUserAccounts()
        {
            var userId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? "0");

            var accounts = _context.Accounts
                .Where(a => a.UserId == userId)
                .ToList();

            return Ok(accounts);
        }


        //check account
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



        // Get Account
        [HttpGet("{accountId}")]
        public IActionResult GetAccountById(int accountId)
        {
            var userId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? "0");

            var account = _context.Accounts
                .FirstOrDefault(a => a.AccountId == accountId && a.UserId == userId);

            if (account == null)
            {
                return NotFound("Account not found or access denied.");
            }

            return Ok(account);
        }

        //Create account
        [HttpPost]
        public IActionResult CreateAccount([FromBody] Account account)
        {
            var userId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? "0");

            account.UserId = userId;
            account.Balance = 0;

            _context.Accounts.Add(account);
            _context.SaveChanges();

            return Ok("Account created successfully.");
        }


        // API xóa tài khoản
        [HttpDelete("{accountId}")]
        public IActionResult DeleteAccount(int accountId)
        {
            var userId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? "0");

            var account = _context.Accounts
                .FirstOrDefault(a => a.AccountId == accountId && a.UserId == userId);

            if (account == null)
            {
                return NotFound("Account not found or access denied.");
            }

            _context.Accounts.Remove(account);
            _context.SaveChanges();

            return Ok("Account deleted successfully.");
        }
    }
}
