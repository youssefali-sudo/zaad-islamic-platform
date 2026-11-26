using System;
using System.IO;
using System.Text.Json;

record Backup(int Version, DateTime CreatedAt, JsonElement Data);

class ZaadBackup {
    static int Main(string[] args) {
        if (args.Length < 2) {
            Console.WriteLine("Usage: dotnet run -- <input.json> <output.json>");
            return 2;
        }
        try {
            using var doc = JsonDocument.Parse(File.ReadAllText(args[0]));
            var backup = new Backup(1, DateTime.UtcNow, doc.RootElement.Clone());
            File.WriteAllText(args[1], JsonSerializer.Serialize(backup, new JsonSerializerOptions { WriteIndented = true }));
            Console.WriteLine("Backup wrapped successfully.");
            return 0;
        } catch (Exception ex) {
            Console.Error.WriteLine($"Backup failed: {ex.Message}");
            return 1;
        }
    }
}
