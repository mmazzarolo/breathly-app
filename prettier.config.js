module.exports = {
  printWidth: 100,
  importOrder: ["<THIRD_PARTY_MODULES>", "^@breathly/(.*)$", "^[./]"],
  plugins: ["@trivago/prettier-plugin-sort-imports"],
};
