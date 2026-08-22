window.__ModuleLoader__.load({ id: "lawyer-sidebar", factory: (require) => { var module = { exports: {} }; var exports = module.exports;
"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// lawyer-dsh/plugins/lawyer-sidebar/src/client/index.ts
var index_exports = {};
__export(index_exports, {
  apply: () => apply,
  inject: () => inject
});
module.exports = __toCommonJS(index_exports);

// lawyer-dsh/plugins/lawyer-sidebar/src/client/prompt.ts
var CONTRACT_REVIEW_PROMPT = `\u8BF7\u4F5C\u4E3A\u4E13\u4E1A\u5F8B\u5E08\uFF0C\u5BF9\u5408\u540C\u6587\u672C\u8FDB\u884C\u5168\u9762\u5BA1\u6838\u3002\u8BF7\u6309\u4EE5\u4E0B\u6846\u67B6\u8F93\u51FA\u5BA1\u6838\u610F\u89C1\uFF1A

\u4E00\u3001\u5408\u540C\u4E3B\u4F53\u4E0E\u6548\u529B
- \u4E3B\u4F53\u8D44\u683C\u3001\u6388\u6743\u8303\u56F4\u3001\u7B7E\u7AE0\u8981\u4EF6
- \u6548\u529B\u98CE\u9669\uFF08\u683C\u5F0F\u6761\u6B3E\u3001\u663E\u5931\u516C\u5E73\u3001\u8FDD\u53CD\u5F3A\u5236\u6027\u89C4\u5B9A\u7B49\uFF09

\u4E8C\u3001\u6838\u5FC3\u5546\u4E1A\u6761\u6B3E
- \u6807\u7684\u3001\u4EF7\u6B3E/\u62A5\u916C\u3001\u652F\u4ED8\u65B9\u5F0F\u4E0E\u671F\u9650
- \u5C65\u884C\u671F\u9650\u3001\u5C65\u884C\u65B9\u5F0F\u3001\u9A8C\u6536\u6807\u51C6
- \u8FDD\u7EA6\u8D23\u4EFB\u3001\u5B9A\u91D1/\u8FDD\u7EA6\u91D1\u6761\u6B3E

\u4E09\u3001\u98CE\u9669\u5206\u914D\u6761\u6B3E
- \u4FDD\u5BC6\u4E49\u52A1\u3001\u77E5\u8BC6\u4EA7\u6743\u5F52\u5C5E
- \u4E0D\u53EF\u6297\u529B\u4E0E\u60C5\u52BF\u53D8\u66F4
- \u4E89\u8BAE\u89E3\u51B3\u65B9\u5F0F\u4E0E\u7BA1\u8F96\u7EA6\u5B9A

\u56DB\u3001\u6587\u672C\u8D28\u91CF
- \u6761\u6B3E\u95F4\u51B2\u7A81\u4E0E\u6B67\u4E49\u8868\u8FF0
- \u7B7E\u7F72\u7A0B\u5E8F\u5B8C\u6574\u6027\uFF08\u65E5\u671F\u3001\u4EFD\u6570\u3001\u9644\u4EF6\u6E05\u5355\uFF09

\u8BF7\u5148\u901A\u8BFB\u5168\u6587\uFF0C\u7136\u540E\u7528\u8868\u683C\u5217\u51FA\u98CE\u9669\u70B9\uFF08\u6761\u6B3E\u4F4D\u7F6E\uFF5C\u98CE\u9669\u63CF\u8FF0\uFF5C\u98CE\u9669\u7B49\u7EA7\uFF5C\u4FEE\u6539\u5EFA\u8BAE\uFF09\uFF0C\u6700\u540E\u7ED9\u51FA\u6574\u4F53\u7ED3\u8BBA\u4E0E\u662F\u5426\u5EFA\u8BAE\u7B7E\u7F72\u3002\u82E5\u6211\u5C1A\u672A\u63D0\u4F9B\u5408\u540C\u6587\u672C\uFF0C\u8BF7\u5148\u63D0\u793A\u6211\u63D0\u4F9B\u3002`;

// lawyer-dsh/plugins/lawyer-sidebar/src/client/LawyerSidebar.tsx
var import_jsx_runtime = require("react/jsx-runtime");
function ContractIcon({ size = 18 }) {
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", { width: size, height: size, viewBox: "0 0 16 16", fill: "none", "aria-hidden": "true", focusable: "false", children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      "path",
      {
        d: "M9.5 1.5H4.25C3.56 1.5 3 2.06 3 2.75v10.5c0 .69.56 1.25 1.25 1.25h7.5c.69 0 1.25-.56 1.25-1.25V6L9.5 1.5Z",
        stroke: "currentColor",
        strokeWidth: "1.1",
        strokeLinejoin: "round"
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M9.5 1.5V6H13", stroke: "currentColor", strokeWidth: "1.1", strokeLinejoin: "round" }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M5.5 8.5h5M5.5 11h3.5", stroke: "currentColor", strokeWidth: "1.1", strokeLinecap: "round" })
  ] });
}
function SearchIcon({ size = 18 }) {
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", { width: size, height: size, viewBox: "0 0 16 16", fill: "none", "aria-hidden": "true", focusable: "false", children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", { cx: "7", cy: "7", r: "4.5", stroke: "currentColor", strokeWidth: "1.1" }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M10.5 10.5 14 14", stroke: "currentColor", strokeWidth: "1.1", strokeLinecap: "round" })
  ] });
}
function PenIcon({ size = 18 }) {
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", { width: size, height: size, viewBox: "0 0 16 16", fill: "none", "aria-hidden": "true", focusable: "false", children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      "path",
      {
        d: "M3 13.2l.8-3.2 8.3-8.3a1.5 1.5 0 0 1 2.1 2.1L5.9 12.1 3 13.2Z",
        stroke: "currentColor",
        strokeWidth: "1.1",
        strokeLinejoin: "round"
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M10.5 3.2l2.1 2.1", stroke: "currentColor", strokeWidth: "1.1" })
  ] });
}
function WatermarkIcon({ size = 18 }) {
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", { width: size, height: size, viewBox: "0 0 16 16", fill: "none", "aria-hidden": "true", focusable: "false", children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      "path",
      {
        d: "M9.5 1.5H4.25C3.56 1.5 3 2.06 3 2.75v10.5c0 .69.56 1.25 1.25 1.25h7.5c.69 0 1.25-.56 1.25-1.25V6L9.5 1.5Z",
        stroke: "currentColor",
        strokeWidth: "1.1",
        strokeLinejoin: "round"
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M9.5 1.5V6H13", stroke: "currentColor", strokeWidth: "1.1", strokeLinejoin: "round" }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M5.2 10c.8-.9 1.7-.9 2.5 0s1.7.9 2.5 0", stroke: "currentColor", strokeWidth: "1.1", strokeLinecap: "round" })
  ] });
}
function LawyerSidebar({ startContractReview }) {
  const tabs = [
    { id: "contract-review", label: "\u5408\u540C\u5BA1\u6838", icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ContractIcon, {}), disabled: false, onClick: startContractReview },
    { id: "case-analysis", label: "\u6848\u4EF6\u5206\u6790", icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SearchIcon, {}), disabled: true },
    { id: "doc-generation", label: "\u6848\u4EF6\u6587\u4E66\u751F\u6210", icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PenIcon, {}), disabled: true },
    { id: "pdf-watermark", label: "PDF \u53BB\u6C34\u5370", icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WatermarkIcon, {}), disabled: true }
  ];
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", { className: "lawyer-sidebar", "aria-label": "\u5F8B\u5E08\u5DE5\u4F5C\u53F0", children: tabs.map((tab) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
    "button",
    {
      type: "button",
      className: "lawyer-sidebar__tab",
      disabled: tab.disabled,
      onClick: tab.onClick,
      title: tab.disabled ? "\u529F\u80FD\u5F00\u53D1\u4E2D" : "\u5408\u540C\u5BA1\u6838\uFF1A\u5411\u5F53\u524D\u5BF9\u8BDD\u6CE8\u5165\u5408\u540C\u5BA1\u6838\u6307\u4EE4",
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "lawyer-sidebar__tab-icon", children: tab.icon }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "lawyer-sidebar__tab-label", children: tab.label })
      ]
    },
    tab.id
  )) });
}

