import next from "eslint-config-next";
import nextTs from "eslint-config-next/typescript";

const config = [
  ...next,
  ...nextTs,
  { ignores: [".next/**", "node_modules/**", "next-env.d.ts", "public/**", "prototipos/**", "pacotes/**", "aulas/**"] },
];

export default config;
