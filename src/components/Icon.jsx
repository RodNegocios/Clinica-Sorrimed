export default function Icon({ name = 'arrow', size = 20, ...props }) {
  const paths = {
    arrow: <><path d="M5 12h14M13 6l6 6-6 6" /></>,
    diagonal: <><path d="M6 18 18 6M6 6h12v12" /></>,
    down: <><path d="M12 4v16m-6-6 6 6 6-6" /></>,
    close: <><path d="m6 6 12 12M6 18 18 6" /></>,
    plus: <><path d="M12 5v14M5 12h14" /></>,
    menu: <><path d="M4 8h16M4 16h16" /></>,
    pin: <><path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 0 1 14 0Z" /><circle cx="12" cy="10" r="2.5" /></>,
    phone: <><path d="m7 3 3 5-3 3a16 16 0 0 0 6 6l3-3 5 3c0 3-2 4-4 4C10 21 3 14 3 7c0-2 1-4 4-4Z" /></>,
    instagram: <><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><path d="M17.5 6.5h.01" /></>,
    whatsapp: <><path d="M20.5 11.5a8.5 8.5 0 0 1-12.6 7.4L3 21l1.8-5a8.5 8.5 0 1 1 15.7-4.5Z" /><path d="m8 7 2 3-1 1a9 9 0 0 0 4 4l1-1 3 1c-1 3-4 2-7-1S6 8 8 7Z" /></>,
    heart: <path d="M20 5.5a5 5 0 0 0-8 1 5 5 0 0 0-8-1c-4 4 1 9 8 14 7-5 12-10 8-14Z" />,
    sparkle: <><path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5L12 3Z" /></>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>{paths[name] || paths.arrow}</svg>;
}
