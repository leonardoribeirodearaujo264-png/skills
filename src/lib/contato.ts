// Contato do dono, mostrado no rodapé da página inicial e nas políticas. Mude só aqui.
export const CONTATO = {
  marca: "Leonardo Skills",
  email: "leonardoribeirodearaujo260@gmail.com",
  // DDI + DDD + número, só dígitos
  telefone: "5598984641079",
  telefoneTexto: "(98) 98464-1079",
} as const;

export const linkWhatsApp = `https://wa.me/${CONTATO.telefone}`;
export const linkTelefone = `tel:+${CONTATO.telefone}`;
