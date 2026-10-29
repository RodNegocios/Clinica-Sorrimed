"""Make a complete HTML document for opening locally, with no asset requests."""
import base64
import json
import mimetypes
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DIST = ROOT / 'dist'
OUTPUT = ROOT / 'release' / 'visualizacao' / 'index.html'


def data_url(path):
    file = (DIST / path.lstrip('/')).resolve()
    assert file.is_relative_to(DIST), f'Asset outside build: {path}'
    mime = mimetypes.guess_type(str(file))[0] or 'application/octet-stream'
    return f'data:{mime};base64,{base64.b64encode(file.read_bytes()).decode()}'


html = (DIST / 'index.html').read_text()
scripts = re.findall(r'<script\b[^>]*\bsrc="([^"]+)"[^>]*></script>', html)
styles = re.findall(r'<link\b[^>]*\brel="stylesheet"[^>]*\bhref="([^"]+)"[^>]*>', html)
assert len(scripts) == 1 and len(styles) == 1, 'Expected one bundled entry and stylesheet.'

javascript = (DIST / scripts[0].lstrip('/')).read_text()
# Refuse code splitting: this document must never import external modules.
assert not re.search(r'\bimport\s*\(|\b(?:import|export)\s+[^;]*?\bfrom\s*[\'"]', javascript), 'External JavaScript module found.'
css = (DIST / styles[0].lstrip('/')).read_text()
css = re.sub(r'url\([\'"]?(/[^)\'\"]+)[\'"]?\)', lambda m: f'url("{data_url(m[1])}")', css)
assert not re.search(r'url\([\'"]?/(?!/)', css), 'Unresolved CSS asset.'

images = {f'/images/{path.name}': data_url(f'/images/{path.name}') for path in sorted((DIST / 'images').glob('*.webp'))}
assert len(images) == 60, 'Unexpected image variants: review the standalone export.'

html = re.sub(r'<script\b[^>]*\bsrc="[^"]+"[^>]*></script>', '', html)
html = re.sub(r'<link\b[^>]*\brel="(?:stylesheet|preload|modulepreload)"[^>]*>', '', html)
html = html.replace('href="/favicon.svg"', f'href="{data_url("/favicon.svg")}"')
html = html.replace('</head>', '<style>' + css.replace('</style', '<\\/style') + '</style>\n</head>')
embedded = json.dumps(images, ensure_ascii=True, separators=(',', ':'))
javascript = javascript.replace('</script', '<\\/script')
html = html.replace('</body>', f'<script>globalThis.__SORRIMED_EMBEDDED_ASSETS__={embedded};</script>\n<script type="module">{javascript}</script>\n</body>')
assert '<script type="module" crossorigin src=' not in html
assert not re.search(r'(?:src|href)="/(?!/)', html), 'Unresolved document asset.'

OUTPUT.parent.mkdir(parents=True, exist_ok=True)
OUTPUT.write_text(html)
print(f'Standalone HTML: {OUTPUT} ({OUTPUT.stat().st_size / 1024 / 1024:.2f} MB)')
print('Includes application code, styles, fonts, favicon and all 60 photo variants.')
