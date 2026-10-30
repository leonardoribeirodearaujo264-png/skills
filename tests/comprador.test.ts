import { describe, expect, it } from "vitest";
import { erroEmail, erroNome, erroTelefone, mascararTelefone, partesDoNome, validarComprador } from "@/lib/loja/comprador";

describe("dados do comprador", () => {
  it("nome sem sobrenome é recusado; nome completo passa", () => {
    expect(erroNome("Maria")).toBe("Digite nome e sobrenome.");
    expect(erroNome("  ")).toBe("Digite o seu nome completo.");
    expect(erroNome("Maria S")).toBe("Digite nome e sobrenome.");
    expect(erroNome("Maria  da   Silva")).toBeNull();
    expect(erroNome("José Araújo")).toBeNull();
  });

  it("e-mail inválido é recusado; espaços e maiúsculas são normalizados", () => {
    expect(erroEmail("maria@")).not.toBeNull();
    expect(erroEmail("maria.gmail.com")).not.toBeNull();
    expect(erroEmail("maria@gmail")).not.toBeNull();
    expect(erroEmail(" Maria@Gmail.com ")).toBeNull();
    const r = validarComprador({ nome: "Maria Silva", email: " Maria@Gmail.COM ", telefone: "(11) 91234-5678" });
    expect(r.ok && r.dados.email).toBe("maria@gmail.com");
  });

  it("telefone incompleto ou sem DDD é recusado; o servidor recebe só números", () => {
    expect(erroTelefone("91234-5678")).toMatch(/incompleto/);
    expect(erroTelefone("(11) 1234-567")).toMatch(/incompleto/);
    expect(erroTelefone("(11) 81234-5678")).toMatch(/começa com 9/);
    expect(erroTelefone("(01) 91234-5678")).toMatch(/DDD/);
    expect(erroTelefone("(11) 91234-5678")).toBeNull();
    expect(erroTelefone("(11) 3456-7890")).toBeNull();
    expect(erroTelefone("+55 11 91234-5678")).toBeNull();
    const r = validarComprador({ nome: "Maria Silva", email: "maria@gmail.com", telefone: "(11) 91234-5678" });
    expect(r.ok && r.dados.telefone).toBe("11912345678");
  });

  it("máscara do telefone enquanto digita", () => {
    expect(mascararTelefone("11")).toBe("(11");
    expect(mascararTelefone("1191234")).toBe("(11) 91234");
    expect(mascararTelefone("11912345678")).toBe("(11) 91234-5678");
    expect(mascararTelefone("1134567890")).toBe("(11) 3456-7890");
  });

  it("devolve todos os erros de uma vez para mostrar em cada campo", () => {
    const r = validarComprador({ nome: "Ana", email: "x", telefone: "11" });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(Object.keys(r.erros).sort()).toEqual(["email", "nome", "telefone"]);
  });

  it("separa primeiro nome e sobrenome para o Mercado Pago", () => {
    expect(partesDoNome(" Maria  da Silva ")).toEqual({ primeiro: "Maria", sobrenome: "da Silva" });
  });
});
