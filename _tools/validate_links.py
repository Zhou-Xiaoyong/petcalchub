#!/usr/bin/env python3
"""Validate internal links and JSON-LD in all HTML files of the petcalchub repo.

Checks:
  - Every relative href/src ending in .html (or starting with ../ or ./) resolves
    to an existing file under the repo.
  - Every <script type="application/ld+json"> block parses as JSON.
Usage: python _tools/validate_links.py
"""
import json, os, re, sys
from html.parser import HTMLParser

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BROKEN = []
BADJSON = []

LINK_RE = re.compile(r'(?:href|src)\s*=\s*"([^"]+)"')
JSON_RE = re.compile(r'<script type="application/ld\+json">(.*?)</script>', re.S)

class LinkExtractor(HTMLParser):
    def __init__(self, base):
        super().__init__(); self.base = base; self.links = []
    def handle_starttag(self, tag, attrs):
        d = dict(attrs)
        for k in ("href", "src"):
            v = d.get(k)
            if v:
                self.links.append(v)

def link_resolves(target, path_part):
    """A link resolves if the file/dir exists, OR it is a clean URL that maps to a
    .html file or a directory's index.html. petcalchub.com is served by Cloudflare
    Pages with Pretty URLs enabled: /foo is served from /foo.html and /dir/ from
    /dir/index.html. Internal links therefore use extensionless clean URLs (no .html)
    so that canonical/og:url/sitemap stay consistent and Google does not flag the page
    as 'Page with redirect'. Real broken links (no .html variant, no dir index) still
    fail this check."""
    if os.path.exists(target):
        return True
    if not path_part.endswith(".html"):
        if os.path.exists(target + ".html"):
            return True
        if os.path.isdir(target) and os.path.exists(os.path.join(target, "index.html")):
            return True
    return False

def check_file(path):
    rel = os.path.relpath(path, REPO)
    try:
        html = open(path, encoding="utf-8").read()
    except Exception as e:
        BROKEN.append(f"{rel}: cannot read ({e})"); return
    # links
    ext = LinkExtractor(path)
    try:
        ext.feed(html)
    except Exception:
        pass
    for link in ext.links:
        if link.startswith(("http://", "https://", "mailto:", "tel:", "data:")):
            continue
        if link.startswith("#"):  # pure in-page anchor
            continue
        path_part = link.split("#")[0].split("?")[0]  # drop fragment/query
        if path_part == "":
            continue
        if link.startswith("/"):
            target = os.path.join(REPO, path_part.lstrip("/"))
        else:
            target = os.path.normpath(os.path.join(os.path.dirname(path), path_part))
        if not link_resolves(target, path_part):
            BROKEN.append(f"{rel}: broken link -> {link}")
    # json-ld
    for block in JSON_RE.findall(html):
        try:
            json.loads(block)
        except Exception as e:
            BADJSON.append(f"{rel}: invalid JSON-LD ({e})")

for root, _, files in os.walk(REPO):
    if "/.git" in root or "\\.git" in root:
        continue
    for fn in files:
        if fn.endswith(".html"):
            check_file(os.path.join(root, fn))

print(f"Scanned HTML under {REPO}")
print(f"BROKEN internal links : {len(BROKEN)}")
for b in BROKEN:
    print("  -", b)
print(f"INVALID JSON-LD      : {len(BADJSON)}")
for b in BADJSON:
    print("  -", b)
sys.exit(1 if (BROKEN or BADJSON) else 0)
