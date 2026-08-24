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
var STRICTNESS_SEMANTICS = {
  \u5BBD\u677E: "\u5BBD\u677E\u2014\u2014\u805A\u7126\u9AD8\u98CE\u9669\u95EE\u9898\u4E0E\u6838\u5FC3\u5546\u4E1A\u6761\u6B3E\uFF0C\u4F4E\u98CE\u9669\u7455\u75B5\u53EF\u4ECE\u7565",
  \u5E38\u89C4: "\u5E38\u89C4\u2014\u2014\u6309\u6807\u51C6\u6846\u67B6\u5168\u9762\u5BA1\u6838",
  \u4E25\u683C: "\u4E25\u683C\u2014\u2014\u9010\u6761\u6DF1\u6316\uFF0C\u4E00\u5207\u53EF\u7591\u6761\u6B3E\u5747\u5217\u660E\uFF0C\u6CD5\u89C4\u6838\u67E5\u5168\u8986\u76D6"
};
var FOCUS_LABELS = {
  facts: "\u4E8B\u5B9E\u68B3\u7406",
  relations: "\u6CD5\u5F8B\u5173\u7CFB\u8BC6\u522B",
  issues: "\u4E89\u8BAE\u7126\u70B9\u5F52\u7EB3",
  evidence: "\u8BC1\u636E\u5BA1\u67E5",
  claims: "\u8BF7\u6C42\u6743\u57FA\u7840\u5206\u6790",
  risk: "\u8BC9\u8BBC\u98CE\u9669\u8BC4\u4F30"
};
function fileMention(path) {
  return /\s/u.test(path) ? `@"${path}"` : `@${path}`;
}
function appendMaterialLines(lines, material, header, emptyHint) {
  lines.push(`${header}\uFF1A`);
  let hasFile = false;
  for (const path of material.paths) {
    if (path.trim() === "") continue;
    hasFile = true;
    lines.push(`- ${fileMention(path.trim())}\uFF08\u7528\u6237\u660E\u786E\u5F15\u7528\u7684\u6587\u4EF6\uFF0C\u8BF7\u5148\u7528\u6587\u4EF6\u8BFB\u53D6\u5DE5\u5177\u8BFB\u53D6\u5168\u6587\u518D\u5206\u6790\uFF09`);
  }
  for (const text of material.texts) {
    hasFile = true;
    lines.push(`- \u6750\u6599\u6587\u672C\uFF08\u6765\u81EA ${text.name}\uFF09\uFF1A`);
    lines.push("```");
    lines.push(text.content);
    lines.push("```");
  }
  if (material.images.length > 0) {
    hasFile = true;
    lines.push(`- \u6750\u6599\u626B\u63CF\u4EF6/\u62CD\u7167\u56FE\u7247 ${material.images.length} \u5F20\uFF08\u968F\u672C\u6D88\u606F\u9644\u4E0A\uFF0C\u8BF7\u6309\u987A\u5E8F\u901A\u8BFB\uFF09`);
  }
  if (!hasFile) {
    lines.push(`-\uFF08\u672A\u63D0\u4F9B\uFF0C${emptyHint}\uFF09`);
  }
}
function skillConfigLines(request) {
  const { review, preprocess, output, extraSkills } = request.skills;
  const lines = ["\u6280\u80FD\u914D\u7F6E\uFF1A"];
  lines.push(review ? "- contract-review\uFF1A\u542F\u7528\uFF08\u5DF2\u968F\u6307\u4EE4\u52A0\u8F7D\u5168\u6587\uFF0C\u6309\u5176\u5B8C\u6574\u6D41\u7A0B\u6267\u884C\uFF09" : "- contract-review\uFF1A\u672A\u542F\u7528\u2014\u2014\u4E0D\u8981\u52A0\u8F7D\u8BE5\u6280\u80FD\uFF0C\u76F4\u63A5\u6309\u672C\u6307\u4EE4\u7684\u8981\u6C42\u4E0E\u901A\u7528\u6CD5\u5F8B\u80FD\u529B\u5B8C\u6210\u5BA1\u6838");
  lines.push(preprocess ? "- pdfkit-py\uFF1A\u542F\u7528\uFF08PDF \u6E90\u8D70\u5176\u8F6C\u6362\u94FE\uFF1A\u6587\u5B57\u5C42\u8F6C docx\u3001\u626B\u63CF\u4EF6\u6E32\u67D3\u8F6C\u5F55\uFF09" : "- pdfkit-py\uFF1A\u672A\u542F\u7528\u2014\u2014PDF \u6E90\u76F4\u63A5\u7528\u6587\u4EF6\u8BFB\u53D6\u5DE5\u5177\u8BFB\u53D6\uFF0C\u4E0D\u505A docx \u8F6C\u6362\u4E0E\u6E32\u67D3\u8F6C\u5F55");
  lines.push(output ? "- docx-tracked-changes\uFF1A\u542F\u7528\uFF08\u6309\u6D41\u7A0B\u4EA7\u51FA\u4FEE\u8BA2\u7559\u75D5\u5BA1\u9605\u7A3F docx\uFF09" : "- docx-tracked-changes\uFF1A\u672A\u542F\u7528\u2014\u2014\u672C\u6B21\u4E0D\u751F\u6210\u4FEE\u8BA2\u7559\u75D5\u5BA1\u9605\u7A3F\uFF08\u8986\u76D6\u6280\u80FD\u9ED8\u8BA4\u7684\u53CC\u6587\u4EF6\u8981\u6C42\uFF0C\u4EC5\u4EA4\u4ED8\u5BA1\u6838\u62A5\u544A\uFF09");
  if (extraSkills.length > 0) {
    lines.push(`- \u9644\u52A0\u6280\u80FD\uFF08\u5DF2\u968F\u6307\u4EE4\u6CE8\u5165\u5168\u6587\uFF09\uFF1A${extraSkills.map((name) => `/${name}`).join("\u3001")}\u2014\u2014\u5728\u672C\u4EFB\u52A1\u4E2D\u6309\u9700\u9075\u5FAA\u5176\u6307\u5F15`);
  }
  return lines;
}
function buildContractReviewPrompt(request) {
  const gestures = [
    ...request.skills.review ? ["contract-review"] : [],
    ...request.skills.extraSkills
  ];
  const lines = [
    gestures.length > 0 ? `\u8BF7\u5F00\u59CB\u5408\u540C\u5BA1\u6838 ${gestures.map((name) => `/${name}`).join(" ")}` : "\u8BF7\u5F00\u59CB\u5408\u540C\u5BA1\u6838",
    ""
  ];
  lines.push(`\u6211\u65B9\u7ACB\u573A\uFF1A${request.stance}`);
  lines.push(`\u5BA1\u6838\u4E25\u683C\u7A0B\u5EA6\uFF1A${STRICTNESS_SEMANTICS[request.strictness]}`);
  lines.push(`\u4FEE\u8BA2\u4EBA\u7F72\u540D\uFF1A${request.reviewerName.trim() !== "" ? request.reviewerName.trim() : "\u5F8B\u5E08\u5DE5\u4F5C\u53F0"}\uFF08\u4EA7\u51FA\u4FEE\u8BA2\u7559\u75D5 docx \u65F6\u7684\u4FEE\u8BA2\u4EBA\uFF09`);
  lines.push("");
  lines.push(...skillConfigLines(request));
  lines.push("");
  appendMaterialLines(lines, request, "\u5408\u540C\u6587\u4EF6", "\u8BF7\u5148\u5411\u7528\u6237\u7D22\u53D6\u5408\u540C\u6587\u672C");
  return lines.join("\n");
}
function buildCaseAnalysisPrompt(request) {
  const lines = ["\u8BF7\u5F00\u59CB\u6848\u4EF6\u5206\u6790 /case-analysis", ""];
  lines.push(`\u6211\u65B9\u7ACB\u573A\uFF1A${request.stance}`);
  const labels = request.focus.map((key) => FOCUS_LABELS[key]);
  lines.push(labels.length === Object.keys(FOCUS_LABELS).length ? "\u5206\u6790\u4FA7\u91CD\uFF1A\u5168\u6A21\u5757\u5B8C\u6574\u5206\u6790" : `\u5206\u6790\u4FA7\u91CD\uFF1A${labels.join("\u3001")}${labels.length === 0 ? "\uFF08\u672A\u9009\u62E9\u2014\u2014\u52A8\u7B14\u524D\u5148\u5411\u7528\u6237\u786E\u8BA4\u5206\u6790\u8303\u56F4\uFF09" : "\uFF08\u672A\u5217\u51FA\u7684\u6A21\u5757\u5728\u62A5\u544A\u4E2D\u4ECE\u7565\uFF0C\u4FDD\u7559\u7F16\u53F7\u4E00\u53E5\u8BDD\u5E26\u8FC7\uFF09"}`);
  lines.push("");
  appendMaterialLines(lines, request, "\u6848\u4EF6\u6750\u6599", "\u8BF7\u5148\u5411\u7528\u6237\u7D22\u53D6\u6848\u4EF6\u6750\u6599");
  return lines.join("\n");
}
function buildDocGenerationPrompt(request) {
  const lines = ["\u8BF7\u5F00\u59CB\u6587\u4E66\u751F\u6210 /doc-generation", ""];
  lines.push(`\u6587\u4E66\u7C7B\u578B\uFF1A${request.docType}`);
  lines.push(`\u6211\u65B9\u5F53\u4E8B\u4EBA\u8EAB\u4EFD\uFF1A${request.partyRole}`);
  lines.push(`\u8865\u5145\u8BF4\u660E\uFF1A${request.notes !== "" ? request.notes : "\u65E0"}`);
  lines.push("");
  appendMaterialLines(lines, request, "\u6848\u4EF6\u6750\u6599", "\u8BF7\u5148\u5411\u7528\u6237\u7D22\u53D6\u6848\u4EF6\u80CC\u666F\u6750\u6599");
  return lines.join("\n");
}

