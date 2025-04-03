module.exports = {
  extends: [
    // Your other extends...
  ],
  overrides: [
    {
      files: ["*.css"],
      rules: {
        "no-unknown-at-rules": "off",
        'no-undef': 'off',
        'no-unknown-at-rules': 'off'
      }
    }
  ],
  // Add this section to help ESLint know about your environment
  env: {
    browser: true,
    node: true,
    es6: true
  }
};
