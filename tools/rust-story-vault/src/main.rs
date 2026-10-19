use serde::{Deserialize, Serialize};
use std::{
    env, fs,
    io::{self, Write},
    path::PathBuf,
    process,
    time::{SystemTime, UNIX_EPOCH},
};

const STORIES: &str =
    "/storage/emulated/0/vide coding project/for you/stories/stories.json";
const PROJECT: &str =
    "/storage/emulated/0/vide coding project/for you";

#[derive(Debug, Clone, Serialize, Deserialize)]
struct Story {
    title: String,
    body: String,
}

fn load(path: &PathBuf) -> Result<Vec<Story>, String> {
    let raw = fs::read_to_string(path)
        .map_err(|e| format!("Cannot read {}: {e}", path.display()))?;
    serde_json::from_str(&raw).map_err(|e| format!("Invalid JSON: {e}"))
}

fn prompt(label: &str) -> Result<String, String> {
    print!("{label}");
    io::stdout().flush().map_err(|e| e.to_string())?;
    let mut value = String::new();
    io::stdin().read_line(&mut value).map_err(|e| e.to_string())?;
    Ok(value.trim_end().to_string())
}

fn timestamp() -> Result<u128, String> {
    Ok(SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map_err(|e| e.to_string())?
        .as_millis())
}

fn backup(path: &PathBuf, label: &str) -> Result<PathBuf, String> {
    let dir = PathBuf::from(PROJECT).join("backups");
    fs::create_dir_all(&dir)
        .map_err(|e| format!("Could not create backup directory: {e}"))?;
    let destination = dir.join(format!("stories-{label}-{}.json", timestamp()?));
    fs::copy(path, &destination)
        .map_err(|e| format!("Backup failed; original was not changed: {e}"))?;
    Ok(destination)
}

fn save_atomically(path: &PathBuf, stories: &[Story]) -> Result<(), String> {
    let json = serde_json::to_string_pretty(stories)
        .map_err(|e| format!("Could not serialize stories: {e}"))? + "\n";
    let temp = path.with_extension("json.tmp");
    fs::write(&temp, json)
        .map_err(|e| format!("Could not write temporary file: {e}"))?;
    let check = load(&temp)?;
    if check.len() != stories.len() {
        let _ = fs::remove_file(&temp);
        return Err("Verification failed; original file was not replaced.".into());
    }
    fs::rename(&temp, path)
        .map_err(|e| format!("Could not replace stories file: {e}"))?;
    Ok(())
}

fn add_story(path: &PathBuf) -> Result<(), String> {
    let mut stories = load(path)?;
    println!("New story (type CANCEL as the title to abort).");
    let title = prompt("Title: ")?.trim().to_string();

    if title.is_empty() || title.eq_ignore_ascii_case("CANCEL") {
        println!("Cancelled. No changes made.");
        return Ok(());
    }
    if stories.iter().any(|s| s.title.trim().eq_ignore_ascii_case(&title)) {
        return Err("A story with that title already exists.".into());
    }

    println!("Enter the story below. Type END alone on a line to finish.");
    let mut lines = Vec::new();
    loop {
        let line = prompt("")?;
        if line == "END" {
            break;
        }
        lines.push(line);
    }

    let body = lines.join("\n").trim().to_string();
    if body.is_empty() {
        return Err("Story body cannot be empty.".into());
    }

    println!("\nPreview\nTitle: {title}\n{body}");
    if prompt("\nSave this story? Type YES to confirm: ")? != "YES" {
        println!("Cancelled. No changes made.");
        return Ok(());
    }

    let saved_backup = backup(path, "before-add")?;
    stories.push(Story { title, body });
    save_atomically(path, &stories)?;
    println!("Story added. Total stories: {}", stories.len());
    println!("Backup: {}", saved_backup.display());
    Ok(())
}