// lawyer-dsh/plugins/lawyer-sidebar/src/client/LawyerSidebar.tsx
var import_react5 = require("react");

// lawyer-dsh/plugins/lawyer-sidebar/src/client/ContractReviewDialog.tsx
var import_react2 = require("react");

// lawyer-dsh/plugins/lawyer-sidebar/src/client/FilePicker.tsx
var import_react = require("react");
var import_jsx_runtime = require("react/jsx-runtime");
var EMPTY_FILE_PICKER_VALUE = { paths: [], images: [], texts: [] };
var IMAGE_MAX_BYTES = 5 * 1024 * 1024;
var IMAGE_MAX_COUNT = 20;
var TEXT_MAX_BYTES = 2 * 1024 * 1024;
var SEARCH_DEBOUNCE_MS = 250;
var CANDIDATE_LIMIT = 8;
var ACCEPTED_IMAGE_TYPES = /* @__PURE__ */ new Set(["image/png", "image/jpeg", "image/webp", "image/gif"]);
function readAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error ?? new Error(`\u8BFB\u53D6 ${file.name} \u5931\u8D25`));
    reader.readAsDataURL(file);
  });
}
function readAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error ?? new Error(`\u8BFB\u53D6 ${file.name} \u5931\u8D25`));
    reader.readAsText(file);
  });
}
function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}
function basename(path) {
  const cut = Math.max(path.lastIndexOf("/"), path.lastIndexOf("\\"));
  return cut < 0 ? path : path.slice(cut + 1);
}
function isAbsolutePathLike(value) {
  return /^[a-zA-Z]:[\\/]/.test(value) || value.startsWith("/");
}
function FilePicker({
  label,
  dropHint,
  value,
  onChange,
  disabled,
  searchWorkspaceFiles,
  uploadWorkspaceFile
}) {
  const [query, setQuery] = (0, import_react.useState)("/");
  const [candidates, setCandidates] = (0, import_react.useState)([]);
  const [searching, setSearching] = (0, import_react.useState)(false);
  const [searchUnavailable, setSearchUnavailable] = (0, import_react.useState)(false);
  const [notice, setNotice] = (0, import_react.useState)("");
  const [dragActive, setDragActive] = (0, import_react.useState)(false);
  const [busy, setBusy] = (0, import_react.useState)(false);
  const fileInput = (0, import_react.useRef)(null);
  (0, import_react.useEffect)(() => {
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      setSearching(true);
      searchWorkspaceFiles(query, controller.signal).then(
        (result) => {
          if (controller.signal.aborted) return;
          if (result === void 0) {
            setSearchUnavailable(true);
            setCandidates([]);
          } else {
            setSearchUnavailable(false);
            setCandidates(result);
          }
          setSearching(false);
        },
        () => {
          if (controller.signal.aborted) return;
          setSearchUnavailable(true);
          setCandidates([]);
          setSearching(false);
        }
      );
    }, SEARCH_DEBOUNCE_MS);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query, searchWorkspaceFiles]);
  const addPath = (path) => {
    onChange({ ...value, paths: value.paths.includes(path) ? value.paths : [...value.paths, path] });
  };
  const handleFiles = async (list) => {
    const nextImages = [];
    const nextTexts = [];
    const skipped = [];
    const unresolved = [];
    for (const file of list) {
      const isImage = file.type !== "" && ACCEPTED_IMAGE_TYPES.has(file.type);
      const isText = file.type === "text/plain" || /\.(?:txt|md)$/i.test(file.name);
      if (isImage) {
        if (file.size > IMAGE_MAX_BYTES) {
          skipped.push(`${file.name}\uFF08\u8D85\u8FC7 ${formatBytes(IMAGE_MAX_BYTES)}\uFF09`);
          continue;
        }
        if (value.images.length + nextImages.length >= IMAGE_MAX_COUNT) {
          skipped.push(`${file.name}\uFF08\u8D85\u8FC7 ${IMAGE_MAX_COUNT} \u5F20\u4E0A\u9650\uFF09`);
          continue;
        }
        const dataURL = await readAsDataURL(file);
        nextImages.push({
          name: file.name,
          mediaType: file.type,
          data: dataURL.slice(dataURL.indexOf(",") + 1),
          bytes: file.size
        });
      } else if (isText) {
        if (file.size > TEXT_MAX_BYTES) {
          skipped.push(`${file.name}\uFF08\u8D85\u8FC7 ${formatBytes(TEXT_MAX_BYTES)}\uFF09`);
          continue;
        }
        nextTexts.push({ name: file.name, content: await readAsText(file) });
      } else {
        unresolved.push({ file, query: file.name.replace(/\.[^.]+$/, ""), fullName: file.name });
      }
    }
    if (nextImages.length > 0 || nextTexts.length > 0) {
      onChange({
        ...value,
        images: [...value.images, ...nextImages],
        texts: [...value.texts, ...nextTexts]
      });
    }
    if (unresolved.length === 0) {
      setNotice(skipped.length > 0 ? `\u5DF2\u8DF3\u8FC7\uFF1A${skipped.join("\uFF1B")}` : "");
      return;
    }
    setBusy(true);
    const added = [];
    const failed = [];
    const manual = [];
    for (const item of unresolved) {
      let indexHits;
      try {
        indexHits = await searchWorkspaceFiles(item.query, new AbortController().signal);
      } catch {
        indexHits = void 0;
      }
      const exact = (indexHits ?? []).filter(
        (candidate) => candidate.kind === "file" && basename(candidate.path).toLowerCase() === item.fullName.toLowerCase()
      );
      if (exact.length === 1) {
        addPath(exact[0].path);
        added.push(`${item.fullName} \u2192 ${exact[0].path}`);
        continue;
      }
      const uploaded = await readAsDataURL(item.file).then(
        (dataURL) => uploadWorkspaceFile(
          item.fullName,
          dataURL.slice(dataURL.indexOf(",") + 1),
          new AbortController().signal
        ),
        (error) => new Error(`\u8BFB\u53D6 ${item.fullName} \u5931\u8D25\uFF1A${error instanceof Error ? error.message : String(error)}`)
      );
      if (typeof uploaded === "string") {
        addPath(uploaded);
        added.push(`${item.fullName} \u2192 ${uploaded}\uFF08\u5DF2\u590D\u5236\u8FDB\u5DE5\u4F5C\u533A\uFF09`);
      } else {
        failed.push(`${item.fullName}\uFF08${uploaded.message}\uFF09`);
        manual.push({ query: item.query, fullName: item.fullName });
      }
    }
    setBusy(false);
    const parts = [];
    if (added.length > 0) {
      parts.push(`\u5DF2\u52A0\u5165\uFF1A${added.join("\uFF1B")}`);
    }
    if (failed.length > 0) {
      setQuery(manual[0]?.query ?? query);
      parts.push(`\u4E0A\u4F20\u5931\u8D25\uFF1A${failed.join("\uFF1B")}\u2014\u2014\u53EF\u4ECE\u5019\u9009\u70B9\u9009\uFF0C\u6216\u7C98\u8D34\u5B8C\u6574\u8DEF\u5F84\u540E\u56DE\u8F66`);
    }
    if (skipped.length > 0) parts.push(`\u5DF2\u8DF3\u8FC7\uFF1A${skipped.join("\uFF1B")}`);
    setNotice(parts.join("\u3002"));
  };
  const onDrop = (event) => {
    event.preventDefault();
    setDragActive(false);
    void handleFiles(Array.from(event.dataTransfer.files));
  };
  const onQueryKeyDown = (event) => {
    if (event.key !== "Enter") return;
    event.preventDefault();
    const entered = query.trim();
    if (isAbsolutePathLike(entered)) {
      addPath(entered);
      setQuery("");
      setNotice("");
    }
  };
  const lockAll = disabled || busy;
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "lawyer-dialog__file-block", children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { className: "lawyer-dialog__label", children: [
      label,
      "\uFF08\u641C\u7D22\u5DE5\u4F5C\u533A \xB7 \u7C98\u8D34\u8DEF\u5F84 \xB7 \u62D6\u5165\u6587\u4EF6\uFF09"
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
      "div",
      {
        className: `lawyer-dialog__file-zone${dragActive ? " lawyer-dialog__file-zone--active" : ""}`,
        onDragOver: (event) => {
          event.preventDefault();
          setDragActive(true);
        },
        onDragLeave: () => setDragActive(false),
        onDrop,
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "lawyer-dialog__search-row", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
              "input",
              {
                type: "text",
                className: "lawyer-dialog__search-input",
                placeholder: "\u8F93\u5165\u6587\u4EF6\u540D\u641C\u7D22\uFF0C\u6216\u7C98\u8D34\u5B8C\u6574\u8DEF\u5F84\u540E\u56DE\u8F66",
                value: query,
                onChange: (event) => setQuery(event.target.value),
                onKeyDown: onQueryKeyDown,
                disabled: lockAll
              }
            ),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
              "button",
              {
                type: "button",
                className: "lawyer-dialog__browse",
                title: "\u9009\u62E9\u6587\u4EF6\uFF08\u56FE\u7247/\u6587\u672C\u76F4\u63A5\u8BFB\u53D6\uFF1BWord/PDF \u6309\u6587\u4EF6\u540D\u641C\u7D22\uFF09",
                onClick: () => fileInput.current?.click(),
                disabled: lockAll,
                children: "\u9009\u62E9\u6587\u4EF6"
              }
            ),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
              "input",
              {
                ref: fileInput,
                type: "file",
                multiple: true,
                accept: "image/png,image/jpeg,image/webp,image/gif,.txt,.md,.pdf,.doc,.docx",
                style: { display: "none" },
                onChange: (event) => {
                  void handleFiles(Array.from(event.target.files ?? []));
                  event.target.value = "";
                },
                disabled: lockAll
              }
            )
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", { className: "lawyer-dialog__candidates", children: [
            (searching || busy) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { className: "lawyer-dialog__candidate lawyer-dialog__candidate--hint", children: "\u641C\u7D22\u4E2D\u2026" }),
            !searching && !busy && searchUnavailable && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { className: "lawyer-dialog__candidate lawyer-dialog__candidate--hint", children: "\u65E0\u6CD5\u641C\u7D22\u5DE5\u4F5C\u533A\uFF08\u5F53\u524D\u6CA1\u6709\u6D3B\u52A8\u4F1A\u8BDD\uFF09\u2014\u2014\u53EF\u62D6\u5165\u56FE\u7247/\u6587\u672C\uFF0C\u6216\u7C98\u8D34\u5B8C\u6574\u8DEF\u5F84\u540E\u56DE\u8F66" }),
            !searching && !busy && !searchUnavailable && candidates.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { className: "lawyer-dialog__candidate lawyer-dialog__candidate--hint", children: "\u6CA1\u6709\u5339\u914D\u7684\u6587\u4EF6" }),
            !searching && !busy && !searchUnavailable && candidates.slice(0, CANDIDATE_LIMIT).map((candidate, index) => {
              if (candidate.kind === "directory") {
                return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
                  "button",
                  {
                    type: "button",
                    className: "lawyer-dialog__candidate",
                    title: candidate.path,
                    onClick: () => setQuery(`${candidate.path}/`),
                    disabled: lockAll,
                    children: [
                      "\u{1F4C1} ",
                      basename(candidate.path),
                      "/"
                    ]
                  }
                ) }, `dir-${index}`);
              }
              const selected = value.paths.includes(candidate.path);
              return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
                "button",
                {
                  type: "button",
                  className: `lawyer-dialog__candidate${selected ? " lawyer-dialog__candidate--selected" : ""}`,
                  title: candidate.path,
                  onClick: () => addPath(candidate.path),
                  disabled: lockAll || selected,
                  children: [
                    selected ? "\u2713" : "\u{1F4C4}",
                    " ",
                    basename(candidate.path)
                  ]
                }
              ) }, `file-${index}`);
            })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "lawyer-dialog__drop-hint", children: dropHint })
        ]
      }
    ),
    value.paths.length + value.images.length + value.texts.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", { className: "lawyer-dialog__files", children: [
      value.paths.map((path, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { className: "lawyer-dialog__file", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "lawyer-dialog__file-name", title: path, children: [
          "\u{1F4C3} ",
          basename(path)
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          "button",
          {
            type: "button",
            className: "lawyer-dialog__file-remove",
            "aria-label": `\u79FB\u9664 ${path}`,
            onClick: () => onChange({
              ...value,
              paths: value.paths.filter((_, i) => i !== index)
            }),
            disabled: lockAll,
            children: "\u2715"
          }
        )
      ] }, `path-${index}`)),
      value.images.map((image, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { className: "lawyer-dialog__file", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "lawyer-dialog__file-name", title: image.name, children: [
          "\u{1F5BC} ",
          image.name,
          "\uFF08",
          formatBytes(image.bytes),
          "\uFF09"
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          "button",
          {
            type: "button",
            className: "lawyer-dialog__file-remove",
            "aria-label": `\u79FB\u9664 ${image.name}`,
            onClick: () => onChange({
              ...value,
              images: value.images.filter((_, i) => i !== index)
            }),
            disabled: lockAll,
            children: "\u2715"
          }
        )
      ] }, `img-${index}`)),
      value.texts.map((text, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { className: "lawyer-dialog__file", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "lawyer-dialog__file-name", title: text.name, children: [
          "\u{1F4C4} ",
          text.name,
          "\uFF08",
          formatBytes(text.content.length),
          "\uFF09"
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          "button",
          {
            type: "button",
            className: "lawyer-dialog__file-remove",
            "aria-label": `\u79FB\u9664 ${text.name}`,
            onClick: () => onChange({
              ...value,
              texts: value.texts.filter((_, i) => i !== index)
            }),
            disabled: lockAll,
            children: "\u2715"
          }
        )
      ] }, `txt-${index}`))
    ] }),
    notice !== "" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "lawyer-dialog__notice", children: notice })
  ] });
}

