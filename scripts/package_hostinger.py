"""Package only Vite production output, including .htaccess, for public_html."""
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED

root = Path(__file__).resolve().parents[1]
dist = root / 'dist'
assert (dist / 'index.html').is_file(), 'Run npm run build first.'
assert (dist / '.htaccess').is_file(), 'Missing Hostinger configuration.'
release = root / 'release'
release.mkdir(exist_ok=True)
output = release / 'sorrimed-hostinger.zip'
with ZipFile(output, 'w', ZIP_DEFLATED) as archive:
    for path in sorted(dist.rglob('*')):
        if path.is_file():
            archive.write(path, path.relative_to(dist))
with ZipFile(output) as archive:
    assert archive.testzip() is None, 'Corrupt archive'
    assert 'index.html' in archive.namelist()
    assert '.htaccess' in archive.namelist()
    assert not any(name.startswith(('assets/originals/', 'node_modules/', 'src/')) for name in archive.namelist())
print(f'Hostinger package: {output} ({output.stat().st_size / 1024 / 1024:.2f} MB)')
