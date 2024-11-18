using ATMBank.Models;
using System.Collections.Concurrent;

namespace ATMBank.Services {
    public class QueueService {
        private readonly ConcurrentQueue<Transaction> _queue = new ConcurrentQueue<Transaction>();

        public void Enqueue(Transaction transaction) {
            _queue.Enqueue(transaction);
        }

        public bool TryDequeue(out Transaction transaction) {
            return _queue.TryDequeue(out transaction);
        }

        public bool IsEmpty() {
            return _queue.IsEmpty;
        }
    }
}
