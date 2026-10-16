"""Build a reproducible installable ZIP without development dependencies."""
from pathlib import Path
from zipfile import ZipFile, ZipInfo, ZIP_DEFLATED
import hashlib

root = Path(__file__).resolve().parent.parent
output = root.parent / 'artifacts' / 'superworld-core-0.1.0.zip'
output.parent.mkdir(exist_ok=True)
for required in ('assets/dist/parts.js', 'assets/dist/catalog.css', 'superworld-core.php'):
    if not (root / required).is_file():
        raise SystemExit(f'Missing built artifact: {required}; run npm run build first')
with ZipFile(output, 'w', compression=ZIP_DEFLATED) as archive:
    for path in sorted(root.rglob('*')):
        relative = path.relative_to(root)
        if not path.is_file() or set(relative.parts) & {'node_modules', '.git', '.DS_Store'}:
            continue
        if relative.parts[0] in {'tools'}:
            continue
        info = ZipInfo('superworld-core/' + relative.as_posix(), (2026, 1, 1, 0, 0, 0))
        info.compress_type = ZIP_DEFLATED
        info.external_attr = 0o100644 << 16
        archive.writestr(info, path.read_bytes())
digest = hashlib.sha256(output.read_bytes()).hexdigest()
output.with_suffix('.zip.sha256').write_text(f'{digest}  {output.name}\n')
print(f'Packaged {output.name}; sha256={digest}')
