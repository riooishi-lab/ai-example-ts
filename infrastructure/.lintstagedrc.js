module.exports = {
  "*.tf*": () => [
    "terraform fmt",
    "terraform validate",
    "tflint --chdir=.",
  ],
};