// lawyer-dsh/plugins/lawyer-sidebar/src/client/ContractReviewDialog.tsx
var import_jsx_runtime2 = require("react/jsx-runtime");
var SKILL_CATEGORIES = [
  {
    key: "review",
    label: "\u5BA1\u6838\u903B\u8F91",
    name: "contract-review",
    hint: "\u5408\u540C\u5BA1\u6838\u6846\u67B6\u4E0E\u6D41\u7A0B\uFF08\u542B\u6CD5\u89C4\u6838\u67E5\u3001\u53CC\u6587\u4EF6\u4EA4\u4ED8\uFF09"
  },
  {
    key: "preprocess",
    label: "\u8F93\u5165\u9884\u5904\u7406",
    name: "pdfkit-py",
    hint: "PDF \u8F6C docx\u3001\u626B\u63CF\u4EF6\u6E32\u67D3\u8F6C\u5F55\u3001\u52A0\u5BC6\u5904\u7406"
  },
  {
    key: "output",
    label: "\u6587\u6863\u8F93\u51FA",
    name: "docx-tracked-changes",
    hint: "\u4FEE\u8BA2\u7559\u75D5\u5BA1\u9605\u7A3F\uFF08Word/WPS \u5BA1\u9605\u6A21\u5F0F\uFF09"
  }
];
var STANCE_OPTIONS = [
  "\u7532\u65B9",
  "\u4E59\u65B9",
  "\u4E19\u65B9\u6216\u5176\u4ED6\u5F53\u4E8B\u65B9",
  "\u4E0D\u6307\u5B9A\uFF08\u4EE5\u4E2D\u7ACB\u89C6\u89D2\u5168\u9762\u5BA1\u6838\uFF09"
];
var STRICTNESS_HINTS = {
  \u5BBD\u677E: "\u53EA\u62A5\u9AD8\u98CE\u9669\u4E0E\u6838\u5FC3\u6761\u6B3E\u95EE\u9898",
  \u5E38\u89C4: "\u6807\u51C6\u6846\u67B6\u5168\u9762\u5BA1\u6838",
  \u4E25\u683C: "\u9010\u6761\u6DF1\u6316\uFF0C\u6CD5\u89C4\u6838\u67E5\u5168\u8986\u76D6"
};
function ContractReviewDialog({
  onCancel,
  onSubmit,
  searchWorkspaceFiles,
  uploadWorkspaceFile,
  listInstalledSkills
}) {
  const [stance, setStance] = (0, import_react2.useState)(STANCE_OPTIONS[0]);
  const [strictness, setStrictness] = (0, import_react2.useState)("\u5E38\u89C4");
  const [reviewerName, setReviewerName] = (0, import_react2.useState)("");
  const [files, setFiles] = (0, import_react2.useState)(EMPTY_FILE_PICKER_VALUE);
  const [busy, setBusy] = (0, import_react2.useState)(false);
  const [advancedOpen, setAdvancedOpen] = (0, import_react2.useState)(false);
  const [skillEnabled, setSkillEnabled] = (0, import_react2.useState)({ review: true, preprocess: true, output: true });
  const [extraSkills, setExtraSkills] = (0, import_react2.useState)([]);
  const [installedSkills, setInstalledSkills] = (0, import_react2.useState)(void 0);
  const [skillsLoading, setSkillsLoading] = (0, import_react2.useState)(false);
  (0, import_react2.useEffect)(() => {
    if (!advancedOpen || installedSkills !== void 0 || skillsLoading) return;
    setSkillsLoading(true);
    listInstalledSkills().then(
      (entries) => {
        setInstalledSkills(entries ?? []);
        setSkillsLoading(false);
      },
      () => {
        setInstalledSkills([]);
        setSkillsLoading(false);
      }
    );
  }, [advancedOpen, installedSkills, skillsLoading, listInstalledSkills]);
  const selectableSkills = (installedSkills ?? []).filter(
    (entry) => !SKILL_CATEGORIES.some((category) => category.name === entry.name) && !extraSkills.includes(entry.name)
  );
  const submit = () => {
    setBusy(true);
    onSubmit({
      stance,
      strictness,
      reviewerName: reviewerName.trim(),
      skills: { ...skillEnabled, extraSkills },
      paths: files.paths,
      images: files.images,
      texts: files.texts
    });
  };
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
    "div",
    {
      className: "lawyer-dialog-mask",
      role: "dialog",
      "aria-modal": "true",
      "aria-label": "\u53D1\u8D77\u5408\u540C\u5BA1\u6838",
      onClick: (event) => {
        if (event.target === event.currentTarget) onCancel();
      },
      children: /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "lawyer-dialog", children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "lawyer-dialog__header", children: [
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("h2", { className: "lawyer-dialog__title", children: "\u53D1\u8D77\u5408\u540C\u5BA1\u6838" }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
            "button",
            {
              type: "button",
              className: "lawyer-dialog__close",
              "aria-label": "\u5173\u95ED",
              onClick: onCancel,
              disabled: busy,
              children: "\u2715"
            }
          )
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("label", { className: "lawyer-dialog__label", htmlFor: "lawyer-stance", children: "\u6211\u65B9\u7ACB\u573A" }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
          "select",
          {
            id: "lawyer-stance",
            className: "lawyer-dialog__select",
            value: stance,
            onChange: (event) => setStance(event.target.value),
            disabled: busy,
            children: STANCE_OPTIONS.map((option) => /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("option", { value: option, children: option }, option))
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
          FilePicker,
          {
            label: "\u5408\u540C\u6587\u4EF6",
            dropHint: "\u4EFB\u610F\u5408\u540C\u6587\u4EF6\uFF08Word/PDF/\u56FE\u7247/\u6587\u672C\uFF09\u62D6\u5165\u5373\u53EF\u2014\u2014\u81EA\u52A8\u590D\u5236\u8FDB\u5DE5\u4F5C\u533A\u540E\u5F15\u7528",
            value: files,
            onChange: setFiles,
            disabled: busy,
            searchWorkspaceFiles,
            uploadWorkspaceFile
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "lawyer-dialog__label", children: "\u5BA1\u6838\u4E25\u683C\u7A0B\u5EA6" }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "lawyer-dialog__strictness", role: "radiogroup", "aria-label": "\u5BA1\u6838\u4E25\u683C\u7A0B\u5EA6", children: ["\u5BBD\u677E", "\u5E38\u89C4", "\u4E25\u683C"].map((option) => /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("label", { className: "lawyer-dialog__strictness-option", children: [
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
            "input",
            {
              type: "radio",
              name: "lawyer-strictness",
              checked: strictness === option,
              onChange: () => setStrictness(option),
              disabled: busy
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("span", { children: [
            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "lawyer-dialog__strictness-name", children: option }),
            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "lawyer-dialog__strictness-hint", children: STRICTNESS_HINTS[option] })
          ] })
        ] }, option)) }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("label", { className: "lawyer-dialog__label", htmlFor: "lawyer-reviewer", children: "\u4FEE\u8BA2\u4EBA\u7F72\u540D\uFF08docx \u5BA1\u9605\u7A3F\u7559\u75D5\u7528\uFF09" }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
          "input",
          {
            id: "lawyer-reviewer",
            type: "text",
            className: "lawyer-dialog__input",
            placeholder: "\u5982\uFF1AXX\u5F8B\u6240-\u5F20\u5F8B\u5E08\uFF1B\u7559\u7A7A\u5219\u9ED8\u8BA4\u201C\u5F8B\u5E08\u5DE5\u4F5C\u53F0\u201D",
            value: reviewerName,
            onChange: (event) => setReviewerName(event.target.value),
            disabled: busy
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(
          "button",
          {
            type: "button",
            className: "lawyer-dialog__advanced-toggle",
            onClick: () => setAdvancedOpen((current) => !current),
            disabled: busy,
            "aria-expanded": advancedOpen,
            children: [
              advancedOpen ? "\u25BE" : "\u25B8",
              " \u9AD8\u7EA7\u9009\u9879\uFF08\u6280\u80FD\u914D\u7F6E\uFF09"
            ]
          }
        ),
        advancedOpen && /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "lawyer-dialog__advanced", children: [
          SKILL_CATEGORIES.map((category) => /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("label", { className: "lawyer-dialog__skill-option", children: [
            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
              "input",
              {
                type: "checkbox",
                checked: skillEnabled[category.key],
                onChange: (event) => setSkillEnabled((current) => ({
                  ...current,
                  [category.key]: event.target.checked
                })),
                disabled: busy
              }
            ),
            /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("span", { children: [
              /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "lawyer-dialog__skill-category", children: category.label }),
              /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "lawyer-dialog__skill-name", children: category.name }),
              /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "lawyer-dialog__strictness-hint", children: category.hint })
            ] })
          ] }, category.key)),
          extraSkills.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("ul", { className: "lawyer-dialog__files", children: extraSkills.map((name, index) => /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("li", { className: "lawyer-dialog__file", children: [
            /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("span", { className: "lawyer-dialog__file-name", title: `\u9644\u52A0\u6280\u80FD\uFF1A${name}`, children: [
              "\u26A1 ",
              name
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
              "button",
              {
                type: "button",
                className: "lawyer-dialog__file-remove",
                "aria-label": `\u79FB\u9664 ${name}`,
                onClick: () => setExtraSkills((current) => current.filter((_, i) => i !== index)),
                disabled: busy,
                children: "\u2715"
              }
            )
          ] }, name)) }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "lawyer-dialog__search-row", children: /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(
            "select",
            {
              className: "lawyer-dialog__select",
              value: "",
              disabled: busy || skillsLoading || selectableSkills.length === 0,
              onChange: (event) => {
                const name = event.target.value;
                if (name !== "") setExtraSkills((current) => [...current, name]);
                event.target.value = "";
              },
              children: [
                /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("option", { value: "", children: skillsLoading ? "\u6B63\u5728\u52A0\u8F7D\u5DF2\u5B89\u88C5\u6280\u80FD\u2026" : selectableSkills.length === 0 ? "\u6CA1\u6709\u66F4\u591A\u53EF\u6DFB\u52A0\u7684\u6280\u80FD" : "\u9009\u62E9\u8981\u52A0\u8F7D\u7684\u5DF2\u5B89\u88C5\u6280\u80FD\u2026" }),
                selectableSkills.map((entry) => /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("option", { value: entry.name, children: [
                  entry.name,
                  entry.modelInvocable ? "" : "\uFF08\u4EC5\u624B\u52BF\uFF09",
                  " \u2014 ",
                  entry.description.slice(0, 30)
                ] }, entry.name))
              ]
            }
          ) })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "lawyer-dialog__actions", children: [
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("button", { type: "button", className: "lawyer-dialog__cancel", onClick: onCancel, disabled: busy, children: "\u53D6\u6D88" }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("button", { type: "button", className: "lawyer-dialog__submit", onClick: submit, disabled: busy, children: busy ? "\u6B63\u5728\u53D1\u8D77\u2026" : "\u5F00\u59CB\u5BA1\u6838" })
        ] })
      ] })
    }
  );
}

