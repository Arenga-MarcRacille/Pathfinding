using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.EntityFrameworkCore;
using Pathfinding.Data;
using Pathfinding.Models;

namespace Pathfinding.Controllers
{
    public class MapDatasController : Controller
    {
        private readonly PathfindingContext _context;

        public MapDatasController(PathfindingContext context)
        {
            _context = context;
        }

        // GET: MapDatas
        public async Task<IActionResult> Index()
        {
            return View(await _context.MapData.ToListAsync());
        }

        // GET: MapDatas/Details/5
        public async Task<IActionResult> Details(int? id)
        {
            if (id == null)
            {
                return NotFound();
            }



            var mapData = await _context.MapData
                .FirstOrDefaultAsync(m => m.MapsId == id);
            if (mapData == null)
            {
                return NotFound();
            }

            return Ok(mapData);
        }
        public async Task<IActionResult> MapDetails(int? id)
        {
            if (id == null)
            {
                return NotFound();
            }



            var mapData = await _context.MapData
                .FirstOrDefaultAsync(m => m.Id == id);
            if (mapData == null)
            {
                return NotFound();
            }

            return View(mapData);
        }

        // GET: MapDatas/Create
        public IActionResult Create()
        {
            return View();
        }

        // POST: MapDatas/Create
        // To protect from overposting attacks, enable the specific properties you want to bind to.
        // For more details, see http://go.microsoft.com/fwlink/?LinkId=317598.
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Create([Bind("Id,Nodes,Edges,MapId")] MapData mapData)
        {
            if (ModelState.IsValid)
            {
                _context.Add(mapData);
                await _context.SaveChangesAsync();
                return RedirectToAction(nameof(Index));
            }
            return View(mapData);
        }

        // GET: MapDatas/Edit/5
        public async Task<IActionResult> Edit(int? id)
        {
            if (id == null)
            {
                return NotFound();
            }

            var mapData = await _context.MapData.FindAsync(id);
            if (mapData == null)
            {
                return NotFound();
            }
            return View(mapData);
        }

        // POST: MapDatas/Edit/5
        // To protect from overposting attacks, enable the specific properties you want to bind to.
        // For more details, see http://go.microsoft.com/fwlink/?LinkId=317598.
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Edit(int id, [Bind("Id,Nodes,Edges,MapId")] MapData mapData)
        {
            if (id != mapData.Id)
            {
                return NotFound();
            }

            if (ModelState.IsValid)
            {
                try
                {
                    _context.Update(mapData);
                    await _context.SaveChangesAsync();
                }
                catch (DbUpdateConcurrencyException)
                {
                    if (!MapDataExists(mapData.Id))
                    {
                        return NotFound();
                    }
                    else
                    {
                        throw;
                    }
                }
                return RedirectToAction(nameof(Index));
            }
            return View(mapData);
        }

        // GET: MapDatas/Delete/5
        public async Task<IActionResult> Delete(int? id)
        {
            if (id == null)
            {
                return NotFound();
            }

            var mapData = await _context.MapData
                .FirstOrDefaultAsync(m => m.Id == id);
            if (mapData == null)
            {
                return NotFound();
            }

            return View(mapData);
        }

        // POST: MapDatas/Delete/5
        [HttpPost, ActionName("Delete")]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> DeleteConfirmed(int id)
        {
            var mapData = await _context.MapData.FindAsync(id);
            if (mapData != null)
            {
                _context.MapData.Remove(mapData);
            }

            await _context.SaveChangesAsync();
            return RedirectToAction(nameof(Index));
        }

        private bool MapDataExists(int id)
        {
            return _context.MapData.Any(e => e.Id == id);
        }
    }
}
