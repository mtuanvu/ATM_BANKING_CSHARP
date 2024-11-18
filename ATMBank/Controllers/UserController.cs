using ATMBank.Data;
using ATMBank.Models;
using ATMBank.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ATMBank.Controllers {
    [ApiController]
    [Route("api/users")]
    public class UserController : ControllerBase {
        private readonly ATMContext _context;
        private readonly JwtService _jwtService;

        public UserController(ATMContext context, JwtService jwtService) {
            _context = context;
            _jwtService = jwtService;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register(UserRegisterDto registerDto) {
            if (await _context.Users.AnyAsync(u => u.Email == registerDto.Email)) {
                return BadRequest("Email is already in use.");
            }

            var user = new User {
                Name = registerDto.Name,
                Email = registerDto.Email,
                Password = BCrypt.Net.BCrypt.HashPassword(registerDto.Password)
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return Ok("User registered successfully.");
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(UserLoginDto loginDto) {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == loginDto.Email);
            if (user == null || !BCrypt.Net.BCrypt.Verify(loginDto.Password, user.Password)) {
                return Unauthorized("Invalid credentials.");
            }

            var token = _jwtService.GenerateToken(user.UserId, user.Email);
            return Ok(new { Token = token });
        }
    }
}