// lawyer-dsh/plugins/lawyer-sidebar/src/client/CaseAnalysisDialog.tsx
var import_react3 = require("react");
var import_jsx_runtime3 = require("react/jsx-runtime");
var STANCE_OPTIONS2 = [
  "\u539F\u544A\u65B9",
  "\u88AB\u544A\u65B9",
  "\u4E0A\u8BC9\u65B9",
  "\u88AB\u4E0A\u8BC9\u65B9",
  "\u4E2D\u7ACB\u8BC4\u4F30\uFF08\u4E0D\u9884\u8BBE\u7ACB\u573A\uFF09"
];
var FOCUS_OPTIONS = [
  { key: "facts", label: "\u4E8B\u5B9E\u68B3\u7406", hint: "\u65F6\u95F4\u7EBF\u4E0E\u4E8B\u5B9E\u4E09\u5206\uFF08\u65E0\u4E89\u8BAE/\u4E89\u8BAE/\u5F85\u67E5\uFF09" },
  { key: "relations", label: "\u6CD5\u5F8B\u5173\u7CFB\u8BC6\u522B", hint: "\u4E3B\u4ECE\u6CD5\u5F8B\u5173\u7CFB\u5B9A\u6027\u4E0E\u7ADE\u5408\u9009\u62E9" },
  { key: "issues", label: "\u4E89\u8BAE\u7126\u70B9\u5F52\u7EB3", hint: "\u4E8B\u5B9E\u7126\u70B9\u4E0E\u6CD5\u5F8B\u7126\u70B9\u3001\u53CC\u65B9\u4E3B\u5F20" },
  { key: "evidence", label: "\u8BC1\u636E\u5BA1\u67E5", hint: "\u4E09\u6027\u5BA1\u67E5\u3001\u8BC1\u660E\u529B\u4E0E\u8865\u8BC1\u5EFA\u8BAE" },
  { key: "claims", label: "\u8BF7\u6C42\u6743\u57FA\u7840\u5206\u6790", hint: "\u8981\u4EF6\u6DB5\u6444\u4E0E\u6297\u8FA9\u68C0\u89C6" },
  { key: "risk", label: "\u8BC9\u8BBC\u98CE\u9669\u8BC4\u4F30", hint: "\u80DC\u8BC9\u524D\u666F\u3001\u7A0B\u5E8F\u98CE\u9669\u4E0E\u5173\u952E\u53D8\u91CF" }
];
function CaseAnalysisDialog({
  onCancel,
  onSubmit,
  searchWorkspaceFiles,
  uploadWorkspaceFile
}) {
  const [stance, setStance] = (0, import_react3.useState)(STANCE_OPTIONS2[0]);
  const [focus, setFocus] = (0, import_react3.useState)(FOCUS_OPTIONS.map((option) => option.key));
  const [files, setFiles] = (0, import_react3.useState)(EMPTY_FILE_PICKER_VALUE);
  const [busy, setBusy] = (0, import_react3.useState)(false);
  const toggleFocus = (key, checked) => {
    setFocus((current) => checked ? [...current, key] : current.filter((item) => item !== key));
  };
  const submit = () => {
    setBusy(true);
    onSubmit({
      stance,
      focus,
      paths: files.paths,
      images: files.images,
      texts: files.texts
    });
  };
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
    "div",
    {
      className: "lawyer-dialog-mask",
      role: "dialog",
      "aria-modal": "true",
      "aria-label": "\u53D1\u8D77\u6848\u4EF6\u5206\u6790",
      onClick: (event) => {
        if (event.target === event.currentTarget) onCancel();
      },
      children: /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "lawyer-dialog", children: [
        /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "lawyer-dialog__header", children: [
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("h2", { className: "lawyer-dialog__title", children: "\u53D1\u8D77\u6848\u4EF6\u5206\u6790" }),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
            "button",
            {
              type: "button",
              className: "lawyer-dialog__close",
              "aria-label": "\u5173\u95ED",
              onClick: onCancel,
              disabled: busy,
              children: "\u2715"
            }
          )
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("label", { className: "lawyer-dialog__label", htmlFor: "lawyer-case-stance", children: "\u6211\u65B9\u7ACB\u573A" }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
          "select",
          {
            id: "lawyer-case-stance",
            className: "lawyer-dialog__select",
            value: stance,
            onChange: (event) => setStance(event.target.value),
            disabled: busy,
            children: STANCE_OPTIONS2.map((option) => /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("option", { value: option, children: option }, option))
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "lawyer-dialog__label", children: "\u5206\u6790\u4FA7\u91CD\uFF08\u5168\u90E8\u53D6\u6D88\u65F6\u5C06\u7531 AI \u5148\u4E0E\u4F60\u786E\u8BA4\u8303\u56F4\uFF09" }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "lawyer-dialog__strictness", children: FOCUS_OPTIONS.map((option) => /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("label", { className: "lawyer-dialog__skill-option", children: [
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
            "input",
            {
              type: "checkbox",
              checked: focus.includes(option.key),
              onChange: (event) => toggleFocus(option.key, event.target.checked),
              disabled: busy
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("span", { children: [
            /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "lawyer-dialog__skill-name", children: option.label }),
            /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "lawyer-dialog__strictness-hint", children: option.hint })
          ] })
        ] }, option.key)) }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
          FilePicker,
          {
            label: "\u6848\u4EF6\u6750\u6599",
            dropHint: "\u8D77\u8BC9\u72B6\u3001\u5408\u540C\u3001\u8BC1\u636E\u3001\u804A\u5929\u8BB0\u5F55\u7B49\uFF08Word/PDF/\u56FE\u7247/\u6587\u672C\uFF09\u62D6\u5165\u5373\u53EF\u2014\u2014\u81EA\u52A8\u590D\u5236\u8FDB\u5DE5\u4F5C\u533A\u540E\u5F15\u7528",
            value: files,
            onChange: setFiles,
            disabled: busy,
            searchWorkspaceFiles,
            uploadWorkspaceFile
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "lawyer-dialog__actions", children: [
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("button", { type: "button", className: "lawyer-dialog__cancel", onClick: onCancel, disabled: busy, children: "\u53D6\u6D88" }),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("button", { type: "button", className: "lawyer-dialog__submit", onClick: submit, disabled: busy, children: busy ? "\u6B63\u5728\u53D1\u8D77\u2026" : "\u5F00\u59CB\u5206\u6790" })
        ] })
      ] })
    }
  );
}

