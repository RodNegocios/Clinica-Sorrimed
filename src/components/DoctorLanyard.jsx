import { useEffect, useRef, useState } from 'react';
import Lanyard from './Lanyard';
import Photo, { assetSrc } from './Photo';
import Icon from './Icon';
import './DoctorLanyard.css';

export default function DoctorLanyard() {
  const container = useRef(null);
  const controls = useRef(null);
  const [visible, setVisible] = useState(false);
  const [ready, setReady] = useState(false);
  const [unavailable, setUnavailable] = useState(false);
  const [reduced, setReduced] = useState(() => matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [back, setBack] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setVisible(true); observer.disconnect(); }
    }, { rootMargin: '100px' });
    observer.observe(container.current);
    const preference = matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => { setReduced(preference.matches); setReady(false); };
    preference.addEventListener('change', update);
    return () => { observer.disconnect(); preference.removeEventListener('change', update); };
  }, []);
  const staticMode = reduced || unavailable;
  const flip = () => {
    if (ready && !staticMode) controls.current?.flip();
    else setBack(value => !value);
  };
  return <figure className="care-visual" ref={container} aria-labelledby="lanyard-caption">
    <div className="doctor-lanyard-stage" data-ready={ready && !staticMode} data-lenis-prevent>
      <div className="doctor-card-fallback" hidden={ready && !staticMode}>
        <span className="doctor-card-strap" aria-hidden="true" />
        <div className="doctor-card-print"><Photo id={back ? 'doutora-paciente' : 'doutora-capa'} alt={back ? 'Dra. Laiane ao lado de uma paciente na SorriMed' : 'Retrato da Dra. Laiane Basílio na SorriMed'} sizes="(max-width: 760px) 65vw, 300px" /></div>
      </div>
      {visible && !staticMode && <Lanyard frontImage={assetSrc('doutora-capa')} backImage={assetSrc('doutora-paciente')} cardColor="#f4f1e9" strapColor="#292d27" metal="gold" finish="matte" size={0.65} strapLength={0.14} strapWidth={0.55} cornerRadius={0.2} gravity={0.8} damping={0.7} elasticity={0.35} breeze={0.13} intro={false} controlsRef={controls} onReady={() => setReady(true)} onUnavailable={() => setUnavailable(true)} />}
    </div>
    <figcaption id="lanyard-caption"><span>Dra. Laiane Basílio</span><small>UM CUIDADO QUE APROXIMA.</small></figcaption>
    <div className="lanyard-actions"><span>{staticMode ? 'Um outro olhar sobre o cuidado.' : 'Arraste a foto. Conheça o outro lado.'}</span><button className="lanyard-flip" onClick={flip} aria-label="Virar fotografia da doutora"><Icon name="rotate" size={16} />Virar foto</button></div>
  </figure>;
}
