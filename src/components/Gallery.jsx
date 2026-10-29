import { useEffect, useRef, useState } from 'react';
import BounceCards from './BounceCards';
import Photo, { assetSrc } from './Photo';
import Icon from './Icon';

export const galleries = {
  sorrisos: { label: 'Nossos sorrisos', items: [
    { id: 'sorriso', alt: 'Paciente sorrindo na SorriMed', caption: 'A alegria de sorrir.' },
    { id: 'crianca-sorriso', alt: 'Criança sorrindo com uma medalha no consultório', caption: 'Pequenos sorrisos, grandes momentos.' },
    { id: 'doutora-paciente', alt: 'Dra. Laiane ao lado de uma paciente na clínica', caption: 'Cuidado que aproxima.' },
    { id: 'crianca-desenhando', alt: 'Criança desenhando com a equipe da clínica', caption: 'Espaço para ser criança.' },
    { id: 'paciente-azul', alt: 'Paciente em frente à marca SorriMed', caption: 'Cada sorriso tem sua história.' },
    { id: 'crianca-brincando', alt: 'Criança brincando na cadeira do consultório', caption: 'Acolhimento desde o começo.' },
  ] },
  resultados: { label: 'Antes e depois', items: Array.from({ length: 7 }, (_, i) => ({ id: `resultado-0${i + 1}`, alt: `Registro original de antes e depois ${i + 1}`, caption: 'Uma história de cuidado.' })) },
  clinica: { label: 'Nossa clínica', items: [
    { id: 'recepcao', alt: 'Recepção da SorriMed em tons claros e dourados', caption: 'Seu cuidado começa aqui.' },
    { id: 'consultorio', alt: 'Sala clínica com cadeira odontológica e iluminação acolhedora', caption: 'Atenção aos detalhes.' },
    { id: 'fachada', alt: 'Fachada da SorriMed no Centro de Comodoro', caption: 'Perto de você, em Comodoro.' },
    { id: 'sala', alt: 'Outro ângulo da sala de atendimento da clínica', caption: 'Um espaço para acolher.' },
  ] },
};

function Lightbox({ items, initial, isResult, onClose }) {
  const ref = useRef(null);
  const [index, setIndex] = useState(initial);
  const move = delta => setIndex(current => (current + delta + items.length) % items.length);
  useEffect(() => {
    const dialog = ref.current;
    const focused = document.activeElement;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialog.showModal();
    return () => { document.body.style.overflow = previous; dialog.close(); focused?.focus({ preventScroll: true }); };
  }, []);
  return <dialog ref={ref} className="lightbox" data-lenis-prevent aria-label="Galeria de fotografias" onCancel={e => { e.preventDefault(); onClose(); }} onClick={e => { if (e.target === e.currentTarget) onClose(); }} onKeyDown={e => {
    if (e.key === 'ArrowRight') { e.preventDefault(); move(1); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); move(-1); }
  }}>
    <button className="icon-button lightbox-close" aria-label="Fechar galeria" onClick={onClose} autoFocus><Icon name="close" /></button>
    <div className="lightbox-content">
      <Photo key={items[index].id} id={items[index].id} alt={items[index].alt} sizes="(max-width: 760px) 94vw, 70vw" priority />
      <div className="lightbox-caption"><p>{items[index].caption}</p><span aria-live="polite">{String(index + 1).padStart(2, '0')} / {String(items.length).padStart(2, '0')}</span></div>
      {isResult && <p className="results-note">Registros individuais. Cada caso é único e os resultados variam conforme a avaliação e o tratamento.</p>}
      <div className="lightbox-controls"><button className="icon-button" aria-label="Foto anterior" onClick={() => move(-1)}><Icon className="reverse" /></button><button className="icon-button" aria-label="Próxima foto" onClick={() => move(1)}><Icon /></button></div>
    </div>
  </dialog>;
}

export default function Gallery() {
  const [category, setCategory] = useState('sorrisos');
  const [offset, setOffset] = useState(0);
  const [width, setWidth] = useState(1000);
  const [visible, setVisible] = useState(false);
  const [selected, setSelected] = useState(null);
  const ref = useRef(null);
  const touch = useRef(null);
  const items = galleries[category].items;
  const mobile = width < 700;
  const count = mobile ? 3 : Math.min(5, items.length);
  const displayed = Array.from({ length: count }, (_, i) => ({ ...items[(offset + i) % items.length], originalIndex: (offset + i) % items.length }));
  useEffect(() => {
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    observer.observe(ref.current);
    const intersection = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) { setVisible(true); intersection.disconnect(); } }, { rootMargin: '80px' });
    intersection.observe(ref.current);
    return () => { observer.disconnect(); intersection.disconnect(); };
  }, []);
  const move = delta => setOffset(current => (current + delta + items.length) % items.length);
  return <section className="gallery-section section-pad" id="sorrisos" aria-labelledby="gallery-title">
    <div className="section-eyebrow"><span className="little-line" />HISTÓRIAS QUE NOS MOVEM</div>
    <h2 id="gallery-title" data-reveal>O melhor resultado?<br /><em>É ver você sorrir.</em></h2>
    <p className="section-intro">Pessoas, encontros e sorrisos que fazem parte de nós.</p>
    <div className="gallery-filters" aria-label="Categorias de fotografias">{Object.entries(galleries).map(([key, group]) => <button key={key} aria-pressed={category === key} onClick={() => { setCategory(key); setOffset(0); }}>{group.label}</button>)}</div>
    <div className="gallery-stage" ref={ref} onTouchStart={e => { touch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }; }} onTouchEnd={e => {
      if (!touch.current) return;
      const dx = e.changedTouches[0].clientX - touch.current.x;
      const dy = e.changedTouches[0].clientY - touch.current.y;
      if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.5) move(dx < 0 ? 1 : -1);
      touch.current = null;
    }}>
      {visible && <BounceCards key={`${category}-${offset}-${mobile}`} className={category === 'resultados' ? 'results-cards' : ''} images={displayed.map(item => ({ src: assetSrc(item.id, 480), alt: item.alt }))} containerWidth={width} containerHeight={mobile ? 290 : 390} cardSize={mobile ? Math.min(220, width * 0.55) : 265} spread={mobile ? width * 0.23 : Math.min(165, width * 0.15)} rotation={mobile ? 9 : 8} arc={28} pushDistance={mobile ? 0 : 65} enableHover={!mobile} hoverScale={1.07} bounciness={0.47} animationDelay={0.08} animationStagger={0.055} borderWidth={7} borderColor="#fffdf8" radius={5} onCardClick={i => setSelected(displayed[i].originalIndex)} />}
    </div>
    <div className="gallery-bottom"><p>Um instante. Uma história.<br /><span>Toque em uma foto para conhecer de perto.</span></p><div className="gallery-controls"><button className="icon-button" onClick={() => move(-1)} aria-label="Fotografias anteriores"><Icon className="reverse" /></button><span aria-live="polite" aria-atomic="true">{String(offset + 1).padStart(2, '0')} <i>/</i> {String(items.length).padStart(2, '0')}</span><button className="icon-button" onClick={() => move(1)} aria-label="Próximas fotografias"><Icon /></button></div></div>
    {category === 'resultados' && <p className="results-note">Registros individuais. Cada caso é único e os resultados variam conforme a avaliação e o tratamento.</p>}
    {selected !== null && <Lightbox items={items} initial={selected} isResult={category === 'resultados'} onClose={() => setSelected(null)} />}
  </section>;
}
