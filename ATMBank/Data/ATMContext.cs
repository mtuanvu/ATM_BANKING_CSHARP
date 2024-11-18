using ATMBank.Models;
using Microsoft.EntityFrameworkCore;

namespace ATMBank.Data {
    public class ATMContext : DbContext {
        public ATMContext(DbContextOptions<ATMContext> options) : base(options) {}

        public DbSet<User> Users { get; set; }
        public DbSet<Account> Accounts { get; set; }
        public DbSet<Transaction> Transactions { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder) {
            modelBuilder.Entity<User>()
                .HasMany(u => u.Transactions)
                .WithOne()
                .HasForeignKey(t => t.UserId);

            modelBuilder.Entity<Account>()
                .HasOne<User>()
                .WithMany()
                .HasForeignKey(a => a.UserId);
        }
    }
}
