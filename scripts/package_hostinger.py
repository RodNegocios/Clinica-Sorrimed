"""Package only Vite production output, including .htaccess, for public_html."""
from pathlib import Path
from shutil import copyfile
from zipfile import ZipFile, ZipInfo, ZIP_DEFLATED

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
            # Stable metadata keeps identical builds from creating binary-only diffs.
            entry = ZipInfo(path.relative_to(dist).as_posix(), date_time=(2020, 1, 1, 0, 0, 0))
            entry.compress_type = ZIP_DEFLATED
            entry.external_attr = 0o100644 << 16
            archive.writestr(entry, path.read_bytes())
with ZipFile(output) as archive:
    assert archive.testzip() is None, 'Corrupt archive'
    assert 'index.html' in archive.namelist()
    assert '.htaccess' in archive.namelist()
    assert not any(name.startswith(('assets/originals/', 'node_modules/', 'src/')) for name in archive.namelist())
    for path in dist.rglob('*'):
        if path.is_file():
            assert archive.read(path.relative_to(dist).as_posix()) == path.read_bytes(), path

delivery = root / 'entrega' / output.name
delivery.parent.mkdir(exist_ok=True)
copyfile(output, delivery)
assert delivery.read_bytes() == output.read_bytes(), 'Delivery copy differs from validated archive.'
print(f'Hostinger package: {output} ({output.stat().st_size / 1024 / 1024:.2f} MB)')
print(f'GitHub download updated: {delivery}')
