import java.nio.file.Files;
import java.nio.file.Path;
import java.util.regex.Pattern;

public class ContentAudit {
    public static void main(String[] args) throws Exception {
        Path file = Path.of(args.length == 0 ? "content/sample.json" : args[0]);
        String json = Files.readString(file);
        long sources = Pattern.compile("\\\"source\\\"\\s*:").matcher(json).results().count();
        long titles = Pattern.compile("\\\"title\\\"\\s*:").matcher(json).results().count();
        if (sources != titles) {
            System.err.println("Content audit failed: every title needs a source field.");
            System.exit(1);
        }
        System.out.println("Found " + titles + " source-labelled entries. Verify each reference manually.");
    }
}
