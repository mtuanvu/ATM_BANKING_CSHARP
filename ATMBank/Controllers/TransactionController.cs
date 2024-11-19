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

        //Deposit and Withdraw
        [HttpPost("enqueue")]
        public async Task<IActionResult> EnqueueTransaction([FromBody] Transaction transaction)
        {
            transaction.UserId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? "0");

            var account = await _context.Accounts.FirstOrDefaultAsync(a => a.AccountId == transaction.AccountId && a.UserId == transaction.UserId);
            if (account == null)
            {
                transaction.Status = "Failed";
                return BadRequest(new { error = "Account does not exist or does not belong to the user." });
            }

            if (transaction.TransactionType == "Withdraw" && account.Balance < transaction.Amount)
            {
                transaction.Status = "Failed";
                return BadRequest(new { error = "Balance is not enough to make the transaction." });
            }

            if (transaction.TransactionType == "Deposit")
            {
                account.Balance += transaction.Amount;
            }
            else if (transaction.TransactionType == "Withdraw")
            {
                account.Balance -= transaction.Amount;
            }

            transaction.Timestamp = DateTime.Now;
            transaction.Status = "Success";
            transaction.Description ??= "Transaction completed successfully";

            _context.Transactions.Add(transaction);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Transaction added successfully." });
        }


        [HttpPost("transfer")]
        public async Task<IActionResult> Transfer([FromBody] TransferRequestDto transferRequest)
        {
            var userId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? "0");

            var sourceAccount = await _context.Accounts
                .Include(a => a.User)
                .FirstOrDefaultAsync(a => a.AccountId == transferRequest.AccountId && a.UserId == userId);
            if (sourceAccount == null)
            {
                return BadRequest(new { error = "The source account does not exist or does not belong to the user.." });
            }

            transferRequest.SenderName = sourceAccount.User.Name;

            var destinationAccount = await _context.Accounts
                .Include(a => a.User)
                .FirstOrDefaultAsync(a => a.AccountId == transferRequest.DestinationAccountId);
            if (destinationAccount == null)
            {
                return BadRequest(new { error = "Destination account does not exist." });
            }

            transferRequest.ReceiverName = destinationAccount.User.Name;

            if (sourceAccount.Balance < transferRequest.Amount)
            {
                return BadRequest(new { error = "Source account balance is insufficient to execute the transaction." });
            }

            sourceAccount.Balance -= transferRequest.Amount;
            destinationAccount.Balance += transferRequest.Amount;

            var sourceTransaction = new Transaction
            {
                AccountId = transferRequest.AccountId,
                Amount = transferRequest.Amount,
                TransactionType = "Transfer",
                Status = "Success",
                Timestamp = DateTime.Now,
                Description = transferRequest.Description ?? $"Transfer money to account {transferRequest.DestinationAccountId} ({transferRequest.ReceiverName})",
                UserId = userId
            };

            var destinationTransaction = new Transaction
            {
                AccountId = transferRequest.DestinationAccountId,
                Amount = transferRequest.Amount,
                TransactionType = "Transfer",
                Status = "Success",
                Timestamp = DateTime.Now,
                Description = transferRequest.Description ?? $"Receive money from account {transferRequest.AccountId} ({transferRequest.SenderName})",
                UserId = destinationAccount.UserId
            };

            _context.Transactions.Add(sourceTransaction);
            _context.Transactions.Add(destinationTransaction);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Transfer successful." });
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