// lawyer-dsh/plugins/lawyer-sidebar/src/client/DocGenerationDialog.tsx
var import_react4 = require("react");
var import_jsx_runtime4 = require("react/jsx-runtime");
var DOC_TYPES = [
  { type: "\u6C11\u4E8B\u8D77\u8BC9\u72B6", hint: "\u5F53\u4E8B\u4EBA\u6BB5 + \u8BC9\u8BBC\u8BF7\u6C42\u9010\u9879\u7F16\u53F7 + \u4E8B\u5B9E\u4E0E\u7406\u7531" },
  { type: "\u6C11\u4E8B\u7B54\u8FA9\u72B6", hint: "\u9488\u5BF9\u8D77\u8BC9\u72B6\u9010\u9879\u8868\u6001\u4E0E\u7B54\u8FA9" },
  { type: "\u4EE3\u7406\u8BCD", hint: "\u56F4\u7ED5\u4E89\u8BAE\u7126\u70B9\u5206\u70B9\u8BBA\u8BC1" },
  { type: "\u6CD5\u5F8B\u610F\u89C1\u4E66", hint: "\u59D4\u6258\u4E8B\u9879\u7684\u6CD5\u5F8B\u5206\u6790\u4E0E\u7ED3\u8BBA\u610F\u89C1" }
];
var PARTY_ROLE_OPTIONS = ["\u539F\u544A", "\u88AB\u544A", "\u7B2C\u4E09\u4EBA"];
function DocGenerationDialog({
  onCancel,
  onSubmit,
  searchWorkspaceFiles,
  uploadWorkspaceFile
}) {
  const [docType, setDocType] = (0, import_react4.useState)(DOC_TYPES[0].type);
  const [partyRole, setPartyRole] = (0, import_react4.useState)(PARTY_ROLE_OPTIONS[0]);
  const [notes, setNotes] = (0, import_react4.useState)("");
  const [files, setFiles] = (0, import_react4.useState)(EMPTY_FILE_PICKER_VALUE);
  const [busy, setBusy] = (0, import_react4.useState)(false);
  const submit = () => {
    setBusy(true);
    onSubmit({
      docType,
      partyRole,
      notes: notes.trim(),
      paths: files.paths,
      images: files.images,
      texts: files.texts
    });
  };
  return /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
    "div",
    {
      className: "lawyer-dialog-mask",
      role: "dialog",
      "aria-modal": "true",
      "aria-label": "\u53D1\u8D77\u6848\u4EF6\u6587\u4E66\u751F\u6210",
      onClick: (event) => {
        if (event.target === event.currentTarget) onCancel();
      },
      children: /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "lawyer-dialog", children: [
        /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "lawyer-dialog__header", children: [
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("h2", { className: "lawyer-dialog__title", children: "\u53D1\u8D77\u6848\u4EF6\u6587\u4E66\u751F\u6210" }),
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
            "button",
            {
              type: "button",
              className: "lawyer-dialog__close",
              "aria-label": "\u5173\u95ED",
              onClick: onCancel,
              disabled: busy,
              children: "\u2715"
            }
          )
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { className: "lawyer-dialog__label", children: "\u6587\u4E66\u7C7B\u578B" }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "lawyer-dialog__strictness", role: "radiogroup", "aria-label": "\u6587\u4E66\u7C7B\u578B", children: DOC_TYPES.map((option) => /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("label", { className: "lawyer-dialog__strictness-option", children: [
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
            "input",
            {
              type: "radio",
              name: "lawyer-doc-type",
              checked: docType === option.type,
              onChange: () => setDocType(option.type),
              disabled: busy
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("span", { children: [
            /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { className: "lawyer-dialog__strictness-name", children: option.type }),
            /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { className: "lawyer-dialog__strictness-hint", children: option.hint })
          ] })
        ] }, option.type)) }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("label", { className: "lawyer-dialog__label", htmlFor: "lawyer-party-role", children: "\u6211\u65B9\u5F53\u4E8B\u4EBA\u8EAB\u4EFD" }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
          "select",
          {
            id: "lawyer-party-role",
            className: "lawyer-dialog__select",
            value: partyRole,
            onChange: (event) => setPartyRole(event.target.value),
            disabled: busy,
            children: PARTY_ROLE_OPTIONS.map((option) => /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("option", { value: option, children: option }, option))
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("label", { className: "lawyer-dialog__label", htmlFor: "lawyer-doc-notes", children: "\u8865\u5145\u8BF4\u660E\uFF08\u53EF\u9009\uFF09" }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
          "textarea",
          {
            id: "lawyer-doc-notes",
            className: "lawyer-dialog__textarea",
            placeholder: "\u5982\uFF1A\u8BC9\u8BF7\u91D1\u989D\u4E0E\u8BA1\u7B97\u65B9\u5F0F\u3001\u7BA1\u8F96\u6CD5\u9662\u3001\u843D\u6B3E\u5F8B\u6240\u4E0E\u5F8B\u5E08\u59D3\u540D\u3001\u7B54\u8FA9\u671F\u9650\u7B49",
            value: notes,
            onChange: (event) => setNotes(event.target.value),
            disabled: busy
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
          FilePicker,
          {
            label: "\u6848\u4EF6\u6750\u6599",
            dropHint: "\u8D77\u8BC9\u72B6\u3001\u5408\u540C\u3001\u8BC1\u636E\u3001\u804A\u5929\u8BB0\u5F55\u7B49\uFF08Word/PDF/\u56FE\u7247/\u6587\u672C\uFF09\u62D6\u5165\u5373\u53EF\u2014\u2014\u81EA\u52A8\u590D\u5236\u8FDB\u5DE5\u4F5C\u533A\u540E\u5F15\u7528",
            value: files,
            onChange: setFiles,
            disabled: busy,
            searchWorkspaceFiles,
            uploadWorkspaceFile
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("p", { className: "lawyer-dialog__drop-hint", children: "\u5F53\u4E8B\u4EBA\u59D3\u540D\u3001\u8BC1\u4EF6\u53F7\u3001\u4F4F\u5740\u3001\u6CD5\u9662\u540D\u79F0\u7B49\u672A\u63D0\u4F9B\u4FE1\u606F\uFF0C\u5C06\u5728\u6587\u4E66\u4E2D\u7559\u3010\u5F85\u586B\uFF1A\u2026\u3011\u5360\u4F4D\uFF0C\u4E0D\u4F1A\u7F16\u9020\u3002" }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "lawyer-dialog__actions", children: [
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("button", { type: "button", className: "lawyer-dialog__cancel", onClick: onCancel, disabled: busy, children: "\u53D6\u6D88" }),
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("button", { type: "button", className: "lawyer-dialog__submit", onClick: submit, disabled: busy, children: busy ? "\u6B63\u5728\u53D1\u8D77\u2026" : "\u5F00\u59CB\u751F\u6210" })
        ] })
      ] })
    }
  );
}

