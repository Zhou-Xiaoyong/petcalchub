# -*- coding: utf-8 -*-
"""Add FAQPage JSON-LD to calculator pages that have inline FAQs but no structured data.
Also optionally insert data-vet-reviewed badge on health pages missing it.
Run from repo root.
"""
import re
import json
import html as htmllib
import os
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CALC_DIR = os.path.join(ROOT, 'calculators')

FAQ_ITEM_RE = re.compile(
    r'<button class="faq-question">(.*?)</button>\s*<div class="faq-answer">(.*?)</div>',
    re.S)
TAG_RE = re.compile(r'<[^>]+>')

# Health-related pages that should carry the evidence-based badge
BADGE_PAGES = {
    'dog-calorie.html', 'dog-age.html', 'cat-age.html', 'cat-calorie.html',
    'puppy-weight.html', 'pet-bmi.html', 'dog-pregnancy.html', 'cat-pregnancy.html',
    'dog-water.html', 'cat-water.html', 'dog-life.html',
}

def clean_text(raw):
    txt = TAG_RE.sub(' ', raw)
    txt = htmllib.unescape(txt)
    txt = re.sub(r'\s+', ' ', txt).strip()
    return txt

def build_jsonld(items):
    data = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
            {
                "@type": "Question",
                "name": q,
                "acceptedAnswer": {"@type": "Answer", "text": a}
            } for q, a in items
        ]
    }
    body = json.dumps(data, ensure_ascii=False, indent=2)
    return '  <script type="application/ld+json">\n' + body + '\n  </script>\n'

def process(path):
    fname = os.path.basename(path)
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    changed = []

    # 1. FAQPage JSON-LD
    if 'FAQPage' not in content:
        matches = FAQ_ITEM_RE.findall(content)
        items = [(clean_text(q), clean_text(a)) for q, a in matches]
        items = [(q, a) for q, a in items if q and a]
        if items:
            block = build_jsonld(items)
            if '</head>' in content:
                content = content.replace('</head>', block + '</head>', 1)
                changed.append('FAQPage(%d items)' % len(items))

    # 2. vet badge
    if fname in BADGE_PAGES and 'data-vet-reviewed' not in content:
        # insert right after the closing of breadcrumb nav
        m = re.search(r'(<nav class="calc-breadcrumb".*?</nav>)', content, re.S)
        if m:
            content = content.replace(m.group(1), m.group(1) + '\n\n    <div data-vet-reviewed></div>', 1)
            changed.append('vet-badge')

    if changed:
        with open(path, 'w', encoding='utf-8') as f:
            f.write(content)
    return changed

def main():
    report = {}
    for fname in sorted(os.listdir(CALC_DIR)):
        if not fname.endswith('.html'):
            continue
        changed = process(os.path.join(CALC_DIR, fname))
        if changed:
            report[fname] = changed
    for k, v in report.items():
        print(k, '->', ', '.join(v))
    print('Total files changed:', len(report))

if __name__ == '__main__':
    main()
