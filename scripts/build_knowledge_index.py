import json
import os
import glob

CHUNKS_DIR = './assets/knowledge/chunks'
OUTPUT_FILE = './assets/knowledge/index.json'

def load_chunks():
    chunks = []
    # Find all .json files in all subdirectories of CHUNKS_DIR
    search_pattern = os.path.join(CHUNKS_DIR, '**', '*.json')
    for filepath in glob.glob(search_pattern, recursive=True):
        with open(filepath, 'r', encoding='utf-8') as f:
            try:
                chunk_data = json.load(f)
                
                # Validation
                required_keys = ['id', 'category', 'keywords', 'title', 'content', 'version']
                missing_keys = [k for k in required_keys if k not in chunk_data]
                if missing_keys:
                    print(f"Warning: Chunk {filepath} is missing required keys: {missing_keys}")
                    continue
                    
                chunks.append(chunk_data)
            except json.JSONDecodeError as e:
                print(f"Error parsing {filepath}: {e}")
                
    return chunks

def main():
    print(f"Scanning for knowledge chunks in {CHUNKS_DIR}...")
    chunks = load_chunks()
    
    # We use a structured JSON index. No embeddings yet (Phase 2 V1).
    index_data = {
        "version": 1,
        "generatedAt": "2026-08-29",
        "chunks": chunks
    }
    
    print(f"Writing {OUTPUT_FILE}...")
    os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)
    
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        # Compact JSON to save space when bundling
        json.dump(index_data, f, indent=None, separators=(',', ':'))
    
    size_kb = os.path.getsize(OUTPUT_FILE) / 1024
    print(f"Done. Index size: {size_kb:.1f} KB, Total Chunks: {len(chunks)}")

if __name__ == '__main__':
    main()
