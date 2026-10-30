// Regras dos dados do comprador no checkout. Funções puras, usadas pela tela (erro na hora) e pelo
// servidor (validação de novo antes de criar o pagamento), para as duas nunca divergirem.

export type DadosComprador = { nome: string; email: string; telefone: string };
export type Campo = keyof DadosComprador;
export type ErrosComprador = Partial<Record<Campo, string>>;

export function normalizarNome(nome: string): string {
  return nome.trim().replace(/\s+/g, " ");
}

// Nome e sobrenome: pelo menos duas palavras com duas letras ou mais
export function erroNome(nome: string): string | null {
  const n = normalizarNome(nome);
  if (!n) return "Digite o seu nome completo.";
  const partes = n.split(" ").filter((p) => /\p{L}{2,}/u.test(p));
  if (partes.length < 2) return "Digite nome e sobrenome.";
  if (n.length > 120) return "Nome muito longo.";
  return null;
}

export function normalizarEmail(email: string): string {
  return email.replace(/\s+/g, "").toLowerCase();
}

export function erroEmail(email: string): string | null {
  const e = normalizarEmail(email);
  if (!e) return "Digite o seu e-mail.";
  if (e.length > 254 || !/^[^@\s]+@[^@\s]+\.[a-z]{2,}$/.test(e)) return "Confira o e-mail. Exemplo: nome@gmail.com";
  return null;
}

// Telefone: só os números, com DDD (10 ou 11 dígitos; celular com 9 na frente)
export function soNumeros(telefone: string): string {
  return telefone.replace(/\D/g, "").replace(/^55(?=\d{10,11}$)/, "");
}

export function erroTelefone(telefone: string): string | null {
  const t = soNumeros(telefone);
  if (!t) return "Digite o seu telefone com DDD.";
  if (t.length < 10) return "Telefone incompleto. Use DDD e número, por exemplo (11) 91234-5678.";
  if (t.length > 11 || !/^[1-9][1-9]/.test(t)) return "Confira o DDD e o número.";
  if (t.length === 11 && t[2] !== "9") return "Celular com 11 dígitos começa com 9 depois do DDD.";
  return null;
}

// Máscara enquanto digita: (11) 91234-5678 ou (11) 1234-5678
export function mascararTelefone(telefone: string): string {
  const t = soNumeros(telefone).slice(0, 11);
  if (t.length <= 2) return t.length ? `(${t}` : "";
  const ddd = t.slice(0, 2);
  const resto = t.slice(2);
  // Celular começa com 9 e tem 5 dígitos antes do hífen; fixo tem 4
  const corte = resto.startsWith("9") ? 5 : 4;
  return resto.length > corte ? `(${ddd}) ${resto.slice(0, corte)}-${resto.slice(corte)}` : `(${ddd}) ${resto}`;
}

export function validarComprador(d: DadosComprador): { ok: true; dados: DadosComprador } | { ok: false; erros: ErrosComprador } {
  const erros: ErrosComprador = {};
  const en = erroNome(d.nome);
  const ee = erroEmail(d.email);
  const et = erroTelefone(d.telefone);
  if (en) erros.nome = en;
  if (ee) erros.email = ee;
  if (et) erros.telefone = et;
  if (en || ee || et) return { ok: false, erros };
  return { ok: true, dados: { nome: normalizarNome(d.nome), email: normalizarEmail(d.email), telefone: soNumeros(d.telefone) } };
}

// Primeiro nome e sobrenome para o Mercado Pago
export function partesDoNome(nome: string): { primeiro: string; sobrenome: string } {
  const [primeiro = "", ...resto] = normalizarNome(nome).split(" ");
  return { primeiro, sobrenome: resto.join(" ") };
}
