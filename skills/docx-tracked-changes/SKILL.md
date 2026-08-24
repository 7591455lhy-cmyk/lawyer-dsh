---
name: docx-tracked-changes
description: 为 .docx 生成 Word"审阅-修订"留痕稿（w:ins/w:del 指定修订人姓名）并插入批注（comments.xml），纯 Python 标准库 OOXML 直写，不经 Office 套件重写文档包，最大限度保持原排版、嵌入字体与 WPS 扩展部件。适用于法律文书审稿留痕、合同修订留痕、公文批注等场景；当用户要求"修订模式留痕""指定修订人""插入批注""保持原格式"时使用。
agent_created: true
---

# docx 修订留痕与批注写入

## 适用场景
用户要求对 .docx 以"审阅-修订"模式留痕修改（可指定修订人姓名，如律师署名）、并在重要修改处插入批注，同时严格要求保持原文档结构、段落安排与排版格式不变。

## 为什么不用 python-docx / Word COM
- python-docx 不支持修订标记（w:ins/w:del）与批注写入。
- Word/WPS COM 自动化会重写整个文档包，可能丢失 WPS 特有部件、嵌入字体（odttf）、customXml 等，无法保证"格式不变"。
- 本技能用标准库 zipfile + re 直写 OOXML：只重写 `word/document.xml`、`[Content_Types].xml`、`word/_rels/document.xml.rels`，新增 `word/comments.xml`，其余部件**字节原样拷贝**。

## 工作流程

1. **提取全文定段落号**：zipfile 读 `word/document.xml`，按 `<w:p\b.*?</w:p>` 切分（re.S），拼接各 run 的 `<w:t>` 文本，逐段编号输出。修订指令以"段落号（1 起）"定位。
2. **探查结构**：检查 run 碎片化程度（WPS 文档 run 常在任意字符处断开，必须做 run 切分）、是否已有 w:ins/w:del/comments.xml、`styles.xml` 是否有批注样式（没有也没关系，批注可不引用样式）、`document.xml.rels` 最大 rId。
3. **编写修订清单 JSON**（见下），每条指令含段落号、段内唯一定位子串、操作、新文本、可选批注。
4. **运行引擎**：`python scripts/revise_engine.py <src.docx> <dst.docx> <revisions.json>`
5. **验证**（引擎内置 `extract_text` 双口径函数）：
   - 拒绝所有修订后的文本 == 原文逐字一致（保真证明）
   - 接受所有修订后的文本 == 预期终稿（逐条断言新文本就位、旧文本消除）
   - zip 完整性（testzip）、XML 良构（minidom.parseString，引擎构建时已做）
   - w:ins/w:del/comment 计数与指令数一致；w:author 正确
   - 段落数不变

## 修订清单 JSON 格式

```json
[
 {"para": 10, "find": "段内唯一子串", "op": "replace", "new": "新文本", "comment": "批注（可选）"},
 {"para": 46, "find": "（误译英文）", "op": "delete", "comment": "删除理由"},
 {"para": 72, "find": "珠海市人民政府", "op": "insert_before", "new": "<BR>"},
 {"para": 9,  "find": "法定代表人：XX", "op": "comment", "comment": "纯批注不改文字"}
]
```

- `op`：`replace`（删旧+插新）、`delete`、`insert_before`/`insert_after`（`new` 为 `<BR>` 时插入段内换行 `<w:br/>`，可实现"此致"分行而不新增段落）、`comment`（纯批注）。
- `find` 必须在该段纯文本中**唯一出现**；同段多次出现时，扩展上下文使其唯一。同段多条指令顺序执行，注意前一条修改后后一条的 find 仍须可匹配。
- 修订人姓名修改 `scripts/revise_engine.py` 顶部 `AUTHOR` 常量（默认"朗乾所-李鸿枫"，使用时务必改成用户要求的署名）。

## 关键实现要点（引擎已处理）
- run 切分：在修订边界处把原 run 一分为二并复制原 `<w:rPr>`，保证插入文字格式与相邻正文一致。
- 删除：`<w:del w:id w:author w:date><w:r><w:delText>…</w:delText></w:r></w:del>`（注意是 `w:delText` 不是 `w:t`）。
- 插入：`<w:ins …>` 包裹新 run；空 run（切分残留）渲染时丢弃。
- 批注：`commentRangeStart/End` + `<w:commentReference>` 三件套；comments.xml 需同步在 `[Content_Types].xml` 加 Override、在 rels 加 Relationship（Type=…/relationships/comments）。
- 文本含首尾空格时 `<w:t>`/`<w:delText>` 必须带 `xml:space="preserve"`。
- **不要**写 `<w:trackChanges/>` 到 settings.xml——已有修订标记无需它即可显示；写入后用户后续编辑会被强制留痕。
- w:date 用 ISO 8601 UTC；中文作者名直接写 UTF-8 无需转义。

## 扫描版 PDF 取证（配套经验）
法律文书常遇纯扫描 PDF（无文字层）：
1. 先探测滤镜：`/DCTDecode`（裸 JPEG，可按 `\xff\xd8\xff`…`\xff\xd9` 魔数直接截取）、`[/FlateDecode /DCTDecode]`（zlib 包裹 JPEG）、`/CCITTFaxDecode`（传真位图，需转 PNG）。
2. 用隔离 venv 安装 pypdf + pillow，`page.images` 取每页最大图像，非 jpg/png 一律 `img.image.save(..., 'PNG')`。
3. 逐页 Read（多模态）转录；褪色扫描件可读性有限时，如实标注"不可辨"并提示以原件为准，**不得编造**。
