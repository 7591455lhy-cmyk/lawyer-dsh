window.__ModuleLoader__.load({ id: "lawyer-sidebar", factory: (require) => { var module = { exports: {} }; var exports = module.exports;
"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: !0 });
}, __copyProps = (to, from, except, desc) => {
  if (from && typeof from == "object" || typeof from == "function")
    for (let key of __getOwnPropNames(from))
      !__hasOwnProp.call(to, key) && key !== except && __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: !0 }), mod);

// plugins/lawyer-sidebar/src/client/index.ts
var index_exports = {};
__export(index_exports, {
  apply: () => apply,
  inject: () => inject
});
module.exports = __toCommonJS(index_exports);

// plugins/lawyer-sidebar/src/client/legalZh.ts
var LEGAL_DOMAINS = {
  contractReview: {
    adapter: "chinese-legal-commercial",
    domain: "commercial-legal",
    primarySkills: ["review"],
    routedSkills: ["vendor-agreement-review", "nda-review", "saas-msa-review"],
    references: ["references/contract-review-quality-gates.md"],
    profilePath: "~/.dsh/legal-zh/commercial-legal/CLAUDE.md"
  },
  caseAnalysis: {
    adapter: "chinese-legal-litigation",
    domain: "litigation-legal",
    primarySkills: ["matter-intake", "matter-briefing"],
    routedSkills: ["chronology", "claim-chart", "privilege-log-review"],
    references: ["references/agentic-search-routing.md"],
    profilePath: "~/.dsh/legal-zh/litigation-legal/CLAUDE.md"
  },
  docGeneration: {
    adapter: "chinese-legal-litigation",
    domain: "litigation-legal",
    primarySkills: ["brief-section-drafter"],
    routedSkills: ["demand-draft", "demand-intake"],
    references: ["references/agentic-search-routing.md"],
    profilePath: "~/.dsh/legal-zh/litigation-legal/CLAUDE.md"
  }
}, MCP_ENDPOINTS = [
  { server: "law", use: "\u6CD5\u5F8B\u6CD5\u89C4\u3001\u53F8\u6CD5\u89E3\u91CA\u5168\u6587\u68C0\u7D22\u4E0E\u6761\u6587\u6838\u9A8C" },
  { server: "case", use: "\u88C1\u5224\u6587\u4E66\u4E0E\u7C7B\u6848\u68C0\u7D22" }
], SOURCE_LABELS = "[\u6CD5\u6761\u539F\u6587]\uFF08\u672C\u6B21\u4F1A\u8BDD\u5DF2\u6838\u5B9E\u7684\u6761\u6587\u539F\u6587\uFF09/ [\u88C1\u5224\u6587\u4E66]\uFF08\u5177\u4F53\u88C1\u5224\u6587\u4E66\uFF09/ [yuandian\u68C0\u7D22]\uFF08MCP \u68C0\u7D22\u6240\u5F97\uFF0C\u9700\u590D\u6838\uFF09/ [\u6A21\u578B\u77E5\u8BC6 \u2014 \u9700\u9A8C\u8BC1]\uFF08\u9ED8\u8BA4\u6807\u7B7E\uFF09";
function skillLayerLines(binding, localSkill, profile) {
  let adapterDesc = `/${binding.adapter}\uFF08claude-for-legal-ZH \u7684 dsh adapter\uFF0C${binding.domain} \u9886\u57DF\u8DEF\u7531\uFF09`, firstSkill = binding.primarySkills[0], loadedLine = localSkill === void 0 ? `- \u5DF2\u968F\u672C\u6307\u4EE4\u6CE8\u5165\u5168\u6587\uFF1A${adapterDesc}${firstSkill === void 0 ? "" : `\u3001/${firstSkill}\uFF08\u672C\u6B21\u6307\u5B9A\u7684\u9886\u57DF\u539F\u59CB\u6280\u80FD\uFF09`}\u3002\u672C\u5DE5\u4F5C\u53F0\u7684\u672C\u5730\u4EA7\u51FA\u6280\u80FD\u672C\u6B21\u672A\u542F\u7528\uFF0C\u4EA4\u4ED8\u7269\u5F62\u6001\u6309 ${firstSkill === void 0 ? "adapter \u8DEF\u7531\u5230\u7684\u539F\u59CB\u6280\u80FD" : `${binding.domain}/skills/${firstSkill}/SKILL.md`} \u7684\u8F93\u51FA\u8981\u6C42\u6267\u884C\u3002` : `- \u5DF2\u968F\u672C\u6307\u4EE4\u6CE8\u5165\u5168\u6587\uFF1A${adapterDesc}\u3001/${localSkill}\uFF08\u672C\u5DE5\u4F5C\u53F0\u7684\u4EA7\u51FA\u6280\u80FD\uFF0C\u51B3\u5B9A\u4EA4\u4ED8\u7269\u5F62\u6001\uFF09\u3002\u4E8C\u8005\u4E0D\u51B2\u7A81\uFF1Aadapter \u63D0\u4F9B\u9886\u57DF\u5DE5\u4F5C\u6D41\u4E0E\u8D28\u91CF\u95E8\u7981\uFF0C/${localSkill} \u63D0\u4F9B\u4EA4\u4ED8\u7269\u5F62\u6001\u2014\u2014\u5148\u6309 adapter \u8D70\u6D41\u7A0B\uFF0C\u518D\u6309 /${localSkill} \u51FA\u7A3F\u3002`, primaryText = binding.primarySkills.length > 0 ? `\u4E0E${binding.primarySkills.map((s) => ` ${binding.domain}/skills/${s}/SKILL.md`).join("\u3001")}\uFF08\u539F\u59CB\u5DE5\u4F5C\u6D41\uFF09` : "\uFF08\u672C\u6B21\u672A\u6307\u5B9A\u539F\u59CB\u6280\u80FD\u2014\u2014\u8BFB\u5B8C CLAUDE.md \u540E\u6309\u4EFB\u52A1\u5F62\u6001\u4ECE\u8BE5\u9886\u57DF\u7684 skills/ \u76EE\u5F55\u81EA\u884C\u62E9\u4E00\uFF0C\u5E76\u5411\u7528\u6237\u8BF4\u660E\u9009\u4E86\u54EA\u4E00\u4E2A\uFF09", lines = [
    "\u4E00\u3001\u6280\u80FD\u4E0E\u63D2\u4EF6\u8C03\u7528\uFF08\u5FC5\u6267\u884C\uFF09\uFF1A",
    loadedLine,
    // adapter 原文写的是 `cat ~/.dsh/legal-zh/repo`；打包版工作台的 DSH_HOME
    // 是 userData\dsh-home，与 ~/.dsh 不同，故补一条 $env:DSH_HOME 兜底。
    `- \u6309 adapter \u7684 Path Resolution \u89E3\u6790\u9886\u57DF\u6587\u4EF6\uFF1A\u5F53\u524D\u5DE5\u4F5C\u533A\u4E0D\u5728\u4ED3\u5E93\u5185\u65F6\uFF0C\u5148\u6267\u884C \`cat ~/.dsh/legal-zh/repo\` \u53D6\u5F97\u4ED3\u5E93\u6839\u76EE\u5F55\uFF1B\u8BE5\u6587\u4EF6\u4E0D\u5B58\u5728\u65F6\u6539\u7528 \`cat $env:DSH_HOME/legal-zh/repo\`\uFF08\u672C\u5DE5\u4F5C\u53F0\u6253\u5305\u7248\u628A DSH_HOME \u6307\u5230\u5B89\u88C5\u76EE\u5F55\u4E0B\uFF0C\u4E24\u6761\u547D\u4EE4\u8986\u76D6\u4E24\u79CD\u90E8\u7F72\u5F62\u6001\uFF09\u3002\u518D\u4F9D\u6B21\u8BFB\u53D6 ${binding.domain}/CLAUDE.md\uFF08\u9886\u57DF\u753B\u50CF\u4E0E\u5171\u4EAB\u62A4\u680F\uFF0C\u52A8\u7B14\u524D\u5FC5\u8BFB\uFF09${primaryText}\u3002`
  ];
  return binding.routedSkills.length > 0 && lines.push(`- \u6309\u6750\u6599\u5F62\u6001\u62E9\u4E00\u6216\u7EC4\u5408\u8FFD\u52A0\u6280\u80FD\uFF1A${binding.routedSkills.map((s) => `${binding.domain}/skills/${s}/SKILL.md`).join("\u3001")}\u3002\u591A\u4E2A\u6280\u80FD\u540C\u65F6\u9002\u7528\u65F6\uFF0C\u6309\u5DE5\u4F5C\u6D41\u9690\u542B\u987A\u5E8F\u6267\u884C\u5E76\u5408\u5E76\u7ED3\u8BBA\u3002`), lines.push(`- \u5F3A\u5236\u9002\u7528\u7684\u5171\u4EAB\u53C2\u8003\u6587\u4EF6\uFF1A${binding.references.map((r) => `\`${r}\``).join("\u3001")}\u3002`), lines.push(...profileLines(binding, profile)), lines.push(`- \u539F\u6280\u80FD\u4E2D\u5F62\u5982 /${binding.domain.split("-")[0]}-legal:xxx \u7684\u662F Claude Code \u4E13\u6709\u659C\u6760\u547D\u4EE4\uFF0C\u4E0D\u8981\u6267\u884C\uFF1B\u5176\u8BED\u4E49\u5DF2\u7531 adapter \u7FFB\u8BD1\u4E3A\u300C\u8BFB\u53D6 ${binding.domain}/skills/xxx/SKILL.md \u5E76\u6309\u5176\u6D41\u7A0B\u6267\u884C\u300D\u3002Claude hooks \u4E00\u5F8B\u5FFD\u7565\u3002`), lines;
}
function profileLines(binding, profile) {
  return profile === void 0 ? [`- \u5B9E\u52A1\u753B\u50CF\uFF1A\u4F18\u5148\u590D\u7528\u5DF2\u586B\u5145\u7684 Claude \u753B\u50CF\uFF0C\u5426\u5219\u8BFB\u53D6 \`${binding.profilePath}\`\uFF1B\u8BE5\u6587\u4EF6\u4E0D\u5B58\u5728\u65F6\u6539\u7528 \`$env:DSH_HOME/legal-zh/${binding.domain}/CLAUDE.md\`\uFF08\u6253\u5305\u7248\u5DE5\u4F5C\u53F0\u628A DSH_HOME \u6307\u5230\u5B89\u88C5\u76EE\u5F55\u4E0B\uFF09\u3002\u753B\u50CF\u7F3A\u5931\u6216\u4ECD\u542B [PLACEHOLDER] \u65F6\u4E0D\u8981\u505C\u4E0B\u6765\u8FFD\u95EE\u2014\u2014\u6309\u901A\u7528\u6807\u51C6\u4EA7\u51FA\u5E76\u5728\u4EA4\u4ED8\u7269\u9876\u90E8\u6807\u6CE8\u300C\u5B9E\u52A1\u753B\u50CF\u672A\u914D\u7F6E\uFF0C\u76F8\u5173\u5224\u65AD\u6309\u901A\u7528\u6807\u51C6\u8F93\u51FA\uFF1B\u53EF\u5728\u53F3\u4FA7\u680F\u300C\u5B9E\u52A1\u753B\u50CF\u300D\u4E2D\u8865\u5145\u300D\u3002`] : profile.configured ? [`- \u5B9E\u52A1\u753B\u50CF\uFF1A\u5DF2\u914D\u7F6E\uFF0C\u52A8\u7B14\u524D\u5148\u8BFB\u53D6 \`${profile.path}\`\u2014\u2014\u672C\u5DE5\u4F5C\u53F0\u6240\u6709\u6CD5\u5F8B\u529F\u80FD\u5728\u505A\u4EFB\u4F55\u4E8B\u524D\u90FD\u5148\u8BFB\u53D6\u5B83\uFF0C\u5176\u4E2D\u7684\u7ACB\u573A\u3001\u9608\u503C\u4E0E\u884C\u6587\u98CE\u683C\u4F18\u5148\u4E8E\u901A\u7528\u6807\u51C6\u3002`] : profile.placeholderCount > 0 ? [`- \u5B9E\u52A1\u753B\u50CF\uFF1A\u5DF2\u5B58\u5728\u4F46\u672A\u586B\u5B8C\uFF0C\u8BFB\u53D6 \`${profile.path}\`\u2014\u2014\u5DF2\u586B\u90E8\u5206\u7167\u7528\uFF0C\u5269\u4F59 ${profile.placeholderCount} \u5904 [PLACEHOLDER] \u6D89\u53CA\u7684\u5224\u65AD\u6309\u901A\u7528\u6807\u51C6\u5904\u7406\uFF0C\u5E76\u5728\u4EA4\u4ED8\u7269\u9876\u90E8\u6807\u6CE8\u300C\u753B\u50CF\u4E2D\u4ECD\u6709 ${profile.placeholderCount} \u9879\u672A\u914D\u7F6E\uFF0C\u76F8\u5173\u5224\u65AD\u6309\u901A\u7528\u6807\u51C6\u8F93\u51FA\u300D\u3002`] : [`- \u5B9E\u52A1\u753B\u50CF\uFF1A\u672C\u6B21\u672A\u914D\u7F6E\uFF08\`${profile.path}\` \u4E0D\u5B58\u5728\uFF09\u2014\u2014\u6309\u901A\u7528\u6807\u51C6\u4EA7\u51FA\uFF0C\u5E76\u5728\u4EA4\u4ED8\u7269\u9876\u90E8\u6807\u6CE8\u300C\u5B9E\u52A1\u753B\u50CF\u672A\u914D\u7F6E\uFF0C\u76F8\u5173\u5224\u65AD\u6309\u901A\u7528\u6807\u51C6\u8F93\u51FA\uFF1B\u53EF\u5728\u53F3\u4FA7\u680F\u300C\u5B9E\u52A1\u753B\u50CF\u300D\u4E2D\u8865\u5145\u300D\u3002\u4E0D\u8981\u505C\u4E0B\u6765\u8FFD\u95EE\u7528\u6237\u914D\u7F6E\u753B\u50CF\u3002`];
}
function profileInterviewLines(binding, options) {
  let modeText = {
    quick: "2 \u5206\u949F\u5FEB\u901F\u2014\u2014\u89D2\u8272\u3001\u6267\u4E1A\u573A\u666F\u3001\u7BA1\u8F96\u4E0E\u5BA1\u67E5\u6307\u5F15\u65B9\u5411\uFF0C\u4EE5\u53CA\u5BA1\u67E5\u6307\u5F15\u7ACB\u573A\u3001\u4E0A\u62A5\u9608\u503C\u3001\u8D23\u4EFB\u4E0A\u9650\u3001\u884C\u6587\u98CE\u683C\u7684\u5DE5\u4F5C\u9ED8\u8BA4\u503C",
    full: "15 \u5206\u949F\u5B8C\u6574\u2014\u2014\u771F\u5B9E\u7684\u5BA1\u67E5\u6307\u5F15\u7ACB\u573A\uFF08\u6309\u65B9\u5411\u6821\u51C6\uFF09\u3001deal-breaker\u3001\u5E26\u91D1\u989D\u9608\u503C\u7684\u5B8C\u6574\u4E0A\u62A5\u77E9\u9635\u3001\u884C\u6587\u98CE\u683C\uFF0C\u4EE5\u53CA\u4ECE\u5DF2\u7B7E\u7F72\u534F\u8BAE\u4E2D\u63D0\u53D6\u7684\u5B9E\u9645\u7ACB\u573A",
    redo: "\u91CD\u65B0\u8BBF\u8C08\uFF08--redo\uFF09\u2014\u2014\u753B\u50CF\u5DF2\u5B58\u5728\uFF0C\u91CD\u65B0\u8D70\u4E00\u904D\u8BBF\u8C08\uFF0C\u8986\u76D6\u524D\u5148\u5411\u7528\u6237\u5C55\u793A\u4E0E\u65E7\u7248\u7684\u5DEE\u5F02",
    integrations: "\u4EC5\u91CD\u65B0\u68C0\u6D4B\u96C6\u6210\uFF08--check-integrations\uFF09\u2014\u2014\u53EA\u68C0\u6D4B\u5B9E\u9645\u53EF\u8FDE\u63A5\u7684\u96C6\u6210\uFF08MCP \u5DE5\u5177\u3001\u6587\u4EF6\u8BBF\u95EE\u7B49\uFF09\u5E76\u6C47\u62A5\u300C\u2713\u5DF2\u8FDE\u63A5 / \u26AA\u5DF2\u914D\u7F6E\u672A\u9A8C\u8BC1 / \u2717\u672A\u627E\u5230\u300D\uFF0C\u4E0D\u91CD\u8DD1\u8BBF\u8C08"
  };
  return [
    "\u3010\u8BBF\u8C08\u6267\u884C\u8981\u6C42\uFF08\u672C\u6BB5\u5148\u4E8E\u6280\u80FD\u6B63\u6587\u751F\u6548\uFF09\u3011",
    `- \u753B\u50CF\u5199\u5165/\u8BFB\u53D6\u8DEF\u5F84\u4E25\u683C\u4E3A \`${options.profilePath}\`\u3002\u6280\u80FD\u539F\u6587\u4E2D\u7684 \`~/.claude/plugins/config/...\` \u4E0E \`~/.dsh/legal-zh/...\` \u4E00\u5F8B\u5FFD\u7565\u2014\u2014\u672C\u5DE5\u4F5C\u53F0\u7684 canonical \u8DEF\u5F84\u7531\u672C\u6761\u7ED9\u5B9A\uFF0C\u6309\u5176\u4ED6\u8DEF\u5F84\u5199\u5165\u4F1A\u5BFC\u81F4\u753B\u50CF\u8BFB\u4E0D\u5230\u3002`,
    `- \u672C\u6B21\u6A21\u5F0F\uFF1A${modeText[options.mode]}\u3002`,
    `- \u6309 ${binding.domain}/skills/cold-start-interview/SKILL.md \u7684\u811A\u672C\u6267\u884C\u8BBF\u8C08\uFF0C\u5E76\u9075\u5B88\u5176\u8282\u594F\u7EAA\u5F8B\uFF1A\u6BCF\u8F6E\u4E0D\u8D85\u8FC7 2-3 \u4E2A\u95EE\u9898\uFF1B\u9700\u8981\u7528\u6237\u8F93\u5165\u7684\u9898\u76EE\u5FC5\u987B\u660E\u786E\u8BF4"\u8FD9\u4E2A\u9700\u8981\u8F93\u5165\u56DE\u7B54\u2014\u2014\u6211\u4F1A\u7B49\u5F85"\uFF0C\u4E0D\u5F97\u5728\u7528\u6237\u56DE\u590D\u524D\u63A8\u8FDB\u5230\u4E0B\u4E00\u9898\uFF1B\u7528\u6237\u8BF4"\u6682\u505C"\u65F6\u5199\u5165 \`<!-- SETUP PAUSED AT: -->\` \u6807\u8BB0\u4FDD\u5B58\u8FDB\u5EA6\uFF0C\u4E0B\u6B21\u4ECE\u8BE5\u5904\u6062\u590D\u3002`,
    '- \u4E0D\u8981\u5199 YAML\u3002\u753B\u50CF\u662F\u5E26\u5076\u5C14\u8868\u683C\u7684\u6563\u6587\uFF0C\u5C3D\u91CF\u7528\u5F8B\u5E08\u81EA\u5DF1\u7684\u8868\u8FF0\uFF1B\u7528\u6237\u6CA1\u7B54\u6216\u7B54"\u6211\u8FD8\u6CA1\u6709\u90A3\u4E2A"\u7684\u9879\u8BDA\u5B9E\u7559 `[PLACEHOLDER]`\uFF0C\u4E0D\u8981\u7F16\u9020\u9608\u503C\u6216\u7ACB\u573A\u3002',
    "- \u4E0D\u8981\u8DF3\u8FC7\u79CD\u5B50\u6587\u4EF6\u73AF\u8282\uFF1A\u5982\u7528\u6237\u80FD\u63D0\u4F9B\u6700\u8FD1\u7B7E\u7F72\u7684\u534F\u8BAE\u6216\u6807\u51C6\u6A21\u677F\uFF0C\u8BFB\u53D6\u540E\u518D\u5B9A\u7A3F\u2014\u2014\u8BBF\u8C08\u544A\u8BC9\u4F60\u4ED6\u4EEC\u8BA4\u4E3A\u7684\u7ACB\u573A\u662F\u4EC0\u4E48\uFF0C\u6587\u4EF6\u544A\u8BC9\u4F60\u5B9E\u9645\u662F\u4EC0\u4E48\u3002",
    `- \u5B9A\u7A3F\u524D\u5148\u4E0E\u7528\u6237\u786E\u8BA4\uFF1A"\u8FD9\u662F\u6211\u6355\u83B7\u7684\u5185\u5BB9\u2014\u2014\u6709\u4EC0\u4E48\u95EE\u9898\u5417\uFF1F" \u5F97\u5230\u786E\u8BA4\u540E\u518D\u5199\u5165 \`${options.profilePath}\`\uFF08\u7236\u76EE\u5F55\u6309\u9700\u521B\u5EFA\uFF09\u3002`,
    `${options.profileExists ? "- \u8986\u76D6\u524D\u5148\u5C55\u793A\u4E0E\u73B0\u6709\u753B\u50CF\u7684\u5DEE\u5F02\uFF0C\u8BA9\u7528\u6237\u770B\u6E05\u4F1A\u6539\u6389\u4EC0\u4E48\u3002" : "- \u5199\u5165\u65F6\u6309\u9700\u521B\u5EFA\u7236\u76EE\u5F55\u3002"}`,
    '- \u5199\u5165\u5B8C\u6210\u540E\u5C55\u793A\u6458\u8981\u4E0E\u5EFA\u8BAE\u7684\u4E0B\u4E00\u6B65\uFF0C\u5E76\u544A\u77E5\u753B\u50CF\u4F4D\u7F6E\u4E0E"\u968F\u65F6\u53EF\u5728\u53F3\u4FA7\u680F\u300C\u5B9E\u52A1\u753B\u50CF\u300D\u4E2D\u4FEE\u6539"\u3002'
  ];
}
function severityScaleNote(strictness) {
  return strictness === "\u5BBD\u677E" ? "\u4E25\u91CD\u7A0B\u5EA6\u6807\u5C3A\uFF08\u{1F534} \u963B\u65AD / \u{1F7E0} \u9AD8 / \u{1F7E1} \u4E2D / \u{1F7E2} \u4F4E\uFF09\uFF1A\u672C\u6B21\u53EA\u5217 \u{1F7E0} \u53CA\u4EE5\u4E0A\u53D1\u73B0\uFF0C\u{1F7E1}/\u{1F7E2} \u4ECE\u7565" : strictness === "\u4E25\u683C" ? "\u4E25\u91CD\u7A0B\u5EA6\u6807\u5C3A\uFF08\u{1F534} \u963B\u65AD / \u{1F7E0} \u9AD8 / \u{1F7E1} \u4E2D / \u{1F7E2} \u4F4E\uFF09\uFF1A\u9010\u6761\u8BC4\u7EA7\uFF0C\u{1F7E2} \u4E5F\u987B\u5217\u660E\uFF1B\u6620\u5C04\u6A21\u7CCA\u65F6\u5411\u4E0A\u53D6\u6574" : "\u4E25\u91CD\u7A0B\u5EA6\u6807\u5C3A\uFF08\u{1F534} \u963B\u65AD / \u{1F7E0} \u9AD8 / \u{1F7E1} \u4E2D / \u{1F7E2} \u4F4E\uFF09\uFF1A\u6BCF\u4E2A\u53D1\u73B0\u540C\u65F6\u7ED9\u51FA\u300C\u6CD5\u5F8B\u98CE\u9669\u300D\u4E0E\u300C\u5546\u4E1A/\u64CD\u4F5C\u6469\u64E6\u300D\u53CC\u8F74\u8BC4\u7EA7";
}
function mcpLayerLines() {
  return [
    "\u4E8C\u3001MCP \u68C0\u7D22\u8C03\u7528\uFF08\u6CD5\u6761\u4E0E\u6848\u4F8B\u6838\u9A8C\uFF09\uFF1A",
    `- \u5DF2\u6302\u8F7D\u6CD5\u5F8B\u68C0\u7D22\u8FDE\u63A5\u5668\uFF1A${MCP_ENDPOINTS.map((e) => `\`mcp__${e.server}__*\`\uFF08${e.use}\uFF09`).join("\u3001")}\u3002\u5DE5\u5177\u547D\u540D\u89C4\u8303\u4E3A \`mcp__<serverName>__<rawName>\`\u3002`,
    "- \u8C03\u7528\u524D\u5148\u786E\u8BA4\u4E24\u4E2A server \u4E0B\u5B9E\u9645\u53EF\u7528\u7684\u5DE5\u5177\u540D\uFF08\u5DE5\u5177\u6E05\u5355\u4E2D\u6CA1\u6709\u7684\u540D\u5B57\u4E0D\u8981\u51ED\u731C\u6D4B\u8C03\u7528\uFF09\uFF1B\u8C03\u7528\u5931\u8D25\u65F6\u8BF4\u660E\u5931\u8D25\u539F\u56E0\uFF0C\u4E0D\u8981\u9759\u9ED8\u8DF3\u8FC7\u3002",
    "- \u4E09\u8F6E\u68C0\u7D22\u7B56\u7565\uFF08\u5F3A\u5236\uFF0C\u7981\u6B62\u76F4\u63A5\u62FF\u7528\u6237\u539F\u8BDD\u5F00\u641C\uFF09\uFF1A\u7B2C\u4E00\u8F6E\u7CBE\u786E\u547D\u4E2D\u6838\u5FC3\u951A\u70B9\u9501\u5B9A\u9AD8\u76F8\u5173\u7ED3\u679C\uFF1B\u7B2C\u4E8C\u8F6E\u7528\u522B\u540D\u3001\u8FD1\u4E49\u8BCD\u548C\u4E0A\u4E0B\u4F4D\u6982\u5FF5\u8865\u6F0F\uFF1B\u7B2C\u4E09\u8F6E\u5904\u7406\u6B67\u4E49\u4E0E\u6DF7\u6DC6\u6982\u5FF5\u3001\u7CBE\u70BC\u7ED3\u679C\u96C6\u3002\u7ED3\u679C\u8FC7\u5C11\u9010\u6B65\u653E\u5BBD\uFF0C\u7ED3\u679C\u8FC7\u6742\u589E\u52A0\u9650\u5B9A\u8BCD\u4E0E\u6392\u9664\u8BCD\u3002",
    "- \u65F6\u6548\u9A8C\u8BC1\uFF1A\u5199\u5165\u7ED3\u8BBA\u7684\u6BCF\u4E00\u6761\u6CD5\u6761\u3001\u53F8\u6CD5\u89E3\u91CA\u3001\u8BC9\u8BBC\u65F6\u6548\u3001\u7BA1\u8F96\u89C4\u5219\u3001\u8FDD\u7EA6\u91D1\u6807\u51C6\uFF0C\u5FC5\u987B\u5148\u7528 mcp__law__* \u6838\u9A8C\u73B0\u884C\u6548\u529B\uFF1B\u672A\u6838\u9A8C\u7684\u4E00\u5F8B\u6807\u6CE8\u3002",
    `- \u6765\u6E90\u6EAF\u6E90\u6807\u7B7E\uFF08\u6BCF\u6761\u4F9D\u636E\u5FC5\u6807\u5176\u4E00\uFF09\uFF1A${SOURCE_LABELS}\u3002`,
    "- \u77E5\u8BC6\u5E93\u56DB\u6B65\u534F\u8BAE\uFF08references/knowledge-base-crossref.md\uFF09\uFF1A\u672C\u673A\u672A\u6302\u8F7D\u672C\u5730\u6CD5\u5F8B\u77E5\u8BC6\u5E93\u65F6\uFF0C\u8DF3\u8FC7 Step 1\u20133\uFF0C\u76F4\u63A5\u4ECE Step 4\u300C\u5916\u90E8\u8865\u5145\u300D\u8D70 MCP \u68C0\u7D22\uFF0C\u4F46\u4E09\u8F6E\u68C0\u7D22\u4E0D\u53EF\u7701\u3002",
    "- \u964D\u7EA7\u7EAA\u5F8B\uFF1AMCP \u672A\u8FDE\u63A5\u6216\u5168\u90E8\u8C03\u7528\u5931\u8D25\u65F6\u4E0D\u8981\u9759\u9ED8\u7A7A\u8F6C\u2014\u2014\u5728\u4EA4\u4ED8\u7269\u9876\u90E8\u5199\u660E\u300C\u672C\u6B21\u672A\u8FDE\u63A5\u6CD5\u89C4/\u6848\u4F8B\u68C0\u7D22\u5DE5\u5177\uFF0C\u6CD5\u6761\u3001\u6848\u4F8B\u3001\u671F\u9650\u7B49\u65F6\u6548\u6027\u5185\u5BB9\u672A\u7ECF\u6838\u9A8C\uFF0C\u4F9D\u8D56\u524D\u8BF7\u7528\u53EF\u9760\u6765\u6E90\u6838\u9A8C\u300D\uFF0C\u7136\u540E\u7EE7\u7EED\u5B8C\u6210\u4EFB\u52A1\u3002"
  ];
}
function subagentLayerLines(plan) {
  let lines = [
    "\u4E09\u3001\u5B50\u4EE3\u7406\u8C03\u7528\uFF08Agentic Search \u8DEF\u7531\uFF0Creferences/agentic-search-routing.md\uFF09\uFF1A",
    "- \u4E09\u5C42\u8DEF\u7531\uFF1AC1 \u81EA\u52A8\u5224\u5B9A\uFF08\u8FBE\u5230\u9608\u503C\u76F4\u63A5\u542F\u52A8\uFF09/ C2 \u7BA1\u7EBF\u515C\u5E95\uFF08\u5E38\u89C4\u7BA1\u7EBF\u8DD1\u5B8C\u4E0D\u8DB3\u5219\u5347\u7EA7\uFF09/ C3 \u7528\u6237\u6307\u4EE4\uFF08\u7528\u6237\u660E\u786E\u8981\u6C42\uFF09\u3002\u5DE5\u5177\u4E3A `subagent`\uFF08spawn\uFF0C\u540E\u53F0 continuable\uFF09\uFF1B\u9700\u8981\u5B50\u4EE3\u7406\u5E26\u7740\u4E3B\u4F1A\u8BDD\u5DF2\u5B8C\u6210\u8F6E\u6B21\u4F5C\u4E3A\u4E0A\u4E0B\u6587\u65F6\u7528 `subagent_fork`\u3002"
  ];
  return plan.mandatoryChecks !== void 0 && plan.mandatoryChecks.length > 0 && lines.push(`- \u4E0D\u53D7 C1/C2 \u95E8\u63A7\u3001\u5E38\u89C4\u7BA1\u7EBF\u9636\u6BB5\u5FC5\u505A\u7684\u6838\u9A8C\uFF1A${plan.mandatoryChecks.join("\uFF1B")}\u3002`), lines.push(`- C1 \u5728\u672C\u5165\u53E3\u7684\u89E6\u53D1\u53E3\u5F84\uFF1A${plan.c1Triggers.join("\uFF1B")}\u3002\u62FF\u4E0D\u51C6\u662F\u5426\u8FBE\u5230\u9608\u503C\u65F6\u4E0D\u8D70 C1\uFF0C\u8BA9\u5E38\u89C4\u7BA1\u7EBF\u5148\u8DD1\u3002`), lines.push("- \u89E6\u53D1\u540E\u4E00\u6B21\u6027\u5E76\u884C\u5206\u6D3E\u4EE5\u4E0B\u72EC\u7ACB\u68C0\u7D22\u7EF4\u5EA6\uFF08\u6BCF\u4E2A\u7EF4\u5EA6\u4E00\u6B21 subagent \u8C03\u7528\uFF0C\u4E92\u4E0D\u4F9D\u8D56\uFF0C\u4E0D\u8981\u4E32\u884C\u7B49\u5F85\uFF09\uFF1A"), plan.lanes.forEach((lane, index) => {
    lines.push(`  ${index + 1}. ${lane.name}\u2014\u2014${lane.brief}`);
  }), lines.push(`- C2 \u5347\u7EA7\u6761\u4EF6\uFF1A${plan.c2Upgrades.join("\uFF1B")}\u3002\u5347\u7EA7\u65F6\u628A\u4E3B\u4F1A\u8BDD\u5DF2\u68C0\u7D22\u8FC7\u7684\u6E90\u3001\u5DF2\u8BD5\u8FC7\u7684\u5173\u952E\u8BCD\u4E00\u5E76\u4F20\u7ED9\u5B50\u4EE3\u7406\uFF0C\u907F\u514D\u91CD\u590D\u5DE5\u4F5C\u3002`), lines.push(`- \u6392\u9664\u9879\uFF08\u5373\u4F7F\u8868\u9762\u6EE1\u8DB3 C1/C2 \u4E5F\u4E0D\u542F\u52A8\uFF09\uFF1A${plan.excludes.join("\uFF1B")}\u3002`), lines.push("- \u7EA6\u675F\uFF1A\u5B50\u4EE3\u7406\u7684\u4EF7\u503C\u662F\u300C\u66F4\u5E7F\u7684\u68C0\u7D22\u8303\u56F4\u300D\u800C\u4E0D\u662F\u300C\u66F4\u5F3A\u7684 AI\u300D\u2014\u2014\u6838\u5FC3\u6CD5\u5F8B\u63A8\u7406\u4E0E\u6700\u7EC8\u7ED3\u8BBA\u59CB\u7EC8\u5728\u4E3B\u4F1A\u8BDD\u5B8C\u6210\u3002\u5B50\u4EE3\u7406\u4EA7\u51FA\u987B\u5E26\u6765\u6E90\u6807\u7B7E\u4E0E\u68C0\u7D22\u65E5\u671F\uFF0C\u4E0D\u786E\u5B9A\u9879\u6807 [\u9700\u6838\u5B9E]\uFF0C\u5176\u7814\u7A76\u62A5\u544A\u540C\u6837\u662F\u5F8B\u5E08\u5BA1\u67E5\u8349\u7A3F\u3002"), lines;
}
var SUBAGENT_PLANS = {
  contractReview: {
    c1Triggers: [
      "\u5408\u540C\u540C\u65F6\u843D\u5165 \u22652 \u4E2A\u72EC\u7ACB\u6CD5\u5F8B\u9886\u57DF\uFF08\u5982\u6280\u672F\u5408\u540C\u53E0\u52A0\u6570\u636E\u5408\u89C4\u3001\u5EFA\u8BBE\u5DE5\u7A0B\u53E0\u52A0\u52B3\u52A8\u7528\u5DE5\uFF09",
      "\u5F85\u6838\u67E5\u6761\u6B3E\u53EF\u62C6\u4E3A \u22653 \u4E2A\u72EC\u7ACB\u6CD5\u5F8B\u7EF4\u5EA6\uFF08\u6548\u529B\u3001\u4E3B\u4F53\u4FE1\u7528\u3001\u7C7B\u6848\u53E3\u5F84\u5404\u6210\u4E00\u7EF4\uFF09",
      "\u4E25\u683C\u7A0B\u5EA6\u4E3A\u300C\u4E25\u683C\u300D\u4E14\u9700\u6838\u9A8C\u7684\u6CD5\u89C4/\u7C7B\u6848\u6761\u76EE \u22653 \u9879",
      "\u5408\u540C\u7C7B\u578B\u5C5E\u4E8E\u8D28\u91CF\u95E8\u7981\u7B2C 7 \u8282\u7684\u7279\u6B8A\u7C7B\u578B\uFF08\u5EFA\u8BBE\u5DE5\u7A0B\u3001\u623F\u5730\u4EA7\u3001\u80A1\u6743\u6295\u8D44\u3001\u878D\u8D44\u3001\u6280\u672F\uFF09\u4E14\u9700\u6838\u67E5\u884C\u4E1A\u76D1\u7BA1\u8981\u6C42"
    ],
    lanes: [
      { name: "\u4E3B\u4F53\u4E0E\u6388\u6743", brief: "\u6838\u67E5\u5404\u7B7E\u7EA6\u4E3B\u4F53\u7684\u5B58\u7EED\u72B6\u6001\u3001\u6D89\u8BC9\u4E0E\u5931\u4FE1\u3001\u7ECF\u8425\u5F02\u5E38\u3001\u8D44\u8D28\u8BB8\u53EF\uFF0C\u4EE5\u53CA\u975E\u6CD5\u5B9A\u4EE3\u8868\u4EBA\u7B7E\u5B57/\u9879\u76EE\u90E8\u7AE0\u7684\u8868\u89C1\u4EE3\u7406\u98CE\u9669" },
      { name: "\u6CD5\u89C4\u4E0E\u6548\u529B", brief: "\u6838\u9A8C\u62DF\u5F15\u7528\u6761\u6587\u7684\u73B0\u884C\u6548\u529B\uFF08\u6C11\u6CD5\u5178\u5408\u540C\u7F16\u3001\u62C5\u4FDD\u5236\u5EA6\u53F8\u6CD5\u89E3\u91CA\u3001\u683C\u5F0F\u6761\u6B3E\u89C4\u5219\u7B49\uFF09\uFF0C\u6807\u6CE8\u5931\u6548\u4E0E\u4FEE\u8BA2" },
      { name: "\u7C7B\u6848\u53E3\u5F84", brief: "\u68C0\u7D22\u4E89\u8BAE\u6761\u6B3E\uFF08\u8FDD\u7EA6\u91D1\u3001\u4EFB\u610F\u89E3\u9664\u6743\u3001\u7BA1\u8F96\u3001\u9A8C\u6536\u6807\u51C6\u7B49\uFF09\u5728\u7EA6\u5B9A\u7BA1\u8F96\u6CD5\u9662\u7684\u88C1\u5224\u503E\u5411" },
      { name: "\u884C\u4E1A\u76D1\u7BA1", brief: "\u7279\u6B8A\u5408\u540C\u7C7B\u578B\u8FFD\u52A0\u6838\u67E5\u884C\u4E1A\u8D44\u8D28\u3001\u5BA1\u6279\u767B\u8BB0\u4E0E\u76D1\u7BA1\u8981\u6C42\uFF08\u5982\u5EFA\u8BBE\u5DE5\u7A0B\u8D44\u8D28\u3001\u5546\u54C1\u623F\u9884\u552E\u8BB8\u53EF\uFF09" }
    ],
    c2Upgrades: [
      "\u4EA4\u4ED8\u7A3F\u4E2D \u22652 \u5904\u6807\u6CE8 [\u6A21\u578B\u77E5\u8BC6 \u2014 \u9700\u9A8C\u8BC1]",
      "\u6838\u5FC3\u6761\u6B3E\uFF08\u4EF7\u6B3E\u652F\u4ED8\u3001\u8FDD\u7EA6\u8D23\u4EFB\u3001\u89E3\u9664\u4E0E\u6E05\u7B97\u3001\u4E89\u8BAE\u89E3\u51B3\uFF09\u7F3A\u5C11\u53EF\u9760\u4F9D\u636E",
      "\u4E09\u8F6E\u68C0\u7D22\u540E\u4ECD\u65E0\u6CD5\u786E\u8BA4\u5173\u952E\u6CD5\u6761\u7684\u73B0\u884C\u6548\u529B"
    ],
    excludes: [
      "\u5355\u4E00\u6761\u6B3E\u7684\u63AA\u8F9E\u8C03\u6574\u3001\u9519\u522B\u5B57\u4E0E\u683C\u5F0F\u4FEE\u8BA2",
      "\u672C\u6B21\u4F1A\u8BDD\u5DF2\u6838\u9A8C\u8FC7\u7684\u540C\u4E00\u6CD5\u6761",
      "\u7EAF\u6587\u672C\u6BD4\u5BF9\u7C7B\u5DE5\u4F5C\uFF08\u4FEE\u8BA2\u8FFD\u8E2A\u3001\u7248\u672C\u5DEE\u5F02\uFF09"
    ]
  },
  caseAnalysis: {
    c1Triggers: [
      "\u5F52\u7EB3\u51FA\u7684\u4E89\u8BAE\u7126\u70B9 \u22653 \u4E2A\u4E14\u5404\u81EA\u9700\u8981\u72EC\u7ACB\u7684\u6CD5\u6761\u6216\u7C7B\u6848\u652F\u6491",
      "\u6848\u4EF6\u8DE8 \u22652 \u4E2A\u72EC\u7ACB\u6CD5\u5F8B\u9886\u57DF\uFF08\u5982\u5408\u540C\u53E0\u52A0\u4FB5\u6743\u3001\u5B9E\u4F53\u4E89\u8BAE\u53E0\u52A0\u7A0B\u5E8F\u4E89\u8BAE\uFF09",
      "\u7528\u6237\u8981\u6C42\u5168\u9762/\u7A77\u5C3D/\u7CFB\u7EDF\u6027\u68B3\u7406"
    ],
    lanes: [
      { name: "\u8BF7\u6C42\u6743\u57FA\u7840", brief: "\u6838\u9A8C\u5404\u8BF7\u6C42\u6743\u57FA\u7840\u7684\u6784\u6210\u8981\u4EF6\u4E0E\u6CD5\u6761\u73B0\u884C\u6548\u529B\uFF0C\u6807\u6CE8\u5931\u6548\u3001\u4FEE\u8BA2\u4E0E\u53F8\u6CD5\u89E3\u91CA\u66F4\u65B0" },
      { name: "\u7C7B\u6848\u53E3\u5F84", brief: "\u68C0\u7D22\u540C\u7C7B\u6848\u7531\u5728\u7BA1\u8F96\u6CD5\u9662\u7684\u88C1\u5224\u503E\u5411\u3001\u8BC1\u660E\u6807\u51C6\u638C\u63E1\u5C3A\u5EA6\u4E0E\u5E38\u89C1\u6297\u8FA9\u91C7\u7EB3\u60C5\u51B5" },
      { name: "\u7A0B\u5E8F\u98CE\u9669", brief: "\u6838\u67E5\u8BC9\u8BBC\u65F6\u6548\uFF08\u542B\u4E2D\u65AD\u4E2D\u6B62\uFF09\u3001\u7BA1\u8F96\u3001\u4E3B\u4F53\u9002\u683C\u3001\u4E3E\u8BC1\u65F6\u9650\u4E0E\u8BC1\u636E\u5931\u6743\u98CE\u9669" },
      { name: "\u5BF9\u65B9\u4E3B\u4F53\u4E0E\u6267\u884C", brief: "\u68C0\u7D22\u5BF9\u65B9\u5F53\u4E8B\u4EBA\u7684\u6D89\u8BC9\u3001\u5931\u4FE1\u3001\u88AB\u6267\u884C\u4E0E\u5C65\u884C\u80FD\u529B\uFF0C\u8BC4\u4F30\u80DC\u8BC9\u540E\u7684\u6267\u884C\u98CE\u9669" }
    ],
    c2Upgrades: [
      "\u5173\u952E\u8BF7\u6C42\u6743\u57FA\u7840\u6CD5\u6761\u65E0\u6CD5\u6838\u9A8C\u6216\u5DF2\u5931\u6548",
      "\u22652 \u4E2A\u4E89\u8BAE\u7126\u70B9\u6CA1\u6709\u7C7B\u6848\u6216\u6CD5\u6761\u652F\u6491",
      "\u8BC1\u636E\u4E09\u6027\u5224\u65AD\u7F3A\u5C11\u53EF\u53C2\u7167\u7684\u88C1\u5224\u5C3A\u5EA6"
    ],
    excludes: [
      "\u7EAF\u4E8B\u5B9E\u68B3\u7406\uFF08\u5927\u4E8B\u8BB0\u3001\u65F6\u95F4\u7EBF\u6784\u5EFA\uFF09",
      "\u5355\u4E00\u6CD5\u6761\u786E\u8BA4",
      "\u5DF2\u5728\u672C\u6B21\u4F1A\u8BDD\u68C0\u7D22\u8FC7\u7684\u540C\u4E00\u95EE\u9898"
    ]
  },
  docGeneration: {
    mandatoryChecks: [
      "\u62DF\u5199\u5165\u6587\u4E66\u7684\u6BCF\u4E00\u6761\u6CD5\u6761\u4E0E\u53F8\u6CD5\u89E3\u91CA\uFF0C\u5FC5\u987B\u5148\u7528 mcp__law__* \u6838\u9A8C\u73B0\u884C\u6548\u529B\u4E0E\u6761\u6587\u5E8F\u53F7"
    ],
    c1Triggers: [
      "\u9700\u63F4\u5F15\u7C7B\u6848\u88C1\u5224\u8981\u65E8\u652F\u6491\u8BBA\u8BC1\uFF08\u4EE3\u7406\u8BCD\u3001\u7B54\u8FA9\u72B6\u7684\u5E38\u89C1\u9700\u6C42\uFF09",
      "\u6587\u4E66\u6D89\u53CA \u22653 \u4E2A\u72EC\u7ACB\u4E89\u8BAE\u7126\u70B9\u7684\u6CD5\u5F8B\u9002\u7528\u8BBA\u8BC1",
      "\u7528\u6237\u660E\u786E\u8981\u6C42\u8865\u5145\u7C7B\u6848\u6216\u6743\u5A01\u91CA\u4E49"
    ],
    lanes: [
      { name: "\u6CD5\u6761\u6548\u529B\u6838\u9A8C", brief: "\u9010\u6761\u6838\u9A8C\u62DF\u5F15\u7528\u6CD5\u6761\u3001\u53F8\u6CD5\u89E3\u91CA\u7684\u73B0\u884C\u6548\u529B\u3001\u6761\u53F7\u4E0E\u6700\u65B0\u4FEE\u8BA2\uFF0C\u6807\u51FA\u5931\u6548\u4E0E\u66FF\u4EE3\u6761\u6587" },
      { name: "\u7C7B\u6848\u8981\u65E8", brief: "\u68C0\u7D22\u652F\u6301\u6211\u65B9\u4E3B\u5F20\u7684\u88C1\u5224\u8981\u65E8\u4E0E\u672C\u9662/\u4E0A\u7EA7\u6CD5\u9662\u53E3\u5F84\uFF0C\u4F9B\u8BBA\u8BC1\u5F15\u7528" },
      { name: "\u5BF9\u65B9\u4E3B\u4F53", brief: "\u5F8B\u5E08\u51FD\u7C7B\u6587\u4E66\u8FFD\u52A0\u68C0\u7D22\u5BF9\u65B9\u4E3B\u4F53\u7684\u540D\u79F0\u3001\u4F4F\u6240\u3001\u6D89\u8BC9\u4E0E\u5931\u4FE1\u60C5\u51B5\uFF0C\u786E\u4FDD\u9001\u8FBE\u4E0E\u4E3B\u5F20\u5BF9\u8C61\u51C6\u786E" }
    ],
    c2Upgrades: [
      "\u6838\u9A8C\u53D1\u73B0\u62DF\u5F15\u7528\u6CD5\u6761\u5DF2\u5931\u6548\u6216\u88AB\u4FEE\u8BA2\uFF0C\u9700\u91CD\u65B0\u68C0\u7D22\u66FF\u4EE3\u4F9D\u636E",
      "\u8BBA\u8BC1\u5173\u952E\u8282\u70B9\u7F3A\u5C11\u7C7B\u6848\u6216\u6743\u5A01\u91CA\u4E49\u652F\u6491"
    ],
    excludes: [
      "\u683C\u5F0F\u3001\u6392\u7248\u4E0E\u63AA\u8F9E\u6DA6\u8272",
      "\u5DF2\u5728\u672C\u6B21\u4F1A\u8BDD\u6838\u9A8C\u8FC7\u7684\u6CD5\u6761",
      "\u7EAF\u4E8B\u5B9E\u6027\u5185\u5BB9\u7684\u8A8A\u5199"
    ]
  }
};
function legalTaskBinding(config) {
  return {
    adapter: config.adapter,
    domain: config.domain,
    primarySkills: config.skills,
    // 用户已明确指定原始技能，不再追加候选路由（避免与其选择冲突）。
    routedSkills: [],
    references: config.references ?? [],
    profilePath: `~/.dsh/legal-zh/${config.domain}/CLAUDE.md`
  };
}
function subagentDisabledLines() {
  return [
    "\u4E09\u3001\u5B50\u4EE3\u7406\u8C03\u7528\uFF08\u672C\u6B21\u4E0D\u542F\u7528\uFF09\uFF1A",
    "- \u672C\u529F\u80FD\u914D\u7F6E\u4E3A\u4E0D\u4F7F\u7528\u5B50\u4EE3\u7406\uFF1A\u5168\u90E8\u68C0\u7D22\u3001\u6838\u9A8C\u4E0E\u63A8\u7406\u90FD\u5728\u4E3B\u4F1A\u8BDD\u5B8C\u6210\uFF0C\u4E0D\u8981 spawn subagent\u3002",
    "- \u4E2D\u9014\u82E5\u53D1\u73B0\u68C0\u7D22\u8303\u56F4\u660E\u663E\u4E0D\u8DB3\uFF08\u4F8B\u5982\u540C\u65F6\u8DE8\u591A\u4E2A\u72EC\u7ACB\u6CD5\u5F8B\u9886\u57DF\u3001\u9700\u6838\u9A8C\u7684\u6CD5\u89C4/\u7C7B\u6848\u6761\u76EE \u22653 \u9879\uFF09\uFF0C\u5148\u5411\u7528\u6237\u8BF4\u660E\u5C40\u9650\u5E76\u5F81\u8BE2\u662F\u5426\u5C55\u5F00\uFF0C\u4E0D\u8981\u64C5\u81EA\u5206\u6D3E\u3002"
  ];
}
function legalOutputLines() {
  return [
    "\u56DB\u3001\u6CD5\u5F8B\u8F93\u51FA\u89C4\u5219\uFF08\u5F3A\u5236\uFF0C\u8986\u76D6\u672C\u6307\u4EE4\u5176\u4F59\u90E8\u5206\uFF09\uFF1A",
    "- \u6240\u6709\u8F93\u51FA\u5747\u4E3A\u5F8B\u5E08\u5BA1\u67E5\u8349\u7A3F\uFF0C\u4E0D\u66FF\u4EE3\u5F8B\u5E08\u4E13\u4E1A\u5224\u65AD\uFF0C\u4E0D\u6784\u6210\u6CD5\u5F8B\u610F\u89C1\u3002",
    "- \u6CD5\u6761\u3001\u6848\u4F8B\u3001\u671F\u9650\u3001\u76D1\u7BA1\u52A8\u6001\u7B49\u65F6\u6548\u6027\u5185\u5BB9\uFF0C\u672A\u7ECF\u53EF\u9760\u6765\u6E90\u6838\u9A8C\u524D\u4E00\u5F8B\u6807\u6CE8\u300C\u9700\u9A8C\u8BC1\u300D\u3002",
    "- \u4FDD\u7559\u539F\u5DE5\u4F5C\u6D41\u7684\u5347\u7EA7\u3001\u5BA1\u6279\u3001\u4FDD\u5BC6\u4E0E\u6765\u6E90\u6807\u6CE8\u8981\u6C42\uFF1B\u8DE8\u6280\u80FD\u4F20\u9012\u4E25\u91CD\u7A0B\u5EA6\u65F6\uFF0C\u4E0B\u6E38\u4E0D\u5F97\u65E0\u58F0\u964D\u7EA7\u3002",
    "- \u6587\u4EF6\u8BFB\u53D6\u5931\u8D25\u8981\u660E\u8BF4\u539F\u56E0\u4E0E\u53EF\u884C\u7684\u8865\u6551\u65B9\u5F0F\uFF0C\u4E0D\u8981\u9759\u9ED8\u7565\u8FC7\u7528\u6237\u63D0\u4F9B\u7684\u6750\u6599\u3002"
  ];
}

// plugins/lawyer-sidebar/src/client/prompt.ts
var STRICTNESS_SEMANTICS = {
  \u5BBD\u677E: "\u5BBD\u677E\u2014\u2014\u805A\u7126\u9AD8\u98CE\u9669\u95EE\u9898\u4E0E\u6838\u5FC3\u5546\u4E1A\u6761\u6B3E\uFF0C\u4F4E\u98CE\u9669\u7455\u75B5\u53EF\u4ECE\u7565",
  \u5E38\u89C4: "\u5E38\u89C4\u2014\u2014\u6309\u6807\u51C6\u6846\u67B6\u5168\u9762\u5BA1\u6838",
  \u4E25\u683C: "\u4E25\u683C\u2014\u2014\u9010\u6761\u6DF1\u6316\uFF0C\u4E00\u5207\u53EF\u7591\u6761\u6B3E\u5747\u5217\u660E\uFF0C\u6CD5\u89C4\u6838\u67E5\u5168\u8986\u76D6"
}, FOCUS_LABELS = {
  facts: "\u4E8B\u5B9E\u68B3\u7406",
  relations: "\u6CD5\u5F8B\u5173\u7CFB\u8BC6\u522B",
  issues: "\u4E89\u8BAE\u7126\u70B9\u5F52\u7EB3",
  evidence: "\u8BC1\u636E\u5BA1\u67E5",
  claims: "\u8BF7\u6C42\u6743\u57FA\u7840\u5206\u6790",
  risk: "\u8BC9\u8BBC\u98CE\u9669\u8BC4\u4F30"
};
function appendLegalProtocol(lines, module2, localSkill, profile) {
  let binding = LEGAL_DOMAINS[module2];
  lines.push(""), lines.push("\u3010\u5185\u90E8\u8C03\u7528\u89C4\u7A0B \xB7 claude-for-legal-ZH \u4E2D\u56FD\u6CD5\u9002\u914D\u7248\u3011"), lines.push(...skillLayerLines(binding, localSkill, profile)), lines.push(...mcpLayerLines()), lines.push(...subagentLayerLines(SUBAGENT_PLANS[module2])), lines.push(...legalOutputLines());
}
function buildProfileInterviewPrompt(request) {
  let binding = {
    adapter: request.adapter,
    domain: request.domain,
    // 访谈只走 cold-start-interview 这一条脚本，不预置其他原始技能。
    primarySkills: [],
    routedSkills: [],
    references: [],
    profilePath: request.profilePath
  };
  return [
    `\u8BF7\u5F00\u59CB\u5B9E\u52A1\u753B\u50CF\u914D\u7F6E /${request.adapter}`,
    "",
    `\u76EE\u6807\u9886\u57DF\uFF1A${request.domain}`,
    ...profileInterviewLines(binding, {
      profilePath: request.profilePath,
      profileExists: request.profileExists,
      mode: request.mode
    })
  ].join(`
`);
}
function appendLegalProtocolForCustom(lines, legal, localSkill) {
  lines.push(""), lines.push("\u3010\u5185\u90E8\u8C03\u7528\u89C4\u7A0B \xB7 claude-for-legal-ZH \u4E2D\u56FD\u6CD5\u9002\u914D\u7248\u3011"), lines.push(...skillLayerLines(legalTaskBinding(legal), localSkill)), lines.push(...mcpLayerLines()), legal.subagent === "none" ? lines.push(...subagentDisabledLines()) : lines.push(...subagentLayerLines(SUBAGENT_PLANS[legal.subagent])), lines.push(...legalOutputLines());
}
function fileMention(path) {
  return /\s/u.test(path) ? `@"${path}"` : `@${path}`;
}
function appendMaterialLines(lines, material, header, emptyHint) {
  lines.push(`${header}\uFF1A`);
  let hasFile = !1;
  for (let path of material.paths) {
    let trimmed = path.trim();
    trimmed !== "" && (hasFile = !0, trimmed.endsWith("/") ? lines.push(`- ${fileMention(trimmed)}\uFF08\u6750\u6599\u76EE\u5F55\u2014\u2014\u8BF7\u5148\u7528\u6587\u4EF6\u5217\u8868\u5DE5\u5177\u5217\u51FA\u8BE5\u76EE\u5F55\u4E0B\u7684\u5168\u90E8\u6587\u4EF6\uFF0C\u518D\u9010\u4E2A\u8BFB\u53D6\u540E\u4F7F\u7528\uFF0C\u52FF\u9057\u6F0F\uFF09`) : lines.push(`- ${fileMention(trimmed)}\uFF08\u7528\u6237\u660E\u786E\u5F15\u7528\u7684\u6587\u4EF6\uFF0C\u8BF7\u5148\u7528\u6587\u4EF6\u8BFB\u53D6\u5DE5\u5177\u8BFB\u53D6\u5168\u6587\u518D\u5206\u6790\uFF09`));
  }
  for (let text2 of material.texts)
    hasFile = !0, lines.push(`- \u6750\u6599\u6587\u672C\uFF08\u6765\u81EA ${text2.name}\uFF09\uFF1A`), lines.push("```"), lines.push(text2.content), lines.push("```");
  material.images.length > 0 && (hasFile = !0, lines.push(`- \u6750\u6599\u626B\u63CF\u4EF6/\u62CD\u7167\u56FE\u7247 ${material.images.length} \u5F20\uFF08\u968F\u672C\u6D88\u606F\u9644\u4E0A\uFF0C\u8BF7\u6309\u987A\u5E8F\u901A\u8BFB\uFF09`)), hasFile || lines.push(`-\uFF08\u672A\u63D0\u4F9B\uFF0C${emptyHint}\uFF09`);
}
function skillConfigLines(request) {
  let { review, preprocess, output, extraSkills } = request.skills, lines = ["\u6280\u80FD\u914D\u7F6E\uFF1A"];
  return lines.push(`- ${LEGAL_DOMAINS.contractReview.adapter}\uFF1A\u59CB\u7EC8\u542F\u7528\uFF08claude-for-legal-ZH \u7684\u9886\u57DF\u8DEF\u7531 adapter\uFF0C\u8D1F\u8D23\u628A\u672C\u4EFB\u52A1\u8DEF\u7531\u5230 commercial-legal \u7684\u5DE5\u4F5C\u6D41\u4E0E\u8D28\u91CF\u95E8\u7981\uFF09`), lines.push(review ? "- contract-review\uFF1A\u542F\u7528\uFF08\u5DF2\u968F\u6307\u4EE4\u52A0\u8F7D\u5168\u6587\uFF0C\u6309\u5176\u5B8C\u6574\u6D41\u7A0B\u6267\u884C\uFF09" : "- contract-review\uFF1A\u672A\u542F\u7528\u2014\u2014\u4E0D\u8981\u52A0\u8F7D\u8BE5\u6280\u80FD\uFF0C\u76F4\u63A5\u6309\u672C\u6307\u4EE4\u7684\u8981\u6C42\u4E0E\u901A\u7528\u6CD5\u5F8B\u80FD\u529B\u5B8C\u6210\u5BA1\u6838"), lines.push(preprocess ? "- pdfkit-py\uFF1A\u542F\u7528\uFF08PDF \u6E90\u8D70\u5176\u8F6C\u6362\u94FE\uFF1A\u6587\u5B57\u5C42\u8F6C docx\u3001\u626B\u63CF\u4EF6\u6E32\u67D3\u8F6C\u5F55\uFF09" : "- pdfkit-py\uFF1A\u672A\u542F\u7528\u2014\u2014PDF \u6E90\u76F4\u63A5\u7528\u6587\u4EF6\u8BFB\u53D6\u5DE5\u5177\u8BFB\u53D6\uFF0C\u4E0D\u505A docx \u8F6C\u6362\u4E0E\u6E32\u67D3\u8F6C\u5F55"), lines.push(output ? "- docx-tracked-changes\uFF1A\u542F\u7528\uFF08\u6309\u6D41\u7A0B\u4EA7\u51FA\u4FEE\u8BA2\u7559\u75D5\u5BA1\u9605\u7A3F docx\uFF09" : "- docx-tracked-changes\uFF1A\u672A\u542F\u7528\u2014\u2014\u672C\u6B21\u4E0D\u751F\u6210\u4FEE\u8BA2\u7559\u75D5\u5BA1\u9605\u7A3F\uFF08\u8986\u76D6\u6280\u80FD\u9ED8\u8BA4\u7684\u53CC\u6587\u4EF6\u8981\u6C42\uFF0C\u4EC5\u4EA4\u4ED8\u5BA1\u6838\u62A5\u544A\uFF09"), extraSkills.length > 0 && lines.push(`- \u9644\u52A0\u6280\u80FD\uFF08\u5DF2\u968F\u6307\u4EE4\u6CE8\u5165\u5168\u6587\uFF09\uFF1A${extraSkills.map((name) => `/${name}`).join("\u3001")}\u2014\u2014\u5728\u672C\u4EFB\u52A1\u4E2D\u6309\u9700\u9075\u5FAA\u5176\u6307\u5F15`), lines;
}
function buildContractReviewPrompt(request, profile) {
  let { adapter } = LEGAL_DOMAINS.contractReview, lines = [`\u8BF7\u5F00\u59CB\u5408\u540C\u5BA1\u6838 ${[
    adapter,
    ...request.skills.review ? ["contract-review"] : [],
    ...request.skills.extraSkills
  ].map((name) => `/${name}`).join(" ")}`, ""];
  return lines.push(`\u6211\u65B9\u7ACB\u573A\uFF1A${request.stance}`), lines.push(`\u5BA1\u6838\u4E25\u683C\u7A0B\u5EA6\uFF1A${STRICTNESS_SEMANTICS[request.strictness]}`), lines.push(`- ${severityScaleNote(request.strictness)}`), lines.push(`\u4FEE\u8BA2\u4EBA\u7F72\u540D\uFF1A${request.reviewerName.trim() !== "" ? request.reviewerName.trim() : "\u5F8B\u5E08\u5DE5\u4F5C\u53F0"}\uFF08\u4EA7\u51FA\u4FEE\u8BA2\u7559\u75D5 docx \u65F6\u7684\u4FEE\u8BA2\u4EBA\uFF09`), lines.push(""), lines.push(...skillConfigLines(request)), lines.push(""), appendMaterialLines(lines, request, "\u5408\u540C\u6587\u4EF6", "\u8BF7\u5148\u5411\u7528\u6237\u7D22\u53D6\u5408\u540C\u6587\u672C"), appendLegalProtocol(
    lines,
    "contractReview",
    request.skills.review ? "contract-review" : void 0,
    profile
  ), lines.join(`
`);
}
function buildCaseAnalysisPrompt(request, profile) {
  let { adapter, routedSkills } = LEGAL_DOMAINS.caseAnalysis, lines = [`\u8BF7\u5F00\u59CB\u6848\u4EF6\u5206\u6790 /${adapter} /case-analysis`, ""];
  lines.push(`\u6211\u65B9\u7ACB\u573A\uFF1A${request.stance}`);
  let labels = request.focus.map((key) => FOCUS_LABELS[key]);
  return lines.push(labels.length === Object.keys(FOCUS_LABELS).length ? "\u5206\u6790\u4FA7\u91CD\uFF1A\u5168\u6A21\u5757\u5B8C\u6574\u5206\u6790" : `\u5206\u6790\u4FA7\u91CD\uFF1A${labels.join("\u3001")}${labels.length === 0 ? "\uFF08\u672A\u9009\u62E9\u2014\u2014\u52A8\u7B14\u524D\u5148\u5411\u7528\u6237\u786E\u8BA4\u5206\u6790\u8303\u56F4\uFF09" : "\uFF08\u672A\u5217\u51FA\u7684\u6A21\u5757\u5728\u62A5\u544A\u4E2D\u4ECE\u7565\uFF0C\u4FDD\u7559\u7F16\u53F7\u4E00\u53E5\u8BDD\u5E26\u8FC7\uFF09"}`), lines.push(`- \u6309\u4FA7\u91CD\u6A21\u5757\u8DEF\u7531\u539F\u6280\u80FD\uFF1A\u4E8B\u5B9E\u68B3\u7406\u7528 litigation-legal/skills/chronology/SKILL.md\uFF0C\u8BC1\u636E\u5BA1\u67E5\u7528 litigation-legal/skills/privilege-log-review/SKILL.md\uFF0C\u8BF7\u6C42\u6743\u57FA\u7840\u5206\u6790\u7528 litigation-legal/skills/claim-chart/SKILL.md\uFF08\u5747\u5C5E adapter \u5DF2\u5217\u7684\u5019\u9009\u6280\u80FD\uFF1A${routedSkills.join("\u3001")}\uFF09\u3002`), lines.push("- \u98CE\u9669\u8BC4\u4EF7\u6309 litigation-legal/CLAUDE.md \u7684\u516D\u7EF4\u5EA6\u65B9\u6CD5\u8BBA\u9010\u9879\u5B8C\u6210\uFF08\u98CE\u9669\u5B9A\u6027 / \u98CE\u9669\u655E\u53E3 / \u53D1\u751F\u6982\u7387 / \u53EF\u89C4\u907F\u6027 / \u5546\u4E1A\u6743\u8861 / \u7D27\u8FEB\u6027\uFF09\uFF0C\u5E76\u5BF9\u6BCF\u4E2A\u91CD\u8981\u98CE\u9669\u70B9\u7ED9\u51FA\u300C\u6CD5\u5F8B\u98CE\u9669 + \u5546\u4E1A\u6216\u64CD\u4F5C\u6469\u64E6\u300D\u53CC\u8F74\u8BC4\u7EA7\u3002"), lines.push(""), appendMaterialLines(lines, request, "\u6848\u4EF6\u6750\u6599", "\u8BF7\u5148\u5411\u7528\u6237\u7D22\u53D6\u6848\u4EF6\u6750\u6599"), appendLegalProtocol(lines, "caseAnalysis", "case-analysis", profile), lines.join(`
`);
}
function buildDocGenerationPrompt(request, profile) {
  let { adapter, domain } = LEGAL_DOMAINS.docGeneration, lines = [`\u8BF7\u5F00\u59CB\u6587\u4E66\u751F\u6210 /${adapter} /doc-generation`, ""];
  return lines.push(`\u6587\u4E66\u7C7B\u578B\uFF1A${request.docType}`), lines.push(`\u6211\u65B9\u5F53\u4E8B\u4EBA\u8EAB\u4EFD\uFF1A${request.partyRole}`), lines.push(`\u8865\u5145\u8BF4\u660E\uFF1A${request.notes !== "" ? request.notes : "\u65E0"}`), lines.push(""), lines.push(`- \u4E3B\u6280\u80FD ${domain}/skills/brief-section-drafter/SKILL.md\uFF08\u6309\u5F8B\u6240/\u56E2\u961F\u683C\u5F0F\u8D77\u8349\u6CD5\u5F8B\u6587\u4E66\u7AE0\u8282\uFF09\uFF1B\u5F8B\u5E08\u51FD\u7C7B\u8D70 ${domain}/skills/demand-draft/SKILL.md\uFF0C\u8D77\u8349\u524D\u80CC\u666F\u6536\u96C6\u8D70 ${domain}/skills/demand-intake/SKILL.md\u3002`), lines.push("- \u4E94\u7EC4\u5185\u5BB9\u5206\u79BB\u7EAA\u5F8B\uFF08litigation-legal/CLAUDE.md \u5F3A\u5236\uFF09\uFF1A\u8BC9\u8BBC\u6587\u4E66\u7F16\u8F91\u65F6\u5FC5\u987B\u533A\u5206\u300C\u8BC1\u636E\u5217\u4E3E / \u8D28\u8BC1\u610F\u89C1 / \u8BC1\u636E\u8BA4\u5B9A / \u67E5\u660E\u4E8B\u5B9E / \u4E89\u8BAE\u7126\u70B9\u5206\u6790\u300D\u4E94\u7EC4\u5185\u5BB9\u8FB9\u754C\uFF0C\u4E0D\u53EF\u6DF7\u6DC6\uFF1B\u8BC1\u636E\u5217\u4E3E\u53EA\u8BB0\u5F55\u5F53\u4E8B\u4EBA\u4E3B\u5F20\uFF0C\u4E0D\u6539\u5199\u3002"), lines.push(""), appendMaterialLines(lines, request, "\u6848\u4EF6\u6750\u6599", "\u8BF7\u5148\u5411\u7528\u6237\u7D22\u53D6\u6848\u4EF6\u80CC\u666F\u6750\u6599"), appendLegalProtocol(lines, "docGeneration", "doc-generation", profile), lines.join(`
`);
}
function isFilesValue(value) {
  return typeof value != "string" && !Array.isArray(value);
}
var EMPTY_MATERIAL = { paths: [], images: [], texts: [] };
function isEmptyMaterial(material) {
  return material.paths.length === 0 && material.images.length === 0 && material.texts.length === 0;
}
function initialValues(fields) {
  let values = {};
  for (let field of fields)
    if (field.type === "files")
      values[field.id] = EMPTY_MATERIAL;
    else if (field.type === "checkbox") {
      let options = field.options ?? [];
      values[field.id] = (field.default ?? "").split(",").map((item) => item.trim()).filter((item) => item !== "" && options.includes(item));
    } else if (field.type === "select" || field.type === "radio") {
      let options = field.options ?? [], preferred = field.default ?? "";
      values[field.id] = options.includes(preferred) ? preferred : options[0] ?? "";
    } else
      values[field.id] = field.default ?? "";
  return values;
}
function valueToText(value, header) {
  if (typeof value == "string") return value;
  if (!isFilesValue(value)) return value.join("\u3001");
  if (isEmptyMaterial(value)) return "";
  let lines = [];
  return appendMaterialLines(lines, value, header, "\u672A\u63D0\u4F9B"), lines.join(`
`);
}
function renderTemplate(template, values, headerOf) {
  return template.replace(/\{\{\s*([^}\s]+)\s*\}\}/gu, (match, rawKey) => {
    let value = values[rawKey];
    return value === void 0 ? match : valueToText(value, headerOf(rawKey));
  });
}
var IMPLICIT_INSTRUCTION_FIELD = {
  id: "instruction",
  label: "\u8865\u5145\u8BF4\u660E",
  type: "textarea",
  placeholder: "\u672C\u6B21\u4EFB\u52A1\u7684\u5177\u4F53\u8981\u6C42\u3001\u80CC\u666F\u6216\u6CE8\u610F\u4E8B\u9879\uFF08\u53EF\u9009\uFF09"
};
function effectiveFields(entry) {
  return entry.fields !== void 0 && entry.fields.length > 0 ? entry.fields : [IMPLICIT_INSTRUCTION_FIELD];
}
function fieldSummaryLines(fields, values) {
  let lines = [];
  for (let field of fields) {
    if (field.type === "files") continue;
    let value = values[field.id], text2 = value === void 0 ? "" : valueToText(value, field.label);
    lines.push(`${field.label}\uFF1A${text2.trim() === "" ? "\uFF08\u672A\u63D0\u4F9B\uFF09" : text2}`);
  }
  return lines;
}
function buildCustomEntryPrompt(request) {
  let { entry } = request, gestures = [
    ...entry.legal !== void 0 ? [entry.legal.adapter] : [],
    entry.skill,
    ...entry.extraSkills ?? []
  ].map((name) => `/${name}`), lines = [`\u8BF7\u5F00\u59CB${entry.label} ${gestures.join(" ")}`, ""], template = entry.template?.trim() ?? "", fields = effectiveFields(entry), headerOf = (fieldId) => fields.find((field) => field.id === fieldId)?.label ?? "\u76F8\u5173\u6750\u6599";
  if (template !== "")
    lines.push(renderTemplate(template, request.values, headerOf));
  else {
    let purpose = entry.purpose !== void 0 && entry.purpose !== "" ? entry.purpose : entry.description;
    lines.push(purpose !== void 0 && purpose !== "" ? `\u4EFB\u52A1\u76EE\u6807\uFF1A${purpose}` : `\u4EFB\u52A1\u76EE\u6807\uFF1A\u8BF7\u6309 /${entry.skill} \u6280\u80FD\u7684\u6D41\u7A0B\u5B8C\u6210${entry.label}\u4EFB\u52A1`), entry.description !== void 0 && entry.description !== "" && purpose !== entry.description && lines.push(`\u5165\u53E3\u7B80\u8FF0\uFF1A${entry.description}`), entry.mcp !== void 0 && (entry.mcp.preset === "yuandian" ? lines.push("MCP \u5DE5\u5177\u504F\u597D\uFF1A\u4F18\u5148\u4F7F\u7528\u5143\u5178\u6CD5\u89C4\u68C0\u7D22\uFF08yuandian\uFF09MCP \u5DE5\u5177\u6838\u67E5\u6CD5\u89C4\u6761\u6587\u4E0E\u6848\u4F8B") : entry.mcp.preset === "custom" && entry.mcp.note !== void 0 && entry.mcp.note !== "" && lines.push(`MCP \u5DE5\u5177\u504F\u597D\uFF1A${entry.mcp.note}`)), lines.push(...fieldSummaryLines(fields, request.values));
  }
  lines.push("");
  for (let field of fields) {
    if (field.type !== "files" || template.includes(`{{${field.id}}}`)) continue;
    let value = request.values[field.id];
    value === void 0 || !isFilesValue(value) || isEmptyMaterial(value) || (appendMaterialLines(lines, value, field.label, "\u8BF7\u5148\u5411\u7528\u6237\u7D22\u53D6\u76F8\u5173\u6750\u6599"), lines.push(""));
  }
  return entry.legal !== void 0 && appendLegalProtocolForCustom(lines, entry.legal, entry.skill), lines.join(`
`);
}
function collectImages(values) {
  let images = [];
  for (let value of Object.values(values))
    if (isFilesValue(value))
      for (let image of value.images) images.push(image);
  return images;
}

// plugins/lawyer-sidebar/src/client/config.ts
var BUILTIN_ENTRY_IDS = ["contract-review", "case-analysis", "doc-generation"], BUILTIN_ENTRY_META = {
  "contract-review": {
    label: "\u5408\u540C\u5BA1\u6838",
    hint: "\u5408\u540C\u98CE\u9669\u4E0E\u6761\u6B3E\u5BA1\u67E5",
    description: "\u5408\u540C\u5BA1\u6838\uFF1A\u586B\u5199\u8868\u5355\u540E\u53D1\u8D77\u5F8B\u5E08\u6A21\u5F0F\u4F1A\u8BDD"
  },
  "case-analysis": {
    label: "\u6848\u4EF6\u5206\u6790",
    hint: "\u4E8B\u5B9E\u68B3\u7406 \xB7 \u4E89\u8BAE\u7126\u70B9 \xB7 \u98CE\u9669\u8BC4\u4F30",
    description: "\u6848\u4EF6\u5206\u6790\uFF1A\u4E8B\u5B9E\u68B3\u7406 / \u4E89\u8BAE\u7126\u70B9 / \u8BC1\u636E\u5BA1\u67E5 / \u98CE\u9669\u8BC4\u4F30"
  },
  "doc-generation": {
    label: "\u6848\u4EF6\u6587\u4E66\u751F\u6210",
    hint: "\u8D77\u8BC9\u72B6 \xB7 \u7B54\u8FA9\u72B6 \xB7 \u4EE3\u7406\u8BCD",
    description: "\u6587\u4E66\u751F\u6210\uFF1A\u8D77\u8BC9\u72B6 / \u7B54\u8FA9\u72B6 / \u4EE3\u7406\u8BCD / \u6CD5\u5F8B\u610F\u89C1\u4E66"
  }
}, FIELD_TYPES = ["text", "textarea", "select", "radio", "checkbox", "files"], OPTIONAL_TYPES = ["select", "radio", "checkbox"], FALLBACK_ENTRIES = BUILTIN_ENTRY_IDS.map((id) => ({ kind: "builtin", id })), SKILL_NAME_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
function isPlainObject(value) {
  return typeof value == "object" && value !== null && !Array.isArray(value);
}
function nonEmptyString(value) {
  return typeof value == "string" && value.trim() !== "" ? value.trim() : void 0;
}
function stringList(value) {
  if (!Array.isArray(value)) return [];
  let seen = /* @__PURE__ */ new Set(), items = [];
  for (let item of value) {
    if (typeof item != "string") continue;
    let trimmed = item.trim();
    trimmed === "" || seen.has(trimmed) || (seen.add(trimmed), items.push(trimmed));
  }
  return items;
}
function normalizeField(raw) {
  if (!isPlainObject(raw)) return;
  let id = nonEmptyString(raw.id), label = nonEmptyString(raw.label), type = raw.type;
  if (id === void 0 || label === void 0 || typeof type != "string" || !FIELD_TYPES.includes(type)) return;
  let options = stringList(raw.options);
  if (OPTIONAL_TYPES.includes(type) && options.length === 0) return;
  let field = { id, label, type };
  type !== "files" && (options.length > 0 && (field.options = options), typeof raw.default == "string" && (field.default = raw.default));
  let placeholder = nonEmptyString(raw.placeholder), hint = nonEmptyString(raw.hint), dropHint = nonEmptyString(raw.dropHint);
  return placeholder !== void 0 && (field.placeholder = placeholder), hint !== void 0 && (field.hint = hint), dropHint !== void 0 && (field.dropHint = dropHint), field;
}
function normalizeFields(raw) {
  if (!Array.isArray(raw)) return;
  let seen = /* @__PURE__ */ new Set(), fields = [];
  for (let item of raw) {
    let field = normalizeField(item);
    field === void 0 || seen.has(field.id) || (seen.add(field.id), fields.push(field));
  }
  return fields.length > 0 ? fields : void 0;
}
function normalizeLegal(raw) {
  if (!isPlainObject(raw)) return;
  let domain = nonEmptyString(raw.domain), adapter = nonEmptyString(raw.adapter);
  if (domain === void 0 || adapter === void 0) return;
  let subagent = raw.subagent === "contractReview" || raw.subagent === "caseAnalysis" || raw.subagent === "docGeneration" ? raw.subagent : "none", skills = stringList(raw.skills).filter((name) => SKILL_NAME_PATTERN.test(name)), references = stringList(raw.references);
  return {
    domain,
    adapter,
    skills,
    subagent,
    ...references.length > 0 ? { references } : {}
  };
}
function normalizeEntries(raw) {
  if (!Array.isArray(raw)) return FALLBACK_ENTRIES;
  let seen = /* @__PURE__ */ new Set(), entries = [];
  for (let item of raw) {
    if (!isPlainObject(item)) continue;
    let id = nonEmptyString(item.id);
    if (id !== void 0) {
      if (item.kind === "builtin") {
        if (!BUILTIN_ENTRY_IDS.includes(id) || seen.has(id)) continue;
        seen.add(id), entries.push({ kind: "builtin", id });
      } else if (item.kind === "custom") {
        let label = nonEmptyString(item.label), skill = nonEmptyString(item.skill);
        if (label === void 0 || skill === void 0 || !SKILL_NAME_PATTERN.test(skill) || seen.has(id)) continue;
        seen.add(id);
        let hint = nonEmptyString(item.hint), icon = nonEmptyString(item.icon), description = nonEmptyString(item.description), purpose = nonEmptyString(item.purpose), agentPreset = typeof item.agentPreset == "string" ? item.agentPreset : "lawyer", template = typeof item.template == "string" ? item.template : void 0, fields = normalizeFields(item.fields), legal = normalizeLegal(item.legal), extraSkills = stringList(item.extraSkills).filter((name) => SKILL_NAME_PATTERN.test(name) && name !== skill), mcp;
        if (isPlainObject(item.mcp)) {
          if (item.mcp.preset === "yuandian") mcp = { preset: "yuandian" };
          else if (item.mcp.preset === "custom") {
            let note = nonEmptyString(item.mcp.note);
            note !== void 0 && (mcp = { preset: "custom", note });
          }
        }
        entries.push({
          kind: "custom",
          id,
          label,
          skill,
          ...hint === void 0 ? {} : { hint },
          ...icon === void 0 ? {} : { icon },
          ...description === void 0 ? {} : { description },
          ...purpose === void 0 ? {} : { purpose },
          ...extraSkills.length > 0 ? { extraSkills } : {},
          ...agentPreset === "" ? {} : { agentPreset },
          ...template === void 0 ? {} : { template },
          ...fields === void 0 ? {} : { fields },
          ...legal === void 0 ? {} : { legal },
          ...mcp === void 0 ? {} : { mcp }
        });
      }
    }
  }
  return entries;
}

// plugins/lawyer-sidebar/src/client/profileRpc.ts
function unwrap(result, fallback) {
  if (result.ok && result.value !== void 0) return result.value;
  let message = result.error?.message;
  return new Error(
    typeof message == "string" && message !== "" ? message : `${fallback}\uFF08lawyer-tools \u662F\u5426\u5DF2\u91CD\u5EFA\u5E76\u91CD\u88C5\u5230\u542B lawyerProfile \u670D\u52A1\u7684\u7248\u672C\uFF1F\uFF09`
  );
}
function createProfileApi(ctx) {
  let call = (method, args, signal) => {
    let { rpc } = ctx.get("connection");
    return rpc.call("/api", `lawyerProfile/${method}`, { args }, signal).then(
      (result) => unwrap(result, `lawyerProfile/${method} \u8FD4\u56DE\u5F02\u5E38`),
      (error) => new Error(`${method} \u8BF7\u6C42\u5931\u8D25\uFF1A${error instanceof Error ? error.message : String(error)}`)
    );
  };
  return {
    status: (domain, signal) => call("status", { domain }, signal),
    read: (domain, signal) => call("read", { domain }, signal),
    write: (domain, content, signal) => call("write", { domain, content }, signal),
    template: (domain, signal) => call("template", { domain }, signal)
  };
}

// plugins/lawyer-sidebar/src/client/secretsRpc.ts
function unwrap2(result, fallback) {
  if (result.ok && result.value !== void 0) return result.value;
  let message = result.error?.message;
  return new Error(
    typeof message == "string" && message !== "" ? message : `${fallback}\uFF08lawyer-tools \u662F\u5426\u5DF2\u91CD\u5EFA\u5E76\u91CD\u88C5\u5230\u542B lawyerSecrets \u670D\u52A1\u7684\u7248\u672C\uFF1F\uFF09`
  );
}
function createSecretsApi(ctx) {
  let call = (method, args, signal) => {
    let { rpc } = ctx.get("connection");
    return rpc.call("/api", `lawyerSecrets/${method}`, { args }, signal).then(
      (result) => unwrap2(result, `lawyerSecrets/${method} \u8FD4\u56DE\u5F02\u5E38`),
      (error) => new Error(`${method} \u8BF7\u6C42\u5931\u8D25\uFF1A${error instanceof Error ? error.message : String(error)}`)
    );
  };
  return {
    status: (signal) => call("status", {}, signal),
    save: (apiKey, signal) => call("save", { apiKey }, signal),
    clear: (signal) => call("clear", {}, signal),
    verify: (signal) => call("verify", {}, signal)
  };
}

// plugins/lawyer-sidebar/src/client/DeepSeekKeyGuide.tsx
var import_react = require("react"), import_react_dom = require("react-dom");

// plugins/lawyer-sidebar/src/client/externalLink.ts
function openExternalUrl(url) {
  let opened = window.open(url, "_blank", "noopener,noreferrer");
  if (opened != null) return;
  let anchor = document.createElement("a");
  anchor.href = url, anchor.target = "_blank", anchor.rel = "noopener noreferrer", anchor.click();
}

// plugins/lawyer-sidebar/src/client/DeepSeekKeyGuide.tsx
var import_jsx_runtime = require("react/jsx-runtime"), CHECK_TIMEOUT_MS = 3e3, PLATFORM_LINKS = [
  {
    label: "\u6253\u5F00 DeepSeek \u5F00\u653E\u5E73\u53F0",
    url: "https://platform.deepseek.com/sign_in",
    note: "\u624B\u673A\u53F7\u6CE8\u518C\u5E76\u767B\u5F55"
  },
  {
    label: "\u53BB\u300CAPI Keys\u300D\u521B\u5EFA Key",
    url: "https://platform.deepseek.com/api_keys",
    note: "\u70B9\u300C\u521B\u5EFA API Key\u300D\uFF0C\u590D\u5236\u540E\u59A5\u5584\u4FDD\u5B58"
  },
  {
    label: "\u5145\u503C / \u67E5\u770B\u4F59\u989D",
    url: "https://platform.deepseek.com/top_up",
    note: "\u65B0\u7528\u6237\u8D60\u989D\u7528\u5B8C\u540E\u9700\u5148\u5145\u503C"
  }
];
function DeepSeekKeyGuide({
  complete,
  checkKeyConfigured,
  isGuideDone,
  markGuideDone
}) {
  let [visible, setVisible] = (0, import_react.useState)(null);
  return (0, import_react.useEffect)(() => {
    let settled = !1, finish = (configured) => {
      if (!settled) {
        if (settled = !0, configured) {
          markGuideDone(), complete();
          return;
        }
        setVisible(!0);
      }
    };
    if (isGuideDone()) {
      complete();
      return;
    }
    checkKeyConfigured().then(finish, () => {
      finish(!1);
    });
    let timer = setTimeout(() => {
      finish(!1);
    }, CHECK_TIMEOUT_MS);
    return () => {
      clearTimeout(timer);
    };
  }, []), (0, import_react.useEffect)(() => {
    if (visible !== !0) return;
    let root = document.getElementById("root");
    if (root === null) return;
    let previous = root.inert;
    return root.inert = !0, () => {
      root.inert = previous;
    };
  }, [visible]), visible !== !0 ? null : (0, import_react_dom.createPortal)(
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "lawyer-dialog-mask", role: "dialog", "aria-modal": "true", "aria-label": "\u51C6\u5907 DeepSeek API Key", children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "lawyer-dialog lawyer-guide", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "lawyer-dialog__header", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { className: "lawyer-dialog__title", children: "\u7B2C 1 \u6B65\uFF1A\u51C6\u5907\u4E00\u4E2A DeepSeek API Key" }) }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "lawyer-profile__hint", children: "\u672C\u5DE5\u4F5C\u53F0\u7684\u6A21\u578B\u8C03\u7528\u7528\u7684\u662F\u4F60\u81EA\u5DF1\u7684 DeepSeek API Key\u2014\u2014\u4E0D\u586B\u5C31\u7528\u4E0D\u4E86\u3002 \u6CA1\u6709 Key \u7684\u8BDD\u6309\u4E0B\u9762\u4E09\u6B65\u8D70\uFF0C\u4E24\u4E09\u5206\u949F\u5C31\u80FD\u62FF\u5230\u3002" }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ol", { className: "lawyer-profile__steps", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "\u6253\u5F00 DeepSeek \u5F00\u653E\u5E73\u53F0\uFF0C\u7528\u624B\u673A\u53F7\u6CE8\u518C\u5E76\u767B\u5F55\uFF1B" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "\u8FDB\u5165\u300CAPI Keys\u300D\u2192\u300C\u521B\u5EFA API Key\u300D\uFF0C\u590D\u5236\u751F\u6210\u7684 Key\uFF08\u53EA\u5728\u521B\u5EFA\u65F6\u5B8C\u6574\u663E\u793A\u4E00\u6B21\uFF09\uFF1B" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "\u56DE\u5230\u8FD9\u91CC\u70B9\u300C\u53BB\u586B\u5199\u300D\uFF0C\u628A Key \u7C98\u8FDB\u8F93\u5165\u6846\u4FDD\u5B58\u5373\u53EF\u3002" })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "lawyer-guide__links", children: PLATFORM_LINKS.map((link) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
        "button",
        {
          type: "button",
          className: "lawyer-guide__link",
          onClick: () => {
            openExternalUrl(link.url);
          },
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "lawyer-guide__link-label", children: [
              link.label,
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "lawyer-guide__link-arrow", "aria-hidden": "true", children: "\u2197" })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "lawyer-guide__link-note", children: link.note })
          ]
        },
        link.url
      )) }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "lawyer-profile__hint", children: "\u94FE\u63A5\u4F1A\u5728\u7CFB\u7EDF\u9ED8\u8BA4\u6D4F\u89C8\u5668\u91CC\u6253\u5F00\u3002\u6CE8\u518C\u4E0E\u5145\u503C\u90FD\u5728\u90A3\u8FB9\u5B8C\u6210\uFF0C\u5B8C\u6210\u540E\u56DE\u5230\u672C\u7A97\u53E3\u7EE7\u7EED\u3002" }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "lawyer-dialog__actions", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          "button",
          {
            type: "button",
            className: "lawyer-profile__link",
            onClick: () => {
              markGuideDone(), complete();
            },
            children: "\u6211\u5DF2\u7528\u5176\u4ED6\u6A21\u578B\uFF0C\u4E0D\u518D\u63D0\u793A"
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          "button",
          {
            type: "button",
            className: "lawyer-dialog__submit",
            onClick: () => {
              markGuideDone(), complete();
            },
            children: "\u53BB\u586B\u5199 API Key"
          }
        )
      ] })
    ] }) }),
    document.body
  );
}

// plugins/lawyer-sidebar/src/client/profileFieldsFull.ts
var IDENTITY_STEP = "\u6267\u4E1A\u8EAB\u4EFD", SALES_STEP = "\u9500\u552E\u65B9\u5408\u540C\u624B\u518C", PURCHASE_STEP = "\u91C7\u8D2D\u65B9\u5408\u540C\u624B\u518C", INHOUSE_KEYWORDS = ["\u4F01\u4E1A\u6CD5\u52A1", "\u6CD5\u52A1\u7BA1\u7406", "\u516C\u53F8\u6CD5\u52A1"], INTEGRATION = ["\u2713 \u5DF2\u63A5\u5165", "\u2717 \u672A\u63A5\u5165"], ON_OFF = ["\u5F00", "\u5173"], COMMERCIAL_SETTINGS = [
  "\u4E2A\u4EBA\u6267\u4E1A",
  "\u5C0F\u578B\u5F8B\u6240\uFF082-10\u4EBA\uFF09",
  "\u4E2D\u578B\u5F8B\u6240",
  "\u5927\u578B\u5F8B\u6240",
  "\u4F01\u4E1A\u6CD5\u52A1",
  "\u653F\u5E9C/\u6CD5\u5F8B\u63F4\u52A9/\u6CD5\u5F8B\u8BCA\u6240"
], LITIGATION_ROLES = [
  "\u4F01\u4E1A\u6CD5\u52A1",
  "\u5F8B\u6240\u5F8B\u5E08",
  "\u72EC\u7ACB\u6267\u4E1A",
  "\u5176\u4ED6"
], USER_ROLES = [
  "\u5F8B\u5E08/\u6CD5\u5F8B\u4E13\u4E1A\u4EBA\u58EB",
  "\u975E\u5F8B\u5E08\u4F46\u6709\u5F8B\u5E08\u652F\u6301",
  "\u975E\u5F8B\u5E08\u4E14\u65E0\u5F8B\u5E08\u652F\u6301"
];
function text(id, label, group, step, placeholder, hint) {
  return { id, label, group, step, type: "text", placeholder, hint };
}
function area(id, label, group, step, placeholder, hint) {
  return { id, label, group, step, type: "textarea", placeholder, hint };
}
function pick(id, label, group, step, options, hint) {
  return { id, label, group, step, type: "select", options, hint };
}
function inhouse(field) {
  return { ...field, role: "inhouse" };
}
function counsel(field) {
  return { ...field, role: "lawyer" };
}
function manualFields({ prefix, step }) {
  let group = (name) => `${prefix}\xB7${name}`, seller = prefix === "\u9500\u552E\u65B9";
  return [
    area(
      `${prefix === "\u9500\u552E\u65B9" ? "sales" : "purchase"}LiabilityCap`,
      `${prefix}\xB7\u76F4\u63A5\u635F\u5931\u4E0A\u9650`,
      group("\u8D23\u4EFB\u9650\u5236"),
      step,
      seller ? "\u5982\uFF1A\u5DF2\u4ED8\u6216\u5E94\u4ED8\u7684\u6700\u8FD1 12 \u4E2A\u6708\u670D\u52A1\u8D39" : "\u5982\uFF1A\u4F9B\u5E94\u5546\u8D23\u4EFB\u4E0A\u9650\u4E3A\u6700\u8FD1 12 \u4E2A\u6708\u670D\u52A1\u8D39",
      "\u7ED9\u5177\u4F53\u7B97\u6CD5\uFF0C\u4E0D\u8981\u5199\u300C\u5408\u7406\u300D\u2014\u2014\u5BF9\u65B9\u8BF4 24 \u4E2A\u6708\u65F6\u4F60\u662F\u9A73\u56DE\u8FD8\u662F\u7B7E\uFF1F"
    ),
    text(
      `${seller ? "sales" : "purchase"}Consequential`,
      `${prefix}\xB7\u95F4\u63A5\u540E\u679C\u6027\u635F\u5931`,
      group("\u8D23\u4EFB\u9650\u5236"),
      step,
      "\u6392\u9664 / \u4E0A\u9650\u4E3A X / \u65E0\u9650 / \u4E0E\u76F4\u63A5\u635F\u5931\u4E0A\u9650\u4E00\u81F4"
    ),
    area(
      `${seller ? "sales" : "purchase"}CapCarveouts`,
      `${prefix}\xB7\u4E0A\u9650\u4F8B\u5916\u4E8B\u9879`,
      group("\u8D23\u4EFB\u9650\u5236"),
      step,
      "\u5982\uFF1A\u91CD\u5927\u8FC7\u5931\u3001\u8FDD\u53CD\u4FDD\u5BC6\u4E49\u52A1\u3001\u77E5\u8BC6\u4EA7\u6743\u8D54\u507F\u3001\u6570\u636E\u5B89\u5168\u4E8B\u4EF6"
    ),
    text(
      `${seller ? "sales" : "purchase"}CapBase`,
      `${prefix}\xB7\u4E0A\u9650\u8BA1\u7B97\u57FA\u6570\u5B9A\u4E49`,
      group("\u8D23\u4EFB\u9650\u5236"),
      step,
      seller ? "\u5982\uFF1A\u7D22\u8D54\u53D1\u751F\u524D 12 \u4E2A\u6708\u5185\u5B9E\u9645\u5DF2\u4ED8\u8D39\u7528" : "\u5982\uFF1A\u7D22\u8D54\u524D 12 \u4E2A\u6708\u5DF2\u4ED8\u8D39\u7528\uFF1B\u62D2\u7EDD\u300C\u4EC5\u542B\u6700\u8FD1 3 \u4E2A\u6708\u300D",
      "\u57FA\u6570\u5B9A\u4E49\u6BD4\u91D1\u989D\u66F4\u91CD\u8981\uFF0C\u6A21\u7CCA\u8868\u8FF0\u4F1A\u88AB\u9010\u6761\u6807\u8BB0"
    ),
    area(
      `${seller ? "sales" : "purchase"}CapAcceptable`,
      `${prefix}\xB7\u8D23\u4EFB\u4E0A\u9650\u53EF\u63A5\u53D7\u7684\u66FF\u4EE3\u65B9\u6848`,
      group("\u8D23\u4EFB\u9650\u5236"),
      step
    ),
    area(
      `${seller ? "sales" : "purchase"}CapReject`,
      `${prefix}\xB7\u8D23\u4EFB\u4E0A\u9650\u7EDD\u4E0D\u63A5\u53D7`,
      group("\u8D23\u4EFB\u9650\u5236"),
      step,
      seller ? "\u5982\uFF1A\u95F4\u63A5\u635F\u5931\u65E0\u9650\u8D23\u4EFB" : "\u5982\uFF1A\u4E0A\u9650\u57FA\u6570\u4EC5\u542B\u524D 3 \u4E2A\u6708\u5DF2\u4ED8\u8D39\u7528"
    ),
    area(
      `${seller ? "sales" : "purchase"}IndemnityStandard`,
      `${prefix}\xB7\u8D54\u507F\u6807\u51C6\u7ACB\u573A`,
      group("\u8D54\u507F"),
      step,
      seller ? "\u5982\uFF1A\u6211\u65B9\u5C31\u670D\u52A1\u5F15\u53D1\u7684\u77E5\u8BC6\u4EA7\u6743\u4FB5\u6743\u7D22\u8D54\u8D1F\u8D23\uFF1B\u5BA2\u6237\u5C31\u5176\u6570\u636E\u4E0E\u4F7F\u7528\u884C\u4E3A\u8D1F\u8D23" : "\u5982\uFF1A\u4F9B\u5E94\u5546\u5C31\u77E5\u8BC6\u4EA7\u6743\u4FB5\u6743\u53CA\u6570\u636E\u5B89\u5168\u4E8B\u4EF6\u8D1F\u8D23\uFF1B\u6211\u65B9\u5C31\u6570\u636E\u4F7F\u7528\u8D1F\u8D23"
    ),
    area(
      `${seller ? "sales" : "purchase"}IndemnityAcceptable`,
      `${prefix}\xB7\u8D54\u507F\u53EF\u63A5\u53D7\u7684\u66FF\u4EE3\u65B9\u6848`,
      group("\u8D54\u507F"),
      step
    ),
    area(
      `${seller ? "sales" : "purchase"}IndemnityReject`,
      `${prefix}\xB7\u8D54\u507F\u7EDD\u4E0D\u63A5\u53D7`,
      group("\u8D54\u507F"),
      step
    ),
    area(
      `${seller ? "sales" : "purchase"}DpStandard`,
      `${prefix}\xB7\u6570\u636E\u4FDD\u62A4\u6807\u51C6\u7ACB\u573A`,
      group("\u6570\u636E\u4FDD\u62A4"),
      step,
      seller ? "\u5982\uFF1A\u6211\u65B9\u4F5C\u4E3A\u53D7\u6258\u5904\u7406\u65B9\u63D0\u4F9B DPA" : "\u5982\uFF1A\u4F9B\u5E94\u5546\u7B7E\u7F72\u6211\u65B9 DPA\uFF0C\u4F5C\u4E3A\u53D7\u6258\u5904\u7406\u65B9"
    ),
    area(
      `${seller ? "sales" : "purchase"}DpRequirements`,
      `${prefix}\xB7\u6570\u636E\u4FDD\u62A4\u8981\u6C42`,
      group("\u6570\u636E\u4FDD\u62A4"),
      step,
      "\u5982\uFF1A\u63A5\u89E6\u5BA2\u6237\u6570\u636E\u7684\u4F9B\u5E94\u5546\u987B\u901A\u8FC7\u7B49\u4FDD\u6D4B\u8BC4\u6216 ISO 27001 \u8BA4\u8BC1"
    ),
    area(
      `${seller ? "sales" : "purchase"}DpAcceptable`,
      `${prefix}\xB7\u6570\u636E\u4FDD\u62A4\u53EF\u63A5\u53D7\u7684\u66FF\u4EE3\u65B9\u6848`,
      group("\u6570\u636E\u4FDD\u62A4"),
      step
    ),
    area(
      `${seller ? "sales" : "purchase"}TermStandard`,
      `${prefix}\xB7\u671F\u9650\u4E0E\u89E3\u9664\u6807\u51C6\u7ACB\u573A`,
      group("\u5408\u540C\u671F\u9650\u4E0E\u89E3\u9664"),
      step,
      seller ? "\u5982\uFF1A\u4E00\u5E74\u671F\uFF0C\u5230\u671F\u81EA\u52A8\u7EED\u7EA6\uFF0C\u63D0\u524D 30 \u65E5\u901A\u77E5\u53EF\u53D6\u6D88\u7EED\u7EA6" : "\u5982\uFF1A\u63D0\u524D 30 \u65E5\u901A\u77E5\u53EF\u4EFB\u610F\u89E3\u9664\uFF1B\u81EA\u52A8\u7EED\u7EA6\u987B\u9644 30 \u65E5\u53D6\u6D88\u7A97\u53E3"
    ),
    area(
      `${seller ? "sales" : "purchase"}TermAcceptable`,
      `${prefix}\xB7\u671F\u9650\u4E0E\u89E3\u9664\u53EF\u63A5\u53D7\u7684\u66FF\u4EE3\u65B9\u6848`,
      group("\u5408\u540C\u671F\u9650\u4E0E\u89E3\u9664"),
      step
    ),
    area(
      `${seller ? "sales" : "purchase"}TermReject`,
      `${prefix}\xB7\u671F\u9650\u4E0E\u89E3\u9664\u7EDD\u4E0D\u63A5\u53D7`,
      group("\u5408\u540C\u671F\u9650\u4E0E\u89E3\u9664"),
      step,
      seller ? "\u5982\uFF1A\u4ED8\u8D39\u671F\u5185\u5141\u8BB8\u4EFB\u610F\u89E3\u9664" : "\u5982\uFF1A\u591A\u5E74\u9501\u5B9A\u4E14\u65E0\u89E3\u9664\u6743"
    ),
    text(
      `${seller ? "sales" : "purchase"}LawPreferred`,
      `${prefix}\xB7\u9002\u7528\u6CD5\u5F8B\u4E0E\u7BA1\u8F96\u9996\u9009`,
      group("\u9002\u7528\u6CD5\u5F8B\u4E0E\u7BA1\u8F96"),
      step,
      "\u5982\uFF1A\u4E2D\u56FD\u6CD5\uFF0C\u6211\u65B9\u4F4F\u6240\u5730\u6709\u7BA1\u8F96\u6743\u7684\u4EBA\u6C11\u6CD5\u9662"
    ),
    text(
      `${seller ? "sales" : "purchase"}LawAcceptable`,
      `${prefix}\xB7\u9002\u7528\u6CD5\u5F8B\u4E0E\u7BA1\u8F96\u53EF\u63A5\u53D7`,
      group("\u9002\u7528\u6CD5\u5F8B\u4E0E\u7BA1\u8F96"),
      step
    ),
    text(
      `${seller ? "sales" : "purchase"}LawEscalate`,
      `${prefix}\xB7\u9002\u7528\u6CD5\u5F8B\u4E0E\u7BA1\u8F96\u9700\u4E0A\u62A5`,
      group("\u9002\u7528\u6CD5\u5F8B\u4E0E\u7BA1\u8F96"),
      step
    ),
    text(
      `${seller ? "sales" : "purchase"}LawReject`,
      `${prefix}\xB7\u9002\u7528\u6CD5\u5F8B\u4E0E\u7BA1\u8F96\u7EDD\u4E0D\u53EF\u63A5\u53D7`,
      group("\u9002\u7528\u6CD5\u5F8B\u4E0E\u7BA1\u8F96"),
      step
    ),
    area(
      `${seller ? "sales" : "purchase"}BottomLine`,
      `${prefix}\xB7\u5E95\u7EBF\u4E8B\u9879`,
      group("\u5E95\u7EBF\u4E8B\u9879"),
      step,
      seller ? "\u9500\u552E\u573A\u666F\u4E0B\u7684\u4EA4\u6613\u5E95\u7EBF\u2014\u2014\u6BCF\u4EFD\u9500\u552E\u65B9\u5BA1\u67E5\u6700\u5148\u68C0\u67E5\u6B64\u9879" : "\u91C7\u8D2D\u573A\u666F\u4E0B\u7684\u4EA4\u6613\u5E95\u7EBF\u2014\u2014\u6BCF\u4EFD\u91C7\u8D2D\u65B9\u5BA1\u67E5\u6700\u5148\u68C0\u67E5\u6B64\u9879"
    )
  ];
}
var FULL_COMMERCIAL_FIELDS = [
  // ── 执业身份（两版共用，首步的选择决定后面多出哪些步骤）──
  pick(
    "practiceSetting",
    "\u6267\u4E1A\u573A\u666F",
    "\u6267\u4E1A\u8EAB\u4EFD",
    IDENTITY_STEP,
    COMMERCIAL_SETTINGS,
    "\u9009\u300C\u4F01\u4E1A\u6CD5\u52A1\u300D\u8D70\u6CD5\u52A1\u7248\uFF08\u591A\u51FA\u5BA1\u6279\u4E0E\u4E0A\u62A5\u94FE\uFF09\uFF0C\u5176\u4F59\u8D70\u5F8B\u5E08\u7248\uFF08\u591A\u51FA\u4E8B\u9879\u5DE5\u4F5C\u7A7A\u95F4\uFF09"
  ),
  pick(
    "userRole",
    "\u4F7F\u7528\u8005\u89D2\u8272",
    "\u6267\u4E1A\u8EAB\u4EFD",
    IDENTITY_STEP,
    USER_ROLES,
    "\u975E\u5F8B\u5E08\u65F6\u8F93\u51FA\u5C06\u6846\u67B6\u4E3A\u300C\u4F9B\u5F8B\u5E08\u5BA1\u67E5\u7684\u7814\u7A76\u300D"
  ),
  // ── 我们是谁 ──
  text("orgName", "\u59D4\u6258\u4EBA\u540D\u79F0", "\u6211\u4EEC\u662F\u8C01", "\u6211\u4EEC\u662F\u8C01", "\u5982\uFF1A\u67D0\u67D0\u79D1\u6280\u6709\u9650\u516C\u53F8"),
  text("orgType", "\u6211\u65B9\u4E3B\u4F53\u7C7B\u578B", "\u6211\u4EEC\u662F\u8C01", "\u6211\u4EEC\u662F\u8C01", "\u5982\uFF1A\u6709\u9650\u8D23\u4EFB\u516C\u53F8"),
  text("teamSize", "\u5408\u540C\u56E2\u961F\u89C4\u6A21", "\u6211\u4EEC\u662F\u8C01", "\u6211\u4EEC\u662F\u8C01", "\u5982\uFF1A3 \u4EBA"),
  text("finalApprover", "\u6700\u7EC8\u5BA1\u6279\u4EBA", "\u6211\u4EEC\u662F\u8C01", "\u6211\u4EEC\u662F\u8C01", "\u5982\uFF1A\u6CD5\u52A1\u8D1F\u8D23\u4EBA \u738B\u67D0"),
  text("monthlyVolume", "\u6708\u5904\u7406\u534F\u8BAE\u91CF", "\u6211\u4EEC\u662F\u8C01", "\u6211\u4EEC\u662F\u8C01", "\u5982\uFF1A\u7EA6 40 \u4EFD"),
  pick(
    "contractMix",
    "\u534F\u8BAE\u7C7B\u578B\u6784\u6210",
    "\u6211\u4EEC\u662F\u8C01",
    "\u6211\u4EEC\u662F\u8C01",
    ["\u4F9B\u5E94\u5546\u4E3A\u4E3B", "\u5BA2\u6237\u4E3A\u4E3B", "\u6DF7\u5408\u578B"]
  ),
  text("clmName", "\u5408\u540C\u7BA1\u7406\u7CFB\u7EDF\u540D\u79F0", "\u6211\u4EEC\u662F\u8C01", "\u6211\u4EEC\u662F\u8C01", "\u5982\uFF1A\u81EA\u7814 CLM / \u65E0"),
  area("painPoint", "\u6700\u5934\u75BC\u7684\u4E8B", "\u6211\u4EEC\u662F\u8C01", "\u6211\u4EEC\u662F\u8C01", "\u7528\u56E2\u961F\u81EA\u5DF1\u7684\u8BDD\u5199\uFF0C\u8D8A\u5177\u4F53\u8D8A\u597D"),
  // ── 可用集成 ──
  pick(
    "intEsign",
    "\u7535\u5B50\u7B7E\u7EA6",
    "\u53EF\u7528\u96C6\u6210",
    "\u53EF\u7528\u96C6\u6210",
    INTEGRATION,
    "\u672A\u63A5\u5165\u65F6\u63D2\u4EF6\u53EA\u8F93\u51FA\u5408\u540C\u6587\u672C\uFF0C\u7B7E\u7F72\u6D41\u7A0B\u7531\u4F60\u81EA\u884C\u5B89\u6392"
  ),
  pick(
    "intClm",
    "\u5408\u540C\u7BA1\u7406\u7CFB\u7EDF",
    "\u53EF\u7528\u96C6\u6210",
    "\u53EF\u7528\u96C6\u6210",
    INTEGRATION,
    "\u672A\u63A5\u5165\u65F6\u624B\u52A8\u8BB0\u5F55\uFF0C\u7EED\u7EA6\u8FFD\u8E2A\u57FA\u4E8E\u672C\u5730\u767B\u8BB0\u518C\u8FD0\u884C"
  ),
  pick(
    "intDocStore",
    "\u6587\u6863\u5B58\u50A8",
    "\u53EF\u7528\u96C6\u6210",
    "\u53EF\u7528\u96C6\u6210",
    INTEGRATION,
    "\u672A\u63A5\u5165\u65F6\u6BCF\u6B21\u5BA1\u67E5\u9700\u4F60\u76F4\u63A5\u4E0A\u4F20\u534F\u8BAE"
  ),
  pick(
    "intIm",
    "\u5373\u65F6\u901A\u8BAF",
    "\u53EF\u7528\u96C6\u6210",
    "\u53EF\u7528\u96C6\u6210",
    INTEGRATION,
    "\u672A\u63A5\u5165\u65F6\u63D0\u9192\u4E0E\u5229\u76CA\u65B9\u6458\u8981\u4EE5\u6587\u5B57\u5F62\u5F0F\u5185\u8054\u8F93\u51FA"
  ),
  // ── 合同手册方向（决定后面出现销售方还是采购方手册）──
  pick(
    "reviewSide",
    "\u5F53\u524D\u64CD\u4F5C\u65B9",
    "\u5408\u540C\u624B\u518C",
    "\u5408\u540C\u624B\u518C",
    ["\u9500\u552E\u65B9", "\u91C7\u8D2D\u65B9", "\u53CC\u65B9"],
    "\u9500\u552E\u65B9\uFF1D\u6211\u65B9\u4F9B\u8D27\u3001\u901A\u5E38\u7528\u6211\u65B9\u6A21\u677F\uFF1B\u91C7\u8D2D\u65B9\uFF1D\u6211\u65B9\u91C7\u8D2D\u3001\u901A\u5E38\u7528\u5BF9\u65B9\u6A21\u677F\u3002\u9009\u300C\u53CC\u65B9\u300D\u4E24\u672C\u624B\u518C\u90FD\u8981\u586B"
  ),
  // ── 销售方 / 采购方合同手册（按上方选择在 UI 层显隐）──
  ...manualFields({ prefix: "\u9500\u552E\u65B9", step: SALES_STEP }),
  ...manualFields({ prefix: "\u91C7\u8D2D\u65B9", step: PURCHASE_STEP }),
  // ── 审批与上报（法务专属：模板的审批矩阵是「法务助理→主办律师→法务
  //    负责人→业务/CFO」，属企业法务的链路）──
  inhouse(text(
    "escJuniorScope",
    "\u521D\u7EA7\u5BA1\u6279\u4EBA\u53EF\u5BA1\u6279\u4E8B\u9879",
    "\u5BA1\u6279\u4E0E\u4E0A\u62A5",
    "\u5BA1\u6279\u4E0E\u4E0A\u62A5",
    "\u5982\uFF1A\u6CD5\u52A1\u52A9\u7406\u53EF\u6279\u6807\u51C6\u6A21\u677F\u4E14\u91D1\u989D <50 \u4E07"
  )),
  inhouse(text(
    "escMidScope",
    "\u4E3B\u529E\u5F8B\u5E08\u53EF\u5BA1\u6279\u4E8B\u9879",
    "\u5BA1\u6279\u4E0E\u4E0A\u62A5",
    "\u5BA1\u6279\u4E0E\u4E0A\u62A5",
    "\u5982\uFF1A\u4E3B\u529E\u5F8B\u5E08\u53EF\u6279 <200 \u4E07\uFF0C\u4E0A\u62A5\u6CD5\u52A1\u8D1F\u8D23\u4EBA"
  )),
  inhouse(text(
    "escHeadScope",
    "\u6CD5\u52A1\u8D1F\u8D23\u4EBA\u53EF\u5BA1\u6279\u4E8B\u9879",
    "\u5BA1\u6279\u4E0E\u4E0A\u62A5",
    "\u5BA1\u6279\u4E0E\u4E0A\u62A5",
    "\u5982\uFF1A\u6CD5\u52A1\u8D1F\u8D23\u4EBA\u53EF\u6279 <500 \u4E07\uFF0C\u4E0A\u62A5\u4E1A\u52A1/CFO"
  )),
  inhouse(text(
    "escAmountThreshold",
    "\u91D1\u989D\u9608\u503C",
    "\u5BA1\u6279\u4E0E\u4E0A\u62A5",
    "\u5BA1\u6279\u4E0E\u4E0A\u62A5",
    "\u5982\uFF1A>500 \u4E07\u987B\u4E1A\u52A1\u4E0E CFO \u8054\u6279",
    "\u53EA\u5199\u6570\u5B57\u7B49\u4E8E\u6CA1\u5199\u2014\u2014\u8981\u8BF4\u660E\u8C01\u5728\u54EA\u4E2A\u91D1\u989D\u4E0A\u63A5\u624B"
  )),
  inhouse(area(
    "escAutoEscalate",
    "\u65E0\u8BBA\u91D1\u989D\u5747\u9700\u4E0A\u62A5\u7684\u4E8B\u9879",
    "\u5BA1\u6279\u4E0E\u4E0A\u62A5",
    "\u5BA1\u6279\u4E0E\u4E0A\u62A5",
    "\u5982\uFF1A\u65E0\u9650\u8D23\u4EFB\u3001\u77E5\u8BC6\u4EA7\u6743\u5F52\u4F9B\u5E94\u5546\u6240\u6709\u3001\u4EFB\u4F55\u5217\u5165\u300C\u7EDD\u4E0D\u63A5\u53D7\u300D\u6E05\u5355\u7684\u6761\u6B3E"
  )),
  // ── 事项工作空间（律师专属：模板注明仅多客户业务适用，企业法务关闭）──
  counsel(pick(
    "matterWsEnabled",
    "\u4E8B\u9879\u5DE5\u4F5C\u7A7A\u95F4\u5DF2\u542F\u7528",
    "\u4E8B\u9879\u5DE5\u4F5C\u7A7A\u95F4",
    "\u4E8B\u9879\u5DE5\u4F5C\u7A7A\u95F4",
    ["\u2713 \u5DF2\u542F\u7528", "\u2717 \u672A\u542F\u7528"],
    "\u591A\u5BA2\u6237\u6267\u4E1A\uFF08\u4E2A\u4EBA\u6267\u4E1A/\u5F8B\u6240\uFF09\u624D\u9700\u8981\u6309\u4E8B\u9879\u9694\u79BB\u4E0A\u4E0B\u6587\uFF1B\u4F01\u4E1A\u6CD5\u52A1\u53EA\u6709\u4E00\u5BB6\u5BA2\u6237\uFF0C\u672C\u8282\u7701\u7565"
  )),
  counsel(text(
    "matterWsActive",
    "\u6D3B\u8DC3\u4E8B\u9879",
    "\u4E8B\u9879\u5DE5\u4F5C\u7A7A\u95F4",
    "\u4E8B\u9879\u5DE5\u4F5C\u7A7A\u95F4",
    "\u5982\uFF1A\u67D0\u67D0\u79D1\u6280\u80A1\u6743\u8F6C\u8BA9"
  )),
  counsel(pick(
    "matterWsCrossContext",
    "\u8DE8\u4E8B\u9879\u4E0A\u4E0B\u6587",
    "\u4E8B\u9879\u5DE5\u4F5C\u7A7A\u95F4",
    "\u4E8B\u9879\u5DE5\u4F5C\u7A7A\u95F4",
    ON_OFF,
    "\u5173\u95ED\u65F6\u5728\u4E8B\u9879 A \u91CC\u7EDD\u4E0D\u8BFB\u53D6\u4E8B\u9879 B \u7684\u6587\u4EF6"
  )),
  // ── 行文风格与收尾（两版共用）──
  area(
    "styleRedlineTone",
    "\u4FEE\u8BA2\u6587\u672C\u8BED\u6C14",
    "\u884C\u6587\u98CE\u683C",
    "\u884C\u6587\u98CE\u683C",
    "\u5982\uFF1A\u76F4\u63A5\u7ED9\u53EF\u66FF\u6362\u6587\u672C\uFF0C\u4E0D\u6539\u52A8\u7684\u6761\u6B3E\u4E0D\u89E3\u91CA"
  ),
  area(
    "styleStakeholderSummary",
    "\u5229\u76CA\u65B9\u6458\u8981",
    "\u884C\u6587\u98CE\u683C",
    "\u884C\u6587\u98CE\u683C",
    "\u5982\uFF1A\u5199\u7ED9\u4E1A\u52A1\u8D1F\u8D23\u4EBA\u770B\uFF0C\u63A7\u5236\u5728 5 \u6761\u4EE5\u5185\uFF0C\u4E0D\u51FA\u73B0\u6CD5\u6761\u7F16\u53F7"
  ),
  text(
    "styleDeliveryLocation",
    "\u4EA4\u4ED8\u7269\u8F93\u51FA\u4F4D\u7F6E",
    "\u884C\u6587\u98CE\u683C",
    "\u884C\u6587\u98CE\u683C",
    "\u5982\uFF1A\u5408\u540C\u7BA1\u7406\u7CFB\u7EDF / \u98DE\u4E66\u4E91\u6587\u6863\u300C\u6CD5\u52A1\u5BA1\u67E5\u300D\u6587\u4EF6\u5939"
  ),
  text(
    "styleRenewalReminder",
    "\u7EED\u7EA6\u63D0\u9192\u53D1\u9001\u81F3",
    "\u884C\u6587\u98CE\u683C",
    "\u884C\u6587\u98CE\u683C",
    "\u5982\uFF1A\u98DE\u4E66\u300C\u6CD5\u52A1\u300D\u9891\u9053 / legal@company.com"
  ),
  area(
    "ndaClosingAction",
    "\u4FDD\u5BC6\u534F\u8BAE\u5206\u6D41\u6536\u5C3E\u52A8\u4F5C",
    "\u884C\u6587\u98CE\u683C",
    "\u884C\u6587\u98CE\u683C",
    "\u5982\uFF1A\u8BF7\u5C06\u6B64\u8F93\u51FA\u53CA\u4FDD\u5BC6\u534F\u8BAE\u4E00\u5E76\u8F6C\u53D1\u7ED9\u5408\u540C\u7BA1\u7406\u5458"
  )
], FULL_LITIGATION_FIELDS = [
  // ── 执业身份（首步；模板「执业角色」决定下游技能用哪套话术）──
  pick(
    "litigationRole",
    "\u89D2\u8272",
    "\u6267\u4E1A\u8EAB\u4EFD",
    IDENTITY_STEP,
    LITIGATION_ROLES,
    "\u4F01\u4E1A\u6CD5\u52A1\u8D70\u300C\u6848\u4EF6\u7EC4\u5408/\u51C6\u5907\u91D1/\u7BA1\u7406\u5C42\u5907\u5FD8\u5F55\u300D\u53E3\u5F84\uFF0C\u5F8B\u6240\u5F8B\u5E08\u4E0E\u72EC\u7ACB\u6267\u4E1A\u8D70\u300C\u6848\u4EF6/\u5408\u4F19\u4EBA\u5BA1\u67E5/\u8BC1\u636E\u4EA4\u6362\u300D\u53E3\u5F84"
  ),
  pick(
    "userRole",
    "\u4F7F\u7528\u8005",
    "\u6267\u4E1A\u8EAB\u4EFD",
    IDENTITY_STEP,
    USER_ROLES,
    "\u51B3\u5B9A\u6BCF\u4EFD\u6848\u4EF6\u7B80\u62A5\u3001\u5927\u4E8B\u8BB0\u3001\u5F8B\u5E08\u51FD\u7684\u5DE5\u4F5C\u6210\u679C\u6807\u5934"
  ),
  text(
    "lawyerContact",
    "\u5F8B\u5E08\u8054\u7CFB\u4EBA",
    "\u6267\u4E1A\u8EAB\u4EFD",
    IDENTITY_STEP,
    "\u5982\uFF1A\u5916\u90E8\u5F8B\u6240 \u67D0\u67D0\u56E2\u961F / \u4E0D\u9002\u7528\uFF08\u672C\u4EBA\u5373\u5F8B\u5E08\uFF09"
  ),
  // ── 当事人角色 ──
  pick(
    "stance",
    "\u4E3B\u8981\u7ACB\u573A",
    "\u5F53\u4E8B\u4EBA\u89D2\u8272",
    "\u5F53\u4E8B\u4EBA\u89D2\u8272",
    ["\u539F\u544A/\u7533\u8BF7\u4EBA", "\u88AB\u544A/\u88AB\u7533\u8BF7\u4EBA", "\u4E24\u8005\u7686\u6709", "\u56E0\u6848\u800C\u5F02"],
    "\u6821\u51C6\u4F60\u7684\u8BCD\u6C47\uFF1A\u539F\u544A\u65B9\u770B\u65F6\u6548\u60AC\u5D16\uFF0C\u88AB\u544A\u65B9\u770B\u8D25\u8BC9\u655E\u53E3"
  ),
  // ── 可用集成 ──
  pick(
    "intFileStore",
    "\u6587\u4EF6\u5B58\u50A8",
    "\u53EF\u7528\u96C6\u6210",
    "\u53EF\u7528\u96C6\u6210",
    INTEGRATION,
    "\u672A\u63A5\u5165\u65F6\u6848\u4EF6\u6587\u4EF6\u5939\u4EC5\u9650\u672C\u5730"
  ),
  pick(
    "intIm",
    "\u5373\u65F6\u901A\u8BAF",
    "\u53EF\u7528\u96C6\u6210",
    "\u53EF\u7528\u96C6\u6210",
    INTEGRATION,
    "\u672A\u63A5\u5165\u65F6\u51FD\u4EF6\u624B\u52A8\u63D0\u53D6\uFF0C\u65E0\u81EA\u52A8\u5386\u53F2"
  ),
  pick(
    "intScheduler",
    "\u5B9A\u65F6\u4EFB\u52A1",
    "\u53EF\u7528\u96C6\u6210",
    "\u53EF\u7528\u96C6\u6210",
    INTEGRATION,
    "\u672A\u63A5\u5165\u65F6\u671F\u9650\u4E0E\u4FDD\u5168\u66F4\u65B0\u63D0\u9192\u4EC5\u6309\u9700\u8FD0\u884C"
  ),
  pick(
    "intClm",
    "\u5408\u540C\u7BA1\u7406\u7CFB\u7EDF",
    "\u53EF\u7528\u96C6\u6210",
    "\u53EF\u7528\u96C6\u6210",
    INTEGRATION,
    "\u672A\u63A5\u5165\u65F6\u5408\u540C\u53D6\u7528\u9700\u624B\u52A8\u8FDB\u884C\u5546\u4E1A\u4EA4\u53C9\u68C0\u7D22"
  ),
  // ── 风险校准 ──
  area(
    "riskAppetite",
    "\u98CE\u9669\u504F\u597D",
    "\u98CE\u9669\u6821\u51C6",
    "\u98CE\u9669\u6821\u51C6",
    "\u5982\uFF1A\u6709\u6CD5\u5F8B\u4F9D\u636E\u7684\u6848\u4EF6\u575A\u51B3\u5E94\u8BC9\uFF1B\u5C0F\u989D\u6ECB\u6270\u6848\u4EF6\u5FEB\u901F\u548C\u89E3\uFF1B\u907F\u514D\u4E0D\u5229\u5224\u51B3\u5F62\u6210\u5224\u4F8B"
  ),
  text(
    "severityHigh",
    "\u9AD8\u4E25\u91CD\u6027\u5B9A\u4E49",
    "\u98CE\u9669\u6821\u51C6",
    "\u98CE\u9669\u6821\u51C6",
    "\u5982\uFF1A\u6807\u7684\u989D/\u655E\u53E3 >500 \u4E07\u5143\uFF0C\u6216\u5F71\u54CD\u6838\u5FC3\u4E1A\u52A1\u7684\u7981\u6B62\u4EE4\uFF0C\u6216\u884C\u653F\u5904\u7F5A\u98CE\u9669"
  ),
  text(
    "severityMid",
    "\u4E2D\u4E25\u91CD\u6027\u5B9A\u4E49",
    "\u98CE\u9669\u6821\u51C6",
    "\u98CE\u9669\u6821\u51C6",
    "\u5982\uFF1A50 \u4E07\u2013500 \u4E07\u5143\uFF0C\u6216\u975E\u6838\u5FC3\u4E1A\u52A1\u7981\u6B62\u4EE4\uFF0C\u6216\u91CD\u5927\u5408\u540C\u635F\u5931"
  ),
  text(
    "severityLow",
    "\u4F4E\u4E25\u91CD\u6027\u5B9A\u4E49",
    "\u98CE\u9669\u6821\u51C6",
    "\u98CE\u9669\u6821\u51C6",
    "\u5982\uFF1A<50 \u4E07\u5143\u4E14\u65E0\u5176\u4ED6\u975E\u91D1\u94B1\u6551\u6D4E"
  ),
  text(
    "likelihoodHigh",
    "\u9AD8\u53EF\u80FD\u6027\u5B9A\u4E49",
    "\u98CE\u9669\u6821\u51C6",
    "\u98CE\u9669\u6821\u51C6",
    "\u5982\uFF1A\u57FA\u4E8E\u73B0\u6709\u8BC1\u636E\uFF0C\u4E0D\u5229\u7ED3\u679C\u53EF\u80FD\u6027\u8D85\u8FC7 50%"
  ),
  text(
    "likelihoodMid",
    "\u4E2D\u53EF\u80FD\u6027\u5B9A\u4E49",
    "\u98CE\u9669\u6821\u51C6",
    "\u98CE\u9669\u6821\u51C6",
    "\u5982\uFF1A\u5408\u7406\u53EF\u80FD\u6027\uFF0820%\u201350%\uFF09"
  ),
  text(
    "likelihoodLow",
    "\u4F4E\u53EF\u80FD\u6027\u5B9A\u4E49",
    "\u98CE\u9669\u6821\u51C6",
    "\u98CE\u9669\u6821\u51C6",
    "\u5982\uFF1A\u4E0D\u592A\u53EF\u80FD\uFF08<20%\uFF09\uFF0C\u4F46\u975E\u6BEB\u65E0\u6839\u636E"
  ),
  // ── 争议画像 ──
  area(
    "disputeBackground",
    "\u4E1A\u52A1\u80CC\u666F",
    "\u4E89\u8BAE\u753B\u50CF",
    "\u4E89\u8BAE\u753B\u50CF",
    "\u4E00\u6BB5\u8BDD\uFF1A\u4F60\u4EEC\u505A\u4EC0\u4E48\uFF0C\u4EE5\u53CA\u4E3A\u4EC0\u4E48\u4F1A\u8D77\u8BC9/\u88AB\u8BC9"
  ),
  text("disputePatternLabor", "\u52B3\u52A8\u4E89\u8BAE\u9891\u7387", "\u4E89\u8BAE\u753B\u50CF", "\u4E89\u8BAE\u753B\u50CF", "\u5982\uFF1A\u5E74\u5747 6 \u8D77\uFF0C\u591A\u4E3A\u8FDD\u6CD5\u89E3\u9664"),
  text("disputePatternContract", "\u5408\u540C\u5546\u4E8B\u7EA0\u7EB7\u9891\u7387", "\u4E89\u8BAE\u753B\u50CF", "\u4E89\u8BAE\u753B\u50CF", "\u5982\uFF1A\u5E74\u5747 12 \u8D77\uFF0C\u591A\u4E3A\u8D27\u6B3E"),
  text("disputePatternIp", "\u77E5\u8BC6\u4EA7\u6743\u9891\u7387", "\u4E89\u8BAE\u753B\u50CF", "\u4E89\u8BAE\u753B\u50CF", "\u5982\uFF1A\u5076\u53D1\uFF0C\u5546\u6807\u5F02\u8BAE\u4E3A\u4E3B"),
  text("disputePatternProduct", "\u4EA7\u54C1\u8D23\u4EFB\u9891\u7387", "\u4E89\u8BAE\u753B\u50CF", "\u4E89\u8BAE\u753B\u50CF", "\u5982\uFF1A\u7F55\u89C1"),
  text("disputePatternRegulatory", "\u884C\u653F\u76D1\u7BA1\u8C03\u67E5\u9891\u7387", "\u4E89\u8BAE\u753B\u50CF", "\u4E89\u8BAE\u753B\u50CF", "\u5982\uFF1A\u5E74\u5747 2 \u6B21"),
  text("disputePatternSubpoena", "\u7B2C\u4E09\u4EBA\u8C03\u67E5\u4EE4\u9891\u7387", "\u4E89\u8BAE\u753B\u50CF", "\u4E89\u8BAE\u753B\u50CF", "\u5982\uFF1A\u5E74\u5747 3 \u6B21"),
  area(
    "commonOpponents",
    "\u5E38\u89C1\u5BF9\u624B",
    "\u4E89\u8BAE\u753B\u50CF",
    "\u4E89\u8BAE\u753B\u50CF",
    "\u5982\uFF1A\u67D0\u67D0\u5EFA\u8BBE\uFF08\u5E38\u5E74\u52B3\u52A1\u7EA0\u7EB7\uFF09\u3001\u67D0\u67D0\u5F8B\u6240\uFF08\u77E5\u8BC6\u4EA7\u6743\u65B9\u5411\uFF09"
  ),
  area(
    "commonForums",
    "\u5E38\u89C1\u7BA1\u8F96\u6CD5\u9662\u4E0E\u4EF2\u88C1\u673A\u6784",
    "\u4E89\u8BAE\u753B\u50CF",
    "\u4E89\u8BAE\u753B\u50CF",
    "\u5982\uFF1A\u67D0\u67D0\u5E02\u67D0\u67D0\u533A\u4EBA\u6C11\u6CD5\u9662\u3001\u67D0\u67D0\u4EF2\u88C1\u59D4\u5458\u4F1A\u3001CIETAC"
  ),
  area(
    "fileStorage",
    "\u6848\u4EF6\u6587\u4EF6\u5B58\u50A8\u4F4D\u7F6E",
    "\u4E89\u8BAE\u753B\u50CF",
    "\u4E89\u8BAE\u753B\u50CF",
    "\u5982\uFF1A\u4F01\u4E1A\u7F51\u76D8\u300C\u6CD5\u52A1\u90E8\u300D/\u6848\u4EF6\u53F7\u5206\u5C42\uFF1B\u90AE\u4EF6\u5F52\u6863\u53EF\u68C0\u7D22"
  ),
  // ── 文书风格（两版共用的部分）──
  text(
    "privacyLabel",
    "\u4FDD\u5BC6\u6807\u6CE8",
    "\u6587\u4E66\u98CE\u683C",
    "\u6587\u4E66\u98CE\u683C",
    "\u5982\uFF1A\u4FDD\u5BC6 \u2014 \u5185\u90E8\u6CD5\u5F8B\u5206\u6790",
    "\u865A\u5047\u7684\u4FDD\u62A4\u627F\u8BFA\u4E0D\u5982\u4E0D\u6807\u6CE8\u2014\u2014\u4E2D\u56FD\u6CD5\u4E0B\u65E0\u300C\u5F8B\u5E08\u5DE5\u4F5C\u6210\u679C\u300D\u8FD9\u4E00\u6982\u5FF5"
  ),
  text(
    "privacyReview",
    "\u4FDD\u5BC6\u5BA1\u67E5\u673A\u5236",
    "\u6587\u4E66\u98CE\u683C",
    "\u6587\u4E66\u98CE\u683C",
    "\u5982\uFF1A\u5BF9\u5916\u53D1\u9001\u524D\u7531\u4E3B\u529E\u5F8B\u5E08\u590D\u6838\u6807\u6CE8\u4E0E\u53BB\u5411"
  ),
  text("evidenceTemplate", "\u8BC1\u636E\u4FDD\u5168\u6A21\u677F", "\u6587\u4E66\u98CE\u683C", "\u6587\u4E66\u98CE\u683C", "\u5982\uFF1Atemplates/\u8BC1\u636E\u4FDD\u5168\u901A\u77E5.md"),
  text("evidenceIssue", "\u8BC1\u636E\u4FDD\u5168\u7B7E\u53D1", "\u6587\u4E66\u98CE\u683C", "\u6587\u4E66\u98CE\u683C", "\u5982\uFF1A\u4E3B\u529E\u5F8B\u5E08\u7B7E\u53D1\u3001\u6CD5\u52A1\u52A9\u7406\u7B7E\u6536\u3001\u6BCF\u6708\u66F4\u65B0"),
  text(
    "escalationChannel",
    "\u4E0A\u62A5\u6E20\u9053",
    "\u6587\u4E66\u98CE\u683C",
    "\u6587\u4E66\u98CE\u683C",
    "\u5982\uFF1AGC \u90AE\u4EF6+\u5373\u65F6\u901A\u8BAF\u7D27\u6025\uFF1BCFO \u4EC5\u90AE\u4EF6\uFF1B\u8463\u4E8B\u4F1A\u901A\u8FC7 GC"
  ),
  text(
    "escalationSubject",
    "\u4E0A\u62A5\u6807\u9898\u60EF\u4F8B",
    "\u6587\u4E66\u98CE\u683C",
    "\u6587\u4E66\u98CE\u683C",
    "\u5982\uFF1A[\u8BC9\u8BBC \u2014 \u7D27\u6025] \u6848\u4EF6\u540D\u79F0 \u2014\u2014 \u4E00\u53E5\u8BDD\u6458\u8981"
  ),
  pick(
    "demandInsuranceNotice",
    "\u5F8B\u5E08\u51FD\u4FDD\u9669\u901A\u77E5\u65F6\u673A",
    "\u6587\u4E66\u98CE\u683C",
    "\u6587\u4E66\u98CE\u683C",
    ["\u53D1\u51FA\u5F8B\u5E08\u51FD\u524D", "\u53D1\u51FA\u540E", "\u4E0D\u9002\u7528", "\u89C6\u6848\u4EF6\u800C\u5B9A"]
  ),
  text(
    "demandMatterThreshold",
    "\u6848\u4EF6\u521B\u5EFA\u95E8\u69DB",
    "\u6587\u4E66\u98CE\u683C",
    "\u6587\u4E66\u98CE\u683C",
    "\u5982\uFF1A\u6D89\u53CA\u91D1\u989D >5 \u4E07\u5143 \u6216 \u4EFB\u4F55\u505C\u6B62\u4FB5\u6743\u51FD \u521B\u5EFA\u4E3A\u6848\u4EF6"
  ),
  // ── 公司概况（法务专属：内部联系人与汇报链只在企业法务侧成立）──
  inhouse(text(
    "entityListing",
    "\u4E0A\u5E02\u4E0E\u5B50\u516C\u53F8\u72B6\u6001",
    "\u516C\u53F8\u6982\u51B5",
    "\u516C\u53F8\u6982\u51B5",
    "\u5982\uFF1AA \u80A1\u4E0A\u5E02\uFF0C\u4E0B\u5C5E 4 \u5BB6\u5168\u8D44\u5B50\u516C\u53F8"
  )),
  inhouse(text("headcount", "\u5458\u5DE5\u4EBA\u6570", "\u516C\u53F8\u6982\u51B5", "\u516C\u53F8\u6982\u51B5", "\u5982\uFF1A1,200 \u4EBA")),
  inhouse(text("legalTeamSize", "\u6CD5\u52A1\u56E2\u961F\u89C4\u6A21", "\u516C\u53F8\u6982\u51B5", "\u516C\u53F8\u6982\u51B5", "\u5982\uFF1A8 \u4EBA\uFF08\u542B 2 \u540D\u8BC9\u8BBC\u4E13\u5458\uFF09")),
  inhouse(text(
    "contactGc",
    "\u6CD5\u52A1\u8D1F\u8D23\u4EBA\u8054\u7CFB\u65B9\u5F0F",
    "\u516C\u53F8\u6982\u51B5",
    "\u516C\u53F8\u6982\u51B5",
    "\u8D85\u8FC7\u6CD5\u52A1\u8D1F\u8D23\u4EBA\u4E0A\u62A5\u9608\u503C\u7684\u4E00\u5207\u4E8B\u9879"
  )),
  inhouse(text(
    "contactCfo",
    "CFO \u8054\u7CFB\u65B9\u5F0F",
    "\u516C\u53F8\u6982\u51B5",
    "\u516C\u53F8\u6982\u51B5",
    "\u51C6\u5907\u91D1\u3001\u5BF9\u5916\u62AB\u9732\u3001\u8D85\u8FC7\u9608\u503C\u7684\u548C\u89E3"
  )),
  inhouse(text("contactHr", "HR \u8D1F\u8D23\u4EBA\u8054\u7CFB\u65B9\u5F0F", "\u516C\u53F8\u6982\u51B5", "\u516C\u53F8\u6982\u51B5", "\u5168\u90E8\u52B3\u52A8\u4E89\u8BAE\u4E8B\u9879")),
  inhouse(text("contactPr", "\u516C\u5173\u8D1F\u8D23\u4EBA\u8054\u7CFB\u65B9\u5F0F", "\u516C\u53F8\u6982\u51B5", "\u516C\u53F8\u6982\u51B5", "\u6D89\u53CA\u5A92\u4F53/\u58F0\u8A89\u98CE\u9669\u7684\u4E8B\u9879")),
  inhouse(text(
    "contactInfoSec",
    "\u4FE1\u606F\u5B89\u5168\u8D1F\u8D23\u4EBA\u8054\u7CFB\u65B9\u5F0F",
    "\u516C\u53F8\u6982\u51B5",
    "\u516C\u53F8\u6982\u51B5",
    "\u6570\u636E\u4E8B\u4EF6\u3001\u7F51\u7EDC\u5B89\u5168\u8BC9\u8BBC\u3001\u76D1\u7BA1\u5B89\u5168\u8BE2\u95EE"
  )),
  inhouse(text(
    "contactAudit",
    "\u8463\u4E8B\u4F1A\u5BA1\u8BA1\u59D4\u5458\u4F1A\u8054\u7CFB\u65B9\u5F0F",
    "\u516C\u53F8\u6982\u51B5",
    "\u516C\u53F8\u6982\u51B5",
    "\u91CD\u5927\u4E8B\u9879\u3001\u9700\u62AB\u9732\u4E8B\u9879"
  )),
  inhouse(text("reportingLine", "\u6C47\u62A5\u5BF9\u8C61", "\u516C\u53F8\u6982\u51B5", "\u516C\u53F8\u6982\u51B5", "\u5982\uFF1A\u5411 GC \u6C47\u62A5")),
  // ── 重大性阈值（法务专属：模板明文「仅适用于企业法务」）──
  inhouse(text(
    "matProvision",
    "\u51C6\u5907\u91D1\u8BA1\u63D0\u9608\u503C",
    "\u91CD\u5927\u6027\u9608\u503C",
    "\u91CD\u5927\u6027\u9608\u503C",
    "\u5982\uFF1A\u5F88\u53EF\u80FD\u4E14\u53EF\u5408\u7406\u4F30\u8BA1 \u2192 \u8BA1\u63D0\u635F\u5931\u5E76\u901A\u77E5\u8D22\u52A1"
  )),
  inhouse(text(
    "matDisclosure",
    "\u5BF9\u5916\u62AB\u9732\u9608\u503C",
    "\u91CD\u5927\u6027\u9608\u503C",
    "\u91CD\u5927\u6027\u9608\u503C",
    "\u5982\uFF1A\u6784\u6210\u91CD\u5927\u8BC9\u8BBC\u3001\u4EF2\u88C1\u4E8B\u9879 \u2192 \u53D1\u5E03\u516C\u544A\u6216\u5B9A\u671F\u62A5\u544A\u62AB\u9732"
  )),
  inhouse(text(
    "matBoardReport",
    "\u7BA1\u7406\u5C42\u8463\u4E8B\u4F1A\u62A5\u544A\u9608\u503C",
    "\u91CD\u5927\u6027\u9608\u503C",
    "\u91CD\u5927\u6027\u9608\u503C",
    "\u5982\uFF1A\u6807\u7684\u989D >1000 \u4E07\u5143\u6216\u6709\u58F0\u8A89\u98CE\u9669 \u2192 \u5B63\u5EA6\u5907\u5FD8\u5F55"
  )),
  inhouse(text(
    "matGcEscalation",
    "GC \u7ACB\u5373\u4E0A\u62A5\u9608\u503C",
    "\u91CD\u5927\u6027\u9608\u503C",
    "\u91CD\u5927\u6027\u9608\u503C",
    "\u5982\uFF1A\u65B0\u6848\u4EF6\u6807\u7684\u989D >100 \u4E07\u5143\u3001\u76D1\u7BA1\u8C03\u67E5\u3001\u7FA4\u4F53\u6027\u7EA0\u7EB7 \u2192 48 \u5C0F\u65F6\u5185\u7B80\u62A5"
  )),
  // ── 和解权限阶梯（法务专属：审批人是 GC/CFO/董事会）──
  inhouse(text(
    "settlementTier1",
    "\u548C\u89E3\u6743\u9650\u6700\u4F4E\u6863",
    "\u548C\u89E3\u6743\u9650\u9636\u68AF",
    "\u548C\u89E3\u6743\u9650\u9636\u68AF",
    "\u5982\uFF1A\xA50\u201350 \u4E07 \u7531\u8BC9\u8BBC\u5F8B\u5E08\u51B3\u5B9A"
  )),
  inhouse(text(
    "settlementTier2",
    "\u548C\u89E3\u6743\u9650\u7B2C\u4E8C\u6863",
    "\u548C\u89E3\u6743\u9650\u9636\u68AF",
    "\u548C\u89E3\u6743\u9650\u9636\u68AF",
    "\u5982\uFF1A\xA550\u2013200 \u4E07 \u7531\u6CD5\u52A1\u8D1F\u8D23\u4EBA/GC \u5BA1\u6279"
  )),
  inhouse(text(
    "settlementTier3",
    "\u548C\u89E3\u6743\u9650\u7B2C\u4E09\u6863",
    "\u548C\u89E3\u6743\u9650\u9636\u68AF",
    "\u548C\u89E3\u6743\u9650\u9636\u68AF",
    "\u5982\uFF1A\xA5200\u20131000 \u4E07 \u7531 CFO + GC \u5BA1\u6279"
  )),
  inhouse(text(
    "settlementTier4",
    "\u548C\u89E3\u6743\u9650\u6700\u9AD8\u6863",
    "\u548C\u89E3\u6743\u9650\u9636\u68AF",
    "\u548C\u89E3\u6743\u9650\u9636\u68AF",
    "\u5982\uFF1A>\xA51000 \u4E07 \u7531\u8463\u4E8B\u4F1A/\u5BA1\u8BA1\u59D4\u5458\u4F1A\u5BA1\u6279"
  )),
  // ── 保险覆盖（法务专属）──
  inhouse(text("insDo", "\u8463\u8D23\u9669", "\u4FDD\u9669\u8986\u76D6", "\u4FDD\u9669\u8986\u76D6", "\u5982\uFF1A\u5E73\u5B89\uFF0C\u4FDD\u989D 5000 \u4E07\uFF0C\u514D\u8D54 100 \u4E07")),
  inhouse(text("insEmployer", "\u96C7\u4E3B\u8D23\u4EFB\u9669", "\u4FDD\u9669\u8986\u76D6", "\u4FDD\u9669\u8986\u76D6", "\u5982\uFF1A\u4EBA\u4FDD\uFF0C\u4FDD\u989D 1000 \u4E07")),
  inhouse(text("insCyber", "\u7F51\u7EDC\u5B89\u5168\u9669", "\u4FDD\u9669\u8986\u76D6", "\u4FDD\u9669\u8986\u76D6", "\u5982\uFF1A\u672A\u6295\u4FDD")),
  inhouse(text("insProduct", "\u4EA7\u54C1\u8D23\u4EFB\u9669", "\u4FDD\u9669\u8986\u76D6", "\u4FDD\u9669\u8986\u76D6", "\u5982\uFF1A\u592A\u4FDD\uFF0C\u4FDD\u989D 2000 \u4E07\uFF0C\u5E74\u5BA1")),
  inhouse(area(
    "insuranceNotice",
    "\u4FDD\u9669\u901A\u77E5\u7A0B\u5E8F",
    "\u4FDD\u9669\u8986\u76D6",
    "\u4FDD\u9669\u8986\u76D6",
    "\u5982\uFF1A\u6536\u5230\u8D77\u8BC9\u72B6 5 \u65E5\u5185\u901A\u77E5\u7ECF\u7EAA\u4EBA\u4E0E\u4FDD\u9669\u516C\u53F8\u6CD5\u52A1\uFF0C\u903E\u671F\u53EF\u80FD\u5F71\u54CD\u7406\u8D54"
  )),
  // ── 外部律师库（法务专属：企业法务才委托外部律所）──
  inhouse(area(
    "outsidePanel",
    "\u5916\u90E8\u5F8B\u5E08\u5E93",
    "\u5916\u90E8\u5F8B\u5E08\u5E93",
    "\u5916\u90E8\u5F8B\u5E08\u5E93",
    "\u5982\uFF1A\u67D0\u67D0\u5F8B\u6240 \u2014 \u738B\u67D0 \u2014 \u52B3\u52A8\u4E89\u8BAE \u2014 \u8BA1\u65F6 2000 \u5143/\u65F6 \u2014 \u6709\u6846\u67B6\u534F\u8BAE"
  )),
  // ── 管理层与外部律师文书（法务专属）──
  inhouse(area(
    "boardMemoFormat",
    "\u7BA1\u7406\u5C42\u8463\u4E8B\u4F1A\u5907\u5FD8\u5F55\u683C\u5F0F",
    "\u7BA1\u7406\u5C42\u4E0E\u5916\u90E8\u5F8B\u5E08\u6587\u4E66",
    "\u7BA1\u7406\u5C42\u4E0E\u5916\u90E8\u5F8B\u5E08\u6587\u4E66",
    "\u5982\uFF1A\u8981\u70B9\u6458\u8981 + \u98CE\u9669\u8868 + \u8BF7\u793A\u4E8B\u9879 + \u51C6\u5907\u91D1\u72B6\u6001 + \u4E0B\u4E00\u6B65"
  )),
  inhouse(area(
    "boardMemoTone",
    "\u7BA1\u7406\u5C42\u5907\u5FD8\u5F55\u8BED\u6C14",
    "\u7BA1\u7406\u5C42\u4E0E\u5916\u90E8\u5F8B\u5E08\u6587\u4E66",
    "\u7BA1\u7406\u5C42\u4E0E\u5916\u90E8\u5F8B\u5E08\u6587\u4E66",
    "\u5982\uFF1A\u901A\u4FD7\u4E2D\u6587\uFF0C\u4E0D\u65E0\u6545\u6A21\u7CCA\uFF0C\u6BCF\u4E2A\u6570\u5B57\u6709\u6765\u6E90"
  )),
  inhouse(area(
    "provisionMemoFormat",
    "\u51C6\u5907\u91D1\u5907\u5FD8\u5F55\u683C\u5F0F",
    "\u7BA1\u7406\u5C42\u4E0E\u5916\u90E8\u5F8B\u5E08\u6587\u4E66",
    "\u7BA1\u7406\u5C42\u4E0E\u5916\u90E8\u5F8B\u5E08\u6587\u4E66",
    "\u5982\uFF1A\u4E8B\u5B9E\u3001\u6CD5\u5F8B\u6807\u51C6\u3001\u6982\u7387\u8BC4\u4F30\u3001\u53EF\u4F30\u8BA1\u8303\u56F4\u3001\u51C6\u5907\u91D1\u5EFA\u8BAE"
  )),
  inhouse(text(
    "provisionMemoApprover",
    "\u51C6\u5907\u91D1\u5907\u5FD8\u5F55\u5BA1\u6279\u4EBA",
    "\u7BA1\u7406\u5C42\u4E0E\u5916\u90E8\u5F8B\u5E08\u6587\u4E66",
    "\u7BA1\u7406\u5C42\u4E0E\u5916\u90E8\u5F8B\u5E08\u6587\u4E66",
    "\u5982\uFF1ACFO"
  )),
  inhouse(area(
    "outsideCounselFormat",
    "\u5916\u90E8\u5F8B\u5E08\u6307\u4EE4\u683C\u5F0F",
    "\u7BA1\u7406\u5C42\u4E0E\u5916\u90E8\u5F8B\u5E08\u6587\u4E66",
    "\u7BA1\u7406\u5C42\u4E0E\u5916\u90E8\u5F8B\u5E08\u6587\u4E66",
    "\u5982\uFF1A\u5355\u5C01\u90AE\u4EF6\uFF0C\u7F16\u53F7\u6307\u4EE4\uFF0C\u671F\u9650\u52A0\u7C97\uFF0C\u9644\u9884\u7B97\u53C2\u8003"
  )),
  inhouse(area(
    "outsideCounselBudget",
    "\u5916\u90E8\u5F8B\u5E08\u9884\u7B97\u59FF\u6001",
    "\u7BA1\u7406\u5C42\u4E0E\u5916\u90E8\u5F8B\u5E08\u6587\u4E66",
    "\u7BA1\u7406\u5C42\u4E0E\u5916\u90E8\u5F8B\u5E08\u6587\u4E66",
    "\u5982\uFF1A\u5E74\u5316\u5F8B\u5E08\u8D39\u9884\u8BA1 >10 \u4E07\u5143\u7684\u6848\u4EF6\u9700\u6708\u5EA6\u9884\u7B97"
  )),
  // ── 律师执业实务（律师专属：模板注明律所与独立执业走这套话术）──
  counsel(pick(
    "practiceScale",
    "\u5F8B\u6240\u89C4\u6A21",
    "\u5F8B\u5E08\u6267\u4E1A\u5B9E\u52A1",
    "\u5F8B\u5E08\u6267\u4E1A\u5B9E\u52A1",
    ["\u72EC\u7ACB\u6267\u4E1A", "\u5C0F\u578B\u5F8B\u6240\uFF082-10\u4EBA\uFF09", "\u4E2D\u578B\u5F8B\u6240", "\u5927\u578B\u5F8B\u6240"]
  )),
  counsel(area(
    "teamStructure",
    "\u56E2\u961F\u5206\u5DE5\u4E0E\u5408\u4F19\u4EBA\u5BA1\u67E5",
    "\u5F8B\u5E08\u6267\u4E1A\u5B9E\u52A1",
    "\u5F8B\u5E08\u6267\u4E1A\u5B9E\u52A1",
    "\u5982\uFF1A\u4E3B\u529E\u5F8B\u5E08\u51FA\u521D\u7A3F\uFF0C\u5408\u4F19\u4EBA\u590D\u6838\u8D77\u8BC9\u72B6\u4E0E\u4EE3\u7406\u8BCD\uFF0C\u52A9\u7406\u8D1F\u8D23\u8BC1\u636E\u7F16\u53F7"
  )),
  counsel(pick(
    "feeModel",
    "\u6536\u8D39\u6A21\u5F0F",
    "\u5F8B\u5E08\u6267\u4E1A\u5B9E\u52A1",
    "\u5F8B\u5E08\u6267\u4E1A\u5B9E\u52A1",
    ["\u98CE\u9669\u4EE3\u7406", "\u8BA1\u65F6", "\u56FA\u5B9A\u8D39\u7528", "\u6DF7\u5408"]
  )),
  counsel(area(
    "clientReporting",
    "\u5BA2\u6237\u6C47\u62A5\u65B9\u5F0F",
    "\u5F8B\u5E08\u6267\u4E1A\u5B9E\u52A1",
    "\u5F8B\u5E08\u6267\u4E1A\u5B9E\u52A1",
    "\u5982\uFF1A\u6BCF\u6708\u4E00\u5C01\u8FDB\u5C55\u4FE1\uFF1B\u91CD\u5927\u8282\u70B9\u5F53\u5929\u7535\u8BDD\uFF0C\u4E8B\u540E\u90AE\u4EF6\u786E\u8BA4"
  )),
  // ── 事项工作空间（律师专属：多客户执业才需要按事项隔离）──
  counsel(pick(
    "matterWsEnabled",
    "\u4E8B\u9879\u5DE5\u4F5C\u7A7A\u95F4\u5DF2\u542F\u7528",
    "\u4E8B\u9879\u5DE5\u4F5C\u7A7A\u95F4",
    "\u4E8B\u9879\u5DE5\u4F5C\u7A7A\u95F4",
    ["\u2713 \u5DF2\u542F\u7528", "\u2717 \u672A\u542F\u7528"],
    "\u591A\u5BA2\u6237\u6267\u4E1A\u624D\u9700\u8981\u6309\u4E8B\u9879\u9694\u79BB\uFF1B\u4F01\u4E1A\u6CD5\u52A1\u53EA\u6709\u4E00\u5BB6\u5BA2\u6237\uFF0C\u672C\u8282\u7701\u7565"
  )),
  counsel(text(
    "matterWsActive",
    "\u6D3B\u8DC3\u4E8B\u9879",
    "\u4E8B\u9879\u5DE5\u4F5C\u7A7A\u95F4",
    "\u4E8B\u9879\u5DE5\u4F5C\u7A7A\u95F4",
    "\u5982\uFF1A\u67D0\u67D0\u5EFA\u6750\u8D27\u6B3E\u7EA0\u7EB7\uFF08\u88AB\u544A\uFF09"
  )),
  counsel(pick(
    "matterWsCrossContext",
    "\u8DE8\u4E8B\u9879\u4E0A\u4E0B\u6587",
    "\u4E8B\u9879\u5DE5\u4F5C\u7A7A\u95F4",
    "\u4E8B\u9879\u5DE5\u4F5C\u7A7A\u95F4",
    ON_OFF,
    "\u5173\u95ED\u65F6\u5728\u4E8B\u9879 A \u91CC\u7EDD\u4E0D\u8BFB\u53D6\u4E8B\u9879 B \u7684\u6587\u4EF6"
  )),
  // ── 利益冲突排查（律师专属：执业律师以个人判断或系统检索为主）──
  counsel(pick(
    "conflictMethod",
    "\u5229\u76CA\u51B2\u7A81\u6392\u67E5\u65B9\u6CD5",
    "\u5229\u76CA\u51B2\u7A81\u6392\u67E5",
    "\u5229\u76CA\u51B2\u7A81\u6392\u67E5",
    ["\u5F8B\u5E08\u4E2A\u4EBA\u5224\u65AD", "\u7CFB\u7EDF\u68C0\u7D22", "\u59D4\u6258\u5916\u90E8\u5F8B\u6240", "\u6CD5\u52A1\u90E8\u81EA\u67E5", "\u5176\u4ED6"]
  )),
  counsel(text(
    "conflictOwner",
    "\u5229\u76CA\u51B2\u7A81\u6392\u67E5\u6267\u884C\u4EBA",
    "\u5229\u76CA\u51B2\u7A81\u6392\u67E5",
    "\u5229\u76CA\u51B2\u7A81\u6392\u67E5",
    "\u5982\uFF1A\u4E3B\u529E\u5F8B\u5E08\u7ACB\u6848\u524D\u81EA\u67E5\uFF0C\u52A9\u7406\u590D\u6838"
  )),
  counsel(area(
    "conflictScope",
    "\u5229\u76CA\u51B2\u7A81\u6392\u67E5\u8303\u56F4",
    "\u5229\u76CA\u51B2\u7A81\u6392\u67E5",
    "\u5229\u76CA\u51B2\u7A81\u6392\u67E5",
    "\u5982\uFF1A\u5F53\u524D\u5BA2\u6237\u6E05\u5355\u3001\u6D3B\u8DC3\u4F9B\u5E94\u5546\u3001\u5173\u8054\u516C\u53F8\u30012 \u5E74\u5185\u79BB\u804C\u5458\u5DE5"
  )),
  counsel(pick(
    "conflictBeforeFiling",
    "\u7ACB\u6848\u524D\u662F\u5426\u987B\u5B8C\u6210\u6392\u67E5",
    "\u5229\u76CA\u51B2\u7A81\u6392\u67E5",
    "\u5229\u76CA\u51B2\u7A81\u6392\u67E5",
    ["\u662F", "\u5426"]
  ))
], FULL_FIELDS_BY_DOMAIN = {
  "commercial-legal": FULL_COMMERCIAL_FIELDS,
  "litigation-legal": FULL_LITIGATION_FIELDS
};

// plugins/lawyer-sidebar/src/client/profileFields.ts
var PROFILE_DOMAINS = [
  { domain: "commercial-legal", adapter: "chinese-legal-commercial", label: "\u5546\u4E8B\u5408\u540C" },
  { domain: "litigation-legal", adapter: "chinese-legal-litigation", label: "\u8BC9\u8BBC\u4EF2\u88C1" },
  { domain: "corporate-legal", adapter: "chinese-legal-corporate", label: "\u516C\u53F8\u4E0E\u5E76\u8D2D" },
  { domain: "employment-legal", adapter: "chinese-legal-employment", label: "\u52B3\u52A8\u7528\u5DE5" },
  { domain: "ip-legal", adapter: "chinese-legal-ip", label: "\u77E5\u8BC6\u4EA7\u6743" },
  { domain: "privacy-legal", adapter: "chinese-legal-privacy", label: "\u6570\u636E\u5408\u89C4\u4E0E\u9690\u79C1" },
  { domain: "product-legal", adapter: "chinese-legal-product", label: "\u4EA7\u54C1\u4E0E\u8425\u9500\u5408\u89C4" },
  { domain: "regulatory-legal", adapter: "chinese-legal-regulatory", label: "\u76D1\u7BA1\u5408\u89C4" },
  { domain: "ai-governance-legal", adapter: "chinese-legal-ai-governance", label: "AI \u6CBB\u7406" },
  { domain: "criminal-legal", adapter: "chinese-legal-criminal", label: "\u5211\u4E8B\u8FA9\u62A4\u4E0E\u5408\u89C4" },
  { domain: "law-student", adapter: "chinese-legal-law-student", label: "\u6CD5\u5B66\u5B66\u4E60\u4E0E\u6CD5\u8003" },
  { domain: "legal-clinic", adapter: "chinese-legal-clinic", label: "\u6CD5\u5F8B\u8BCA\u6240" },
  { domain: "legal-builder-hub", adapter: "chinese-legal-builder-hub", label: "\u6CD5\u5F8B\u6280\u80FD\u8FD0\u8425" }
], PRIMARY_PROFILE_DOMAINS = ["commercial-legal", "litigation-legal"], COMMERCIAL_FIELDS = [
  {
    id: "practiceSetting",
    label: "\u6267\u4E1A\u573A\u666F",
    group: "\u6211\u4EEC\u662F\u8C01",
    type: "select",
    options: COMMERCIAL_SETTINGS,
    hint: "\u51B3\u5B9A\u5BA1\u67E5\u53E3\u5F84\u4E0E\u5DE5\u4F5C\u6210\u679C\u7684\u5448\u73B0\u65B9\u5F0F"
  },
  {
    id: "orgType",
    label: "\u6211\u65B9\u4E3B\u4F53\u7C7B\u578B",
    group: "\u6211\u4EEC\u662F\u8C01",
    type: "text",
    placeholder: "\u5982\uFF1A\u6709\u9650\u8D23\u4EFB\u516C\u53F8"
  },
  {
    id: "teamSize",
    label: "\u5408\u540C\u56E2\u961F\u89C4\u6A21",
    group: "\u6211\u4EEC\u662F\u8C01",
    type: "text",
    placeholder: "\u5982\uFF1A3 \u4EBA"
  },
  {
    id: "painPoint",
    label: "\u6700\u5934\u75BC\u7684\u4E8B",
    group: "\u6211\u4EEC\u662F\u8C01",
    type: "textarea",
    placeholder: "\u7528\u4F60\u81EA\u5DF1\u7684\u8BDD\u5199\uFF0C\u8D8A\u5177\u4F53\u8D8A\u597D"
  },
  {
    id: "userRole",
    label: "\u4F7F\u7528\u8005\u89D2\u8272",
    group: "\u4F7F\u7528\u8005",
    type: "select",
    options: USER_ROLES,
    hint: "\u975E\u5F8B\u5E08\u65F6\u8F93\u51FA\u5C06\u6846\u67B6\u4E3A\u300C\u4F9B\u5F8B\u5E08\u5BA1\u67E5\u7684\u7814\u7A76\u300D"
  },
  {
    id: "reviewSide",
    label: "\u5F53\u524D\u64CD\u4F5C\u65B9",
    group: "\u5BA1\u67E5\u6307\u5F15",
    type: "select",
    options: ["\u9500\u552E\u65B9", "\u91C7\u8D2D\u65B9", "\u53CC\u65B9"],
    hint: "\u5BA1\u67E5\u6307\u5F15\u6309\u6B64\u65B9\u5411\u6821\u51C6"
  },
  {
    id: "liabilityCap",
    label: "\u8D23\u4EFB\u4E0A\u9650",
    group: "\u5BA1\u67E5\u6307\u5F15",
    type: "text",
    placeholder: "\u5982\uFF1A12 \u4E2A\u6708\u670D\u52A1\u8D39",
    hint: "\u7ED9\u5177\u4F53\u6570\u5B57\uFF0C\u4E0D\u8981\u5199\u300C\u5408\u7406\u300D\u2014\u2014\u4F9B\u5E94\u5546\u8BF4 24 \u4E2A\u6708\u65F6\u4F60\u662F\u9A73\u56DE\u8FD8\u662F\u7B7E\uFF1F"
  },
  {
    id: "dealBreaker",
    label: "deal-breaker",
    group: "\u5BA1\u67E5\u6307\u5F15",
    type: "textarea",
    placeholder: "\u5982\u679C\u5408\u540C\u53EA\u6709\u4E00\u4E2A\u95EE\u9898\u4F1A\u8BA9\u4F60\u62D2\u7EDD\u7B7E\u7F72\uFF0C\u90A3\u662F\u4EC0\u4E48\uFF1F"
  },
  {
    id: "governingLaw",
    label: "\u7BA1\u8F96\u6CD5\u5F8B\u4E0E\u7BA1\u8F96\u5730",
    group: "\u5BA1\u67E5\u6307\u5F15",
    type: "text",
    placeholder: "\u5982\uFF1A\u4E2D\u56FD\u6CD5\uFF0C\u5DF1\u65B9\u4F4F\u6240\u5730\u6CD5\u9662"
  },
  {
    id: "escalationThreshold",
    label: "\u4E0A\u62A5\u9608\u503C",
    group: "\u4E0A\u62A5",
    type: "text",
    placeholder: "\u5982\uFF1A\u6807\u7684\u989D\u8D85\u8FC7 100 \u4E07\u62A5\u6CD5\u52A1\u8D1F\u8D23\u4EBA"
  },
  {
    id: "writingStyle",
    label: "\u884C\u6587\u98CE\u683C",
    group: "\u884C\u6587\u98CE\u683C",
    type: "textarea",
    placeholder: "\u5982\uFF1A\u7ED3\u8BBA\u5148\u884C\u3001\u5C11\u7528\u672F\u8BED\u3001\u7ED9\u53EF\u9009\u9879\u800C\u975E\u5355\u70B9\u5EFA\u8BAE"
  }
], LITIGATION_FIELDS = [
  {
    id: "userRole",
    label: "\u4F7F\u7528\u8005",
    group: "\u4F7F\u7528\u8005\u4E0E\u89D2\u8272",
    type: "select",
    options: USER_ROLES,
    hint: "\u51B3\u5B9A\u6BCF\u4E2A\u6848\u4EF6\u7B80\u62A5\u3001\u5927\u4E8B\u8BB0\u3001\u5F8B\u5E08\u51FD\u7684\u5DE5\u4F5C\u6210\u679C\u6807\u5934"
  },
  {
    id: "litigationRole",
    label: "\u89D2\u8272",
    group: "\u4F7F\u7528\u8005\u4E0E\u89D2\u8272",
    type: "select",
    options: LITIGATION_ROLES,
    hint: "\u51B3\u5B9A\u8BBF\u8C08\u4E0E\u753B\u50CF\u8D70\u54EA\u6761\u8DEF\u5F84\uFF1A\u4F01\u4E1A\u6CD5\u52A1\u8D70\u6CD5\u52A1\u7248\u95EE\u5377\uFF0C\u5F8B\u6240\u5F8B\u5E08/\u72EC\u7ACB\u6267\u4E1A\u8D70\u5F8B\u5E08\u7248"
  },
  {
    id: "stance",
    label: "\u4E3B\u8981\u7ACB\u573A",
    group: "\u4F7F\u7528\u8005\u4E0E\u89D2\u8272",
    type: "select",
    options: ["\u539F\u544A/\u7533\u8BF7\u4EBA", "\u88AB\u544A/\u88AB\u7533\u8BF7\u4EBA", "\u4E24\u8005\u7686\u6709", "\u56E0\u6848\u800C\u5F02"],
    hint: "\u6821\u51C6\u4F60\u7684\u8BCD\u6C47\uFF1A\u539F\u544A\u770B\u65F6\u6548\u60AC\u5D16\uFF0C\u88AB\u544A\u770B\u655E\u53E3\u8BC4\u4F30"
  },
  {
    id: "practiceSetting",
    label: "\u6267\u4E1A\u573A\u666F",
    group: "\u4F7F\u7528\u8005\u4E0E\u89D2\u8272",
    type: "select",
    options: [
      "\u72EC\u7ACB\u6267\u4E1A",
      "\u5C0F\u578B\u5F8B\u6240\uFF082-10\u4EBA\uFF09",
      "\u4E2D\u578B\u5F8B\u6240",
      "\u5927\u578B\u5F8B\u6240",
      "\u4F01\u4E1A\u6CD5\u52A1",
      "\u653F\u5E9C",
      "\u6CD5\u5F8B\u63F4\u52A9",
      "\u6CD5\u5F8B\u8BCA\u6240",
      "\u5176\u4ED6"
    ]
  },
  {
    id: "forum",
    label: "\u5E38\u7528\u7BA1\u8F96\u6CD5\u9662/\u4EF2\u88C1\u673A\u6784",
    group: "\u6267\u4E1A\u80CC\u666F",
    type: "text",
    placeholder: "\u5982\uFF1A\u67D0\u67D0\u5E02\u67D0\u67D0\u533A\u4EBA\u6C11\u6CD5\u9662\u3001\u67D0\u67D0\u4EF2\u88C1\u59D4\u5458\u4F1A"
  },
  {
    id: "caseLoad",
    label: "\u5728\u529E\u6848\u4EF6\u6570\u91CF",
    group: "\u6267\u4E1A\u80CC\u666F",
    type: "text",
    placeholder: "\u5982\uFF1A12 \u4EF6\uFF0C\u539F\u544A\u65B9\u4E3A\u4E3B"
  },
  {
    id: "feeModel",
    label: "\u6536\u8D39\u6A21\u5F0F",
    group: "\u6267\u4E1A\u80CC\u666F",
    type: "select",
    options: ["\u98CE\u9669\u4EE3\u7406", "\u8BA1\u65F6", "\u56FA\u5B9A\u8D39\u7528", "\u6DF7\u5408"]
  },
  {
    id: "riskAppetite",
    label: "\u98CE\u9669\u504F\u597D",
    group: "\u98CE\u9669\u6821\u51C6",
    type: "textarea",
    placeholder: "\u4E00\u53E5\u8BDD\uFF1A\u4F60\u80FD\u63A5\u53D7\u591A\u5927\u7684\u8D25\u8BC9\u655E\u53E3"
  },
  {
    id: "materialityThreshold",
    label: "\u91CD\u8981\u6027\u95E8\u69DB",
    group: "\u98CE\u9669\u6821\u51C6",
    type: "text",
    placeholder: "\u5982\uFF1A\u6807\u7684\u989D 50 \u4E07\u4EE5\u4E0A\u987B\u8BA1\u63D0\u5E76\u4E0A\u62A5"
  },
  {
    id: "writingStyle",
    label: "\u6587\u4E66\u98CE\u683C",
    group: "\u6587\u4E66\u98CE\u683C",
    type: "textarea",
    placeholder: "\u5982\uFF1A\u5F15\u7528\u7528\u300C\u6CD5\u91CA\u30142020\u3015X \u53F7\u300D\u683C\u5F0F\u3001\u6BB5\u843D\u77ED\u3001\u5148\u7ED9\u7ED3\u8BBA"
  },
  {
    id: "escalationChain",
    label: "\u4E0A\u62A5\u94FE",
    group: "\u6587\u4E66\u98CE\u683C",
    type: "text",
    placeholder: "\u5982\uFF1A\u4E3B\u529E\u5F8B\u5E08 \u2192 \u5408\u4F19\u4EBA \u2192 \u6CD5\u52A1\u8D1F\u8D23\u4EBA"
  }
], GENERIC_FIELDS = [
  {
    id: "userRole",
    label: "\u4F7F\u7528\u8005\u89D2\u8272",
    group: "\u4F7F\u7528\u8005",
    type: "select",
    options: USER_ROLES
  },
  {
    id: "practiceSetting",
    label: "\u6267\u4E1A\u573A\u666F",
    group: "\u4F7F\u7528\u8005",
    type: "select",
    options: COMMERCIAL_SETTINGS
  },
  {
    id: "stance",
    label: "\u4E3B\u8981\u7ACB\u573A",
    group: "\u4F7F\u7528\u8005",
    type: "text",
    placeholder: "\u5982\uFF1A\u5BA1\u67E5\u65B9/\u8D77\u8349\u65B9/\u88AB\u544A\u65B9"
  },
  {
    id: "forum",
    label: "\u5E38\u7528\u7BA1\u8F96\u5730",
    group: "\u6267\u4E1A\u80CC\u666F",
    type: "text",
    placeholder: "\u5982\uFF1A\u5E7F\u4E1C\u7701"
  },
  {
    id: "riskAppetite",
    label: "\u98CE\u9669\u504F\u597D",
    group: "\u98CE\u9669\u6821\u51C6",
    type: "textarea",
    placeholder: "\u4E00\u53E5\u8BDD\u63CF\u8FF0\u4F60\u80FD\u63A5\u53D7\u7684\u98CE\u9669\u655E\u53E3"
  },
  {
    id: "writingStyle",
    label: "\u884C\u6587\u98CE\u683C",
    group: "\u884C\u6587\u98CE\u683C",
    type: "textarea",
    placeholder: "\u5982\uFF1A\u7ED3\u8BBA\u5148\u884C\u3001\u7ED9\u53EF\u9009\u9879"
  }
], FIELDS_BY_DOMAIN = {
  "commercial-legal": COMMERCIAL_FIELDS,
  "litigation-legal": LITIGATION_FIELDS
};
function findProfileDomain(domain) {
  return PROFILE_DOMAINS.find((item) => item.domain === domain);
}
function profileFieldsFor(domain) {
  return FIELDS_BY_DOMAIN[domain] ?? GENERIC_FIELDS;
}
function hasSpecializedFields(domain) {
  return Object.hasOwn(FIELDS_BY_DOMAIN, domain);
}
function identityFor(domain, values) {
  let raw = domain === "commercial-legal" ? values.practiceSetting ?? "" : domain === "litigation-legal" ? values.litigationRole ?? "" : "";
  return INHOUSE_KEYWORDS.some((keyword) => raw.includes(keyword)) ? "inhouse" : "lawyer";
}
function fullProfileFieldsFor(domain, values) {
  let table = FULL_FIELDS_BY_DOMAIN[domain];
  if (table === void 0) return;
  let identity = identityFor(domain, values);
  return table.filter((field) => field.role === void 0 || field.role === identity);
}
function profileSteps(fields) {
  let steps = [];
  for (let field of fields)
    field.step !== void 0 && (steps.includes(field.step) || steps.push(field.step));
  return steps;
}
function visibleSteps(steps, domain, values) {
  if (domain !== "commercial-legal") return steps;
  let side = values.reviewSide ?? "";
  return side === "\u9500\u552E\u65B9" ? steps.filter((step) => step !== PURCHASE_STEP) : side === "\u91C7\u8D2D\u65B9" ? steps.filter((step) => step !== SALES_STEP) : side === "\u53CC\u65B9" ? steps : steps.filter((step) => step !== SALES_STEP && step !== PURCHASE_STEP);
}
var SAVED_ELSEWHERE_GROUP = "\u5176\u5B83\u5DF2\u586B\u9879";
function mergeFieldsForSave(primary, secondary, values) {
  let known = new Set(primary.map((field) => field.id)), extra = secondary.filter((field) => !known.has(field.id) && (values[field.id] ?? "").trim() !== "").map((field) => ({ ...field, group: SAVED_ELSEWHERE_GROUP, step: void 0 }));
  return extra.length === 0 ? primary : [...primary, ...extra];
}

// plugins/lawyer-sidebar/src/client/brandLogo.ts
var BRAND_LOGO_PNG_URI = "data:image/png;base64," + [
  "iVBORw0KGgoAAAANSUhEUgAAAZUAAAB4CAYAAAA69m/TAADLDklEQVR42uy9d7wdVdU+/qy1Z065PT2hdzUIigG7JFgRQRG8VwWUaiIlUhRQ2rmHIiCdUCQI",
  "SBH1XlFRX0RFk6goKk0wUUBqgEBIv+2cM7PX+v0xbc/JDSQUX9/vL/P5XJJw25w5M3vt9aynABuP/2cO7es2WgG/3Oc3XqWNx8Zj4/FGHrTxEvy/8T5qBURV",
  "CAAM3nnd21oX3zpm8IVnvFJpvDR2+Ohw677n3gNtQAGCKohIN162jcfGY+OxsahsPPLdB0BQgMho/XvHdnuDjx+vhfDdpssnNOoADNAAwuHGQ9qy5VWFg2++",
  "BlKDVipM1apsvIIbj43HxmNjUdl4ZEWlu9tQ/2125PI9Li1NaTsWfh3aANSyZQBR76KEgmGEDQSNcb+ptx1yUPv+H1u6sbBsPDYeG4/X++CNl+D/boeiFXjU",
  "32+DK3a/trSZf6xgJJQRsRqokooRVaNQAwVLzQqoGPgdqz9SWn39r1f9Q8di0SKqVCob74GNx8Zj4/G6Hd7/+cVVK4ze+B+9vfpaZgWqSujvYUyYSnh0CeH5",
  "RxSYIf+Vu/m+bqae/tBeu38vTxw4AoE0OEABxFAmaHIViKAEkBIjVIZ6Da9r4G0tf9zvIur/2aFamcrVjc/BxmPjsfHA/4/hLwUIfd2Mnn4hQNdiOC2cqhtS",
  "CJKfRz39dtTPV8BABf8txSWBrepzjt7J63jkb2g3BiNimAwJFCCO3lqNXhyIQBp9QK3C96yM1DkM3jytOPOyB1UrTLQRBtt4bDw2Hv8/LCr5OUABtT/2vanx",
  "t+9y+5bvxupdT36xawtakRSChA31SgUlKUyr/vTM2M7HKlPD8uRPoYAWT8O/r1mJeZ2HXfIYEP7XDLe1r9ugu49x7Z53YaLujmFYVTZKADQpKvHbq+T8HSAF",
  "FGTZVyO1Sddyy8eORNv1Hv4ysnZBnTEDmAEBqkqEjWyxjcfGY+Px/1ZRSRZ1nael4JkvftnQ6v214L3foA54Pmw9XKxc/pVtf+/Fpb2P/6f2dZt1dR8p3AUA",
  "82Hs058/UWnoaK8cboqyAYwPjASwg9YqlW4LJ+51annPL/1b+/oM9fTY/71rMN2j6oJQrznkMIx/4TqxEnLIniT1hBQAx/AXgUCAcvRJKKAMVbGm5BlZzgvM",
  "UT+ZsZ7dHGNehTEfsnG4v/HYeGw83vCion3dBv3xP7oBdPfJ66mFSArKyJ192/nPXvddM0XeByNA3ULBIFGFAcEwgtUYocamB/qH3PSTiB21dmFRBaEXhEUg",
  "++HdbzObdXwKtg4JWBlsIRqtyaqMAlOwIljeWFn6aNsJv7j/f6tjqVQq3IsqsO+8Drn7rL/zZqXNZCQEYBhQqBIo/jN5ewkElRj6Sl67qDVFMnZZ4/fBLt29",
  "/ot/2cE++aSVsEYgJqhRtHSitMXOCPxNHvCHdl5IPbuPAGFWYPq66eUK9sZj47Hx2FhUXvVge52ziD4YdOtrLi5pAZjQ1xK0zr3H30R3xEgYQJihZIB4J65Q",
  "EFsUyJORWtgYmLBn+YjbfttcBBQgVEDoVch3P/IjnuB/GoE0JBCf1VB0WQgQiWcSJoAP3w42lg22ffxdnZ854UlUKvSfLiz3XjPT33XWtUHjqk99x59SP9wG",
  "bDkUk1xcJQCSdCzxXEUSjI+iYpNAYKRAbTgwXPTR3hIRAdlEL10VUAHIg7y02mq5fQVZ/r0tjr3bmm1uLx940hNACAIgr9ANbjw2HhsPbKQUr3fnQKTU029B",
  "Phq3Vt/VOH339zRO3/092n/Bu1TVox5YIlJ9rbTVHjBVWdBxy9X+xNqOqNUbsPChMFGR0GiRZBAgHgJrua3olVrX3Kz33NORsMRUlVSVUKkYqpLgp4d28wT+",
  "NOphgEZQYBBptNeHQKNFmgiA9aWhoRnjjW9d+ZuzoQrsuIhUlf6Tc5RdZ80N9Jrj9jAtA4daVUuhNdH5xtdAMsYXFIBo9DkiaLJ/iF8TkYFp7fRRLKk0EEqA",
  "UGo2lGEbYtiGGEGI4TDkjg5jCjSB23h/31t+sT/4p0fst3vuDK47+dPqlUA9/Vb7us1/8lpsPPCfpa7Hz83G93jj8YZ1KsnO/6U/anv704fPLvrP9aCt+LZo",
  "h6uAGMhwsCjE+NsK77rxYtqaVvX1dZueDdjRaqXCmDGfMVI29y1+SaZtu/cuWLXgT/ACIDQmYTipUkJwil9MtKAKcchleBiaciJ133ShO5BP/q4/2Gce2kZ2",
  "x7Ao1DMgQJQAiX4YJQwqxAu0YeFaoFg95U107E2Pp1BQZTqjd4F9o4bZWqkwdlxEePs5Y2XBl+/GhMJ2OgIlNQzYqHDEXUj0ypKP+JWCAaFo3qLxnCX5r7IC",
  "TOmd4DDG4j2HRn+qAASwGvgGqDVgA++POvZtZ/ifOXne2iSKjcf/6WJSqTAwn6m6IMz9/3nTPcx/bTT79H6eMJUwf370P3ecqK83ZP6/J3OItqPoBahK8l9x",
  "Pr29hEWLoqd86lTtBVB9g55VejW6EKIzZeD6U3cqlR+8xZvCO4MtUG8IEoKvKuAVGLCQ4fZHgxc336c08+JH14eRta6FSW/Ye1+MWfUTiLGwMCCCxI1WWkwI",
  "IGUg6jQslw3jRfkNzbrnY9oYaEU0FJCFAO0IhLjhPfdjwpi3YSgUELHG84d0t58wpoRAamHZWBPWDIrTPoue838GoIvIfyGdNbxBi6peM82nWfcFwfX73ORN",
  "wBdkKAhJjKcxlpXO4BO2l8RYGFMEdSmBiJAM6pNZCyGGyIhi2Ezjr0P0OeKELpbhayoAyIIYKLDBSAhB1xV82FUnElFNN8Jh/8cXRBB6wNSP6D00Jejffj0B",
  "LzwGfPywlUQUpjT7KpSw/hupV6LuJx35/8X7J9W4AXDPnwBId7fB1A2TObxuG4NFi2i0mXLixvFGnBe9Kn3EDae8nVv+vsDbRDowbEOIMBSc4PfJOBjkWRTh",
  "ywp5Phh+04eKh1zxCHrXPYtIiw6XMHTx53bzOkuf59pz7cyhcMl7C1qWfQAoKqKlLlpEKcV00hcULa4CMgQdtIOgjgdRbJkIVYEgYFaFhAFkzc4oeD7CZGMv",
  "0e7cKSjphwBKqkSWtN7yhHotlr3CphhaeZe2TPij8T87l3o+svp1fijo3mumebvOui+wV+9zFo9vnCbKIQJ4IIaSxAVEocROQXGLYlJskzaK05KSQz/FuSXi",
  "LoUcxCwqTNm1iP7CFoaAFt+ES4YW1Dfd5/Nt+39hycaO5f/uDjvqFAiDV3zj7cX6kwdSIXgnlcu7QgUI7KOw/CfbMfWGwsFn3AuI8z3rT91fdtnczbrowQ+Q",
  "NmbYZYtBk7YVGO/HS7582R+3IBrRbpi0qP2fsUrKnnlV9eq/fGAHUNmW9trpEWiIDZE54HXRRnebnvic1sx7bnz796tTwvHtW1j2qfjsiqfxma+8RHu/9YXR",
  "zv8/VlSidrgK7HDhWMu//LPZ1NsOQ2EIGA+w8eKb7IadhUo5RAt58lLxH/z5n03r7aWwtxdr6R6SG2nNNd94c9He++1Cy/B0tClQ8NMapYFJF/kI3eX8K4l/",
  "P2m8MFIM+TCAUKMvYnYm2hEspEpRQVHkhYPp7lzjbVbSxFhAOPqZrSVALNCgp+rlNx1b6rngZ69HYdFKhbHJEkOzrg2C67ur3tjhMxBIKA0bFRTNZuogQJXz",
  "BUXdtzcpLnEh0ahLSeAwiHsncDp3gcQD/qRwS1a6KelIFYDhAEXPtyuHHwm3+sQnS584+NGNgsr/m/ovvaavU8xPzwcNz+KxfvQe18KYyMERkrraqtCYm7zF",
  "e86kak/jlQpL8vlHL7ujuPXIrb1oGZnltcsYtBSj+ycIgKEQ4RAekbHb9RYPvfQHWrFMZ0Kg//1xE9TTb5/5k5Y3mX/0flILDzRsN+OOzp0khMXAwN+k2LnQ",
  "80qX0dfPfjjBkjekw9vwIhetpasqlW3KtaVfM57/KdNa2AQaRuubEKRml0oDvxhuG3te5xlnPPZ6FhbaUH2EvXa/S3in8DgMDAQIjZ/0BhDNMHn3TwFA1EBR",
  "Cnb1JrNM983XYv4MQ3tkWG2yAK38fvVDbWt+82NvUtCBkC2EVBQAewARsbKJCgAAEmdXTfGoGhl1lhiMmBEGkqh9YefEGFCwgiHxLCj6KZxuq+LhTPwtDIoL",
  "DykJos4gqkZEiiJ5thaqdrx9L3//c+58LYXFXZCDy/bp9TbVCigMpAaPyJBCUhsWVY7O2+00NLsmaWEkjl9DPE+huFhKcg3V6dKcaoUYApOs4CTFLLq+Jrmc",
  "IQrk2ZXDTwxtss87O/c7ePnGjuX/EHRDhNXnfqKrvd3/FW9R2A2NuiCAQCjaiYlE2zBlASuj5HFj8Zo7C89M3Q8dl9TRq6NaJCVw2mMD23lbvmvr2wtvGvMx",
  "1QYkJIGoRBMHAhMYLAzLqK3uPKd8wo2naWV3r3mm89903Dtzpr/r3LnBwPnf2KMsKy40YwrvQCFaP7RWi541rwAEFjIQNsJhuqJ49tyvakU2GDpc7/dy+nSP",
  "Fvw+XHPwJ/ctjRv7XX+rCZ0wBBuoEpmIzROtXgTy0FiyfA2N2+TEwsmVudr9mdelsPD6D3oWWP3LX8ahc81nEdQFwiZdgKDQZHecIlHJvwUQMRAohS98kYgV",
  "MxbY/A1d1aGrz960bfkdN3lTpENqFGpgDKzxSI3Hwh4JmWQorxztsDX+ZYpsrhCdk8mG+EqkQkbBDBCrcvQB4qgmxFgaOC0o6fcKOwtyMgwnKDHH145AMBB4",
  "MkKhKRdJlt4357mf3duChf36amgQOm+6R1QVfVw7a3M+fJU3JahAJdQa/KigaHwnUqTPSQtKInSkzA8fiIoGGKRRQUnLjWraoWjaobiwn1NskhlNUm9s9G9V",
  "k2liLDzUEZqO0jZtT/7oRy/+48U2LFpEqhudsP/7ZwHEUPXbOgu/5i383aQWBFpnhhgPMCYazhliGAbB05AYw9QobNG1Z7D14h+iVzWZJzRDXv093Uw/Ltgt",
  "d3/bbYUdOj4mEjakZpSsYRLjkXoeCXtiiaXhCdgEpa7Vpw7POeobVF0Q9v2XBstpX7fZde7coHbUPp8q0Yrfmk3K7xCS0I5YK8OhqC1ArAephQJhyx1FvzDJ",
  "P8Ge8rmb6SxPemNW3esOwy1YEK754gGfKU+Z8BN/u8mdVjm0NVWyRGgIIwBrSCQhFKJhYcqEDj8cuqbWe9ap1N9vtfu1X+/1o/r29zARFL/7+o48hqegHgDC",
  "nN08hAwfcuovSQIfsTQUMLVd9M+3bE8EVY1pxr0zDMFoyd7zNW8Ls4nUNWBhD0RRk0DZqEaTv0nWoWhKnU0KDCUCvxSd0fhrRTPERjWywYo6rGx+ktCgKGkF",
  "kk18/G/l5PcYKAiiDFUCQz2MICx0lbcb/+S3Pk1ViP5uurdBqY0A0R4Lwvp1J78t/NXefy5uVj4SzKEG1gMZqMbF02FvaXL+2SnGcBhy1ymdDcWfJKvZ26RN",
  "TSshgwndApP7mdmnUoJAIJ40KOBJXTO6fnvy6dTfb9E7fWPa5H/z0d/D1EM2uGS/k80U3hX1RsCB+oT8SFFjGFRSCNkWMGwDf7LZp3H1Vw5PqOXNpqc9/f02",
  "PP8zny1MDj8hKgHqWmBmSlAG5Zg7wgRiYgTw4Pm2MPLkGasv/OYOPT39Vv/LnLS1O0IhgrNP+nhxy/E/8iYURIYalix5TGSImWGi18TGMACDUABjAt588kH2",
  "q5/7dq+qoqeHX1f4sr/fNk45cdfyxOLN3hbjxdYCYQuPmKOBKMfkHQaIDEHUQxiItPjWG3mmOnjCybu8HoVlPV9ULJVvpbGQugKsyag8I7Mj7RgUFOlG0sVY",
  "Say13FZuwYoHdgMAzAergqi6INQlYSsKqz4njUARwEs6CM14wmk1UHVH8tGOW8HxwhjNXFQEpJotdsnO3Blgq81mP2n9SE5Z4hlF2rEk8xrO5kYQqCjIOjCZ",
  "VYJl9doKnwf5wB4LZP0KCgz19FuCr3rN575S8B7+kze58RYJwlAbiApKPNCgdFYFqHWH7RlZIV8ITDQ/QWIomUBZyeCdHD42udBgfL3ZeQ8of+toPFsRhWpE",
  "bSarPuoIPVr11cZ3T59G1QWhbrTX/++do/T0W736a9v7HbXTQBKiAS8GNpF0xel/1d1lEWCVIRAPz52qf/xnO7r7Jbf7XtivquqBh09BqxFtKINNrAHT7LlM",
  "7l0ClIikQWomt5Vaan89SVUJ8+fzf5WZ7dR+1QtuamW77NuY3OphOASrMckVSy4BkYOsMBMa1hfVkKeMmxWeevxe9KMfWZ0+3XtdzmnRItJHtWgaq670thpb",
  "klqoBI91lC/O0CWJdu1WYSZPMIWRpRdH70U//gPW993RLxo/pQ38AmULa9NkJlmAVOOFxjWO4migPfJsA3FVSY+vd/n8rk1bQB0U81rTjsDdQSf3n1DUSaTD",
  "akTVV6CgeLajiZqcKO1kojGC5kYNyNdGQKJBvxKlv4Nd9Ecpho5iHy1HF0JEBAEpF98eOQO/An0aIFQqRD1VO3jzcR8t8zPfQHFwBogggRG25Clx9uDFLK+k",
  "O8sciLNuMcGoE2hsrRtJHMa0NhUTTToUzdhgoxaUZBFQwCbvM0fFSwE0hLi93dhVj1ZV9ZPo76H/3WiE+YxFC/6P6B+6s79OXUrY8Wh9w7zmFi0ikIFtPHKx",
  "mVIoYEQskECs5MzjNIVYc3M7hZFAhNv9rfDni3aj9+N32t1jANhkphhMOvIj3lhvJ6mrEMgghW4T3DZjKabPphUDQ4qytx9Ouv14WrBgIGa7/++/h5WKoWo1",
  "1NP/eihP8bdAXUPAeCkbNXmmNNlPc/RqYxidAyG0+8LLl/dC8T9YsOC1zxy7u5n6+63ucOF07up4pwUJKZnE9i/aj1K2cxZy5s8EttYIGzEd5el6zkXvo1NP",
  "uPu1eBxuWJW0NlrMEk2cRh2JuouOarwIxvtZ1axhYQDeKDjie3dT4VXMNqL0Rl2OZGaIscVISnFViVArTYqPRqJFlfRhSMF8zVyw0sUy1m1oQo+NVIDZbCIZ",
  "Ykf1zRFCaqZUFwKRNHUvqoCvEF2cMATWNYyLTk/RS4C96rHLyTwxmzoJGLEWAZjUsCZFEMk15ej6ixtOj4y4IA7N2mHjRZ83IYwylDgCCSll9KiyZVUFyECJ",
  "RDMokwiZdifjfqXXR5MBf7pQKKAw2iDxPfuJxvWn71Q8vP/v/2k2WF9ft+le2K/x7/w/RBZo3iUueEPscNJF//JjPmxan9xbGp5QSCa9nRNYNW3f4TzflBJb",
  "OGRBCxG6/M8B+B2mLs2ebzZQrJmNFkMYDFXJxBsQZ+PnbHhS+yAQVA1RMNyClp+MAzCA3goB1f+GjYGoqpHKQZ/mljGKIaFszXL3XZRR75UQr2xQgdFAhVuL",
  "u+hVV76bjjrqntdsUjtmDAOwUnt6X96kXdCwAhBrsgASp9KDbJOpMY8q2kSzVYvOLg//Wrg7gLtx5ZX0nwnpYuJcG5VQUlMQ3xmYxycuGu34I0zJjL5bn/mb",
  "un5vzyWgVds6QpN0UKxxx6HpTR2vm5QUHYd91rybTuAdiRZmQtJouXBYrBePOxRVZxcVdwH5ohQvoeK2UAphT9hTg5Ha9yEBMG+6wR5rs1cUESMG/T049Vsv",
  "/Ii3HLMvAisyJMrCRpPF2rWtT84lp0NB9pAmKvq4rUruJxWAPQ/sw8NQGNO2TPShAkgAaikYlEvAiMAG1rJE4tKEeY3Y5oWSzi91TnBhN46Lelx0LATFMnur",
  "Fh2kqg+hdwb/pxZ3rSAW2BGG+i6Y1rL4Z1vU2zd9C1rHbamEVmavLAqPGUIWNRsDiYCxIA0hpFAJI0oCJxdV3el2ss9TiVvURDUabVriiptQQBC3gOQStyGR",
  "MEpY1IpqALUNtTLCNqihNjRgVq98aWSr961oOfyUBdTTb0eZWr6G2tUPVTX2or3PwyYG3CAVJofckTlJpJsmceDkZKcrAnCRsOLJcXlYrWr16spWlh74sAQF",
  "qMIDadN8L3HUzl5RRI4RiAWIqYjtd9j03pnTnsPYv7BWplssGSRg2oa/3mkAxqyUDc1aGoUaLTphx8ncWn4vGpYA5qygUJMrhQLCbj0GgSCNQNDZ6uGRP+8E",
  "4B4sfPULeMzcC1W1gOpJH4ANGUKZZiOBqJNCnpJ48m2fVRgjDcLEzg/D88/FggX2P1NUgkTMofmCksNc3ZrOIEjGCkPCzMpCCbUy3SOiWuP6j3/btJUvggQB",
  "WeWE/aukKewUia0o3eWkRGKbvZ/kKK1SdpNGDlkpTRiUg45SbU1Ks9V0zpAo9CGS2rdkA+yo+JACZDgkAz9cGT7n7XXqTYpbyWW5NSEcTD/yrL2kcYv/prH7",
  "woYNrUuByWQ7/wzbi2jDqhBx+BBK+VlQ0n1JrIaPzlnZ95XrI9ywm17M47b6nSy8+6lCR1ej3tJKGB7SYrC6GEx880fMqn+/Va10m7ZCu9QawjbiD0fXP2G9",
  "xRsEaYbOEtElx3ufeHWwgHr+F1749d97J1cXDK+vUO41F5QqyfAlX9ndmGe/QSvmfwSbdJkiVgO8xp08AzY6d1+dwijN8ylqYt43a5goqzcy2tc5C43kNzzs",
  "oMicXM9YCwLfA9onozzwCMJvfeFe07bJeXTU+bepWlK8tuuYyANqFx7yieJ4nQZhqzbqUpyHFemjq034c2rgnTEnBRy9ukULFFPBIJLGmseOKGxVLtpaGBLI",
  "E3VEZm55TLpwja6DKEV/hmEdm26ycNe59wX5V3Dfax60o3/tgD+srwLjoTmE7bZmoAxJNZqUex1rLYbubBcUadxs3W+eBODV6UJUn0ILCuUdYIcA+JRd3ww5",
  "onSZczas8bNA8WMrxXIR/5E44QlLIzTpRut0Jo5ZlKKpQ3F3IpQvODbunJMLWV1gtQJePnn2dzoXn/1Fb4r/NqlJAKsGBFIRJFAsSeIiktF8U5ZW03xAYxxR",
  "Il9Iq0pZIVRF3IobiitF1MxEBSXZdOYuvMTNohg41U2hqkyewoMXWk/rm037sr/1LqvWBfcksEPjksPew5u/dCCkHmCICsReesNp0qGp0xjGr0ezpjDtnjRR",
  "v6ckhkSU6Flm8qy0HlOc+e0r1/0G/+QfADDym+vOMU/cdRZ3FA+QWmhZYIgZIoS8ORiy81ROJUPJwkqqIAsS8oDG4PixS36yLQEPaW8v440UfVWme1T9YzhQ",
  "/fiZ5c5nTke7RRgaBBYhUCAKndeREC9S4DlbKFN6Npwu3L0XyCk2OsrMKd6gsDpucy77Lvf1zd2+u1EThWE2Hf6usC/9KDjviJuJ5n5Ro2WBXn3HskAAA6PL",
  "KugoqIzErtZqY/g5xuFdIa37+tOCopkmzBaje/3DM5lmzQ30US027vjMwVAPsOD05bqFNXXgcCj7RFBiElHAL5hw/o8vrp+xzwC44CEkhYoFjKabAPbA7MfF",
  "mOIljaM1w+Po34Gq19ZJVuieGk1aQCfMWpJA0Bs2p0nen5YIdUnopBRfM6V4/XDhL3LWyHjmyfFrLhRfP2bkcqhYCZjdML6mWWrqipFIJcTJWor+v0q4Ktq9",
  "gl7ts+q9bFs1f4bBSwsUeyywBKh+v60FWOZYwideUzJKQSGntmg6t0AwGCFMNzzlaaUiVK2KokLj99przdC8y/bG47f/1JtopqERRNXcM7EvVRC53GvWUOQ5",
  "tGjCZxkKhecbgs9eNAuiTDEPAMN1iEWOwZYT6CerecK2it8UZssILcBEKBUBEjTq3j9HNpnxla69j7pL+7oNUdWuC3YACH77muPRYlWGhJl95IejUaHIMRTi",
  "u5/EWYfU+Z6EUq0R8w1EoSkVPNGxV3hfvvpKrXQXsGO3xcKFOjoLcD7oI4c/AdCBetXnhLv8g1CzFkImm99EN6emc6cmNb5mcCEIhFADM6bTN6ue/RCAh7DJ",
  "EvNGQWDa3W2o2h8Onfnhi1q20hOCQkNQYyVVJmIv7aZjpkcml0XUTUvCWHRZcQ4HPfeINT1vOspuVrOfnxULp8d2IRNynpEEWnRmlKgHAt8Tbyx9ITjj88WF",
  "b/3eF3bs77H6Knbb6Szl4s/vY8as2E0CWCiZaDZK6cKYzjzsKEVTnJkvM7hWQzhh81UAgOcfMQqEwz8/eK/SeN1UGhJG0Je7Ljj+dMg2IwnMygkbp7XN87q8",
  "Q6GF/PfmBL4mY0C6z7b7dVYBHYAZrh9bri1ZYc857jre5FNnEO1Re1UC3fHjM0JLMhFQctqGzD+QFLluNrGQggII668fAWMMIoZZ8gyyKyGAu+OM78D8PZZI",
  "MqhRX91kx/G6FBXSvm4mIhsbMEJVSwoo+r/mwT4B+IwkFMrxCXEeJsq0D6nS3gA2BIzvq6pPRDWgGlkKVKtWKxWmPY599sFfPTj9zSvOmW1k4EAmu11YrxOM",
  "AaTNGAwY9hE3Fy4lOGaogECS8KBEqeAjXC3LVAt3wYx4FhQAHKhnFK1t6gd2X4+DTitCpBzbHrEDjQnURrsLjZlRKoRAO/+uRX9zaoQrec3yBxsTt/nrwLTe",
  "qya9ddLgKynp6UewqkJy3YfezmglFo7QKsl2QukmAvGQXJtuAooZaqmuxrVNURBMg9vaC5bG/9R0X3zsvEf+4aG3L3gZyCT67fMqHmZU7eCfPv7Vtr//Yk9p",
  "KYzjQJU4/sa0W4qyy5o7lPRBiqEwBQiWgJUvTAEIuHWuvpHeS41zPzfbn7LqhLCEACPwiJmznYJTlBPnhIReLlkkAOJZHblkB5e0kLcwzb5eR6krzTAIudg6",
  "8j475GxqaC2mHaNhWZQa3pYdPds/fsxT1N9/cgzjbNjCtLBfAQMuLO+ldk91JIN9KSqvsaN1dm6a4PJNw2cIQQ0YNQM09AfxbwgJRmu8+kgu+hQORz9MNWFV",
  "IiPLJO+LJIanlJJNOP63DTUEAph0bOoWFLfbjJMvcjM+Ss0+WAEUmLlUGguYE+XfN79Xr7pqHzrqqJUb3PVtOQ0YegRQjWA6NKE0qZWRprPGtSFUAuqwfX19",
  "Bn/4g9Gjj9aYyfXqnJpXNhXV3LwXOQ0fJ+tM3DlFz0LMqGoEIypC+TLk3L2JPGDRIl0XhLjOaqQ/mddlg74eY198hy2P+RhprcT1QR+tq8bBKwAi2aI3anuv",
  "zi4nEX9YaNC6iryO1QhqPw0n7PGd4seO/4dWlKkKcdvRR1WL288/cczQU09jqHVLlHc+oqv8xy/d7XV4XVK3RMzxOMRpnZMhsQDWUOi3Fr1gdfF7hUNuO2i0",
  "bq7x/c+e4dPyqtS4QUAhNWVMiqFIqrJXJeu1FLgxYu8uHPGzDwLoXArUJhEPZkOwl2c4JTMFfejpMbj/8L9jXHlzDIuAiUVcHJscWrZDSVSkD38KG5AzvI+C",
  "tULTWvasN/k3z+9/4ac2J6rHv1g3ZCerVx/yS7TJnqirVSKj0kxaQBM05Kj5Y7qzqIjhkAVdd5tjr3k/pPGqW+pXioQe/vbFmxTD3/6DJnG7HRYm41HWLXPW",
  "ccTFhJSbZiaUdd7IBtOUDjSdvyf3mgt9kSsipYzynUMM844H6VwwJVaQ24ZmQ9Z0cbKKki+ycmXA3nZvpZPOeXxDdtrJexteeeBBZszAzRZkKWSTwjcSbxTj",
  "TU2ysck2LdGMNCkyJCooGZJh7yne/5adcUzPCPr7ZfCCr+5YbnnsXur0fKlHjiDqbl8kQgxyDtpKTfOr6D1KWYq5+4zzhqnuxiqBxuNz1Jj1RMnPJ1UYL0Sx",
  "6MviF//I9TF74plnautaIBOnX6Af6OsDqEfw019PwdO/eApe4EsExVE6LtLkPqGokAnlZlFQhZCGHhU9/OXhA+mHv7x11JkPgPWxTEnXlHu1U35dfYZbhjts",
  "wJl0bxT0iBPtXYp8KNQgNA14sqr+bTPniiPTRSW125K150TrcGb33JNjIlUuILz6gKNk5OJTzLj6pigAprYigxKtlz4wqvneP+UUJDoKyoZXBALYgEsjXdDh",
  "LpTNsd5Lt3+5fsshl9NBN56kFeEEqkVluiGiOoAXslO98AXbv8//wB/+AkLUYW0xozxSfLPHA2yYkD0yjTVS101nnKmV2zxs8g6a//x9OmPGdOClidGKsueJ",
  "V9mfn32wKQxvYwMOSGBSLxZJNC2iILbswYMwCpN2OYmIAgDLEvM2TJ1O6J1viV4+OyFd2BsvDUKDBtAW4djK2QJNUbeVYKAcd4QqSf480qRjShk5ClUrZHw1",
  "hYIX0tibvP0vPGILoiAJU9sQRqtWwBi3GWPwKYC8+IaiDDfWpgGkOxOQbFca4bUAszcehvGG2AP2zjBUXRDWz/7ccWY76grqNmQqRLToDFFuWtgdbgbcIWay",
  "uDdZ2KTkEHW80fJoWC4hQGO9FDkFKOc0EbOcEoBMs/MkJ8aA0kU+UUEwoREKjxtbso892g3gPCz5xXpBiloBY2G/6ryfjZfHvnsR2CgayiCOgiLUaeoEmeCX",
  "kGqf4EZVCyBMwmw8QVufmUSDOnu7IgH14dqjx5vJhWIYqM2tEBJvQhNtlTaNK1KUkFP8JtlgUUqXd7qapj1xBMtySiAQyQq9Zt9HCMUH1Ru8+fj3y7MDZ5n+",
  "/hOauz4FCN3dTFUHxqae6HOf+sgI5twxDKVOd+xEmm08Eqg4aUtJ3NfIhKCBYKvtt9Bfnv4OLFtSCOom9MdMIGy/7TO08+QXU3nfBmwI8+I7WtuL0dXPUOq8",
  "nojBjTCgHHzaHn/Mm2DBIBaAlVUUghBWahgOhjB5Ur1mh75XvuDC31K1Ks1mlJTF9U43920yn94qn7y5uHn9s/ACiMCyRMuCiBJHNFPSnGowY4Fo3PKpZCws",
  "l09HKiCJYktgVZTFI0/RWNp5TeHInx05v3eG2SM2kMuUuQT0dzMADL75feNLD/38116L7iwjoioUUT4l5f4KQYkLMNIwGDbbHtD+hWu+PxokpapMRLLynrlb",
  "tz31u9s9rNwJNmKsSaA2WgDVMINQAKyWhm3xTccUey68Qft+YNDdLblCsQF5FURQ+719/8jt9r0YsRrhahn0AAvngUqgJc0HaCX0aFEoOPR830MoCHn82f5h",
  "15+uGlBvpUIbGsSj8yoe7XFmaK/83K+5s/QRjKhVqFFwniCQ0WdzXUrKh49uXmuMNdDyL+i4ufuohkyv40wlZUcu1Fb7i73up61pO1uDEnmc2ce4w+DmHXFm",
  "d5N93l3AsqiAfGNPTe9F0/2uWTFKl75mFlluOI88fdwVn6bXW1ISM3xiDOCvdPp336U2WC/oJiIx/CHUq/e9FuNxhNTURgOJ2L3C6b4SXRK5lFRyui+haLNV",
  "MJBhGhlse9eOYw45/mntBdW2umQLf/ldi3RCoYSAY+TWocPHXQmlguFkYxJ3H8kGKwHHEpVRCu3EnaZLFtK1obCMBEA5sJKSIi2qKBZEBoYGePJuO9Nhhy1O",
  "d/0OHLbqm9/crk2f/gSRtx9WLmUucEEMeWgrvZXa2wtqkbqIwIXnkvuI4o5FnQ0ZA2QVUg9D47V7EaoTx3evGXoR5D0oJb7cr154R8wFWifbL9ep/Kb6DJdG",
  "OmxI8QQif39lMAGlRAyNR82RkIYi1Qib6H1gl5CV5CvFIvZhCxlac1e4zdZfKx555N/djiXqVHq6mfp/FAZXffZSb6vBzwprgxvkEyVDWkXCKlDNM1xiH4J4",
  "l5VXq5MLkQBR+i+BKIpXZA2hBA4Kk1bPqt10+H17VBdcmxSA/EXst6pK7UQvrl606IPFB866yA9eOMi0+x6CIB7EAfANIwDCRtuDjda39rZ3f/N27ZtaSBS+",
  "WNiviTsoEYlWwPTumU/qgw++J/j7+bMgQwdzY3g709raAmbo6mHUyFtuyhN+Wd/hExe0T+t+KOLgvwahUu90AywIteHfCOL3wUiIMLIiIE28vLDWToMcGrVj",
  "yW8BZq+14NkR80LD2/SrLQdfeKt2w6BPpbqOzikyEezntDXpT4XchvaoNvTa096C8PH3SwAlVZO3wY87oxwjjJ0iE82lojmUCPyiwfNL7oOGwMxpBnPvk9dR",
  "3UxEVdErT9/cdHnb2yAEw4vWDSTOB5SPAnA1BAnuTogdCBK1cWSQyrktXjPNWHO0YU23fgknJfvaHC2XRnHybv65kg1X196cCQAfosEmahvN05yXg73Cxvlf",
  "/gDKS46AeiEEXuqfGrOuKOnOqckrzt3QSHyfEls2ngnr/Ksxs7/6lN4xtUD9ixqD37znC6XJXjmwbEmj9SPnQ6fZ/I1i+JzgUozJIS8ku2rKHMST5wQOrJXM",
  "tUCpkwfp6PTuxHWDhEkagXJLaxcee+A9ABajp4dVVYhI9VEtDt98+DklemQWT2xrAxOw6eaAKFgFGgg0bFoP0eSzR26+UyJpIJAQ1CMYz/MQ1DVZGqEBeHxp",
  "Esj7GK8Z+Vj9pK/8vDBupwOJaGC9YE6VDAU3TnCfKylEtq3LnpNMgiFqlSPKLXKO7hLVYUaszfB94nFjPuw988xfg7PnfJJOm/2rpGPxtK/boKdfhubOfje3",
  "//0oMAdcgw/PJMRWZ+DoPFhEuZPOgqySllmbFkFOt+qJ7p2YCRYefLJe8O+KPvT0j2jnLVeOVpmTrHuaOnU5wIcMLrjs8tK/f/V+W5w4w5SKUwORoDCy6qe1",
  "cW+9t3Xvc28HfhZ3rIsawCLn3D3AMDSsEXEx8oF++65DgLkYWrtElzw2fuSR+R8u+DpZG/SE3eYdfy1v9c4lwHfjh7P62hgbvQus9oKWLqx8f/z91QqPLW6K",
  "oXr0kCeQYfxwkDo8YcnuUlW1IIZpLRtpKCRsvaEx5v2Vlk8ftjjtyiIRJ6G3QpgBxlVVRX+EEcbX1o4i5LaDZx83BSOP3opx7WUetqJg0oQ26ewCqZmFI8gt",
  "DAoLkGHURoDNNv8XAGDK3vpaNQajHg/dGmLnrYSolRNKsKxlqEk50ajrupxEIqTzVM2W6qRjIWDtjqLpgU7iAZru/LUpEdS8y0Z+wOo+a+kczbHmYQYP1Rrr",
  "Q9BRgLBwquodWpTH9rkabWWR4ZCIDVQlnaG4tHWX5kzOopKsoGQVVGCyI0p2zI4XRxd6kX3uGm3B0n1mwi+CakRpR62UuZinQ3mHJh/PT1IdWHK/Ox2KOvq2",
  "5vmtJIUm7vAoXkUj5IlzRZw0gRgFsBQJRsZ17QWgD0uXEnp6WGc/6o1cc+BPW3aauCfQgG0gRAAiaUS+hgARUTLUjVczdsSi+UKmqa6HM0+KGAok9SPdUfIc",
  "hXFP117WQjv2CV/86x16x6OfwA2nDunalJBRbDoykkneMBa5uWwEQZJDKEhp9qSRYA5Ejq8iI2OyQYCGBdgG3N5a0JX/vmHNhRfujK9+dbkC5KG/HwSo1acr",
  "PF58GVHLVCBVzZTnOfxSm4Rd5AgcHeV57rHiNHMl02LELEO1rHUTel3YtP7nr38QwG3onWES5lmusFSrEi2UQjR99v0A7gf8y8FeVn31xzzyyykfpkd+VeDJ",
  "m78FRX8Gr17CaKyEKIrkFcoC44c37M/BtXsFUKpb5RGvbbJn+09eiJUv/qa87fRH6MNHfR82SNdevWaaj+6pr5kCGAk+Kzyp+tbB+pyeT3pB7Tc8oTAWwzZQ",
  "wJAqq6tviFTbCX9FCOxxyTdQg0ajeLe0v+m08qe/MR+4HtrXbdDdJ9rXY7BwKREtCIGqIk2biy1vHnigC8/+4+3hEwsL3rJ/Eto7J8jkzXbEyKodeWTx2zFu",
  "/OaoNQQaRSwnQ2xyIB/V7KZca2FUhSir57GR1bpszdv3uBO4HOjttahWX/+i8u69DIJnGDYJIXIXZYZ7N6pLaUke+nhmlFr3pHqg+DU6NFGiZqZPE1nBYdpQ",
  "c0eSC1DTUeA0zdHis4A4RSpvAAE2hBTbfFZtYoqN1s1NN1Q9MwwuX3SeN9nbURoSQo0nDrklo4Y7DDniptlZ1q1YJmv8grHDfFfL0af+USvdBar2N1ZOPehz",
  "rVO8zazlEIrID0ubOjxyOzjKU4yTz6UFpWkj4DhqZJeI80F66byAs/kYIXOEiK8lJdTpsk+ysr41AOBNg0RzF4S16oRbypuN2RM6UrcjVCA2kRsAc9aFasb8",
  "y+BpShNWyRExpwxNSopMtFCTMxNOqcnRTWgQWMD36t6USe9vzJtzTrG/f7Z29xi8bCKmxnA45aM2Xesmd64Id16Wpb4mlGNVzt2OOYoiE6DiIwxD0zVmSvmZ",
  "J75BRF/V6dM9j/ph9c/ztpJ/n/1uBCJsDcMIcnice+MnHQplD4L7wKmLubv8fFdTQo7FQzJnt6J+i/dpALe9vPmfApjBkYALmKcNb8b/nDnNjjz5IWX7ufDW",
  "j3eWOrq2wLYeoM9GL36SAagDBrE1iauCJoJHAOxSmFA/jEnmWAwsgL3lM08oSg8ZK7cPvvXwO+jt71uKWfdFw7NKBa8lfCodbs3uu79+4Sc/7BW9fi5jWzYK",
  "qYuwiAgSdTFg2PdgDKHgswwrwrBlHrVvdnlxv2/+FBpAK9M9zJgBzJ8P6sm6EH1Ui3jwys0xvHiGhCu35472j2P5s8B93xqL9o5NvckCjB8DWAHTs0C7D7SO",
  "AWoNgVDmcBoXkQgCa14oRmn7oSA2FgZeUG77nzF7fHqVXjPTjwkO653v/cpdX69qb5WAOc/K5Xs/wp3+DnY4VET88OhtFk1dETTF7ZGGlmVpmQ7TCRmLJwcF",
  "pfk7TUJHoVz6KI2ieU6G/Blw5lqeOE4FoxSZTLlO0XBcDIHqfyX2VAFDGH2hSWAvveyr06T0r2MsFS2F6qUs16RLEZd5xul5IqW0OwakqiDfkAyHYdD2lpMg",
  "FvOxVFSVat/a72toYdU6KM0qSm4JIcdZnNKhNiimFMdE1zhSL0sppVEEqMi7hpOos1lQBxVxJAeSxIUDJHGnYACEqlwqDQAAzb0vCE7/xh7c9eJnwRzqiCky",
  "m8jfMOky0rof96NJcYzfP3Uow6ktlFJGd3ZsbjTpmnKbdc38ugJbkAKsV8aR9fNO+zZ9/eyFLwuDuYJcl2RC7owJudmPUkazz4nJ4cKvBAeTclwqCbChgSkq",
  "++YA/cNDZ+MDO6+KZiqLf7I9d3pdCGAjaS2arFXQJACj7ES02cTQyR4BZ75fTcUp8tqKK0oIoMDEjTWbu6bIoz4ksX5GH/zVxODhWw/jWz7zWevXdzadPsMq",
  "UGoD6kMiYM1igyOlMMdZ0fEcKCZqONbxyY4Dw8RFfxvw8DYg3rdt0ZWr7C1H/ITHbjWX9qreg2oV2geDHsirVTVTf3/i5PrAskf1HW13H3Kcb1cewuXi1mgv",
  "MIfR4I6LPuzyWkPUf9q3+iO7ydt/VvjY1++JigkY6Pao2t9AdUH00h56aEz4SP+7ubF6T7nnyP2gg+N4QkeZAwWCVcDEMUBogXpNAFaoATTWBjbiVUTB6S6F",
  "8sNrVWcBlCYxWvrgezCqRoTFJ9lXr7/6I3TYkb8ZzTgvZqeJC8dF869X9miKINHpHlVp0F68/89AOBEmtLDOOCSHA40GP2luJ03J4D0eIifQSsr/UmravVOe",
  "LoxsMXVxdTeTJh18k0PBlrz+RV3LIWS0TvUMIWASFH4AtUClQqN1f6pK6CGoakku3es67mjxbF0F4PzjaN1OIHMSSAqZy0ZjJQiJNcWiqa+xN7UdXXlAL9uz",
  "SMfeWa9NPnav0hh6i7VkIWTI9aCRfEdCrot2QtumhIqe+MxF2R+aRja4IkmkHUEW9e26ITSzyjSfjhqvT8ysUI9QW/Wz5D1k8+yXeWwrYdBG/qraRLLQURZw",
  "hy2YEEE0Vta7m5Po2eG17h1NHR1c3VK8+FoFt3cab3VtJoBjI3rz+hu4pPoyaba/z9PilTiLC4ELgya2V0nxR+qQEtO9CTaw3DFmMn54/TQC7oqKytATgkLo",
  "gr45+4rs5mgisKQRs3mdirp8i8R7RsnZSWSOwpSaEyqs1/KKmSMDd989sfTY1V+xD106y+/E+ChXBLCDGkYG+CFIiSnJoCcAMdSWWiU4zJ7kXKI3mbNCWgsE",
  "aiJvd4+7uDx8KJb/41B780F31MbsfCbtfcJfCIrXEplLcQAR7UBrAJypqmeFv77gI/TUX8faVcO+bSAsv2MXsW96y6Liew78R8QpvjkqJjt2e9TT3wD6G6rq",
  "h9/v/QCWPXeQ/O1bH/NKsglaCkCjHg11V64OIwsGMGkdcYIQwxFMuomPqnkZComDr8c781RfkN4ncZxz6hfDxJYVRa8zfGlhX+3mq95NPT2PuNcrMehb8itt",
  "nbzouJ2Dzs3CwhGn/i3pVqKi+QpdYe98q1UiTNjlErv8b7PM2FJbOFgTMnGInCvQhUtZdTze4FpYxF/E7kPkeJw6/ydlOebSMjVPH3ZhHW2OfHahHjjiPxfm",
  "0UynxLCGfWNXDvzTO/PG2/X0bxNAFqMhinNnedRvAnvBfmfw5sW32ZAtiRohjGIP4yzSTqxEokGjeHMosGqKPtlVtWEd946zVZUwdwvRf2ghvPOzFZ1oIHWJ",
  "gqASEEgSBh0cY1hKNSophC5578BozwfHm8+BkGKGWCJKVrgsO+So3BksrvnUIVUFG7IrBwfMpLf8CgD0p3+fhCcv/TBqDUB8g7hX10RT4/ro5r1kI0RE3CLW",
  "5M7grn/S1J3Ecd0JSYLSgROBrQClAjA0vPPLbbgxZpSuhZBzandneC4BJPX0g+aaCU27RufZVnUoQxE1z8LAiFWMLb4NaVHZft/VeKGvAd96CfslLXG5TsW5",
  "ISTP+U87ltzOT7LdQ3IzSN7eIlrLKWaHevcAAK7Mwd6ECoh62NZ/cPzn+JGzL/DGhZshAGzDhNAoRo4AL0skdEzriDPvsZz2IBEVStzJOWFU6TfGZPeGKBrG",
  "gthwsb5XaeVfP1q/8dALvvnF606LWGSvobBUq1GwUe8MQ0QhgF/nv+KO+M+DIphrx4mcFJOBX9090X/2hgPkmi/M9Nr1LdhEgFBhA1IM1i2UDdSCyHhIpjJg",
  "CLHDnHGsJuIFLg1HU47zabIdY55WTJl3UDoUjfDhuBNlBGK91lIXPf637684b+YeuK86qKrU39/DIJI137vi/aUnDv0uJha39Wv/hJ3T/YD6rbfXWra7nQ46",
  "+cHEdQF9OqrSmIhUu7sNfeG0JeElBxyLkcEbqFSwWguFEnGMNg/sZW2s3jEiVeQdDprMLdKBLxyIZ21PL9drbu0dYm6GQmvT7/MdSuz7bHySVUOhtE/8kkcU",
  "RGybtaGvqAOeGzQu+vK7ufXZM4QKIawYTXCvWA3fbD+TQHLi0nEdOix5xoKNFw7aG8tfOelxXb1nkY6dW69fWzqgMJ7eGTZg0xwPzZPHtVkNrxl7kJyU1qRb",
  "IhdSdWa6CQPMpQwD6kCSTtcso/HP4+8reAEsF0KDG71jjnkaAEZ+dWmpuJ0dy/CSwLCsILoFqnnoDcfnK0FpmmnPCewn+c2FuoJXGs3nIjVzLoD55eFhV+NE",
  "TSam5BqeOlotSiAvl3VHaRGOTODd16qpBREl62gU0EfU2vn2SFxZAeN9h9+HAfsvFMsEFcmkmM6dTpTBXq7DrzOk1DTr3RU3RTHuCX5NDj4awSgCMgQ7YkTM",
  "5t8HgP6juzVXUKq+DF/y0TMKtPD7XlewmW1QaENSEnhRd8KUi/3NtatRswHrcjo5ixxOfY6QG7JGP0ogxFAiAsGDCqGmlg28QnHoG6ff+qXf6j13bEbVqryW",
  "dEMiUkr0OX19RivTvfRjXsVTrXCk21kg1NPfWHPvv8YPXTvrnOKTlz1cbBu4hMc23iIaWBmRMKxHxsIE41FMUkljCUDxYBMpfVSTziR5sFP2GaU+X4keFDEW",
  "ncAXeciLmsSFlPhsGQQSmgnjd2mrF26ifrLo6eHufoDI0+Jjvzzen1LfVmioIX5DeWxhF9Nqe0sDC/9irzritqGrz34n9cMm7L91QondMN7x3/+uHSicYmpq",
  "vHKRQRxCyTJIKDHRE01fAyXYvmKthSxd2siBL9zOOsHziZtMPpqYXU1UWVKsPZR3reA1ywIihZKQJaYQHhsMNrjWsfnswkkX3p3Ex46qAF/YrwN/vn2SKS6+",
  "Vbo8kQZxvHPLFzkXsoufW00KTvOCrqrs+xwsqw3J5F3PVQVh5xGr8+aVzPDiM+AloUYm2+GCwYjtfHLKd06Lg+aE2hybM2ZMQ12rw+T4/UuMxGMDWFpXxKHm",
  "dukkpDAUAKbQWLrsj6unf+YbWql4AEA77URsys7GV51OPg8Q5jtd1zNNc+939Do572zexDokUScpF3mecvw7uB4G0AgZWS/fS4XT9WLtDKY0OmSUyHF3Nqpu",
  "d6U5iQNS9lu8+Xxi0Z3xq5oeKa51zBwEIBQ4hFXHlIJynUcCTOaENE1mcaSSsrwoRlmSk8pM/BLljWlwwXgStNxSPOi8B1XBPT39VjUuKGcVZWjO3teVp4RV",
  "60toAxay7BGINLUFjIuDSmrRnnZNVvJvUtKyJMaLSO/OePOjscJYHZt9kwmrAIMQioYJjDcyI3ykf/7wvb/ZAjsuotcjNpd6eixVF4Tpxx7VEP2LKCo8ngxc",
  "eNiB5ftO/WtL+6pT/DE00QYIbQ0CSwZKnjOhzkNbcBY/R7GfK7zI32Dk7KZSOwdHK+AygpCY++VmLYlYSj1YDvwyf7J+6tGHR4vhQgMCTFmiYLKGModMqKlI",
  "nawpFwvc6e1XlH//2V725fNf+qe2U7UqfevIz6Z+WK3s7nmzbzu3Mdx1iAzqEq8Az28pGM9nJlglDZTJKrFVglUiiT4YShHXNJLhEUX/zzjMN1Bux62uSj7R",
  "eTTtxciJJVD2AGJVpshkmON1nElhSDn5YCiYoxrGILT4BkResLL+zFBxzN6tJ5z17dgvbx2dcZWpCin+4arzeVLb1tIwSjbK/FA0zcI07xIMoTzrKllEFYDv",
  "W4iymM5zWw772mJ8Zc8C7bEgrD146wFmrP8mqYmwMqcLECVDeKztx5USIDQVTWt8r1Ac3EBrLXDZ1jty5NMQilCBUFVChcYfEqra6P+RTf8/k4bEEHhM8Mt+",
  "Y8XAgpFtJ39y0h57DGLRIlWASh84YJmM1P8F31eoKDt6JHJYjxoLB4myeQ85mg5Sjl2fI+Fj6hfqOgYQpyiJUkZcoFyODSBMQL2hMqb0IlSBHXekl6sladkT",
  "cmph3oYom5fpWvdseg8kbUoMfxM1MRPTVsoqMUhqYVDfYtsHImJYnCFOh9/+Hbts4gK0thXgo0ESDfWySiUOayZnP+k412YCnMSDJ7PIznB7VagIhNgE3MaF",
  "+kDrk/Vdv32iVoTRW4l1E91MVZL6hbtXWyatOUwKHKChhpRYSbK5Z/zDIIo04k809e5aq2wnhUYkvr/jXVriChBdp8QkIfXXkniIFccUE0R9jEjDK9e3Lfz9",
  "puup50cWO27IEG3DXGVXXXTR2Nrl+/ywbfyqW7wus3VoEdqaKFn1SBN/pUQdrbmXmzJgoqhWxzUaOd563ubfGVinxYOylt21Q3e0NU7WeLxqxtewERiUWoQL",
  "jfOXXnPNFGCRhYSod2x/C9aoYROD0szMpAahVYyE1pRL4C7/pLF3HLFgzTdmT+jp77e6rsJSXRBqt5ri7O/eODj+wJ1sY9Jxdln9jmAVnjbUSR53kKF2Mmgn",
  "Q61ktERGC+RJgTz1yVOfjDIZq2SCkGhoJFVhk8KJaqa1dSi5XbWuhW2b2jC4PkI8UiOu1fMfIzVC8lGrE9VqQBiSbdCwrBj5tdX2k1565yHT2r5+0f+sC/KK",
  "aO8zfTrTC+tXfek8f0rLwWE9DCmESeFsyVuL5Sm+a6v8KUYmhCDsG6+xUh4tHjf3Au3uNhh7Z/DST7/TbuwLFYBErVJKUybOBdzlvLni38fiLKjIvoeca5mq",
  "fRLarkQLnF9sMV651TPloueVS57X0uqZctkzLeXoz/TvrZ5pbfNMa6uH1nYPXGQ08GLYkHNf/OQhH+866ryVacdXqRh666RBCfBzcIGE4yhVFx4UgBO0ZbTd",
  "fTNt2unGoHkz0qRoEK3tsJIm56oAnqcYrBGXgqsik/N158dnBJqMnZyHtZCPUnfg3FwLRU2anngx0RzGphkbkUvM9aHflk49c5F2d5vM+0sCWv7gWQeO+Xf1",
  "Ju7iD0JC0IgN4UatR1gAZ6Z4cPDqhL6ZLdSEDK/L5GBiDZNBwRDYcL3WdffIJh//wpi3T1maGDKmxnffnfV5U3rqDGs0QE08Moayh4HjbiKGWiiDN9K2TFNt",
  "lIKy3AByrE6YOKaJUVNYlyvEcj4nOVFRQYZNaMojH7LXHdJLPTf0qoKJXh8rknuvmelTz9xguP/8D/gr7rne66LtxMJq3RKr8TLLb6QFJRGdut1jWtilOTxK",
  "UwNLSh/c/F2uzm4yGUZSSiVnZ1jfJCZ00ydVQEosYRh6XR3jOp66/wzqx5E6c5pPR135k8Y39/ux32n2QygWNkqdBDNByGggILEBT2jbpSV46Xdrut//Qerv",
  "f2ldc6yoYwHTfvstB3AZgMtUtav+6P1T0BgAGoMRy63eiIkMDTSAiPrWaABooDgywBpC/NUrvuPxqveGliwJTDSE57X5fs3akhRWUghgPd8YvDh0AerBDTBk",
  "YAsWAOrpf5yjWIj+GNuCxu6fGG55395PR5+4CM0eS6PNUUbO+eyHCqWlJ4vxQqrF843EINLJRBEwmGPShaOpSVg9lNh6qCoVfNjBehgWN/likagR6VKoMXL+",
  "rz/rT/K2sDWxpGw0kQpQ5q7NqaU+58ECB2pV4sTPwJm9OKwkiQb5QlAjQvaJZXeEgqfIECn5CvbSlTQhrzIEwj7UeCDf08LkCQgL3l1eees/+V/cfylwYUoU",
  "SXuDSoXRjiuw9NnDMKE8BsOBZZBR1pRanU+7dWdt8f3O2VA+3eClc2XOE0coBqWFmmZbcdHxOGDLvgwN32bOmbsgCqBb90wlL7mlPL3dnXERRpGHODNWR4+V",
  "vqc5jla8kmsoXGhjWbayMfLWyd/QTLPfPKNk6I8P+TLMshPRgW0iGxSb2l5L6FjBx3iaxipbdbBaSlXhTjCWFTXlEslAGIpp+aeWNruq0HPNt6H1lEUVQUhV",
  "DL7j1glty773gIypT0IdIDALwREKZULKnG9TwmKBsUzCXPSjiD1xLAc4DvFhA4w0IAKBsBLEIMdGJUA4r/B1dl1Rox4ofF8lHA4YW+9Ih1z4ePTmv7bCcu/M",
  "af6uc+8LBs7df0ZpnL3DG+OXw7qEJoCnDodf0xz5poEomcxMDwS2TTCYq/ylzPwxo1YnC44j2EpmZRZNwlZyqJPRdUmJEZKgixzl53qsWL1mpNG22U6lwdOf",
  "RhW68oqztuiURX/nceV21JTAfoSWh3GnHD10IVrKHl5Y/hAmffAj+PnPl2PqumnHr1r74rJtr/7GAvZf2D0UsqRqlPLOEGulOwplsHG82REg9IoFD0++8GU6",
  "90fXbLitPwzQDfT1rdMSva+72/T099uha76+W2nkoTsxubVTa5aghtWN+KbMZYCahubiEDngwk9E1rA1tZHiZeVjbzgusTuiKklw/r53e5PMe2ydhNTEzLKM",
  "BKDugF2jILno/tGoWLheXmmxca8pp+sIBIAh6zXUDP9z6Ttbv/uTv72W7h/da1/PZA0Krj79U54O/BQlC9RtCGEjmvQUnGl3nE1tUljg6llcMgFxnnGlmXRc",
  "VcH5dE2BMRbs+eHAwEPevnvtjl0/ssZxw1jb++tx7ZTvVZ6hYthhQyg4wVhdF4HM+dSNzNB4ZOE6Y5AjMsoRHCLWgIqB5WKLhxVrEA681O1f9Z0fJdfPy+mC",
  "Y88Gouu/veTBJTePf/6Uj3Jg3stF/122vho6FE7i8rIdyPgKK5QNLhM6XMa31jTbI9qpKmC9IjPadr4o3HyX7xXffcADkGAU++T5TFWE9urbjsOkcAoaFJKy",
  "J+QKnCTDatPBsKQ6BPI8MR4Z1IsIlw//XcisQbGF2BQUngEsIBrA1FYDpda3mzK3QwlosMBKKlZQhz+Yp0Uni7UFqSGpi3B7S1GWPv4NgI7Ajp+h0Xl/GwR5",
  "BQOnfvyD5bahX5j2tlI4FFhW42kSjxynthFpmrCeGw6rpKFLJOoyjhyvB8qFDMbFwZKSqCoT1FBC30x8lcTdrXES+SxkDEMhbBPhgaaUUY0xFIISh2rR3tHK",
  "AyuOpSqO09nbFccec/rTev5+N0Bbj4PRUC15IIKyQm28GInxZDgIePL4nfHCPddS/48+pd2fMa/gCG0zc9LeV4Yme6M/7lvyCzNtyt7WinUU0VhHrHAzXVgc",
  "+jGQoupBnaMN0yIPmBpuADvQAv3rVM5Hp9evT1bmlQorL+3nrVvH2hFrIYbdlFDX8ynXCSSi1ibDzKQZ9T0xI4P+mpXHXX8Kjr0BQDeo2i96xyPF8N4vTQZP",
  "JKhECGyOlYVclj2n1voZEpBaOmk046ec7XN81a0zHE4EoLVa+70zZ/rj6nWzvFi0zVH0GCV0eFqSUR8VEzuaxU2yqaUjz7w9vOKUL5rlL87BxDGdGKmDycAK",
  "lCSSm5LLkk01M5yHlFy6OlwPuOi1ptu4NFErNtcjMNhnWbbyztq+HzykfdePrF6fKG6nZqTzG3Y2nPnZt8O8dtcHz0RWTjlHU8oCh2KyLXu+J6uHV8nwikP8",
  "q75zu06f7lG1GqI5pCs5ae3rNvT2KUMAfhJ9RCcR3n7iMUzL50QxWWTSkLqcXQRl1t9uJrOKolQm0PLfFd/Z/YDOm+5hfhQn3KRbCAduvXQSBn52tAhUxZic",
  "m0WS0+JgmoleQIWUjIFpgMOB0iUy4UM3FQ780kMvZ0m/6qFfbNP61G93oYGXvmJ8uzuMgdZDODIfwMJRzjrhSpruMhg1Vfb1QL3sxF7q+dazGx5V2hQ3fOWJ",
  "02nkwTt4XFvR1gNhZSOa4bAipCCOmXpRxnE6IBWnY0xCxphAxMoek1gVkmhLpQ4zhAyDC54BjEFgIbUgzf1IqaiuICrOajZ+mbFmBCgWGMUCUA8doz9E4sos",
  "V4eVDYwd2ve5e587BT+fW1P0EsYfP0dWvnAkd3UWKBRVeJQMlNNwISu+DIcBt/Mn9Vuz96eTLr8tyVtfj8gB3YDugGjufWKvPD1MRWujpjzmqcLkOsA6ErL4",
  "XtFo0ZouVO1//Uw1eytE5psSNL51vbe12dIGGkLIU0rIK7TWYhJtkjin1k+gKHJ80piUrBgteNI65uIvf2/Zo3owvkeDADDcMTCuyKV2hJqDeyAUk5oohVXJ",
  "KTaJD1gCm6rSWsaa6gzA1zLdFIInpNNWrhQAtNXwsGDq1FHf22lOsViPCCnH7QKGjjnn5tp3LvmrefHfp5LHn0Yw3Go8jyIH3yaWqTax6lxRrDQNy3Nhe3Gl",
  "Sb6mbiHEIYqlhVrQuT8+79JreoisIxB++XNf63clBrWpz32WEOuQBxzlFcxIyDBOsFiMCkWzaAupB1C/sFp0+Ef+mzavmsPOWhzDsuHLxglTT+QKnMYJL3yL",
  "waJF1g4sqaNNUu1Y9kAZp+q5Un/3oscaFWrv+kdfpYD2TZSqs/K2HXN39QAEbQMPdmOcabeiIYHj3Tk7pn15hSsjtW4Wo8bUg61OLM287ELgh9DumUYrUwvr",
  "fCN23vsJAE+AvNvqNxx8kMGqb5uSX0LdMjFTrgtI5wVwnHqj7Z4EZLm1XAIt+zSAOZgfuRFvcOBUL6n+48W28I5DbvI2aymGdbEsbHJWcsowHhN51kAJNoBC",
  "JPLVlQw6UKs5xwNWS+FgfcBrL7bDxuYeiS25IVWwhCvlRzqw4lGvxX8bt7Z+UgIVUuXUFTapYQqIWjGlIg2/MPAPv23rw8LC0NbFwaWXcbl9cmQ4l8WbRuIu",
  "AkRZAhVTLm058c4LP0bVS36iM3/h0xEPPhFe1PM7GHwcIAuFyR7WxJOKAAmNlguQxvJKX1/fT9HdY7X6WvLaX+79oDB/rzkZQUo5oVi6Q0w2OEQOTOwYDr6O",
  "x7zKdI+r1XDgpMM/4m227PO26FkaUk+NE43g+GylcAs4dUYgx7OPclUynotZJfYNldtkX/350bdSr+6jVSIE71gaih0A8wRCCFUTbzIsoCaWTObp0wpCpLQ3",
  "TV5y2aaN4ukKNZvYJtoJUZhGOEQ/7bcA7HpHJHR3M61nSib1I3a7OP4RAF8cvOGKya0PP9QV7rzDFvALXtggIWlEtgGeZ2BJwJYgqtYmNgUm2dGIEVHLTEY4",
  "ghjYEgKwV6JCWI9XYRHC4MiA9+wLT+Gss58hogAnV5vnPuulos/s/d3MIIeEQS68qYAliIEYa9kOjvza7rzbzaY+UFdmC2UWDYkthZAglIcfXdx401bPt594",
  "1FI3dRXrk1Ef7+5i7cQiUBW2/uGhIdOatKeS8zxSylrVBH4kiY3JKHImBinge6ve2lNtaAXeWsPWWfdZVWW5/jP7sbGKkCkK5VGHlkxNudDxAwBrTdEztRcH",
  "/1o+5tIL3RsEWGRfMcBoydsMHXLdLfUrDwhMgX4AtoIwAcLyiX9wMicAjmzSw1BRLihqy98P1SvQ37Phi1xvL1GVpd56zPWFiWaLMKSQLXkpLk6xzMtTSF0a",
  "IY//vjZGxpR44FMhjJJrGS1x/kaktbE+e2aoXr6c33PARfbh751YlNVHgcpKokZAlktFEywb+U3hhO9+DhDoL66ahsce/EQEF4ZR+BEcqFEVYthCyG8UO37e",
  "evLJ9wK4Nzz/GzNh61PAbJOsg1RtrwCpAUEEhRbSZcs+q6o/xeVfYdX7yBZa+zBc+zi4BRREuHs6cJT4pwiz1qw1nZ07ffpf8z9NhB/FTtv29V60SVF37VVc",
  "x9l8SBlGFQhnOSu6nsvfhh0zsEAUjFLbYAXjSDAcWfuoQ1V1oRDKMfc0l+S5duYLpWQXCYUZ2mhpHfnE0DcPOYpAV2IPE46cu/dDHuzWChMhnIxUJEuu6jFR",
  "1SdiQiLXWcrZMbuZLjF7iVwLoDikYLNNZ+iRB2qgfgmhBv5wEKAu0vAB+H70ewMfBQB43wdD+soXH0bCGlxHwuO63C6wqEp06DEvIAoM/Bf+E8eFF2L0CBC8",
  "fEa9W0alqTFLhc6Rc4imo4n0mguxz7L0ubuKhx9wy/pEeMczTbs+GfWjHJE3gOEC52y+yXGJkbjIsLuLU4jEt60qIbQqTz02Peg7KejvPv93PY4aPUF1dNZc",
  "H7ut2glCFFFUNI8L52KeHEsMYrahqFc224bXH3KCoZHFllEy6pdhvLJVU0QgFmLrhrzQBtaakZXDYXnblfjyxXcSUaCV7gKO+l6/XHfgSdxm3oFQLQgmz4hy",
  "4l1TIadEYpaRkKTQ/qFlv3ysnXr616wPDprLWa9Wrc495oPW/vsz1pRCqqsXCcGy9EIFic8wQyOm0jbz+vNXr/7DOJp76gx//Jh2CSiaB2b0GogFuECora6j",
  "MWGn74zd9QPPLHnwwa9P+MNFh5iStkERtSHWQtkUVK2/sKeH0Hrk3+sr919Y3GSTncUiYFgPYNJY/6JEoUfs118cGChtOfWGWO2v9cWtarSWnzk46t14JmQg",
  "QuT5ey6//Jb28cfOWQMA2j7ud1j9PNCqBo7YVx09BYFAVhTlIhj1wwD86DWMr15xVp+DLah5NpEHtF3LFnXZkXjdmeYZseX672xuV/z4bRCPYEHKGlvouLTh",
  "vDdWarXDTgFodhNOY62jz9vAeqa1oIYGTtGZ376B5s4atmby1brmpX2p1QiNWBN1GYlnXFplsmylWJbrOKI5mk9nwK3JMKD5NYDDAuBN4fMRtsBPTEHjn1Vw",
  "/p6WjdX3I/j60b+3pvUCOvu8X+gGvBnJhrevr9t03zWGae7cHLKiM6f5mDYTGDNm/TuJlSsZz8+yzUQerUz3sMmbCM9Psejt1djjcAN3QQxoGG14eV0a0GQY",
  "72zUNUr/jObKoT+vUvFmrFhh8IEPrI20LFyor3R+3oacs2Gz9rCSIvO01JvbzeBOku+UwMRGRkJwafAkDheetP/3Pv/H+q3nHE0HnPpQYiCIalVxgGzF/w5b",
  "IH6+6ipFrC11fJrih5YTLl+oMC3lcTCrLgJ7MCpAWANEomaU41QzMhFg11WCJ8/CXtVz78obbuhG66GLiUjCGz93JWx4HdhLd8ipoaJoOiBHPApO6bjqgYdX",
  "F8dd8xFeH/w2d0ydqqpKctleZ5mJBbIjlkBeqrSleLcm8YxHW8xi1bpP7C2vnf3hm9kGx4jXVkcjKBAxQQQiUBgvMCSFocD7zdgvnvSwViq8StUXv02MDCNO",
  "LDWohVBPP4D5/zOuf2r/0rfuwbJqzte/Rqte+mVhQqePoTrIhiElAzuPvcaqkcZAS9tBE7701X/rzJk+nfmdsH7KuDGY1AXUbT6FD46VS6R8sJ7vdYzTRz8E",
  "4Cf3zpzm44vnLcG3DrgbY7z3IbQCIeNmBjisNKN1C/bNu/S2X06h/T++ZEMK+AZEs1I+VMtxdm12l4XLDGzaKSq9EQWPAYhd9dDuZkK5TRpBCIKX2WeY1Agw",
  "iS9Og8vSCS41dV+UWcQnor/MFJHDurWFrtIm2GXFxwD8pO0b3/318Dn7/bzcqvtY3zSoIT4xReYFaWFKeiG2pmAMiGEDJ0hLko4UOdYYOz505HBTiRhh2cTm",
  "8eyKhOL0KMcGhqJS5XW27+6tWL17cMbsb6N6+Wzt6dGXY9OtVbyjDCWrB87uCPeY9m4qtYwx8/78G5p7yQpg1stSvfMsPZiefgR9fWqCM7+1l/fs4u3QNQbY",
  "dsc/06zP/w1YEP2sDYK7mm4JUdcOMudVlzLzKHNqJzdzRQkYtuGMRTsq0K/rDCN8hfiKDQJ6rSQjcSfu00ometO1HZzdGE8CAyEJrLVcHHi/ady9YOjKQ3aj",
  "nn6Ld42Nqkgb3okxXS02EEsJ0w2OfbOQG+rdJEIiIBRFAyFGwhDDEqJBIQITosEWdbKoa4hhG39IaANumHF2V7PmrnOpJwIpxCs/CuUYzqOMxiwRUyPNhhdK",
  "MygQ++wK2MfHPj02GaKu93C+WhVcddQMbiu/NwxZFGwSAVgKAyW3ABsYLuxHZAI9Y7/C6u0/dE5tSX2h54VFU/RIoCrMajwmvxgWag3zoux2wEw9/TQGgNV/",
  "/Z8ygkED9hWwcSIO2aIHv3b/z/epViF62THFrtnn/qbeteUHg8HG70QpQLnFg1/ywMY0RvjeVZ2bfWjCKZf97NHLZhdp7txg+Fvn717obNkFoYpqROTI1JfZ",
  "rpLAEFVBazth8eM7AMC01m08IgrQ0vavyHCINXFdiFYpzlyGJVYCkRmLX1w9JoEOX/92gCmLt23aBaeiYFpn6l/e+fr1PuZHfyy5V6IbNZlHOLTgOCeLstlf",
  "qlchoYQMHj9anA17HbNVdV9/KELlFuD5hzcHAL1qJ3/o/Z87sL6Mf28KpQKXfBLPWAVCiISAhmQ4ZN+IKRszsjqwtWWrB8n3kO2WMnNItztK52jpDjyLF+YQ",
  "hBCMUBmBsAZghMQUElFARAGIQiUKmBAoYbhmpbPDemNavtz4+pdPo/5+i54eXt9ucNnNN3cEl599hby77WkvePRXpv6vH2Bq6Uk958SfDZ193jupv99G5qcv",
  "j0T09MMOH3vse/ZfdMp9Xsua/8E7NrkM25Qvw8qH77Fnn3qXXnrBbpF7eZ9Z79ugv58j2jnASppChjlLGWR+b6Sp1VZ+hhZzFckLqL/HUn9/QxWk3d1mQ51C",
  "+JUuqs6reBhq8fWaab6tNyi36xLN+UeOapzn+pBFflOsIgbDEpqSdhUKL/xq5e1zt8YNx0atVrDKhxd3Zzmzvvwvcd1J08WL4mG3qAcRD7AeoB4UHhRGIUZE",
  "PFXxVK2nop42QgPbGppVz01Mf9tmuxVABbgcHs1lTiCdymqSGJicFJOP8Zt0bPhQWFn4hePRxkCg0S6MJMV/NPHYUeKgAS00Vn609tsb38TV/sbEnpOWPrfl",
  "Ph+sr+QrwoHG0x6VyeMC2cCsrg8VflDf6VPvHbPHx5/C2L/4VK3KxIHHTvQ7i60QsRATNcLWEjwjhNppL1x6ziQ6dk5dK92Fji+f/vvCsXM+FG75tndhNT5V",
  "f27oU7Ut3vLB4ilX7TbpuOofdfaexR2OnVMHMXjomYvQ0mIgMWLrWJrkKCpRITYILOy4LT8K8oD7+yNoYUR+haGRWPyInFN2IqhLYECoKqa+NQpYegPcDEbV",
  "N8J120beUUCbFkZQ3mb/DTjM9tv7YI9S3ymXskCajSISOnhyTuloJWFpxR2wosncMWMGRVbsIWyjFm0An9+GJrx/34GVX7x1L/u8VMLVssoojCmVPNPW7pm2",
  "smeYPa4T15fWFgy3TX0/Ner/4MQKA+wM4SlNI8w3hy5cQ/FeLtpoqTMTSn9W8l4krg5EUGXDtRrDIDRFnKKnnbZ9VAjWvVgmBWXNdddN7Xrpvt97k+Ro7kCX",
  "LViFDArGUAc2K+xTbF3xp5GLLplFVYiq8jp/Vn+/HT7rjIML42g+T/HfZosqdmRNKEOrQxQt8RjvQ1i95Hd69IEzqKfHvtJCrqqkAFNPj6V+WKwGwVqTJnk6",
  "91yuq9bEKEtzc63oyyyoq7yTHn/lHvrj325LBKX+fpuMJ9a3uHjrughYVCWqVm2cGhgN7G9+3zB0FSSxQWnivOcy1dVx9tSMr55az8N6UuPQ66Ax5ZfuPI9u",
  "8z4LhIAwR+HPAiIDIcoZolGi1nVb5hhDjIfpSsSSVhtJELSs9Y8epNjojrwQYaOobRMG0wv96F/qKIap226iSFdnXOEaA7pOrhxqiME1QxvC+CIiq9dftDk4",
  "/JgGQGRFEy+ijgApsYRUG1rTUmivPfyj657+0zMfofduMaJfPOolAmavUq103n71lhhehoH37LV87Ft3fQa4CfdOg0/H3llfceHs2cXCS8chNFZD60UssUhf",
  "LcOhFNvLW3SsWfzbF66960P0pQ+/qJWKh96qJTriAQAPpOc9fbqHBQsszbmz/uyNN47rWjj/yuLYtl3RaIgIjDvXQXPYVZIhUvRAK9dsCQ2Bo7sVC/qBkYGn",
  "0NkFWGeQlTolOLCJVYXxGV3jp+BlPcFf06Q+52ejzdh0c96QqOOmS00bInmdy8kMARYAXdP+hCW/GuGxhZLUREkizCoNxsoVNMe3LWGFkePt5s52lbKoXDeK",
  "WRTU0RF1h4sijz4iGgJw5vCVV94QDv37U4VlS99hl7/kmWJRw8mbr6hp+Qedp8/5C+z3UPv6PqVMvU1Z0XA2H3lWWHOMM2dShRQVyeDwiGGa8XU1taYl0loI",
  "M7bTl5UDxwJ0DObP59HeGAUIvb2qHTuOtSt+/1OzRdf2GFzdkDBS5aoSUaOhwmRNh2dk+dNX1S86709E9HAz+UgrFUa1qmuOPPYtfu3Fq82WE3w7VI8yZyKW",
  "T+ROJsMhj+loA+zP9eLz3o0Tvr5oXa4RMURmAdJG5cJ3+43nD7WXHbs7jSm3CHnRYue4tVOzg3GT73acT2+UBbzluEMhLx2K+U+t0uNPewLl0h1oG/MzOvWY",
  "v6FaVZ0+3aMFL89q9UbXSVQtQBi6+sJNvUnDe3mrn9oifOnfYpf/4+2mGHme5FzitTki1bEAcV8U3GwKioDfOsRg4DMDv7pkp/aPzH4YxfEr0YgSdBIb/5xR",
  "cpLe5zJvTGZDQX6BYEKD0EatkeFUghY9ZDGhQG2EKxfVhKuD5+tT9jhFu2Gov9/ywJqtUGBAW6Kva7YBRwZ9UOx1ltz8FqZhFvzhpQiSqSpeKT137iwPQGCD",
  "R/YxnX7B1iiMOizXmj0WEiaCUoWp1wJpbeH3+X8+/rcrb73qaDrgqAcAoItoBYAV0fedgUTHsesDhWDV6d1f7zQrzkVHi2AkNARGxIFMsWtGzdpyZ2FH89IP",
  "5g9c9I2j6KtnztNeJdVeRv8iStTptGBB+Nxz2jJ89bH7mX//qbew1WbbohEIAnDmaoC1CA4qFAs3Iyo6hkf40csuK6L7Kw2A0Njz8KBw388sjHKStpcuIHG3",
  "qAKoIUIoirCxKsYB3oDuhJ2Hj7Ia4tr2xPHFqllaAjsDcWq2MX+96l21KloBU88x/7bf3OdPPJE/CKMWQh7F6YepfqspFKzZYNDVVeTjcBMCQvzzkvlmoaU1",
  "FwoauxdQz9GLAVyxTlqvKtW+sXcINtEWz6211PR8UabIzzLXObMwaU45dMTJmnODBtTEMY9WGWUPGgxNBxSYP9+OKiqtVAwRhfa0o080b27dHoNDDQReIbKA",
  "iT0DjUes6kkgoT+h1bP/fu48AJ9YK0Rr0SIiQBple6a3+cSyrQUhK3nCmVpRxYBFPDRqAcaNaZOlL37NgA7VRYt41ILS32/XfO9n4wv3/PICM7z4YIzrIDMW",
  "CANxWKmaPXPOBoei2Lk8xVzjEZsCUipGd05rexeI34GQ34HlS75hv3ry72xnVy+d/vU/JYVyXSw6r+mNZ+rpt/WLTtuJSn//Ohd/tb9pSBFjPBTGFgGxEGtA",
  "Em3T0tY651KWdRaJbUcqsEoGh/HdRAoSi9BrL/rFZ373YQAP46U1D2D18Bru8jukLkoR08iJsU1inJ2sZBBEoez5ZIcGB8KWzR+hogHqDVUNYwGQAsZA2Qd5",
  "HuAXVevhorIduCd87+d/NW6Xjz+ll+1Z1D4Ve9G+R8JvA4JMFZ4atZFrupippyVSeYBKXQ18/SqLGyc0+1yPftw1NzLuHH7xLeg08U4rzjuhjGeuTRkRRpVD",
  "IlvoovfYZ++4e/jSg2/yJr/91qHPHvfQGKJV0YPez+jutku3u2RK6zP3XtvSYT+B9jaLWoMjo2bbxE5iQNVILZTC+PKbC0tf+N2qk487kIhu1UrFoLfPjlxx",
  "8Xallc9uV4f5NF15xIxCV+cOKLcD9dCiIUY1UtDHUF0+3Es5dQJgBWm9AbS2TNlixx23JaJFAFB450cflwW3Psvju7akUESVONLTOMwVjX9YCOCf/3wyYqVM",
  "1defUtyEW6VUVzfJUXOP1tphwvH9bgWv/zGdFQsUXduehzXPfUhbDFCzSmpyWb7JZmxUUX6iZHcW+Ez97VJ/3Rwarzyae4FWKowdFxEWLiXMBzAjLveLJir6",
  "+5WIpXbyPpKTBLhwjbgqfNcFGpnC3rXRd7tfJyuJ1HH1SKUNBFEhhAqyYaf+6R9jiWhFM8FDo7bH6nPaguuO+CTEFwQUaeXSX8KRSwQYsGpsI1RTNu/XS76/",
  "FR3/+adSZl6CQvx40bjwgat2F1ilECaR3EXX3cTrSGTOAivKod1TKz8sULWn4QKaWql4VK2Gwyed8N7ig7+7hSd1bR0WWG0oFmHCZHJn2qOIdt0k9USOQfH6",
  "Es3wCcom8fEXVuX2kmFjPqLLV023p/SeR2dWK1qpsPb2YjSyg5frUD53ux265PPHeeW7z+dJfkFtCKtkKbQSdVLMpGQAZ1FHs/05pdUxo9w6MJ+6cHRMbA8F",
  "MHirqhL+fPGLWFKqQcKOyPmF0ijLxBo7hd7i1Yps3DcUxDRGOu5pOfA7H43ER3adAqF8cPNNeOb4d5fp2DtHwvBz3Was/z6pqxBinYXm50VZ4p+mNigCFRSL",
  "jFX1u2nHKQNZi7oeQiu1jO8c+FEEg4gStJLkwTSCKBeDmjB3WMmEdWtLHX6ZdNUsvPTHWeVv/f7J8NxPPo9rv/QFfOnap4hIV1958q4t7foJjGlv6JpagYSy",
  "PIhU92NS3JojQ4SgUQ+9QkfX0/GOSx8DClssffw2tJZ2LhoFOiZAoMKNBmAjYoGQk03iEjaIsuIYeQ2RWLGm3FIqLl2xNYBF2tdtyHgDttqzEsxbQsI4SDyB",
  "MtN7S0mJRGWAd951CXDjGzNHEeaEaZh6U1GTLsUhkpBQPvVKad0q/NelW1kQqlaYzDl31b910AWFwsiJtkiidQhp1NKrk8SlohoRIJLUT06FmupsmKiZ3ZaG",
  "63E0uzFeC0BAv+poFNz0WNCc5kww5HHSeaubRSNZx0HaxDB16cWgdcxw184LyettYmunJOa4HMi65YNQpYFWdLS+GfWQgYLmGa+J1iNahCOWJXUEv//eBABP",
  "pV/a088AbG3eTbuVtm6bKIG1RBGBhciJE0lgRlGWIBTTUp6ASUMfBHAn+voYPT02lhyEjRNmv5d06Nc8YVxrQzXkhnpEZJJWQxMvsWYLpmR470QXp90K5fOQ",
  "NGbTEkARwiOAqjVjO33AnBEcddxmVK0erosWGZeqkhvUa3cktKld9PmvtEx58RJMUt/Ww1ADBoUwEPgQ+CSONQvcBDRHMSxr43i5SFA3wCgKySLYEKalaxwA",
  "xntOqCFo+ys8o8ZjS2kYkuOc6eTDQTjzpVGG31gzMar+IbTyloLOVD/6eIef/V18nWl97daCXrZnEQC2uOSeEb1i5vupGFwLr8VyiMwmRDMDzcwSJzZhTFgr",
  "REAQkjWF30FCYOpU2oCULsXQC+XIbTW5wZBnuaXbi8yITyCAiAnDUEVMaCm0xXGlrc3Ezvdh7LaUBFt1HHXeL+rD9BewX1BQkEQCpIFcqcA0DtsxHLD6fiMs",
  "/Ljl1MrdfZHQiXYgqpOp/wFlX0BUQz0QbghDiFUVMaDv8D8o9TrKeUKJMyy0ALyk+k81EAs23hCIAEuahGpFDgDxgsOwzGXVgcYfaOaxz8cP3OveChDFsmjN",
  "54tkliEusyb5Ms0FdSneGJ1Kdo5V0f1DU/zad08KB9rPwUphU/IM+YYAsqTGEtgSyHrGkF9gpkQY65BeEpv7lJSSLBUSsSDd55nJL2zoa6KcloJzFObM1saZ",
  "+ziShbwVCmXPnjr3VYyARDYwmpo5krNGEZOAPFX4S2iXXVbF9ic6KlQ3pX0F1gz+AYUiJDU4dJ5DyeY3JCQoe8rveveeiX+hC8l6rfWPooDYaaDpekhWCCOv",
  "MwHIGBjjx7oQSgb9tRtueLNf5F96E8a1BqFYDsgDc/R6yS2qTXEGFHepKeNa847GzTY5yLKvlJJ9nRoEAWCk4U2ccFhwzLHX0o9/bNHdvRZEx9oXYXSNG056",
  "tzfmuQtQqoWokRJMFM9LcUobN3nzo2n30NSaquYzvXMZFOomiKmgUFa79Il7icgSkTZKE34ST+iJUj+zDPpg4gwiip9+BrM0RLz20tvsnE9X9YGVXVRd1KC5",
  "CKKP+4Ls7/FHPxp07J31NY/+fkL4/eOPEW/VndzR0Ym6ZLs8qyk8oLlZgaZJb6oCImIM2kY4YdJP4nmKXS9bFgD4WaUMn0wESVFigZwYXcR2GpTCgJQ4CmdK",
  "aVIbepY8RdHXmvV/SN2nPqHzKh52jGKW7Ra7HBsMBTUe2+XDM6FE5Mwo1FJttIsVKzCFAKWWQu2l5X9H+9tnaQXcvXRpsqZQbcctLwvXrAhBpigUpZlpwk7T",
  "hJSSRQukjs6UdXUk6bafNQwRFHg4EoZtEn1vI+CIgBFdfw0zlzwVhbIhDAdkiy03RQXyDVuyTVbXm9TmLpMKGX2YE484ZFG0uU3XG3GWsd2//5XvnNaob/pe",
  "WSY/t2u0boxvjCFj2DOmUDK2bm24IvwLgsBSnLuePKPq2qWrM+iXvCV+nCXhv+pzddJVU/0VZY4VlLvenCbGZtRuWlsrl+pSsqApTtExJzPZ9wVhSGgz307m",
  "HaM6iUQzFQsr/45eKkuW5IjIwDWJ29VYjNvaQvTC4q0SrwNHe+azqb8fBT9ifjPSGOoM+kutn8T4RZYVa5ZheM28tOwsqpL2/aNgHrrvGozt6GhYCUnYZEuw",
  "M3KQfP581ro5GyNtDmBsthPN9WzZus1MqNcLMBR4Y8ceER57wmdplHwjDwv7I9HdnH2+ydtpQQbVEnzWlPnRRE2Ec4I5QzU3VlabGiLXWA9p7kdkIWKIQ5BO",
  "2ekZYAG0Al7T/q7bzdLFF5hxOgZWBcSceooRZerPJLshuSihsjWemnF0htwz61D73SMfRmvXA+Gy5xbqqhWDRtVaUyx4Bb8o7WPHUXnsNB5cOhl3XbULd/hT",
  "tODDjjTUsIn8MFVz7XkCo8IJ8iJVWGLr+WwCqz9s+cI3n9a+bkO0AbYhE3cei8X3tMLatGNwr2PW9afBehInhWVZ0sbYgs/+yOpGGE7c6UxVIdojcg3VeRWv",
  "dY8T/zJwS3UvHlxyhelqm8qDDSC0EZyrJMRs4BmCV+Th1bXfriqP+9ymX5u9PNLQ9IdYsABame51fuaMxwYuOvrgUjhwq1fq8hAICCLRtfE4hkkgInkOvLqQ",
  "W9SpG8Nkh4cG7Jj2xQBAs2YF+pK245ojJiGwWUAoSWyB70HJWuOVTLhk+QNPzzz+p+q1M3p7ZV0uvq/V/CsnbyRaK7PHhbjYfcCTWRvFEwQ2Bm9k+asiGtyf",
  "dNmfAXyy3jdnJzz21+3DKVvtDUXoPb/4N7Ljex4rDDfWYPkDj9vQatyi5uNhNctfSQcU4sRDq4LB3qvovjTuspM8JnKXNs2ZSTrlR7DWWpI9FI4osinXJhFx",
  "RptzgXgmMMUW365cc7+pXHaLhmMYr9TdTtzmcQytAIwfD21jJ4LUgT31oSYEAdBVfrOq+gCFumOfoZ4eq2Hr1tzRsovUGxrNKhzvwIR5Ff9bQGBrgdaO5Tj6",
  "6CEcc0zk2t6PsLbZt48rjuvYPRAbso39EF0QS9wJrnNfOmsIOTTi5oSUjMTb5MZOOblGlAnTCI2UCkIrGxdoX9//YGHPsDub8qgK0fZDpvEmjemohxZqolCa",
  "hBFEtPaEx7VYF8e2hNzcEteDL4kV1dj/KbpTRCFegU2wJni28NY5tymuIGwy03Tud/Dy4JpDr4JZeRq8uqVQmEAQdnLGU3YUO+xPhlElhBDu4s1hVmyOcMVe",
  "hU4GOtsBJXgayeANVgK0CugwQN1AatZCwEQchV6KE7+Z5NtzJnJMqqOIKhuorBlZJTvscY7q92i9h8aRYE9R0DJEfaylyYmTLSnyS0pIU74RjhwM/OhrrQU8",
  "4kYDw8PlLQ8a33PiIp1X8ZbM6C2Weg/4CO1R/alWugt0UGXeMxcdv+tEki95pJ+D1bcZG7YAvrGB1LS19HDYKN3w1+MvvnYPolBn71mknv76siMPnC3EQ1S9",
  "+XqdPbtIX53zgzXXn/NcYenSqq/0Hvb8EgSoDa1pUEvLkB+EbeQXfVVp2nQ4GTiqCt8nGqktffzFPz2X3pQv/bMNhWInVBQ2Iy2RJQgCMcU2Cl9cHQSbTfzK",
  "DjvsUH9tCuRXxJaS0VBMDnGt2GmtMKScPxyaNE1Kb6iOJissUR4R9cx+GMDDAH6cfcXNqJ/z5bcWShqPCZoC2bKBQrxoaq5DSbou0Q0T3qQ2nBKQPfXzJofV",
  "OJvV1ITTzfpw5yjJdbbxbs7paRSa67riHCdVYrAhNYV2v/HCssfC2upPthCFqFRezoQ0up/+eucv8fadv8ltPquj+M+6lGgtEwFzYKFeYVec8J12ugQrdN7C",
  "6EV6a3aDBw8wFqQmWy/hiHlTN2kLLjEGl/6SmFVnzvTROzfUba+aGN5//zek1CmoWQMya50tuXpwobWBR3JHES8rxEqoQfnRlTrFGsoc2hDjxm5uF/zuYO9K",
  "XKno9RLpSbQiTywchDZlWFaKvaZciwd3Rjyap1M6TBXJqY8ptlVI85c1l6AobFhgLYWl7b9Gb6ch9HUzZl4TagXsvaX7crsUT4jHJnJHdFTBcCiS8W4mc58m",
  "QCxLPRQMhxY1tWiIlYZaBGIRwCI0VgJjpc5WhsXaUBUgQwlTWpEbclHzDeCkQBqmgD3j2Y6JJ5f2PeoR9HXzeuP71Wp0Vf/+8GKIroQxIKJUSZ7QVDmOdRaQ",
  "egw0avzXuj/ugXCYnq6vHH5qyPqPD420XbRm5wPfMf7w83+ilakF2qMali4+5MSuKf5PBs464gSq9jf6umE2v+fZRunwyy73jrjyfabWuXV9s10+2dh650OM",
  "Hf8m/8jL310+6tyrZ/SQ9gGG5txZf/HUmYeO26zl8lInXbrwK1/ZnubMqevUqYWOw079Q+nUKz/IFtsMb7LdZ4Y33WH/2srgTUtOPHIbNd7zZCV6ZySvF0oD",
  "oijGj9u79K09ZzaS+Q9N3XEJ1qz4J7hM8LwAqsKWLTEHpljm8MXVPLj0hQNajqv+MYFuX+/FuT970ExihqjOUD6dRSk7s5N8TkXqVZbUEmMY/4GDqlWJhHgV",
  "1r5uo90w2t1t9JqZvmqFC2MnRewr4bR4qCZzQ8o0REnwmjbnxtCGF0h38SDDmVZslPx0mDj7PYtvjuY9HH0owfcL5PsF9j2Pfd9nzy9EH4Uim0L0d1MoMpdK",
  "xvi+gbBnB4d+O0DeHq2X3PQcKhV62We0N/7zYwcE4JImzhqUdNqJxCBeD+JsdNVghOAvnAIAj/34LwZEEAx+FG0tUGs110W5a6lEmy0FMYZHlCdPfACqwJQp",
  "hgg69PsHD/XGjxkXWlFSJnW7DW1q3MSdUmTsS865u68DQhy1wkSViJpSsiOxdEHJbz1W+54puwqhiP01/OJ2GO8BNckGPRQzmptzA9A0Q8lF1+ZdzLJ0N0eE",
  "BIiCxfPJAwnXsPlZLYfM+WHmsUPQvm6m3fd6aeRHlVml8JHfoLhapC4SGf0Dyk4gEJwuKdbcxRspVudB4LhYUvqwIKJtJOdNmnLd1/KsSrQJaRcm0GiQIvC9",
  "woi2zWk55tq5Wql49NlquAH4cvQDD+2t4/JPSC7MOmFJxeI0CECGQvKMXxspXNNx6HduwOrFY7zlgd/YZhvb4ZeXIbwpXlj+1Vh5ds9x7TxSgdfVaCvWLqqf",
  "fUTnslOvPZ+Ihh1bq6UAfp6e0NfPh06f7lH/gvAfqoXB0794QtEE30Jbh20vdbRvp6vuWnHm106l6qWRi6kNQaddugTAbekteOlXi3bFqgLGjQOHAtGmnFRN",
  "nQcUQQBt8Z8AM1QsRap4RTh583O95WtuR2dHEfUgol3WrQmW11asGRn50vjv9P9YK9M96ukP38gFWhWcMB1ZHPx6XdkcQhndON1AMZqly/+R4kLuotkPnVpR",
  "oqro1edkz2mT80XiWZY5eTaZTJKu9T2vYqSSSRPT+ZOmQVbZPRIN3Mk9z9hixK6sLVWyKzRioqpGHslqo6clIi0FEhYgA9LR/rRQ23dLvb13QATrEhSuRX5Q",
  "EHD0Y3LGIffzNptOo6GGVSLjcI/T1YxUSYMw8MZ3+Xaptw+AhduPvTPQYx4tWrr6Q5AQUYoZOd0CZyhPhPCoYTUyGApT+bfxprOhF/2pXH/8xlkoFpQCS1Fq",
  "LbJFXuBAaHlHE01nmci6t1E6GFId5b5Wx108E8JSwqlXGNhQ2TfbB3+99h2FC8+6W7v7DPp7YpEdwiCGo9KBvDodQC74KefLT2tlLmeMA9cuPMnWZBifGCQs",
  "6r/Y8DY/tfz5q6/TbjGuhTL19Nt5lYpX/syZd43cetqRJf7X1VysAzUNCfCiHWJcBFwCgeRzXDLxFKfPuDiMKs2FMSfFqcnbKcm3kSjqPmq92RofHoplHml0",
  "XtlyzMVf0W41qFZf3a5ZQZg7YRDh8myewpzD66OHkAmhoKSNtxOx6jVfGsDMa2x7fz8hjJyBR26/cDssfeRbpcbQp0GeyJqazwUjhaKeMfZbM7vDy0+9zGz/",
  "jp/Rx/dfEukKdiRMWEiYD0Fvr1KhGNauPv3T3lmHn2Y6Wt4B44mOhIZEtDC+c4vCmoGbh78669CgUL6RPvS5Ozo//O5lctdvvMceeshsv2JFEFw9/51+qTxJ",
  "JBSSOEO1ySYiuvYqKJQMFi+eB7HA9OmGevrDCAbjOxpX9L5fFj97rPFLO/PI4JJGqfX+oQnbzRl/9rHPRmyvN7ag5DdqmttVk472NZQX7LmQktAbYn3/qo4G",
  "0l23uh2/OFC86iib1tzM9NXDjZTvTlz79US0mDlJODnrqoAhyyOhCWv2KO/iK34OoBBDLgJAFwK0I0CLAd4csETUcN+i3lfqUHLtajdTDzXsaYethKVo3Yjt",
  "+JPZkoqmQJGKEKyAVj87FsSgqkhw1m3vYZ+3gKioxBH1LivSiWRUUgUXiIOhv+HUU1/SIGCqVmVw6R07FMq0pShAYlhNtqFXN4BNsfbGzSWNxmGsSVRvWp2U",
  "mkoJjTLt0Jynarosqobc2eGZZ5d9AsDdGHMXI1Vud20ZIHhCI0VazFNOWmHOaw3SIkK87vaJk7zu7MUKjBpWyJpwnrZ13jnyvq/c2L7d+5bGee5rPXJ7VKvh",
  "vMp0r3zAWd8OfvzNZ2nNn68yYwqbY9AKhXEFII72MkSO1zjlbTTIVaQjg+lcrNa1s1BXUIPYDymOl1KG8cmg4Hl2RJegNOG4li+d36cVZfSqvBqXXK1M94g4",
  "1Iv2vh2TC2/BSGAjm5Y4HS+ODoiuqTKMBxjs1adyPIhCzJoLKHR47okHFnXw43j+4U+yh3aoEW1EijcrlkBsSy3mLSgMfBuPzDvHXnTytTih9xT09gLVqhBI",
  "K+hl+7VP/5oHX/gwykVA1WpdTEQQEJLaiHCpiLKPD5aHV3/Q3vDNl176yqxZtMceP9E99zR0550SnnTs+zG+hRFKqJRUaeTnKgKQxyyDq0XftO0iAMDRRysW",
  "LABRTMc4pvIXAAc8qVramk0teQDjnab9T+330cSLydMwNWd+CHDGrImV9ukzwIbwX3RIE6U3cRSGI/Ylt0uJu3kkFvavTnzDUGNymjaXfZQmm1JeOJybwTC8",
  "x55eRUQNBYKXy0aJ7KYW0fypUwnVqq1uCO08xkC5Y8rDGKl/WJnAVlOdi0YdSiZvUDDqNWDypp9RsacBCOTrX/kgbzMWMtKwxPBzEd7ixGcJAUwCa0gKhfsN",
  "UUOPP74MYESHVn3Y32wcWashmHyCm3Gfd0Nw3h8nsVVBiYsekyGvECH5QaAgErYxjENuKFqOnZv3XXQDwIQMQkto8T+kqh6IwqwyDKz+IcSnbCyft6Sg1GuL",
  "nCwRjMIAQ6YdoWyXQTBgYssFJZm42SXewT+8oH279y2NmEXrNrDYo7og1L5u4+93yi/q7e94rwwWblFVRnvBoOgTGd8CHLKSjVJBYqpxLsQr7xOUqIJTB+Bm",
  "V9no2looQoBCZhLDIC4bY8qegeiLYeBdVH/Lp3f1vnBun1aEqQp5bbbrCkza9h6MBACTSfFQpSxBTgikxKGyLZR160/eeNInCFBUun0iqBlZ3Mtj+ECobUON",
  "LWx0ERIxGYsYCRoiosMY3zlOhlZ6RKyYP58xfbpRFerthcLIZJBRWK0jIBPdYgJVCwZYggZbDUK0dwybcWMmeIYGAOC+LbYQVS1RCUcoGBDh5uz2rItVZZCR",
  "mh1c1f5URJ3s6cklqGulwlqZ7m1NVFMV0sp0r7Ie0MXrbyPJOaprbgmTbFGkZvjAHcDGwRGuufD/bquCXPiZuw2ltZ7pplyTrCK9uj7FmNTSPplLUZoS6RRo",
  "yetZUpfdODpQVQnzKkZVaV0f6K0q+vplRrwJ0UrF0w0kGeDR+3+Xhg8m738c0Z36oyYwlu9DB1Z6iKURUvL2gtjY74fyuj2Fq7aDMjMGa8SNodsBAM8+a0GE",
  "gh3eKooRytv658O30BQYpyncRWzEcIENfEO1Roilyx6VpSsfZwGx8QyKRRZSIclEH5QDFmgdscUEsjZ6P2vhtiBKsSlWgLD5HvOxOlzChSKgKmspWlNzRmd+",
  "0ZzJjGYcL2N0aOpxyvCGX2jVedM9vWamT+uR1kc9/Vb7uk3r/tVnzYE//ELYvvP7ZbX8MKzZERgy3Fb2UGDDCOMJjq6F4SfzHBXJEondrBZyWkUlmFLBcGuL",
  "x17BgwXb0AukVphnixNmDu526Nv8o7/ztdaP7vv8KxXF9WOALYiuwZJN78IaXWo8w9BYm01OgBJJ5LimltQU2Kx85ox/qBawYoAIBB434Wvy0irhQtkCoqLR",
  "pJ9i6FFUVYgtW2mp//PZJ1aMfc9FCiXMnyG0YEGIHmJi1nCTcV+0a1aFMH4RjAAQIREhFREVgfECo2SwbE3LisGw2nXhFXfp7NnFXefODeypJ3yZW1u2kTCw",
  "0eTSmVqnnYpACBYEZQ3uGn/4dUPa3W2ad5zRwHlBBIcBStUFYfU/WlAAYuRsFhOXkjx+TXkILL2PpPm1K/DfAn+Nnl5JrmeZAs3wiKb26a9lA2XSWaFbvLQJ",
  "PEi1K2tRXw3CrjFMREp7VEMi0nV/xEbFgBIZpWr09c26ilGP7u7oz3d+NEjFKaqAlZjIIKmmJ9eJN8ICAVav6nsTF3SqCFRF2Z1FZRHTmsQkKymzDe3gyG7v",
  "XhRb2gcqQjxu0l4xssIuiYhybtSualNSpT4xWyPgcLD2LzuiX2rs+M7dcOklO/KlF7412Hyz92PlihNkzZrFbAoszDYdaTQNFrNpgDaxOKM8FPjcgmuvfQsA",
  "oKLkoTLd0J5fWhHeeOAlxh/5log0qC4FxKytKJE2DqkiTmCYUaJHKX0SNaYjphCAIIPUqCi0xy9Crax/QFgu2vNTZ90N4O6R71e2Um/wo2bgubfZhkyllq5d",
  "MbKqaIj8iGrrsI6IomRKbeLFq4ORikIJwgDLCwO/5LauJ8Px24x4Uv9lMHHqU+X9Dno8AsYvjKI0o5Af+zoALKp93YY+e/KQvfjTP2NDR4BFSMHq4ofEUZaL",
  "Ctu6WK/Tm7b1Bd2zaM6dc7QyvUQHzbl9deWTX2qdZK4zLQVwqEBdwshgTmDIeFD4wy+ueHyoUfz4pGMOfUG7u819szbh1UfufTDNvfMGPeNUj44664Ha3FP2",
  "0xcWX+G1tG4J8QDyozFPYIFAuDYwYkeK5TPGXX7DNx+dPbtIc+bUBy65ZAYtf+KbYLGoKyNmrEWSmsyvhRRQ3zCG6iQthVtNlP75SrHW/9GjO1vLJI8501o5",
  "QTmTVGQOzOra1PxXHY18LLYDoSQRs+Q62mqmgs9bMuHVwV8Ud9Cuqb5rvOn4xVEunYMAUSO+gjctfCc8ZtaQpIaXMYpiIrshYkCNid0nWIk80nJxjQys+UFj",
  "23f+gI7peUGbMmRHKSrR57Z4199wz6LlNKlrrNYbShzvf1Jn58idQIgUoYj43rMAwT42f3ezTVdZbBgZSMZCzJRNl44YBAoVYzxja6vvbTnwwMUpmYAIjeO+",
  "bDB2IjASZZuLy0R1Z1SqKUmEVECeb3mYTGNgxYUvnvTZM7bY4r0jAICDoiE6gLsB3K23nv9DeXT4p8zF3eAFQmHk3aNus6Cag3w11i8RQAjDkMeMLWN5eTcA",
  "DwHz2UN1gdW+bnNf9y2Xvu3Kfd7hbVn+nKBh0VCFqoltqimxS2AhSDpg07yxG2ULdUpva3ZFXY+JZaVS4V7MZ2ABsCi+hRdFdr96zTQfd91H9PnqUwDmxhBP",
  "YQADneXrP3MmFdu/TAECUaS6DxJtyl5ImBCUmtZFTBQV8otst97mYvO56l25RWM6PLxpGmHlfYL+fo1Xu+iHVQBgOgMz5FXBMwunKrQf7LVfjTWrD+MyszQk",
  "9fBLeOlp/rdaFuuHhYK5ZMX1Zz9Fh532c73h4BIdeuP1K6+Z/WTLUP0EUxvazbS1TmIRwDLCwdqymjfmFyOf+sIpE3edvuTJysElqt5UG7xgymWtjU2PHqjM",
  "DuiM6i168PQSzTz7F8/86U9/mnjnjQfD8Bd5YMWYekOgLeUGaeG2oXdN//7k7kMf0u63FGjOnPrim+duxvf99SbeZEJZaoEQTCYaFESZ6TGLREjFgCmo155Z",
  "+anP/kq/eSXjdZyRKECoVMxrwplWPGe0silJQhMUzqmRR4V+Hefq5L1icaxwwlB1+nQPW8FTTMdoifN45VD6CHR7LR1bA0CBmrQoDuitGcstAhwSSMxJ37Ov",
  "ulRGW9wUU3Dte9wCNooWKAmW9Rhm8vgtQB5MMxstdZPkJgq0AKGFKXe+yzzzl1PCr58wm867+Icvl9iYdDS053tX6GlH3cWF8mdtLQzIwlfiGAGw8WxBwQVf",
  "MBL6NQ7PBRTo7PoMEICtISXKdbJIlsGk4fFIURfA159HsozIkl8rB5eCVdYg55btuGSTQ7qghIkGqG8sD1jTWLXim8VrrjwVV1yGeOMmqFYVqujv7+fuu+5i",
  "OuDk53XF4x/Bt25cgNbi28CBQFOqbG4ToWvrISO5HCnso//SJDzOI0C1u1+mEQkBB9Su3bdW7DCHoJWAkRBRnHgk82FmhrWxWZnmHG6TXVx2I6pDl8toyumM",
  "YF22Jb1EVK1KFZC1qZsK9N9vmx3lYpbHS/ba3QfBHSkJTHN51ZwJ2BIvsRgvd7ZmAACvfXwJMBEDS6J7jhYgxIL7R6dTVgFggaRxoBuonUhtzL9y8/32vP1+",
  "zR34mNYbltQ3YJMN8xKbfRjSQIzX2oLWFYu+N3DTpfvTF4/7jVamFmjWnHkAzVv949vG0YqHZ+CxhShs+SYU99nrj+07v+dFYA505jSfqjfWVp0x68CS1o/G",
  "lIn14jNLr1519EEv0pW3/Ea7Yfi9712hwCVg7xLd5TD/hvvuwyzvoQBhlKX1j6lTC9S/qLHmmmve7P31j33lTSZuLkFgIWzA8WJqJaOSJzJtj4Vr6oVji6dP",
  "2mOPwfh6yWun/yqhh5j6YVGtvlZmWAj8G/aKT2jCCHS5G9ocdE6uBxWyxTK1HwFQbg9pQV+IBVjHuS145bNa4BTO7m5+1RodzedrrJWLpNQEf5EbJg+mV83+",
  "itOHXElCTOcXx5UYTmxzzvsurvH1UDjdnDZnxpDDs80jKCBredzYCRgY+EHjG18bT+deeOXLUoynTtVITPrMKfLU0g+YzSZsIsPDAYeWJBYvKUiM5xMa6q9e",
  "ueqmzou+81N880pg5YouTBoPNIK18hWz1yhQqDJ8I6tW18JJU34BImDHoxVYAHTs3KKrHy3mkrgt5e45ynUSBGGxnhaMHVn9++I1V56q06d7mD/fElHYxD+J",
  "IpJnzvRp7Lar9dwLD8eKlfegq4VRa4AM5dNMdBQWXzIOsQo8/2QaSOq5mQhRs+EfOnjr7B8Wlj5zpLDZk2XI84seg0BaC4CSn4W/JBb0yWKdOF7Gt06ikEUS",
  "8oZ1F5XY3E0A0hW/+e4WHY/+cncML+2isZtvAs9vgfF8qInTtWwA1RCCmtrGsADCRIOglTMQCFSNIcrSAskhGWTFzbleqSiPjdZqkOf/fW54w9fOQBhG5THh",
  "A6bwXsyKsFaZDYnSizy84meYPO039Pkjn2rK31vPowJoFbZt8lm8esmeVDRAGPlwk5vGR8lgkwihaqG12O4t//svhs+ffRidfMX34lfNtN9+y+HoR4CzcO80",
  "+Lveh4Dm3h8MXnHyieWh1d/k9jbB6jW+P35ssc3wL4ZPP66KMy+5QGNoTyUknLxSZuJkzLzyyiiYC9C3LlrUqH3juM/wv++b60+eNMaqCgliP6IkSyeZ6sbR",
  "BUTW+G2eXfPS7wvnzLlF3/y8WZ+52nrFMUfna585vq88cZOHPl58+u8tdmQIKJEx8GGtCkQUxgDwAZjIx9r46T1pU+ZiyIW2krHDL2yq7XGQGkazC2lacCkb",
  "bmfWZ5HZppT9fUeOOHjEhOQxYFGzgQ0Cmz4PjPQ80ifEROcI3ze2oYJtttdwi/F/oSMPfwz9/fYVIZx1Ur9Gga91NEcAyueXZK9PXzXaq3GllciBXFwCADlZ",
  "6RRlf6TD+RimJmWAidWxEtEcvYjWcjtIWVGiDDsi0tEOs+LFS7VS+TOq1QfWtRGMNnsVpuoNT9SPPmTPAg/dzmNbtkYrgUdq0Rf5HqPWQFALru+6+LrD/7/2",
  "vjvMrrLa+7fWu/cpUzKTSQ+hStFEET+wKwkXKzYUZrwWmkCCgPQWBCYngCAtCAEERa7XgmYAGyoqmsSCegUUhGABGxIgfeope79rfX/s9u4zE0wAr/h9Zz2P",
  "j2QymTnn7L3f1X5F77vZAwAzpXsMDcnRLyjuz1yRdWEWX8lYI3eVzjj3D9oPRm9v9B09syfx2j8V09QvzmWT7GDPOiGF+ky6uQZTbjs/pgzoM42Q6aabAu3v",
  "Z/r4mffpiac/ANuxLwxJetA1ZxRtdpOU+I5tjJe+T36x9oPpg8vuAviu0a/fNBuP/6CjPmufl0ipvc177GfTfRq+WlEQiDLFXtZRlREnF8mAPqQYz1/Zuvuh",
  "/PWvOnnOjw67iJ8e+BB28LsgkwDdMp6QqOpUHwSTtLgNE/m9AJxwWRIkmCayz5T3E0+dKIkjtLjvwdDGl0INYLSpvKN8BeTFlRsYmGreiU33DIefOnIpTrrl",
  "Sl1CjCVQom1LLukNfMKF99jLDr2Zy3S0eBSyhRf5PSYw7QRIwoDGpgDtXqHsj37RXrnwUJ655yV0xOL/QdgY9zv2u4+Dxk1LX8MjG882XngwOtsVdQuQR2jU",
  "1HRPKpQDudguPfWw8BP915m9dr+d3n/0k+gbsAnGUu99rEt/8OV9pT52KtPYO1HqQmhVOORoFptqRSWFBcefsyiVOgQjY2Nm11kfo2iX8pxZ5onC9sgtK2YW",
  "1999hvLAB/zJpdmYMRnGTk6vlyF2fOYzeR+D7OtGnQpaLEx9BKEWQImBezKyyUHXJ0bXJpBPo8QCwHSXDzTd7QemwojEUQZO7X0dS1y446YYNAUC/BBm/aMj",
  "dsl590pYu5wuuvw72g/GEtVt3j01AJSpiYhA4ym56oBEciOmSF7pWVvUpDoqMaM/7lQohzbSbMyT+90Mx9Mwt/BOfywhZ5qXg39HfG/mRj3E1BmebNl4riE+",
  "VLfluaxUfrv+s19/+eTB3/4njY68Qju63olasMFsGftBbfrM75XPPedHeuONPu65x+j0MbWid5iAFoiBRirPnFIbMsR0BEUWWEVb+cV6buU4Wlr5NCrx+y05",
  "iAVBfB5xdhRZR8dBGWpEjGUWW1trLrvwV0Qk24R2W7WK1YriiKPvQE/3vmAWssI5hormO5TUyj15PekdsWr8spwqEF3Ra/DwgNLBx6yNvvrVPwCAXrbv69E5",
  "CxzTNCXemySZMlH0lRhWlrGKaeIWKsGSg3Rs9W939O/+8I+4e/PukBJQlTB5yEQ42e5BVKJDXGPJ+NS5zsAqDCXapKJ5VERa/ZCzhIxTf0w0pCitAFoUWIeK",
  "6iZsyvvEZA+rKkptncYPLpcbjtnVVOgExQUMVHT7eCvCOPOrx8vyw/+De3RXGQ0sJyQHSmQ/jLNsZaZQFYUCuOwdjE1/ONhedPiPuXPmwyh7q4M/PPw3v71I",
  "4Q4veRsPbno1j61/CzpLQC2wYmGYEmMwQ6gHCmYxk8svRlC/Vh75zZX2nEW/QE0fE88nrTcgd918IJPdkTt92EZB0QAYzPEzg0T4U13rCSioWLAM49syjvdO",
  "+PiDK2PDoefcofTdZocvPunA4vqvfc6b07YTwnaEgVoEcS2rzkEdl3fkHqgqOcXcxJVUwVD4JjWkazK20tzClJrQYE3VviosGUlQfdGNLA7ShsECCGx6v/E4",
  "xjtFHOVioYN9fwGPBgv0gvM+TZWLP6qVVMxbty2ruIc15xBfqo64hziWq0KZ4q88a2loImVyvTvQhDhTl3mnGG+hMI457nQxrgFtTiKG8tU9YGIx1bfr1WdP",
  "o5MvWd9s1jVhYjnm4GEAnwGAP6uethGw+xGl8y1atCgAEABA9YPf/RY9svJilP0OhShputpO1wSRt0I8iC+3vRgGNzTOOf1NI2cuPnpyT8/Q2PBwWLQajkuO",
  "4NzIy+GoCJkC6+CTq4m5uq2eTliwINohnX7+SHR4O+LO7khHNI8GVkSmezCAl5gBL5gYgZWMJKKFOYB5azyg14ZPfrrH09g4yWGgU3L4CkXFhDaruNKEqhZI",
  "5adVvfvfeZ23o+wu1jS4Efgg9hI1Ynf0wC6DP4FuxiJ0RK4+V+bL4M7A0/9OxA7ZVWKOHm6ocn47peO7LNEmprECdSuAHzJtOV5vPPY7tKjy7e3ZsSQ3L0AB",
  "t539Xmz8y0rqLky2Yw1h8piYspcW6eVByYDARFYAay08Njy1uD9oZH9U5aP+DrMBKLxwI9BpIDWCVhuWlUw0toz2ciQxwkJgqBEIyCi3eQW0F/eH8fZnFUA7",
  "gFoDVlVRqwtsBLWJnhh11FYzFVcSBRX9gKXoh1s23egvW/5Z7e/3+HlJKAN2+IrFby6bx79rphdMWKsFGrLHzKloYcSFdiXoXRitptIfOfl0gYNx5QzfpU0+",
  "6jJOOdUx/KH0GlHMMYJEpTY50NKIZp0p3+bgvNTcUSgQNhSNQFAsK/zwOHv6yZMGrlh2eG9fH3RgQLYpsahmcuuOe2L+OckfICm3gnOQrO3nqZDDStZ8AkkH",
  "EBr77BA1yck4z5pr86jZjjfd2HAs/kkOgIIcyJu1ljsntaEw4+0A/hurlphEEHH8nncJAWDt7/VQGQgJkF2JahmmzYcue7gY8qoF9PgDs4P27kMLv/zObEwp",
  "t6umfVhuqxS95FiKxgISBspFDvzuzkMKl1SEgD4dUWslhltp5rFLqS5gkxdKpNYLLqKkIoQlS3S7AC5DgaCtELnYAhMn8Ak7c5fQsuqZYb2VaGEOXdFrqa/P",
  "htcf2g4Zye7zRNFUsg8qk8l25fU0I4o5CuDJwVC77qiDilPH3gVbDLmhBRDnFVeSyjedRXLWHSXKpY6cSrpc1WbYnfMwq+PR7YwzJHvkx2mdUQyXTuUV1P3x",
  "FM166iGjbRKw8emTAXx7e73TqVIRnddr6OhPPhDcdOKhPLr+O1wqFLWhsfZZssfKMP9JWaESiThoLbRgozCGox6HYBuqkAZIyRDYaCpaSUi7zrS7ZiYVaBiR",
  "e1QbGVhdmSO9GDYgSdVh1T1kU+SfhfqFwIS+XxvacHv5quXHKUDPlRGf6MTphWe8SPDol3hqicOxwBJ5PniiyVQm+c3ugwnkFYYdvW9tYhdn6rfOveaMi9Jk",
  "RBlBLQFYaHPF7HS86lY78fekeo3kJKgEjsoU2SbVapCCF3BP6YPvO+P4H9HAwM3aP99DZXW4TYv6rVhUuKq3CXKNYgUKIm1Cuz3bC0g5yZucXJLkOorx+mPj",
  "4Nw84f5ExZ39c77AjZKYwC8Y/PGhyRORUiM77j6OK/1MCVC1oG8+p9w4YNKOWtL/KD71aDmcNudQu2H5VK+zvAtmtsP4AtBkSBBCrTrTEc2PFh21dzYgNKSA",
  "gjbauzt6a5VzD8GpC79OJy3Km96hSUaHkKpJQ2HQCMDF9jfj7rsnoVIZeqYOzCnsoxKr+tR08C6xJ5BrONfE+3OSu2L8WmPbKo7Nk1lX9nsodLSNU7BQx2ul",
  "mXeYs1ONbxhrM3jkwABABsVg46EosEZ1QpN6aaoMqrmHFaKxuiccLZ54x+N6rERI9Qz/7rSe2UOUf52a2p2So4VD8cvQlMuWIMnUMSWDhZG6Ksod++q9P9kp",
  "MlDavt1BxMuZ7/kLl/9IvF16ZTgc47LPgIQUj02UOLeUVIdJCyIDkEeirKIsVpkUhsAmV95QNhZIDhGFSxhlAmAI7BHYIzJe1NtRTrZHNSORptZUqiDPC40Y",
  "f2xk8Eebrlx8uPb3M/r7M5X4/n7W/n5Po2kxK2C2ifW8Zg2pqi/09PW8Q3mabVjLMEabtaVcafR4DCZwnUsz+G/y3lUoGp2mLG53ihJ/PrZZk6+pOEmLYspm",
  "/y4kOVcoxaMwcfcreettaMz1Sq5LMiWoBx4835KGn9Qv3TuVKqtDxbYwxptBBslVywovSYApjmisxs+RPBciJzkdGI33SMk/mw5nJe2ixDlU2ZFeSszsMF5d",
  "Obef0njQEDmJYtZUuxXQkFLfgNV7tU3POGPv8OpL++1ZR14TXnzmA+H+1b9y+MT9xXLtU9htx0u9tnA/M7tzF1sQsUShbai11bqojXpkdXTvSF1fk2Q/kWwu",
  "DFBvGBRLiuroqURkWcJ6hFyF5jlCeaWDSCCXSAyseqYj/O6dBxCgWLLE/MMOJTITK8jk9sMifLA1mU6fM7ERzXXNWbEU38Pxwc7P3CX3swJEi24KIsMnMxxJ",
  "sHCm0CmuBk2GwMglFI2w3NEyvZFzrIPxIdO7/wN1ULr1UacFt5p53qvjvqauEJ1CrSt45niuJO5sqTFYU6Wjrqm101E58kaaACFSzbCm5V9yMMS4SA0DRUdn",
  "D/74szmIxof0rPzH58Pzj/3kt+pe+4HhYLgBZd8Tj0Mo1IBAzI6JEjKnPMcWVMVJyqrj37soMj5WjK5JErQ67nDcNOemrJJniddbSdIVK1TwLYfGG1m/bmDk",
  "8kXv2YF2GEs7MVWKNN8qQpVKSIAlYiHA/iPWc2KtigsW78OT9C1Sb1gK2VNq0kFCpgChze9ZNScGoS7EVXT8nNYt2MSRuk+ht858myi3cE4ZyElXEjkkp8dK",
  "lpABZYdcmbLMNeetQw5RkVVJGoFyz5Qp+Nm1b49AhM98iLjPX07PL/35CQAmPqjd95atZp+b8s0EHUtGJkQOVkwurDl1gMwsxl0/m+jc4VRVYzxiLwWRKDzj",
  "YWgoqE/tvNv1UEkgxpt+8FhXcN7HLrZ3HX+/Th19wPDTS3jP2R/zpuiLvenFLm/aJN+GjSBs1MMwELFjoSA0TJY9imw0OJ0iJPeDI0RENpOpp9QiOZZ0aYTw",
  "PLO3Xv25PWwYDma7t4zJnjYfrk4aARKGhEld4OrIhapaQqVit0YuVlVCb79PlYrghEUnc3fXLvFmnN37cELCqys82oQw97aOqoEhqljAQ/32K15a2PjofuHg",
  "ulejELmbZBzGZlvhzDksfWHiLDWTm3pV/DtuCyzGhn6KTrMTgghomGY+ZWgCsEyUDpAceJS31GleoJPTXieqAEr5SilXLbkgcspXVuoMnDWPr4ezP4rOaFEq",
  "lIChkc141V6PAwB6V8gzyYVHncwqxoIF0RfWr1E8PFepUgmjEeFnf7Hljltf0/H4t681k0pvh/EA0VBDNSQRoD975o0zf9dUOieTxnClRhwnOENZIon3Icnc",
  "N+fHnluAZvjC2M1TYcgaU/JQFww37PJJN9z8MVx/c4rwc5aHWr35S7uV7vv1/tLGe2NyzxuxefBeDXTV2tOP/ybttFNV4xefb98jYph0DH+Y261qDKiIzMzi",
  "+y4+tYkz7lTOxjq30XXQK4IJRAyzPydWrRHlhnJj5q1V3tAmce/EBz5OeqlYaE6wUt1zwhlEZHua5M+xICDQ3v1OAF/AthAjNT/qc+d/6ngU5b81VyTSc5W+",
  "h6OITiKZG0dOEHYiV0dXiqIpObry7s7X8tceAMMyfE9gv1066ozfRarXFZsklOqyG3bx77nqTjMT8+CXEFhVVrIyOgZSZlJJ5uE+JUoDlNlUxPvJPOfHHQ3n",
  "LH7jIgEJQRgEWDHF9k7c89NZZqppQAUsCkngGA730R3wEgFGmBWB5Wk7vjQ86aPXe6pHE1Govb0Gc+cS1qzRmINDMXelERxz1KEotV9kCwUxjdCoclY0kjZz",
  "L5yRcJLkDECePGNSSXYd1c+cvsD3N5xPW1a+Dt1eyesMoNYDhZp6lSRjoKSHUM3ml3lTm/iGcZvN4+cTBlZDqHwrB9UPISbMJXmFkuF8clBqzDtJAWVJh8K5",
  "6idTf246EF29IfcKa3OFFEOROZ+lo0WtOt5orudKOvMOuVj0ZXjsdvOq9z7+TAiM1KUvOggEldXjrgN6V4j29hl63wceA3kHVa897kTfDp1nJnfOYAikYS3H",
  "gmzqSvfbZFSnmYxFunvK2wRQKsUdg5KQLRJBmmf+ITc/ykAagDWeb8C+FwwFf5JJ3adM+sS531IFxxlF7124r083DQTD3/jGjNLP77mYH73//dih2MECINwC",
  "dHr7wdrjdli+/Pdh/3kX0dKLvhiPnMYjm4YfnYLZ00irNs0a5OzeaFylq+moMpPK4BxvQ3Mza8qLSorroJd3QszOas7Y55oJiLn3f6pNm3qGZP+WVZzPu0lW",
  "TylWjYnBDxmKjOAXIKF9WdZu0DY4+WRu8arsWCxFzyipph4acKVFnlswYDj3vMVS9+zu8inbaWWM/0SGhJsImmg6ZJtp380v2gq4bGR01Aa777TYGf8QlhC2",
  "fOaeHvP4l1eaHbBLGHCAamgYhgnqMXkZYz89FyQ6k5DZBrjNcnL2ZF6KeXdcQsbro3jHSUlHNTYs8CcDVnLWVWiWoU/vDY2WMyLGerBex5SjcMoZu+nSS06m",
  "CxY/MO78ueeeHvnmneeyBKejsxtUr6oQp4dBygtv3rk1Y5SYYPZ8MeGuaK3hTdih9A3Y6qXv+Gih9JfruQNAYCBWw1iezcCptPKtZ5ObmTsaSz/1rDunA1bb",
  "CNRw63ftjQf9xkw1+6CKAAI/swilrMWy8W1GzojGPW7U4fenu5fmaqyJ5zIhVp8zVQBpQnghDzyJsKCJbpIJTHubL0Nb/s4dO12g/f1b9U/PmLyM+nnHvMzb",
  "sfM/MbphJ/aKiskzfwW72x3Ud+QTsWkZdG4/o1JROnH58uEvf2agbd3/nKrcONZM6uhByJBQLEUWfpG7WmpZmnVk2S7KPSM4U8+ROI8mMhTp4lTHF7jJ1SGy",
  "zMbALxgZqY2EFNzw1P4vu2Tnd35oc0LO074+A8Dud9N9wVBl8Xz/J3d/zpsxbTc0AliVMNL98chAFQVfudS2F4LgC/bCi97NH//44ejrCzTSWlOsWR0P+qwH",
  "p/sU5ElZea5CU0LJue65/uuYoEuhvLIsuSqzjj9GLlkkxRznHf5cZJWORzYpALJNvhgJRCBxe2j2OkmSY7URbtNS1lUpJscSgmMJIHFGddIkTQ+Mh9JvN/qL",
  "yOWdkdWU4+bCswmcL1ySV8DJWiUqXyUeWXNeDKvJAj3+MI0J4Xf4GKoitCOHl466MOtS5q0xVIGtLx44zd+RdwkbNuCQfDDHjxNNCN5xu9tUrSNNhm4CoMzm",
  "192zp8g3dViNBgiDIDj4wJr/6COFpNJLwCLJy2AHaINE2ZkUygZsxaBcEBSL82XThvvtKR+/k2dO/5/gkQdX+bvM2SGs6ztw29ffxJM7ZlspKjXqIDC5qL+J",
  "u/xmzIVGy+bddqgn8GRvHJFs4DZbX3zgsYUd+Hp0WCtVVVgYAnm5h0+b4FXiyLNIAnmTvPw8GOiY5ggZrVYs6WdUSO2NCw836/68GlNKk7XGUa1EJpNLy7gu",
  "hlQoueHV1VwiTUiB+Rsq6SISUUP2QIahYZiNTNwbkd2E4h6iKR/IctyCpRMM9hilgh8OD60PJu3e13ZE/5PJwm9rCaV28eVz/eJD/eio9vLkkDCzFMkwNJ46",
  "DI0n+/UzH70RXe+6mvoOWq8AYcUK1oevI/rgsU8DOEevu/A62fz48WrkSNPeNhNgIBBY1RBQhoCIieB2Va5bZnKbiqb8hExix4XVppVh0pcqEZFhjwHjSS1A",
  "oHJrbc+XXtB9+OGPJvcSVqwQXbDAo4GBcIWqeefZp59esPRJM3UybLUaQsgQsZeoFysiKClRIOL5lo32hhecv84fGDgxSUyYO5+A1ZAwqHPK2Oe0oh2HfJSJ",
  "IOFOxejwrCYcs2im55Xu59D8M9WBBdMEcybNkxqlSb0ZGs3I02Sv+VI0t9TR3M8TioEREhoi0n+YWBpNAoGOF6M6UPXET4Ucl3nN18h4tk4umeK5M2XIoTA1",
  "P5pt9mM3foQWEetODvNjyHT8FTVHEf/C8zFW32jD4MTiZcu+ksD9ownrgNVzPjFFyn89SWCUAzIwjkx1Oq5ybhL3vkh2zPH3qVCKmEvGpc17zQQarCqpuyIx",
  "LEyJ7eCWh/2jF/0alY8PZkW5puYkmf1zRilJLrvCRoWGFSYmyz1dBuy9G6Nb3u3Pmg2EAq/DB2wbbBBYEpj0rnPeJzcTH/P7BqiomqJv7PotVbPbnF/FRErx",
  "3ISCgQFpXHnqq/xJj96ETs9iJGQGkyTzS8r8lHPe3JJVGupWMpr4gEg0M2QP2HlfADdHOaWS6V4VF930W72m7wAZa9zCFL4CBQPYIGXNR2haAmoKCWN14eQD",
  "kPGw4bzvi7MkMwSq1QVhPURXe4GDxJ44fpzZ8Zig8axjJhDaCtHnJhYsNvq70QAB5IdSftEJbUdc8PtohFixW0sojYvOehV3/ub7vIPXZRuktm6tqQbxHciE",
  "Mk+Bx+fK0DcOD285+3z6yLL/Ql+fVYC1v9/DvDVKfec/DmCx3rz4Kjsy9iHVoBdkX+l1tPmwCoSADSXSSgslIdwRiInV0RwXx886czRWEkSqbxzxkpjIwPOi",
  "p7ZmYWvhkxYy0Nht1s2dx57yIACsnD/fW7BggWAVksMtbCy++I187lkXmckd+0Os2HoAUvYyWA/ljYfAzI2ApIjQC8c+qpXKl6i//+fR8n5ddB1m7BmgMRKt",
  "3MJ4GJ1qu2UAhmhanR1MopSi0xAj/HJQ82ZkVE6o1RmPqYMMjBOKO+OnBDIcf+SJ2sS4ZTRlyY+c3EG5A4tyHViuY2FWNELljva1mU7SM/USDUBNug5M94su",
  "aVXcz0EnsBJ/DoKSce1AibwTxidiF8GadjEJx4MZOjgiKtoAiRc1wynGO06pmoCGFQIh0QZKxRFm/gb22vEy76iP/kVXrDDU1xc9n0v6DVAJbZccYtq8TgnE",
  "gshIbgzKaB7bpclGsmSoseEfuZQLzXH+m85HdbpcBXxfUA1NUCze4BFZPf6Y1dh1zqu5bq06VW0T2jyXfMkBL6qogYYKCgWGAM+QqgCNQCAwhMi/Kfu5W7t9",
  "kudUsvfACiYgFK+Gn/zkrzEPRT1X75tuM2qDP56CGZ5iVBTqUWrylkNxZTBbynUv2S4lkQ6IJleqpuB5dvPwkNlr+n3xol5yLP5+MJ204gFV3a/+38cf7K//",
  "yyvs1J1eo+JVdXTsaa1uWSvcubYQPH2S190+1yoLxT4FGTKMc8t6clQ848smxrMcUvHXXrn9aTLVg2B9S1CjFEu1xMix3NI+/jWMOjWo83EUJl1oNm80UpMS",
  "jw3W0dNNssO8hwqHnv1jQFIexYRoCyLdvOxr3WRv+6bZgbqkbgMOIwEqdba52lDlUC238xwEG2+x1x1xjJg5l9CiC7+NSiWildy40MfaWUpHV9YDuBrsXV3/",
  "4hV7Y92jbwus/icp9vI62tsQ1oGSFyX1UIDAQhKQJmW7JnbcGcFMKPoGQkAjBNiHjI4pSB6RYudPbLn0vc0L3/L9WbP2GU2Lkt5eYGBAkx3RyC13zjS/WXkO",
  "y+BJZkonSVAPEahHMFkyQWZwk0BGo26AiYMAmNzFsnHjOar6XvT1AWumKwCE2v41rz5yNJWj05rYuHbf6eEtMaItkYzheJGfquQ6Uuu54Z4Ds060y9Iuw9ld",
  "kbqcFkrZ8OmojVLZ9jhRUBMk31mSI4GcNtnEOgQZapbOMKyoh2RHnvoiAGD+fMbq1fIPVyqpNFET7SE110ug8xwBsVO01Vacm7YtLEmk0Kq5xJrt9FJ0ntt5",
  "ZG/XsmFDod6Nl7z8BJjqJJiSgkhQswQiATM1pK4FVVsPAinWNMBdPxzC294wTKefXs2kffqy5/PJJyPW17o/7oWXdKmOqsSs4jwbX12cWJMxlqqzBlBH0Zpy",
  "Ntr5JB3tjNMzx6MG1C9UBzf9oHzVsptx+ZXA5BkPYbiqUvKZQom2BzqBFE1z6+kyWSN/D5NMHygB8TWN5d1OXV3XR0LePyvpLwwslA37wW/w6f9q6Oc/zwRE",
  "nUpyCA5d8aWp3HbrQQhCQmCMsmYtcROcNNV80TziJqfkmsLfSJlA1vO30Kt6/5RAS8fJw6SikrgDwB3gYnwRG0BhEux1vZerMbtaKiiskOoECqvJHoA5P48V",
  "BRlYwGfL+IbXPfX3qP7lIJAHB3OWDhI1lqZIkBoRBrwkhWB0pjw++GI+6wtnekQygez61n2wYzKVDb52Ce+CGVLXkEPjp7yaFBHDIGWCWA81UWFS7vZez2N/",
  "u9Nee+wPubzHZbTw7O9j0U1BZAew0MfaWYRKJaAPnvIggAcBXFb77oq9vAd//qKwvevVHsLX2LVPM0ptM1As7WGYSggkAkZoZoAEYwDfQGqyARuGHkO5bRAd",
  "3b/jodEf8mtfu5be2XdvegqddRYyuOIqUF9fCAB//trK7lk//cGx5nerz/JmdE4VDtVW65aUvAi9Ik2M6iaEU1YBGgQWAL0Vi97VQwN3boi4LWDs/uGV8uBV",
  "v+cuby8bBpY08gdQ0ZSXpK5UPXGGwok7lNxDmXa7nKEVifLotxxaKlN6cBW6k4PI3WVFY0dq8mhv1sNTR6W3eTnf/LDHVSVZy/BNsGnDX0d63/R1vWmAsHr1",
  "PyCWFgC1cROeLYZzyPqky3PZ63HPF+Vh8kDPylfFqo2JatokGJAmaU1BIjnZVwUMiUIZUiwNm2OjMes2xw++Bp0/38OCBTKOfDvr99E7qQ0qqIegQX4lbpvu",
  "E0eUNmHqp147oinUOV26a5ZFU9miGETDCZvaNwCVCo2R+t+GDnzDceXkbJnsfRdPDte4VCiDRFWYcqTyLJWNp0hM5FZKNJ5asDUj7XEmjHl7dmUCQiINzQAl",
  "vkiVSjL+irxKOh+5thuvbO+CtMftpMnd/Kn4YjNtX1zWuWZ+1wmjmCBgJlPwf6wqhL4+3qoqKED41NsKdPJddUgdf1Ytzf7MCe/m4MkLuDg4z3InKLSxQyc1",
  "2bomhwNn0vvq9nZkwsFRxZS5X0Xb2Ag2BTWUCsV0MSgZuzePfIqnRlZZ/RLzFD7NLju6L1x22vlrDznlqzvttFM1NoIxW9OzSlng/ZfOQem+o6O5rTEZq8mR",
  "jEnmolFFTCREqFsLj4i7cSDqvz/QXn3MTxU91z/9uou+QfvRWIpB6+8txBkspLf3/R7A7wF8x+mWvNqPf7mjufdnHfj7XxUbNlAjCFAA0GifjsKLd0TjRXto",
  "4a1v3UBd3U/Bjn878cPJsbdH+g3Dt39vevm39x+hv/zOiV5XaScUPIRhaLmhhiiWhSGNhT0przyax+cmCYYgNuTOdh87vfVdwJ23YAEY10Opst9Y45OnLsJT",
  "f7+bZpRJq6FQbNmrjtcEJkDiZMmCcvpROevcJgBIHubqSJvkWZB5SDIhGwmT2w1RE0qp6c9Nidbd6qWJTK2gUFZUQwpmzT6j582LBrdJEqjRQCK2GqMVHVHV",
  "BCWvGQudmjhZ0RNqniUUzEJDm37G7HBMBDnYPjXvnJzPjhUmJhR7E0mrjIslSxREoNWrQ6yewGLgyb0IWA30TBMo58Q5MwpGgjydaNnuFNXUtFPTvHZWXKRL",
  "NOAhwCsYiGdQqyNojHwtPPjtJ818zQF/1/5+1lWrzMDpSzb3nnL8twE6VBiWRL3006AMQJDuQmmCneBEwO4JZe0dCHEu0yfJUzLRArLKpmxkeMug2T2WDVmy",
  "xKJSSRb1/VFi2XNut+jflCWlSueWQkn9JTkPa0VOhlpjAKumBBEQEyEgCgvTbvGJVPvnb/2OXNHL1DdQ33LXip6239+5CMv7FvrlYBe0GYR1WBbNTGuIMn8B",
  "R04j0ypyZt6sYtiYsFa8rXTE0j+oCuGqD/wKk+gNqMFC4gyazL6bmceIl2TWAgJr2ktzYEdv2eG2JWfpjSfdjNce8znae+/NzyDsF4FVdh48BEX2uUE2ErGV",
  "vNSEU/1IrsVlQwLAioWnxD38BjQ2vWHmPcc/odee/iXM3vnLdOhpD6AykLLbdGW/hzt+abD7HsCmHsW8NYmvwp+3z/AKjJ4ewqZNOrBmjaWBgfThVFXG8lv2",
  "wbq1R8pDPz2My3432tphw9BqQ5hAJuq+mpQ5xTmwyOlRmmCiNlQ1HQXGurWzAAC3Pkk0gFB7ew2dvWx1eMVHTzBbttyoXSVI3YZk4eWUiFNimabqwHlEFk18",
  "0Kdz9CYjuiYOE7lJyf2ZzsiEKFPZbXICyvLQBJBY0vw+haKhpYJh4bd7CA2PhaMntl98yW25HcEzxaaNwOSenDRM7lzRJpva2MeHXEKzhWxXm5IdtJYswpze",
  "BSOmBWgmdeO8IpKmTXxMSY918rbNsKxSeea/f9NmwU1A6HV93xscPZPbPKO1BO6tGXHRfVSd0aa7Y85MAB0WOkFhEfUYDIJXjHbgIpCR+lpAfigdnV8tLD3n",
  "27j0snTvqr291Edk9axzr8TQ6KHoLDKFAmWT0x3Z6ppLmw2AaGIMiU50ajUBJxIvnUS9xKhlLXrie9fSmZdvcKkTuU4F6x7ayF1TMuGX1E/Y6f7EEZmTvNZd",
  "rMqVa/cEYj2/xHa4+gtv0bUr9a/LmbaiT5TwY0Y/fdJxxT/dfp6ZrDvAAhL4AktgkMkhvqzmcfeujpOLu4coFTxguFbTHffr1/4vMhGJXnvitWgMvzHaNjkf",
  "LLHTgTkTxsS6VMTAqoBZub39JTByBVYuP02vO+kyOuG6T2mc6XKf3OxobovGU/PQVVKMNDQicHFOLgXOgo8cQcOU/0MwZBmwoYA95W5vB3h6FjY8epa9/mM/",
  "YSl/D9XySiw47zdxBxMCd41PFvNh/rj328we2CN/EXqeUqwZsBiIhccn6Lz0Ee3EbRe9DFx6r1z0iflsgleixwcHHqyEIRrCJDAp2ZKRk9sYr2aQzUHSnUGC",
  "lmEi1ELF5M4tuVt+YMBqb6+hM268KVxy+CDq9VvMzHJZA0ADtaQqqi4jzjQlEHKUB6mJV+KAPBIuS/MIYRzptwkinP4IclTHXJhwJlKZQ2E5sy4ligRO44kc",
  "s09gY+AVPbtx8xN2xuTT2y+IHQy3JaEAQLHEYC87tFVjfk0GSiFHr4+QjILjKYQyTK0+9CxxxYQgzHellprY79SEfotkiSh5nokQ+ZQ8f0F9kTcNVv1qlbx2",
  "t4e4e+pLtV6zhHhRJ+S4aLi8p8RtkbLCSAWqpNEalsT4zAAzCkWDWjxuroYPCXm/COq17xRf9dq76eCDh9PnMkJ4SXqP9/czLV36Cz154e3c0XGIoG5JowJY",
  "xwluNsF/m5FxNL5oG6cQopTvUEXHKWgorJhCl4eR4ad43qwrVZWwYkVKnYiSyhJVrRDhkKWD+M0NTwI6M7qKTHmil6PWmnQolN9nJD7XoPjQN54itGQ6d+wn",
  "ItUVvTyRyGLii9G49AOn+eWnrwRZ2LoNVdiwGgblnRzVFaWThE2tORkOSixsDVlD5Fm0X1A67Mw12j/fU6xWvOikb+Kh836HGZ17IQyEwJxj9TSBFPJSrhyh",
  "ihsNAbOg4M1GQa7WS9+/N3b70kIM9AG5UUSET0B9fR3oaaZ6Q20eaZN30UzUhJNHjiPEvlWQDQQNFfjscdF/I8LgjSgqZPWJf9TrKk8GW4Zv8zt3WhfMevFj",
  "fu9tDwA32qh69kKsvmtcwklVV7XBUY5ewMEXT3u1/+jDcyzC3ajU9i659fyZ3N2+K6gKJoLUBVqvhQhj6Hmq4af5ah5NN7CDpIIjYZeaoKkqM3sYGrVoN9EL",
  "nTXL5hMLDC35r69Wl3/iPnlizVlUpA97bV4ZxZLhBKniytek0FXeimBhk8HTOEn7pq8pjR+fNS3gt0Ycy6vwujuWpu5INNKRrNYRjtW2CIefr+8x5+JJR5+8",
  "XufP92hgYNsVnw96zxjW/LRKkJKmu4EJLlAO3RRBtoUgMIbt008+AtVtAwUk5UK8L7WnHlZDBJjQCLEujk6XC9eN25RxS/JAUfIJz3f09hINDISNV8w5HhtG",
  "VqOnQzFcE1LDCpdP6rDJJfVkUjApMasS1BjPgxLBLzIGq7BWqzQarLIF/+d+Xb+PpUvvM44TowKMFSuI+vrshJw2VarN2OWMwqZNB1FXe5kaVQF77G4i/6Eq",
  "9URmW+PsTHViD5qEGqIKgagpla0Mj6m0hYv8o07d0kzwzj6q/vkeVVaHwdUHf8rbCSdhpBHCGi+dhDVLWEgTQsUda6iCRCDkBZ5RPxzlm/wzv75Iv/K+CZ3+",
  "MrXis99V7PjzN0FBgDEYAXO0cOdU00t1AvSF88CS5Jd9IA25o82zw+GPzUn/dQD6+iiqAKL3q59auBAdjRshCBGSF+mauRBqyjH1o2kVOQdKSogQYT/kshRs",
  "jU/3Trj+Kl1xaPp+9caFPi26KdCvnn4NsO5E1AILePHny+nnqYgx7kkVrZzuteMFfvqgp14cSObibKNmTqMWmxSQyOlQNg8JqnYtuM2ifRKxlQfx9yfuQ93W",
  "rCohBEyjptJZasfOu71Wyd8D1RFQdZS4vbwjOtoADQETkT2lHohaKEX6WiZZQCbXX52q13VsziXn5qoJmjLSCQQhsVwokx3ccJ+5/NrXYcmSCccdyf0DAKPn",
  "nrqDP6twMK3/8xxURyF+0YOyzdwKCcKcdSIJmouTJT2nX+aUacdIfLpYJtZjlbQX4Vhcj7eq25qxH7KvRz9XnDFLVOACAIci3FEk2zX59xvWrr9r5jXXPN38",
  "vrdN3Tky9MLZH/kRZrXvb2uhMthIDgmXEWSRYCoiDxVo0Q/N5mFvbPK0t3ece+ld2/P7U05I5ZTb0VF6r4RW2LIRcuG6lENJJeKQHN831oM1ARls3HAYLb/p",
  "i8/GuntbXmP9kvM/USjXF8MX2IaECBJQkFLksxQDPWLwh/GMAXtR16UMOzg6qqb4V1Zzp7RP+WmD8Ov2c07+e/PvQm8v0Nsr/4iwmn52pxzzHpSnfg1dZcXY",
  "GMA+p4Ko2MpiXp9JqqeJ0Jnj0CTyS8kYMk4ohZKF9bwaqheXL774vImugUN+XC0KUK1n3tX81IPH8NRCCSMNIYoyYiYpTblWihzxx3ReLKrwTeh57NdH2+7f",
  "fNrnT9PTibaqgfXwgKpqwV5y8HnohmIEDIo/sJxwXLMNqss4pkxLKZUXsMK+72GoumFszwM/2kmk0P7o7yurQ+3vZ7z9Q5/HNyonYVpxLkKxAExuhuxUlAkX",
  "MIKGJgegRKgpNcw28BD6QtXhE1VlWU6e5e7N0UkyFN6Bgn4MRByJqJno59IEfIAUXsmZE55bIcdjmMiS1QAUH+6WQUFdQF7kNSUhuL3kodvMgSoQjgAwO+El",
  "s98J9iNDuVgUkwWA1ADUgDID6ILWGtDGSAhixMKfBGVmlRgwodnI0dF+S5FQks1kFZRnhSdjRqIMGYPYwsAzwFiNTWf7J4ko1PnzPUxgnxupOvcz1lSIPrHs",
  "CQDX4f/hSIil22TA5Maa3kh/7cKzvoiwukBYQw4FxJzbz1KTbQmJAoZCo+wF1dqv2y+75Ht67qW8XVbQc9dFN+/Q4K0oFd/HTIowtulWybS8lPL3BDLxPvI8",
  "yKbRUd55x58kHvLP6xgsGamee/G54cdPe4ho5CozuXMGypHgIRoC+CZK9oEADQW8Auym6iCY/qbG/5WA7insOO+HOO7Ix93rowCjfz5jzXRNr93AwPa9rqs/",
  "+43w9JOONpvps5hcZmkEIVsYcswkdatE0PHE0ombHHV4t/EeRUWFY02/kZo32la4qv3Ci85f6XkeliyxE0KTmzNieOX7jjYzgs/C90OMNjgCwwOSyrJwOvem",
  "PKNUIw0ozwMp6g3/q7UP3np8dzdtymRJJiYD6tVn7gH63R/QTkBooOyl8vMJXE9t01ggmcE6TOQsyYmQ75M2GjUZw/zCuSt+1ZxV0wrg6jMPQnnTt8E2RJ28",
  "VJ5IKRuzJRycFHaqmUy3Oypjz8KzFlPnvpV6P7YqWaCmkgCrVhbx288+iJneizBSA6jAQrFAs41tVmN5j0hTiBx4s6N7RJyzfo2QYpypvXKsOJwyeRErzJvE",
  "7FqTjVv2eaqjLhnrxItFNKGgjKlHGWRcxZn12AlGGG4H29yOa45ZmI4vVRXwJeRGwbPDm79prrnufejrw7ZUpTEqiPHkk3Qf7sO+szoUT44QsO+/fzaZNUux",
  "ZIndZuvgrRhOPfW695Zn/vDalZje/kob1gOy7IOcIkrzis6AWlNoM3bdplp9eukN7YtvuG97uwRNqsOVD7XLd5c/yLOn7orRqgX5JipK4ulHuqtwDihRwEcD",
  "1F4IN2+4zr/8mhOf7y6luaOjCkS/cOMs+/ifP0Bj9f+QWn2KFouTdKyxBYHdQnN2BEbD71HB/134ulc/Vj7wwMcmuBc9zJunePhh3SZAwT96XfPne7R6dRgs",
  "XPgO7um6mSd1zIAqYG0gYg0ERESUJxMj3YkBE1gDo0nDLz4qWEWEI0UyZvZAPuzmsScbWju9bfmnbtUmnOJWk0r2gRqpXf2+84sdtaXo8IG6BDaQaAZAsZmw",
  "ZnJviCBMYCJDZR92zI42zPSL2o694dJ4z7JV6Yg0qdx44osRPv4IfADiQdhk5BHR+EwavyClnFeCJPseMcZQaEPYrt36Skdecptuxb5We3sN3Xa71U8ecTWm",
  "mZMlCAMOyFfn0NZ4/u56ZFAqpJkc8CkiJEBXp4968YO0cOmt7u9NxgV600ePQ/vYDSJhwA3yY9+rmJDmujuyw4mg1BMkGXkligWp8nIKVuDU2Y/Sbo8dNJTL",
  "Yubxopupj00mc6JNrXV6/RPotuh4JQdnmTkekdKkKZ/cVBHkLWQueuFYdb33jv3n4oB3b3xG/k8rts/grFIRXb58d6x7+PuYXN7VNqohwkhUj0CUcNJIYNUj",
  "NYU2L9w82gi6uo5oO+eSr2ytQNzmEVj/Se+E+t/C5HaLajWSbFDOzOdcg61otRug0O7Lpg338tQ5C3DmmdXxdLznvxvMJS3PhwaNIhmvDrETrS2iBy/yCxJU",
  "Kv+U15e8ruEvf2ZG6dcPnc/qHcWTu9qgEo3lg0YY1XBx66cOLDf6P9cyMzXclngvyAlKpVBg2OgMsSOjG23BX7Hl/+y9dEZf31OKXkPYekKfcMOzsh/eARWE",
  "o9ce9d6Cv+Uyr5N2j6Q+FBKEwjBRUyICJsMo+oAKbMOvqZl0h3TPu6x4yEkPqPYzsESfqbJKKxjdMhnXfOS3aMcssQCRR5q8RWmGPObBA5mfiwCKkD3jhbWg",
  "Id27HFY8+rIVyf7kGWX+B2D1sr7/xuyewzBUCyDGT/WOxNERcv04Uph12j0pPFKIBtht7zfQO467t3nunPzZXvGhW3mn0n/KWC3g0PjKDIkZ/WoTQyjOFspI",
  "RlwEpmjvkvqJE0W7gDQpGEc6InGs5HSvkYgwquO+B8fszFXuddEk6ggNqGsD0JxQkr1C8u+aJclTCKPmoZCRokzIXPbCRjjU2GOnt7QfveiX2wyXbcX2JZbP",
  "X70T/viXz6FTD4SJlBNERBgKESJuKxNCRjjS+FO13Hb4pI9f8rOV8+d7B6xeHT7XQzE8/oNHmqmzbsGUDqBeDxFqpOIqOYyiBTHBKxsZHHyQ993rHXTIwr8n",
  "ncQ//XNSJfT1MXozi/VEgy8dXfX24vnqRJ5Nwhtbvnznwp//fKgp+B+UMNyRJ3dPS+f0xqT2ArBhTIeQTIWdOPoejc0TQwAFL1LcqNf+qp7/oA3Cb1X3e+Pt",
  "3X1v2zRhst3WpOIefhs26KTOgWPfT3bdB9n39zbt5R7UatE/LRURjoWjRLhPih0/qk99xdc6Dzrhwe1dIqZL8ysO+TSmFxZJPQhY2ZfEsyvV1XEY0o6uHalC",
  "RJWZLJc8LxipbQoL3e9rO+Ezq7flIVAFoa+XcfYKlnuO+ir3FN6LwTCAqBePgmJlZEdeIZXTyO14LModRoaHHjSn3fjyidDfsXKxbvnNlq7OX57/SzMt2FOG",
  "qyGHZIS8FCEQjcDiDiYdvXEGeXVkaQhxUklejzRZtqaeIS5SiR1SE3JLWpUcgtBJKhn7Opt9OwKJhLzYqGCc9bIrjpfTRFFVNp5APBM26r+tv3SvIzsO+8j9",
  "rYTyz00sYA968Rm9GNy8yBaLbzAFU0zGsKjLrwKi20be8/Ybe/Z78+DzNXJKuvewck6vsfZydPo7w/hAaDPTGQVgCkC1AZHw67xD6Wg6trLp2XZJz/k1T+jt",
  "8y+8fnHCS68HEYY///npHU9seiP++IeSvHj39/DIyEzZsiVyciwUOlHwupS4FInpaoOsjGKsNqyGa2ZaDwT6S/7b+l/V9pk39PhuO6zc86CD6hPs8XRbTHO2",
  "uQXc8MADc6Y8+N+zxh68VxEEaNv75TT4qvds7n7p2x7NIUzQj+258NFBW9H6zeftWRx95FfoLrZLLQSBWBKjLW1yHkx3CSIgFuNFu5B6lVY1dnnDRye9e9Hv",
  "/lGHMu6mAYB+Jen64E08tedoGa0phxRpURM7Rn4ZsikbfYmiUA5AUgjZ9PoLr75ta4k1eTCG7v/DtPaffeJTPNX/gAQK1GOgAJnMOtnx+YiSTPJnJ1kkYzGO",
  "yaDqoo54HJ8iHYlJ3rBMJ3KIzKHtNG9OlThhpuxoF/qp+Tmu6w7mSJqrqrJHFjAexENjaOiOLe950REzDjhx5J85N29F/Nw5Y5raHXfsWfzBD7qCpzaiseBV",
  "YcfJZ/46uX4rentN3/OJtIqLhS2XnDO5Y3PjKBT4/US0D2p1T5kVbcVRjMoPzNRJn6Vz+u+CCP5VCeUFfw0B3pqSRy4JAZPw1FNFEBFKMxrowhgR1Z/hTGRE",
  "RfB27fFomzLiQB9jYCCy/8VEJHiY3l4Avf1K9OwuetoWX3P0+40Z/Ao6CrCBhghio1VNLD5irejI0hymAAMwgqpdh64pFxWO/vS1kGC74ZbOXBQEaPD5My7k",
  "oQ2LuaNsZCySr4ygomqylMKJIr6FVyQUCiaoys2Fjy07RvsveMYHwN0z2etOWAozupi7ip6tW0FAykpGU2vXrEuKVHY50t1JZCOIotGYyxx3SX3N+6h05JU4",
  "/cVcGNG8b4Jm6gTqci7U7VDUsTLWpoSCPNok8ekWjRXnSdh4BpYRjtU2S3vpzOLFF90MK2gllP9lNFmMMhpXaPX28rZWqM+6WwLQr8pLjjtuVsPa7sLjw6Mj",
  "C/vGOg85ZN0LsUt4wV7HCIhhsGoVMH169lnNnbvV8Vx6jZNYt45wwgmKvj6hZ81w3d6sOG8NYSCiL0aJZO6zTiQTJ5bbbXDVR95DNHSz6famwPOAah2aWOOK",
  "gAt+9A9ChQ31b4HXvWJLx+sun3X44esIgDyHikYVhIFepr4Bq9eeuZ/IusWk+j5qL8dmSAHAfh7iXCoAIw3UYC4tnXLNBViyxGLJM++S3IRNfQNWLzntFdI1",
  "XGFf3oX2IrSuUKshJMkq7Bze8T4lGXElS3px/uzY5FIqV5ioRpMjaxYng7DZDlozWQ5XEE8cxYKJsPFpp5Nn9ZIIVCNGTqwgYKAGMjI6BDH/Vd9j7hVtJ3zk",
  "8dYB8i+uetesoX90ED2/ByFo1ZL55oAJJgpbS3ateJYJZ0IFnef/OaMX3o0dLeFGb79pjr/h10fw0NOvCb3ya4s+TQnDEOqVIWNj94eF0qPtndO+snnBuT/q",
  "eVHPIACs7J/vHVB59kvErRHqGlcf+0r1Ckd61bGXqVd8vQkbLFbBhhGSP6Khfi/snnNN23Hn//i5Ld4MgutPfROH60+E572buzsJoUACVVixAHGkUproujj6",
  "VuIgtxyUF2mTNIlkCqquwZpraJbCkuH4XaR2pzF0mBykTswzSImvqbth5GrBMZ8Uyh6YgQYQVhsbOJBbeNaUT9PixX/a1iVgK/6frrLJFYFsFRb/nkEv6CVi",
  "HE//eWTm9IdWdA6t/zvwkldg0mve+Rg5svPbs0Ta/nllBSnShDxs+fqXd+/6zleovmUdFbtLOvaWI6rthxz298xTfkByJnnbN99Oj/36TUvneWNrPwRDH+AC",
  "7YL2MhDEWkkioSgTq0AkJjymXYdJVV/V9QlJO5lkusWxUoI0QYmbZN5dzom4DLlEwSBj3cZjLhubmalAmY0fQRNFgZH6sIWulmL5zsbuc7/RcVTfU//M69eK",
  "VrSilVTS6O/v5yXzolZ84mX3fA/zpit6//mHUZRcVjEqq+1Ec8bns03X3l6DuQOaJDK9529l/P6W10mw+UDUG+9T0d1MT5cfWVl7wGgtGi4pK4tGImhK7EjY",
  "OJLHiZxD1smoYrwqbSr7FHNyBOm+RTUGMqsoq0rmAaOsVpmKxUjzzVKE5gnsn8Tz79dG+L3abq/4dsdxhz6Zql/39pr/rTFLK1rRiv/Pk8q4BIO8P8K/qqqN",
  "0RbjfGD+WYksj14j1L9x096Fvz2yF/ziB+zYlllU7ngNmxhvXmqLuoVakKHjQlEohRnUN9a/UiIS66U2qEmP0SzxLsmiPtLAYqZIaZW9yOKZKfp99TD678Gx",
  "+2Ry52Ydrt8WTJ/2WOnMU39MRI1xcvrPgRneila0opVUWvEcFpkYiNAZE3Zsd399bvCjb7bxrnsdZAaf3kWq9R5M7nkjq7SjHngoFQxKRYfXgnjnIsBYLWXS",
  "S0623UV5OTIqKtAQVS34NRqrPcqbq4+js21QpkzZyH986puNV7x8S/GEI3+LMHxeoImtaEUrWkmlFc8BGLC1xJFPMv2MgQiBh4GBCWF/g79cM2XSdz7noy6T",
  "8LKX7or60L7YsM5grAarlmBVjSl0Srt/IvteGWE8NYMr3RJZF0TimQIxJKYRcuB3nOCftfjmSJWHqs8EUUVvL54LNLEVrWhFK6m04lmydVOu/nZKUKj280Df",
  "GuqdO5dilzshbMO/L5Vhzz/5MW7zd0MoosysynkIcSJDLwRiUZCvsnHjhvqGam/b5276se67r4+F+wJrZynWrNHWfqQVrWhFK6m8IBIKaWP5aa8O2FD78Zf9",
  "YrskbjIoJkfukrEa79q1innzog5h82YG7kt9wjCrbrBmLMBL5tyFad1vQrVhwWw09dVwEGAxLJkSCrzxyT692Upb94WFCysV/er7zP8GWKIVrWjFv0d4rY/g",
  "X8xkHhiQ2iUfeZdX+sM3NeDGYOWwBdT3hZ/rjfv6WHhvONFhnaocROQliyYg8Lix2sIVuZ+jvb1CAwNWP3HeL9AI3pSIzpFLgKfM0lUptb0lBKGa6ZPJ1O2S",
  "4JTTplHf5Sdq/xJGa8TVila0opVU/sUxd0AJrJaGF1NXHQW/6GH0qa9tueSkd9Cia+7DIoqtRnsJD8cmR1gtMUcnUk1ds2YK7v7MHEyaeQg2DU9BqQPo6vkb",
  "nn7qTpx6/mNEVANoYt2kkca3ALMYZQ8IJfJyUc2bhJEjks0hSAwhsECRA29a+QR7yilElaUnJF4PrYvailagNf5qxb9WPUCXv/8uTB98C2wxhFfyw83hoJqd",
  "loztecrnu9+422bkJNcI+tBTHbh32etQDw5FofwOQGaj6AOFUsRBaQCohZCqPsJ1+QJ6XnYDHfXeLa7ibyyHQlI5+16e0rYPag2Fepw0JJnoI1J4Mrm3jSjg",
  "mwAa+mjgSjp/6Rnae2iLEd+KVrSSSiv+dUklUlGuX/2hDxdmj34BSiGsMfCLBPUgQ/QEl6c9gtHNK1Ed3oxye4eUpr4d9bHduL1jZxgTkQytKgRWLIEtx7aP",
  "huGXCEKQwdpj9XrbUW1nn/aT1EsjsRuonHUKujuWIWiEEPKifMKp3QA0MkKjzIQsxiBzrMzsWYwOeYFpm184v/LjltRKK1rRSiqt+FdyUAhYt/Kh9im/O/ch",
  "M7u8I8ZEoR7DKwg8Y6AMmBLAxag7aERK/FITCyWw9QjqxbZvSpEkCgDyFGCB8RW+V5D1I6O10qwD205c9D+xOx2oUhH90hVT8cenHkFPZw+qjchKOIEXq0bi",
  "kyQg5dQvLnPniymTRc9g08Zf46JlrwRRC0Lcilb8fxzc+gj+hRmdoFjRyzMOeOlIWNzjY2i0MUoFI1BBEDCqoaAeWKnWQhkZDWWkHqLWsBitWw4FrKQwxGjz",
  "PXhkIGAYYvjMgBoUjA9oAXWp8eTOcnHT365N+fKViuj8+R596IwNCO1VUGZ4ZJN8kMiXEUX4NKEcUCDb6AuMBNairf0V4UVnvhmqGU+lFa1oRSuptOJ/ObH0",
  "DVhd0WtKR1/9rUB2PAejXOPOsoHnx3oopGxBbENitZGiimGDom9QKHphTRoyVPu2mEkXVzdWX1/1p7w+8Lpfh4Y5IKyHyzE4vBb1egkNMDZvfgIAUnnzVaus",
  "9vcz3nrgp7F+899hfA+INOojKLGmzpqcahZrqkYcyYoRWKyiVII3ao9vQYtb0YrW+KsVeOEs7Rs3nvxqbqstIQ3250ltbQg1QmapQeQIWYQM1etq/f8JpfxN",
  "bdvttvJRR/1lqz/3S1+abP/+h0PsE0/usmm/PS6ZdfiZoxF/njTnV372qS9DW+Hn6CqVpBYysyFHlDIahcWKLSQSqRxT/Lo0UPGL4OHh9dj7rf+H+t70hGtC",
  "1opWtKKVVFrxL5JqiUiPhNrXP7NXccPD+0utujMmz9hH2ZRp85YHtNp4JNzr9T8tvevDj0BtzDuBQW+/wcMA5q2x6F2hrjXAtv7ecNkVR5qweotwEHLdGhgv",
  "yj3iQIy1yZwrTjhCKkweY/2GBbTs2tWthX0rWtFKKq14AfqG5y9TvvC/98aF/r5rZylQkWZpF73//mmo1xl33bWeKksTv0a4sOKJkGjhlZ8822hwqaChHFqN",
  "pIgT5BdFQpRCjtd8vF/xPYtayNi46b107fXfaCWVVrQCLfJjK14AWT4mKGp/P2MBGNdXFAOq6AewZq6HNxxIKNUFa2cpLaoEzphrXzv4p7dTnXp5dKiEH97R",
  "JUyEdn+LLrvkiUaILzz9+rO/Qq+jqkaKwTn7AKqsDrW/36PTz/5k+KkrxsxQ9XK0l4oIaiGEvcyvi7IlvYMEExUwGOBya0nfila0OpVW/NtasF5/1f7QzScL",
  "+e/h9gJHsvMmgh6zAUwh6iyswg6OPhYKzip9/II7JnLYdC19G/2nvsqouY2n9uwo9VrIoWUIcyp9qZLBipVgPRFji4zfPTafvvzfLb5KK1rRSiqteOFeIoWq",
  "+uG5i/an9sk7Y9q0HqrX9kFt8x7c2f4qlAxQCxWKOtQUECrDLwDWRuRIogAChfELqIUIg8Ytw/958qk9L+oZnDCx9Pd7VKmEY19cvnPxsScv5wL3ouABYSiw",
  "GrMjAYjExl+i8H2VseoYv2Kfl9OhH/rThLIwrWhFK1pJpRUvDNa9Llu8FIXG+fAMYAPAL0cjKIsQ5FtYKsIrACN1WFMcJLG/gWd2QBDswgYevBJQDwOwIZiC",
  "F24afLD2wJ/e3Pm1L66bCKmVdhpECM85rc+IPQOd5VeiVAaChkJEYIUgYHjUgN9ZCJ56+rbCsk/1trqUVrQCLZ5KK16gMW+6KkAoya8BAUoFoNwejaDYB8j3",
  "YE0xGKk9GVblanTN/D/VBe/Y05x14QL+2Ln7sFfa1Vr+kB0d+x+Uyj68gieqNa+rZ+/yS3b/md5++ywsWUKqmiswaGDAan8/qyp7l1y5Apcue22j1ni/3TL4",
  "U63WCWwM/ALDM0ChrWA3bBiszZ7T3/xzWtGKVrQ6lVa8QE289LMXvkU2D56ltr6zesUp2qhvkELHhpD8m2tHnDQwderUoYmMvwDgXlX/pZd94kQ/5KU8qa0D",
  "WgS2rF+L/fbaBwf1bYAqtsYryXUeRBj7xNL9i5sHj+B640DxvdlK/EvpKZ9SWHzhfa2xVyta0YpW/JskFmdBXxx76KGdVNVvHpXF3QUpQKoa/a+/P0X5VS+5",
  "ZLdgydIb9Jxzvqo3XvPidOG/Db8/sTxOYsMvfjGp/q1vvTQHh25FK1rRilb8u5AjVxjtz48sFWDt7/f+UWJQBa10kktO1PJZmIu5+l4KUCuhtKIVrQCA/wun",
  "Ebb/SUMfSwAAAABJRU5ErkJggg=="
].join("");

// plugins/lawyer-sidebar/src/client/LawyerSidebar.tsx
var import_react9 = require("react");

// plugins/lawyer-sidebar/src/client/ContractReviewDialog.tsx
var import_react3 = require("react");

// plugins/lawyer-sidebar/src/client/FilePicker.tsx
var import_react2 = require("react"), import_jsx_runtime2 = require("react/jsx-runtime"), EMPTY_FILE_PICKER_VALUE = { paths: [], images: [], texts: [] }, IMAGE_MAX_BYTES = 5 * 1024 * 1024, IMAGE_MAX_COUNT = 20, TEXT_MAX_BYTES = 2 * 1024 * 1024, DIRECTORY_FILE_LIMIT = 60, SKIP_NAMES = /* @__PURE__ */ new Set(["Thumbs.db", "desktop.ini"]), SEARCH_DEBOUNCE_MS = 250, CANDIDATE_LIMIT = 8, ACCEPTED_IMAGE_TYPES = /* @__PURE__ */ new Set(["image/png", "image/jpeg", "image/webp", "image/gif"]);
function readAsDataURL(file) {
  return new Promise((resolve, reject) => {
    let reader = new FileReader();
    reader.onload = () => resolve(reader.result), reader.onerror = () => reject(reader.error ?? new Error(`\u8BFB\u53D6 ${file.name} \u5931\u8D25`)), reader.readAsDataURL(file);
  });
}
function readAsText(file) {
  return new Promise((resolve, reject) => {
    let reader = new FileReader();
    reader.onload = () => resolve(reader.result), reader.onerror = () => reject(reader.error ?? new Error(`\u8BFB\u53D6 ${file.name} \u5931\u8D25`)), reader.readAsText(file);
  });
}
function formatBytes(bytes) {
  return bytes < 1024 ? `${bytes} B` : bytes < 1024 * 1024 ? `${(bytes / 1024).toFixed(1)} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}
function basename(path) {
  let cut = Math.max(path.lastIndexOf("/"), path.lastIndexOf("\\"));
  return cut < 0 ? path : path.slice(cut + 1);
}
function isAbsolutePathLike(value) {
  return /^[a-zA-Z]:[\\/]/.test(value) || value.startsWith("/");
}
function normalizeReferencePath(path) {
  return path.trim().replace(/\\/g, "/").replace(/\/+$/u, "/").replace(/^\/+$/u, "/");
}
function isDirectoryReference(path) {
  return path.endsWith("/");
}
function entryFile(entry) {
  return new Promise((resolve, reject) => {
    entry.file(resolve, reject);
  });
}
function readEntryBatch(reader) {
  return new Promise((resolve, reject) => {
    reader.readEntries(resolve, reject);
  });
}
async function expandEntries(entries) {
  let files = [], truncated = !1, walk = async (entry, prefix) => {
    if (files.length >= DIRECTORY_FILE_LIMIT) {
      truncated = !0;
      return;
    }
    if (entry.name.startsWith(".") || SKIP_NAMES.has(entry.name)) return;
    if (entry.isFile) {
      let file = await entryFile(entry);
      if (files.length >= DIRECTORY_FILE_LIMIT) {
        truncated = !0;
        return;
      }
      files.push({ file, relativePath: `${prefix}${file.name}` });
      return;
    }
    let reader = entry.createReader();
    for (; ; ) {
      let batch = await readEntryBatch(reader);
      if (batch.length === 0) break;
      for (let child of batch) await walk(child, `${prefix}${entry.name}/`);
      if (files.length >= DIRECTORY_FILE_LIMIT) {
        truncated = !0;
        return;
      }
    }
  };
  for (let entry of entries) await walk(entry, "");
  return { files, truncated };
}
function uploadedRootDirectory(uploadedPath) {
  let marker = "/.lawyer-uploads/", index = uploadedPath.lastIndexOf(marker);
  if (index < 0) return;
  let rest = uploadedPath.slice(index + marker.length), firstSlash = rest.indexOf("/");
  if (!(firstSlash < 0))
    return `${uploadedPath.slice(0, index + marker.length)}${rest.slice(0, firstSlash)}/`;
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
  let [query, setQuery] = (0, import_react2.useState)("/"), [candidates, setCandidates] = (0, import_react2.useState)([]), [searching, setSearching] = (0, import_react2.useState)(!1), [searchUnavailable, setSearchUnavailable] = (0, import_react2.useState)(!1), [notice, setNotice] = (0, import_react2.useState)(""), [dragActive, setDragActive] = (0, import_react2.useState)(!1), [busy, setBusy] = (0, import_react2.useState)(!1), fileInput = (0, import_react2.useRef)(null), folderInput = (0, import_react2.useRef)(null);
  (0, import_react2.useEffect)(() => {
    let controller = new AbortController(), timer = window.setTimeout(() => {
      setSearching(!0), searchWorkspaceFiles(query, controller.signal).then(
        (result) => {
          controller.signal.aborted || (result === void 0 ? (setSearchUnavailable(!0), setCandidates([])) : (setSearchUnavailable(!1), setCandidates(result)), setSearching(!1));
        },
        () => {
          controller.signal.aborted || (setSearchUnavailable(!0), setCandidates([]), setSearching(!1));
        }
      );
    }, SEARCH_DEBOUNCE_MS);
    return () => {
      clearTimeout(timer), controller.abort();
    };
  }, [query, searchWorkspaceFiles]);
  let addPath = (path) => {
    let normalized = normalizeReferencePath(path);
    normalized === "" || normalized === "/" || onChange({ ...value, paths: value.paths.includes(normalized) ? value.paths : [...value.paths, normalized] });
  }, handleFiles = async (list, truncated = !1) => {
    let paths = [...value.paths], images = [...value.images], texts = [...value.texts], addPathLocal = (raw) => {
      let normalized = normalizeReferencePath(raw);
      if (!(normalized === "" || normalized === "/" || paths.includes(normalized)))
        return paths.push(normalized), normalized;
    }, nextImages = [], nextTexts = [], skipped = [], unresolved = [];
    for (let { file, relativePath } of list) {
      let displayName = relativePath !== "" ? relativePath : file.name, isImage = file.type !== "" && ACCEPTED_IMAGE_TYPES.has(file.type), isText = file.type === "text/plain" || /\.(?:txt|md)$/i.test(file.name);
      if (isImage) {
        if (file.size > IMAGE_MAX_BYTES) {
          skipped.push(`${displayName}\uFF08\u8D85\u8FC7 ${formatBytes(IMAGE_MAX_BYTES)}\uFF09`);
          continue;
        }
        if (images.length + nextImages.length >= IMAGE_MAX_COUNT) {
          skipped.push(`${displayName}\uFF08\u8D85\u8FC7 ${IMAGE_MAX_COUNT} \u5F20\u4E0A\u9650\uFF09`);
          continue;
        }
        let dataURL = await readAsDataURL(file);
        nextImages.push({
          name: displayName,
          mediaType: file.type,
          data: dataURL.slice(dataURL.indexOf(",") + 1),
          bytes: file.size
        });
      } else if (isText) {
        if (file.size > TEXT_MAX_BYTES) {
          skipped.push(`${displayName}\uFF08\u8D85\u8FC7 ${formatBytes(TEXT_MAX_BYTES)}\uFF09`);
          continue;
        }
        nextTexts.push({ name: displayName, content: await readAsText(file) });
      } else
        unresolved.push({
          file,
          relativePath,
          query: file.name.replace(/\.[^.]+$/, ""),
          fullName: file.name,
          fromDirectory: relativePath.includes("/")
        });
    }
    if (images.push(...nextImages), texts.push(...nextTexts), unresolved.length === 0) {
      (paths.length !== value.paths.length || images.length !== value.images.length || texts.length !== value.texts.length) && onChange({ paths, images, texts });
      let parts2 = [];
      truncated && parts2.push(`\u6587\u4EF6\u8FC7\u591A\uFF0C\u4EC5\u53D6\u524D ${DIRECTORY_FILE_LIMIT} \u4E2A`), skipped.length > 0 && parts2.push(`\u5DF2\u8DF3\u8FC7\uFF1A${skipped.join("\uFF1B")}`), setNotice(parts2.join("\u3002"));
      return;
    }
    setBusy(!0);
    let added = [], failed = [], manual = [], directoryRefs = /* @__PURE__ */ new Map();
    for (let item of unresolved) {
      if (!item.fromDirectory) {
        let indexHits;
        try {
          indexHits = await searchWorkspaceFiles(item.query, new AbortController().signal);
        } catch {
          indexHits = void 0;
        }
        let exact = (indexHits ?? []).filter(
          (candidate) => candidate.kind === "file" && basename(candidate.path).toLowerCase() === item.fullName.toLowerCase()
        );
        if (exact.length === 1) {
          addPathLocal(exact[0].path), added.push(`${item.fullName} \u2192 ${exact[0].path}`);
          continue;
        }
      }
      let uploadName = item.fromDirectory ? item.relativePath : item.fullName, uploaded = await readAsDataURL(item.file).then(
        (dataURL) => uploadWorkspaceFile(
          uploadName,
          dataURL.slice(dataURL.indexOf(",") + 1),
          new AbortController().signal
        ),
        (error) => new Error(`\u8BFB\u53D6 ${item.fullName} \u5931\u8D25\uFF1A${error instanceof Error ? error.message : String(error)}`)
      );
      if (typeof uploaded == "string") {
        let normalized = uploaded.replace(/\\/g, "/"), rootDir = item.fromDirectory ? uploadedRootDirectory(normalized) : void 0;
        rootDir !== void 0 ? directoryRefs.set(rootDir, (directoryRefs.get(rootDir) ?? 0) + 1) : (addPathLocal(normalized), added.push(`${item.fullName} \u2192 ${normalized}\uFF08\u5DF2\u590D\u5236\u8FDB\u5DE5\u4F5C\u533A\uFF09`));
      } else
        failed.push(`${item.relativePath !== "" ? item.relativePath : item.fullName}\uFF08${uploaded.message}\uFF09`), manual.push({ query: item.query, fullName: item.fullName });
    }
    setBusy(!1);
    for (let [dir, count] of directoryRefs)
      addPathLocal(dir), added.push(`\u5DF2\u52A0\u5165\u76EE\u5F55 ${dir}\uFF08\u542B ${count} \u4E2A\u6587\u4EF6\uFF0C\u5DF2\u590D\u5236\u8FDB\u5DE5\u4F5C\u533A\uFF09`);
    onChange({ paths, images, texts });
    let parts = [];
    added.length > 0 && parts.push(`\u5DF2\u52A0\u5165\uFF1A${added.join("\uFF1B")}`), failed.length > 0 && (setQuery(manual[0]?.query ?? query), parts.push(`\u4E0A\u4F20\u5931\u8D25\uFF1A${failed.join("\uFF1B")}\u2014\u2014\u53EF\u4ECE\u5019\u9009\u70B9\u9009\uFF0C\u6216\u7C98\u8D34\u5B8C\u6574\u8DEF\u5F84\u540E\u56DE\u8F66`)), skipped.length > 0 && parts.push(`\u5DF2\u8DF3\u8FC7\uFF1A${skipped.join("\uFF1B")}`), truncated && parts.push(`\u6587\u4EF6\u8FC7\u591A\uFF0C\u4EC5\u53D6\u524D ${DIRECTORY_FILE_LIMIT} \u4E2A`), setNotice(parts.join("\u3002"));
  }, onDrop = (event) => {
    event.preventDefault(), setDragActive(!1);
    let entries = Array.from(event.dataTransfer.items).map((item) => typeof item.webkitGetAsEntry == "function" ? item.webkitGetAsEntry() : null).filter((entry) => entry !== null);
    if (entries.length > 0) {
      expandEntries(entries).then((expanded) => {
        if (expanded.files.length === 0) {
          setNotice("\u6CA1\u6709\u53EF\u8BFB\u53D6\u7684\u6587\u4EF6\uFF08\u62D6\u5165\u5185\u5BB9\u4E0D\u542B\u6587\u4EF6\u6216\u6587\u4EF6\u5939\uFF09");
          return;
        }
        return handleFiles(expanded.files, expanded.truncated);
      });
      return;
    }
    let plain = Array.from(event.dataTransfer.files).filter((file) => !(file.type === "" && file.size === 0)).map((file) => ({ file, relativePath: file.name }));
    if (plain.length === 0) {
      setNotice('\u5F53\u524D\u6D4F\u89C8\u5668\u4E0D\u652F\u6301\u6587\u4EF6\u5939\u62D6\u5165\u2014\u2014\u8BF7\u4F7F\u7528"\u9009\u62E9\u6587\u4EF6\u5939"\u6309\u94AE\uFF0C\u6216\u9010\u4E2A\u62D6\u5165\u6587\u4EF6');
      return;
    }
    handleFiles(plain);
  }, onQueryKeyDown = (event) => {
    if (event.key !== "Enter") return;
    event.preventDefault();
    let entered = query.trim();
    isAbsolutePathLike(entered) && (addPath(entered), setQuery(""), setNotice(""));
  }, lockAll = disabled || busy;
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "lawyer-dialog__file-block", children: [
    /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("label", { className: "lawyer-dialog__label", children: [
      label,
      "\uFF08\u641C\u7D22\u5DE5\u4F5C\u533A \xB7 \u7C98\u8D34\u8DEF\u5F84 \xB7 \u62D6\u5165\u6587\u4EF6\u6216\u6574\u4E2A\u6587\u4EF6\u5939\uFF09"
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(
      "div",
      {
        className: `lawyer-dialog__file-zone${dragActive ? " lawyer-dialog__file-zone--active" : ""}`,
        onDragOver: (event) => {
          event.preventDefault(), setDragActive(!0);
        },
        onDragLeave: () => setDragActive(!1),
        onDrop,
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "lawyer-dialog__search-row", children: [
            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
              "input",
              {
                type: "text",
                className: "lawyer-dialog__search-input",
                placeholder: "\u8F93\u5165\u6587\u4EF6\u540D\u641C\u7D22\uFF0C\u6216\u7C98\u8D34\u5B8C\u6574\u8DEF\u5F84\u540E\u56DE\u8F66\uFF08\u76EE\u5F55\u4EE5 / \u7ED3\u5C3E\uFF09",
                value: query,
                onChange: (event) => setQuery(event.target.value),
                onKeyDown: onQueryKeyDown,
                disabled: lockAll
              }
            ),
            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
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
            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
              "button",
              {
                type: "button",
                className: "lawyer-dialog__browse",
                title: "\u9009\u62E9\u6587\u4EF6\u5939\uFF08\u9012\u5F52\u6536\u96C6\u5176\u4E2D\u7684\u6587\u4EF6\uFF0C\u4FDD\u7559\u76EE\u5F55\u7ED3\u6784\u590D\u5236\u8FDB\u5DE5\u4F5C\u533A\u540E\u6574\u76EE\u5F55\u5F15\u7528\uFF09",
                onClick: () => folderInput.current?.click(),
                disabled: lockAll,
                children: "\u9009\u62E9\u6587\u4EF6\u5939"
              }
            ),
            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
              "input",
              {
                ref: fileInput,
                type: "file",
                multiple: !0,
                accept: "image/png,image/jpeg,image/webp,image/gif,.txt,.md,.pdf,.doc,.docx",
                style: { display: "none" },
                onChange: (event) => {
                  handleFiles(Array.from(event.target.files ?? []).map((file) => ({ file, relativePath: file.name }))), event.target.value = "";
                },
                disabled: lockAll
              }
            ),
            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
              "input",
              {
                ref: folderInput,
                type: "file",
                multiple: !0,
                webkitdirectory: "",
                style: { display: "none" },
                onChange: (event) => {
                  handleFiles(Array.from(event.target.files ?? []).map((file) => ({ file, relativePath: file.webkitRelativePath !== "" ? file.webkitRelativePath : file.name }))), event.target.value = "";
                },
                disabled: lockAll
              }
            )
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("ul", { className: "lawyer-dialog__candidates", children: [
            (searching || busy) && /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("li", { className: "lawyer-dialog__candidate lawyer-dialog__candidate--hint", children: "\u641C\u7D22\u4E2D\u2026" }),
            !searching && !busy && searchUnavailable && /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("li", { className: "lawyer-dialog__candidate lawyer-dialog__candidate--hint", children: "\u65E0\u6CD5\u641C\u7D22\u5DE5\u4F5C\u533A\uFF08\u5F53\u524D\u6CA1\u6709\u6D3B\u52A8\u4F1A\u8BDD\uFF09\u2014\u2014\u53EF\u62D6\u5165\u56FE\u7247/\u6587\u672C/\u6587\u4EF6\u5939\uFF0C\u6216\u7C98\u8D34\u5B8C\u6574\u8DEF\u5F84\u540E\u56DE\u8F66" }),
            !searching && !busy && !searchUnavailable && candidates.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("li", { className: "lawyer-dialog__candidate lawyer-dialog__candidate--hint", children: "\u6CA1\u6709\u5339\u914D\u7684\u6587\u4EF6" }),
            !searching && !busy && !searchUnavailable && candidates.slice(0, CANDIDATE_LIMIT).map((candidate, index) => {
              if (candidate.kind === "directory") {
                let dirRef = `${candidate.path}/`, selected2 = value.paths.includes(dirRef);
                return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("li", { className: "lawyer-dialog__candidate-row", children: [
                  /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(
                    "button",
                    {
                      type: "button",
                      className: "lawyer-dialog__candidate lawyer-dialog__candidate--grow",
                      title: `\u8FDB\u5165 ${candidate.path}`,
                      onClick: () => setQuery(`${candidate.path}/`),
                      disabled: lockAll,
                      children: [
                        "\u{1F4C1} ",
                        basename(candidate.path),
                        "/"
                      ]
                    }
                  ),
                  /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
                    "button",
                    {
                      type: "button",
                      className: "lawyer-dialog__candidate-add",
                      title: `\u5F15\u7528\u6574\u4E2A\u76EE\u5F55 ${dirRef}`,
                      onClick: () => addPath(dirRef),
                      disabled: lockAll || selected2,
                      children: selected2 ? "\u2713 \u5DF2\u5F15\u7528" : "\uFF0B \u5F15\u7528\u76EE\u5F55"
                    }
                  )
                ] }, `dir-${index}`);
              }
              let selected = value.paths.includes(candidate.path);
              return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(
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
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("p", { className: "lawyer-dialog__drop-hint", children: dropHint })
        ]
      }
    ),
    value.paths.length + value.images.length + value.texts.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("ul", { className: "lawyer-dialog__files", children: [
      value.paths.map((path, index) => /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("li", { className: "lawyer-dialog__file", children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("span", { className: "lawyer-dialog__file-name", title: path, children: [
          isDirectoryReference(path) ? "\u{1F4C1}" : "\u{1F4C3}",
          " ",
          basename(path.replace(/\/$/u, "")),
          isDirectoryReference(path) ? "/" : ""
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
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
      value.images.map((image, index) => /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("li", { className: "lawyer-dialog__file", children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("span", { className: "lawyer-dialog__file-name", title: image.name, children: [
          "\u{1F5BC} ",
          image.name,
          "\uFF08",
          formatBytes(image.bytes),
          "\uFF09"
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
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
      value.texts.map((text2, index) => /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("li", { className: "lawyer-dialog__file", children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("span", { className: "lawyer-dialog__file-name", title: text2.name, children: [
          "\u{1F4C4} ",
          text2.name,
          "\uFF08",
          formatBytes(text2.content.length),
          "\uFF09"
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
          "button",
          {
            type: "button",
            className: "lawyer-dialog__file-remove",
            "aria-label": `\u79FB\u9664 ${text2.name}`,
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
    notice !== "" && /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("p", { className: "lawyer-dialog__notice", children: notice })
  ] });
}

// plugins/lawyer-sidebar/src/client/ContractReviewDialog.tsx
var import_jsx_runtime3 = require("react/jsx-runtime"), SKILL_CATEGORIES = [
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
], STANCE_OPTIONS = [
  "\u7532\u65B9",
  "\u4E59\u65B9",
  "\u4E19\u65B9\u6216\u5176\u4ED6\u5F53\u4E8B\u65B9",
  "\u4E0D\u6307\u5B9A\uFF08\u4EE5\u4E2D\u7ACB\u89C6\u89D2\u5168\u9762\u5BA1\u6838\uFF09"
], STRICTNESS_HINTS = {
  \u5BBD\u677E: "\u53EA\u62A5\u9AD8\u98CE\u9669\u4E0E\u6838\u5FC3\u6761\u6B3E\u95EE\u9898",
  \u5E38\u89C4: "\u6807\u51C6\u6846\u67B6\u5168\u9762\u5BA1\u6838",
  \u4E25\u683C: "\u9010\u6761\u6DF1\u6316\uFF0C\u6CD5\u89C4\u6838\u67E5\u5168\u8986\u76D6"
};
function ContractReviewDialog({
  onCancel,
  onSubmit,
  searchWorkspaceFiles,
  uploadWorkspaceFile,
  listInstalledSkills,
  profileEntry
}) {
  let [stance, setStance] = (0, import_react3.useState)(STANCE_OPTIONS[0]), [strictness, setStrictness] = (0, import_react3.useState)("\u5E38\u89C4"), [reviewerName, setReviewerName] = (0, import_react3.useState)(""), [files, setFiles] = (0, import_react3.useState)(EMPTY_FILE_PICKER_VALUE), [busy, setBusy] = (0, import_react3.useState)(!1), [demoNotice, setDemoNotice] = (0, import_react3.useState)(""), [demoArmed, setDemoArmed] = (0, import_react3.useState)(!1), replaySuffix = "", [advancedOpen, setAdvancedOpen] = (0, import_react3.useState)(!1), [skillEnabled, setSkillEnabled] = (0, import_react3.useState)({ review: !0, preprocess: !0, output: !0 }), [extraSkills, setExtraSkills] = (0, import_react3.useState)([]), [installedSkills, setInstalledSkills] = (0, import_react3.useState)(void 0), [skillsLoading, setSkillsLoading] = (0, import_react3.useState)(!1);
  (0, import_react3.useEffect)(() => {
    !advancedOpen || installedSkills !== void 0 || skillsLoading || (setSkillsLoading(!0), listInstalledSkills().then(
      (entries) => {
        setInstalledSkills(entries ?? []), setSkillsLoading(!1);
      },
      () => {
        setInstalledSkills([]), setSkillsLoading(!1);
      }
    ));
  }, [advancedOpen, installedSkills, skillsLoading, listInstalledSkills]);
  let selectableSkills = (installedSkills ?? []).filter(
    (entry) => !SKILL_CATEGORIES.some((category) => category.name === entry.name) && !extraSkills.includes(entry.name)
  ), loadDemo = void 0, submit = () => {
    setBusy(!0), onSubmit({
      stance,
      strictness,
      reviewerName: reviewerName.trim(),
      skills: { ...skillEnabled, extraSkills },
      paths: files.paths,
      images: files.images,
      texts: files.texts,
      ...demoArmed ? { demoReplay: !0 } : {}
    });
  };
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
    "div",
    {
      className: "lawyer-dialog-mask",
      role: "dialog",
      "aria-modal": "true",
      "aria-label": "\u53D1\u8D77\u5408\u540C\u5BA1\u6838",
      onClick: (event) => {
        event.target === event.currentTarget && onCancel();
      },
      children: /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "lawyer-dialog", children: [
        /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "lawyer-dialog__header", children: [
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("h2", { className: "lawyer-dialog__title", children: "\u53D1\u8D77\u5408\u540C\u5BA1\u6838" }),
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
        !1,
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("label", { className: "lawyer-dialog__label", htmlFor: "lawyer-stance", children: "\u6211\u65B9\u7ACB\u573A" }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
          "select",
          {
            id: "lawyer-stance",
            className: "lawyer-dialog__select",
            value: stance,
            onChange: (event) => setStance(event.target.value),
            disabled: busy,
            children: STANCE_OPTIONS.map((option) => /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("option", { value: option, children: option }, option))
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
          FilePicker,
          {
            label: "\u5408\u540C\u6587\u4EF6",
            dropHint: "\u4EFB\u610F\u5408\u540C\u6587\u4EF6\uFF08Word/PDF/\u56FE\u7247/\u6587\u672C\uFF09\u62D6\u5165\u5373\u53EF\uFF0C\u652F\u6301\u6574\u4E2A\u6587\u4EF6\u5939\u2014\u2014\u81EA\u52A8\u590D\u5236\u8FDB\u5DE5\u4F5C\u533A\u540E\u5F15\u7528",
            value: files,
            onChange: setFiles,
            disabled: busy,
            searchWorkspaceFiles,
            uploadWorkspaceFile
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "lawyer-dialog__label", children: "\u5BA1\u6838\u4E25\u683C\u7A0B\u5EA6" }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "lawyer-dialog__strictness", role: "radiogroup", "aria-label": "\u5BA1\u6838\u4E25\u683C\u7A0B\u5EA6", children: ["\u5BBD\u677E", "\u5E38\u89C4", "\u4E25\u683C"].map((option) => /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("label", { className: "lawyer-dialog__strictness-option", children: [
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
            "input",
            {
              type: "radio",
              name: "lawyer-strictness",
              checked: strictness === option,
              onChange: () => setStrictness(option),
              disabled: busy
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("span", { children: [
            /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "lawyer-dialog__strictness-name", children: option }),
            /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "lawyer-dialog__strictness-hint", children: STRICTNESS_HINTS[option] })
          ] })
        ] }, option)) }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("label", { className: "lawyer-dialog__label", htmlFor: "lawyer-reviewer", children: "\u4FEE\u8BA2\u4EBA\u7F72\u540D\uFF08docx \u5BA1\u9605\u7A3F\u7559\u75D5\u7528\uFF09" }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
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
        /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(
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
        advancedOpen && /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "lawyer-dialog__advanced", children: [
          SKILL_CATEGORIES.map((category) => /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("label", { className: "lawyer-dialog__skill-option", children: [
            /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
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
            /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("span", { children: [
              /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "lawyer-dialog__skill-category", children: category.label }),
              /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "lawyer-dialog__skill-name", children: category.name }),
              /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "lawyer-dialog__strictness-hint", children: category.hint })
            ] })
          ] }, category.key)),
          extraSkills.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("ul", { className: "lawyer-dialog__files", children: extraSkills.map((name, index) => /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("li", { className: "lawyer-dialog__file", children: [
            /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("span", { className: "lawyer-dialog__file-name", title: `\u9644\u52A0\u6280\u80FD\uFF1A${name}`, children: [
              "\u26A1 ",
              name
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
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
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "lawyer-dialog__search-row", children: /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(
            "select",
            {
              className: "lawyer-dialog__select",
              value: "",
              disabled: busy || skillsLoading || selectableSkills.length === 0,
              onChange: (event) => {
                let name = event.target.value;
                name !== "" && setExtraSkills((current) => [...current, name]), event.target.value = "";
              },
              children: [
                /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("option", { value: "", children: skillsLoading ? "\u6B63\u5728\u52A0\u8F7D\u5DF2\u5B89\u88C5\u6280\u80FD\u2026" : selectableSkills.length === 0 ? "\u6CA1\u6709\u66F4\u591A\u53EF\u6DFB\u52A0\u7684\u6280\u80FD" : "\u9009\u62E9\u8981\u52A0\u8F7D\u7684\u5DF2\u5B89\u88C5\u6280\u80FD\u2026" }),
                selectableSkills.map((entry) => /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("option", { value: entry.name, children: [
                  entry.name,
                  entry.modelInvocable ? "" : "\uFF08\u4EC5\u624B\u52BF\uFF09",
                  " \u2014 ",
                  entry.description.slice(0, 30)
                ] }, entry.name))
              ]
            }
          ) })
        ] }),
        profileEntry,
        /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "lawyer-dialog__actions", children: [
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("button", { type: "button", className: "lawyer-dialog__cancel", onClick: onCancel, disabled: busy, children: "\u53D6\u6D88" }),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("button", { type: "button", className: "lawyer-dialog__submit", onClick: submit, disabled: busy, children: busy ? "\u6B63\u5728\u53D1\u8D77\u2026" : `\u5F00\u59CB\u5BA1\u6838${replaySuffix}` })
        ] })
      ] })
    }
  );
}

// plugins/lawyer-sidebar/src/client/CaseAnalysisDialog.tsx
var import_react4 = require("react");
var import_jsx_runtime4 = require("react/jsx-runtime"), STANCE_OPTIONS2 = [
  "\u539F\u544A\u65B9",
  "\u88AB\u544A\u65B9",
  "\u4E0A\u8BC9\u65B9",
  "\u88AB\u4E0A\u8BC9\u65B9",
  "\u4E2D\u7ACB\u8BC4\u4F30\uFF08\u4E0D\u9884\u8BBE\u7ACB\u573A\uFF09"
], FOCUS_OPTIONS = [
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
  uploadWorkspaceFile,
  profileEntry
}) {
  let [stance, setStance] = (0, import_react4.useState)(STANCE_OPTIONS2[0]), [focus, setFocus] = (0, import_react4.useState)(FOCUS_OPTIONS.map((option) => option.key)), [files, setFiles] = (0, import_react4.useState)(EMPTY_FILE_PICKER_VALUE), [busy, setBusy] = (0, import_react4.useState)(!1), [demoNotice, setDemoNotice] = (0, import_react4.useState)(""), [demoArmed, setDemoArmed] = (0, import_react4.useState)(!1), replaySuffix = "", loadDemo = void 0, toggleFocus = (key, checked) => {
    setFocus((current) => checked ? [...current, key] : current.filter((item) => item !== key));
  }, submit = () => {
    setBusy(!0), onSubmit({
      stance,
      focus,
      paths: files.paths,
      images: files.images,
      texts: files.texts,
      ...demoArmed ? { demoReplay: !0 } : {}
    });
  };
  return /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
    "div",
    {
      className: "lawyer-dialog-mask",
      role: "dialog",
      "aria-modal": "true",
      "aria-label": "\u53D1\u8D77\u6848\u4EF6\u5206\u6790",
      onClick: (event) => {
        event.target === event.currentTarget && onCancel();
      },
      children: /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "lawyer-dialog", children: [
        /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "lawyer-dialog__header", children: [
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("h2", { className: "lawyer-dialog__title", children: "\u53D1\u8D77\u6848\u4EF6\u5206\u6790" }),
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
        !1,
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("label", { className: "lawyer-dialog__label", htmlFor: "lawyer-case-stance", children: "\u6211\u65B9\u7ACB\u573A" }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
          "select",
          {
            id: "lawyer-case-stance",
            className: "lawyer-dialog__select",
            value: stance,
            onChange: (event) => setStance(event.target.value),
            disabled: busy,
            children: STANCE_OPTIONS2.map((option) => /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("option", { value: option, children: option }, option))
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { className: "lawyer-dialog__label", children: "\u5206\u6790\u4FA7\u91CD\uFF08\u5168\u90E8\u53D6\u6D88\u65F6\u5C06\u7531 AI \u5148\u4E0E\u4F60\u786E\u8BA4\u8303\u56F4\uFF09" }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "lawyer-dialog__strictness", children: FOCUS_OPTIONS.map((option) => /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("label", { className: "lawyer-dialog__skill-option", children: [
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
            "input",
            {
              type: "checkbox",
              checked: focus.includes(option.key),
              onChange: (event) => toggleFocus(option.key, event.target.checked),
              disabled: busy
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("span", { children: [
            /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { className: "lawyer-dialog__skill-name", children: option.label }),
            /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { className: "lawyer-dialog__strictness-hint", children: option.hint })
          ] })
        ] }, option.key)) }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
          FilePicker,
          {
            label: "\u6848\u4EF6\u6750\u6599",
            dropHint: "\u8D77\u8BC9\u72B6\u3001\u5408\u540C\u3001\u8BC1\u636E\u3001\u804A\u5929\u8BB0\u5F55\u7B49\uFF08Word/PDF/\u56FE\u7247/\u6587\u672C\uFF09\u62D6\u5165\u5373\u53EF\uFF0C\u652F\u6301\u6574\u4E2A\u6587\u4EF6\u5939\u2014\u2014\u81EA\u52A8\u590D\u5236\u8FDB\u5DE5\u4F5C\u533A\u540E\u5F15\u7528",
            value: files,
            onChange: setFiles,
            disabled: busy,
            searchWorkspaceFiles,
            uploadWorkspaceFile
          }
        ),
        profileEntry,
        /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "lawyer-dialog__actions", children: [
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("button", { type: "button", className: "lawyer-dialog__cancel", onClick: onCancel, disabled: busy, children: "\u53D6\u6D88" }),
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("button", { type: "button", className: "lawyer-dialog__submit", onClick: submit, disabled: busy, children: busy ? "\u6B63\u5728\u53D1\u8D77\u2026" : `\u5F00\u59CB\u5206\u6790${replaySuffix}` })
        ] })
      ] })
    }
  );
}

// plugins/lawyer-sidebar/src/client/DocGenerationDialog.tsx
var import_react5 = require("react");
var import_jsx_runtime5 = require("react/jsx-runtime"), DOC_TYPES = [
  { type: "\u6C11\u4E8B\u8D77\u8BC9\u72B6", hint: "\u5F53\u4E8B\u4EBA\u6BB5 + \u8BC9\u8BBC\u8BF7\u6C42\u9010\u9879\u7F16\u53F7 + \u4E8B\u5B9E\u4E0E\u7406\u7531" },
  { type: "\u6C11\u4E8B\u7B54\u8FA9\u72B6", hint: "\u9488\u5BF9\u8D77\u8BC9\u72B6\u9010\u9879\u8868\u6001\u4E0E\u7B54\u8FA9" },
  { type: "\u4EE3\u7406\u8BCD", hint: "\u56F4\u7ED5\u4E89\u8BAE\u7126\u70B9\u5206\u70B9\u8BBA\u8BC1" },
  { type: "\u6CD5\u5F8B\u610F\u89C1\u4E66", hint: "\u59D4\u6258\u4E8B\u9879\u7684\u6CD5\u5F8B\u5206\u6790\u4E0E\u7ED3\u8BBA\u610F\u89C1" }
], PARTY_ROLE_OPTIONS = ["\u539F\u544A", "\u88AB\u544A", "\u7B2C\u4E09\u4EBA"];
function DocGenerationDialog({
  onCancel,
  onSubmit,
  searchWorkspaceFiles,
  uploadWorkspaceFile,
  profileEntry
}) {
  let [docType, setDocType] = (0, import_react5.useState)(DOC_TYPES[0].type), [partyRole, setPartyRole] = (0, import_react5.useState)(PARTY_ROLE_OPTIONS[0]), [notes, setNotes] = (0, import_react5.useState)(""), [files, setFiles] = (0, import_react5.useState)(EMPTY_FILE_PICKER_VALUE), [busy, setBusy] = (0, import_react5.useState)(!1), [demoNotice, setDemoNotice] = (0, import_react5.useState)(""), [demoArmed, setDemoArmed] = (0, import_react5.useState)(!1), replaySuffix = "", demoLabel = "", loadDemo = void 0, submit = () => {
    setBusy(!0), onSubmit({
      docType,
      partyRole,
      notes: notes.trim(),
      paths: files.paths,
      images: files.images,
      texts: files.texts,
      ...demoArmed ? { demoReplay: !0 } : {}
    });
  };
  return /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
    "div",
    {
      className: "lawyer-dialog-mask",
      role: "dialog",
      "aria-modal": "true",
      "aria-label": "\u53D1\u8D77\u6848\u4EF6\u6587\u4E66\u751F\u6210",
      onClick: (event) => {
        event.target === event.currentTarget && onCancel();
      },
      children: /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { className: "lawyer-dialog", children: [
        /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { className: "lawyer-dialog__header", children: [
          /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("h2", { className: "lawyer-dialog__title", children: "\u53D1\u8D77\u6848\u4EF6\u6587\u4E66\u751F\u6210" }),
          /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
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
        !1,
        /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("span", { className: "lawyer-dialog__label", children: "\u6587\u4E66\u7C7B\u578B" }),
        /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("div", { className: "lawyer-dialog__strictness", role: "radiogroup", "aria-label": "\u6587\u4E66\u7C7B\u578B", children: DOC_TYPES.map((option) => /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("label", { className: "lawyer-dialog__strictness-option", children: [
          /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
            "input",
            {
              type: "radio",
              name: "lawyer-doc-type",
              checked: docType === option.type,
              onChange: () => {
                setDocType(option.type), setDemoNotice("");
              },
              disabled: busy
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("span", { children: [
            /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("span", { className: "lawyer-dialog__strictness-name", children: option.type }),
            /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("span", { className: "lawyer-dialog__strictness-hint", children: option.hint })
          ] })
        ] }, option.type)) }),
        /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("label", { className: "lawyer-dialog__label", htmlFor: "lawyer-party-role", children: "\u6211\u65B9\u5F53\u4E8B\u4EBA\u8EAB\u4EFD" }),
        /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
          "select",
          {
            id: "lawyer-party-role",
            className: "lawyer-dialog__select",
            value: partyRole,
            onChange: (event) => setPartyRole(event.target.value),
            disabled: busy,
            children: PARTY_ROLE_OPTIONS.map((option) => /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("option", { value: option, children: option }, option))
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("label", { className: "lawyer-dialog__label", htmlFor: "lawyer-doc-notes", children: "\u8865\u5145\u8BF4\u660E\uFF08\u53EF\u9009\uFF09" }),
        /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
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
        /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
          FilePicker,
          {
            label: "\u6848\u4EF6\u6750\u6599",
            dropHint: "\u8D77\u8BC9\u72B6\u3001\u5408\u540C\u3001\u8BC1\u636E\u3001\u804A\u5929\u8BB0\u5F55\u7B49\uFF08Word/PDF/\u56FE\u7247/\u6587\u672C\uFF09\u62D6\u5165\u5373\u53EF\uFF0C\u652F\u6301\u6574\u4E2A\u6587\u4EF6\u5939\u2014\u2014\u81EA\u52A8\u590D\u5236\u8FDB\u5DE5\u4F5C\u533A\u540E\u5F15\u7528",
            value: files,
            onChange: setFiles,
            disabled: busy,
            searchWorkspaceFiles,
            uploadWorkspaceFile
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("p", { className: "lawyer-dialog__drop-hint", children: "\u5F53\u4E8B\u4EBA\u59D3\u540D\u3001\u8BC1\u4EF6\u53F7\u3001\u4F4F\u5740\u3001\u6CD5\u9662\u540D\u79F0\u7B49\u672A\u63D0\u4F9B\u4FE1\u606F\uFF0C\u5C06\u5728\u6587\u4E66\u4E2D\u7559\u3010\u5F85\u586B\uFF1A\u2026\u3011\u5360\u4F4D\uFF0C\u4E0D\u4F1A\u7F16\u9020\u3002" }),
        profileEntry,
        /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { className: "lawyer-dialog__actions", children: [
          /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("button", { type: "button", className: "lawyer-dialog__cancel", onClick: onCancel, disabled: busy, children: "\u53D6\u6D88" }),
          /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("button", { type: "button", className: "lawyer-dialog__submit", onClick: submit, disabled: busy, children: busy ? "\u6B63\u5728\u53D1\u8D77\u2026" : `\u5F00\u59CB\u751F\u6210${replaySuffix}` })
        ] })
      ] })
    }
  );
}

// plugins/lawyer-sidebar/src/client/CustomEntryDialog.tsx
var import_react6 = require("react");
var import_jsx_runtime6 = require("react/jsx-runtime");
function asText(value) {
  return typeof value == "string" ? value : "";
}
function asList(value) {
  return Array.isArray(value) ? value : [];
}
var EMPTY_FILES = { paths: [], images: [], texts: [] };
function asFiles(value) {
  return value !== void 0 && isFilesValue(value) ? value : EMPTY_FILES;
}
function FieldControl({
  field,
  value,
  disabled,
  onChange,
  searchWorkspaceFiles,
  uploadWorkspaceFile
}) {
  let options = field.options ?? [], inputId = `lawyer-custom-field-${field.id}`;
  return /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { className: "lawyer-dialog__field", children: [
    field.type !== "files" && /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("label", { className: "lawyer-dialog__label", htmlFor: inputId, children: field.label }),
    field.type === "text" && /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
      "input",
      {
        id: inputId,
        type: "text",
        className: "lawyer-dialog__input",
        value: asText(value),
        placeholder: field.placeholder ?? "",
        disabled,
        onChange: (event) => onChange(event.target.value)
      }
    ),
    field.type === "textarea" && /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
      "textarea",
      {
        id: inputId,
        className: "lawyer-dialog__textarea",
        value: asText(value),
        placeholder: field.placeholder ?? "",
        disabled,
        onChange: (event) => onChange(event.target.value)
      }
    ),
    field.type === "select" && /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
      "select",
      {
        id: inputId,
        className: "lawyer-dialog__select",
        value: asText(value),
        disabled,
        onChange: (event) => onChange(event.target.value),
        children: options.map((option) => /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("option", { value: option, children: option }, option))
      }
    ),
    field.type === "radio" && /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("div", { className: "lawyer-dialog__options", children: options.map((option) => /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("label", { className: "lawyer-dialog__option", children: [
      /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
        "input",
        {
          type: "radio",
          name: inputId,
          value: option,
          checked: asText(value) === option,
          disabled,
          onChange: () => onChange(option)
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("span", { children: option })
    ] }, option)) }),
    field.type === "checkbox" && /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("div", { className: "lawyer-dialog__options", children: options.map((option) => /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("label", { className: "lawyer-dialog__option", children: [
      /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
        "input",
        {
          type: "checkbox",
          value: option,
          checked: asList(value).includes(option),
          disabled,
          onChange: (event) => {
            let current = asList(value);
            onChange(event.target.checked ? [...current, option] : current.filter((item) => item !== option));
          }
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("span", { children: option })
    ] }, option)) }),
    field.type === "files" && /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
      FilePicker,
      {
        label: field.label,
        dropHint: field.dropHint ?? "",
        value: asFiles(value),
        onChange,
        disabled,
        searchWorkspaceFiles,
        uploadWorkspaceFile
      }
    ),
    field.hint !== void 0 && field.hint !== "" && /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("p", { className: "lawyer-dialog__notice", children: field.hint })
  ] });
}
function CustomEntryDialog({
  entry,
  onCancel,
  onSubmit,
  searchWorkspaceFiles,
  uploadWorkspaceFile
}) {
  let fields = effectiveFields(entry), [values, setValues] = (0, import_react6.useState)(() => initialValues(fields)), [busy, setBusy] = (0, import_react6.useState)(!1), update = (id, value) => {
    setValues((previous) => ({ ...previous, [id]: value }));
  }, submit = () => {
    setBusy(!0), onSubmit({ entry, values });
  }, gestures = [
    ...entry.legal !== void 0 ? [entry.legal.adapter] : [],
    entry.skill,
    ...entry.extraSkills ?? []
  ].map((name) => `/${name}`).join(" ");
  return /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
    "div",
    {
      className: "lawyer-dialog-mask",
      role: "dialog",
      "aria-modal": "true",
      "aria-label": `\u53D1\u8D77${entry.label}`,
      onClick: (event) => {
        event.target === event.currentTarget && onCancel();
      },
      children: /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { className: "lawyer-dialog", children: [
        /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { className: "lawyer-dialog__header", children: [
          /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("h2", { className: "lawyer-dialog__title", children: [
            "\u53D1\u8D77",
            entry.label
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
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
        /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("p", { className: "lawyer-dialog__notice", children: [
          "\u81EA\u5B9A\u4E49\u529F\u80FD\u2014\u2014\u5C06\u4EE5 ",
          gestures,
          " \u6280\u80FD\u624B\u52BF\u53D1\u8D77",
          entry.agentPreset === void 0 || entry.agentPreset === "" ? "\u5F53\u524D\u6A21\u5F0F\u7684\u4F1A\u8BDD" : `\u300C${entry.agentPreset}\u300D\u4F1A\u8BDD`
        ] }),
        entry.legal !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("p", { className: "lawyer-dialog__notice", children: [
          "\u6CD5\u5F8B\u4E8B\u9879\uFF1Aclaude-for-legal-ZH \xB7 ",
          entry.legal.domain,
          entry.legal.skills.length > 0 ? `\uFF08${entry.legal.skills.map((name) => `/${name}`).join(" ")}\uFF09` : "\uFF08\u7531 adapter \u6309\u6750\u6599\u8DEF\u7531\u539F\u59CB\u6280\u80FD\uFF09",
          "\u2014\u2014\u6309\u9886\u57DF\u753B\u50CF\u4E0E\u4E09\u5C42\u8C03\u7528\u89C4\u7A0B\u6267\u884C"
        ] }),
        entry.purpose !== void 0 && entry.purpose !== "" && /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("p", { className: "lawyer-dialog__notice", children: [
          "\u4EFB\u52A1\u76EE\u6807\uFF1A",
          entry.purpose
        ] }),
        entry.mcp !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("p", { className: "lawyer-dialog__notice", children: [
          "MCP \u504F\u597D\uFF1A",
          entry.mcp.preset === "yuandian" ? "\u5143\u5178 \xB7 \u6CD5\u89C4\u68C0\u7D22" : entry.mcp.note ?? "\u81EA\u5B9A\u4E49"
        ] }),
        fields.map((field) => /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
          FieldControl,
          {
            field,
            value: values[field.id],
            disabled: busy,
            onChange: (value) => update(field.id, value),
            searchWorkspaceFiles,
            uploadWorkspaceFile
          },
          field.id
        )),
        /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { className: "lawyer-dialog__actions", children: [
          /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("button", { type: "button", className: "lawyer-dialog__cancel", onClick: onCancel, disabled: busy, children: "\u53D6\u6D88" }),
          /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("button", { type: "button", className: "lawyer-dialog__submit", onClick: submit, disabled: busy, children: busy ? "\u6B63\u5728\u53D1\u8D77\u2026" : `\u5F00\u59CB${entry.label}` })
        ] })
      ] })
    }
  );
}

// plugins/lawyer-sidebar/src/client/PracticeProfileDialog.tsx
var import_react7 = require("react");

// plugins/lawyer-sidebar/src/client/profileMarkdown.ts
var PLACEHOLDER = "[PLACEHOLDER]", GENERATED_MARKER_QUICK = "\u7531\u6478\u9C7C\u5DE5\u4F5C\u7AD9\u300C\u5B9E\u52A1\u753B\u50CF \xB7 \u5FEB\u901F\u914D\u7F6E\u300D\u4E8E", GENERATED_MARKER_FULL = "\u7531\u6478\u9C7C\u5DE5\u4F5C\u7AD9\u300C\u5B9E\u52A1\u753B\u50CF \xB7 \u5B8C\u6574\u95EE\u5377\u300D\u4E8E", GENERATED_MARKER = "\u7531\u6478\u9C7C\u5DE5\u4F5C\u7AD9\u300C\u5B9E\u52A1\u753B\u50CF \xB7 ";
function fieldLine(label, value) {
  return `**${label}\uFF1A** ${value}`;
}
function escapeRegExp(text2) {
  return text2.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function today() {
  let now = /* @__PURE__ */ new Date(), month = String(now.getMonth() + 1).padStart(2, "0"), day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}
function renderProfileMarkdown(title, fields, values, source = "quick") {
  let groups = [], linesByGroup = /* @__PURE__ */ new Map();
  for (let field of fields) {
    let bucket = linesByGroup.get(field.group);
    bucket === void 0 && (bucket = [], linesByGroup.set(field.group, bucket), groups.push(field.group));
    let raw = values[field.id]?.trim() ?? "";
    bucket.push(fieldLine(field.label, raw === "" ? PLACEHOLDER : raw));
  }
  let marker = source === "full" ? GENERATED_MARKER_FULL : GENERATED_MARKER_QUICK, blocks = [
    `# ${title}`,
    "",
    `*${marker} ${today()} \u751F\u6210\u3002\u672C\u5DE5\u4F5C\u53F0\u6240\u6709\u6CD5\u5F8B\u529F\u80FD\u5728\u52A8\u7B14\u524D\u90FD\u4F1A\u8BFB\u53D6\u5B83\uFF1B\u53EF\u968F\u65F6\u5728\u53F3\u4FA7\u680F\u300C\u5B9E\u52A1\u753B\u50CF\u300D\u4E2D\u4FEE\u6539\uFF0C\u6216\u76F4\u63A5\u7F16\u8F91\u672C\u6587\u4EF6\u3002*`
  ];
  for (let group of groups)
    blocks.push("", "---", "", `## ${group}`, ""), blocks.push(...linesByGroup.get(group) ?? []);
  return `${blocks.join(`
`)}
`;
}
function parseProfileFields(content, fields) {
  let values = {}, lines = content.split(/\r?\n/);
  for (let field of fields) {
    let pattern = new RegExp(`^\\*\\*${escapeRegExp(field.label)}\uFF1A\\*\\*\\s*(.*)$`);
    for (let line of lines) {
      let matched = pattern.exec(line.trim());
      if (matched === null) continue;
      let value = matched[1].trim();
      value !== "" && value !== PLACEHOLDER && (values[field.id] = value);
      break;
    }
  }
  return values;
}
function isFormGenerated(content) {
  return content.includes(GENERATED_MARKER);
}

// plugins/lawyer-sidebar/src/client/PracticeProfileDialog.tsx
var import_jsx_runtime7 = require("react/jsx-runtime"), IDENTITY_FIELD = {
  "commercial-legal": "practiceSetting",
  "litigation-legal": "litigationRole"
}, IDENTITY_CARDS = [
  {
    identity: "lawyer",
    label: "\u6267\u4E1A\u5F8B\u5E08",
    hint: "\u5728\u5F8B\u6240\u6267\u4E1A\u6216\u72EC\u7ACB\u6267\u4E1A\uFF0C\u670D\u52A1\u591A\u4E2A\u5BA2\u6237\u3002\u4F1A\u591A\u95EE\u4E8B\u9879\u9694\u79BB\u3001\u6536\u8D39\u6A21\u5F0F\u3001\u5BA2\u6237\u6C47\u62A5\u4E0E\u5229\u76CA\u51B2\u7A81\u6392\u67E5\u3002",
    seeds: { "commercial-legal": "\u4E2A\u4EBA\u6267\u4E1A", "litigation-legal": "\u5F8B\u6240\u5F8B\u5E08" }
  },
  {
    identity: "inhouse",
    label: "\u516C\u53F8\u6CD5\u52A1",
    hint: "\u5728\u4E00\u5BB6\u516C\u53F8\u91CC\u505A\u6CD5\u52A1\uFF0C\u53EA\u670D\u52A1\u672C\u5355\u4F4D\u3002\u4F1A\u591A\u95EE\u5BA1\u6279\u4E0A\u62A5\u94FE\u3001\u91CD\u5927\u6027\u9608\u503C\u3001\u548C\u89E3\u6743\u9650\u3001\u4FDD\u9669\u8986\u76D6\u4E0E\u5916\u90E8\u5F8B\u5E08\u5E93\u3002",
    seeds: { "commercial-legal": "\u4F01\u4E1A\u6CD5\u52A1", "litigation-legal": "\u4F01\u4E1A\u6CD5\u52A1" }
  }
], INTERVIEW_MODES = [
  {
    mode: "quick",
    label: "\u5F00\u59CB 2 \u5206\u949F\u5FEB\u901F\u914D\u7F6E",
    hint: "\u89D2\u8272\u3001\u6267\u4E1A\u573A\u666F\u3001\u7BA1\u8F96\u4E0E\u5BA1\u67E5\u65B9\u5411\uFF0C\u52A0\u4E0A\u5BA1\u67E5\u6307\u5F15\u3001\u4E0A\u62A5\u9608\u503C\u3001\u8D23\u4EFB\u4E0A\u9650\u3001\u884C\u6587\u98CE\u683C\u7684\u5DE5\u4F5C\u9ED8\u8BA4\u503C",
    primary: !0
  },
  {
    mode: "full",
    label: "\u5F00\u59CB 15 \u5206\u949F\u5B8C\u6574\u8BBF\u8C08",
    hint: "\u771F\u5B9E\u7684\u5BA1\u67E5\u6307\u5F15\u7ACB\u573A\uFF08\u6309\u65B9\u5411\u6821\u51C6\uFF09\u3001deal-breaker\u3001\u5E26\u91D1\u989D\u9608\u503C\u7684\u4E0A\u62A5\u77E9\u9635\uFF0C\u4EE5\u53CA\u4ECE\u5DF2\u7B7E\u7F72\u534F\u8BAE\u63D0\u53D6\u7684\u5B9E\u9645\u7ACB\u573A",
    primary: !0
  },
  {
    mode: "redo",
    label: "\u91CD\u65B0\u8BBF\u8C08\uFF08--redo\uFF09",
    hint: "\u753B\u50CF\u5DF2\u5B58\u5728\u65F6\u91CD\u8DD1\u4E00\u904D\uFF0C\u8986\u76D6\u524D\u5148\u5C55\u793A\u4E0E\u65E7\u7248\u7684\u5DEE\u5F02",
    primary: !1
  },
  {
    mode: "integrations",
    label: "\u4EC5\u91CD\u65B0\u68C0\u6D4B\u96C6\u6210",
    hint: "\u53EA\u68C0\u6D4B MCP \u5DE5\u5177\u4E0E\u6587\u4EF6\u8BBF\u95EE\u7B49\u96C6\u6210\u7684\u5B9E\u9645\u8FDE\u63A5\u72B6\u6001\u5E76\u6C47\u62A5\uFF0C\u4E0D\u91CD\u8DD1\u8BBF\u8C08",
    primary: !1
  }
];
function PracticeProfileDialog({
  initialDomain,
  initialTab,
  onCancel,
  onSaved,
  onStartInterview,
  profileApi,
  customDomains,
  dismissedDomains,
  onRestoreGuide
}) {
  let [domain, setDomain] = (0, import_react7.useState)(initialDomain ?? PRIMARY_PROFILE_DOMAINS[0]), [tab, setTab] = (0, import_react7.useState)(initialTab ?? "quick"), [stepIndex, setStepIndex] = (0, import_react7.useState)(0), [moreOpen, setMoreOpen] = (0, import_react7.useState)(!1), [status, setStatus] = (0, import_react7.useState)(null), [values, setValues] = (0, import_react7.useState)({}), [raw, setRaw] = (0, import_react7.useState)(""), [loading, setLoading] = (0, import_react7.useState)(!0), [saving, setSaving] = (0, import_react7.useState)(!1), [error, setError] = (0, import_react7.useState)(""), keepInitialTab = (0, import_react7.useRef)(initialTab !== void 0), meta = findProfileDomain(domain), fields = (0, import_react7.useMemo)(() => profileFieldsFor(domain), [domain]), identity = (0, import_react7.useMemo)(() => identityFor(domain, values), [domain, values]), fullFields = (0, import_react7.useMemo)(() => fullProfileFieldsFor(domain, values), [domain, values]), allSteps = (0, import_react7.useMemo)(() => profileSteps(fullFields ?? []), [fullFields]), steps = (0, import_react7.useMemo)(() => visibleSteps(allSteps, domain, values), [allSteps, domain, values]), safeIndex = Math.min(stepIndex, Math.max(0, steps.length - 1)), currentStep = steps[safeIndex], stepFields = (0, import_react7.useMemo)(
    () => currentStep === void 0 ? [] : (fullFields ?? []).filter((field) => field.step === currentStep),
    [fullFields, currentStep]
  );
  (0, import_react7.useEffect)(() => {
    setStepIndex(0);
  }, [identity]);
  let customOnly = (0, import_react7.useMemo)(
    () => customDomains.filter(
      (item) => !PRIMARY_PROFILE_DOMAINS.includes(item) && findProfileDomain(item) !== void 0
    ),
    [customDomains]
  ), moreDomains = (0, import_react7.useMemo)(
    () => PROFILE_DOMAINS.filter(
      (item) => !PRIMARY_PROFILE_DOMAINS.includes(item.domain) && !customOnly.includes(item.domain)
    ),
    [customOnly]
  );
  (0, import_react7.useEffect)(() => {
    let cancelled = !1, controller = new AbortController();
    return setLoading(!0), setError(""), (async () => {
      let [nextStatus, content] = await Promise.all([
        profileApi.status(domain, controller.signal),
        profileApi.read(domain, controller.signal)
      ]);
      if (cancelled) return;
      if (nextStatus instanceof Error) {
        setError(nextStatus.message), setLoading(!1);
        return;
      }
      setStatus(nextStatus);
      let text2 = content instanceof Error ? "" : content.content;
      setRaw(text2);
      let quickValues = parseProfileFields(text2, fields), table = fullProfileFieldsFor(domain, quickValues);
      setValues(table === void 0 ? quickValues : { ...quickValues, ...parseProfileFields(text2, table) }), setStepIndex(0), keepInitialTab.current ? keepInitialTab.current = !1 : setTab(text2 === "" || isFormGenerated(text2) ? "quick" : "raw"), setLoading(!1);
    })(), () => {
      cancelled = !0, controller.abort();
    };
  }, [domain, fields, profileApi]);
  let persist = async (content) => {
    setSaving(!0), setError("");
    let written = await profileApi.write(domain, content);
    if (setSaving(!1), written instanceof Error) {
      setError(written.message);
      return;
    }
    let refreshed = await profileApi.status(domain);
    refreshed instanceof Error || setStatus(refreshed), setRaw(content), onSaved?.(domain);
  }, saveQuick = () => {
    let table = mergeFieldsForSave(fields, fullFields ?? [], values);
    persist(renderProfileMarkdown(`${meta?.label ?? domain}\u5B9E\u52A1\u753B\u50CF`, table, values));
  }, saveFull = () => {
    if (fullFields === void 0) return;
    let table = mergeFieldsForSave(fullFields, fields, values);
    persist(renderProfileMarkdown(`${meta?.label ?? domain}\u5B9E\u52A1\u753B\u50CF`, table, values, "full"));
  }, renderField = (field) => /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "lawyer-profile__field", children: [
    /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("label", { className: "lawyer-dialog__label", htmlFor: `profile-${field.id}`, children: field.label }),
    field.type === "select" && /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)(
      "select",
      {
        id: `profile-${field.id}`,
        className: "lawyer-dialog__select",
        value: values[field.id] ?? "",
        onChange: (event) => setValues((current) => ({ ...current, [field.id]: event.target.value })),
        disabled: loading || saving,
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("option", { value: "", children: "\uFF08\u7559\u7A7A\uFF0C\u6309\u901A\u7528\u6807\u51C6\uFF09" }),
          (field.options ?? []).map((option) => /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("option", { value: option, children: option }, option))
        ]
      }
    ),
    field.type === "text" && /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
      "input",
      {
        id: `profile-${field.id}`,
        type: "text",
        className: "lawyer-dialog__input",
        placeholder: field.placeholder ?? "\u7559\u7A7A\u5219\u6309\u901A\u7528\u6807\u51C6",
        value: values[field.id] ?? "",
        onChange: (event) => setValues((current) => ({ ...current, [field.id]: event.target.value })),
        disabled: loading || saving
      }
    ),
    field.type === "textarea" && /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
      "textarea",
      {
        id: `profile-${field.id}`,
        className: "lawyer-dialog__input lawyer-profile__textarea",
        placeholder: field.placeholder ?? "\u7559\u7A7A\u5219\u6309\u901A\u7528\u6807\u51C6",
        rows: 2,
        value: values[field.id] ?? "",
        onChange: (event) => setValues((current) => ({ ...current, [field.id]: event.target.value })),
        disabled: loading || saving
      }
    ),
    field.hint !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("p", { className: "lawyer-profile__hint", children: field.hint })
  ] }, field.id), renderDomain = (item, badge) => /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)(
    "button",
    {
      type: "button",
      className: item.domain === domain ? "lawyer-profile__domain lawyer-profile__domain--active" : "lawyer-profile__domain",
      onClick: () => setDomain(item.domain),
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("span", { children: item.label }),
        badge !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("span", { className: "lawyer-profile__badge", children: badge })
      ]
    },
    item.domain
  ), groups = [];
  for (let field of fields)
    groups.includes(field.group) || groups.push(field.group);
  let stepGroups = [];
  for (let field of stepFields)
    stepGroups.includes(field.group) || stepGroups.push(field.group);
  return /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
    "div",
    {
      className: "lawyer-dialog-mask",
      role: "dialog",
      "aria-modal": "true",
      "aria-label": "\u5B9E\u52A1\u753B\u50CF\u914D\u7F6E",
      onClick: (event) => {
        event.target === event.currentTarget && onCancel();
      },
      children: /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "lawyer-dialog lawyer-profile", children: [
        /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "lawyer-dialog__header", children: [
          /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("h2", { className: "lawyer-dialog__title", children: "\u5B9E\u52A1\u753B\u50CF\u914D\u7F6E" }),
          /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("button", { type: "button", className: "lawyer-dialog__close", "aria-label": "\u5173\u95ED", onClick: onCancel, children: "\u2715" })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "lawyer-profile__body", children: [
          /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("aside", { className: "lawyer-profile__domains", children: [
            PRIMARY_PROFILE_DOMAINS.map((name) => {
              let item = findProfileDomain(name);
              return item === void 0 ? null : renderDomain(item);
            }),
            customOnly.map((name) => {
              let item = findProfileDomain(name);
              return item === void 0 ? null : renderDomain(item, "\u81EA\u5B9A\u4E49\u529F\u80FD");
            }),
            /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)(
              "button",
              {
                type: "button",
                className: "lawyer-profile__more",
                onClick: () => setMoreOpen((current) => !current),
                "aria-expanded": moreOpen,
                children: [
                  moreOpen ? "\u25BE" : "\u25B8",
                  " \u66F4\u591A\u9886\u57DF\uFF08",
                  moreDomains.length,
                  "\uFF09"
                ]
              }
            ),
            moreOpen && moreDomains.map((item) => renderDomain(item))
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("section", { className: "lawyer-profile__main", children: [
            !hasSpecializedFields(domain) && /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("p", { className: "lawyer-profile__notice", children: "\u8BE5\u9886\u57DF\u6CA1\u6709\u5185\u7F6E\u95EE\u5377\uFF1A\u8BF7\u5728\u300CL2 \u5B8C\u6574\u95EE\u5377\u300D\u91CC\u7528\u4F1A\u8BDD\u8BBF\u8C08\u8BA9\u6A21\u578B\u6309\u4ED3\u5E93\u811A\u672C\u9010\u9879\u6355\u83B7\uFF0C\u6216\u5728\u300C\u539F\u6587\u76F4\u7F16\u300D\u91CC\u76F4\u63A5\u5199\u3002" }),
            dismissedDomains.includes(domain) && onRestoreGuide !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("p", { className: "lawyer-profile__notice", children: [
              "\u5DF2\u8DF3\u8FC7\u8BE5\u9886\u57DF\u7684\u753B\u50CF\u5F15\u5BFC\u3002",
              /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("button", { type: "button", className: "lawyer-profile__link", onClick: () => onRestoreGuide(domain), children: "\u6062\u590D\u63D0\u9192" })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("div", { className: "lawyer-profile__tabs", role: "tablist", children: [
              ["quick", "L1 \u5FEB\u901F\u914D\u7F6E"],
              ["interview", "L2 \u5B8C\u6574\u95EE\u5377"],
              ["raw", "L3 \u539F\u6587\u76F4\u7F16"]
            ].map(([key, label]) => /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
              "button",
              {
                type: "button",
                role: "tab",
                "aria-selected": tab === key,
                className: tab === key ? "lawyer-profile__tab lawyer-profile__tab--active" : "lawyer-profile__tab",
                onClick: () => setTab(key),
                children: label
              },
              key
            )) }),
            error !== "" && /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("p", { className: "lawyer-profile__error", children: error }),
            tab === "quick" && /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "lawyer-profile__pane", children: [
              loading ? /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("p", { className: "lawyer-profile__hint", children: "\u6B63\u5728\u8BFB\u53D6\u753B\u50CF\u2026" }) : groups.map((group) => /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "lawyer-profile__group", children: [
                /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("h3", { className: "lawyer-profile__group-title", children: group }),
                fields.filter((field) => field.group === group).map(renderField)
              ] }, group)),
              /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("p", { className: "lawyer-profile__hint", children: "\u7559\u7A7A\u7684\u5B57\u6BB5\u5C06\u6309\u901A\u7528\u6807\u51C6\u5904\u7406\uFF08\u753B\u50CF\u91CC\u843D [PLACEHOLDER]\uFF09\u3002" })
            ] }),
            tab === "interview" && fullFields === void 0 && /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "lawyer-profile__pane", children: [
              /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("p", { className: "lawyer-profile__hint", children: [
                "\u8BE5\u9886\u57DF\u8FD8\u6CA1\u6709\u5185\u7F6E\u95EE\u5377\uFF0C\u8BBF\u8C08\u5728\u4F1A\u8BDD\u91CC\u8FDB\u884C\uFF1A\u6A21\u578B\u6309 ",
                domain,
                "/skills/ cold-start-interview/SKILL.md \u7684\u811A\u672C\u6BCF\u8F6E\u95EE 2-3 \u9898\u3001\u9700\u8981\u8F93\u5165\u65F6\u4F1A\u7B49\u4F60 \u56DE\u7B54\u3001\u53EF\u968F\u65F6\u8BF4\u300C\u6682\u505C\u300D\u3002\u5B8C\u6210\u540E\u7531\u5B83\u628A\u753B\u50CF\u5199\u5165",
                status === null ? "\u753B\u50CF\u6587\u4EF6" : ` ${status.path}`,
                "\u3002"
              ] }),
              INTERVIEW_MODES.map((option) => /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "lawyer-profile__mode", children: [
                /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
                  "button",
                  {
                    type: "button",
                    className: option.primary ? "lawyer-dialog__submit lawyer-profile__mode-btn" : "lawyer-dialog__cancel lawyer-profile__mode-btn",
                    onClick: () => onStartInterview(domain, option.mode),
                    disabled: loading,
                    children: option.label
                  }
                ),
                /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("p", { className: "lawyer-profile__hint", children: option.hint })
              ] }, option.mode))
            ] }),
            tab === "interview" && fullFields !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "lawyer-profile__pane", children: [
              /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "lawyer-profile__stepbar", children: [
                /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("p", { className: "lawyer-profile__step-title", children: [
                  "\u7B2C ",
                  safeIndex + 1,
                  "/",
                  steps.length,
                  " \u6B65 \xB7 ",
                  currentStep,
                  /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("span", { className: "lawyer-profile__identity-tag", children: identity === "inhouse" ? "\u516C\u53F8\u6CD5\u52A1\u7248" : "\u6267\u4E1A\u5F8B\u5E08\u7248" })
                ] }),
                /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("div", { className: "lawyer-profile__progress", children: /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
                  "div",
                  {
                    className: "lawyer-profile__progress-fill",
                    style: {
                      width: steps.length === 0 ? "0%" : `${(safeIndex + 1) / steps.length * 100}%`
                    }
                  }
                ) })
              ] }),
              currentStep === IDENTITY_STEP && /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("div", { className: "lawyer-profile__identity", children: IDENTITY_CARDS.map((card) => {
                let active = identity === card.identity, key = IDENTITY_FIELD[domain];
                return /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)(
                  "button",
                  {
                    type: "button",
                    "aria-pressed": active,
                    className: active ? "lawyer-profile__identity-card lawyer-profile__identity-card--active" : "lawyer-profile__identity-card",
                    onClick: () => {
                      key !== void 0 && setValues((current) => ({
                        ...current,
                        [key]: card.seeds[domain] ?? ""
                      }));
                    },
                    disabled: loading || saving,
                    children: [
                      /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("span", { className: "lawyer-profile__identity-name", children: card.label }),
                      /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("span", { className: "lawyer-profile__identity-hint", children: card.hint })
                    ]
                  },
                  card.identity
                );
              }) }),
              loading ? /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("p", { className: "lawyer-profile__hint", children: "\u6B63\u5728\u8BFB\u53D6\u753B\u50CF\u2026" }) : stepGroups.map((group) => /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "lawyer-profile__group", children: [
                /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("h3", { className: "lawyer-profile__group-title", children: group }),
                stepFields.filter((field) => field.group === group).map(renderField)
              ] }, group)),
              /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "lawyer-profile__step-nav", children: [
                /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
                  "button",
                  {
                    type: "button",
                    className: "lawyer-dialog__cancel",
                    onClick: () => setStepIndex(Math.max(0, safeIndex - 1)),
                    disabled: loading || saving || safeIndex === 0,
                    children: "\u4E0A\u4E00\u6B65"
                  }
                ),
                safeIndex >= steps.length - 1 ? /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
                  "button",
                  {
                    type: "button",
                    className: "lawyer-dialog__submit",
                    onClick: saveFull,
                    disabled: loading || saving,
                    children: saving ? "\u4FDD\u5B58\u4E2D\u2026" : "\u4FDD\u5B58\u753B\u50CF"
                  }
                ) : /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
                  "button",
                  {
                    type: "button",
                    className: "lawyer-dialog__submit",
                    onClick: () => setStepIndex(safeIndex + 1),
                    disabled: loading || saving,
                    children: "\u4E0B\u4E00\u6B65"
                  }
                )
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("p", { className: "lawyer-profile__hint", children: [
                "\u8868\u683C\u7C7B\u5185\u5BB9\uFF08\u5BA1\u6279\u77E9\u9635\u3001\u4FDD\u9669\u6E05\u5355\u3001\u5DF2\u5BA1\u9605\u7684\u79CD\u5B50\u6587\u4EF6\uFF09\u8868\u5355\u653E\u4E0D\u4E0B\uFF0C",
                /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
                  "button",
                  {
                    type: "button",
                    className: "lawyer-profile__link",
                    onClick: () => onStartInterview(domain, "full"),
                    disabled: loading,
                    children: "\u8FDB\u5BF9\u8BDD\u8BA9 AI \u8865\u5145\u63D0\u53D6"
                  }
                ),
                "\u3002\u7559\u7A7A\u7684\u5B57\u6BB5\u6309\u901A\u7528\u6807\u51C6\u5904\u7406\uFF08\u753B\u50CF\u91CC\u843D [PLACEHOLDER]\uFF09\u3002"
              ] })
            ] }),
            tab === "raw" && /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "lawyer-profile__pane", children: [
              /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("p", { className: "lawyer-profile__hint", children: "\u8FD9\u662F\u753B\u50CF\u539F\u6587\uFF0C\u53EF\u76F4\u63A5\u7F16\u8F91\uFF1B\u672C\u5DE5\u4F5C\u53F0\u6240\u6709\u6CD5\u5F8B\u529F\u80FD\u5728\u52A8\u7B14\u524D\u90FD\u4F1A\u8BFB\u53D6\u5B83\u3002" }),
              /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
                "textarea",
                {
                  className: "lawyer-dialog__input lawyer-profile__raw",
                  value: raw,
                  onChange: (event) => setRaw(event.target.value),
                  disabled: loading || saving,
                  spellCheck: !1
                }
              )
            ] })
          ] })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("div", { className: "lawyer-profile__status", children: status === null ? "\u753B\u50CF\u72B6\u6001\u672A\u77E5" : status.exists ? status.configured ? `\u5DF2\u914D\u7F6E \xB7 ${status.path}` : `\u5DF2\u5B58\u5728\uFF0C\u4ECD\u6709 ${status.placeholderCount} \u5904 [PLACEHOLDER] \xB7 ${status.path}` : `\u672A\u914D\u7F6E \xB7 ${status.path}` }),
        /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "lawyer-dialog__actions", children: [
          /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("button", { type: "button", className: "lawyer-dialog__cancel", onClick: onCancel, disabled: saving, children: "\u5173\u95ED" }),
          tab !== "interview" && /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
            "button",
            {
              type: "button",
              className: "lawyer-dialog__submit",
              onClick: () => {
                tab === "quick" ? saveQuick() : persist(raw);
              },
              disabled: loading || saving,
              children: saving ? "\u4FDD\u5B58\u4E2D\u2026" : "\u4FDD\u5B58\u753B\u50CF"
            }
          )
        ] })
      ] })
    }
  );
}

// plugins/lawyer-sidebar/src/client/ProfileGuide.tsx
var import_jsx_runtime8 = require("react/jsx-runtime");
function ProfileGuideDialog({
  domainLabel,
  onFullSetup,
  onQuickSetup,
  onSkip
}) {
  return /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("div", { className: "lawyer-dialog-mask", role: "dialog", "aria-modal": "true", "aria-label": "\u914D\u7F6E\u5B9E\u52A1\u753B\u50CF", children: /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { className: "lawyer-dialog lawyer-profile-guide", children: [
    /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("div", { className: "lawyer-dialog__header", children: /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("h2", { className: "lawyer-dialog__title", children: [
      "\u5148\u82B1\u4E24\u5206\u949F\uFF0C\u8BF4\u8BF4\u4F60\u600E\u4E48\u505A\u300C",
      domainLabel,
      "\u300D"
    ] }) }),
    /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("p", { className: "lawyer-profile__hint", children: "\u672C\u5DE5\u4F5C\u53F0\u7684\u6CD5\u5F8B\u529F\u80FD\u4F1A\u5148\u8BFB\u53D6\u4E00\u4EFD\u300C\u5B9E\u52A1\u753B\u50CF\u300D\u2014\u2014\u4F60\u4EEC\u56E2\u961F\u7684\u7ACB\u573A\u3001\u9608\u503C\u4E0E\u884C\u6587\u4E60\u60EF\u3002 \u6CA1\u6709\u5B83\u4E5F\u80FD\u7528\uFF0C\u53EA\u662F\u6BCF\u6761\u63D0\u9192\u90FD\u662F\u901A\u7528\u53E3\u5F84\uFF0C\u8BFB\u8D77\u6765\u50CF\u7ED9\u522B\u4EBA\u5199\u7684\u3002" }),
    /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("ol", { className: "lawyer-profile__steps", children: [
      /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("li", { children: "\u5148\u9009\u6267\u4E1A\u8EAB\u4EFD\uFF1A\u6267\u4E1A\u5F8B\u5E08\u4E0E\u516C\u53F8\u6CD5\u52A1\u662F\u4E24\u5957\u95EE\u9898\u94FE\u2014\u2014\u524D\u8005\u95EE\u4E8B\u9879\u9694\u79BB\u3001\u6536\u8D39\u4E0E\u5BA2\u6237\u6C47\u62A5\uFF0C\u540E\u8005\u95EE\u5BA1\u6279\u4E0A\u62A5\u94FE\u3001\u91CD\u5927\u6027\u9608\u503C\u4E0E\u4FDD\u9669\u8986\u76D6\u3002" }),
      /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("li", { children: "\u95EE\u7684\u662F\u4F60\u5B9E\u9645\u600E\u4E48\u5E72\u6D3B\uFF1A\u8D23\u4EFB\u4E0A\u9650\u7ED9\u591A\u5C11\u3001\u4EC0\u4E48\u60C5\u51B5\u5FC5\u987B\u4E0A\u62A5\u3001\u6587\u4E66\u4EC0\u4E48\u8154\u8C03\u3002" }),
      /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("li", { children: "\u7B54\u4E0D\u4E0A\u6765\u7684\u53EF\u4EE5\u7559\u7A7A\uFF0C\u7F3A\u5931\u9879\u6309\u901A\u7528\u6807\u51C6\u5904\u7406\uFF0C\u968F\u65F6\u80FD\u56DE\u6765\u8865\u3002" }),
      /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("li", { children: "\u753B\u50CF\u662F\u4E00\u4EFD\u53EF\u7F16\u8F91\u7684 Markdown\uFF0C\u4E0D\u662F\u914D\u7F6E\u6587\u4EF6\uFF0C\u4F60\u5B8C\u5168\u53EF\u4EE5\u81EA\u5DF1\u6539\u3002" })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { className: "lawyer-profile__mode", children: [
      /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
        "button",
        {
          type: "button",
          className: "lawyer-dialog__submit lawyer-profile__mode-btn",
          onClick: onFullSetup,
          children: "\u5B8C\u6574\u95EE\u5377\uFF08\u63A8\u8350\uFF09"
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("p", { className: "lawyer-profile__hint", children: "\u9009\u5B8C\u8EAB\u4EFD\u540E\u5206\u6B65\u586B\u5B8C\u8BE5\u8EAB\u4EFD\u7684\u95EE\u9898\u94FE\uFF085\u20137 \u6B65\uFF09\uFF0C\u5C31\u5730\u5B8C\u6210\u3001\u4E0D\u53D1\u8D77\u4F1A\u8BDD\u3001\u4E0D\u5360\u4E0A\u4E0B\u6587\u3002 \u7B54\u4E0D\u4E0A\u6765\u7684\u9879\u7559\u7A7A\uFF0C\u4E0D\u4F1A\u7F16\u9020\u3002" })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { className: "lawyer-profile__mode", children: [
      /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
        "button",
        {
          type: "button",
          className: "lawyer-dialog__cancel lawyer-profile__mode-btn",
          onClick: onQuickSetup,
          children: "\u5FEB\u901F\u914D\u7F6E"
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("p", { className: "lawyer-profile__hint", children: "\u6253\u5F00\u8868\u5355\u76F4\u63A5\u586B\u9AD8\u9891\u5B57\u6BB5\uFF0C\u4E24\u4E09\u5206\u949F\uFF0C\u4E0D\u53D1\u8D77\u4F1A\u8BDD\u3002" })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("div", { className: "lawyer-dialog__actions", children: /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("button", { type: "button", className: "lawyer-profile__link", onClick: onSkip, children: "\u7559\u7A7A\uFF0C\u6309\u901A\u7528\u6807\u51C6\u8F93\u51FA" }) })
  ] }) });
}
function ProfileEntryButton({ label, onClick }) {
  return /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("button", { type: "button", className: "lawyer-profile__entry", onClick, children: [
    /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("span", { className: "lawyer-profile__entry-icon", "aria-hidden": "true", children: "\u25A4" }),
    /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("span", { children: [
      "\u5B9E\u52A1\u753B\u50CF\uFF1A",
      label,
      " \u203A"
    ] })
  ] });
}

// plugins/lawyer-sidebar/src/client/YuandianMcpDialog.tsx
var import_react8 = require("react");
var import_jsx_runtime9 = require("react/jsx-runtime"), YUANDIAN_LINKS = [
  {
    label: "\u6253\u5F00\u5143\u5178\u5F00\u653E\u5E73\u53F0",
    url: "https://open.chineselaw.com",
    note: "\u6CE8\u518C\u8D26\u53F7\u5E76\u767B\u5F55\u63A7\u5236\u53F0"
  },
  {
    label: "\u53BB\u63A7\u5236\u53F0\u521B\u5EFA API Key",
    url: "https://open.chineselaw.com",
    note: "\u5728\u300CAPI \u5BC6\u94A5 / \u5F00\u53D1\u8005\u8BBE\u7F6E\u300D\u91CC\u65B0\u5EFA\uFF0C\u590D\u5236\u540E\u7C98\u8D34\u5230\u4E0B\u65B9"
  },
  {
    label: "\u67E5\u770B MCP \u914D\u7F6E\u8BF4\u660E",
    url: "https://open.chineselaw.com/mcp-config/",
    note: "\u5B98\u65B9\u63A5\u5165\u6587\u6863\uFF1A\u7AEF\u70B9\u3001\u8BA4\u8BC1\u65B9\u5F0F\u4E0E\u914D\u7F6E\u793A\u4F8B"
  }
];
function verifyHint(result) {
  if (result.ok) return result.message;
  switch (result.code) {
    case "unauthorized":
      return `${result.message}\u2014\u2014Key \u65E0\u6548\u3001\u5DF2\u8FC7\u671F\u6216\u8D26\u53F7\u672A\u5F00\u901A\u8BE5\u670D\u52A1\uFF0C\u8BF7\u56DE\u5E73\u53F0\u786E\u8BA4\u540E\u91CD\u65B0\u7C98\u8D34`;
    case "timeout":
    case "unreachable":
      return `${result.message}\u2014\u2014\u7F51\u7EDC\u4E0D\u901A\u65F6\u65E0\u6CD5\u5224\u65AD Key \u662F\u5426\u6709\u6548\uFF0CKey \u5DF2\u4FDD\u5B58\uFF0C\u7A0D\u540E\u53EF\u70B9\u300C\u91CD\u65B0\u9A8C\u8BC1\u300D`;
    case "server-error":
      return `${result.message}\u2014\u2014\u5E73\u53F0\u4FA7\u6682\u65F6\u5F02\u5E38\uFF0CKey \u5DF2\u4FDD\u5B58\uFF0C\u7A0D\u540E\u91CD\u8BD5\u5373\u53EF`;
    case "missing":
      return result.message;
    default:
      return result.message;
  }
}
function sourceLabel(source) {
  return source === "env" ? "\u6765\u81EA\u7CFB\u7EDF\u73AF\u5883\u53D8\u91CF" : source === "file" ? "\u6765\u81EA\u672C\u5DE5\u4F5C\u53F0\u4FDD\u5B58\u7684\u51ED\u636E\u6587\u4EF6" : "\u672A\u914D\u7F6E";
}
function YuandianMcpDialog({
  status,
  secretsApi,
  onChanged,
  onClose,
  onDismiss
}) {
  let [apiKey, setApiKey] = (0, import_react8.useState)(""), [busy, setBusy] = (0, import_react8.useState)(!1), [result, setResult] = (0, import_react8.useState)(null), [error, setError] = (0, import_react8.useState)(null), [availability, setAvailability] = (0, import_react8.useState)(null), autoVerified = (0, import_react8.useRef)(!1);
  (0, import_react8.useEffect)(() => {
    setApiKey(""), setBusy(!1);
  }, [status?.configured, status?.masked]), (0, import_react8.useEffect)(() => {
    if (status?.configured !== !0 || autoVerified.current) return;
    autoVerified.current = !0;
    let cancelled = !1;
    return secretsApi.verify(new AbortController().signal).then((checked) => {
      cancelled || setAvailability(checked instanceof Error ? null : checked);
    }), () => {
      cancelled = !0;
    };
  }, [status?.configured, secretsApi]);
  let save = () => {
    let key = apiKey.trim();
    if (key === "") {
      setError("\u8BF7\u5148\u7C98\u8D34 API Key");
      return;
    }
    setBusy(!0), setError(null), setResult(null), (async () => {
      let saved = await secretsApi.save(key, new AbortController().signal);
      if (setBusy(!1), saved instanceof Error) {
        setError(saved.message);
        return;
      }
      setResult({ ok: saved.ok, code: saved.code, message: saved.message }), setAvailability({ ok: saved.ok, code: saved.code, message: saved.message }), autoVerified.current = !0, setApiKey("");
      let next = await secretsApi.status(new AbortController().signal);
      onChanged(next instanceof Error ? null : next);
    })();
  }, reverify = () => {
    setBusy(!0), setError(null), setResult(null), (async () => {
      let checked = await secretsApi.verify(new AbortController().signal);
      if (setBusy(!1), checked instanceof Error) {
        setError(checked.message);
        return;
      }
      setResult(checked), setAvailability(checked);
    })();
  }, clear = () => {
    setBusy(!0), setError(null), setResult(null), setAvailability(null), autoVerified.current = !1, (async () => {
      await secretsApi.clear(new AbortController().signal);
      let next = await secretsApi.status(new AbortController().signal);
      setBusy(!1), onChanged(next instanceof Error ? null : next);
    })();
  };
  return /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("div", { className: "lawyer-dialog-mask", role: "dialog", "aria-modal": "true", "aria-label": "\u914D\u7F6E\u5143\u5178\u6CD5\u89C4\u68C0\u7D22", children: /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: "lawyer-dialog lawyer-guide", children: [
    /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: "lawyer-dialog__header", children: [
      /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("h2", { className: "lawyer-dialog__title", children: "\u63A5\u4E0A\u5143\u5178\u6CD5\u89C4\u68C0\u7D22\uFF08\u53EF\u9009\uFF09" }),
      /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("button", { type: "button", className: "lawyer-dialog__close", "aria-label": "\u5173\u95ED", onClick: onClose, children: "\u2715" })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("p", { className: "lawyer-profile__hint", children: [
      "\u5408\u540C\u5BA1\u6838\u3001\u6848\u4EF6\u5206\u6790\u4E0E\u6587\u4E66\u751F\u6210\u67E5\u6CD5\u6761\u548C\u7C7B\u6848\u65F6\uFF0C\u8D70\u7684\u662F\u5143\u5178\u5F00\u653E\u5E73\u53F0\u7684 MCP \u5DE5\u5177\uFF08",
      /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("code", { children: "mcp__law__*" }),
      " \u6CD5\u89C4\u3001",
      /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("code", { children: "mcp__case__*" }),
      " \u6848\u4F8B\uFF09\u3002 \u4E0D\u914D\u4E5F\u80FD\u7528\u2014\u2014\u53EA\u662F\u6CD5\u6761\u53EA\u80FD\u51ED\u6A21\u578B\u8BB0\u5FC6\uFF0C\u8F93\u51FA\u4F1A\u5168\u90E8\u6807\u6CE8\u300C\u9700\u9A8C\u8BC1\u300D\u3002"
    ] }),
    status?.configured === !0 && /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: "lawyer-profile__notice", children: [
      "\u5F53\u524D\u5DF2\u914D\u7F6E\uFF1A",
      status.masked ?? "\uFF08\u5DF2\u4FDD\u5B58\uFF09",
      " \xB7 ",
      sourceLabel(status.source),
      /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("br", {}),
      availability === null ? "MCP \u8FDE\u63A5\uFF1A\u6B63\u5728\u68C0\u6D4B\u2026" : availability.ok ? "MCP \u8FDE\u63A5\uFF1A\u53EF\u7528" : "MCP \u8FDE\u63A5\uFF1A\u4E0D\u53EF\u7528\uFF0C\u53EF\u70B9\u300C\u91CD\u65B0\u9A8C\u8BC1\u300D\u91CD\u8BD5",
      /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("br", {}),
      "\u4FDD\u5B58\u4F4D\u7F6E\uFF1A",
      status.path
    ] }),
    status?.configured !== !0 && /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)(import_jsx_runtime9.Fragment, { children: [
      /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("ol", { className: "lawyer-profile__steps", children: [
        /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("li", { children: "\u6253\u5F00\u5143\u5178\u5F00\u653E\u5E73\u53F0\u6CE8\u518C\u8D26\u53F7\uFF1B" }),
        /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("li", { children: "\u5728\u63A7\u5236\u53F0\u521B\u5EFA API Key \u5E76\u590D\u5236\uFF1B" }),
        /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("li", { children: "\u7C98\u8D34\u5230\u4E0B\u65B9\u8F93\u5165\u6846\u4FDD\u5B58\uFF0C\u7ACB\u5373\u751F\u6548\uFF0C\u4E0D\u7528\u91CD\u542F\u3002" })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("div", { className: "lawyer-guide__links", children: YUANDIAN_LINKS.map((link) => /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)(
        "button",
        {
          type: "button",
          className: "lawyer-guide__link",
          onClick: () => {
            openExternalUrl(link.url);
          },
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("span", { className: "lawyer-guide__link-label", children: [
              link.label,
              /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("span", { className: "lawyer-guide__link-arrow", "aria-hidden": "true", children: "\u2197" })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("span", { className: "lawyer-guide__link-note", children: link.note })
          ]
        },
        link.label
      )) })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("label", { className: "lawyer-dialog__label", htmlFor: "lawyer-yuandian-key", children: status?.configured === !0 ? "\u66F4\u6362 API Key" : "\u7C98\u8D34\u5143\u5178 API Key" }),
    /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
      "input",
      {
        id: "lawyer-yuandian-key",
        className: "lawyer-dialog__input",
        type: "password",
        autoComplete: "off",
        spellCheck: !1,
        placeholder: "sk-\u2026",
        value: apiKey,
        onChange: (event) => {
          setApiKey(event.target.value);
        },
        disabled: busy
      }
    ),
    result !== null && /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("p", { className: result.ok ? "lawyer-guide__result lawyer-guide__result--ok" : "lawyer-guide__result", children: verifyHint(result) }),
    error !== null && /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("p", { className: "lawyer-profile__error", children: error }),
    /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: "lawyer-dialog__actions", children: [
      /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("button", { type: "button", className: "lawyer-profile__link", onClick: onDismiss, children: "\u4E0D\u518D\u63D0\u9192" }),
      status?.configured === !0 && /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)(import_jsx_runtime9.Fragment, { children: [
        /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("button", { type: "button", className: "lawyer-dialog__cancel", onClick: clear, disabled: busy, children: "\u6E05\u9664" }),
        /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("button", { type: "button", className: "lawyer-dialog__cancel", onClick: reverify, disabled: busy, children: busy ? "\u9A8C\u8BC1\u4E2D\u2026" : "\u91CD\u65B0\u9A8C\u8BC1" })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("button", { type: "button", className: "lawyer-dialog__cancel", onClick: onClose, children: "\u6682\u4E0D\u914D\u7F6E\uFF0C\u7EE7\u7EED" }),
      /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("button", { type: "button", className: "lawyer-dialog__submit", onClick: save, disabled: busy, children: busy ? "\u4FDD\u5B58\u4E2D\u2026" : "\u4FDD\u5B58\u5E76\u9A8C\u8BC1" })
    ] })
  ] }) });
}

// plugins/lawyer-sidebar/src/client/LawyerSidebar.tsx
var import_jsx_runtime10 = require("react/jsx-runtime"), OPEN_ENTRY_MANAGER_EVENT = "lawyer:open-entry-manager", COLLAPSED_STORAGE_KEY = "lawyer-sidebar:collapsed", ENTRY_DOMAINS = {
  "contract-review": "commercial-legal",
  "case-analysis": "litigation-legal",
  "doc-generation": "litigation-legal"
};
function SaltedFishMark({ size = 24, className }) {
  return /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)(
    "svg",
    {
      width: size,
      height: size,
      className,
      viewBox: "0 0 24 24",
      fill: "none",
      "aria-hidden": "true",
      focusable: "false",
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("ellipse", { cx: "10.6", cy: "10.2", rx: "7", ry: "5", stroke: "currentColor", strokeWidth: "1.5" }),
        /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(
          "path",
          {
            d: "M17.6 10.2l3-2.1c.32-.22.75.02.75.4v3.4c0 .38-.43.62-.75.4l-3-2.1Z",
            fill: "currentColor"
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(
          "path",
          {
            d: "M6.8 9.9c.5.5 1.2.5 1.7 0M10.2 9.9c.5.5 1.2.5 1.7 0",
            stroke: "currentColor",
            strokeWidth: "1.2",
            strokeLinecap: "round"
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("circle", { cx: "8.6", cy: "12", r: ".75", stroke: "currentColor", strokeWidth: "1.1" }),
        /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("circle", { cx: "5.7", cy: "11.5", r: ".8", fill: "currentColor", opacity: ".4" }),
        /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(
          "path",
          {
            d: "M13.6 7.6c.8-.6 1.8-.6 2.6 0",
            stroke: "currentColor",
            strokeWidth: "1.1",
            strokeLinecap: "round",
            opacity: ".55"
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(
          "path",
          {
            d: "M2.6 18.4c1-.9 2.1-.9 3.1 0s2.1.9 3.1 0 2.1-.9 3.1 0 2.1.9 3.1 0 2.1-.9 3.1 0",
            stroke: "currentColor",
            strokeWidth: "1.3",
            strokeLinecap: "round",
            opacity: ".8"
          }
        )
      ]
    }
  );
}
function MoyuBrandName() {
  return /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("img", { className: "lawyer-brand-name-main", src: BRAND_LOGO_PNG_URI, alt: "\u6478\u9C7C\u5DE5\u4F5C\u7AD9" });
}
function MoyuHeroMark({ size, className }) {
  let merged = className === void 0 ? "lawyer-hero-mark" : `${className} lawyer-hero-mark`;
  return /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(SaltedFishMark, { size, className: merged });
}
function ContractIcon({ size = 18 }) {
  return /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("svg", { width: size, height: size, viewBox: "0 0 16 16", fill: "none", "aria-hidden": "true", focusable: "false", children: [
    /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(
      "path",
      {
        d: "M9.5 1.5H4.25C3.56 1.5 3 2.06 3 2.75v10.5c0 .69.56 1.25 1.25 1.25h7.5c.69 0 1.25-.56 1.25-1.25V6L9.5 1.5Z",
        stroke: "currentColor",
        strokeWidth: "1.1",
        strokeLinejoin: "round"
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("path", { d: "M9.5 1.5V6H13", stroke: "currentColor", strokeWidth: "1.1", strokeLinejoin: "round" }),
    /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("path", { d: "M5.5 8.5h5M5.5 11h3.5", stroke: "currentColor", strokeWidth: "1.1", strokeLinecap: "round" })
  ] });
}
function SearchIcon({ size = 18 }) {
  return /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("svg", { width: size, height: size, viewBox: "0 0 16 16", fill: "none", "aria-hidden": "true", focusable: "false", children: [
    /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("circle", { cx: "7", cy: "7", r: "4.5", stroke: "currentColor", strokeWidth: "1.1" }),
    /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("path", { d: "M10.5 10.5 14 14", stroke: "currentColor", strokeWidth: "1.1", strokeLinecap: "round" })
  ] });
}
function PenIcon({ size = 18 }) {
  return /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("svg", { width: size, height: size, viewBox: "0 0 16 16", fill: "none", "aria-hidden": "true", focusable: "false", children: [
    /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(
      "path",
      {
        d: "M3 13.2l.8-3.2 8.3-8.3a1.5 1.5 0 0 1 2.1 2.1L5.9 12.1 3 13.2Z",
        stroke: "currentColor",
        strokeWidth: "1.1",
        strokeLinejoin: "round"
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("path", { d: "M10.5 3.2l2.1 2.1", stroke: "currentColor", strokeWidth: "1.1", strokeLinecap: "round" })
  ] });
}
function SparkIcon({ size = 18 }) {
  return /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("svg", { width: size, height: size, viewBox: "0 0 16 16", fill: "none", "aria-hidden": "true", focusable: "false", children: /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(
    "path",
    {
      d: "M9 1.5 3.5 9h3l-.8 5.5L11.5 7h-3L9 1.5Z",
      stroke: "currentColor",
      strokeWidth: "1.1",
      strokeLinejoin: "round"
    }
  ) });
}
function ScaleIcon({ size = 18 }) {
  return /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("svg", { width: size, height: size, viewBox: "0 0 16 16", fill: "none", "aria-hidden": "true", focusable: "false", children: [
    /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("path", { d: "M8 2.5v11M5 13.5h6M3 5h10", stroke: "currentColor", strokeWidth: "1.1", strokeLinecap: "round" }),
    /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("path", { d: "M3 5 1.2 8.6a1.6 1.6 0 0 0 3.6 0L3 5ZM13 5l-1.8 3.6a1.6 1.6 0 0 0 3.6 0L13 5Z", stroke: "currentColor", strokeWidth: "1.1", strokeLinejoin: "round" })
  ] });
}
function ShieldIcon({ size = 18 }) {
  return /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("svg", { width: size, height: size, viewBox: "0 0 16 16", fill: "none", "aria-hidden": "true", focusable: "false", children: [
    /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("path", { d: "M8 1.8 13 3.4v4.1c0 3.1-2.1 5.4-5 6.7-2.9-1.3-5-3.6-5-6.7V3.4L8 1.8Z", stroke: "currentColor", strokeWidth: "1.1", strokeLinejoin: "round" }),
    /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("path", { d: "M5.9 7.9 7.4 9.4l2.8-2.9", stroke: "currentColor", strokeWidth: "1.1", strokeLinecap: "round", strokeLinejoin: "round" })
  ] });
}
function FolderIcon({ size = 18 }) {
  return /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("svg", { width: size, height: size, viewBox: "0 0 16 16", fill: "none", "aria-hidden": "true", focusable: "false", children: /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("path", { d: "M1.8 4.2c0-.6.5-1.1 1.1-1.1h2.6l1.3 1.6h6.3c.6 0 1.1.5 1.1 1.1v6c0 .6-.5 1.1-1.1 1.1H2.9c-.6 0-1.1-.5-1.1-1.1V4.2Z", stroke: "currentColor", strokeWidth: "1.1", strokeLinejoin: "round" }) });
}
function ChartIcon({ size = 18 }) {
  return /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("svg", { width: size, height: size, viewBox: "0 0 16 16", fill: "none", "aria-hidden": "true", focusable: "false", children: [
    /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("path", { d: "M2.5 13.5V2.5M2.5 13.5h11", stroke: "currentColor", strokeWidth: "1.1", strokeLinecap: "round" }),
    /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("path", { d: "M5 13.5V9M8 13.5V5.5M11 13.5v-6", stroke: "currentColor", strokeWidth: "1.6", strokeLinecap: "round" })
  ] });
}
function ChatIcon({ size = 18 }) {
  return /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("svg", { width: size, height: size, viewBox: "0 0 16 16", fill: "none", "aria-hidden": "true", focusable: "false", children: [
    /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("path", { d: "M2.2 4.4c0-.9.7-1.6 1.6-1.6h8.4c.9 0 1.6.7 1.6 1.6v4.4c0 .9-.7 1.6-1.6 1.6H6.6L3.6 13V10.4h-.2c-.9 0-1.6-.7-1.6-1.6V4.4Z", stroke: "currentColor", strokeWidth: "1.1", strokeLinejoin: "round" }),
    /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("path", { d: "M5.4 6.4h5.2M5.4 8.4h3.2", stroke: "currentColor", strokeWidth: "1.1", strokeLinecap: "round" })
  ] });
}
function ClockIcon({ size = 18 }) {
  return /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("svg", { width: size, height: size, viewBox: "0 0 16 16", fill: "none", "aria-hidden": "true", focusable: "false", children: [
    /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("circle", { cx: "8", cy: "8", r: "6", stroke: "currentColor", strokeWidth: "1.1" }),
    /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("path", { d: "M8 4.6V8l2.6 1.6", stroke: "currentColor", strokeWidth: "1.1", strokeLinecap: "round", strokeLinejoin: "round" })
  ] });
}
var ENTRY_ICONS = {
  spark: /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(SparkIcon, {}),
  contract: /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(ContractIcon, {}),
  search: /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(SearchIcon, {}),
  pen: /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(PenIcon, {}),
  scale: /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(ScaleIcon, {}),
  shield: /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(ShieldIcon, {}),
  folder: /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(FolderIcon, {}),
  chart: /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(ChartIcon, {}),
  chat: /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(ChatIcon, {}),
  clock: /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(ClockIcon, {})
};
function PlusIcon({ size = 18 }) {
  return /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("svg", { width: size, height: size, viewBox: "0 0 16 16", fill: "none", "aria-hidden": "true", focusable: "false", children: /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("path", { d: "M8 3v10M3 8h10", stroke: "currentColor", strokeWidth: "1.4", strokeLinecap: "round" }) });
}
function ProfileIcon({ size = 18 }) {
  return /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("svg", { width: size, height: size, viewBox: "0 0 16 16", fill: "none", "aria-hidden": "true", focusable: "false", children: [
    /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(
      "path",
      {
        d: "M2.5 4.25c0-.41.34-.75.75-.75h2.4l1.2 1.4h6.4c.41 0 .75.34.75.75v6.1c0 .41-.34.75-.75.75H3.25a.75.75 0 0 1-.75-.75V4.25Z",
        stroke: "currentColor",
        strokeWidth: "1.1",
        strokeLinejoin: "round"
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("path", { d: "M5.4 8.6h5.2M5.4 10.8h3.4", stroke: "currentColor", strokeWidth: "1.1", strokeLinecap: "round" })
  ] });
}
function ChevronIcon({ size = 16, direction }) {
  return /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(
    "svg",
    {
      width: size,
      height: size,
      viewBox: "0 0 16 16",
      fill: "none",
      "aria-hidden": "true",
      focusable: "false",
      style: { transform: direction === "left" ? "none" : "rotate(180deg)" },
      children: /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("path", { d: "M10 3.5 5.5 8l4.5 4.5", stroke: "currentColor", strokeWidth: "1.4", strokeLinecap: "round", strokeLinejoin: "round" })
    }
  );
}
var BUILTIN_ICONS = {
  "contract-review": /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(ContractIcon, {}),
  "case-analysis": /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(SearchIcon, {}),
  "doc-generation": /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(PenIcon, {})
};
function readCollapsed() {
  try {
    return window.localStorage.getItem(COLLAPSED_STORAGE_KEY) === "1";
  } catch {
    return !1;
  }
}
function writeCollapsed(collapsed) {
  try {
    window.localStorage.setItem(COLLAPSED_STORAGE_KEY, collapsed ? "1" : "0");
  } catch {
  }
}
function LawyerSidebar({
  submitContractReview,
  submitCaseAnalysis,
  submitDocGeneration,
  submitCustomEntry,
  entriesSource,
  searchWorkspaceFiles,
  uploadWorkspaceFile,
  listInstalledSkills,
  profileApi,
  dismissedSource,
  persistProfileDismissed,
  submitProfileInterview,
  secretsApi,
  mcpDismissedSource,
  persistMcpDismissed
}) {
  let entries = (0, import_react9.useSyncExternalStore)(entriesSource.subscribe, entriesSource.getSnapshot), dismissedDomains = (0, import_react9.useSyncExternalStore)(dismissedSource.subscribe, dismissedSource.getSnapshot), mcpDismissed = (0, import_react9.useSyncExternalStore)(mcpDismissedSource.subscribe, mcpDismissedSource.getSnapshot), [reviewOpen, setReviewOpen] = (0, import_react9.useState)(!1), [caseOpen, setCaseOpen] = (0, import_react9.useState)(!1), [docOpen, setDocOpen] = (0, import_react9.useState)(!1), [customOpen, setCustomOpen] = (0, import_react9.useState)(null), [collapsed, setCollapsed] = (0, import_react9.useState)(readCollapsed), [profileTarget, setProfileTarget] = (0, import_react9.useState)(null), [profilePendingEntry, setProfilePendingEntry] = (0, import_react9.useState)(null), [guideFor, setGuideFor] = (0, import_react9.useState)(null), [profileStates, setProfileStates] = (0, import_react9.useState)({}), [profileVersion, setProfileVersion] = (0, import_react9.useState)(0), [mcpStatus, setMcpStatus] = (0, import_react9.useState)(null), [mcpPending, setMcpPending] = (0, import_react9.useState)(null), [mcpVersion, setMcpVersion] = (0, import_react9.useState)(0), toggleCollapsed = () => {
    setCollapsed((previous) => (writeCollapsed(!previous), !previous));
  }, openEntryManager = () => {
    window.dispatchEvent(new CustomEvent(OPEN_ENTRY_MANAGER_EVENT));
  };
  (0, import_react9.useEffect)(() => {
    let cancelled = !1, controller = new AbortController();
    return (async () => {
      let results = await Promise.all(
        PRIMARY_PROFILE_DOMAINS.map((domain) => profileApi.status(domain, controller.signal))
      );
      if (cancelled) return;
      let next = {};
      PRIMARY_PROFILE_DOMAINS.forEach((domain, index) => {
        let result = results[index];
        result instanceof Error || (next[domain] = result);
      }), setProfileStates(next);
    })(), () => {
      cancelled = !0, controller.abort();
    };
  }, [profileApi, profileVersion]), (0, import_react9.useEffect)(() => {
    let cancelled = !1;
    return secretsApi.status(new AbortController().signal).then((status) => {
      cancelled || status instanceof Error || setMcpStatus(status);
    }), () => {
      cancelled = !0;
    };
  }, [secretsApi, mcpVersion]);
  let withMcpGate = (next) => {
    if (mcpDismissed || mcpStatus?.configured === !0) {
      next();
      return;
    }
    (async () => {
      let status = await secretsApi.status(new AbortController().signal);
      if (status instanceof Error || status.configured) {
        status instanceof Error || setMcpStatus(status), next();
        return;
      }
      setMcpStatus(status), setMcpPending(() => next);
    })();
  }, closeMcpGuide = () => {
    let pending = mcpPending;
    setMcpPending(null), setMcpVersion((version) => version + 1), pending?.();
  }, mcpSummary = mcpStatus === null ? "\u72B6\u6001\u672A\u77E5 \xB7 \u70B9\u6B64\u67E5\u770B" : mcpStatus.configured ? `\u5DF2\u914D\u7F6E\uFF08${mcpStatus.masked ?? "\u5DF2\u4FDD\u5B58"}\uFF09` : "\u672A\u914D\u7F6E \xB7 \u70B9\u6B64\u63A5\u5165", openBuiltinDialog = (id) => {
    id === "contract-review" ? setReviewOpen(!0) : id === "case-analysis" ? setCaseOpen(!0) : id === "doc-generation" && setDocOpen(!0);
  }, handleBuiltinClick = (id) => {
    let domain = ENTRY_DOMAINS[id];
    (async () => {
      let status = await profileApi.status(domain, new AbortController().signal);
      if (status instanceof Error || status.configured || dismissedDomains.includes(domain)) {
        openBuiltinDialog(id);
        return;
      }
      setGuideFor(id);
    })();
  }, skipGuide = (id) => {
    let domain = ENTRY_DOMAINS[id];
    setGuideFor(null), persistProfileDismissed([...dismissedDomains.filter((item) => item !== domain), domain]), openBuiltinDialog(id);
  }, openProfile = (domain, tab = "quick") => {
    setProfilePendingEntry(null), setProfileTarget({ domain, tab });
  }, setupProfileThen = (id, tab) => {
    setGuideFor(null), setProfilePendingEntry(id), setProfileTarget({ domain: ENTRY_DOMAINS[id], tab });
  }, handleProfileSaved = (domain) => {
    setProfileVersion((version) => version + 1);
    let pending = profilePendingEntry;
    setProfileTarget(null), setProfilePendingEntry(null), !(pending === null || ENTRY_DOMAINS[pending] !== domain) && openBuiltinDialog(pending);
  }, startInterview = (domain, mode) => {
    setGuideFor(null), setProfilePendingEntry(null), setProfileTarget(null), submitProfileInterview(domain, mode), setProfileVersion((version) => version + 1);
  }, closeProfilePanel = () => {
    setProfileTarget(null), setProfilePendingEntry(null), setProfileVersion((version) => version + 1);
  }, profileSummary = (() => {
    let configured = PRIMARY_PROFILE_DOMAINS.filter((domain) => profileStates[domain]?.configured === !0).map((domain) => findProfileDomain(domain)?.label ?? domain);
    return configured.length === 0 ? "\u672A\u914D\u7F6E \xB7 \u70B9\u6B64\u5B8C\u5584" : `${configured.join("\u3001")} \u5DF2\u914D\u7F6E`;
  })(), profileLabelFor = (domain) => {
    let status = profileStates[domain];
    return status === void 0 ? "\u70B9\u6B64\u67E5\u770B" : status.configured ? "\u5DF2\u914D\u7F6E" : status.exists ? `\u672A\u586B\u5B8C\uFF08${status.placeholderCount} \u5904\u5F85\u8865\uFF09` : "\u672A\u914D\u7F6E \xB7 \u70B9\u6B64\u5B8C\u5584";
  }, renderProfileEntry = (domain) => /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(
    ProfileEntryButton,
    {
      label: profileLabelFor(domain),
      onClick: () => openProfile(domain)
    }
  ), cards = entries.map((entry) => {
    if (entry.kind === "builtin") {
      let meta = BUILTIN_ENTRY_META[entry.id];
      return {
        key: entry.id,
        label: meta.label,
        hint: meta.hint,
        icon: BUILTIN_ICONS[entry.id],
        title: meta.description,
        custom: !1,
        // M8 + M8.6：内置入口先过元典 MCP 引导，再过画像引导（两者都只在
        // 该提醒时弹；任一被跳过/已配置则直接开表单）。
        onClick: () => withMcpGate(() => handleBuiltinClick(entry.id))
      };
    }
    let legal = entry.legal, hint = entry.hint ?? (legal !== void 0 ? `${legal.domain}` : `/${entry.skill}`), gestures = [
      ...legal !== void 0 ? [legal.adapter] : [],
      entry.skill,
      ...entry.extraSkills ?? []
    ].map((name) => `/${name}`).join(" ");
    return {
      key: entry.id,
      label: entry.label,
      hint,
      icon: ENTRY_ICONS[entry.icon ?? "spark"] ?? /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(SparkIcon, {}),
      title: legal === void 0 ? `${entry.label}\uFF1A\u4EE5 ${gestures} \u6280\u80FD\u624B\u52BF\u53D1\u8D77${entry.agentPreset === void 0 || entry.agentPreset === "" ? "\u4F1A\u8BDD" : `\u300C${entry.agentPreset}\u300D\u4F1A\u8BDD`}` : `${entry.label}\uFF1Aclaude-for-legal-ZH \xB7 ${legal.domain}\uFF0C\u4EE5 ${gestures} \u6280\u80FD\u624B\u52BF\u53D1\u8D77\u4F1A\u8BDD`,
      custom: !0,
      // M8.6：自定义入口同样先过元典引导（涉及法律事项的入口最需要法规检索）。
      onClick: () => withMcpGate(() => {
        setCustomOpen(entry);
      })
    };
  }), builtinCards = cards.filter((card) => !card.custom), customCards = cards.filter((card) => card.custom), renderCard = (card) => /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)(
    "button",
    {
      type: "button",
      className: "lawyer-sidebar__card",
      onClick: card.onClick,
      title: card.title,
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("span", { className: "lawyer-sidebar__card-icon", children: card.icon }),
        /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("span", { className: "lawyer-sidebar__card-body", children: [
          /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("span", { className: "lawyer-sidebar__card-title", children: card.label }),
          /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("span", { className: "lawyer-sidebar__card-hint", children: card.hint })
        ] }),
        card.custom && /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("span", { className: "lawyer-sidebar__card-badge", children: "\u81EA\u5B9A\u4E49" })
      ]
    },
    card.key
  ), renderRailButton = (card) => /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(
    "button",
    {
      type: "button",
      className: "lawyer-sidebar__rail-btn",
      onClick: card.onClick,
      title: card.title,
      "aria-label": card.label,
      children: card.icon
    },
    card.key
  );
  return /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)(import_jsx_runtime10.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)(
      "nav",
      {
        className: collapsed ? "lawyer-sidebar lawyer-sidebar--collapsed" : "lawyer-sidebar",
        "aria-label": "\u6478\u9C7C\u5DE5\u4F5C\u7AD9\u529F\u80FD\u680F",
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("div", { className: "lawyer-sidebar__header", children: [
            /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("span", { className: "lawyer-sidebar__brand", children: [
              /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("span", { className: "lawyer-sidebar__brand-mark", children: /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(SaltedFishMark, { size: 22 }) }),
              /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("span", { className: "lawyer-sidebar__brand-text", children: [
                /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(
                  "img",
                  {
                    className: "lawyer-sidebar__brand-name",
                    src: BRAND_LOGO_PNG_URI,
                    alt: "\u6478\u9C7C\u5DE5\u4F5C\u7AD9"
                  }
                ),
                /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("span", { className: "lawyer-sidebar__brand-sub", children: "\u4E00\u7AD9\u5F0F\u5F8B\u5E08 AI \u5DE5\u4F5C\u7AD9" })
              ] })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(
              "button",
              {
                type: "button",
                className: "lawyer-sidebar__toggle",
                onClick: toggleCollapsed,
                title: collapsed ? "\u5C55\u5F00\u529F\u80FD\u680F" : "\u6536\u8D77\u529F\u80FD\u680F",
                "aria-label": collapsed ? "\u5C55\u5F00\u529F\u80FD\u680F" : "\u6536\u8D77\u529F\u80FD\u680F",
                children: /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(ChevronIcon, { direction: collapsed ? "left" : "right" })
              }
            )
          ] }),
          !collapsed && /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("div", { className: "lawyer-sidebar__scroll", children: [
            builtinCards.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)(import_jsx_runtime10.Fragment, { children: [
              /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("p", { className: "lawyer-sidebar__section-title", children: "\u529F\u80FD" }),
              /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("div", { className: "lawyer-sidebar__group", children: builtinCards.map(renderCard) })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("p", { className: "lawyer-sidebar__section-title", children: "\u81EA\u5B9A\u4E49\u529F\u80FD" }),
            customCards.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("div", { className: "lawyer-sidebar__group", children: customCards.map(renderCard) }),
            cards.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("p", { className: "lawyer-sidebar__empty", children: "\u529F\u80FD\u5165\u53E3\u5DF2\u5168\u90E8\u5173\u95ED\u2014\u2014\u70B9\u51FB\u4E0B\u65B9\u300C\u6DFB\u52A0\u81EA\u5B9A\u4E49\u529F\u80FD\u300D\u91CD\u65B0\u6DFB\u52A0\u3002" }),
            /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)(
              "button",
              {
                type: "button",
                className: "lawyer-sidebar__add",
                onClick: openEntryManager,
                title: "\u6253\u5F00\u529F\u80FD\u914D\u7F6E\u9875\uFF1A\u65B0\u589E\u81EA\u5B9A\u4E49\u529F\u80FD\u3001\u8C03\u6574\u6216\u6062\u590D\u529F\u80FD\u5165\u53E3",
                children: [
                  /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("span", { className: "lawyer-sidebar__add-icon", children: /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(PlusIcon, {}) }),
                  /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("span", { className: "lawyer-sidebar__add-label", children: "\u6DFB\u52A0\u81EA\u5B9A\u4E49\u529F\u80FD" })
                ]
              }
            ),
            /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("p", { className: "lawyer-sidebar__section-title", children: [
              "\u5B9E\u52A1\u753B\u50CF",
              /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(
                "span",
                {
                  className: Object.values(profileStates).some((item) => item.configured) ? "lawyer-sidebar__dot lawyer-sidebar__dot--on" : "lawyer-sidebar__dot",
                  "aria-hidden": "true"
                }
              )
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("div", { className: "lawyer-sidebar__group", children: [
              /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)(
                "button",
                {
                  type: "button",
                  className: "lawyer-sidebar__card",
                  onClick: () => openProfile(PRIMARY_PROFILE_DOMAINS[0]),
                  title: "\u914D\u7F6E\u5B9E\u52A1\u753B\u50CF\uFF1A\u56E2\u961F\u7ACB\u573A\u3001\u5BA1\u67E5\u9608\u503C\u3001\u4E0A\u62A5\u4E0E\u884C\u6587\u98CE\u683C\u2014\u2014\u672C\u5DE5\u4F5C\u53F0\u6240\u6709\u6CD5\u5F8B\u529F\u80FD\u5728\u52A8\u7B14\u524D\u90FD\u4F1A\u8BFB\u53D6\u5B83",
                  children: [
                    /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("span", { className: "lawyer-sidebar__card-icon", children: /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(ProfileIcon, {}) }),
                    /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("span", { className: "lawyer-sidebar__card-body", children: [
                      /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("span", { className: "lawyer-sidebar__card-title", children: "\u5B9E\u52A1\u753B\u50CF" }),
                      /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("span", { className: "lawyer-sidebar__card-hint", children: profileSummary })
                    ] })
                  ]
                }
              ),
              /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)(
                "button",
                {
                  type: "button",
                  className: "lawyer-profile__entry",
                  onClick: () => setMcpPending(() => () => {
                  }),
                  title: "\u914D\u7F6E\u5143\u5178\u5F00\u653E\u5E73\u53F0 API Key\uFF1A\u6CD5\u89C4\u4E0E\u7C7B\u6848\u68C0\u7D22\u7684\u6570\u636E\u6E90",
                  children: [
                    /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("span", { className: "lawyer-profile__entry-icon", "aria-hidden": "true", children: "\u2318" }),
                    /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("span", { children: [
                      "\u5143\u5178\u6CD5\u89C4\u68C0\u7D22\uFF1A",
                      mcpSummary
                    ] })
                  ]
                }
              )
            ] })
          ] }),
          collapsed && /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("div", { className: "lawyer-sidebar__scroll", children: /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("div", { className: "lawyer-sidebar__rail", children: [
            builtinCards.map(renderRailButton),
            customCards.map(renderRailButton),
            /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(
              "button",
              {
                type: "button",
                className: "lawyer-sidebar__rail-btn lawyer-sidebar__rail-btn--add",
                onClick: openEntryManager,
                title: "\u6DFB\u52A0\u81EA\u5B9A\u4E49\u529F\u80FD\uFF08\u6253\u5F00\u529F\u80FD\u914D\u7F6E\u9875\uFF09",
                "aria-label": "\u6DFB\u52A0\u81EA\u5B9A\u4E49\u529F\u80FD",
                children: /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(PlusIcon, {})
              }
            ),
            /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(
              "button",
              {
                type: "button",
                className: "lawyer-sidebar__rail-btn",
                onClick: () => openProfile(PRIMARY_PROFILE_DOMAINS[0]),
                title: `\u5B9E\u52A1\u753B\u50CF\uFF08${profileSummary}\uFF09`,
                "aria-label": "\u5B9E\u52A1\u753B\u50CF",
                children: /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(ProfileIcon, {})
              }
            )
          ] }) })
        ]
      }
    ),
    reviewOpen && /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(
      ContractReviewDialog,
      {
        onCancel: () => setReviewOpen(!1),
        onSubmit: (request) => {
          setReviewOpen(!1), submitContractReview(request);
        },
        searchWorkspaceFiles,
        uploadWorkspaceFile,
        listInstalledSkills,
        profileEntry: renderProfileEntry("commercial-legal")
      }
    ),
    caseOpen && /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(
      CaseAnalysisDialog,
      {
        onCancel: () => setCaseOpen(!1),
        onSubmit: (request) => {
          setCaseOpen(!1), submitCaseAnalysis(request);
        },
        searchWorkspaceFiles,
        uploadWorkspaceFile,
        profileEntry: renderProfileEntry("litigation-legal")
      }
    ),
    docOpen && /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(
      DocGenerationDialog,
      {
        onCancel: () => setDocOpen(!1),
        onSubmit: (request) => {
          setDocOpen(!1), submitDocGeneration(request);
        },
        searchWorkspaceFiles,
        uploadWorkspaceFile,
        profileEntry: renderProfileEntry("litigation-legal")
      }
    ),
    customOpen !== null && /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(
      CustomEntryDialog,
      {
        entry: customOpen,
        onCancel: () => {
          setCustomOpen(null);
        },
        onSubmit: (request) => {
          setCustomOpen(null), submitCustomEntry(request);
        },
        searchWorkspaceFiles,
        uploadWorkspaceFile
      }
    ),
    profileTarget !== null && /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(
      PracticeProfileDialog,
      {
        initialDomain: profileTarget.domain,
        initialTab: profileTarget.tab,
        onCancel: closeProfilePanel,
        onSaved: handleProfileSaved,
        onStartInterview: startInterview,
        profileApi,
        customDomains: entries.flatMap((entry) => entry.kind === "custom" && entry.legal !== void 0 ? [entry.legal.domain] : []),
        dismissedDomains,
        onRestoreGuide: (domain) => {
          persistProfileDismissed(dismissedDomains.filter((item) => item !== domain));
        }
      }
    ),
    mcpPending !== null && /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(
      YuandianMcpDialog,
      {
        status: mcpStatus,
        secretsApi,
        onChanged: setMcpStatus,
        onClose: closeMcpGuide,
        onDismiss: () => {
          persistMcpDismissed(!0), closeMcpGuide();
        }
      }
    ),
    guideFor !== null && /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(
      ProfileGuideDialog,
      {
        domainLabel: findProfileDomain(ENTRY_DOMAINS[guideFor])?.label ?? ENTRY_DOMAINS[guideFor],
        onFullSetup: () => setupProfileThen(guideFor, "interview"),
        onQuickSetup: () => setupProfileThen(guideFor, "quick"),
        onSkip: () => skipGuide(guideFor)
      }
    )
  ] });
}

// plugins/lawyer-sidebar/src/client/index.ts
var inject = ["slots", "sessions", "workspaces", "connection"], LAWYER_PRESET = "lawyer", STYLE_TAG = "lawyer-sidebar/entry", ENTRY_CSS = `
/* \u4E3B\u7A97\u53E3\u907F\u8BA9\uFF1A\u5E03\u5C40\u58F3\u6839\uFF08[data-shell-overlay] \u5BB9\u5668\u7684\u76F4\u63A5\u7236\u7EA7\uFF0C\u5373 AppFrame
   \u7684 .frame\uFF09\u6309\u8FB9\u680F\u72B6\u6001\u8BA9\u51FA\u5BF9\u5E94\u5BBD\u5EA6\u2014\u2014\u5C55\u5F00/\u6536\u7F29\u4E24\u6001\u5747\u4E0D\u8986\u76D6\u4E3B\u754C\u9762\u3002
   margin-right \u8FC7\u6E21\u4E0E .lawyer-sidebar \u7684 width \u52A8\u753B\u540C\u6B65\uFF08180ms ease\uFF09\uFF0C
   \u5E76\u4FDD\u7559 .frame \u81EA\u8EAB\u7684 grid-template-columns \u52A8\u753B\u66F2\u7EBF\u3002 */
:has(> [data-shell-overlay] .lawyer-sidebar:not(.lawyer-sidebar--collapsed)) {
  margin-right: 236px;
}
:has(> [data-shell-overlay] .lawyer-sidebar--collapsed) {
  margin-right: 64px;
}
:has(> [data-shell-overlay] .lawyer-sidebar) {
  transition:
    margin-right 180ms ease,
    grid-template-columns var(--ds-transition-duration-slow) var(--ds-ease-in-out);
}
@media (prefers-reduced-motion: reduce) {
  :has(> [data-shell-overlay] .lawyer-sidebar) {
    transition: none;
  }
}
.lawyer-sidebar {
  position: fixed;
  right: 0;
  top: 0;
  bottom: 0;
  width: 236px;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  background: var(--dsw-alias-button-elevated-fill);
  border-left: 1px solid var(--dsw-alias-border-l2);
  box-shadow: -4px 0 16px rgb(0 0 0 / 6%);
  font-family: inherit;
  overflow: hidden;
  transition: width 180ms ease;
}
.lawyer-sidebar--collapsed {
  width: 64px;
}
.lawyer-sidebar__header {
  flex: none;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px 12px 10px;
  border-bottom: 1px solid var(--dsw-alias-border-l1);
}
.lawyer-sidebar--collapsed .lawyer-sidebar__header {
  flex-direction: column;
  gap: 10px;
  padding: 12px 6px 10px;
}
.lawyer-sidebar__brand {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 9px;
}
.lawyer-sidebar--collapsed .lawyer-sidebar__brand {
  flex: none;
}
/* \u6536\u7F29\u8F68\u9053\u4EC5 64px \u5BBD\uFF1A\u85CF\u54C1\u724C\u5B57\u6807\u56FE\u4E0E\u526F\u6807\u9898\uFF08\u6EA2\u51FA\u88C1\u526A\u4E0D\u96C5\uFF09\uFF0C\u53EA\u7559\u54B8\u9C7C\u6807\u3002 */
.lawyer-sidebar--collapsed .lawyer-sidebar__brand-text {
  display: none;
}
.lawyer-sidebar__brand-mark {
  flex: none;
  display: inline-flex;
  color: var(--dsw-alias-brand-text, var(--dsw-alias-label-primary));
}
.lawyer-sidebar__brand-text {
  min-width: 0;
  display: flex;
  flex-direction: column;
  line-height: 1.2;
  white-space: nowrap;
}
/* \u54C1\u724C\u4E3B\u540D\uFF1A\u300C\u9C7C\u5B57\u8C61\u5F62\u300D\u5B57\u6807\u56FE\uFF08\u9AD8 26px\uFF0C\u5BBD\u6309\u56FE\u81EA\u8EAB\u6BD4\u4F8B\u81EA\u9002\u5E94\uFF09\u66FF\u4EE3
   \u539F\u91D1\u6A59\u2192\u73CA\u745A\u7C89\u6E10\u53D8\u6587\u5B57\uFF1Balt \u63D0\u4F9B\u65E0\u969C\u788D\u540D\u79F0\u3002 */
.lawyer-sidebar__brand-name {
  display: block;
  height: 26px;
  width: auto;
}
.lawyer-sidebar__brand-sub {
  margin-top: 2px;
  font-size: 10.5px;
  font-weight: 450;
  letter-spacing: 0.06em;
  color: var(--dsw-alias-label-tertiary);
}
.lawyer-sidebar__toggle {
  flex: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: var(--dsw-alias-label-tertiary);
  font-family: inherit;
  cursor: pointer;
  transition: background-color 120ms ease, color 120ms ease;
}
.lawyer-sidebar__toggle:hover {
  background: var(--dsw-alias-interactive-bg-hover);
  color: var(--dsw-alias-label-primary);
}
.lawyer-sidebar__scroll {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 12px;
}
.lawyer-sidebar--collapsed .lawyer-sidebar__scroll {
  padding: 10px 8px;
}
.lawyer-sidebar__section-title {
  margin: 2px 2px 8px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.08em;
  color: var(--dsw-alias-label-tertiary);
  white-space: nowrap;
}
.lawyer-sidebar__section-title:not(:first-child) {
  margin-top: 14px;
}
.lawyer-sidebar__group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.lawyer-sidebar__card {
  position: relative;
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  box-sizing: border-box;
  padding: 9px 10px;
  border: 1px solid var(--dsw-alias-border-l2);
  border-radius: 12px;
  background: var(--dsw-alias-bg-layer-1, transparent);
  color: var(--dsw-alias-label-primary);
  font-family: inherit;
  text-align: left;
  cursor: pointer;
  transition: border-color 120ms ease, background-color 120ms ease, transform 120ms ease, box-shadow 120ms ease;
}
.lawyer-sidebar__card:hover {
  border-color: var(--dsw-alias-brand-primary);
  transform: translateY(-1px);
  box-shadow: 0 4px 14px rgb(0 0 0 / 8%);
}
.lawyer-sidebar__card:active {
  transform: translateY(0);
  opacity: 0.88;
}
.lawyer-sidebar__card-icon {
  flex: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: 10px;
  background: var(--dsw-alias-interactive-bg-hover);
  color: var(--dsw-alias-brand-text, var(--dsw-alias-label-primary));
}
.lawyer-sidebar__card-body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 1px;
}
.lawyer-sidebar__card-title {
  font-size: 13px;
  font-weight: 550;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.lawyer-sidebar__card-hint {
  font-size: 11px;
  color: var(--dsw-alias-label-tertiary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.lawyer-sidebar__card-badge {
  flex: none;
  padding: 1px 6px;
  border: 1px solid var(--dsw-alias-border-l2);
  border-radius: 999px;
  font-size: 10px;
  color: var(--dsw-alias-label-tertiary);
}
.lawyer-sidebar__add {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  box-sizing: border-box;
  margin-top: 10px;
  padding: 10px 12px;
  border: 1.5px dashed var(--dsw-alias-border-l2);
  border-radius: 12px;
  background: transparent;
  color: var(--dsw-alias-label-secondary, inherit);
  font-size: 13px;
  font-family: inherit;
  cursor: pointer;
  transition: border-color 120ms ease, color 120ms ease, background-color 120ms ease;
}
.lawyer-sidebar__add:hover {
  border-color: var(--dsw-alias-brand-primary);
  color: var(--dsw-alias-label-primary);
  background: var(--dsw-alias-interactive-bg-hover);
}
.lawyer-sidebar__add-icon {
  display: inline-flex;
}
.lawyer-sidebar__rail {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}
.lawyer-sidebar__rail-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border: 1px solid var(--dsw-alias-border-l2);
  border-radius: 12px;
  background: var(--dsw-alias-bg-layer-1, transparent);
  color: var(--dsw-alias-label-primary);
  font-family: inherit;
  cursor: pointer;
  transition: border-color 120ms ease, background-color 120ms ease;
}
.lawyer-sidebar__rail-btn:hover {
  border-color: var(--dsw-alias-brand-primary);
  background: var(--dsw-alias-interactive-bg-hover);
}
.lawyer-sidebar__rail-btn:active {
  opacity: 0.88;
}
.lawyer-sidebar__rail-btn--add {
  border-style: dashed;
  color: var(--dsw-alias-label-tertiary);
}
.lawyer-sidebar__empty {
  margin: 8px 4px;
  font-size: 12px;
  line-height: 1.6;
  color: var(--dsw-alias-label-tertiary);
}
/* \u54C1\u724C\u906E\u853D\uFF1A\u6CE8\u5165 dsh \u5DE6\u4FA7\u680F brand \u884C\uFF08.brandName \u5BB9\u5668\u4E3A inline-flex\uFF09\u4E0E
   \u4F1A\u8BDD hero \u7684\u540D\u79F0/\u6807\u8BC6\uFF08\u7EC4\u4EF6\u89C1 LawyerSidebar.tsx\uFF1B\u6807\u8BB0\u89C1\u4E0B\u65B9\u54C1\u724C\u5E38\u91CF\uFF09\u3002 */
/* \u54C1\u724C\u4E3B\u540D\uFF08dsh \u5DE6\u4FA7\u680F\u54C1\u724C\u884C\uFF09\uFF1A\u300C\u9C7C\u5B57\u8C61\u5F62\u300D\u5B57\u6807\u56FE\u66FF\u4EE3\u6E10\u53D8\u6587\u5B57
   \uFF08\u9AD8 20px \u4E0E\u539F 15px \u6587\u5B57\u89C6\u89C9\u91CF\u7EA7\u76F8\u5F53\uFF09\u3002 */
.lawyer-brand-name-main {
  display: block;
  height: 20px;
  width: auto;
}
/* \u4F1A\u8BDD hero\uFF1A\u5927\u54B8\u9C7C\u6807\u67D3\u73CA\u745A\u7C89\uFF0C\u5927\u6807\u9898\uFF08fishHitbox \u7684\u7D27\u90BB\u5144\u5F1F
   headlineText\u2014\u2014:has \u7ED3\u6784\u951A\u70B9\u7CBE\u786E\u5B9A\u4F4D\uFF09\u4EE5\u300C\u9C7C\u5B57\u8C61\u5F62\u300D\u5B57\u6807\u56FE\u5448\u73B0\u2014\u2014
   \u6587\u5B57\u672C\u4F53\u8BBE\u4E3A\u900F\u660E\u5360\u4F4D\uFF08DOM \u6587\u672C\u4ECD\u662F"\u6478\u9C7C\u5DE5\u4F5C\u7AD9"\uFF0C\u8BFB\u5C4F\u4E0E\u590D\u5236\u53EF\u8BFB\uFF1B
   React \u91CD\u6E32\u67D3\u53EA\u6539\u6587\u672C\u8282\u70B9\uFF0C\u4E0D\u5F71\u54CD\u80CC\u666F\u56FE\uFF09\uFF1Bpreview \u5FBD\u6807\uFF08\u7B2C\u4E8C\u4E2A
   \u5144\u5F1F span\uFF09\u4FDD\u6301\u539F\u751F\u6837\u5F0F\u4E0D\u53D7\u5F71\u54CD\u3002 */
.lawyer-hero-mark {
  color: #FB7185;
}
span:has(> .lawyer-hero-mark) + span {
  background: url("${BRAND_LOGO_PNG_URI}") center / contain no-repeat;
  color: transparent;
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
.lawyer-dialog__demo {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  margin: -4px 0 14px;
}
.lawyer-dialog__demo-btn {
  flex: none;
  height: 30px;
  padding: 0 12px;
  border: 1px solid var(--dsw-alias-border-l2);
  border-radius: 8px;
  background: var(--dsw-alias-interactive-bg-hover);
  color: var(--dsw-alias-label-primary);
  font-size: 13px;
  font-family: inherit;
  cursor: pointer;
  transition: border-color 120ms ease, background-color 120ms ease;
}
.lawyer-dialog__demo-btn:not(:disabled):hover {
  border-color: var(--dsw-alias-brand-primary);
  background: var(--dsw-alias-bg-layer-1, transparent);
}
.lawyer-dialog__demo-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.lawyer-dialog__demo-hint {
  min-width: 0;
  font-size: 12px;
  line-height: 1.5;
  color: #2da44e;
}
/* \u804A\u5929\u533A\u6587\u4EF6\u8DEF\u5F84\u70B9\u51FB\u6253\u5F00\uFF08M6.3\uFF09\uFF1Aweak=\u6DF7\u5408\u6587\u672C\u4EC5\u624B\u52BF\u63D0\u793A\uFF0Cstrong=\u6574\u6BB5
   \u5373\u8DEF\u5F84\u7684\u5F3A\u63D0\u793A\uFF08\u4E0B\u5212\u865A\u7EBF + \u54C1\u724C\u8272\uFF09\u3002 */
.lawyer-file-hit {
  cursor: pointer;
}
.lawyer-file-hit--strong {
  cursor: pointer;
  color: var(--dsw-alias-brand-text, var(--dsw-alias-label-primary));
  text-decoration: underline dotted;
  text-underline-offset: 3px;
}
.lawyer-file-hit--strong:hover {
  text-decoration-style: solid;
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
.lawyer-dialog__candidate-row {
  display: flex;
  align-items: stretch;
  gap: 4px;
}
.lawyer-dialog__candidate-row .lawyer-dialog__candidate--grow {
  flex: 1;
  min-width: 0;
}
.lawyer-dialog__candidate-add {
  flex: none;
  padding: 5px 8px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: var(--dsw-alias-label-secondary, inherit);
  font-size: 12px;
  font-family: inherit;
  white-space: nowrap;
  cursor: pointer;
}
.lawyer-dialog__candidate-add:not(:disabled):hover {
  background: var(--dsw-alias-interactive-bg-hover);
  color: var(--dsw-alias-label-primary);
}
.lawyer-dialog__candidate-add:disabled {
  cursor: default;
  opacity: 0.7;
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
  /* \u4E3B\u6309\u94AE\u6587\u5B57\u5FC5\u987B\u7528 label-primary-foreground\uFF08\u4EAE\u4E3B\u9898=\u767D/\u6697\u4E3B\u9898=\u8FD1\u9ED1\uFF09\uFF0C
     \u4E0E dsh \u5B98\u65B9 Button.primary / primaryButton \u540C\u6B3E\u3002\u4E4B\u524D\u8BEF\u7528
     brand-primary-invert\uFF1A\u5B83\u5728\u4EAE\u4E3B\u9898\u4E0B\u662F bluish-1000\uFF08\u8FD1\u9ED1\uFF09\uFF0C\u843D\u5230\u8FD1\u9ED1
     \u5E95\u4E0A\u5C31\u662F\u9ED1\u5B57\u538B\u9ED1\u5E95\u3001\u6587\u5B57\u4E0D\u53EF\u8BFB\u3002 */
  color: var(--dsw-alias-label-primary-foreground, #fff);
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
/* \u81EA\u5B9A\u4E49\u5165\u53E3\u901A\u7528\u8868\u5355\uFF08M8\uFF1A\u6309\u914D\u7F6E\u5B57\u6BB5\u6E32\u67D3\uFF09 */
.lawyer-dialog__field + .lawyer-dialog__field {
  margin-top: 2px;
}
.lawyer-dialog__options {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
.lawyer-dialog__option {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  cursor: pointer;
}
.lawyer-dialog__option input {
  accent-color: var(--dsw-alias-button-primary-fill);
}

/* \u2500\u2500 M8 \u5B9E\u52A1\u753B\u50CF \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
   \u914D\u7F6E\u7C7B\u64CD\u4F5C\u7528\u54C1\u724C\u6A59\u9AD8\u4EAE\uFF0C\u4E0E\u4EFB\u52A1\u5165\u53E3\u7684\u4E2D\u6027\u8272\u533A\u5206\u5F00\u2014\u2014\u4F20\u8FBE\u300C\u8FD9\u662F\u4E00\u6B21\u6027
   \u914D\u7F6E\uFF0C\u4E0D\u662F\u65E5\u5E38\u4EFB\u52A1\u300D\u3002\u6A59\u503C\u4E0E\u54C1\u724C\u5B89\u5168\u5E3D\u56FE\u6807\u4E00\u81F4\uFF08#E8833A\uFF09\uFF0C\u4E0D\u8DDF\u4E3B\u9898
   \u4EE4\u724C\uFF0C\u4EAE\u6697\u4E24\u4E3B\u9898\u4E0B\u90FD\u4FDD\u6301\u540C\u4E00\u54C1\u724C\u8BC6\u522B\u3002 */
.lawyer-sidebar__dot {
  display: inline-block;
  width: 6px;
  height: 6px;
  margin-left: 6px;
  border: 1px solid #E8833A;
  border-radius: 50%;
  vertical-align: middle;
}
.lawyer-sidebar__dot--on {
  background: #E8833A;
}
.lawyer-profile {
  width: min(760px, calc(100vw - 48px));
}
.lawyer-profile__body {
  display: flex;
  gap: 16px;
  margin-top: 12px;
}
.lawyer-profile__domains {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 0 0 190px;
}
.lawyer-profile__domain {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  padding: 8px 10px;
  border: 1px solid transparent;
  border-radius: 8px;
  background: transparent;
  font-size: 13px;
  font-family: inherit;
  text-align: left;
  cursor: pointer;
}
.lawyer-profile__domain:not(:disabled):hover {
  background: var(--dsw-alias-interactive-bg-hover);
}
.lawyer-profile__domain--active {
  background: rgb(232 131 58 / 10%);
  border-color: rgb(232 131 58 / 35%);
  color: var(--dsw-alias-label-primary);
  font-weight: 500;
}
.lawyer-profile__badge {
  flex: none;
  padding: 1px 5px;
  border-radius: 4px;
  background: rgb(232 131 58 / 14%);
  color: #C96A28;
  font-size: 10px;
}
.lawyer-profile__more {
  margin-top: 4px;
  padding: 6px 10px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: var(--dsw-alias-label-secondary);
  font-size: 12px;
  font-family: inherit;
  text-align: left;
  cursor: pointer;
}
.lawyer-profile__more:not(:disabled):hover {
  color: var(--dsw-alias-label-primary);
}
.lawyer-profile__main {
  flex: 1 1 auto;
  min-width: 0;
}
.lawyer-profile__tabs {
  display: flex;
  gap: 4px;
  border-bottom: 1px solid var(--dsw-alias-border-l2);
}
.lawyer-profile__tab {
  padding: 7px 12px;
  border: none;
  border-bottom: 2px solid transparent;
  background: transparent;
  color: var(--dsw-alias-label-secondary);
  font-size: 13px;
  font-family: inherit;
  cursor: pointer;
}
.lawyer-profile__tab--active {
  border-bottom-color: #E8833A;
  color: var(--dsw-alias-label-primary);
  font-weight: 500;
}
.lawyer-profile__pane {
  padding-top: 12px;
}
.lawyer-profile__group {
  padding: 10px 12px;
  margin-bottom: 10px;
  border-radius: 10px;
  background: var(--dsw-alias-interactive-bg-hover);
}
.lawyer-profile__group-title {
  margin: 0 0 8px;
  font-size: 12px;
  font-weight: 600;
  color: var(--dsw-alias-label-secondary);
}
.lawyer-profile__field + .lawyer-profile__field {
  margin-top: 10px;
}
.lawyer-profile__hint {
  margin: 6px 0 0;
  font-size: 11px;
  line-height: 1.6;
  color: var(--dsw-alias-label-tertiary);
}
.lawyer-profile__textarea {
  min-height: 54px;
  resize: vertical;
}
.lawyer-profile__raw {
  min-height: 260px;
  resize: vertical;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 12px;
  line-height: 1.6;
}
.lawyer-profile__notice {
  padding: 8px 10px;
  margin: 0 0 10px;
  border-radius: 8px;
  background: rgb(232 131 58 / 10%);
  font-size: 12px;
  line-height: 1.6;
  color: var(--dsw-alias-label-secondary);
}
.lawyer-profile__error {
  padding: 8px 10px;
  margin: 10px 0 0;
  border-radius: 8px;
  background: rgb(214 69 69 / 10%);
  font-size: 12px;
  line-height: 1.6;
  color: #D64545;
}
.lawyer-profile__mode {
  margin-top: 12px;
}
.lawyer-profile__mode-btn {
  width: 100%;
}
/* \u2500\u2500 L2 \u5B8C\u6574\u95EE\u5377\uFF08M8.7\uFF09\uFF1A\u6B65\u9AA4\u8FDB\u5EA6 + \u6267\u4E1A\u8EAB\u4EFD\u9009\u9879\u5361 + \u6B65\u9AA4\u5BFC\u822A \u2500\u2500
   \u8EAB\u4EFD\u5361\u51B3\u5B9A\u540E\u7EED\u6B65\u9AA4\u8D70\u5F8B\u5E08\u7248\u8FD8\u662F\u6CD5\u52A1\u7248\uFF0C\u6545\u505A\u6210\u4E24\u5F20\u5927\u5361\u800C\u975E\u4E0B\u62C9\uFF1A
   \u7528\u6237\u7B2C\u4E00\u773C\u5C31\u8981\u610F\u8BC6\u5230\u300C\u4E24\u5957\u95EE\u9898\u94FE\u300D\u8FD9\u4EF6\u4E8B\u3002 */
.lawyer-profile__stepbar {
  margin-bottom: 12px;
}
.lawyer-profile__step-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 8px;
  font-size: 13px;
  font-weight: 600;
  color: var(--dsw-alias-label-primary);
}
.lawyer-profile__identity-tag {
  padding: 1px 7px;
  border-radius: 999px;
  background: rgb(232 131 58 / 14%);
  color: #C96A28;
  font-size: 11px;
  font-weight: 500;
}
.lawyer-profile__progress {
  height: 4px;
  border-radius: 999px;
  overflow: hidden;
  background: var(--dsw-alias-interactive-bg-hover);
}
.lawyer-profile__progress-fill {
  height: 100%;
  border-radius: 999px;
  background: linear-gradient(90deg, #F5A76A, #E8833A);
  transition: width .25s ease;
}
.lawyer-profile__identity {
  display: flex;
  gap: 10px;
  margin-bottom: 12px;
}
.lawyer-profile__identity-card {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 4px;
  padding: 12px;
  border: 1.5px solid var(--dsw-alias-border-primary);
  border-radius: 12px;
  background: var(--dsw-alias-bg-primary);
  text-align: left;
  font-family: inherit;
  cursor: pointer;
  transition: border-color .18s ease, background .18s ease, transform .18s ease;
}
.lawyer-profile__identity-card:not(:disabled):hover {
  border-color: #F5A76A;
  transform: translateY(-1px);
}
.lawyer-profile__identity-card--active {
  border-color: #E8833A;
  background: rgb(232 131 58 / 8%);
}
.lawyer-profile__identity-name {
  font-size: 13px;
  font-weight: 600;
  color: var(--dsw-alias-label-primary);
}
.lawyer-profile__identity-card--active .lawyer-profile__identity-name {
  color: #C96A28;
}
.lawyer-profile__identity-hint {
  font-size: 11px;
  line-height: 1.6;
  color: var(--dsw-alias-label-tertiary);
}
.lawyer-profile__step-nav {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  margin-top: 14px;
}
.lawyer-profile__step-nav .lawyer-dialog__submit,
.lawyer-profile__step-nav .lawyer-dialog__cancel {
  min-width: 96px;
}
.lawyer-profile__steps {
  margin: 10px 0 0;
  padding-left: 18px;
  font-size: 12px;
  line-height: 1.8;
  color: var(--dsw-alias-label-secondary);
}
.lawyer-profile__status {
  margin-top: 12px;
  font-size: 11px;
  color: var(--dsw-alias-label-tertiary);
}
.lawyer-profile__link {
  border: none;
  background: transparent;
  color: var(--dsw-alias-label-secondary);
  font-size: 12px;
  font-family: inherit;
  cursor: pointer;
  text-decoration: underline;
}
.lawyer-profile__link:not(:disabled):hover {
  color: var(--dsw-alias-label-primary);
}
.lawyer-profile__entry {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 0;
  border: none;
  background: transparent;
  color: var(--dsw-alias-label-secondary);
  font-size: 12px;
  font-family: inherit;
  cursor: pointer;
}
.lawyer-profile__entry:not(:disabled):hover {
  color: #C96A28;
}
.lawyer-profile__entry-icon {
  color: #E8833A;
}
.lawyer-profile-guide {
  width: min(520px, calc(100vw - 48px));
}
/* \u2500\u2500 M8.6 \u5F15\u5BFC\u5F39\u7A97\uFF08\u9996\u542F API Key \u5F15\u5BFC / \u5143\u5178 MCP \u6CE8\u518C\u5F15\u5BFC\uFF09\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
   \u4E24\u5757\u5F15\u5BFC\u5171\u7528\u4E00\u5957\u5916\u89C2\uFF1A\u6B63\u6587\u4E0B\u65B9\u4E00\u5217\u300C\u53EF\u70B9\u5916\u94FE\u300D\u5361\u7247\uFF0C\u6BCF\u4E2A\u94FE\u63A5\u4E00\u884C\u4E3B
   \u6587\u6848 + \u4E00\u884C\u8BF4\u660E\uFF0C\u53F3\u4FA7 \u2197 \u63D0\u793A\u4F1A\u8DF3\u51FA\u5E94\u7528\uFF08\u8D70\u7CFB\u7EDF\u6D4F\u89C8\u5668\uFF09\u3002 */
.lawyer-guide {
  width: min(600px, calc(100vw - 48px));
}
.lawyer-guide__links {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 12px;
}
.lawyer-guide__link {
  display: flex;
  flex-direction: column;
  gap: 2px;
  box-sizing: border-box;
  width: 100%;
  padding: 9px 12px;
  border: 1px solid var(--dsw-alias-border-l2);
  border-radius: 10px;
  background: var(--dsw-alias-bg-layer-1, transparent);
  color: var(--dsw-alias-label-primary);
  font-size: 13px;
  font-family: inherit;
  text-align: left;
  cursor: pointer;
  transition: border-color 120ms ease, background-color 120ms ease;
}
.lawyer-guide__link:not(:disabled):hover {
  border-color: var(--dsw-alias-brand-primary);
  background: var(--dsw-alias-interactive-bg-hover);
}
.lawyer-guide__link-label {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-weight: 500;
}
.lawyer-guide__link-arrow {
  color: var(--dsw-alias-brand-text, var(--dsw-alias-label-tertiary));
}
.lawyer-guide__link-note {
  font-size: 11.5px;
  line-height: 1.5;
  color: var(--dsw-alias-label-tertiary);
}
.lawyer-guide__result {
  margin: 10px 0 0;
  padding: 8px 10px;
  border-radius: 8px;
  background: rgb(214 69 69 / 10%);
  font-size: 12px;
  line-height: 1.6;
  color: #D64545;
}
.lawyer-guide__result--ok {
  background: rgb(45 164 78 / 10%);
  color: #2da44e;
}
/* \u5B98\u65B9 Key \u8F93\u5165\u6846\u91CC\u8865\u7684\u90A3\u4E00\u884C\uFF08DOM \u6CE8\u5165\uFF0C\u89C1 installOfficialKeyHint\uFF09\u2014\u2014
   \u8D34\u7740\u8BF4\u660E\u6BB5\u843D\u540E\uFF0C\u5B57\u53F7\u4E0E\u8BF4\u660E\u4E00\u81F4\uFF0C\u94FE\u63A5\u7528\u54C1\u724C\u8272\u3002 */
.lawyer-guide__hint {
  margin: 6px 0 0;
  font-size: 12px;
  line-height: 1.7;
  color: var(--dsw-alias-label-tertiary);
}
.lawyer-guide__hint-link {
  color: var(--dsw-alias-brand-text, var(--dsw-alias-label-primary));
  text-decoration: underline;
  text-underline-offset: 2px;
}
.lawyer-guide code {
  padding: 1px 4px;
  border-radius: 4px;
  background: var(--dsw-alias-interactive-bg-hover);
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 11.5px;
}
@media (max-width: 720px) {
  .lawyer-profile__body {
    flex-direction: column;
  }
  .lawyer-profile__domains {
    flex: none;
    flex-direction: row;
    flex-wrap: wrap;
  }
}
`;
function injectStyles() {
  let marker = `style[data-plugin-css="${STYLE_TAG}"]`;
  if (document.querySelector(marker) !== null) return;
  let tag = document.createElement("style");
  tag.dataset.plugin = "lawyer-sidebar", tag.dataset.pluginCss = STYLE_TAG, tag.textContent = ENTRY_CSS, document.head.appendChild(tag);
}
var BRAND_NAME = "\u6478\u9C7C\u5DE5\u4F5C\u7AD9", BRAND_SUBTITLE = "\u4E00\u7AD9\u5F0F\u5F8B\u5E08 AI \u5DE5\u4F5C\u7AD9", BRAND_TITLE = `${BRAND_NAME} \xB7 ${BRAND_SUBTITLE}`, DEEPSEEK_TEXT_REPLACEMENTS = {
  // hero.headline（中/英）
  \u63A2\u7D22\u672A\u81F3\u4E4B\u5883: BRAND_NAME,
  "Into the Unknown": BRAND_NAME,
  // hero.preview 徽标 → 副标题（中/英）
  \u9884\u89C8\u7248: BRAND_SUBTITLE,
  Preview: BRAND_SUBTITLE,
  // 构建期注入的 document.title（official / local 两类构建产物）
  "DeepSeek Harness": BRAND_TITLE,
  "DSH Local Build": BRAND_TITLE
}, BRAND_FAVICON_URI = `data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"><rect width="24" height="24" rx="6" fill="#F59E0B"/><ellipse cx="10.6" cy="9.4" rx="6.4" ry="4.6" stroke="#fff" stroke-width="1.4"/><path d="M16.8 9.4l2.8-2c.3-.21.7.02.7.37v3.26c0 .35-.4.58-.7.37l-2.8-2Z" fill="#fff"/><path d="M6.9 9.1c.45.45 1.1.45 1.55 0M9.9 9.1c.45.45 1.1.45 1.55 0" stroke="#F59E0B" stroke-width="1.1" stroke-linecap="round"/><circle cx="8.4" cy="11" r=".7" stroke="#F59E0B" stroke-width="1"/><circle cx="5.6" cy="10.6" r=".75" fill="#fff" opacity=".5"/><path d="M13 7.2c.7-.55 1.6-.55 2.3 0" stroke="#fff" stroke-width="1" stroke-linecap="round" opacity=".6"/><path d="M3.2 17.6c.9-.8 1.9-.8 2.8 0s1.9.8 2.8 0 1.9-.8 2.8 0 1.9.8 2.8 0 1.9-.8 2.8 0" stroke="#fff" stroke-width="1.2" stroke-linecap="round"/></svg>'
)}`;
function patchDeepSeekText(node) {
  if (node.nodeType !== Node.TEXT_NODE) return;
  let raw = node.nodeValue;
  if (raw === null || raw.trim() === "") return;
  let parent = node.parentElement;
  if (parent !== null && parent.tagName === "TITLE") {
    let patched = raw.replaceAll("DeepSeek Harness", BRAND_TITLE).replaceAll("DSH Local Build", BRAND_TITLE);
    patched !== raw && (node.nodeValue = patched);
    return;
  }
  let replacement = DEEPSEEK_TEXT_REPLACEMENTS[raw.trim()];
  replacement !== void 0 && raw.trim() !== replacement && (node.nodeValue = raw.replace(raw.trim(), replacement));
}
function patchDeepSeekTree(root) {
  let walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT), current = walker.nextNode();
  for (; current !== null; )
    patchDeepSeekText(current), current = walker.nextNode();
}
function applyBranding(ctx) {
  document.title = BRAND_TITLE;
  let icon = document.querySelector('link[rel="icon"], link[rel="shortcut icon"]');
  if (icon !== null)
    icon.href = BRAND_FAVICON_URI;
  else {
    let created = document.createElement("link");
    created.rel = "icon", created.href = BRAND_FAVICON_URI, document.head.appendChild(created);
  }
  patchDeepSeekTree(document.documentElement);
  let observer = new MutationObserver((mutations) => {
    for (let mutation of mutations)
      if (mutation.type === "characterData")
        patchDeepSeekText(mutation.target);
      else if (mutation.type === "childList")
        for (let added of mutation.addedNodes)
          added.nodeType === Node.TEXT_NODE ? patchDeepSeekText(added) : added.nodeType === Node.ELEMENT_NODE && patchDeepSeekTree(added);
  });
  observer.observe(document.documentElement, { subtree: !0, childList: !0, characterData: !0 }), ctx.on("dispose", () => {
    observer.disconnect();
  }), ctx.slots.inject("sidebar.brand.mark", () => ctx.slots.register(
    { name: "sidebar.brand.mark", priority: -1 },
    SaltedFishMark
  )), ctx.slots.inject("sidebar.brand.name", () => ctx.slots.register(
    { name: "sidebar.brand.name", priority: -1 },
    MoyuBrandName
  )), ctx.slots.inject("conversation.hero.brand.mark", () => ctx.slots.register(
    { name: "conversation.hero.brand.mark", priority: -1 },
    MoyuHeroMark
  ));
}
var OFFICIAL_KEY_WINDOW_TITLES = [
  "\u6DFB\u52A0\u4E00\u4E2A API Key \u5F00\u59CB\u4F7F\u7528",
  "Add an API key to get started"
], OFFICIAL_KEY_WINDOW_DESCRIPTIONS = [
  "\u914D\u7F6E DeepSeek \u5B98\u65B9\u6A21\u578B\uFF0C\u5373\u53EF\u5F00\u59CB\u4F7F\u7528\u3002",
  "Configure the official DeepSeek provider to start building."
], KEY_HINT_FLAG = "data-lawyer-key-hint";
function findDescriptionParagraph(root) {
  let walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT), current = walker.nextNode();
  for (; current !== null; ) {
    let text2 = current.nodeValue?.trim() ?? "";
    if (OFFICIAL_KEY_WINDOW_DESCRIPTIONS.includes(text2)) {
      let parent = current.parentElement;
      return parent === null ? null : parent.closest("p") ?? parent;
    }
    current = walker.nextNode();
  }
  return null;
}
function buildKeyHint() {
  let hint = document.createElement("p");
  return hint.className = "lawyer-guide__hint", hint.append("\u8FD8\u6CA1\u6709 Key\uFF1F\u53BB DeepSeek \u5F00\u653E\u5E73\u53F0\u6CE8\u518C\u5E76\u521B\u5EFA\u5373\u53EF\uFF08"), [
    ["\u6CE8\u518C / \u767B\u5F55", "https://platform.deepseek.com/sign_in"],
    ["\u521B\u5EFA API Key", "https://platform.deepseek.com/api_keys"],
    ["\u5145\u503C", "https://platform.deepseek.com/top_up"]
  ].forEach(([label, url], index) => {
    index > 0 && hint.append(" \xB7 ");
    let anchor = document.createElement("a");
    anchor.className = "lawyer-guide__hint-link", anchor.href = url, anchor.target = "_blank", anchor.rel = "noopener noreferrer", anchor.textContent = label, hint.append(anchor);
  }), hint.append("\uFF09\u3002"), hint;
}
function installOfficialKeyHint(ctx) {
  let patch = () => {
    for (let dialog of document.querySelectorAll('[role="dialog"]')) {
      if (dialog.hasAttribute(KEY_HINT_FLAG)) continue;
      dialog.setAttribute(KEY_HINT_FLAG, "1");
      let ariaLabel = dialog.getAttribute("aria-label")?.trim() ?? "";
      if (!OFFICIAL_KEY_WINDOW_TITLES.includes(ariaLabel)) continue;
      let description = findDescriptionParagraph(dialog), parent = description?.parentElement;
      description === null || parent === void 0 || parent === null || parent.insertBefore(buildKeyHint(), description.nextSibling);
    }
  };
  patch();
  let observer = new MutationObserver(patch);
  observer.observe(document.body, { subtree: !0, childList: !0, characterData: !0 }), ctx.on("dispose", () => {
    observer.disconnect();
  });
}
var FILE_PATH_TOKEN_RE = /@?"(?:[A-Za-z]:[\\/][^"\n]*|\\\\[^"\n]*)"?|@?'(?:[A-Za-z]:[\\/][^'\n]*|\\\\[^'\n]*)'?|@?(?:[A-Za-z]:[\\/]|\\\\)[^\s`'“”‘’()[\]【】{}<>:"|,，。；、！？*_~]*/gu, FILE_PATH_CORE_RE = /^(?:[A-Za-z]:[\\/].+|\\\\.+)$/su, FILE_EXT_RE = /\.(?:docx?|pdf|md|txt|xlsx?|pptx?|csv|png|jpe?g|gif|webp|bmp|html?|json|xml|zip|7z|rar|py|js|mjs|cjs|ts|tsx|ps1|bat|cmd|yaml|yml)$/iu;
function normalizePathToken(token) {
  let candidate = token.trim();
  if (candidate.startsWith("@") && (candidate = candidate.slice(1)), candidate.length >= 2) {
    let first = candidate[0] ?? "", last = candidate[candidate.length - 1] ?? "";
    (first === '"' && last === '"' || first === "'" && last === "'") && (candidate = candidate.slice(1, -1));
  }
  return candidate = candidate.replace(/^["']|["']$/gu, "").replace(/[.,;:!?；，。]+$/u, ""), candidate === "" || !FILE_PATH_CORE_RE.test(candidate) || !FILE_EXT_RE.test(candidate) ? null : candidate;
}
function classifyTextNode(text2) {
  let trimmed = text2.trim();
  if (trimmed === "") return null;
  FILE_PATH_TOKEN_RE.lastIndex = 0;
  let matches = trimmed.match(FILE_PATH_TOKEN_RE);
  return matches === null ? null : matches.length === 1 && normalizePathToken(trimmed) !== null ? "strong" : "weak";
}
function markOpenableText(node) {
  if (node.nodeType !== Node.TEXT_NODE) return;
  let parent = node.parentElement;
  if (parent === null) return;
  let kind = classifyTextNode(node.nodeValue ?? "");
  kind === "strong" ? parent.classList.add("lawyer-file-hit--strong") : kind === "weak" && parent.classList.add("lawyer-file-hit");
}
function markOpenableTree(root) {
  if (root.nodeType === Node.TEXT_NODE) {
    markOpenableText(root);
    return;
  }
  let walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT), current = walker.nextNode();
  for (; current !== null; )
    markOpenableText(current), current = walker.nextNode();
}
function installChatPathLinks(ctx) {
  let lastOpenAt = 0, handleClick = (event) => {
    if (Date.now() - lastOpenAt < 500) return;
    let target = event.target;
    if (!(target instanceof Element) || target.closest("button, a, input, textarea, select, [contenteditable]") !== null) return;
    let container, offset = 0;
    if (typeof document.caretRangeFromPoint == "function") {
      let range = document.caretRangeFromPoint(event.clientX, event.clientY);
      range !== null && (container = range.startContainer, offset = range.startOffset);
    } else if (typeof document.caretPositionFromPoint == "function") {
      let position = document.caretPositionFromPoint(event.clientX, event.clientY);
      position !== null && (container = position.offsetNode, offset = position.offset);
    }
    if (container === void 0 || container.nodeType !== Node.TEXT_NODE) return;
    let text2 = container.nodeValue ?? "";
    if (offset < 0 || offset > text2.length) return;
    FILE_PATH_TOKEN_RE.lastIndex = 0;
    let match;
    for (; (match = FILE_PATH_TOKEN_RE.exec(text2)) !== null && !(match.index > offset); )
      if (offset <= match.index + match[0].length) {
        let path = normalizePathToken(match[0]);
        path !== null && (lastOpenAt = Date.now(), ctx.workspaces.openPath(path).catch((error) => {
          console.warn(`[lawyer-sidebar] \u6253\u5F00\u6587\u4EF6\u5931\u8D25\uFF08${path}\uFF09\uFF1A${error instanceof Error ? error.message : String(error)}`);
        }));
        break;
      }
  };
  document.addEventListener("click", handleClick, !0), markOpenableTree(document.body);
  let observer = new MutationObserver((mutations) => {
    for (let mutation of mutations)
      if (mutation.type === "characterData") {
        let parent = mutation.target.parentElement;
        parent !== null && parent.classList.remove("lawyer-file-hit", "lawyer-file-hit--strong"), markOpenableText(mutation.target);
      } else if (mutation.type === "childList")
        for (let added of mutation.addedNodes)
          added.nodeType === Node.TEXT_NODE ? markOpenableText(added) : added.nodeType === Node.ELEMENT_NODE && markOpenableTree(added);
  });
  observer.observe(document.body, { subtree: !0, childList: !0, characterData: !0 }), ctx.on("dispose", () => {
    document.removeEventListener("click", handleClick, !0), observer.disconnect();
  });
}
var LAWYER_SETTINGS_NAMESPACE = "lawyer-workbench";
function normalizeDomainList(raw) {
  if (!Array.isArray(raw)) return [];
  let seen = /* @__PURE__ */ new Set(), items = [];
  for (let item of raw) {
    if (typeof item != "string") continue;
    let trimmed = item.trim();
    trimmed === "" || seen.has(trimmed) || (seen.add(trimmed), items.push(trimmed));
  }
  return items;
}
function apply(ctx) {
  injectStyles(), applyBranding(ctx), installOfficialKeyHint(ctx), installChatPathLinks(ctx);
  let { api } = ctx.get("connection"), entriesSnapshot = FALLBACK_ENTRIES, entriesListeners = /* @__PURE__ */ new Set(), entriesSource = {
    getSnapshot() {
      return entriesSnapshot;
    },
    subscribe(listener) {
      return entriesListeners.add(listener), () => {
        entriesListeners.delete(listener);
      };
    }
  }, publishEntries = () => {
    for (let listener of entriesListeners) listener();
  }, dismissedSnapshot = [], dismissedListeners = /* @__PURE__ */ new Set(), dismissedSource = {
    getSnapshot() {
      return dismissedSnapshot;
    },
    subscribe(listener) {
      return dismissedListeners.add(listener), () => {
        dismissedListeners.delete(listener);
      };
    }
  }, publishDismissed = () => {
    for (let listener of dismissedListeners) listener();
  }, settingsScope, persistProfileDismissed = async (domains) => {
    if (settingsScope === void 0) return !1;
    try {
      return await settingsScope.set("profileDismissed", [...domains]), !0;
    } catch {
      return !1;
    }
  }, secretsApi = createSecretsApi(ctx), mcpDismissedListeners = /* @__PURE__ */ new Set(), mcpDismissedSnapshot = !1, mcpDismissedSource = {
    getSnapshot() {
      return mcpDismissedSnapshot;
    },
    subscribe(listener) {
      return mcpDismissedListeners.add(listener), () => {
        mcpDismissedListeners.delete(listener);
      };
    }
  }, publishMcpDismissed = () => {
    for (let listener of mcpDismissedListeners) listener();
  }, persistMcpDismissed = async (dismissed) => {
    if (mcpDismissedSnapshot = dismissed, publishMcpDismissed(), settingsScope === void 0) return !1;
    try {
      return await settingsScope.set("mcpDismissed", dismissed), !0;
    } catch {
      return !1;
    }
  }, API_KEY_GUIDE_STORAGE_KEY = "lawyer-sidebar:apiKeyGuideDone", apiKeyGuideDone = (() => {
    try {
      return localStorage.getItem(API_KEY_GUIDE_STORAGE_KEY) === "1";
    } catch {
      return !1;
    }
  })(), persistApiKeyGuideDone = () => {
    apiKeyGuideDone = !0;
    try {
      localStorage.setItem(API_KEY_GUIDE_STORAGE_KEY, "1");
    } catch {
    }
    settingsScope !== void 0 && settingsScope.set("apiKeyGuideDone", !0).catch(() => {
    });
  }, DEEPSEEK_CREDENTIAL_REFS = ["DEEPSEEK_API_KEY", "DEEPSEEK_OFFICIAL_API_KEY"], deepSeekKeyConfigured = async () => {
    let credentials = api.credentials;
    if (credentials === void 0 || typeof credentials.describe != "function") return !1;
    try {
      let response = await credentials.describe({ refs: DEEPSEEK_CREDENTIAL_REFS });
      if (!response.result.ok) return !1;
      let described = response.result.value?.credentials ?? {};
      return DEEPSEEK_CREDENTIAL_REFS.some((ref) => described[ref]?.configured === !0);
    } catch {
      return !1;
    }
  };
  ctx.inject(["settingsScope"], (scopeCtx) => {
    let scope = scopeCtx.settingsScope?.bind({ namespace: LAWYER_SETTINGS_NAMESPACE });
    if (scope === void 0) return;
    settingsScope = scope;
    let update = () => {
      let snapshot = scope.getSnapshot();
      snapshot.status === "ready" && snapshot.value !== void 0 ? (entriesSnapshot = normalizeEntries(snapshot.value.entries), dismissedSnapshot = normalizeDomainList(snapshot.value.profileDismissed), mcpDismissedSnapshot = snapshot.value.mcpDismissed === !0, snapshot.value.apiKeyGuideDone === !0 && (apiKeyGuideDone = !0)) : snapshot.status === "unavailable" && (entriesSnapshot = FALLBACK_ENTRIES, dismissedSnapshot = []), publishEntries(), publishDismissed(), publishMcpDismissed();
    };
    scope.subscribe(update), update();
  });
  let selectPreset = async (sessionId, preset) => {
    try {
      let response = await api.agentPresets.select({ sessionId, agentPreset: preset });
      return response.result.ok ? (ctx.sessions.noteAgentPreset(sessionId, response.result.value.agentPreset), !0) : (console.error(
        `[lawyer-sidebar] \u5207\u6362\u5230 preset "${preset}" \u5931\u8D25\uFF1A${response.result.error.message}\uFF08preset \u9700\u90E8\u7F72\u5230 $DSH_HOME/.agent-presets/${preset}/\uFF0C\u8FD0\u884C debug-web.cmd \u53EF\u81EA\u52A8\u90E8\u7F72 lawyer\uFF09`
      ), !1);
    } catch (error) {
      return console.error(
        `[lawyer-sidebar] \u5207\u6362 preset "${preset}" \u8BF7\u6C42\u5F02\u5E38\uFF1A${error instanceof Error ? error.message : String(error)}`
      ), !1;
    }
  }, sendParts = async (session, parts) => {
    let result = await session.prompt([...parts], "queue");
    result.ok || console.error(
      `[lawyer-sidebar] \u6CE8\u5165\u5F8B\u5E08\u4EFB\u52A1\u6307\u4EE4\u5931\u8D25\uFF1A${result.error.code} ${result.error.message}`
    );
  }, startTaskIn = async (sessionId, parts, preset = LAWYER_PRESET) => {
    if (preset !== "") {
      let summary = ctx.sessions.list.getSnapshot().byId[sessionId];
      if ((summary === void 0 || summary.agentPreset !== preset) && !await selectPreset(sessionId, preset))
        return;
    }
    let session = ctx.sessions.binding(sessionId)?.session;
    if (session === void 0) {
      console.warn("[lawyer-sidebar] \u4F1A\u8BDD\u7ED1\u5B9A\u4E0D\u53EF\u7528\uFF0C\u5F8B\u5E08\u4EFB\u52A1\u6307\u4EE4\u672A\u6CE8\u5165");
      return;
    }
    await sendParts(session, parts);
  }, runWhenSessionReady = async (parts, workspaceId, preset = LAWYER_PRESET) => {
    let wsList = ctx.workspaces.list.getSnapshot(), target = workspaceId;
    if (target === void 0) {
      let current = ctx.sessions.list.getSnapshot().current;
      target = (current !== void 0 ? wsList.items.find((item) => item.sessionIds.includes(current))?.workspaceId : void 0) ?? wsList.recentWorkspaceId;
    }
    if (target === void 0) {
      console.warn("[lawyer-sidebar] \u65E0\u53EF\u7528\u5DE5\u4F5C\u533A\uFF0C\u5F8B\u5E08\u4EFB\u52A1\u6307\u4EE4\u672A\u6CE8\u5165");
      return;
    }
    try {
      let sessionId = await ctx.sessions.create({ workspaceId: target });
      await ctx.sessions.open(sessionId), await startTaskIn(sessionId, parts, preset);
    } catch (error) {
      console.warn(`[lawyer-sidebar] \u65B0\u5EFA\u4F1A\u8BDD\u5931\u8D25\uFF1A${error instanceof Error ? error.message : String(error)}`);
    }
  }, withImages = (text2, images) => {
    let parts = [{ type: "text", text: text2 }];
    for (let image of images)
      parts.push({ type: "image", mediaType: image.mediaType, data: image.data, name: image.name });
    return parts;
  }, FALLBACK_WORKSPACE_DIR_NAME = "\u6478\u9C7C\u5DE5\u4F5C\u7AD9-\u5DE5\u4F5C\u533A", ensureFallbackWorkspace = async () => {
    if (!(ctx.workspaces.list.getSnapshot().items.length > 0))
      try {
        let preinjected = (() => {
          try {
            return localStorage.getItem("dsh.defaultWorkspaceDir") ?? localStorage.getItem("dsh.demoWorkspaceDir");
          } catch {
            return null;
          }
        })(), dir;
        if (typeof preinjected == "string" && preinjected.length > 0)
          dir = preinjected;
        else {
          let listing = await ctx.workspaces.listDirectory();
          try {
            dir = await ctx.workspaces.createDirectory(listing.home, FALLBACK_WORKSPACE_DIR_NAME);
          } catch {
            let sep = listing.home.includes("\\") ? "\\" : "/";
            dir = listing.home + sep + FALLBACK_WORKSPACE_DIR_NAME;
          }
        }
        return (await ctx.workspaces.create({ path: dir })).workspaceId;
      } catch (error) {
        return console.warn(`[lawyer-sidebar] \u81EA\u52A8\u521B\u5EFA\u515C\u5E95\u5DE5\u4F5C\u533A\u5931\u8D25\uFF1A${error instanceof Error ? error.message : String(error)}`), null;
      }
  }, injectTask = (parts, preset = LAWYER_PRESET) => {
    (async () => {
      let workspaceId = await ensureFallbackWorkspace();
      if (workspaceId === null) {
        console.warn("[lawyer-sidebar] \u6682\u65E0\u5DE5\u4F5C\u533A\u4E14\u81EA\u52A8\u521B\u5EFA\u5931\u8D25\uFF0C\u65E0\u6CD5\u53D1\u8D77\u5F8B\u5E08\u4EFB\u52A1\u2014\u2014\u8BF7\u5148\u624B\u52A8\u521B\u5EFA\u5DE5\u4F5C\u533A");
        return;
      }
      await runWhenSessionReady(parts, workspaceId, preset);
    })();
  }, replayDemo = void 0, profileApi = createProfileApi(ctx), profileStatusOf = async (domain) => {
    let result = await profileApi.status(domain, new AbortController().signal);
    if (result instanceof Error) {
      console.warn(`[lawyer-sidebar] \u753B\u50CF\u72B6\u6001\u67E5\u8BE2\u5931\u8D25\uFF0C\u6309\u65E0\u753B\u50CF\u5904\u7406\uFF1A${result.message}`);
      return;
    }
    return {
      path: result.path,
      configured: result.configured,
      placeholderCount: result.placeholderCount
    };
  }, submitProfileInterview = (domain, mode) => {
    (async () => {
      let meta = findProfileDomain(domain), status = await profileApi.status(domain, new AbortController().signal);
      if (meta === void 0 || status instanceof Error) {
        console.warn(
          `[lawyer-sidebar] \u753B\u50CF\u8BBF\u8C08\u672A\u53D1\u8D77\uFF1A${meta === void 0 ? `\u672A\u77E5\u9886\u57DF ${domain}` : status.message}`
        );
        return;
      }
      injectTask([{
        type: "text",
        text: buildProfileInterviewPrompt({
          domain,
          adapter: meta.adapter,
          profilePath: status.path,
          profileExists: status.exists,
          mode
        })
      }]);
    })();
  }, submitContractReview = (request) => {
    (async () => {
      let profile = await profileStatusOf("commercial-legal");
      injectTask(withImages(buildContractReviewPrompt(request, profile), request.images));
    })();
  }, submitCaseAnalysis = (request) => {
    (async () => {
      let profile = await profileStatusOf("litigation-legal");
      injectTask(withImages(buildCaseAnalysisPrompt(request, profile), request.images));
    })();
  }, submitDocGeneration = (request) => {
    (async () => {
      let profile = await profileStatusOf("litigation-legal");
      injectTask(withImages(buildDocGenerationPrompt(request, profile), request.images));
    })();
  }, submitCustomEntry = (request) => {
    let parts = [{ type: "text", text: buildCustomEntryPrompt(request) }];
    for (let image of collectImages(request.values))
      parts.push({ type: "image", mediaType: image.mediaType, data: image.data, name: image.name });
    injectTask(parts, request.entry.agentPreset ?? LAWYER_PRESET);
  }, searchWorkspaceFiles = (query, signal) => {
    let sessionId = ctx.sessions.list.getSnapshot().current;
    if (sessionId === void 0) return Promise.resolve(void 0);
    let fileReferences = ctx.get("remote.fileReferences");
    return fileReferences === void 0 ? Promise.resolve(void 0) : fileReferences.list(sessionId, query, signal).then(
      (result) => result.ok && result.value !== void 0 ? result.value : void 0,
      () => {
      }
    );
  }, listInstalledSkills = () => {
    let sessionId = ctx.sessions.list.getSnapshot().current;
    return sessionId === void 0 ? Promise.resolve(void 0) : api.skills.list({ sessionId }).then(
      (result) => result.ok ? result.value.skills : void 0,
      () => {
      }
    );
  }, uploadWorkspaceFile = (fileName, contentBase64, signal) => {
    let sessions = ctx.sessions.list.getSnapshot(), currentSession = sessions.current !== void 0 ? sessions.byId[sessions.current] : void 0, workspaces = ctx.workspaces.list.getSnapshot().items, workspace = workspaces.find(
      (item) => currentSession !== void 0 && item.workspaceId === currentSession.workspaceId
    ) ?? workspaces[0];
    if (workspace === void 0) return Promise.resolve(new Error("\u6682\u65E0\u5DE5\u4F5C\u533A\uFF0C\u65E0\u6CD5\u4E0A\u4F20\u5408\u540C\u6587\u4EF6"));
    let { rpc } = ctx.get("connection");
    return rpc.call(
      "/api",
      "lawyerFiles/save",
      { args: { cwd: workspace.path, fileName, contentBase64 } },
      signal
    ).then(
      (result) => {
        if (result.ok && typeof result.value?.path == "string")
          return result.value.path;
        let message = !result.ok && result.error !== void 0 && typeof result.error.message == "string" ? result.error.message : "lawyerFiles/save \u8FD4\u56DE\u5F02\u5E38";
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
        submitCustomEntry,
        entriesSource,
        searchWorkspaceFiles,
        uploadWorkspaceFile,
        listInstalledSkills,
        // M8 实务画像：Host RPC 封装 + 已跳过引导的领域名单及其写入。
        profileApi,
        dismissedSource,
        persistProfileDismissed,
        submitProfileInterview,
        // M8.6 元典 MCP 引导：Host RPC 封装 + 「不再提醒」标记及其写入。
        secretsApi,
        mcpDismissedSource,
        persistMcpDismissed
      })
    },
    LawyerSidebar
  )), ctx.slots.inject("settings.onboarding", () => ctx.slots.register({
    name: "settings.onboarding",
    id: "lawyer-deepseek-key-guide",
    order: -50,
    inject: () => ({
      checkKeyConfigured: deepSeekKeyConfigured,
      isGuideDone: () => apiKeyGuideDone,
      markGuideDone: persistApiKeyGuideDone
    })
  }, DeepSeekKeyGuide));
}
return module.exports; } });
//# sourceMappingURL=client.js.map
