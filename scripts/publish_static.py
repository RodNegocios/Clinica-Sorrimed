"""Build and validate develop, then push a production-only review branch.

Called automatically by the develop pre-push hook. Never updates main or merges.
"""
import argparse
import json
import os
from pathlib import Path
import re
import subprocess
import tempfile

ROOT = Path(__file__).resolve().parents[1]


def run(*args, **kwargs):
    return subprocess.run(args, cwd=ROOT, check=True, **kwargs)


def git(*args, **kwargs):
    return run('git', *args, capture_output=True, **kwargs).stdout.decode().strip()


def validate(dist):
    html = (dist / 'index.html').read_text()
    assert '/src/' not in html and '.jsx' not in html, 'Development HTML cannot be published'
    assert (dist / '.htaccess').is_file()
    for url in re.findall(r'(?:src|href)="(/[^"#]+)"', html):
        assert (dist / url.lstrip('/')).is_file(), url
    assert list((dist / 'assets').glob('*.js')) and list((dist / 'assets').glob('*.css'))
    assert list((dist / 'assets').glob('*.woff2'))
    assert not any((dist / p).exists() for p in ('src', 'tests', 'node_modules', 'package.json', 'vite.config.js'))


def publish(source, remote, build=True):
    assert remote == 'origin', 'Only origin is supported'
    origin = git('remote', 'get-url', remote)
    assert origin in ('https://github.com/RodNegocios/clinica-sorrimed.git', 'git@github.com:RodNegocios/clinica-sorrimed.git'), 'Unexpected repository'
    assert git('branch', '--show-current') == 'develop', 'Publish from develop only'
    assert git('rev-parse', 'HEAD') == source, 'The pushed source must be checked out'
    assert not git('status', '--porcelain'), 'Commit all source changes before pushing'
    run('git', 'fetch', remote, 'main')
    parent = git('rev-parse', 'FETCH_HEAD')
    if build:
        run('npm', 'run', 'build')
        run('npm', 'test')
    dist = ROOT / 'dist'
    validate(dist)
    # Provenance is data, not development source. Hostinger only serves the build.
    (dist / 'publication.json').write_text(json.dumps({'source_branch': 'develop', 'source_commit': source}, indent=2) + '\n')
    with tempfile.TemporaryDirectory(prefix='sorrimed-publish-') as tmp:
        env = {**os.environ, 'GIT_INDEX_FILE': str(Path(tmp) / 'index')}
        git('read-tree', '--empty', env=env)
        for path in sorted(dist.rglob('*')):
            if path.is_file():
                blob = git('hash-object', '-w', str(path))
                git('update-index', '--add', '--cacheinfo', f'100644,{blob},{path.relative_to(dist).as_posix()}', env=env)
        tree = git('write-tree', env=env)
    branch = f'publish/sorrimed-{source[:12]}-{parent[:8]}'
    ref = f'refs/heads/{branch}'
    existing = subprocess.run(['git', 'rev-parse', '--verify', ref], cwd=ROOT, capture_output=True)
    if existing.returncode == 0:
        commit = existing.stdout.decode().strip()
        assert git('rev-parse', f'{commit}^{{tree}}') == tree, 'Existing candidate differs; do not overwrite it'
    else:
        commit = git('commit-tree', tree, '-p', parent, input=f'Publish compiled SorriMed from develop {source}\n'.encode())
        git('update-ref', ref, commit)
    run('git', 'push', remote, f'{ref}:{ref}')
    print(f'Production review branch: {branch}', flush=True)
    print(f'Create PR (base main): https://github.com/RodNegocios/clinica-sorrimed/compare/main...{branch}?expand=1', flush=True)
    print('No merge performed. Hostinger deploys only after main is updated.', flush=True)
    return branch


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--source', required=True)
    parser.add_argument('--remote', default='origin')
    args = parser.parse_args()
    publish(args.source, args.remote)
