const fs = require("fs");
const path = require("path");
const vm = require("vm");

const PROJECT_ROOT = path.resolve(__dirname, "..", "..");

function createBrowserSandbox(overrides = {}) {
  const storage = {};
  const sandbox = {
    console,
    Math,
    Date,
    setTimeout,
    clearTimeout,
    localStorage: {
      getItem: key => (key in storage ? storage[key] : null),
      setItem: (key, value) => {
        storage[key] = String(value);
      },
      removeItem: key => {
        delete storage[key];
      }
    },
    navigator: { userAgent: "Mozilla/5.0 (Windows NT 10.0)" },
    location: { protocol: "file:", origin: "null" },
    ...overrides
  };
  sandbox.window = sandbox;
  vm.createContext(sandbox);
  return { sandbox, storage };
}

function loadAppScript(sandbox, relPath) {
  const fullPath = path.join(PROJECT_ROOT, relPath);
  const code = fs.readFileSync(fullPath, "utf-8");
  vm.runInContext(code, sandbox, { filename: relPath });
}

module.exports = {
  PROJECT_ROOT,
  createBrowserSandbox,
  loadAppScript
};
