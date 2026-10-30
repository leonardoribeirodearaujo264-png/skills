// Ícones de traço do desenho da loja (24x24, currentColor). Sempre decorativos: o texto ao lado diz o que é.
const ICONES = {
  check: <><path d="M5 12.5l4.5 4.5L19 7.5"/></>,
  seta: <><path d="M7 17L17 7M9 7h8v8"/></>,
  direita: <><path d="M5 12h14M13 6l6 6-6 6"/></>,
  cadeado: <><rect x="5" y="11" width="14" height="9" rx="2.5"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></>,
  email: <><rect x="3" y="5.5" width="18" height="13" rx="2.5"/><path d="M4 7.5l8 6 8-6"/></>,
  alerta: <><path d="M12 4l9 16H3z"/><path d="M12 10v4M12 17.2v.1"/></>,
  info: <><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8v.1"/></>,
  relogio: <><circle cx="12" cy="12" r="9"/><path d="M12 7.5V12l3 2"/></>,
  erro: <><circle cx="12" cy="12" r="9"/><path d="M9 9l6 6M15 9l-6 6"/></>,
  ok: <><circle cx="12" cy="12" r="9"/><path d="M8 12.3l2.8 2.7L16 9.6"/></>,
  escudo: <><path d="M12 3l7 3v5.5c0 4.4-3 8-7 9.5-4-1.5-7-5.1-7-9.5V6z"/></>,
  raio: <><path d="M13 3L5 13.5h6L10 21l8-10.5h-6z"/></>,
  terminal: <><rect x="3" y="4.5" width="18" height="15" rx="2.5"/><path d="M7 9.5l3 2.5-3 2.5M12.5 15h4.5"/></>,
  baixar: <><path d="M12 4v11M7 10.5l5 5 5-5M5 19.5h14"/></>,
  github: <><path d="M9 19c-4 1.2-4-2-5.6-2.4M14.6 21v-3.2a2.8 2.8 0 0 0-.8-2.2c2.6-.3 5.4-1.3 5.4-5.8a4.5 4.5 0 0 0-1.2-3.1 4.2 4.2 0 0 0-.1-3.1s-1-.3-3.2 1.2a11 11 0 0 0-5.8 0C6.7 3.3 5.7 3.6 5.7 3.6a4.2 4.2 0 0 0-.1 3.1 4.5 4.5 0 0 0-1.2 3.1c0 4.5 2.8 5.5 5.4 5.8a2.8 2.8 0 0 0-.8 2.2V21"/></>,
  play: <><path d="M8 5.5v13l11-6.5z" fill="currentColor" stroke="none"/></>,
  atualizar: <><path d="M20 11a8 8 0 1 0-2.3 5.7M20 5v6h-6"/></>,
  pacote: <><path d="M3.5 7.5L12 3l8.5 4.5v9L12 21l-8.5-4.5z"/><path d="M3.5 7.5L12 12l8.5-4.5M12 12v9"/></>,
  pix: <><path d="M12 3l9 9-9 9-9-9z"/><path d="M8 12h8"/></>,
} as const;

export type NomeIcone = keyof typeof ICONES;

export function Icone({ nome, tamanho = 18 }: { nome: NomeIcone; tamanho?: number }) {
  return (
    <svg
      width={tamanho}
      height={tamanho}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {ICONES[nome]}
    </svg>
  );
}
