using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Pathfinding.Data;
using Pathfinind.Models;
using System.Diagnostics;

namespace Pathfinind.Controllers
{
    public class HomeController : Controller
    {
        private readonly ILogger<HomeController> _logger;

        private readonly PathfindingContext _context;

        public HomeController(ILogger<HomeController> logger, PathfindingContext context)
        {
            _logger = logger;
            _context = context;

        }

        public IActionResult Index()
        {
            var maps = _context.Maps.ToList();
            return View(maps);
        }

        public IActionResult Privacy()
        {
            return View();
        }

        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }
    }
}