// lawyer-dsh/plugins/lawyer-sidebar/src/client/LawyerSidebar.tsx
var import_jsx_runtime5 = require("react/jsx-runtime");
function ContractIcon({ size = 18 }) {
  return /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("svg", { width: size, height: size, viewBox: "0 0 16 16", fill: "none", "aria-hidden": "true", focusable: "false", children: [
    /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
      "path",
      {
        d: "M9.5 1.5H4.25C3.56 1.5 3 2.06 3 2.75v10.5c0 .69.56 1.25 1.25 1.25h7.5c.69 0 1.25-.56 1.25-1.25V6L9.5 1.5Z",
        stroke: "currentColor",
        strokeWidth: "1.1",
        strokeLinejoin: "round"
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("path", { d: "M9.5 1.5V6H13", stroke: "currentColor", strokeWidth: "1.1", strokeLinejoin: "round" }),
    /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("path", { d: "M5.5 8.5h5M5.5 11h3.5", stroke: "currentColor", strokeWidth: "1.1", strokeLinecap: "round" })
  ] });
}
function SearchIcon({ size = 18 }) {
  return /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("svg", { width: size, height: size, viewBox: "0 0 16 16", fill: "none", "aria-hidden": "true", focusable: "false", children: [
    /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("circle", { cx: "7", cy: "7", r: "4.5", stroke: "currentColor", strokeWidth: "1.1" }),
    /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("path", { d: "M10.5 10.5 14 14", stroke: "currentColor", strokeWidth: "1.1", strokeLinecap: "round" })
  ] });
}
function PenIcon({ size = 18 }) {
  return /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("svg", { width: size, height: size, viewBox: "0 0 16 16", fill: "none", "aria-hidden": "true", focusable: "false", children: [
    /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
      "path",
      {
        d: "M3 13.2l.8-3.2 8.3-8.3a1.5 1.5 0 0 1 2.1 2.1L5.9 12.1 3 13.2Z",
        stroke: "currentColor",
        strokeWidth: "1.1",
        strokeLinejoin: "round"
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("path", { d: "M10.5 3.2l2.1 2.1", stroke: "currentColor", strokeWidth: "1.1", strokeLinecap: "round" })
  ] });
}
function WatermarkIcon({ size = 18 }) {
  return /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("svg", { width: size, height: size, viewBox: "0 0 16 16", fill: "none", "aria-hidden": "true", focusable: "false", children: [
    /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
      "path",
      {
        d: "M9.5 1.5H4.25C3.56 1.5 3 2.06 3 2.75v10.5c0 .69.56 1.25 1.25 1.25h7.5c.69 0 1.25-.56 1.25-1.25V6L9.5 1.5Z",
        stroke: "currentColor",
        strokeWidth: "1.1",
        strokeLinejoin: "round"
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("path", { d: "M9.5 1.5V6H13", stroke: "currentColor", strokeWidth: "1.1", strokeLinejoin: "round" }),
    /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("path", { d: "M5.2 10c.8-.9 1.7-.9 2.5 0s1.7.9 2.5 0", stroke: "currentColor", strokeWidth: "1.1", strokeLinecap: "round" })
  ] });
}
function LawyerSidebar({
  submitContractReview,
  submitCaseAnalysis,
  submitDocGeneration,
  searchWorkspaceFiles,
  uploadWorkspaceFile,
  listInstalledSkills
}) {
  const [reviewOpen, setReviewOpen] = (0, import_react5.useState)(false);
  const [caseOpen, setCaseOpen] = (0, import_react5.useState)(false);
  const [docOpen, setDocOpen] = (0, import_react5.useState)(false);
  const tabs = [
    {
      id: "contract-review",
      label: "\u5408\u540C\u5BA1\u6838",
      icon: /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(ContractIcon, {}),
      disabled: false,
      title: "\u5408\u540C\u5BA1\u6838\uFF1A\u586B\u5199\u8868\u5355\u540E\u53D1\u8D77\u5F8B\u5E08\u6A21\u5F0F\u4F1A\u8BDD",
      onClick: () => setReviewOpen(true)
    },
    {
      id: "case-analysis",
      label: "\u6848\u4EF6\u5206\u6790",
      icon: /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(SearchIcon, {}),
      disabled: false,
      title: "\u6848\u4EF6\u5206\u6790\uFF1A\u4E8B\u5B9E\u68B3\u7406 / \u4E89\u8BAE\u7126\u70B9 / \u8BC1\u636E\u5BA1\u67E5 / \u98CE\u9669\u8BC4\u4F30",
      onClick: () => setCaseOpen(true)
    },
    {
      id: "doc-generation",
      label: "\u6848\u4EF6\u6587\u4E66\u751F\u6210",
      icon: /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(PenIcon, {}),
      disabled: false,
      title: "\u6587\u4E66\u751F\u6210\uFF1A\u8D77\u8BC9\u72B6 / \u7B54\u8FA9\u72B6 / \u4EE3\u7406\u8BCD / \u6CD5\u5F8B\u610F\u89C1\u4E66",
      onClick: () => setDocOpen(true)
    },
    { id: "pdf-watermark", label: "PDF \u53BB\u6C34\u5370", icon: /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(WatermarkIcon, {}), disabled: true, title: "\u529F\u80FD\u5F00\u53D1\u4E2D" }
  ];
  return /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)(import_jsx_runtime5.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("nav", { className: "lawyer-sidebar", "aria-label": "\u5F8B\u5E08\u5DE5\u4F5C\u53F0", children: tabs.map((tab) => /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)(
      "button",
      {
        type: "button",
        className: "lawyer-sidebar__tab",
        disabled: tab.disabled,
        onClick: tab.onClick,
        title: tab.title,
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("span", { className: "lawyer-sidebar__tab-icon", children: tab.icon }),
          /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("span", { className: "lawyer-sidebar__tab-label", children: tab.label })
        ]
      },
      tab.id
    )) }),
    reviewOpen && /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
      ContractReviewDialog,
      {
        onCancel: () => setReviewOpen(false),
        onSubmit: (request) => {
          setReviewOpen(false);
          submitContractReview(request);
        },
        searchWorkspaceFiles,
        uploadWorkspaceFile,
        listInstalledSkills
      }
    ),
    caseOpen && /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
      CaseAnalysisDialog,
      {
        onCancel: () => setCaseOpen(false),
        onSubmit: (request) => {
          setCaseOpen(false);
          submitCaseAnalysis(request);
        },
        searchWorkspaceFiles,
        uploadWorkspaceFile
      }
    ),
    docOpen && /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
      DocGenerationDialog,
      {
        onCancel: () => setDocOpen(false),
        onSubmit: (request) => {
          setDocOpen(false);
          submitDocGeneration(request);
        },
        searchWorkspaceFiles,
        uploadWorkspaceFile
      }
    )
  ] });
}

