using System.Text.Json;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Pathfinding.Migrations
{
    /// <inheritdoc />
    public partial class FixMapData : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_MapData_Maps_MapsId",
                table: "MapData");

            migrationBuilder.DropIndex(
                name: "IX_MapData_MapsId",
                table: "MapData");

            migrationBuilder.AlterColumn<JsonDocument>(
                name: "Nodes",
                table: "MapData",
                type: "jsonb",
                nullable: true,
                oldClrType: typeof(JsonDocument),
                oldType: "jsonb");

            migrationBuilder.AlterColumn<JsonDocument>(
                name: "Edges",
                table: "MapData",
                type: "jsonb",
                nullable: true,
                oldClrType: typeof(JsonDocument),
                oldType: "jsonb");

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

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_MapData_Maps_MapId",
                table: "MapData");

            migrationBuilder.DropIndex(
                name: "IX_MapData_MapId",
                table: "MapData");

            migrationBuilder.AlterColumn<JsonDocument>(
                name: "Nodes",
                table: "MapData",
                type: "jsonb",
                nullable: false,
                oldClrType: typeof(JsonDocument),
                oldType: "jsonb",
                oldNullable: true);

            migrationBuilder.AlterColumn<JsonDocument>(
                name: "Edges",
                table: "MapData",
                type: "jsonb",
                nullable: false,
                oldClrType: typeof(JsonDocument),
                oldType: "jsonb",
                oldNullable: true);

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
    }
}
