# -*- coding: utf-8 -*-
"""
合同审核报告 docx 生成器（零依赖，仅 Python 标准库）。

用法：python make_report_docx.py <report.json> <output.docx>

report.json 结构：
{
  "title": "合同审核报告",                  # 必填：主标题
  "subtitle": "采购合同 · 甲方立场",        # 可选：副标题（居中小字）
  "meta": [["我方立场", "甲方"], ...],      # 可选：信息行（标签：值）
  "sections": [                            # 必填：章节列表（按序输出）
    {"heading": "一、风险清单",
     "paragraphs": ["说明文字"],           # 可选：普通段落
     "table": {                            # 可选：一个表格
       "headers": ["条款位置", "风险描述", "等级", "修改建议"],
       "rows": [["第 3 条", "付款期限过长", "高", "改为 30 日"]]}
     },
    {"heading": "二、整体结论", "paragraphs": ["..."]},
    {"heading": "三、待决策事项", "list": ["..."]}   # 可选：列表项（前缀 · ）
  ]
}
版式：黑体标题 / 宋体正文（eastAsia 字体声明），A4 纵向。
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


def cell(text: str, *, bold: bool = False, width_chars: int = 12) -> str:
    lines = text.split("\n") if text else [""]
    runs = "".join(run(line, font="宋体", size=21, bold=bold) for line in lines)
    return (f'<w:tc><w:tcPr><w:tcW w:w="{width_chars * 100}" w:type="dxa"/></w:tcPr>'
            f'<w:p><w:pPr><w:spacing w:after="40"/><w:jc w:val="left"/></w:pPr>{runs}</w:p></w:tc>')


def table(headers, rows) -> str:
    borders = ('<w:tblBorders>'
               + "".join(f'<w:{side} w:val="single" w:sz="4" w:space="0" w:color="999999"/>'
                         for side in ("top", "left", "bottom", "right", "insideH", "insideV"))
               + '</w:tblBorders>')
    head_row = "<w:tr>" + "".join(cell(h, bold=True) for h in headers) + "</w:tr>"
    body_rows = "".join("<w:tr>" + "".join(cell(c) for c in row) + "</w:tr>" for row in rows)
    grid = "".join(f'<w:gridCol w:w="{9000 // max(len(headers), 1)}"/>' for _ in headers)
    return (f'<w:tbl><w:tblPr><w:tblW w:w="9000" w:type="dxa"/>{borders}</w:tblPr>'
            f'<w:tblGrid>{grid}</w:tblGrid>{head_row}{body_rows}</w:tbl>')


def build_document(report: dict) -> str:
    body = []
    body.append(para(run(report["title"], font="黑体", size=44, bold=True), align="center", spacing_after=80))
    if report.get("subtitle"):
        body.append(para(run(report["subtitle"], font="宋体", size=24), align="center", spacing_after=240))
    for label, value in report.get("meta", []):
        body.append(para(run(f"{label}：", font="黑体", size=24, bold=True) + run(str(value), font="宋体", size=24),
                         align="left", spacing_after=60))
    body.append(para("", spacing_after=120))
    for section in report.get("sections", []):
        body.append(para(run(section.get("heading", ""), font="黑体", size=30, bold=True),
                         align="left", spacing_after=100))
        for p in section.get("paragraphs", []):
            body.append(para(run(str(p), font="宋体", size=24), ind_first=1))
        for item in section.get("list", []):
            body.append(para(run(f"· {item}", font="宋体", size=24), align="left", spacing_after=60))
        t = section.get("table")
        if t and t.get("headers"):
            body.append(table([str(h) for h in t["headers"]], [[str(c) for c in row] for row in t.get("rows", [])]))
            body.append(para("", spacing_after=80))
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
            '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>'
            '</Relationships>')
STYLES = ('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
          f'<w:styles xmlns:w="{W}">'
          '<w:docDefaults><w:rPrDefault><w:rPr>'
          '<w:rFonts w:ascii="宋体" w:hAnsi="宋体" w:eastAsia="宋体"/>'
          '<w:sz w:val="24"/><w:szCs w:val="24"/></w:rPr></w:rPrDefault></w:docDefaults>'
          '</w:styles>')


def build(report_path: str, output_path: str) -> None:
    with open(report_path, encoding="utf-8") as f:
        report = json.load(f)
    with zipfile.ZipFile(output_path, "w", zipfile.ZIP_DEFLATED) as zf:
        zf.writestr("[Content_Types].xml", CONTENT_TYPES)
        zf.writestr("_rels/.rels", ROOT_RELS)
        zf.writestr("word/_rels/document.xml.rels", DOC_RELS)
        zf.writestr("word/styles.xml", STYLES)
        zf.writestr("word/document.xml", build_document(report))


if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("用法：python make_report_docx.py <report.json> <output.docx>")
        sys.exit(2)
    build(sys.argv[1], sys.argv[2])
    print(f"报告已生成：{sys.argv[2]}")
