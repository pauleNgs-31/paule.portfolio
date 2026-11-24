#!/usr/bin/env python3
"""Build the English static page from the French source and reviewed translations."""
import html
import json
import re
from pathlib import Path

root = Path(__file__).resolve().parents[1]
output = root / 'dist' if (root / 'dist').is_dir() else root
translations = json.loads((root / 'translations/en.json').read_text())
source = (output / 'index.html').read_text().replace('<html lang="fr">', '<html lang="en">')
source = source.replace('<sup>e</sup>', '')
missing = set()

def translate_text(part):
    key = html.unescape(part.strip())
    if not key:
        return part
    if key in translations['texts']:
        return part.replace(part.strip(), html.escape(translations['texts'][key], quote=False), 1)
    if key not in translations['neutral']:
        missing.add(key)
    return part

def translate_tag(part):
    def attribute(match):
        key = html.unescape(match[2])
        translated = translations['attrs'].get(key, key)
        return match[1] + '="' + html.escape(translated, quote=True) + '"'
    return re.sub(r'(aria-label|alt|title|content)="([^"]*)"', attribute, part)

result = ''.join(translate_tag(part) if part.startswith('<') else translate_text(part)
                 for part in re.split(r'(<[^>]*>)', source))
if missing:
    raise SystemExit('Missing translations: ' + repr(sorted(missing)))
result = result.replace('href="index.html" lang="fr" hreflang="fr" aria-current="page"',
                        'href="index.html" lang="fr" hreflang="fr"')
result = result.replace('href="en.html" lang="en" hreflang="en"',
                        'href="en.html" lang="en" hreflang="en" aria-current="page"')
result = result.replace('subject=Stage%20international%202027', 'subject=Engineering%20internship%202027')
(output / 'en.html').write_text(result)
print('English page generated successfully.')
