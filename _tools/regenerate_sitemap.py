#!/usr/bin/env python3
"""Regenerate sitemap.xml for petcalchub.com from scratch.

Rules:
- Walk repo, collect all indexable HTML files (skip noindex, hidden, drafts).
- Convert each to Cloudflare Pages clean URL (no .html, dir/index.html -> dir/).
- lastmod:
    * pages modified this run -> 2026-08-22
    * everything else -> keep existing lastmod from current sitemap.xml (fallback 2026-08-15)
- Sort alphabetically by URL within top-level group.
- Validate: parseable XML, no duplicate <loc>, no .html, URL count = total indexable HTMLs.
"""
import os, re, sys, json
from datetime import datetime
import xml.etree.ElementTree as ET

REPO = r"E:\WorkBuddy\petcalchub"
SITE = "https://petcalchub.com"
SITEMAP = os.path.join(REPO, "sitemap.xml")
TODAY = "2026-08-22"

# Pages explicitly modified today — bumped to today's lastmod
MODIFIED_TODAY = {
    "blog/chocolate-toxicity-calculator-mg-kg.html",
    "blog/my-dog-ate-a-chocolate-chip-cookie.html",
    "blog/index.html",
    "calculators/chocolate-toxicity.html",
}

# Read existing sitemap to inherit lastmod for unchanged pages
existing_lastmod = {}
if os.path.exists(SITEMAP):
    tree = ET.parse(SITEMAP)
    root = tree.getroot()
    ns = {"s": "http://www.sitemaps.org/schemas/sitemap/0.9"}
    for url in root.findall("s:url", ns):
        loc = url.find("s:loc", ns)
        last = url.find("s:lastmod", ns)
        if loc is not None and last is not None:
            existing_lastmod[loc.text.strip()] = last.text.strip()

def clean_url(rel_path: str) -> str:
    """Convert a repo-relative html path to its clean URL form.

    foo.html               -> https://petcalchub.com/foo
    foo/index.html         -> https://petcalchub.com/foo/
    index.html             -> https://petcalchub.com/
    """
    rel = rel_path.replace("\\", "/").lstrip("/")
    if rel == "index.html":
        return f"{SITE}/"
    if rel.endswith("/index.html"):
        return f"{SITE}/{rel[:-len('index.html')]}"
    if rel.endswith(".html"):
        slug = rel[:-len(".html")]
        return f"{SITE}/{slug}"
    return f"{SITE}/{rel}"  # fallback

def is_indexable(html_path: str) -> bool:
    """Return True if page should be in sitemap per robots/meta rules."""
    with open(html_path, encoding="utf-8") as f:
        html = f.read()
    # Skip if explicitly noindex
    m = re.search(r'<meta\s+name=["\']?robots["\']?\s+content=["\'][^"\']*["\']', html, re.I)
    if m and re.search(r'noindex', m.group(0), re.I):
        return False
    # Skip drafts/templates by filename
    base = os.path.basename(html_path).lower()
    if base.startswith(("template", "draft", "test", "_")):
        return False
    return True

def changefreq_priority(url: str) -> tuple:
    if url == f"{SITE}/":
        return ("weekly", "1.0")
    if url.startswith(f"{SITE}/blog/"):
        if url == f"{SITE}/blog/":
            return ("monthly", "0.6")
        return ("monthly", "0.6")
    if url.startswith(f"{SITE}/calculators/"):
        return ("monthly", "0.8")
    if url.endswith("/about") or url.endswith("/privacy"):
        return ("yearly", "0.4")
    return ("monthly", "0.5")

def lastmod_for(rel_repo_path: str, clean: str) -> str:
    rel = rel_repo_path.replace("\\", "/")
    if rel in MODIFIED_TODAY:
        return TODAY
    # Inherit existing
    if clean in existing_lastmod:
        return existing_lastmod[clean]
    # Default to TODAY if never seen
    return TODAY

