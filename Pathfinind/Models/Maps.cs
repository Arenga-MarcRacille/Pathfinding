using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Pathfinding.Models
{
    public class Maps
    {
        public int Id { get; set; }

        [Required(ErrorMessage = "Name is required.")]
        public required string Name { get; set; }

        public string? Description { get; set; }

        // This is stored in DB
        public string? ImagePath { get; set; }

        // This is only used during upload (not stored in DB directly)
        [NotMapped]
        public IFormFile? Image { get; set; }
    }
}