// lawyer-dsh/plugins/lawyer-sidebar/src/client/index.ts
var inject = ["slots", "sessions", "workspaces", "connection"];
var LAWYER_PRESET = "lawyer";
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
.lawyer-dialog-mask {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  justify-content: center;
  overflow-y: auto;
  background: rgb(0 0 0 / 45%);
  font-family: inherit;
}
.lawyer-dialog {
  width: min(560px, calc(100vw - 48px));
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
.lawyer-dialog__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}
.lawyer-dialog__title {
  margin: 0;
  font-size: 17px;
  font-weight: 600;
}
.lawyer-dialog__close {
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: var(--dsw-alias-label-secondary, inherit);
  font-size: 14px;
  cursor: pointer;
}
.lawyer-dialog__close:not(:disabled):hover {
  background: var(--dsw-alias-interactive-bg-hover);
}
.lawyer-dialog__label {
  display: block;
  margin: 14px 0 6px;
  font-weight: 500;
}
.lawyer-dialog__select,
.lawyer-dialog__input {
  width: 100%;
  box-sizing: border-box;
  height: 36px;
  padding: 0 10px;
  border-radius: 8px;
  border: 1px solid var(--dsw-alias-border-l2);
  background: var(--dsw-alias-fill-normal, transparent);
  color: inherit;
  font-size: 14px;
  font-family: inherit;
}
.lawyer-dialog__select:focus,
.lawyer-dialog__input:focus {
  outline: none;
  border-color: var(--dsw-alias-brand-primary);
}
.lawyer-dialog__textarea {
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
.lawyer-dialog__textarea:focus {
  outline: none;
  border-color: var(--dsw-alias-brand-primary);
}
.lawyer-dialog__file-zone {
  border: 1.5px dashed var(--dsw-alias-border-l2);
  border-radius: 10px;
  padding: 10px;
}
.lawyer-dialog__file-zone--active {
  border-color: var(--dsw-alias-brand-primary);
  background: var(--dsw-alias-interactive-bg-hover);
}
.lawyer-dialog__search-row {
  display: flex;
  gap: 8px;
}
.lawyer-dialog__search-input {
  flex: 1;
  min-width: 0;
  height: 34px;
  padding: 0 10px;
  border-radius: 8px;
  border: 1px solid var(--dsw-alias-border-l2);
  background: var(--dsw-alias-fill-normal, transparent);
  color: inherit;
  font-size: 13px;
  font-family: inherit;
}
.lawyer-dialog__search-input:focus {
  outline: none;
  border-color: var(--dsw-alias-brand-primary);
}
.lawyer-dialog__browse {
  flex: none;
  height: 34px;
  padding: 0 12px;
  border: none;
  border-radius: 8px;
  background: var(--dsw-alias-interactive-bg-hover);
  color: var(--dsw-alias-label-primary);
  font-size: 13px;
  font-family: inherit;
  cursor: pointer;
}
.lawyer-dialog__browse:not(:disabled):hover {
  opacity: 0.85;
}
.lawyer-dialog__candidates {
  list-style: none;
  margin: 8px 0 0;
  padding: 0;
  max-height: 176px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.lawyer-dialog__candidate {
  display: block;
  width: 100%;
  box-sizing: border-box;
  padding: 5px 8px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: var(--dsw-alias-label-primary);
  font-size: 13px;
  font-family: inherit;
  text-align: left;
  cursor: pointer;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.lawyer-dialog__candidate:not(:disabled):hover {
  background: var(--dsw-alias-interactive-bg-hover);
}
.lawyer-dialog__candidate:disabled {
  cursor: default;
}
.lawyer-dialog__candidate--hint {
  color: var(--dsw-alias-label-tertiary);
  cursor: default;
}
.lawyer-dialog__candidate--hint:hover {
  background: transparent;
}
.lawyer-dialog__candidate--selected {
  color: var(--dsw-alias-label-tertiary);
}
.lawyer-dialog__drop-hint {
  margin: 8px 0 0;
  font-size: 12px;
  color: var(--dsw-alias-label-tertiary);
}
.lawyer-dialog__files {
  list-style: none;
  margin: 10px 0 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.lawyer-dialog__file {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 6px 10px;
  border-radius: 8px;
  background: var(--dsw-alias-interactive-bg-hover);
}
.lawyer-dialog__file-name {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 13px;
}
.lawyer-dialog__file-remove {
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
.lawyer-dialog__file-remove:not(:disabled):hover {
  color: var(--dsw-alias-label-primary);
  background: var(--dsw-alias-border-l2);
}
.lawyer-dialog__notice {
  overflow-wrap: anywhere;
  margin: 10px 0 0;
  font-size: 12px;
  color: var(--dsw-alias-label-tertiary);
}
.lawyer-dialog__strictness {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.lawyer-dialog__strictness-option {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 8px 10px;
  border: 1px solid var(--dsw-alias-border-l2);
  border-radius: 8px;
  cursor: pointer;
}
.lawyer-dialog__strictness-option input {
  accent-color: var(--dsw-alias-button-primary-fill);
  margin-top: 2px;
}
.lawyer-dialog__strictness-name {
  display: block;
  font-weight: 500;
}
.lawyer-dialog__strictness-hint {
  display: block;
  font-size: 12px;
  color: var(--dsw-alias-label-tertiary);
}
.lawyer-dialog__advanced-toggle {
  display: block;
  width: 100%;
  margin-top: 14px;
  padding: 6px 0;
  border: none;
  border-top: 1px dashed var(--dsw-alias-border-l2);
  background: transparent;
  color: var(--dsw-alias-label-secondary, inherit);
  font-size: 13px;
  font-family: inherit;
  text-align: left;
  cursor: pointer;
}
.lawyer-dialog__advanced-toggle:not(:disabled):hover {
  color: var(--dsw-alias-label-primary);
}
.lawyer-dialog__advanced {
  padding: 10px 0 4px;
}
.lawyer-dialog__skill-option {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 6px 8px;
  border-radius: 8px;
  cursor: pointer;
}
.lawyer-dialog__skill-option:hover {
  background: var(--dsw-alias-interactive-bg-hover);
}
.lawyer-dialog__skill-option input {
  accent-color: var(--dsw-alias-button-primary-fill);
  margin-top: 2px;
}
.lawyer-dialog__skill-category {
  display: inline-block;
  margin-right: 8px;
  padding: 0 6px;
  border-radius: 4px;
  background: var(--dsw-alias-interactive-bg-hover);
  font-size: 11px;
  color: var(--dsw-alias-label-tertiary);
}
.lawyer-dialog__skill-name {
  display: inline-block;
  font-weight: 500;
  font-size: 13px;
}
.lawyer-dialog__actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 18px;
}
.lawyer-dialog__cancel,
.lawyer-dialog__submit {
  height: 34px;
  padding: 0 16px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
  cursor: pointer;
}
.lawyer-dialog__cancel {
  background: transparent;
  color: var(--dsw-alias-label-primary);
}
.lawyer-dialog__cancel:not(:disabled):hover {
  background: var(--dsw-alias-interactive-bg-hover);
}
.lawyer-dialog__submit {
  background: var(--dsw-alias-button-primary-fill);
  color: var(--dsw-alias-brand-primary-invert, #fff);
  font-weight: 500;
}
.lawyer-dialog__submit:not(:disabled):hover {
  background: var(--dsw-alias-button-primary-hover);
}
.lawyer-dialog__cancel:disabled,
.lawyer-dialog__submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
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
  const { api } = ctx.get("connection");
  const selectLawyerPreset = async (sessionId) => {
    try {
      const response = await api.agentPresets.select({ sessionId, agentPreset: LAWYER_PRESET });
      if (!response.result.ok) {
        console.error(
          `[lawyer-sidebar] \u5207\u6362\u5F8B\u5E08\u6A21\u5F0F\u5931\u8D25\uFF1A${response.result.error.message}\uFF08lawyer preset \u9700\u90E8\u7F72\u5230 ~/.dsh/.agent-presets/lawyer/\uFF0C\u8FD0\u884C debug-web.cmd \u53EF\u81EA\u52A8\u90E8\u7F72\uFF09`
        );
        return false;
      }
      ctx.sessions.noteAgentPreset(sessionId, response.result.value.agentPreset);
      return true;
    } catch (error) {
      console.error(
        `[lawyer-sidebar] \u5207\u6362\u5F8B\u5E08\u6A21\u5F0F\u8BF7\u6C42\u5F02\u5E38\uFF1A${error instanceof Error ? error.message : String(error)}`
      );
      return false;
    }
  };
  const sendParts = async (session, parts) => {
    const result = await session.prompt([...parts], "queue");
    if (!result.ok) {
      console.error(
        `[lawyer-sidebar] \u6CE8\u5165\u5F8B\u5E08\u4EFB\u52A1\u6307\u4EE4\u5931\u8D25\uFF1A${result.error.code} ${result.error.message}`
      );
    }
  };
  const startTaskIn = async (sessionId, parts) => {
    const summary = ctx.sessions.list.getSnapshot().byId[sessionId];
    if (summary === void 0 || summary.agentPreset !== LAWYER_PRESET) {
      if (!await selectLawyerPreset(sessionId)) return;
    }
    const session = ctx.sessions.binding(sessionId)?.session;
    if (session === void 0) {
      console.warn("[lawyer-sidebar] \u4F1A\u8BDD\u7ED1\u5B9A\u4E0D\u53EF\u7528\uFF0C\u5F8B\u5E08\u4EFB\u52A1\u6307\u4EE4\u672A\u6CE8\u5165");
      return;
    }
    await sendParts(session, parts);
  };
  const runWhenSessionReady = (parts) => {
    let settled = false;
    const unsubscribe = ctx.sessions.list.subscribe(() => {
      if (settled) return;
      const id = ctx.sessions.list.getSnapshot().current;
      if (id === void 0) return;
      settled = true;
      clearTimeout(timer);
      unsubscribe();
      void startTaskIn(id, parts);
    });
    const timer = window.setTimeout(() => {
      if (settled) return;
      settled = true;
      unsubscribe();
      console.warn("[lawyer-sidebar] \u65B0\u5EFA\u4F1A\u8BDD\u8D85\u65F6\uFF0C\u5F8B\u5E08\u4EFB\u52A1\u6307\u4EE4\u672A\u6CE8\u5165");
    }, NEW_SESSION_TIMEOUT_MS);
    ctx.workspaces.startSession();
  };
  const withImages = (text, images) => {
    const parts = [{ type: "text", text }];
    for (const image of images) {
      parts.push({ type: "image", mediaType: image.mediaType, data: image.data, name: image.name });
    }
    return parts;
  };
  const injectTask = (parts) => {
    const snapshot = ctx.sessions.list.getSnapshot();
    const current = snapshot.current;
    if (current !== void 0) {
      const summary = snapshot.byId[current];
      if (summary !== void 0 && summary.blank) {
        void startTaskIn(current, parts);
        return;
      }
    }
    if (ctx.workspaces.list.getSnapshot().items.length === 0) {
      console.warn("[lawyer-sidebar] \u6682\u65E0\u5DE5\u4F5C\u533A\uFF0C\u65E0\u6CD5\u53D1\u8D77\u5F8B\u5E08\u4EFB\u52A1\u2014\u2014\u8BF7\u5148\u521B\u5EFA\u5DE5\u4F5C\u533A");
      return;
    }
    runWhenSessionReady(parts);
  };
  const submitContractReview = (request) => {
    injectTask(withImages(buildContractReviewPrompt(request), request.images));
  };
  const submitCaseAnalysis = (request) => {
    injectTask(withImages(buildCaseAnalysisPrompt(request), request.images));
  };
  const submitDocGeneration = (request) => {
    injectTask(withImages(buildDocGenerationPrompt(request), request.images));
  };
  const searchWorkspaceFiles = (query, signal) => {
    const sessionId = ctx.sessions.list.getSnapshot().current;
    if (sessionId === void 0) return Promise.resolve(void 0);
    const fileReferences = ctx.get("remote.fileReferences");
    if (fileReferences === void 0) return Promise.resolve(void 0);
    return fileReferences.list(sessionId, query, signal).then(
      (result) => result.ok && result.value !== void 0 ? result.value : void 0,
      () => void 0
    );
  };
  const listInstalledSkills = () => {
    const sessionId = ctx.sessions.list.getSnapshot().current;
    if (sessionId === void 0) return Promise.resolve(void 0);
    return api.skills.list({ sessionId }).then(
      (result) => result.ok ? result.value.skills : void 0,
      () => void 0
    );
  };
  const uploadWorkspaceFile = (fileName, contentBase64, signal) => {
    const sessions = ctx.sessions.list.getSnapshot();
    const currentSession = sessions.current !== void 0 ? sessions.byId[sessions.current] : void 0;
    const workspaces = ctx.workspaces.list.getSnapshot().items;
    const workspace = workspaces.find(
      (item) => currentSession !== void 0 && item.workspaceId === currentSession.workspaceId
    ) ?? workspaces[0];
    if (workspace === void 0) return Promise.resolve(new Error("\u6682\u65E0\u5DE5\u4F5C\u533A\uFF0C\u65E0\u6CD5\u4E0A\u4F20\u5408\u540C\u6587\u4EF6"));
    const { rpc } = ctx.get("connection");
    return rpc.call(
      "/api",
      "lawyerFiles/save",
      { args: { cwd: workspace.path, fileName, contentBase64 } },
      signal
    ).then(
      (result) => {
        if (result.ok && typeof result.value?.path === "string") {
          return result.value.path;
        }
        const message = !result.ok && result.error !== void 0 && typeof result.error.message === "string" ? result.error.message : "lawyerFiles/save \u8FD4\u56DE\u5F02\u5E38";
        return new Error(`\u4E0A\u4F20\u5931\u8D25\uFF1A${message}\uFF08lawyer-tools \u662F\u5426\u5DF2\u66F4\u65B0\u5230\u542B\u4E0A\u4F20\u670D\u52A1\u7684\u7248\u672C\uFF1F\uFF09`);
      },
      (error) => new Error(`\u4E0A\u4F20\u8BF7\u6C42\u5931\u8D25\uFF1A${error instanceof Error ? error.message : String(error)}`)
    );
  };
  ctx.slots.inject("shell.overlay", () => ctx.slots.register(
    {
      id: "lawyer-sidebar",
      name: "shell.overlay",
      inject: () => ({
        submitContractReview,
        submitCaseAnalysis,
        submitDocGeneration,
        searchWorkspaceFiles,
        uploadWorkspaceFile,
        listInstalledSkills
      })
    },
    LawyerSidebar
  ));
}
return module.exports; } });
//# sourceMappingURL=client.js.map
