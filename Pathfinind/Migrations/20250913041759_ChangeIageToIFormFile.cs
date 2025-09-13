using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Pathfinding.Migrations
{
    /// <inheritdoc />
    public partial class ChangeIageToIFormFile : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Image",
                table: "Maps");

            migrationBuilder.AlterColumn<string>(
                name: "Description",
                table: "Maps",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AddColumn<string>(
                name: "ImagePath",
                table: "Maps",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ImagePath",
                table: "Maps");

            migrationBuilder.AlterColumn<string>(
                name: "Description",
                table: "Maps",
                type: "text",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Image",
                table: "Maps",
                type: "text",
                nullable: false,
                defaultValue: "");
        }
    }
}
