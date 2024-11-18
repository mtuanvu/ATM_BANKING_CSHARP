using ATMBank.Data;
using ATMBank.Models;

namespace ATMBank.Services {
    public class TransactionProcessor {
        private readonly QueueService _queueService;
        private readonly ATMContext _context;

        public TransactionProcessor(QueueService queueService, ATMContext context) {
            _queueService = queueService;
            _context = context;
        }

        public async Task ProcessTransactionsAsync() {
            while (!_queueService.IsEmpty()) {
                if (_queueService.TryDequeue(out var transaction)) {
                    try {
                        var account = _context.Accounts.FirstOrDefault(a => a.UserId == transaction.UserId);
                        if (account == null) {
                            transaction.Status = "Failed";
                            transaction.Description = "Account not found";
                        } else if (transaction.Amount < 0 && account.Balance + transaction.Amount < 0) {
                            transaction.Status = "Failed";
                            transaction.Description = "Insufficient funds";
                        } else {
                            account.Balance += transaction.Amount;
                            transaction.Status = "Success";
                        }

                        _context.Transactions.Add(transaction);
                        await _context.SaveChangesAsync();
                    } catch (Exception ex) {
                        transaction.Status = "Failed";
                        transaction.Description = $"Error: {ex.Message}";
                        _queueService.Enqueue(transaction);
                    }
                }
            }
        }
    }
}
