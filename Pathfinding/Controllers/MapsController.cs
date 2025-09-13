using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.EntityFrameworkCore;
using Pathfinding.Data;
using Pathfinding.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;

namespace Pathfinding.Controllers
{
    public class MapsController : Controller
    {
        private readonly PathfindingContext _context;

        public MapsController(PathfindingContext context)
        {
            _context = context;
        }

        // GET: Maps
        public async Task<IActionResult> Index()
        {
            return View(await _context.Maps.ToListAsync());
        }

        // GET: Maps/Details/5
        public async Task<IActionResult> Details(int? id)
        {
            if (id == null)
            {
                return NotFound();
            }

            var maps = await _context.Maps
                .FirstOrDefaultAsync(m => m.Id == id);
            if (maps == null)
            {
                return NotFound();
            }

            return View(maps);
        }

        // GET: Maps/Create
        public IActionResult Create()
        {
            return View();
        }

        // POST: Maps/Create
        // To protect from overposting attacks, enable the specific properties you want to bind to.
        // For more details, see http://go.microsoft.com/fwlink/?LinkId=317598.
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Create(Maps maps)
        {
            if (ModelState.IsValid)
            {
                // Check if Name already exists
                bool nameExists = await _context.Maps.AnyAsync(m => m.Name == maps.Name);
                if (nameExists)
                {
                    ModelState.AddModelError("Name", "This map name already exists. Please choose another.");
                    return View(maps);
                }

                if (maps.Image == null)
                {
                    ModelState.AddModelError("Image", "Please upload a map image.");
                    return View(maps);
                }

                // Handle image upload
                if (maps.Image != null)
                {
                    var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif" };
                    var extension = Path.GetExtension(maps.Image.FileName).ToLower();

                    if (!allowedExtensions.Contains(extension))
                    {
                        ModelState.AddModelError("Image", "Only .jpg, .jpeg, .png, .gif files are allowed.");
                        return View(maps);
                    }

                    var uploadPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "resources", "maps");
                    Directory.CreateDirectory(uploadPath);

                    var fileName = Path.GetFileNameWithoutExtension(maps.Image.FileName);
                    fileName = string.Concat(fileName.Split(Path.GetInvalidFileNameChars()));
                    var uniqueFileName = $"{fileName}{extension}";
                    var filePath = Path.Combine(uploadPath, uniqueFileName);

                    if (System.IO.File.Exists(filePath))
                    {
                        uniqueFileName = $"{fileName}_{Guid.NewGuid()}{extension}";
                        filePath = Path.Combine(uploadPath, uniqueFileName);
                    }

                    using (var stream = new FileStream(filePath, FileMode.Create))
                    {
                        await maps.Image.CopyToAsync(stream);
                    }

                    maps.ImagePath = "/resources/maps/" + uniqueFileName;
                }

                // Save the map first
                _context.Add(maps);
                await _context.SaveChangesAsync();

                // ✅ Create a corresponding MapData row with empty nodes/edges
                var mapData = new MapData
                {
                    MapsId = maps.Id,
                    Nodes = JsonDocument.Parse("[]"), // empty nodes
                    Edges = JsonDocument.Parse("[]")  // empty edges
                };
                _context.MapData.Add(mapData);
                await _context.SaveChangesAsync();

                return RedirectToAction(nameof(Index));
            }

            return View(maps);
        }





        // GET: Maps/Edit/5
        public async Task<IActionResult> Edit(int? id)
        {
            if (id == null)
            {
                return NotFound();
            }

            var maps = await _context.Maps.FindAsync(id);
            if (maps == null)
            {
                return NotFound();
            }
            return View(maps);
        }

        // POST: Maps/Edit/5
        // To protect from overposting attacks, enable the specific properties you want to bind to.
        // For more details, see http://go.microsoft.com/fwlink/?LinkId=317598.
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Edit(int id, Maps maps, string NodesJson, string EdgesJson)
        {
            if (id != maps.Id) return NotFound();

            if (ModelState.IsValid)
            {
                // Check if Name exists
                bool nameExists = await _context.Maps.AnyAsync(m => m.Name == maps.Name && m.Id != maps.Id);
                if (nameExists)
                {
                    ModelState.AddModelError("Name", "This map name already exists. Please choose another.");
                    return View(maps);
                }

                // Load existing map from DB
                var existingMap = await _context.Maps.FindAsync(id);
                if (existingMap == null) return NotFound();

                // Update fields
                existingMap.Name = maps.Name;
                existingMap.Description = maps.Description;

                // Handle image upload
                if (maps.Image != null)
                {
                    var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif" };
                    var extension = Path.GetExtension(maps.Image.FileName).ToLower();
                    if (!allowedExtensions.Contains(extension))
                    {
                        ModelState.AddModelError("Image", "Only .jpg, .jpeg, .png, .gif files are allowed.");
                        return View(maps);
                    }

                    var uploadPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "resources", "maps");
                    Directory.CreateDirectory(uploadPath);

                    var fileName = Path.GetFileNameWithoutExtension(maps.Image.FileName);
                    fileName = string.Concat(fileName.Split(Path.GetInvalidFileNameChars()));
                    var uniqueFileName = $"{fileName}{extension}";
                    var filePath = Path.Combine(uploadPath, uniqueFileName);
                    if (System.IO.File.Exists(filePath))
                    {
                        uniqueFileName = $"{fileName}_{Guid.NewGuid()}{extension}";
                        filePath = Path.Combine(uploadPath, uniqueFileName);
                    }

                    using (var stream = new FileStream(filePath, FileMode.Create))
                    {
                        await maps.Image.CopyToAsync(stream);
                    }

                    existingMap.ImagePath = "/resources/maps/" + uniqueFileName;
                }

                // Save map changes
                _context.Update(existingMap);
                await _context.SaveChangesAsync();

                // Update MapData
                var mapData = await _context.MapData.FirstOrDefaultAsync(md => md.MapsId == id);
                if (mapData != null)
                {
                    mapData.Nodes = JsonDocument.Parse(NodesJson);
                    mapData.Edges = JsonDocument.Parse(EdgesJson);
                    _context.Update(mapData);
                    await _context.SaveChangesAsync();
                }

                return RedirectToAction(nameof(Index));
            }

            return View(maps);
        }



        // GET: Maps/Delete/5
        public async Task<IActionResult> Delete(int? id)
        {
            if (id == null)
            {
                return NotFound();
            }

            var maps = await _context.Maps
                .FirstOrDefaultAsync(m => m.Id == id);
            if (maps == null)
            {
                return NotFound();
            }

            return View(maps);
        }

        // POST: Maps/Delete/5
        [HttpPost, ActionName("Delete")]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> DeleteConfirmed(int id)
        {
            var maps = await _context.Maps.FindAsync(id);
            if (maps != null)
            {
                _context.Maps.Remove(maps);
            }

            await _context.SaveChangesAsync();
            return RedirectToAction(nameof(Index));
        }

        private bool MapsExists(int id)
        {
            return _context.Maps.Any(e => e.Id == id);
        }
    }
}
