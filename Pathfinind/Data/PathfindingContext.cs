using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Pathfinding.Models;

namespace Pathfinding.Data
{
    public class PathfindingContext : DbContext
    {
        public PathfindingContext (DbContextOptions<PathfindingContext> options)
            : base(options)
        {
        }

        public DbSet<Pathfinding.Models.Maps> Maps { get; set; } = default!;
        public DbSet<Pathfinding.Models.MapData> MapData { get; set; } = default!;
    }
}