// lawyer-dsh/plugins/lawyer-sidebar/src/client/index.ts
var inject = ["slots", "sessions", "workspaces"];
var STYLE_TAG = "lawyer-sidebar/entry";
var ENTRY_CSS = `
.lawyer-sidebar {
  position: fixed;
  right: 0;
  top: 0;
  bottom: 0;
  width: 200px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 14px 10px;
  box-sizing: border-box;
  background: var(--dsw-alias-button-elevated-fill);
  border-left: 1px solid var(--dsw-alias-border-l2);
  box-shadow: -4px 0 16px rgb(0 0 0 / 6%);
  font-family: inherit;
}
.lawyer-sidebar__tab {
  display: flex;
  align-items: center;
  gap: 10px;
  height: 42px;
  padding: 0 12px;
  border: none;
  border-radius: 10px;
  background: transparent;
  color: var(--dsw-alias-label-primary);
  font-size: 14px;
  font-weight: 500;
  text-align: left;
  cursor: pointer;
  font-family: inherit;
  transition: background-color 120ms ease;
}
.lawyer-sidebar__tab:not(:disabled):hover {
  background: var(--dsw-alias-interactive-bg-hover);
}
.lawyer-sidebar__tab:not(:disabled):active {
  opacity: 0.85;
}
.lawyer-sidebar__tab:disabled {
  color: var(--dsw-alias-label-tertiary);
  cursor: not-allowed;
  opacity: 0.6;
}
.lawyer-sidebar__tab-icon {
  flex: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
}
.lawyer-sidebar__tab-label {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
`;
function injectStyles() {
  const marker = `style[data-plugin-css="${STYLE_TAG}"]`;
  if (document.querySelector(marker) !== null) return;
  const tag = document.createElement("style");
  tag.dataset.plugin = "lawyer-sidebar";
  tag.dataset.pluginCss = STYLE_TAG;
  tag.textContent = ENTRY_CSS;
  document.head.appendChild(tag);
}
var NEW_SESSION_TIMEOUT_MS = 15e3;
function apply(ctx) {
  injectStyles();
  const sendPrompt = async (session) => {
    const result = await session.prompt([{ type: "text", text: CONTRACT_REVIEW_PROMPT }], "queue");
    if (!result.ok) {
      console.error(
        `[lawyer-sidebar] \u6CE8\u5165\u5408\u540C\u5BA1\u6838\u6307\u4EE4\u5931\u8D25\uFF1A${result.error.code} ${result.error.message}`
      );
    }
  };
  const startContractReview = () => {
    const current = ctx.sessions.list.getSnapshot().current;
    if (current !== void 0) {
      const session = ctx.sessions.binding(current)?.session;
      if (session !== void 0) {
        void sendPrompt(session);
        return;
      }
    }
    if (ctx.workspaces.list.getSnapshot().items.length === 0) {
      console.warn("[lawyer-sidebar] \u6682\u65E0\u5DE5\u4F5C\u533A\uFF0C\u65E0\u6CD5\u53D1\u8D77\u5408\u540C\u5BA1\u6838\u2014\u2014\u8BF7\u5148\u521B\u5EFA\u5DE5\u4F5C\u533A");
      return;
    }
    let settled = false;
    const unsubscribe = ctx.sessions.list.subscribe(() => {
      if (settled) return;
      const id = ctx.sessions.list.getSnapshot().current;
      if (id === void 0) return;
      settled = true;
      clearTimeout(timer);
      unsubscribe();
      const session = ctx.sessions.binding(id)?.session;
      if (session !== void 0) void sendPrompt(session);
    });
    const timer = window.setTimeout(() => {
      if (settled) return;
      settled = true;
      unsubscribe();
      console.warn("[lawyer-sidebar] \u65B0\u5EFA\u4F1A\u8BDD\u8D85\u65F6\uFF0C\u5408\u540C\u5BA1\u6838\u6307\u4EE4\u672A\u6CE8\u5165");
    }, NEW_SESSION_TIMEOUT_MS);
    ctx.workspaces.startSession();
  };
  ctx.slots.inject("shell.overlay", () => ctx.slots.register(
    {
      id: "lawyer-sidebar",
      name: "shell.overlay",
      inject: () => ({ startContractReview })
    },
    LawyerSidebar
  ));
}
return module.exports; } });
//# sourceMappingURL=client.js.map