# Walk repo and collect HTML files
pages = []  # list of (rel_repo_path, clean_url, lastmod, freq, priority)
for root, dirs, files in os.walk(REPO):
    # Skip .git, .workbuddy
    if "/.git" in root or "/.workbuddy" in root or "\\.git" in root or "\\.workbuddy" in root:
        continue
    for fn in files:
        if not fn.endswith(".html"):
            continue
        full = os.path.join(root, fn)
        rel = os.path.relpath(full, REPO)
        if not is_indexable(full):
            continue
        clean = clean_url(rel)
        lm = lastmod_for(rel, clean)
        freq, prio = changefreq_priority(clean)
        pages.append((rel, clean, lm, freq, prio))

# Sort: home first, then /blog/, /calculators/, /about/, /privacy/ alphabetically
def sort_key(item):
    rel, clean, lm, freq, prio = item
    if clean == f"{SITE}/":
        return (0, clean)
    if clean == f"{SITE}/blog/":
        return (1, clean)
    if clean.startswith(f"{SITE}/blog/"):
        return (2, clean)
    if clean == f"{SITE}/about":
        return (3, clean)
    if clean == f"{SITE}/privacy":
        return (4, clean)
    return (5, clean)
pages.sort(key=sort_key)

# Write sitemap
ns_url = "http://www.sitemaps.org/schemas/sitemap/0.9"
ET.register_namespace("", ns_url)
root = ET.Element(f"{{{ns_url}}}urlset")
for rel, clean, lm, freq, prio in pages:
    url = ET.SubElement(root, f"{{{ns_url}}}url")
    ET.SubElement(url, f"{{{ns_url}}}loc").text = clean
    ET.SubElement(url, f"{{{ns_url}}}lastmod").text = lm
    ET.SubElement(url, f"{{{ns_url}}}changefreq").text = freq
    ET.SubElement(url, f"{{{ns_url}}}priority").text = prio

tree = ET.ElementTree(root)
ET.indent(tree, space="  ")
tree.write(SITEMAP, encoding="utf-8", xml_declaration=True)

# -------- Validation --------
with open(SITEMAP, encoding="utf-8") as f:
    raw = f.read()

# 1. parseable
try:
    parsed = ET.fromstring(raw)
except Exception as e:
    print(f"FAIL: sitemap not parseable: {e}"); sys.exit(1)

# 2. no duplicate <loc>
locs = re.findall(r'<loc>([^<]+)</loc>', raw)
dup = [x for x in set(locs) if locs.count(x) > 1]
if dup:
    print("FAIL: duplicate <loc>:", dup); sys.exit(1)

# 3. no .html in <loc>
html_hits = [l for l in locs if ".html" in l]
if html_hits:
    print("FAIL: .html present in <loc>:", html_hits); sys.exit(1)

# 4. URL count vs indexable HTML count
disk_html_count = 0
for root, dirs, files in os.walk(REPO):
    if "/.git" in root or "/.workbuddy" in root or "\\.git" in root or "\\.workbuddy" in root:
        continue
    for fn in files:
        if fn.endswith(".html"):
            full = os.path.join(root, fn)
            if is_indexable(full):
                disk_html_count += 1
if len(locs) != disk_html_count:
    print(f"FAIL: sitemap URL count {len(locs)} != indexable HTML count {disk_html_count}")
    sys.exit(1)

# 5. no noindex pages
noindex_leaks = []
for root, dirs, files in os.walk(REPO):
    if "/.git" in root or "/.workbuddy" in root or "\\.git" in root or "\\.workbuddy" in root:
        continue
    for fn in files:
        if not fn.endswith(".html"):
            continue
        full = os.path.join(root, fn)
        if is_indexable(full):
            continue
        rel = os.path.relpath(full, REPO).replace("\\", "/")
        clean = clean_url(rel)
        if clean in locs:
            noindex_leaks.append(rel)
if noindex_leaks:
    print("FAIL: noindex pages in sitemap:", noindex_leaks); sys.exit(1)

print(f"OK: sitemap has {len(locs)} URLs, all clean, no dups, no noindex leaks.")
print("Lastmod distribution:")
from collections import Counter
c = Counter()
for rel, clean, lm, freq, prio in pages:
    c[lm] += 1
for k in sorted(c):
    print(f"  {k}: {c[k]} URLs")
