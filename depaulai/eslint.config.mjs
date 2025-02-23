import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

// Fixed the syntax here to use an object instead of an array
const eslintConfig = {
  extends: [
    ...compat.extends("next/core-web-vitals", "next/typescript"),
  ],
  rules: {
    "@typescript-eslint/no-require-imports": "off",
  },
};

export default eslintConfig;
