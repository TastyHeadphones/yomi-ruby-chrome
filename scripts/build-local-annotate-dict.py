#!/usr/bin/env python3
"""Build the offline annotation dictionary from the official JMdict feed."""

from __future__ import annotations

import argparse
import gzip
import json
import sys
import urllib.request
import xml.etree.ElementTree as ET
from pathlib import Path


DEFAULT_SOURCE_URL = "http://ftp.edrdg.org/pub/Nihongo/JMdict.gz"


def contains_kanji(text: str) -> bool:
    return bool(text) and any("\u4e00" <= char <= "\u9faf" or char in "々〆ヵヶ" for char in text)


def katakana_to_hiragana(text: str) -> str:
    return "".join(chr(ord(char) - 0x60) if "ァ" <= char <= "ヶ" else char for char in text)


def open_source_stream(source: str | Path):
    source_text = str(source)
    if source_text.startswith(("http://", "https://")):
        response = urllib.request.urlopen(source_text)
        return gzip.GzipFile(fileobj=response)
    return gzip.open(source_text, "rb")


def get_child_text(parent: ET.Element, tag: str) -> str:
    child = parent.find(tag)
    if child is None or child.text is None:
        return ""
    return child.text.strip()


def extract_entry_pairs(entry: ET.Element) -> list[list[str]]:
    kanji_forms: list[str] = []
    seen_forms: set[str] = set()

    for k_ele in entry.findall("k_ele"):
        keb = get_child_text(k_ele, "keb")
        if keb and keb not in seen_forms and contains_kanji(keb):
            seen_forms.add(keb)
            kanji_forms.append(keb)

    if not kanji_forms:
        return []

    pairs: list[list[str]] = []
    seen_pairs: set[tuple[str, str]] = set()

    for r_ele in entry.findall("r_ele"):
        if r_ele.find("re_nokanji") is not None:
            continue

        reading = katakana_to_hiragana(get_child_text(r_ele, "reb"))
        if not reading:
            continue

        restrictions = {
            item.text.strip()
            for item in r_ele.findall("re_restr")
            if item.text and item.text.strip()
        }
        candidate_forms = (
            [surface for surface in kanji_forms if surface in restrictions]
            if restrictions
            else kanji_forms
        )

        for surface in candidate_forms:
            key = (surface, reading)
            if key in seen_pairs:
                continue
            seen_pairs.add(key)
            pairs.append([surface, reading])

    return pairs


def build_entries(source: str | Path) -> tuple[int, list[list[str]]]:
    entries: list[list[str]] = []
    seen_pairs: set[tuple[str, str]] = set()
    entry_count = 0

    with open_source_stream(source) as raw_stream:
        for event, element in ET.iterparse(raw_stream, events=("end",)):
            if element.tag != "entry":
                continue

            entry_count += 1
            for surface, reading in extract_entry_pairs(element):
                key = (surface, reading)
                if key in seen_pairs:
                    continue
                seen_pairs.add(key)
                entries.append([surface, reading])

            element.clear()

    return entry_count, entries


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--source",
        default=DEFAULT_SOURCE_URL,
        help="JMdict gzip source URL or local file path",
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
    entry_count, entries = build_entries(args.source)

    args.output.parent.mkdir(parents=True, exist_ok=True)
    with args.output.open("w", encoding="utf-8") as handle:
        json.dump(entries, handle, ensure_ascii=False, separators=(",", ":"))

    print(
        f"Wrote {len(entries)} dictionary pairs from {entry_count} JMdict entries to {args.output}.",
        file=sys.stderr,
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
