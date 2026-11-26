use serde::Deserialize;
use std::{env, fs};

#[derive(Deserialize)]
struct Entry { title: String, source: String, text: String }

fn main() {
    let path = env::args().nth(1).unwrap_or_else(|| "content/sample.json".into());
    let raw = fs::read_to_string(&path).expect("cannot read content file");
    let entries: Vec<Entry> = serde_json::from_str(&raw).expect("invalid JSON schema");
    let mut errors = 0;
    for (i, item) in entries.iter().enumerate() {
        for (field, value) in [("title", &item.title), ("source", &item.source), ("text", &item.text)] {
            if value.trim().is_empty() { eprintln!("entry {}: missing {}", i + 1, field); errors += 1; }
        }
    }
    if errors > 0 { std::process::exit(1); }
    println!("Validated {} content entries. Human source review is still required.", entries.len());
}
