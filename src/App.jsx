import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import Photo from './components/Photo';
import Icon from './components/Icon';
import Gallery from './components/Gallery';

gsap.registerPlugin(ScrollTrigger);
const WHATSAPP = 'https://wa.me/5565999800704';
const INSTAGRAM = 'https://www.instagram.com/sorrimeddo/';
const MAPS = 'https://www.google.com/maps/search/?api=1&query=SorriMed%20Rua%20Rio%20Grande%20do%20Sul%20157%20Comodoro%20MT';
const links = [['A SorriMed', '#sobre'], ['Nosso cuidado', '#cuidado'], ['Sorrisos reais', '#sorrisos']];

function ContactButton({ children = 'Vamos cuidar do seu sorriso?', className = '', small = false }) {
  return <a className={`contact-button ${small ? 'small' : ''} ${className}`} href={WHATSAPP} target="_blank" rel="noopener noreferrer"><span>{children}</span><span className="button-icon"><Icon name="diagonal" size={small ? 17 : 20} /></span></a>;
}

function MobileMenu({ onClose }) {
  const ref = useRef(null);
  useEffect(() => {
    const active = document.activeElement;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    ref.current.showModal();
    return () => { document.body.style.overflow = previous; active?.focus({ preventScroll: true }); };
  }, []);
  return <dialog className="mobile-menu" ref={ref} data-lenis-prevent aria-label="Menu de navegação" onCancel={e => { e.preventDefault(); onClose(); }}>
    <div className="mobile-menu-top"><Photo id="logo" alt="SorriMed Clínica Odontológica" /><button className="icon-button" onClick={onClose} aria-label="Fechar menu"><Icon name="close" /></button></div>
    <nav>{[...links, ['Encontre a gente', '#contato']].map(([label, href], i) => <a key={href} href={href} onClick={onClose}><span>0{i + 1}</span>{label}<Icon name="diagonal" /></a>)}</nav>
    <p>Transformando vidas<br /><em>através do sorriso.</em></p>
    <ContactButton>Falar pelo WhatsApp</ContactButton>
    <span className="menu-location">COMODORO, MATO GROSSO</span>
  </dialog>;
}

function Seal() {
  return <div className="care-seal" aria-hidden="true"><svg className="seal-ring" viewBox="0 0 120 120"><defs><path id="circle-type" d="M60 60m-44 0a44 44 0 1 1 88 0a44 44 0 1 1-88 0" /></defs><text><textPath href="#circle-type" textLength="274">CUIDADO QUE ACOLHE. SORRISOS QUE TRANSFORMAM. </textPath></text></svg><Icon name="sparkle" size={31} /></div>;
}

function CareAccordion() {
  const [active, setActive] = useState(0);
  const items = [
    ['Primeiro, a gente escuta.', 'Seu momento, suas dúvidas e o que você deseja para o seu sorriso. Nossa conversa começa por você.'],
    ['Cada sorriso, um caminho.', 'Um olhar individual para entender suas necessidades e conversar sobre as possibilidades de cuidado.'],
    ['Cuidado que continua.', 'Da primeira conversa aos próximos encontros, um espaço para você se sentir à vontade.'],
  ];
  return <div className="care-accordion">{items.map(([title, text], i) => <div className={`care-item ${active === i ? 'is-open' : ''}`} key={title}><h3><button aria-expanded={active === i} aria-controls={`care-panel-${i}`} id={`care-button-${i}`} onClick={() => setActive(active === i ? null : i)}><span className="care-number">0{i + 1}</span><span>{title}</span><Icon name="plus" /></button></h3><div className="care-answer" id={`care-panel-${i}`} role="region" aria-labelledby={`care-button-${i}`} inert={active !== i ? true : undefined} aria-hidden={active !== i}><div><p>{text}</p></div></div></div>)}</div>;
}