fn delete_story(path: &PathBuf) -> Result<(), String> {
    let mut stories = load(path)?;
    let title = prompt("Enter the EXACT title to delete: ")?.trim().to_string();
    let matches: Vec<usize> = stories.iter().enumerate()
        .filter(|(_, story)| story.title == title)
        .map(|(index, _)| index)
        .collect();

    if matches.len() != 1 {
        return Err(if matches.is_empty() {
            "No exact title match. Nothing was deleted.".into()
        } else {
            "Multiple exact matches found. Nothing was deleted.".into()
        });
    }

    let index = matches[0];
    println!("\nSelected story:\n{}\n{}", stories[index].title, stories[index].body);
    let expected = format!("DELETE {}", stories[index].title);
    println!("\nTo confirm, type this exactly:\n{expected}");
    if prompt("> ")? != expected {
        println!("Cancelled. No changes made.");
        return Ok(());
    }

    let saved_backup = backup(path, "before-delete")?;
    stories.remove(index);
    save_atomically(path, &stories)?;
    println!("Story deleted. Remaining stories: {}", stories.len());
    println!("Backup: {}", saved_backup.display());
    Ok(())
}

fn show_story(path: &PathBuf, number: &str) -> Result<(), String> {
    let stories = load(path)?;
    let index: usize = number.parse()
        .map_err(|_| "Usage: rv show <story-number>".to_string())?;
    if index == 0 || index > stories.len() {
        return Err(format!("Story number must be between 1 and {}.", stories.len()));
    }
    let story = &stories[index - 1];
    println!("{}. {}\n\n{}", index, story.title, story.body);
    Ok(())
}

fn export_stories(path: &PathBuf, destination: &str) -> Result<(), String> {
    let stories = load(path)?;
    let output = PathBuf::from(destination);
    if output.exists() {
        return Err(format!("File already exists: {}. Choose another path to avoid overwriting it.", output.display()));
    }
    let json = serde_json::to_string_pretty(&stories)
        .map_err(|e| format!("Could not serialize stories: {e}"))? + "\n";
    fs::write(&output, json)
        .map_err(|e| format!("Export failed: {e}"))?;
    println!("Exported {} stories to {}", stories.len(), output.display());
    Ok(())
}

fn help() {
    println!("Rust Story Vault");
    println!("  rv list");
    println!("  rv validate");
    println!("  rv search <query>");
    println!("  rv show <number>");
    println!("  rv export <output.json>");
    println!("  rv add");
    println!("  rv delete");
}

fn main() {
    let args: Vec<String> = env::args().skip(1).collect();
    let command = args.first().map(String::as_str).unwrap_or("help");
    let path = PathBuf::from(STORIES);

    let result: Result<(), String> = match command {
        "help" | "--help" => {
            help();
            Ok(())
        }
        "add" => add_story(&path),
        "delete" => delete_story(&path),
        "show" => match args.get(1) {
            Some(number) => show_story(&path, number),
            None => Err("Usage: rv show <story-number>".into()),
        },
        "export" => match args.get(1) {
            Some(destination) => export_stories(&path, destination),
            None => Err("Usage: rv export <output.json>".into()),
        },
        "list" | "validate" | "search" => {
            let stories = match load(&path) {
                Ok(s) => s,
                Err(e) => {
                    eprintln!("{e}");
                    process::exit(1);
                }
            };
            match command {
                "list" => {
                    println!("Stories: {}", stories.len());
                    for (i, story) in stories.iter().enumerate() {
                        println!("{:>3}. {}", i + 1, story.title);
                    }
                    Ok(())
                }
                "validate" => {
                    let errors: Vec<String> = stories.iter().enumerate()
                        .filter_map(|(i, s)| {
                            if s.title.trim().is_empty() {
                                Some(format!("Story {} has an empty title", i + 1))
                            } else if s.body.trim().is_empty() {
                                Some(format!("Story {} has an empty body", i + 1))
                            } else {
                                None
                            }
                        }).collect();
                    if errors.is_empty() {
                        println!("Validation passed.\nStories checked: {}", stories.len());
                        Ok(())
                    } else {
                        Err(errors.join("\n"))
                    }
                }
                "search" => {
                    let query = args.get(1).map(String::as_str).unwrap_or("");
                    if query.trim().is_empty() {
                        Err("Usage: rv search <query>".into())
                    } else {
                        let query = query.to_lowercase();
                        let mut found = 0;
                        for (i, story) in stories.iter().enumerate() {
                            if story.title.to_lowercase().contains(&query)
                                || story.body.to_lowercase().contains(&query) {
                                println!("{:>3}. {}", i + 1, story.title);
                                found += 1;
                            }
                        }
                        println!("Matches: {found}");
                        Ok(())
                    }
                }
                _ => unreachable!(),
            }
        }
        _ => Err(format!("Unknown command: {command}")),
    };

    if let Err(e) = result {
        eprintln!("Error: {e}");
        process::exit(1);
    }
}
