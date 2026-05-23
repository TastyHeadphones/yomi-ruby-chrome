#!/usr/bin/env python3
"""Build the offline annotation dictionary from SudachiDict-Full raw lexicon data."""

from __future__ import annotations

import argparse
import csv
import io
import json
import re
import shutil
import subprocess
import sys
from pathlib import Path

DEFAULT_VERSION = "20260428"
CLOUDFRONT_BASE_URL = "https://d2ej7fkh96fzlu.cloudfront.net/sudachidict-raw"

def katakana_to_hiragana(text: str) -> str:
    return "".join(chr(ord(char) - 0x60) if "ァ" <= char <= "ヶ" else char for char in text)

def download_file(url: str, output_path: Path) -> None:
    print(f"Downloading {url} to {output_path}...")
    # First try urllib, fallback to curl if there are SSL or environment issues
    try:
        import urllib.request
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=60) as response, output_path.open("wb") as out_file:
            shutil.copyfileobj(response, out_file)
        return
    except Exception as e:
        print(f"urllib download failed: {e}. Falling back to curl...")
        
    # Fallback to curl command
    try:
        subprocess.run(
            ["curl", "-L", "-o", str(output_path), url],
            check=True,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL
        )
    except subprocess.CalledProcessError as e:
        raise RuntimeError(f"Failed to download {url} using curl: {e}")

def build_entries(version: str, keep_temp: bool) -> list[list[str]]:
    kanji_pat = re.compile(r'[一-龯々〆ヵヶ]')
    best_entries: dict[str, tuple[int, str]] = {}
    
    zip_filenames = ["small_lex.zip", "core_lex.zip", "notcore_lex.zip"]
    csv_filenames = ["small_lex.csv", "core_lex.csv", "notcore_lex.csv"]
    
    # We will look for zip files in the current directory first, otherwise download them
    temp_dir = None
    try:
        for zip_name, csv_name in zip(zip_filenames, csv_filenames):
            local_zip = Path(zip_name)
            if local_zip.exists():
                zip_path = local_zip
                print(f"Using existing local zip: {zip_path}")
            else:
                if temp_dir is None:
                    # Create temporary directory inside workspace
                    temp_dir = Path("temp_sudachi_download")
                    temp_dir.mkdir(exist_ok=True)
                zip_path = temp_dir / zip_name
                url = f"{CLOUDFRONT_BASE_URL}/{version}/{zip_name}"
                download_file(url, zip_path)
                
            print(f"Parsing {zip_path}...")
            with zipfile.ZipFile(zip_path) as z:
                with z.open(csv_name) as f:
                    reader = csv.reader(io.TextIOWrapper(f, 'utf-8'))
                    for row in reader:
                        if len(row) > 11:
                            surface = row[0].strip()
                            reading = row[11].strip()
                            cost_str = row[3].strip()
                            
                            if not surface or not reading or reading == '*':
                                continue
                            
                            if not kanji_pat.search(surface):
                                continue
                                
                            try:
                                cost = int(cost_str)
                            except ValueError:
                                cost = 0
                                
                            # Apply POS penalty to prefer common readings over proper nouns and person names
                            pos_penalty = 0
                            if len(row) > 8:
                                pos1 = row[5].strip()
                                pos2 = row[6].strip()
                                pos3 = row[7].strip()
                                pos4 = row[8].strip()
                                
                                # Skip symbols and auxiliary symbols entirely
                                if pos1 in ("記号", "補助記号"):
                                    continue
                                    
                                # Penalize verb and adjective stems of single character Kanji
                                if len(surface) == 1 and pos1 in ("動詞", "形容詞"):
                                    pos_penalty += 100000
                                    
                                # Penalize proper nouns, particularly person names
                                if pos3 == "人名" or pos4 in ("名", "姓") or "人名" in (pos1, pos2, pos3, pos4) or "名" in (pos1, pos2, pos3, pos4) or "姓" in (pos1, pos2, pos3, pos4):
                                    pos_penalty += 100000
                                elif pos2 == "固有名詞" or "固有名詞" in (pos1, pos2, pos3, pos4):
                                    pos_penalty += 10000
                            
                            # Penalize unestimated connection costs (cost == 0)
                            zero_cost_penalty = 15000 if cost == 0 else 0
                            
                            adjusted_cost = cost + pos_penalty + zero_cost_penalty

                            # Keep the reading with the lowest adjusted cost for each unique surface
                            if surface in best_entries:
                                old_adjusted_cost, old_reading = best_entries[surface]
                                if adjusted_cost < old_adjusted_cost:
                                    best_entries[surface] = (adjusted_cost, reading)
                            else:
                                best_entries[surface] = (adjusted_cost, reading)
    finally:
        if temp_dir is not None and temp_dir.exists() and not keep_temp:
            print("Cleaning up downloaded files...")
            shutil.rmtree(temp_dir)
            
    print(f"Deduplicated unique surface forms: {len(best_entries)}")
    
    # Convert to list of [surface, hiragana_reading]
    final_entries = []
    for surface, (_, reading) in best_entries.items():
        hiragana_reading = katakana_to_hiragana(reading)
        final_entries.append([surface, hiragana_reading])
        
    final_entries.sort()
    return final_entries

def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--version",
        default=DEFAULT_VERSION,
        help="SudachiDict version YYYYMMDD to download",
    )
    parser.add_argument(
        "--output",
        default=Path("data/local-annotate-dict.json"),
        type=Path,
        help="Path to write the generated JSON dictionary",
    )
    parser.add_argument(
        "--keep-temp",
        action="store_true",
        help="Keep downloaded temporary files in temp_sudachi_download",
    )
    return parser.parse_args()

def main() -> int:
    args = parse_args()
    entries = build_entries(args.version, args.keep_temp)

    args.output.parent.mkdir(parents=True, exist_ok=True)
    with args.output.open("w", encoding="utf-8") as handle:
        json.dump(entries, handle, ensure_ascii=False, separators=(",", ":"))

    print(
        f"Wrote {len(entries)} entries to {args.output}.",
        file=sys.stderr,
    )
    return 0

if __name__ == "__main__":
    import zipfile  # Import inside the script context
    raise SystemExit(main())
