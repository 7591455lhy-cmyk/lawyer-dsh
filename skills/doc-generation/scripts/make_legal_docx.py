# -*- coding: utf-8 -*-
"""
法律文书 docx 生成器（零依赖，仅 Python 标准库）。

用法：python make_legal_docx.py <doc.json> <output.docx>

doc.json 结构：
{
  "title": "民事起诉状",                     # 必填：居中大标题
  "subtitle": "张某诉李某买卖合同纠纷",       # 可选：居中小字（案由副题）
  "blocks": [                               # 必填：按序输出的正文块
    {"type": "party", "lines": ["原告：【待填：姓名】，男，【待填：出生日期】，汉族，住【待填：住址】。",
                                 "被告：××有限公司，住所地【待填：住址】，法定代表人【待填：姓名】，职务【待填：职务】。"]},
                                              # 当事人信息块：逐行左对齐、行距紧凑
    {"type": "heading", "text": "诉讼请求"},   # 小标题：左对齐加粗
    {"type": "item", "text": "1. 判令被告向原告支付货款人民币【待填：金额】元；"},
                                              # 编号/列举项：左对齐、无首行缩进
    {"type": "para", "text": "……"},          # 正文段：首行缩进两字符、两端对齐
    {"type": "right", "text": "具状人：【待填：签名】"},  # 右对齐行（落款）
    {"type": "blank"}                        # 空行
  ]
}
版式：标题黑体二号居中；副题宋体小四居中；正文宋体小四；
A4 纵向，页边距上下 3.7cm、左右 2.6cm（诉讼文书通行版式，按 1 英寸近似）。
填空位【待填：…】原样输出，不做任何替换。
"""
import json
import sys
import zipfile

W = "http://schemas.openxmlformats.org/wordprocessingml/2006/main"


def esc(t: str) -> str:
    return (t.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
             .replace('"', "&quot;"))


def run(text: str, *, font: str = "宋体", size: int = 24, bold: bool = False) -> str:
    b = "<w:b/>" if bold else ""
    space = ' xml:space="preserve"' if text != text.strip() else ""
    return (f'<w:r><w:rPr>{b}<w:rFonts w:ascii="{font}" w:hAnsi="{font}" '
            f'w:eastAsia="{font}"/><w:sz w:val="{size}"/><w:szCs w:val="{size}"/></w:rPr>'
            f'<w:t{space}>{esc(text)}</w:t></w:r>')


def para(runs_xml: str, *, align: str = "both", spacing_after: int = 120, ind_first: int = 0) -> str:
    return (f'<w:p><w:pPr><w:spacing w:after="{spacing_after}" w:line="360" w:lineRule="auto"/>'
            f'{"<w:ind w:firstLineChars=\"200\" w:firstLine=\"480\"/>" if ind_first else ""}'
            f'<w:jc w:val="{align}"/></w:pPr>{runs_xml}</w:p>')


def build_document(doc: dict) -> str:
    body = [para(run(doc["title"], font="黑体", size=44, bold=True), align="center", spacing_after=80)]
    if doc.get("subtitle"):
        body.append(para(run(doc["subtitle"], font="宋体", size=24), align="center", spacing_after=240))
    for block in doc.get("blocks", []):
        kind = block.get("type")
        if kind == "party":
            for line in block.get("lines", []):
                body.append(para(run(str(line), font="宋体", size=24), align="left", spacing_after=40))
        elif kind == "heading":
            body.append(para(run(str(block.get("text", "")), font="黑体", size=24, bold=True),
                             align="left", spacing_after=60))
        elif kind == "item":
            body.append(para(run(str(block.get("text", "")), font="宋体", size=24),
                             align="left", spacing_after=60))
        elif kind == "para":
            body.append(para(run(str(block.get("text", "")), font="宋体", size=24), ind_first=1))
        elif kind == "right":
            body.append(para(run(str(block.get("text", "")), font="宋体", size=24),
                             align="right", spacing_after=60))
        elif kind == "blank":
            body.append(para("", spacing_after=120))
    return (f'<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            f'<w:document xmlns:w="{W}"><w:body>{"".join(body)}'
            f'<w:sectPr><w:pgSz w:w="11906" w:h="16838"/>'
            f'<w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440"/></w:sectPr>'
            f'</w:body></w:document>')


CONTENT_TYPES = ('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
                 '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">'
                 '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>'
                 '<Default Extension="xml" ContentType="application/xml"/>'
                 '<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>'
                 '<Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>'
                 '</Types>')
ROOT_RELS = ('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
             '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
             '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>'
             '</Relationships>')
DOC_RELS = ('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
            '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="word/styles.xml"/>'
            '</Relationships>')
STYLES = ('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
          f'<w:styles xmlns:w="{W}">'
          '<w:docDefaults><w:rPrDefault><w:rPr>'
          '<w:rFonts w:ascii="宋体" w:hAnsi="宋体" w:eastAsia="宋体"/>'
          '<w:sz w:val="24"/><w:szCs w:val="24"/></w:rPr></w:rPrDefault></w:docDefaults>'
          '</w:styles>')


def build(doc_path: str, output_path: str) -> None:
    # utf-8-sig：兼容 Windows 工具链（PowerShell 等）写入的带 BOM 文件。
    with open(doc_path, encoding="utf-8-sig") as fh:
        doc = json.load(fh)
    document = build_document(doc)
    with zipfile.ZipFile(output_path, "w", zipfile.ZIP_DEFLATED) as zf:
        zf.writestr("[Content_Types].xml", CONTENT_TYPES)
        zf.writestr("_rels/.rels", ROOT_RELS)
        zf.writestr("word/document.xml", document)
        zf.writestr("word/_rels/document.xml.rels", DOC_RELS)
        zf.writestr("word/styles.xml", STYLES)


def main() -> None:
    if len(sys.argv) != 3:
        print("用法：python make_legal_docx.py <doc.json> <output.docx>", file=sys.stderr)
        raise SystemExit(2)
    build(sys.argv[1], sys.argv[2])
    print(f"已生成：{sys.argv[2]}")


if __name__ == "__main__":
    main()
