window.__ModuleLoader__.load({ id: "lawyer-wizard", factory: (require) => { var module = { exports: {} }; var exports = module.exports;
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

// plugins/lawyer-wizard/src/client/index.ts
var index_exports = {};
__export(index_exports, {
  apply: () => apply,
  inject: () => inject
});
module.exports = __toCommonJS(index_exports);

// plugins/lawyer-wizard/src/client/store.ts
var INITIAL = { phase: "boot", value: void 0, showWizard: false, managerOpen: false };
function createWizardStore() {
  let snapshot = INITIAL;
  const listeners = /* @__PURE__ */ new Set();
  return {
    /** 当前快照（引用稳定直到下一次 setState）。 */
    getSnapshot() {
      return snapshot;
    },
    /** 订阅快照替换。 */
    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    /** 合并更新快照并通知（值未变时跳过通知）。 */
    setState(patch) {
      const next = { ...snapshot, ...patch };
      if (next === snapshot) return;
      snapshot = next;
      for (const listener of listeners) listener();
    }
  };
}

// plugins/lawyer-wizard/src/client/WizardRoot.tsx
var import_react5 = require("react");

// plugins/lawyer-wizard/src/client/EntryManager.tsx
var import_react3 = require("react");

// plugins/lawyer-wizard/src/client/config.ts
var BUILTIN_ENTRY_IDS = ["contract-review", "case-analysis", "doc-generation"];
var BUILTIN_ENTRY_META = {
  "contract-review": {
    label: "\u5408\u540C\u5BA1\u6838",
    description: "\u4E0A\u4F20\u5408\u540C\uFF0C\u8F93\u51FA\u5BA1\u6838\u610F\u89C1\u4E0E\u4FEE\u8BA2\u7559\u75D5\u7A3F"
  },
  "case-analysis": {
    label: "\u6848\u4EF6\u5206\u6790",
    description: "\u4E8B\u5B9E\u68B3\u7406 / \u4E89\u8BAE\u7126\u70B9 / \u8BC1\u636E\u5BA1\u67E5 / \u98CE\u9669\u8BC4\u4F30"
  },
  "doc-generation": {
    label: "\u6848\u4EF6\u6587\u4E66\u751F\u6210",
    description: "\u8D77\u8BC9\u72B6 / \u7B54\u8FA9\u72B6 / \u4EE3\u7406\u8BCD / \u6CD5\u5F8B\u610F\u89C1\u4E66"
  }
};
var FIELD_TYPES = ["text", "textarea", "select", "radio", "checkbox", "files"];
var FIELD_TYPE_LABELS = {
  text: "\u5355\u884C\u6587\u672C",
  textarea: "\u591A\u884C\u6587\u672C",
  select: "\u4E0B\u62C9\u9009\u62E9",
  radio: "\u5355\u9009",
  checkbox: "\u591A\u9009",
  files: "\u6587\u4EF6/\u6750\u6599"
};
var OPTIONAL_TYPES = ["select", "radio", "checkbox"];
var SUBAGENT_PLAN_LABELS = {
  contractReview: "\u5408\u540C\u5BA1\u6838\u53E3\u5F84\uFF08\u4E3B\u4F53\u6388\u6743 / \u6CD5\u89C4\u6548\u529B / \u7C7B\u6848 / \u884C\u4E1A\u76D1\u7BA1\uFF09",
  caseAnalysis: "\u6848\u4EF6\u5206\u6790\u53E3\u5F84\uFF08\u8BF7\u6C42\u6743\u57FA\u7840 / \u7C7B\u6848 / \u7A0B\u5E8F\u98CE\u9669 / \u5BF9\u65B9\u4E3B\u4F53\uFF09",
  docGeneration: "\u6587\u4E66\u751F\u6210\u53E3\u5F84\uFF08\u6CD5\u6761\u6838\u9A8C / \u7C7B\u6848\u8981\u65E8 / \u5BF9\u65B9\u4E3B\u4F53\uFF09",
  none: "\u4E0D\u4F7F\u7528\u5B50\u4EE3\u7406\uFF08\u5168\u90E8\u5728\u4E3B\u4F1A\u8BDD\u5B8C\u6210\uFF09"
};
var FALLBACK_ENTRIES = BUILTIN_ENTRY_IDS.map((id) => ({ kind: "builtin", id }));
function generateCustomEntryId() {
  return `custom-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

// plugins/lawyer-wizard/src/client/CustomEntryForm.tsx
var import_react2 = require("react");

// plugins/lawyer-wizard/src/client/legalDomains.ts
var LEGAL_DOMAINS = [
  {
    domain: "commercial-legal",
    adapter: "chinese-legal-commercial",
    label: "\u5546\u4E8B\u5408\u540C",
    skills: [
      "amendment-history",
      "cold-start-interview",
      "customize",
      "escalation-flagger",
      "matter-workspace",
      "nda-review",
      "renewal-tracker",
      "review",
      "review-proposals",
      "saas-msa-review",
      "stakeholder-summary",
      "vendor-agreement-review"
    ]
  },
  {
    domain: "litigation-legal",
    adapter: "chinese-legal-litigation",
    label: "\u8BC9\u8BBC\u4EF2\u88C1",
    skills: [
      "brief-section-drafter",
      "chronology",
      "claim-chart",
      "cold-start-interview",
      "customize",
      "demand-draft",
      "demand-intake",
      "demand-received",
      "deposition-prep",
      "legal-hold",
      "matter-briefing",
      "matter-close",
      "matter-intake",
      "matter-update",
      "matter-workspace",
      "oc-status",
      "portfolio-status",
      "privilege-log-review",
      "subpoena-triage"
    ]
  },
  {
    domain: "corporate-legal",
    adapter: "chinese-legal-corporate",
    label: "\u516C\u53F8\u4E0E\u5E76\u8D2D",
    skills: [
      "ai-tool-handoff",
      "board-minutes",
      "closing-checklist",
      "cold-start-interview",
      "customize",
      "deal-team-summary",
      "diligence-issue-extraction",
      "entity-compliance",
      "integration-management",
      "material-contract-schedule",
      "matter-workspace",
      "tabular-review",
      "written-consent"
    ]
  },
  {
    domain: "employment-legal",
    adapter: "chinese-legal-employment",
    label: "\u52B3\u52A8\u7528\u5DE5",
    skills: [
      "cold-start-interview",
      "customize",
      "expansion-kickoff",
      "expansion-update",
      "handbook-updates",
      "hiring-review",
      "internal-investigation",
      "international-expansion",
      "investigation-add",
      "investigation-memo",
      "investigation-open",
      "investigation-query",
      "investigation-summary",
      "leave-tracker",
      "log-leave",
      "matter-workspace",
      "policy-drafting",
      "termination-review",
      "wage-hour-qa",
      "worker-classification"
    ]
  },
  {
    domain: "ip-legal",
    adapter: "chinese-legal-ip",
    label: "\u77E5\u8BC6\u4EA7\u6743",
    skills: [
      "cease-desist",
      "clearance",
      "cold-start-interview",
      "customize",
      "fto-triage",
      "infringement-triage",
      "invention-intake",
      "ip-clause-review",
      "matter-workspace",
      "oss-review",
      "portfolio",
      "takedown"
    ]
  },
  {
    domain: "privacy-legal",
    adapter: "chinese-legal-privacy",
    label: "\u6570\u636E\u5408\u89C4\u4E0E\u9690\u79C1",
    skills: [
      "cold-start-interview",
      "customize",
      "dpa-review",
      "dsar-response",
      "matter-workspace",
      "pia-generation",
      "policy-monitor",
      "reg-gap-analysis",
      "use-case-triage"
    ]
  },
  {
    domain: "product-legal",
    adapter: "chinese-legal-product",
    label: "\u4EA7\u54C1\u4E0E\u8425\u9500\u5408\u89C4",
    skills: [
      "cold-start-interview",
      "customize",
      "feature-risk-assessment",
      "is-this-a-problem",
      "launch-review",
      "marketing-claims-review",
      "matter-workspace"
    ]
  },
  {
    domain: "regulatory-legal",
    adapter: "chinese-legal-regulatory",
    label: "\u76D1\u7BA1\u5408\u89C4",
    skills: [
      "cold-start-interview",
      "comments",
      "customize",
      "gap-surfacer",
      "gaps",
      "matter-workspace",
      "policy-diff",
      "policy-redraft",
      "reg-feed-watcher"
    ]
  },
  {
    domain: "ai-governance-legal",
    adapter: "chinese-legal-ai-governance",
    label: "AI \u6CBB\u7406",
    skills: [
      "ai-inventory",
      "aia-generation",
      "cold-start-interview",
      "customize",
      "matter-workspace",
      "policy-monitor",
      "policy-starter",
      "reg-gap-analysis",
      "use-case-triage",
      "vendor-ai-review"
    ]
  },
  {
    domain: "criminal-legal",
    adapter: "chinese-legal-criminal",
    label: "\u5211\u4E8B\u8FA9\u62A4\u4E0E\u5408\u89C4",
    skills: [
      "bail-application",
      "case-analysis",
      "cold-start-interview",
      "compliance-non-prosecution",
      "customize",
      "defense-strategy",
      "matter-workspace"
    ]
  },
  {
    domain: "law-student",
    adapter: "chinese-legal-law-student",
    label: "\u6CD5\u5B66\u5B66\u4E60\u4E0E\u6CD5\u8003",
    skills: [
      "bar-prep-questions",
      "case-brief",
      "cold-call-prep",
      "cold-start-interview",
      "customize",
      "exam-forecast",
      "flashcards",
      "irac-practice",
      "legal-writing",
      "outline-builder",
      "session",
      "socratic-drill",
      "study-plan"
    ]
  },
  {
    domain: "legal-clinic",
    adapter: "chinese-legal-clinic",
    label: "\u6CD5\u5F8B\u8BCA\u6240",
    skills: [
      "build-guide",
      "client-comms-log",
      "client-intake",
      "client-letter",
      "cold-start-interview",
      "customize",
      "deadlines",
      "draft",
      "form-generation",
      "memo",
      "plain-language-letters",
      "ramp",
      "research-start",
      "semester-handoff",
      "status",
      "supervisor-review-queue"
    ]
  },
  {
    domain: "legal-builder-hub",
    adapter: "chinese-legal-builder-hub",
    label: "\u6CD5\u5F8B\u6280\u80FD\u8FD0\u8425",
    skills: [
      "auto-updater",
      "cold-start-interview",
      "customize",
      "disable",
      "registry-browser",
      "related-skills-surfacer",
      "skill-installer",
      "skill-manager",
      "skills-qa",
      "uninstall"
    ]
  }
];
var LEGAL_REFERENCES = [
  { path: "references/agentic-search-routing.md", label: "\u5B50\u4EE3\u7406\u641C\u7D22\u8DEF\u7531\uFF08C1/C2/C3\uFF09" },
  { path: "references/contract-review-quality-gates.md", label: "\u5408\u540C\u5BA1\u6838\u8D28\u91CF\u95E8\u7981" },
  { path: "references/knowledge-base-crossref.md", label: "\u77E5\u8BC6\u5E93\u4EA4\u53C9\u5F15\u7528\u56DB\u6B65\u534F\u8BAE" },
  { path: "references/due-diligence-workflow.md", label: "\u5C3D\u804C\u8C03\u67E5\u5DE5\u4F5C\u6D41" },
  { path: "references/trial-preparation-framework.md", label: "\u5EAD\u524D\u51C6\u5907\u6846\u67B6" },
  { path: "references/consulting-workflow.md", label: "\u54A8\u8BE2\u5DE5\u4F5C\u6D41" },
  { path: "references/company-profile-template.md", label: "\u4F01\u4E1A\u753B\u50CF\u6A21\u677F" },
  { path: "references/dashboard-template.md", label: "\u53F0\u8D26\u770B\u677F\u6A21\u677F" },
  { path: "references/pricing-proposal-framework.md", label: "\u62A5\u4EF7\u65B9\u6848\u6846\u67B6" }
];
function findLegalDomain(domain) {
  return LEGAL_DOMAINS.find((item) => item.domain === domain);
}

// plugins/lawyer-wizard/src/client/SkillField.tsx
var import_react = require("react");
var import_jsx_runtime = require("react/jsx-runtime");
function SkillField({ value, onChange, listInstalledSkills, placeholder }) {
  const [skills, setSkills] = (0, import_react.useState)(void 0);
  const listId = (0, import_react.useId)();
  (0, import_react.useEffect)(() => {
    let cancelled = false;
    void listInstalledSkills().then((entries) => {
      if (!cancelled) setSkills(entries);
    });
    return () => {
      cancelled = true;
    };
  }, [listInstalledSkills]);
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      "input",
      {
        className: "lawyer-wizard__input",
        type: "text",
        list: skills === void 0 || skills.length === 0 ? void 0 : listId,
        value,
        placeholder: placeholder ?? "\u6280\u80FD\u540D\uFF0C\u5982 due-diligence",
        onChange: (event) => {
          onChange(event.target.value);
        }
      }
    ),
    skills !== void 0 && skills.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("datalist", { id: listId, children: skills.map((skill) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: skill.name, children: skill.description }, skill.name)) })
  ] });
}

// plugins/lawyer-wizard/src/client/CustomEntryForm.tsx
var import_jsx_runtime2 = require("react/jsx-runtime");
var SKILL_NAME_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
var FIELD_ID_PATTERN = /^[A-Za-z0-9_-]+$/;
var ICON_OPTIONS = [
  { value: "spark", label: "\u95EA\u7535\uFF08\u9ED8\u8BA4\uFF09" },
  { value: "contract", label: "\u5408\u540C" },
  { value: "search", label: "\u68C0\u7D22" },
  { value: "pen", label: "\u6587\u4E66" },
  { value: "scale", label: "\u5929\u5E73" },
  { value: "shield", label: "\u5408\u89C4\u98CE\u63A7" },
  { value: "folder", label: "\u5377\u5B97\u6750\u6599" },
  { value: "chart", label: "\u5206\u6790\u53F0\u8D26" },
  { value: "chat", label: "\u54A8\u8BE2\u6C9F\u901A" },
  { value: "clock", label: "\u671F\u9650\u76D1\u63A7" }
];
var FIELD_TYPE_OPTIONS = FIELD_TYPES.map((type) => ({
  value: type,
  label: FIELD_TYPE_LABELS[type]
}));
var SUBAGENT_OPTIONS = Object.keys(SUBAGENT_PLAN_LABELS).map((id) => ({
  value: id,
  label: SUBAGENT_PLAN_LABELS[id]
}));
var MCP_OPTIONS = [
  { value: "none", label: "\u4E0D\u6307\u5B9A\uFF08\u7531\u6280\u80FD\u6D41\u7A0B\u81EA\u884C\u51B3\u5B9A\uFF09" },
  { value: "yuandian", label: "\u5143\u5178 \xB7 \u6CD5\u89C4\u68C0\u7D22\uFF08lawyer preset \u5185\u7F6E\uFF09" },
  { value: "custom", label: "\u81EA\u5B9A\u4E49\u8BF4\u660E\u2026" }
];
function draftOf(entry) {
  const agentPreset = entry?.agentPreset ?? "lawyer";
  return {
    label: entry?.label ?? "",
    hint: entry?.hint ?? "",
    icon: entry?.icon ?? "spark",
    presetMode: agentPreset === "" ? "none" : agentPreset === "lawyer" ? "lawyer" : "custom",
    presetCustom: agentPreset !== "" && agentPreset !== "lawyer" ? agentPreset : "",
    description: entry?.description ?? "",
    purpose: entry?.purpose ?? "",
    template: entry?.template ?? "",
    fields: (entry?.fields ?? []).map((field) => ({ ...field })),
    skill: entry?.skill ?? "",
    skillDraft: "",
    extraSkills: [...entry?.extraSkills ?? []],
    legalEnabled: entry?.legal !== void 0,
    legalDomain: entry?.legal?.domain ?? "commercial-legal",
    legalSkills: [...entry?.legal?.skills ?? []],
    legalSubagent: entry?.legal?.subagent ?? "none",
    legalReferences: [...entry?.legal?.references ?? []],
    mcpPreset: entry?.mcp?.preset ?? "none",
    mcpNote: entry?.mcp?.preset === "custom" ? entry.mcp.note ?? "" : ""
  };
}
function nextFieldId(fields) {
  let index = fields.length + 1;
  const used = new Set(fields.map((field) => field.id));
  while (used.has(`field${index}`)) index += 1;
  return `field${index}`;
}
function parseOptions(raw) {
  const seen = /* @__PURE__ */ new Set();
  const options = [];
  for (const line of raw.split("\n")) {
    const trimmed = line.trim();
    if (trimmed === "" || seen.has(trimmed)) continue;
    seen.add(trimmed);
    options.push(trimmed);
  }
  return options;
}
function optionsToText(options) {
  return (options ?? []).join("\n");
}
function CustomEntryForm({
  entry,
  listInstalledSkills,
  onSubmit,
  onCancel,
  submitLabel = "\u521B\u5EFA\u529F\u80FD"
}) {
  const [draft, setDraft] = (0, import_react2.useState)(() => draftOf(entry));
  const [error, setError] = (0, import_react2.useState)("");
  const [optionsDraft, setOptionsDraft] = (0, import_react2.useState)(
    () => Object.fromEntries((entry?.fields ?? []).map((field, index) => [index, optionsToText(field.options)]))
  );
  const [installedSkills, setInstalledSkills] = (0, import_react2.useState)(void 0);
  (0, import_react2.useEffect)(() => {
    let cancelled = false;
    void listInstalledSkills().then((entries) => {
      if (!cancelled) setInstalledSkills(entries);
    });
    return () => {
      cancelled = true;
    };
  }, [listInstalledSkills]);
  const patch = (partial) => {
    setDraft((previous) => ({ ...previous, ...partial }));
  };
  const selectableExtraSkills = (installedSkills ?? []).filter(
    (skill) => skill.name !== draft.skill && !draft.extraSkills.includes(skill.name)
  );
  const domainMeta = findLegalDomain(draft.legalDomain);
  const addField = () => {
    setDraft((previous) => ({
      ...previous,
      fields: [...previous.fields, {
        id: nextFieldId(previous.fields),
        label: "\u65B0\u5B57\u6BB5",
        type: "text"
      }]
    }));
  };
  const updateField = (index, partial) => {
    setDraft((previous) => {
      const fields = previous.fields.map((field, i) => i === index ? { ...field, ...partial } : field);
      return { ...previous, fields };
    });
  };
  const removeField = (index) => {
    setOptionsDraft((previous) => {
      const next = {};
      for (const [key, value] of Object.entries(previous)) {
        const numeric = Number(key);
        if (numeric < index) next[numeric] = value;
        else if (numeric > index) next[numeric - 1] = value;
      }
      return next;
    });
    setDraft((previous) => ({ ...previous, fields: previous.fields.filter((_, i) => i !== index) }));
  };
  const moveField = (index, delta) => {
    const target = index + delta;
    if (target < 0 || target >= draft.fields.length) return;
    setOptionsDraft((previous) => {
      const next = { ...previous };
      const a = next[index] ?? "";
      const b = next[target] ?? "";
      next[index] = b;
      next[target] = a;
      return next;
    });
    setDraft((previous) => {
      const fields = [...previous.fields];
      const [moved] = fields.splice(index, 1);
      fields.splice(target, 0, moved);
      return { ...previous, fields };
    });
  };
  const switchDomain = (domain) => {
    const meta = findLegalDomain(domain);
    patch({
      legalDomain: domain,
      legalSkills: meta === void 0 ? [] : draft.legalSkills.filter((name) => meta.skills.includes(name))
    });
  };
  const toggleLegalSkill = (name) => {
    patch({
      legalSkills: draft.legalSkills.includes(name) ? draft.legalSkills.filter((item) => item !== name) : [...draft.legalSkills, name]
    });
  };
  const toggleReference = (path) => {
    patch({
      legalReferences: draft.legalReferences.includes(path) ? draft.legalReferences.filter((item) => item !== path) : [...draft.legalReferences, path]
    });
  };
  const unknownPlaceholders = () => {
    const known = new Set(draft.fields.map((field) => field.id));
    const unknown = [];
    for (const match of draft.template.matchAll(/\{\{\s*([^}\s]+)\s*\}\}/gu)) {
      const key = match[1];
      if (key !== void 0 && !known.has(key) && !unknown.includes(key)) unknown.push(key);
    }
    return unknown;
  };
  const submit = () => {
    const label = draft.label.trim();
    const skill = draft.skill.trim().toLowerCase().replace(/\s+/g, "-");
    if (label === "") {
      setError("\u8BF7\u586B\u5199\u529F\u80FD\u540D\u79F0");
      return;
    }
    if (!SKILL_NAME_PATTERN.test(skill)) {
      setError("\u4E3B\u6280\u80FD\u540D\u9700\u4E3A\u5C0F\u5199 kebab-case\uFF08\u5982 due-diligence\uFF09\uFF0C\u53EF\u5728\u5DE6\u4FA7\u5BF9\u8BDD\u91CC\u8F93\u5165 / \u67E5\u770B\u53EF\u7528\u6280\u80FD");
      return;
    }
    const seenField = /* @__PURE__ */ new Set();
    const fields = [];
    for (let index = 0; index < draft.fields.length; index += 1) {
      const field = draft.fields[index];
      const id = field.id.trim();
      const fieldLabel = field.label.trim();
      if (!FIELD_ID_PATTERN.test(id)) {
        setError(`\u7B2C ${index + 1} \u4E2A\u5B57\u6BB5\u7684\u6807\u8BC6\u4E0D\u5408\u6CD5\uFF1A\u53EA\u80FD\u542B\u5B57\u6BCD\u3001\u6570\u5B57\u3001\u4E0B\u5212\u7EBF\u4E0E\u8FDE\u5B57\u7B26\uFF08\u5F53\u524D\u503C\u300C${field.id}\u300D\uFF09`);
        return;
      }
      if (seenField.has(id)) {
        setError(`\u5B57\u6BB5\u6807\u8BC6\u300C${id}\u300D\u91CD\u590D\uFF0C\u8BF7\u6539\u4E3A\u552F\u4E00\u503C`);
        return;
      }
      if (fieldLabel === "") {
        setError(`\u7B2C ${index + 1} \u4E2A\u5B57\u6BB5\u672A\u586B\u5199\u5C55\u793A\u540D`);
        return;
      }
      seenField.add(id);
      const options = parseOptions(optionsDraft[index] ?? "");
      if (OPTIONAL_TYPES.includes(field.type) && options.length === 0) {
        setError(`\u5B57\u6BB5\u300C${fieldLabel}\u300D\u4E3A${FIELD_TYPE_LABELS[field.type]}\uFF0C\u8BF7\u81F3\u5C11\u586B\u5199\u4E00\u4E2A\u9009\u9879\uFF08\u6BCF\u884C\u4E00\u4E2A\uFF09`);
        return;
      }
      const normalized = { id, label: fieldLabel, type: field.type };
      if (field.type !== "files") {
        if (options.length > 0) normalized.options = options;
        if (field.default !== void 0 && field.default.trim() !== "") normalized.default = field.default;
      }
      const placeholder = field.placeholder?.trim();
      const hint2 = field.hint?.trim();
      const dropHint = field.dropHint?.trim();
      if (placeholder !== void 0 && placeholder !== "") normalized.placeholder = placeholder;
      if (hint2 !== void 0 && hint2 !== "") normalized.hint = hint2;
      if (dropHint !== void 0 && dropHint !== "") normalized.dropHint = dropHint;
      fields.push(normalized);
    }
    const unknown = unknownPlaceholders();
    if (unknown.length > 0) {
      setError(`\u63D0\u793A\u8BCD\u6A21\u677F\u5F15\u7528\u4E86\u672A\u5B9A\u4E49\u7684\u5B57\u6BB5\uFF1A${unknown.map((key) => `{{${key}}}`).join("\u3001")}`);
      return;
    }
    let legal;
    if (draft.legalEnabled) {
      const meta = findLegalDomain(draft.legalDomain);
      if (meta === void 0) {
        setError("\u8BF7\u9009\u62E9 claude-for-legal-ZH \u9886\u57DF");
        return;
      }
      legal = {
        domain: meta.domain,
        adapter: meta.adapter,
        skills: draft.legalSkills.filter((name) => meta.skills.includes(name)),
        subagent: draft.legalSubagent,
        ...draft.legalReferences.length > 0 ? { references: [...draft.legalReferences] } : {}
      };
    }
    let mcp;
    if (draft.mcpPreset === "yuandian") mcp = { preset: "yuandian" };
    else if (draft.mcpPreset === "custom") {
      const note = draft.mcpNote.trim();
      if (note === "") {
        setError("\u9009\u62E9\u201C\u81EA\u5B9A\u4E49\u8BF4\u660E\u201D\u65F6\u8BF7\u586B\u5199 MCP \u5DE5\u5177\u504F\u597D\u8BF4\u660E");
        return;
      }
      mcp = { preset: "custom", note };
    }
    let agentPreset = "lawyer";
    if (draft.presetMode === "none") agentPreset = "";
    else if (draft.presetMode === "custom") {
      agentPreset = draft.presetCustom.trim();
      if (agentPreset === "") {
        setError("\u9009\u62E9\u201C\u5176\u5B83 preset\u201D\u65F6\u8BF7\u586B\u5199 preset \u540D\u79F0");
        return;
      }
    }
    const hint = draft.hint.trim();
    const description = draft.description.trim();
    const purpose = draft.purpose.trim();
    const template = draft.template.trim();
    const extraSkills = draft.extraSkills.map((name) => name.trim().toLowerCase()).filter((name, index, all) => SKILL_NAME_PATTERN.test(name) && name !== skill && all.indexOf(name) === index);
    setError("");
    onSubmit({
      kind: "custom",
      id: entry?.id ?? generateCustomEntryId(),
      label,
      skill,
      ...hint === "" ? {} : { hint },
      ...draft.icon === "spark" ? {} : { icon: draft.icon },
      ...description === "" ? {} : { description },
      ...purpose === "" ? {} : { purpose },
      ...extraSkills.length > 0 ? { extraSkills } : {},
      ...agentPreset === "" ? {} : { agentPreset },
      ...template === "" ? {} : { template },
      ...fields.length > 0 ? { fields } : {},
      ...legal === void 0 ? {} : { legal },
      ...mcp === void 0 ? {} : { mcp }
    });
  };
  const placeholders = draft.fields.map((field) => `{{${field.id}}}`);
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "lawyer-wizard__form", children: [
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("h3", { className: "lawyer-wizard__section-title", children: "\u4E00\u3001\u529F\u80FD\u5B9A\u4F4D" }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("label", { className: "lawyer-wizard__label", htmlFor: "lawyer-form-label", children: "\u529F\u80FD\u540D\u79F0 *" }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
      "input",
      {
        id: "lawyer-form-label",
        className: "lawyer-wizard__input",
        type: "text",
        placeholder: "\u5982\uFF1A\u5C3D\u804C\u8C03\u67E5\u3001\u6CD5\u5F8B\u68C0\u7D22\u62A5\u544A",
        value: draft.label,
        onChange: (event) => {
          patch({ label: event.target.value });
        }
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("label", { className: "lawyer-wizard__label", htmlFor: "lawyer-form-hint", children: "\u5361\u7247\u7B80\u8FF0" }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
      "input",
      {
        id: "lawyer-form-hint",
        className: "lawyer-wizard__input",
        type: "text",
        placeholder: "\u53F3\u4FA7\u529F\u80FD\u5361\u7247\u7B2C\u4E8C\u884C\uFF08\u7559\u7A7A\u5219\u663E\u793A /\u6280\u80FD\u540D\uFF09",
        value: draft.hint,
        onChange: (event) => {
          patch({ hint: event.target.value });
        }
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "lawyer-wizard__grid2", children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("label", { className: "lawyer-wizard__label", htmlFor: "lawyer-form-icon", children: "\u5361\u7247\u56FE\u6807" }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
          "select",
          {
            id: "lawyer-form-icon",
            className: "lawyer-wizard__select",
            value: draft.icon,
            onChange: (event) => {
              patch({ icon: event.target.value });
            },
            children: ICON_OPTIONS.map((option) => /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("option", { value: option.value, children: option.label }, option.value))
          }
        )
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("label", { className: "lawyer-wizard__label", htmlFor: "lawyer-form-preset", children: "\u542F\u52A8\u6A21\u5F0F\uFF08agent preset\uFF09" }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(
          "select",
          {
            id: "lawyer-form-preset",
            className: "lawyer-wizard__select",
            value: draft.presetMode,
            onChange: (event) => {
              patch({ presetMode: event.target.value });
            },
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("option", { value: "lawyer", children: "\u5F8B\u5E08\u6A21\u5F0F\uFF08lawyer preset\uFF0C\u542B\u5143\u5178 MCP\uFF09" }),
              /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("option", { value: "none", children: "\u4E0D\u5207\u6362\uFF08\u6CBF\u7528\u4F1A\u8BDD\u5F53\u524D preset\uFF09" }),
              /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("option", { value: "custom", children: "\u5176\u5B83 preset\u2026" })
            ]
          }
        )
      ] })
    ] }),
    draft.presetMode === "custom" && /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
      "input",
      {
        className: "lawyer-wizard__input",
        type: "text",
        placeholder: "preset \u540D\u79F0\uFF08\u9700\u5DF2\u90E8\u7F72\u5230 $DSH_HOME/.agent-presets/<\u540D\u79F0>/\uFF09",
        value: draft.presetCustom,
        onChange: (event) => {
          patch({ presetCustom: event.target.value });
        }
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("label", { className: "lawyer-wizard__label", htmlFor: "lawyer-form-description", children: "\u5165\u53E3\u8BF4\u660E" }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
      "input",
      {
        id: "lawyer-form-description",
        className: "lawyer-wizard__input",
        type: "text",
        placeholder: "\u4E00\u53E5\u8BDD\u8BF4\u660E\uFF08\u60AC\u6D6E\u63D0\u793A\u7528\uFF1B\u914D\u7F6E\u6A21\u677F\u65F6\u53EF\u4E0D\u586B\uFF09",
        value: draft.description,
        onChange: (event) => {
          patch({ description: event.target.value });
        }
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("label", { className: "lawyer-wizard__label", htmlFor: "lawyer-form-purpose", children: "\u4E3B\u8981\u529F\u80FD / \u4EFB\u52A1\u76EE\u6807" }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
      "textarea",
      {
        id: "lawyer-form-purpose",
        className: "lawyer-wizard__textarea",
        placeholder: "\u8FD9\u4E2A\u529F\u80FD\u662F\u5E72\u4EC0\u4E48\u7684\uFF1A\u8F93\u5165\u6750\u6599\u3001\u6267\u884C\u6D41\u7A0B\u3001\u671F\u671B\u4EA7\u51FA\u3002\u672A\u914D\u7F6E\u6A21\u677F\u65F6\u4F5C\u4E3A\u6307\u4EE4\u6B63\u6587",
        value: draft.purpose,
        onChange: (event) => {
          patch({ purpose: event.target.value });
        }
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("h3", { className: "lawyer-wizard__section-title", children: "\u4E8C\u3001\u63D0\u793A\u8BCD\u4E0E\u8868\u5355" }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("label", { className: "lawyer-wizard__label", htmlFor: "lawyer-form-template", children: "\u63D0\u793A\u8BCD\u6A21\u677F" }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
      "textarea",
      {
        id: "lawyer-form-template",
        className: "lawyer-wizard__textarea lawyer-wizard__textarea--tall",
        placeholder: "\u672C\u6B21\u4EFB\u52A1\uFF1A{{\u2026}}\n\n\u8981\u6C42\uFF1A\n1. \u2026\n2. \u2026",
        value: draft.template,
        onChange: (event) => {
          patch({ template: event.target.value });
        }
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("p", { className: "lawyer-wizard__hint", children: placeholders.length > 0 ? `\u53EF\u7528\u5360\u4F4D\u7B26\uFF1A${placeholders.join("\u3001")}\u2014\u2014\u53D1\u8D77\u65F6\u66FF\u6362\u4E3A\u672C\u6B21\u8868\u5355\u53D6\u503C\uFF1B\u542B\u6750\u6599\u7684\u5B57\u6BB5\u5373\u4F7F\u4E0D\u5199\u5360\u4F4D\u7B26\uFF0C\u6750\u6599\u6E05\u5355\u4E5F\u4F1A\u8FFD\u52A0\u5230\u6307\u4EE4\u672B\u5C3E\u3002` : "\u4EE5 {{\u5B57\u6BB5\u6807\u8BC6}} \u5F15\u7528\u4E0B\u65B9\u8868\u5355\u5B57\u6BB5\u7684\u53D6\u503C\uFF1B\u7559\u7A7A\u5219\u6309\u300C\u4EFB\u52A1\u76EE\u6807 + \u8865\u5145\u8BF4\u660E\u300D\u62FC\u88C5\u6307\u4EE4\u3002" }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "lawyer-wizard__fields-head", children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("span", { className: "lawyer-wizard__label", children: [
        "\u8868\u5355\u5B57\u6BB5\uFF08",
        draft.fields.length,
        "\uFF09"
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("button", { type: "button", className: "lawyer-wizard__mini-btn", onClick: addField, children: "\uFF0B \u6DFB\u52A0\u5B57\u6BB5" })
    ] }),
    draft.fields.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("p", { className: "lawyer-wizard__hint", children: "\u672A\u914D\u7F6E\u5B57\u6BB5\u65F6\uFF0C\u53D1\u8D77\u8868\u5355\u53EA\u663E\u793A\u4E00\u4E2A\u300C\u8865\u5145\u8BF4\u660E\u300D\u8F93\u5165\u6846\uFF08\u65E7\u884C\u4E3A\uFF09\u3002" }),
    draft.fields.map((field, index) => /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "lawyer-wizard__field", children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "lawyer-wizard__field-head", children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "lawyer-wizard__field-index", children: index + 1 }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
          "input",
          {
            className: "lawyer-wizard__input lawyer-wizard__input--sm",
            type: "text",
            "aria-label": `\u7B2C ${index + 1} \u4E2A\u5B57\u6BB5\u7684\u5C55\u793A\u540D`,
            placeholder: "\u5C55\u793A\u540D",
            value: field.label,
            onChange: (event) => {
              updateField(index, { label: event.target.value });
            }
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("span", { className: "lawyer-wizard__field-actions", children: [
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
            "button",
            {
              type: "button",
              className: "lawyer-wizard__row-btn",
              title: "\u4E0A\u79FB",
              disabled: index === 0,
              onClick: () => {
                moveField(index, -1);
              },
              children: "\u2191"
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
            "button",
            {
              type: "button",
              className: "lawyer-wizard__row-btn",
              title: "\u4E0B\u79FB",
              disabled: index === draft.fields.length - 1,
              onClick: () => {
                moveField(index, 1);
              },
              children: "\u2193"
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
            "button",
            {
              type: "button",
              className: "lawyer-wizard__row-btn lawyer-wizard__row-btn--danger",
              title: "\u5220\u9664\u5B57\u6BB5",
              onClick: () => {
                removeField(index);
              },
              children: "\u2715"
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "lawyer-wizard__grid2", children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("label", { className: "lawyer-wizard__field-label", htmlFor: `lawyer-field-id-${index}`, children: "\u5B57\u6BB5\u6807\u8BC6\uFF08\u6A21\u677F\u5F15\u7528\uFF09" }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
            "input",
            {
              id: `lawyer-field-id-${index}`,
              className: "lawyer-wizard__input lawyer-wizard__input--sm",
              type: "text",
              placeholder: "\u5982 material",
              value: field.id,
              onChange: (event) => {
                updateField(index, { id: event.target.value });
              }
            }
          )
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("label", { className: "lawyer-wizard__field-label", htmlFor: `lawyer-field-type-${index}`, children: "\u7C7B\u578B" }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
            "select",
            {
              id: `lawyer-field-type-${index}`,
              className: "lawyer-wizard__select lawyer-wizard__input--sm",
              value: field.type,
              onChange: (event) => {
                updateField(index, { type: event.target.value });
              },
              children: FIELD_TYPE_OPTIONS.map((option) => /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("option", { value: option.value, children: option.label }, option.value))
            }
          )
        ] })
      ] }),
      OPTIONAL_TYPES.includes(field.type) && /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("label", { className: "lawyer-wizard__field-label", htmlFor: `lawyer-field-options-${index}`, children: "\u9009\u9879\uFF08\u6BCF\u884C\u4E00\u4E2A\uFF09*" }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
          "textarea",
          {
            id: `lawyer-field-options-${index}`,
            className: "lawyer-wizard__textarea lawyer-wizard__textarea--sm",
            placeholder: "\u9009\u9879\u4E00\n\u9009\u9879\u4E8C",
            value: optionsDraft[index] ?? "",
            onChange: (event) => {
              setOptionsDraft((previous) => ({ ...previous, [index]: event.target.value }));
            }
          }
        )
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "lawyer-wizard__grid2", children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("label", { className: "lawyer-wizard__field-label", htmlFor: `lawyer-field-default-${index}`, children: "\u9ED8\u8BA4\u503C" }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
            "input",
            {
              id: `lawyer-field-default-${index}`,
              className: "lawyer-wizard__input lawyer-wizard__input--sm",
              type: "text",
              placeholder: field.type === "checkbox" ? "\u591A\u4E2A\u7528\u9017\u53F7\u5206\u9694" : "\u53EF\u9009",
              disabled: field.type === "files",
              value: field.default ?? "",
              onChange: (event) => {
                updateField(index, { default: event.target.value });
              }
            }
          )
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("label", { className: "lawyer-wizard__field-label", htmlFor: `lawyer-field-placeholder-${index}`, children: "\u5360\u4F4D\u63D0\u793A" }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
            "input",
            {
              id: `lawyer-field-placeholder-${index}`,
              className: "lawyer-wizard__input lawyer-wizard__input--sm",
              type: "text",
              placeholder: field.type === "files" ? "\u6587\u4EF6\u5B57\u6BB5\u4E0D\u652F\u6301" : "\u53EF\u9009",
              disabled: field.type === "files",
              value: field.placeholder ?? "",
              onChange: (event) => {
                updateField(index, { placeholder: event.target.value });
              }
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("label", { className: "lawyer-wizard__field-label", htmlFor: `lawyer-field-hint-${index}`, children: [
          "\u5B57\u6BB5\u8BF4\u660E",
          field.type === "files" ? " / \u62D6\u5165\u63D0\u793A" : ""
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
          "input",
          {
            id: `lawyer-field-hint-${index}`,
            className: "lawyer-wizard__input lawyer-wizard__input--sm",
            type: "text",
            placeholder: "\u6E32\u67D3\u5728\u63A7\u4EF6\u4E0B\u65B9\u7684\u8BF4\u660E\uFF08\u53EF\u9009\uFF09",
            value: field.type === "files" ? field.dropHint ?? "" : field.hint ?? "",
            onChange: (event) => {
              updateField(index, field.type === "files" ? { dropHint: event.target.value } : { hint: event.target.value });
            }
          }
        )
      ] })
    ] }, index)),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("h3", { className: "lawyer-wizard__section-title", children: "\u4E09\u3001\u6280\u80FD\u914D\u7F6E" }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("label", { className: "lawyer-wizard__label", htmlFor: "lawyer-form-skill", children: "\u4E3B\u6280\u80FD\uFF08/\u624B\u52BF\u6CE8\u5165\uFF09 *" }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
      SkillField,
      {
        value: draft.skill,
        onChange: (value) => {
          patch({ skill: value });
        },
        listInstalledSkills,
        placeholder: "\u4E3B\u6280\u80FD\u540D\uFF0C\u5982 due-diligence"
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("p", { className: "lawyer-wizard__hint", children: "\u4ECE\u5DF2\u5B89\u88C5\u6280\u80FD\u4E2D\u9009\u62E9\uFF08\u542B\u201C\u4EC5\u624B\u52BF\u201D\u6280\u80FD\uFF09\u6216\u624B\u8F93\uFF1B\u53D1\u8D77\u4EFB\u52A1\u65F6\u4EE5 /\u6280\u80FD\u540D \u624B\u52BF\u5F3A\u5236\u52A0\u8F7D\u6280\u80FD\u5168\u6587\u6267\u884C\u3002 \u5F00\u542F\u6CD5\u5F8B\u4E8B\u9879\u65F6\uFF0C\u9886\u57DF adapter \u624B\u52BF\u4F1A\u6392\u5728\u4E3B\u6280\u80FD\u4E4B\u524D\u3002" }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("label", { className: "lawyer-wizard__label", htmlFor: "lawyer-form-extra", children: "\u9644\u52A0\u6280\u80FD" }),
    draft.extraSkills.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("ul", { className: "lawyer-wizard__files", children: draft.extraSkills.map((name, index) => /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("li", { className: "lawyer-wizard__file", children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("span", { className: "lawyer-wizard__file-name", title: `\u9644\u52A0\u6280\u80FD\uFF1A${name}`, children: [
        "\u26A1 ",
        name
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
        "button",
        {
          type: "button",
          className: "lawyer-wizard__file-remove",
          "aria-label": `\u79FB\u9664 ${name}`,
          onClick: () => {
            patch({ extraSkills: draft.extraSkills.filter((_, i) => i !== index) });
          },
          children: "\u2715"
        }
      )
    ] }, name)) }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(
      "select",
      {
        id: "lawyer-form-extra",
        className: "lawyer-wizard__select",
        value: "",
        disabled: installedSkills === void 0 || selectableExtraSkills.length === 0,
        onChange: (event) => {
          const name = event.target.value;
          if (name !== "" && !draft.extraSkills.includes(name)) {
            patch({ extraSkills: [...draft.extraSkills, name] });
          }
          event.target.value = "";
        },
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("option", { value: "", children: installedSkills === void 0 ? "\u6280\u80FD\u76EE\u5F55\u52A0\u8F7D\u4E2D\u2026\uFF08\u65E0\u5F53\u524D\u4F1A\u8BDD\u65F6\u53EF\u5148\u521B\u5EFA\u529F\u80FD\uFF0C\u7A0D\u540E\u7F16\u8F91\u8865\u5145\uFF09" : selectableExtraSkills.length === 0 ? "\u6CA1\u6709\u66F4\u591A\u53EF\u6DFB\u52A0\u7684\u6280\u80FD" : "\u9009\u62E9\u8981\u9644\u52A0\u7684\u5DF2\u5B89\u88C5\u6280\u80FD\u2026" }),
          selectableExtraSkills.map((skill) => /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("option", { value: skill.name, children: [
            skill.name,
            skill.modelInvocable ? "" : "\uFF08\u4EC5\u624B\u52BF\uFF09",
            " \u2014 ",
            skill.description.slice(0, 30)
          ] }, skill.name))
        ]
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "lawyer-wizard__inline", children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
        "input",
        {
          className: "lawyer-wizard__input lawyer-wizard__input--sm",
          type: "text",
          placeholder: "\u9644\u52A0\u6280\u80FD\u540D\uFF08\u5C0F\u5199 kebab-case\uFF09\uFF0C\u56DE\u8F66\u6DFB\u52A0",
          value: draft.skillDraft,
          onChange: (event) => {
            patch({ skillDraft: event.target.value });
          },
          onKeyDown: (event) => {
            if (event.key !== "Enter") return;
            event.preventDefault();
            const name = draft.skillDraft.trim().toLowerCase();
            if (name === "" || !SKILL_NAME_PATTERN.test(name) || draft.extraSkills.includes(name)) return;
            patch({ extraSkills: [...draft.extraSkills, name], skillDraft: "" });
          }
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
        "button",
        {
          type: "button",
          className: "lawyer-wizard__mini-btn",
          onClick: () => {
            const name = draft.skillDraft.trim().toLowerCase();
            if (name === "" || !SKILL_NAME_PATTERN.test(name) || draft.extraSkills.includes(name)) return;
            patch({ extraSkills: [...draft.extraSkills, name], skillDraft: "" });
          },
          children: "\u6DFB\u52A0"
        }
      )
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("h3", { className: "lawyer-wizard__section-title", children: "\u56DB\u3001\u6CD5\u5F8B\u4E8B\u9879\uFF08claude-for-legal-ZH\uFF09" }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("label", { className: "lawyer-wizard__switch", children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
        "input",
        {
          type: "checkbox",
          checked: draft.legalEnabled,
          onChange: (event) => {
            patch({ legalEnabled: event.target.checked });
          }
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { children: "\u672C\u529F\u80FD\u6D89\u53CA\u6CD5\u5F8B\u4E8B\u9879\u2014\u2014\u6309 claude-for-legal-ZH \u4E2D\u56FD\u6CD5\u89C4\u8303\u6267\u884C\uFF08\u9886\u57DF\u753B\u50CF / \u4E09\u5C42\u5185\u90E8\u8C03\u7528\u89C4\u7A0B / \u6CD5\u5F8B\u8F93\u51FA\u89C4\u5219\uFF09" })
    ] }),
    !draft.legalEnabled && /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("p", { className: "lawyer-wizard__hint", children: "\u975E\u6CD5\u5F8B\u7C7B\u529F\u80FD\uFF08\u5982\u683C\u5F0F\u8F6C\u6362\u3001\u8D44\u6599\u6574\u7406\uFF09\u4FDD\u6301\u5173\u95ED\uFF1A\u6307\u4EE4\u53EA\u5E26\u6280\u80FD\u624B\u52BF\u4E0E\u6A21\u677F\u6E32\u67D3\u7ED3\u679C\u3002" }),
    draft.legalEnabled && /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_jsx_runtime2.Fragment, { children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("label", { className: "lawyer-wizard__label", htmlFor: "lawyer-form-domain", children: "\u6CD5\u5F8B\u9886\u57DF *" }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
        "select",
        {
          id: "lawyer-form-domain",
          className: "lawyer-wizard__select",
          value: draft.legalDomain,
          onChange: (event) => {
            switchDomain(event.target.value);
          },
          children: LEGAL_DOMAINS.map((item) => /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("option", { value: item.domain, children: [
            item.label,
            "\uFF08",
            item.domain,
            "\uFF09"
          ] }, item.domain))
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("p", { className: "lawyer-wizard__hint", children: [
        "\u5BF9\u5E94 adapter \u6280\u80FD\uFF1A/",
        domainMeta?.adapter ?? "\u2014",
        "\u2014\u2014\u6307\u4EE4\u4EE5\u5B83\u4F5C\u4E3A\u9996\u4E2A\u624B\u52BF\uFF0C\u7531\u5B83\u8DEF\u7531\u5230 ",
        draft.legalDomain,
        "/CLAUDE.md \u4E0E\u539F\u59CB\u6280\u80FD\u3002"
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("label", { className: "lawyer-wizard__label", children: "\u9886\u57DF\u539F\u59CB\u6280\u80FD\uFF08\u53EF\u591A\u9009\uFF0C\u7559\u7A7A\u7531 adapter \u6309\u6750\u6599\u81EA\u884C\u8DEF\u7531\uFF09" }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "lawyer-wizard__chips", children: (domainMeta?.skills ?? []).map((name) => /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
        "button",
        {
          type: "button",
          className: draft.legalSkills.includes(name) ? "lawyer-wizard__chip lawyer-wizard__chip--on" : "lawyer-wizard__chip",
          onClick: () => {
            toggleLegalSkill(name);
          },
          children: name
        },
        name
      )) }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("label", { className: "lawyer-wizard__label", htmlFor: "lawyer-form-subagent", children: "\u5B50\u4EE3\u7406\u5206\u6D3E\u65B9\u6848" }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
        "select",
        {
          id: "lawyer-form-subagent",
          className: "lawyer-wizard__select",
          value: draft.legalSubagent,
          onChange: (event) => {
            patch({ legalSubagent: event.target.value });
          },
          children: SUBAGENT_OPTIONS.map((option) => /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("option", { value: option.value, children: option.label }, option.value))
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("label", { className: "lawyer-wizard__label", children: "\u5F3A\u5236\u9002\u7528\u7684\u5171\u4EAB\u53C2\u8003\u6587\u4EF6" }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "lawyer-wizard__chips", children: LEGAL_REFERENCES.map((item) => /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
        "button",
        {
          type: "button",
          className: draft.legalReferences.includes(item.path) ? "lawyer-wizard__chip lawyer-wizard__chip--on" : "lawyer-wizard__chip",
          onClick: () => {
            toggleReference(item.path);
          },
          title: item.path,
          children: item.label
        },
        item.path
      )) })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("h3", { className: "lawyer-wizard__section-title", children: "MCP \u914D\u7F6E" }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("label", { className: "lawyer-wizard__label", htmlFor: "lawyer-form-mcp", children: "MCP \u5DE5\u5177\u504F\u597D" }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
      "select",
      {
        id: "lawyer-form-mcp",
        className: "lawyer-wizard__select",
        value: draft.mcpPreset,
        onChange: (event) => {
          patch({ mcpPreset: event.target.value });
        },
        children: MCP_OPTIONS.map((option) => /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("option", { value: option.value, children: option.label }, option.value))
      }
    ),
    draft.mcpPreset === "custom" && /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_jsx_runtime2.Fragment, { children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("label", { className: "lawyer-wizard__label", htmlFor: "lawyer-form-mcp-note", children: "MCP \u4F7F\u7528\u8BF4\u660E *" }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
        "textarea",
        {
          id: "lawyer-form-mcp-note",
          className: "lawyer-wizard__textarea",
          placeholder: "\u5982\uFF1A\u4F18\u5148\u4F7F\u7528\u5143\u5178 MCP \u7684\u6CD5\u89C4\u68C0\u7D22\u5DE5\u5177\u6838\u67E5\u5F15\u7528\u6761\u6587\uFF1B\u6216\u8BF4\u660E\u672C\u529F\u80FD\u4E0D\u4F9D\u8D56 MCP",
          value: draft.mcpNote,
          onChange: (event) => {
            patch({ mcpNote: event.target.value });
          }
        }
      )
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("p", { className: "lawyer-wizard__hint", children: "MCP \u5DE5\u5177\u7531\u5F8B\u5E08\u6A21\u5F0F\u4F1A\u8BDD\u7684 agent preset \u63D0\u4F9B\uFF08\u5F53\u524D\u5185\u7F6E\u5143\u5178\xB7\u6CD5\u89C4\u68C0\u7D22 law / case \u4E24\u4E2A server\uFF09\uFF1B \u6CD5\u5F8B\u4E8B\u9879\u5F00\u542F\u65F6\uFF0C\u6307\u4EE4\u8FD8\u4F1A\u5E26\u4E0A\u4E09\u8F6E\u68C0\u7D22\u3001\u65F6\u6548\u6838\u9A8C\u4E0E\u6765\u6E90\u6EAF\u6E90\u6807\u7B7E\u7B49\u89C4\u7A0B\u3002" }),
    error !== "" && /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("p", { className: "lawyer-wizard__error", children: error }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "lawyer-wizard__actions", children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("button", { type: "button", className: "lawyer-wizard__cancel", onClick: onCancel, children: "\u53D6\u6D88" }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("button", { type: "button", className: "lawyer-wizard__submit", onClick: submit, children: submitLabel })
    ] })
  ] });
}

// plugins/lawyer-wizard/src/client/EntryManager.tsx
var import_jsx_runtime3 = require("react/jsx-runtime");
function describeCustom(row) {
  const parts = [`/${row.skill}`];
  if (row.extraSkills !== void 0 && row.extraSkills.length > 0) parts.push(`+${row.extraSkills.length} \u6280\u80FD`);
  if (row.fields !== void 0 && row.fields.length > 0) parts.push(`${row.fields.length} \u5B57\u6BB5`);
  if (row.legal !== void 0) parts.push(`\u6CD5\u5F8B \xB7 ${row.legal.domain}`);
  if (row.mcp !== void 0) parts.push("MCP");
  const summary = parts.join(" \xB7 ");
  return row.description === void 0 ? summary : `${summary} \u2014 ${row.description}`;
}
function EntryManager({ entries, listInstalledSkills, onClose, onSave }) {
  const [rows, setRows] = (0, import_react3.useState)(() => [...entries]);
  const [view, setView] = (0, import_react3.useState)({ kind: "list" });
  const [error, setError] = (0, import_react3.useState)("");
  const [busy, setBusy] = (0, import_react3.useState)(false);
  const missingBuiltins = BUILTIN_ENTRY_IDS.filter((id) => !rows.some((row) => row.kind === "builtin" && row.id === id));
  const move = (index, delta) => {
    setRows((previous) => {
      const next = [...previous];
      const target = index + delta;
      if (target < 0 || target >= next.length) return previous;
      const [row] = next.splice(index, 1);
      next.splice(target, 0, row);
      return next;
    });
  };
  const remove = (index) => {
    setRows((previous) => previous.filter((_, i) => i !== index));
  };
  const upsertEntry = (draft) => {
    setRows((previous) => {
      const index = previous.findIndex((row) => row.id === draft.id);
      if (index === -1) return [...previous, draft];
      const next = [...previous];
      next[index] = draft;
      return next;
    });
    setView({ kind: "list" });
    setError("");
  };
  const save = () => {
    setBusy(true);
    void onSave(rows).then((ok) => {
      setBusy(false);
      if (!ok) setError("\u4FDD\u5B58\u5931\u8D25\uFF1A\u8BBE\u7F6E\u901A\u9053\u4E0D\u53EF\u7528\u6216\u5199\u5165\u88AB\u62D2\uFF0C\u8BF7\u7A0D\u540E\u91CD\u8BD5");
    });
  };
  if (view.kind !== "list") {
    const editing = view.kind === "edit" ? rows.find((row) => row.id === view.entryId) : void 0;
    if (view.kind === "edit" && editing === void 0) {
      setView({ kind: "list" });
      return null;
    }
    return /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "lawyer-wizard__mask", role: "dialog", "aria-modal": "true", "aria-label": view.kind === "create" ? "\u65B0\u5EFA\u81EA\u5B9A\u4E49\u529F\u80FD" : "\u7F16\u8F91\u81EA\u5B9A\u4E49\u529F\u80FD", children: /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "lawyer-wizard__dialog", children: [
      /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "lawyer-wizard__header", children: [
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("h2", { className: "lawyer-wizard__title", children: view.kind === "create" ? "\u65B0\u5EFA\u81EA\u5B9A\u4E49\u529F\u80FD" : `\u7F16\u8F91\uFF1A${editing.label}` }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("button", { type: "button", className: "lawyer-wizard__close", title: "\u8FD4\u56DE\u5217\u8868\uFF08\u4E0D\u4FDD\u5B58\u672C\u6B21\u8868\u5355\u6539\u52A8\uFF09", onClick: () => {
          setView({ kind: "list" });
        }, children: "\u2715" })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("p", { className: "lawyer-wizard__subtitle", children: "\u6309\u300C\u5165\u53E3\u5373\u914D\u7F6E\u300D\u7684\u5F62\u6001\u5B9A\u4E49\u529F\u80FD\uFF1A\u5361\u7247\u5C55\u793A \u2192 \u63D0\u793A\u8BCD\u6A21\u677F + \u53D1\u8D77\u8868\u5355\uFF08\u516D\u79CD\u5B57\u6BB5\uFF09\u2192 \u6280\u80FD\u624B\u52BF \u2192 \u6CD5\u5F8B\u4E8B\u9879\u7ED1\u5B9A\uFF08claude-for-legal-ZH \u9886\u57DF\u4E0E\u4E09\u5C42\u8C03\u7528\u89C4\u7A0B\uFF09\u3002\u521B\u5EFA\u540E\u51FA\u73B0\u5728\u53F3\u4FA7\u529F\u80FD\u680F\uFF0C\u70B9\u51FB\u5373\u53D1\u8D77\u4E13\u5C5E\u4F1A\u8BDD\u3002" }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
        CustomEntryForm,
        {
          entry: editing,
          listInstalledSkills,
          onSubmit: upsertEntry,
          onCancel: () => {
            setView({ kind: "list" });
          },
          submitLabel: view.kind === "create" ? "\u521B\u5EFA\u529F\u80FD" : "\u4FDD\u5B58\u4FEE\u6539"
        }
      )
    ] }) });
  }
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "lawyer-wizard__mask", role: "dialog", "aria-modal": "true", "aria-label": "\u529F\u80FD\u5165\u53E3\u914D\u7F6E", children: /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "lawyer-wizard__dialog", children: [
    /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "lawyer-wizard__header", children: [
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("h2", { className: "lawyer-wizard__title", children: "\u529F\u80FD\u5165\u53E3\u914D\u7F6E" }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("button", { type: "button", className: "lawyer-wizard__close", title: "\u5173\u95ED", onClick: onClose, children: "\u2715" })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("p", { className: "lawyer-wizard__subtitle", children: "\u8C03\u6574\u53F3\u4FA7\u529F\u80FD\u680F\u7684\u5165\u53E3\u4E0E\u987A\u5E8F\uFF08\u4FDD\u5B58\u540E\u7ACB\u5373\u751F\u6548\uFF0C\u540C\u6B65\u5199\u5165 $DSH_HOME/settings.yaml\uFF09\u3002" }),
    rows.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("p", { className: "lawyer-wizard__hint", children: "\u6682\u65E0\u529F\u80FD\u5165\u53E3\uFF0C\u8BF7\u5728\u4E0B\u65B9\u6DFB\u52A0\u3002" }),
    rows.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("ul", { className: "lawyer-wizard__rows", children: rows.map((row, index) => /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("li", { className: "lawyer-wizard__row", children: [
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "lawyer-wizard__row-index", children: index + 1 }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("span", { className: "lawyer-wizard__row-main", children: [
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "lawyer-wizard__row-name", children: row.kind === "builtin" ? BUILTIN_ENTRY_META[row.id].label : row.label }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "lawyer-wizard__row-sub", children: row.kind === "builtin" ? "\u5185\u7F6E\u529F\u80FD" : describeCustom(row) })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "lawyer-wizard__badge", children: row.kind === "builtin" ? "\u5185\u7F6E" : "\u81EA\u5B9A\u4E49" }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("span", { className: "lawyer-wizard__row-actions", children: [
        row.kind === "custom" && /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("button", { type: "button", className: "lawyer-wizard__row-btn", title: "\u7F16\u8F91", onClick: () => {
          setView({ kind: "edit", entryId: row.id });
        }, children: "\u270E" }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("button", { type: "button", className: "lawyer-wizard__row-btn", title: "\u4E0A\u79FB", disabled: index === 0, onClick: () => {
          move(index, -1);
        }, children: "\u2191" }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("button", { type: "button", className: "lawyer-wizard__row-btn", title: "\u4E0B\u79FB", disabled: index === rows.length - 1, onClick: () => {
          move(index, 1);
        }, children: "\u2193" }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("button", { type: "button", className: "lawyer-wizard__row-btn lawyer-wizard__row-btn--danger", title: "\u5220\u9664", onClick: () => {
          remove(index);
        }, children: "\u2715" })
      ] })
    ] }, row.id)) }),
    error !== "" && /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("p", { className: "lawyer-wizard__error", children: error }),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "lawyer-wizard__manager-actions", children: [
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("button", { type: "button", className: "lawyer-wizard__submit", onClick: () => {
        setView({ kind: "create" });
      }, children: "\uFF0B \u65B0\u5EFA\u81EA\u5B9A\u4E49\u529F\u80FD" }),
      missingBuiltins.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "lawyer-wizard__builtin-restore", children: [
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "lawyer-wizard__label", children: "\u6062\u590D\u5185\u7F6E\u5165\u53E3" }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "lawyer-wizard__builtin-buttons", children: missingBuiltins.map((id) => /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
          "button",
          {
            type: "button",
            className: "lawyer-wizard__row-btn lawyer-wizard__builtin-btn",
            onClick: () => {
              setRows((previous) => [...previous, { kind: "builtin", id }]);
            },
            children: BUILTIN_ENTRY_META[id].label
          },
          id
        )) })
      ] })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "lawyer-wizard__actions", children: [
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("button", { type: "button", className: "lawyer-wizard__cancel", disabled: busy, onClick: onClose, children: "\u53D6\u6D88" }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("button", { type: "button", className: "lawyer-wizard__submit", disabled: busy, onClick: save, children: busy ? "\u4FDD\u5B58\u4E2D\u2026" : "\u4FDD\u5B58" })
    ] })
  ] }) });
}

// plugins/lawyer-wizard/src/client/WizardDialog.tsx
var import_react4 = require("react");
var import_jsx_runtime4 = require("react/jsx-runtime");
function WizardDialog({ initialEntries, listInstalledSkills, onDone, onSkip }) {
  const [step, setStep] = (0, import_react4.useState)(1);
  const enabledBuiltin = (0, import_react4.useMemo)(
    () => new Set(initialEntries.filter((entry) => entry.kind === "builtin").map((entry) => entry.id)),
    [initialEntries]
  );
  const [checked, setChecked] = (0, import_react4.useState)(enabledBuiltin);
  const [drafts, setDrafts] = (0, import_react4.useState)([]);
  const [draftKey, setDraftKey] = (0, import_react4.useState)(0);
  const [label, setLabel] = (0, import_react4.useState)("");
  const [skill, setSkill] = (0, import_react4.useState)("");
  const [description, setDescription] = (0, import_react4.useState)("");
  const [error, setError] = (0, import_react4.useState)("");
  const [busy, setBusy] = (0, import_react4.useState)(false);
  const toggle = (id) => {
    setChecked((previous) => {
      const next = new Set(previous);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };
  const addDraft = () => {
    const trimmedLabel = label.trim();
    const trimmedSkill = skill.trim().toLowerCase().replace(/\s+/g, "-");
    if (trimmedLabel === "") {
      setError("\u8BF7\u586B\u5199\u5165\u53E3\u540D\u79F0");
      return;
    }
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(trimmedSkill)) {
      setError("\u6280\u80FD\u540D\u9700\u4E3A\u5C0F\u5199 kebab-case\uFF08\u5982 due-diligence\uFF09\uFF0C\u53EF\u5728\u5DE6\u4FA7\u5BF9\u8BDD\u91CC\u8F93\u5165 / \u67E5\u770B\u53EF\u7528\u6280\u80FD");
      return;
    }
    setError("");
    setDrafts((previous) => [...previous, { key: draftKey, label: trimmedLabel, skill: trimmedSkill, description: description.trim() }]);
    setDraftKey((previous) => previous + 1);
    setLabel("");
    setSkill("");
    setDescription("");
  };
  const finish = () => {
    setBusy(true);
    const entries = [];
    for (const id of BUILTIN_ENTRY_IDS) {
      if (checked.has(id)) entries.push({ kind: "builtin", id });
    }
    for (const draft of drafts) {
      entries.push({
        kind: "custom",
        id: generateCustomEntryId(),
        label: draft.label,
        skill: draft.skill,
        ...draft.description === "" ? {} : { description: draft.description }
      });
    }
    void Promise.resolve(onDone(entries)).finally(() => {
      setBusy(false);
    });
  };
  return /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "lawyer-wizard__mask", role: "dialog", "aria-modal": "true", "aria-label": "\u5F8B\u5E08\u5DE5\u4F5C\u53F0\u914D\u7F6E\u5411\u5BFC", children: /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "lawyer-wizard__dialog", children: [
    /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "lawyer-wizard__header", children: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("h2", { className: "lawyer-wizard__title", children: "\u6B22\u8FCE\u4F7F\u7528\u5F8B\u5E08\u5DE5\u4F5C\u53F0" }) }),
    /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("p", { className: "lawyer-wizard__subtitle", children: "\u5148\u9009\u62E9\u9700\u8981\u5C55\u793A\u7684\u529F\u80FD\u5165\u53E3\uFF1B\u4E4B\u540E\u968F\u65F6\u53EF\u4ECE\u53F3\u4E0B\u89D2\u201C\u529F\u80FD\u914D\u7F6E\u201D\u6309\u94AE\u65B0\u589E\u81EA\u5B9A\u4E49\u5165\u53E3\uFF08\u7ED1\u5B9A\u6280\u80FD\uFF09\u3001\u5220\u9664\u6216\u6392\u5E8F\u3002" }),
    step === 1 && /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(import_jsx_runtime4.Fragment, { children: [
      /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "lawyer-wizard__steps", children: [
        /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("span", { className: "lawyer-wizard__step lawyer-wizard__step--active", children: [
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { className: "lawyer-wizard__step-num", children: "1" }),
          "\u9009\u62E9\u529F\u80FD\u5165\u53E3"
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { children: "\xB7" }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("span", { className: "lawyer-wizard__step", children: [
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { className: "lawyer-wizard__step-num", children: "2" }),
          "\u81EA\u5B9A\u4E49\u5165\u53E3\uFF08\u53EF\u9009\uFF09"
        ] })
      ] }),
      BUILTIN_ENTRY_IDS.map((id) => /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("label", { className: "lawyer-wizard__check", children: [
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
          "input",
          {
            type: "checkbox",
            checked: checked.has(id),
            onChange: () => {
              toggle(id);
            }
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("span", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { className: "lawyer-wizard__check-name", children: BUILTIN_ENTRY_META[id].label }),
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { className: "lawyer-wizard__check-hint", children: BUILTIN_ENTRY_META[id].description })
        ] })
      ] }, id)),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "lawyer-wizard__actions", children: [
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("button", { type: "button", className: "lawyer-wizard__cancel", disabled: busy, onClick: () => {
          void onSkip();
        }, children: "\u8DF3\u8FC7\uFF08\u4FDD\u6301\u9ED8\u8BA4\uFF09" }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("button", { type: "button", className: "lawyer-wizard__submit", onClick: () => {
          setStep(2);
        }, children: "\u4E0B\u4E00\u6B65" })
      ] })
    ] }),
    step === 2 && /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(import_jsx_runtime4.Fragment, { children: [
      /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "lawyer-wizard__steps", children: [
        /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("span", { className: "lawyer-wizard__step", children: [
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { className: "lawyer-wizard__step-num", children: "1" }),
          "\u9009\u62E9\u529F\u80FD\u5165\u53E3"
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { children: "\xB7" }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("span", { className: "lawyer-wizard__step lawyer-wizard__step--active", children: [
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { className: "lawyer-wizard__step-num", children: "2" }),
          "\u81EA\u5B9A\u4E49\u5165\u53E3\uFF08\u53EF\u9009\uFF09"
        ] })
      ] }),
      drafts.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("ul", { className: "lawyer-wizard__rows", children: drafts.map((draft) => /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("li", { className: "lawyer-wizard__row", children: [
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { className: "lawyer-wizard__badge", children: "\u81EA\u5B9A\u4E49" }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("span", { className: "lawyer-wizard__row-main", children: [
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { className: "lawyer-wizard__row-name", children: draft.label }),
          /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("span", { className: "lawyer-wizard__row-sub", children: [
            "/",
            draft.skill
          ] })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { className: "lawyer-wizard__row-actions", children: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
          "button",
          {
            type: "button",
            className: "lawyer-wizard__row-btn lawyer-wizard__row-btn--danger",
            title: "\u79FB\u9664",
            onClick: () => {
              setDrafts((previous) => previous.filter((item) => item.key !== draft.key));
            },
            children: "\u2715"
          }
        ) })
      ] }, draft.key)) }),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "lawyer-wizard__add", children: [
        /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "lawyer-wizard__add-grid", children: [
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
            "input",
            {
              className: "lawyer-wizard__input",
              type: "text",
              placeholder: "\u5165\u53E3\u540D\u79F0\uFF0C\u5982 \u5C3D\u804C\u8C03\u67E5",
              value: label,
              onChange: (event) => {
                setLabel(event.target.value);
              }
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(SkillField, { value: skill, onChange: setSkill, listInstalledSkills }),
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
            "input",
            {
              className: "lawyer-wizard__input",
              type: "text",
              placeholder: "\u5165\u53E3\u8BF4\u660E\uFF08\u53EF\u9009\uFF0C\u5C06\u5199\u8FDB\u53D1\u7ED9\u6A21\u578B\u7684\u6307\u4EE4\uFF09",
              value: description,
              onChange: (event) => {
                setDescription(event.target.value);
              }
            }
          )
        ] }),
        error !== "" && /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("p", { className: "lawyer-wizard__error", children: error }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "lawyer-wizard__add-actions", children: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("button", { type: "button", className: "lawyer-wizard__submit", onClick: addDraft, children: "\u6DFB\u52A0\u5165\u53E3" }) }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("p", { className: "lawyer-wizard__hint", children: "\u63D0\u793A\uFF1A\u81EA\u5B9A\u4E49\u5165\u53E3\u63D0\u4EA4\u65F6\u5C06\u4EE5\u300C/\u6280\u80FD\u540D\u300D\u624B\u52BF\u53D1\u8D77\u5BF9\u8BDD\uFF1B\u6280\u80FD\u9700\u5DF2\u5B89\u88C5\uFF08lawyer-dsh/skills \u6216\u7528\u6237\u6280\u80FD\u76EE\u5F55\uFF09\u3002" })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "lawyer-wizard__actions", children: [
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("button", { type: "button", className: "lawyer-wizard__cancel", onClick: () => {
          setStep(1);
        }, children: "\u4E0A\u4E00\u6B65" }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("button", { type: "button", className: "lawyer-wizard__cancel", disabled: busy, onClick: () => {
          void onSkip();
        }, children: "\u8DF3\u8FC7\u81EA\u5B9A\u4E49" }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("button", { type: "button", className: "lawyer-wizard__submit", disabled: busy, onClick: finish, children: busy ? "\u4FDD\u5B58\u4E2D\u2026" : "\u5B8C\u6210" })
      ] })
    ] })
  ] }) });
}

// plugins/lawyer-wizard/src/client/WizardRoot.tsx
var import_jsx_runtime5 = require("react/jsx-runtime");
var OPEN_ENTRY_MANAGER_EVENT = "lawyer:open-entry-manager";
function WizardRoot({
  store,
  persistEntries,
  persistOnboarded,
  listInstalledSkills
}) {
  const snapshot = (0, import_react5.useSyncExternalStore)(store.subscribe, store.getSnapshot);
  (0, import_react5.useEffect)(() => {
    const openManager = () => {
      store.setState({ managerOpen: true });
    };
    window.addEventListener(OPEN_ENTRY_MANAGER_EVENT, openManager);
    return () => {
      window.removeEventListener(OPEN_ENTRY_MANAGER_EVENT, openManager);
    };
  }, [store]);
  return /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)(import_jsx_runtime5.Fragment, { children: [
    snapshot.showWizard && /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
      WizardDialog,
      {
        initialEntries: snapshot.value?.entries ?? [],
        listInstalledSkills,
        onSkip: async () => {
          store.setState({ showWizard: false });
          await persistOnboarded();
        },
        onDone: async (entries) => {
          store.setState({ showWizard: false });
          await persistOnboarded();
          await persistEntries(entries);
        }
      }
    ),
    snapshot.managerOpen && /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
      EntryManager,
      {
        entries: snapshot.value?.entries ?? [],
        listInstalledSkills,
        onClose: () => {
          store.setState({ managerOpen: false });
        },
        onSave: async (entries) => {
          const ok = await persistEntries(entries);
          if (ok) store.setState({ managerOpen: false });
          return ok;
        }
      }
    )
  ] });
}

// plugins/lawyer-wizard/src/client/index.ts
var inject = ["slots", "sessions", "connection"];
var LAWYER_SETTINGS_NAMESPACE = "lawyer-workbench";
var STYLE_TAG = "lawyer-wizard/entry";
var ENTRY_CSS = `
.lawyer-wizard__mask {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  justify-content: center;
  overflow-y: auto;
  background: rgb(0 0 0 / 45%);
  font-family: inherit;
}
.lawyer-wizard__dialog {
  width: min(600px, calc(100vw - 48px));
  max-height: calc(100vh - 64px);
  margin: 32px auto;
  overflow-y: auto;
  box-sizing: border-box;
  padding: 20px 22px;
  border-radius: 14px;
  border: 1px solid var(--dsw-alias-border-l2);
  background: var(--dsw-alias-button-elevated-fill);
  box-shadow: 0 18px 48px rgb(0 0 0 / 24%);
  color: var(--dsw-alias-label-primary);
  font-size: 14px;
}
.lawyer-wizard__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6px;
}
.lawyer-wizard__title {
  margin: 0;
  font-size: 17px;
  font-weight: 600;
}
.lawyer-wizard__subtitle {
  margin: 0 0 14px;
  font-size: 13px;
  color: var(--dsw-alias-label-secondary, inherit);
}
.lawyer-wizard__close {
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: var(--dsw-alias-label-secondary, inherit);
  font-size: 14px;
  cursor: pointer;
}
.lawyer-wizard__close:not(:disabled):hover {
  background: var(--dsw-alias-interactive-bg-hover);
}
.lawyer-wizard__label {
  display: block;
  margin: 14px 0 6px;
  font-weight: 500;
}
.lawyer-wizard__input,
.lawyer-wizard__select {
  width: 100%;
  box-sizing: border-box;
  height: 34px;
  padding: 0 10px;
  border-radius: 8px;
  border: 1px solid var(--dsw-alias-border-l2);
  background: var(--dsw-alias-fill-normal, transparent);
  color: inherit;
  font-size: 14px;
  font-family: inherit;
}
.lawyer-wizard__input:focus,
.lawyer-wizard__select:focus {
  outline: none;
  border-color: var(--dsw-alias-brand-primary);
}
.lawyer-wizard__input::placeholder {
  color: var(--dsw-alias-label-tertiary);
}
.lawyer-wizard__hint {
  margin: 6px 0 0;
  font-size: 12px;
  color: var(--dsw-alias-label-tertiary);
}
.lawyer-wizard__error {
  overflow-wrap: anywhere;
  margin: 8px 0 0;
  font-size: 12px;
  color: #e5484d;
}
.lawyer-wizard__check {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 10px 12px;
  border: 1px solid var(--dsw-alias-border-l2);
  border-radius: 10px;
  cursor: pointer;
}
.lawyer-wizard__check + .lawyer-wizard__check {
  margin-top: 8px;
}
.lawyer-wizard__check input {
  accent-color: var(--dsw-alias-button-primary-fill);
  margin-top: 2px;
}
.lawyer-wizard__check-name {
  display: block;
  font-weight: 500;
}
.lawyer-wizard__check-hint {
  display: block;
  font-size: 12px;
  color: var(--dsw-alias-label-tertiary);
}
.lawyer-wizard__rows {
  list-style: none;
  margin: 10px 0 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.lawyer-wizard__row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  border-radius: 10px;
  border: 1px solid var(--dsw-alias-border-l2);
}
.lawyer-wizard__row-index {
  flex: none;
  width: 20px;
  text-align: center;
  font-size: 12px;
  color: var(--dsw-alias-label-tertiary);
}
.lawyer-wizard__row-main {
  flex: 1;
  min-width: 0;
}
.lawyer-wizard__row-name {
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: 500;
  font-size: 13px;
}
.lawyer-wizard__row-sub {
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 12px;
  color: var(--dsw-alias-label-tertiary);
}
.lawyer-wizard__badge {
  flex: none;
  padding: 1px 6px;
  border-radius: 4px;
  background: var(--dsw-alias-interactive-bg-hover);
  font-size: 11px;
  color: var(--dsw-alias-label-tertiary);
}
.lawyer-wizard__row-actions {
  flex: none;
  display: inline-flex;
  gap: 2px;
}
.lawyer-wizard__row-btn {
  width: 26px;
  height: 26px;
  border: none;
  border-radius: 7px;
  background: transparent;
  color: var(--dsw-alias-label-secondary, inherit);
  font-size: 13px;
  cursor: pointer;
}
.lawyer-wizard__row-btn:not(:disabled):hover {
  background: var(--dsw-alias-interactive-bg-hover);
  color: var(--dsw-alias-label-primary);
}
.lawyer-wizard__row-btn:disabled {
  opacity: 0.35;
  cursor: default;
}
.lawyer-wizard__row-btn--danger:not(:disabled):hover {
  color: #e5484d;
}
.lawyer-wizard__add {
  margin-top: 12px;
  padding: 12px;
  border: 1.5px dashed var(--dsw-alias-border-l2);
  border-radius: 10px;
}
.lawyer-wizard__add-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}
.lawyer-wizard__add-grid .lawyer-wizard__select,
.lawyer-wizard__add-grid .lawyer-wizard__input {
  height: 32px;
  font-size: 13px;
}
.lawyer-wizard__add-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 10px;
}
.lawyer-wizard__steps {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
  font-size: 12px;
  color: var(--dsw-alias-label-tertiary);
}
.lawyer-wizard__step {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.lawyer-wizard__step-num {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--dsw-alias-interactive-bg-hover);
  font-size: 11px;
}
.lawyer-wizard__step--active {
  color: var(--dsw-alias-label-primary);
  font-weight: 500;
}
.lawyer-wizard__step--active .lawyer-wizard__step-num {
  background: var(--dsw-alias-button-primary-fill);
  color: var(--dsw-alias-label-primary-foreground, #fff);
}
.lawyer-wizard__actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 18px;
}
.lawyer-wizard__cancel,
.lawyer-wizard__submit {
  height: 34px;
  padding: 0 16px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
  cursor: pointer;
}
.lawyer-wizard__cancel {
  background: transparent;
  color: var(--dsw-alias-label-primary);
}
.lawyer-wizard__cancel:not(:disabled):hover {
  background: var(--dsw-alias-interactive-bg-hover);
}
.lawyer-wizard__submit {
  background: var(--dsw-alias-button-primary-fill);
  color: var(--dsw-alias-label-primary-foreground, #fff);
  font-weight: 500;
}
.lawyer-wizard__submit:not(:disabled):hover {
  background: var(--dsw-alias-button-primary-hover);
}
.lawyer-wizard__cancel:disabled,
.lawyer-wizard__submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
/* \u2500\u2500 \u81EA\u5B9A\u4E49\u529F\u80FD\u5B8C\u6574\u914D\u7F6E\u8868\u5355\uFF08CustomEntryForm / EntryManager M6+\uFF09\u2500\u2500\u2500\u2500\u2500\u2500 */
.lawyer-wizard__form {
  display: flex;
  flex-direction: column;
}
.lawyer-wizard__section-title {
  margin: 22px 0 4px;
  padding-top: 14px;
  border-top: 1px dashed var(--dsw-alias-border-l2);
  font-size: 14px;
  font-weight: 600;
}
.lawyer-wizard__textarea {
  width: 100%;
  box-sizing: border-box;
  min-height: 72px;
  padding: 8px 10px;
  border-radius: 8px;
  border: 1px solid var(--dsw-alias-border-l2);
  background: var(--dsw-alias-fill-normal, transparent);
  color: inherit;
  font-size: 14px;
  font-family: inherit;
  resize: vertical;
}
.lawyer-wizard__textarea:focus {
  outline: none;
  border-color: var(--dsw-alias-brand-primary);
}
.lawyer-wizard__files {
  list-style: none;
  margin: 8px 0 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.lawyer-wizard__file {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 6px 10px;
  border-radius: 8px;
  background: var(--dsw-alias-interactive-bg-hover);
}
.lawyer-wizard__file-name {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 13px;
}
.lawyer-wizard__file-remove {
  flex: none;
  width: 22px;
  height: 22px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: var(--dsw-alias-label-tertiary);
  font-size: 12px;
  cursor: pointer;
}
.lawyer-wizard__file-remove:not(:disabled):hover {
  color: var(--dsw-alias-label-primary);
  background: var(--dsw-alias-border-l2);
}
.lawyer-wizard__manager-actions {
  margin-top: 16px;
}
.lawyer-wizard__builtin-restore {
  margin-top: 14px;
}
.lawyer-wizard__builtin-restore .lawyer-wizard__label {
  margin: 0 0 6px;
}
.lawyer-wizard__builtin-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.lawyer-wizard__builtin-btn {
  width: auto;
  height: 30px;
  padding: 0 12px;
  border: 1px solid var(--dsw-alias-border-l2);
  border-radius: 8px;
  background: transparent;
  color: var(--dsw-alias-label-primary);
  font-size: 13px;
}
.lawyer-wizard__builtin-btn:hover {
  background: var(--dsw-alias-interactive-bg-hover);
}
/* \u2500\u2500 M8\uFF1A\u81EA\u5B9A\u4E49\u529F\u80FD\u914D\u7F6E\u8868\u5355\uFF08\u6A21\u677F + \u5B57\u6BB5\u7F16\u8F91\u5668 + \u6CD5\u5F8B\u4E8B\u9879\uFF09\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
.lawyer-wizard__grid2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}
.lawyer-wizard__grid2 .lawyer-wizard__label {
  margin-top: 10px;
}
.lawyer-wizard__input--sm {
  height: 30px;
  font-size: 13px;
}
.lawyer-wizard__textarea--tall {
  min-height: 120px;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  line-height: 1.6;
}
.lawyer-wizard__textarea--sm {
  min-height: 56px;
  font-size: 13px;
}
.lawyer-wizard__fields-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-top: 14px;
}
.lawyer-wizard__fields-head .lawyer-wizard__label {
  margin: 0;
}
.lawyer-wizard__mini-btn {
  flex: none;
  height: 28px;
  padding: 0 10px;
  border: 1px solid var(--dsw-alias-border-l2);
  border-radius: 7px;
  background: transparent;
  color: var(--dsw-alias-label-primary);
  font-size: 12px;
  font-family: inherit;
  cursor: pointer;
}
.lawyer-wizard__mini-btn:hover {
  border-color: var(--dsw-alias-brand-primary);
  background: var(--dsw-alias-interactive-bg-hover);
}
.lawyer-wizard__field {
  margin-top: 10px;
  padding: 10px;
  border: 1px solid var(--dsw-alias-border-l2);
  border-radius: 10px;
  background: var(--dsw-alias-bg-layer-1, transparent);
}
.lawyer-wizard__field-head {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}
.lawyer-wizard__field-index {
  flex: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--dsw-alias-interactive-bg-hover);
  font-size: 11px;
  color: var(--dsw-alias-label-tertiary);
}
.lawyer-wizard__field-actions {
  flex: none;
  display: inline-flex;
  gap: 2px;
}
.lawyer-wizard__field-label {
  display: block;
  margin: 8px 0 4px;
  font-size: 12px;
  color: var(--dsw-alias-label-tertiary);
}
.lawyer-wizard__inline {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
}
.lawyer-wizard__inline .lawyer-wizard__input--sm {
  flex: 1;
  min-width: 0;
}
.lawyer-wizard__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 6px;
}
.lawyer-wizard__chip {
  padding: 4px 10px;
  border: 1px solid var(--dsw-alias-border-l2);
  border-radius: 999px;
  background: transparent;
  color: var(--dsw-alias-label-secondary, inherit);
  font-size: 12px;
  font-family: inherit;
  cursor: pointer;
}
.lawyer-wizard__chip:hover {
  border-color: var(--dsw-alias-brand-primary);
  color: var(--dsw-alias-label-primary);
}
.lawyer-wizard__chip--on {
  border-color: var(--dsw-alias-brand-primary);
  background: var(--dsw-alias-interactive-bg-hover);
  color: var(--dsw-alias-label-primary);
}
.lawyer-wizard__switch {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin-top: 8px;
  font-size: 13px;
  cursor: pointer;
}
.lawyer-wizard__switch input {
  accent-color: var(--dsw-alias-button-primary-fill);
  margin-top: 2px;
}
`;
function injectStyles() {
  const marker = `style[data-plugin-css="${STYLE_TAG}"]`;
  if (document.querySelector(marker) !== null) return;
  const tag = document.createElement("style");
  tag.dataset.plugin = "lawyer-wizard";
  tag.dataset.pluginCss = STYLE_TAG;
  tag.textContent = ENTRY_CSS;
  document.head.appendChild(tag);
}
function apply(ctx) {
  injectStyles();
  const { api } = ctx.get("connection");
  const store = createWizardStore();
  let scope;
  const listInstalledSkills = () => {
    const sessionId = ctx.sessions.list.getSnapshot().current;
    if (sessionId === void 0) return Promise.resolve(void 0);
    return api.skills.list({ sessionId }).then(
      (result) => result.ok ? result.value.skills : void 0,
      () => void 0
    );
  };
  let wizardOffered = false;
  ctx.slots.inject("shell.overlay", () => ctx.slots.register(
    {
      id: "lawyer-wizard",
      name: "shell.overlay",
      inject: () => ({
        store,
        /** 保存入口列表（整体替换 entries 字段；数组语义即整体替换）。 */
        persistEntries: async (entries) => {
          if (scope === void 0) return false;
          try {
            await scope.set("entries", entries);
            return true;
          } catch {
            return false;
          }
        },
        /** 标记首启向导完成（onboarded 置 true）。 */
        persistOnboarded: async () => {
          if (scope === void 0) return false;
          try {
            await scope.set("onboarded", true);
            return true;
          } catch {
            return false;
          }
        },
        listInstalledSkills
      })
    },
    WizardRoot
  ));
  ctx.inject(["settingsScope"], (scopeCtx) => {
    const bound = scopeCtx.settingsScope?.bind({ namespace: LAWYER_SETTINGS_NAMESPACE });
    if (bound === void 0) return;
    scope = bound;
    const update = () => {
      const snapshot = scope.getSnapshot();
      store.setState({
        phase: snapshot.status,
        value: snapshot.status === "ready" ? snapshot.value : void 0
      });
      if (!wizardOffered && snapshot.status === "ready" && snapshot.value?.onboarded !== true) {
        wizardOffered = true;
        store.setState({ showWizard: true });
      }
    };
    scope.subscribe(update);
    update();
  });
}
return module.exports; } });
//# sourceMappingURL=client.js.map