export default function App() {
  const root = useRef(null);
  const [menu, setMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 35);
    onScroll(); window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useLayoutEffect(() => {
    const mm = gsap.matchMedia();
    let lenis;
    let tick;
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      if (matchMedia('(pointer: fine)').matches) {
        lenis = new Lenis({ duration: 1.05, smoothWheel: true, anchors: { offset: -90, duration: 1.1 } });
        lenis.on('scroll', ScrollTrigger.update);
        tick = time => lenis.raf(time * 1000);
        gsap.ticker.add(tick);
      }
      const intro = gsap.timeline({ defaults: { ease: 'power3.out' } });
      intro.from('.hero-word', { yPercent: 115, rotation: 3, duration: 1.25, stagger: 0.12 }, 0.1)
        .from('.hero-image', { clipPath: 'inset(12% 8% 12% 8% round 180px 180px 0 0)', scale: 1.055, duration: 1.6 }, 0)
        .from('.hero-note, .hero-bottom, .hero-copy > .section-eyebrow', { y: 22, opacity: 0, stagger: 0.12, duration: 0.8 }, 0.55)
        .from('.care-seal', { scale: 0, rotation: -60, duration: 1.1, ease: 'back.out(1.3)' }, 0.75);
      gsap.to('.hero-image > img', { yPercent: 9, scale: 1.06, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
      gsap.to('.hero-copy-inner', { y: -45, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1 } });
      gsap.utils.toArray('[data-reveal]').forEach(el => gsap.from(el, { y: 55, rotationX: 12, transformOrigin: 'center bottom', clipPath: 'inset(0 0 100% 0)', duration: 1.15, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 90%', once: true } }));
      gsap.utils.toArray('[data-image-reveal]').forEach(el => {
        gsap.from(el, { clipPath: 'inset(0 0 100% 0)', duration: 1.4, ease: 'power3.inOut', scrollTrigger: { trigger: el, start: 'top 88%', once: true } });
        const img = el.querySelector('img');
        if (img) gsap.fromTo(img, { yPercent: -5, scale: 1.12 }, { yPercent: 5, scale: 1.05, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: 1 } });
      });
      gsap.from('.philosophy-word', { color: '#676b5f', stagger: 0.13, scrollTrigger: { trigger: '.philosophy', start: 'top 75%', end: 'bottom 65%', scrub: 0.5 } });
      gsap.to('.ribbon-track', { xPercent: -20, ease: 'none', scrollTrigger: { trigger: '.ribbon', start: 'top bottom', end: 'bottom top', scrub: 1.2 } });
      gsap.fromTo('.clinic-small', { y: 80 }, { y: -25, ease: 'none', scrollTrigger: { trigger: '.clinic', start: 'top bottom', end: 'bottom top', scrub: 1.2 } });
      return () => { if (tick) gsap.ticker.remove(tick); lenis?.destroy(); };
    }, root);
    return () => mm.revert();
  }, []);

  return <div ref={root}>
    <a className="skip-link" href="#conteudo">Pular para o conteúdo</a>
    <header className={`header ${scrolled ? 'is-scrolled' : ''}`}>
      <a className="brand" href="#inicio" aria-label="SorriMed, início"><Photo id="logo" alt="SorriMed Clínica Odontológica" priority sizes="180px" /></a>
      <nav className="desktop-nav" aria-label="Navegação principal">{links.map(([label, href]) => <a key={href} href={href}>{label}</a>)}</nav>
      <div className="header-right"><ContactButton small>Agende uma conversa</ContactButton><button className="menu-toggle icon-button" aria-label="Abrir menu" aria-haspopup="dialog" aria-expanded={menu} onClick={() => setMenu(true)}><Icon name="menu" /></button></div>
    </header>
    {menu && <MobileMenu onClose={() => setMenu(false)} />}
    <main id="conteudo">
      <section className="hero" id="inicio" aria-labelledby="hero-title">
        <div className="hero-copy"><div className="hero-copy-inner">
          <div className="section-eyebrow"><span className="little-line" />ODONTOLOGIA COM UM OLHAR HUMANO</div>
          <h1 id="hero-title"><span className="word-mask"><span className="hero-word">Seu sorriso.</span></span><span className="word-mask"><span className="hero-word">Sua <em>essência.</em></span></span></h1>
          <div className="hero-note"><p>Por trás de cada sorriso, <br />existe uma história.<br /><strong>Queremos cuidar da sua.</strong></p><ContactButton>Encontre seu novo sorriso</ContactButton><span className="hero-location"><Icon name="pin" size={14} /> COMODORO, MATO GROSSO</span></div>
        </div><div className="hero-bottom"><a href="#sobre" className="discover"><span className="round-arrow"><Icon name="down" size={16} /></span><span>Conheça a SorriMed</span></a><span className="hero-index">01 <span>/</span> UM NOVO COMEÇO</span></div></div>
        <div className="hero-visual"><div className="hero-image"><Photo id="doutora-capa" alt="Dra. Laiane Basílio na SorriMed, ao lado da cadeira odontológica" priority sizes="(max-width: 760px) 100vw, 48vw" /><div className="portrait-caption"><span>Um olhar atento. Um cuidado próximo.</span><p>Dra. Laiane Basílio</p></div><span className="portrait-side">SORRIMED CLÍNICA ODONTOLÓGICA</span></div><Seal /></div>
      </section>

      <section className="philosophy section-pad" id="sobre" aria-labelledby="about-title"><div className="philosophy-top"><span className="section-eyebrow">MAIS DO QUE ODONTOLOGIA</span><Icon name="sparkle" size={35} /></div><h2 id="about-title">{'Transformando vidas'.split(' ').map(word => <span className="philosophy-word" key={word}>{word} </span>)}<br /><em>{'através do sorriso.'.split(' ').map(word => <span className="philosophy-word" key={word}>{word} </span>)}</em></h2><div className="philosophy-bottom"><span>ESSA É A NOSSA ESSÊNCIA.</span><p>Acreditamos no cuidado que acolhe, na conversa que aproxima e na confiança de poder ser você.</p></div></section>

      <section className="doctor section-pad" aria-labelledby="doctor-title"><div className="doctor-photos"><div className="doctor-main" data-image-reveal><Photo id="atendimento" alt="Dra. Laiane durante um atendimento odontológico" /></div><div className="doctor-detail" data-image-reveal><Photo id="doutora-paciente" alt="Dra. Laiane e uma paciente, juntas na recepção da SorriMed" sizes="(max-width: 760px) 42vw, 22vw" /></div><span className="image-caption">PRESENÇA EM CADA DETALHE.</span></div><div className="doctor-copy"><div className="section-eyebrow"><span className="little-line" />QUEM CUIDA DE VOCÊ</div><h2 id="doctor-title" data-reveal>Antes de cuidar<br />do seu sorriso,<br /><em>cuidamos de você.</em></h2><p>Com a Dra. Laiane Basílio e equipe, cada encontro começa com atenção. Porque se sentir bem também faz parte do cuidado.</p><div className="doctor-signature"><span>Dra. Laiane Basílio</span><small>SORRIMED CLÍNICA ODONTOLÓGICA</small></div><a className="text-link" href={WHATSAPP} target="_blank" rel="noopener noreferrer">Vamos nos conhecer <Icon name="diagonal" size={18} /></a></div></section>

      <section className="care section-pad" id="cuidado" aria-labelledby="care-title"><div className="care-heading"><div className="section-eyebrow"><span className="little-line" />DO SEU JEITO. NO SEU TEMPO.</div><h2 id="care-title" data-reveal>O seu sorriso<br />merece <em>presença.</em></h2><p>Um cuidado pensado para a pessoa<br />que existe por trás do sorriso.</p><span className="care-mark" aria-hidden="true"><Icon name="heart" size={63} /></span></div><CareAccordion /></section>

      <Gallery />

      <div className="ribbon" aria-hidden="true"><div className="ribbon-track">{[0, 1, 2].map(i => <span key={i}>Sorrir faz bem. <Icon name="sparkle" size={41} /><em>Se sentir bem, também.</em><Icon name="sparkle" size={41} /></span>)}</div></div>

      <section className="clinic section-pad" aria-labelledby="clinic-title"><div className="clinic-top"><div><div className="section-eyebrow"><span className="little-line" />SEU ESPAÇO DE CUIDADO</div><h2 id="clinic-title" data-reveal>Pode chegar.<br /><em>Sinta-se em casa.</em></h2></div><p>No Centro de Comodoro, um espaço<br />para receber você com calma,<br />proximidade e atenção.</p></div><div className="clinic-images"><div className="clinic-wide" data-image-reveal><Photo id="recepcao" alt="Recepção da SorriMed com iluminação acolhedora e detalhes dourados" sizes="(max-width: 760px) 90vw, 65vw" /></div><div className="clinic-small"><Photo id="consultorio" alt="Consultório SorriMed com cadeira odontológica e parede em tons dourados" /><span>OS DETALHES TAMBÉM ACOLHEM.</span></div></div></section>

      <section className="contact section-pad" id="contato" aria-labelledby="contact-title"><div className="contact-top"><div><div className="section-eyebrow"><span className="little-line" />O PRÓXIMO SORRISO PODE SER O SEU</div><h2 id="contact-title" data-reveal>Vamos escrever<br /><em>a sua história?</em></h2><p>Uma conversa é um bom começo.</p></div><a className="contact-orb" href={WHATSAPP} target="_blank" rel="noopener noreferrer"><Icon name="diagonal" size={43} /><span>FALE COM A GENTE<br />NO WHATSAPP</span></a></div><div className="contact-details"><a href={MAPS} target="_blank" rel="noopener noreferrer" className="contact-detail"><Icon name="pin" /><div><span>VENHA NOS CONHECER</span><p>Rua Rio Grande do Sul, 157, Sala 01<br />Centro, Comodoro, MT<br /><small>CEP 78310-000</small></p><strong>Como chegar <Icon name="diagonal" size={15} /></strong></div></a><div className="contact-detail"><Icon name="phone" /><div><span>VAMOS CONVERSAR</span><a href={WHATSAPP} target="_blank" rel="noopener noreferrer">WhatsApp: (65) 99980-0704</a><a href="tel:+556532831262">Telefone: (65) 3283-1262</a><small>Consulte os horários pelo WhatsApp.</small></div></div><a className="contact-detail" href={INSTAGRAM} target="_blank" rel="noopener noreferrer"><Icon name="instagram" /><div><span>UM POUCO DO NOSSO DIA A DIA</span><p>@sorrimeddo</p><strong>Acompanhe no Instagram <Icon name="diagonal" size={15} /></strong></div></a></div></section>
    </main>
    <footer className="footer"><a href="#inicio" aria-label="SorriMed, voltar ao início"><Photo id="logo" alt="SorriMed Clínica Odontológica" sizes="170px" /></a><p>Transformando vidas através do sorriso.</p><span>{new Date().getFullYear()} SorriMed. Todos os direitos reservados.</span><a className="back-top" href="#inicio" aria-label="Voltar ao início"><Icon name="down" size={18} /></a></footer>
    <a className="floating-whatsapp" href={WHATSAPP} target="_blank" rel="noopener noreferrer" aria-label="Conversar com a SorriMed pelo WhatsApp"><Icon name="whatsapp" size={25} /><span>Vamos conversar?</span></a>
  </div>;
}
