"""Create web derivatives; never modify the original photographs."""
from pathlib import Path
import json
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parents[1]
SOURCES = {
    'doutora-capa': 'foto da doutora para capa inicial.png',
    'logo': 'logo da sorrimed.png',
    'atendimento': 'doutora atendendo paciente.png',
    'doutora-paciente': 'foto da doutora com paciente.png',
    'sorriso': 'foto paciente sorrido (foto muito legal).png',
    'paciente-azul': 'foto paciente.jpg',
    'crianca-sorriso': 'foto paiente criança.png',
    'crianca-brincando': 'paciente criança se divertindo no consutório.jpg',
    'crianca-desenhando': 'paciente criança se divertindo.png',
    'fachada': 'foto da fachda da clinica.png',
    'recepcao': 'foto da recepção da clinica.png',
    'consultorio': 'foto da area cirurgica da clinica.png',
    'sala': 'sala de atendimento do consultório.jpg',
    'resultado-01': 'antes e depis resultado paciente.png',
    'resultado-02': 'antes e depois resultado paciente 2.png',
    'resultado-03': 'antes e depois resultado paciente 3.png',
    'resultado-04': 'antes e depois resultado paciente 5.jpg',
    'resultado-05': 'antes e depois resultado paciente 6.png',
    'resultado-06': 'antes e depois resultado paciente.png',
    'resultado-07': 'antes e depos resultado paciente 1.png',
}
target = ROOT / 'public/images'
target.mkdir(parents=True, exist_ok=True)
manifest = {}
for name, filename in SOURCES.items():
    source = ROOT / 'assets/edited/paciente-azul.png' if name == 'paciente-azul' else ROOT / 'assets/originals' / filename
    with Image.open(source) as original:
        image = ImageOps.exif_transpose(original)
        variants = []
        for size in (480, 900, 1400):
            copy = image.copy()
            copy.thumbnail((size, size * 2), Image.Resampling.LANCZOS)
            output = target / f'{name}-{size}.webp'
            copy.save(output, 'WEBP', quality=85, method=6)
            variants.append({'src': f'/images/{output.name}', 'width': copy.width, 'height': copy.height})
        manifest[name] = {'source': str(source.relative_to(ROOT)), 'original': filename, 'width': image.width, 'height': image.height, 'variants': variants}
(ROOT / 'src/assets.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n')
print(f'Prepared {len(manifest)} original assets; {sum(p.stat().st_size for p in target.glob("*.webp")) / 1024 / 1024:.2f} MB of web derivatives.')
