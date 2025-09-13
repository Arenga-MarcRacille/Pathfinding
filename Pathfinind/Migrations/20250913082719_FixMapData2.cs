using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Pathfinding.Migrations
{
    /// <inheritdoc />
    public partial class FixMapData2 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_MapData_Maps_MapId",
                table: "MapData");

            migrationBuilder.DropIndex(
                name: "IX_MapData_MapId",
                table: "MapData");

            migrationBuilder.DropColumn(
                name: "MapId",
                table: "MapData");

            migrationBuilder.CreateIndex(
                name: "IX_MapData_MapsId",
                table: "MapData",
                column: "MapsId");

            migrationBuilder.AddForeignKey(
                name: "FK_MapData_Maps_MapsId",
                table: "MapData",
                column: "MapsId",
                principalTable: "Maps",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_MapData_Maps_MapsId",
                table: "MapData");

            migrationBuilder.DropIndex(
                name: "IX_MapData_MapsId",
                table: "MapData");

            migrationBuilder.AddColumn<int>(
                name: "MapId",
                table: "MapData",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_MapData_MapId",
                table: "MapData",
                column: "MapId");

            migrationBuilder.AddForeignKey(
                name: "FK_MapData_Maps_MapId",
                table: "MapData",
                column: "MapId",
                principalTable: "Maps",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
