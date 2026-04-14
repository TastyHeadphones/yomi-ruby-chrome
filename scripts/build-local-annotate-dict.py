#!/usr/bin/env python3
"""Build the offline annotation dictionary from full MeCab IPADIC CSV data."""

from __future__ import annotations

import argparse
import csv
import io
import json
import shutil
import sys
import tarfile
import tempfile
import urllib.request
from pathlib import Path


DEFAULT_SOURCE_URL = (
    "https://sourceforge.net/projects/mecab/files/mecab-ipadic/2.7.0-20070801/"
    "mecab-ipadic-2.7.0-20070801.tar.gz/download"
)


def katakana_to_hiragana(text: str) -> str:
    return "".join(chr(ord(char) - 0x60) if "ァ" <= char <= "ヶ" else char for char in text)


def resolve_source_path(source: str) -> tuple[Path, tempfile.TemporaryDirectory[str] | None]:
    source_text = str(source)
    if not source_text.startswith(("http://", "https://")):
        return Path(source_text), None

    tempdir = tempfile.TemporaryDirectory(prefix="yomiruby-ipadic-")
    archive_path = Path(tempdir.name) / "ipadic.tar.gz"
    with urllib.request.urlopen(source_text) as response, archive_path.open("wb") as output:
        shutil.copyfileobj(response, output)
    return archive_path, tempdir


def iter_ipadic_rows(archive_path: Path):
    with tarfile.open(archive_path, "r:gz") as archive:
        for member in archive.getmembers():
            if not member.isfile() or not member.name.endswith(".csv"):
                continue
            handle = archive.extractfile(member)
            if handle is None:
                continue
            text_stream = io.TextIOWrapper(handle, encoding="euc-jp", errors="ignore", newline="")
            reader = csv.reader(text_stream)
            for row in reader:
                if len(row) < 12:
                    continue
                yield row


def build_entries(source: str) -> tuple[int, list[list[str]]]:
    archive_path, tempdir = resolve_source_path(source)
    row_count = 0
    entries: list[list[str]] = []

    try:
        for row in iter_ipadic_rows(archive_path):
            surface = row[0].strip()
            reading = row[11].strip()
            if not surface or not reading or reading == "*":
                continue

            normalized = [column.strip() for column in row]
            normalized[11] = katakana_to_hiragana(reading)
            entries.append(normalized)
            row_count += 1
    finally:
        if tempdir is not None:
            tempdir.cleanup()

    return row_count, entries


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--source",
        default=DEFAULT_SOURCE_URL,
        help="IPADIC .tar.gz source URL or local file path",
    )
    parser.add_argument(
        "--output",
        default=Path("data/local-annotate-dict.json"),
        type=Path,
        help="Path to write the generated JSON dictionary",
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    row_count, entries = build_entries(args.source)

    args.output.parent.mkdir(parents=True, exist_ok=True)
    with args.output.open("w", encoding="utf-8") as handle:
        json.dump(entries, handle, ensure_ascii=False, separators=(",", ":"))

    print(
        f"Wrote {len(entries)} entries from {row_count} IPADIC rows to {args.output}.",
        file=sys.stderr,
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
