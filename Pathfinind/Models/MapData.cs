using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json;

namespace Pathfinding.Models
{
    public class MapData
    {
        public int Id { get; set; }

        public JsonDocument? Nodes { get; set; }
        public JsonDocument? Edges { get; set; }

        [Required]
        public int MapsId { get; set; }

        public Maps Maps { get; set; }
    }
}
