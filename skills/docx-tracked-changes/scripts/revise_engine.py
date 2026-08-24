# -*- coding: utf-8 -*-
"""
OOXML 修订写入引擎：为 docx 写入 Word 修订标记（w:ins/w:del）与批注（comments.xml）。
仅使用 Python 标准库。除 document.xml、[Content_Types].xml、word/_rels/document.xml.rels
及新增 word/comments.xml 外，其余 zip 部件字节原样拷贝，保证排版与字体不丢失。

修订指令格式（revisions 列表元素）：
{
  "para": 46,                     # 段落号（1 起，对应全文 <w:p> 顺序）
  "find": "（Pulp canal protective）",  # 段内唯一定位子串
  "op": "delete" | "replace" | "insert_before" | "insert_after",
  "new": "替换或插入的新文本",       # replace/insert_* 时必填；特殊值 "<BR>" 表示插入换行符 w:br
  "comment": "批注内容（可选）"      # 重要修改附批注
}
"""
import zipfile, re, os, shutil, sys, json
from xml.dom.minidom import parseString
from datetime import datetime, timezone

AUTHOR = "朗乾所-李鸿枫"
INITIALS = "LHF"
W_NS = "http://schemas.openxmlformats.org/wordprocessingml/2006/main"
REV_DATE = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")

def esc(t):
    return (t.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
             .replace('"', "&quot;"))

def make_t(tag, text):
    """生成 <w:t>/<w:delText>，必要时带 xml:space='preserve'"""
    space = ' xml:space="preserve"' if (text != text.strip()) else ""
    return f'<w:{tag}{space}>{esc(text)}</w:{tag}>'

class ParaEditor:
    """对单个段落的 XML 做文字级修订。将段落拆为 token 序列：run 与非 run 元素。"""
    def __init__(self, xml):
        self.xml = xml
        self.tokens = []  # ("run", rpr, text, raw) 或 ("other", raw)
        self._tokenize(xml)

    def _tokenize(self, xml):
        # 段落开头可能有 <w:pPr>...</w:pPr>
        pos = 0
        for m in re.finditer(r'<w:r\b[^>]*>.*?</w:r>|<w:r\b[^>]*/>', xml, re.S):
            if m.start() > pos:
                self.tokens.append(("other", xml[pos:m.start()]))
            raw = m.group(0)
            tm = re.search(r'<w:t\b([^>]*)>(.*?)</w:t>', raw, re.S)
            rm = re.search(r'<w:rPr>.*?</w:rPr>', raw, re.S)
            if tm:
                text = tm.group(2)
                rpr = rm.group(0) if rm else ""
                self.tokens.append(("run", rpr, text, raw))
            else:
                self.tokens.append(("other", raw))
            pos = m.end()
        if pos < len(xml):
            self.tokens.append(("other", xml[pos:]))

    @staticmethod
    def _unescape(t):
        return (t.replace("&lt;", "<").replace("&gt;", ">").replace("&quot;", '"')
                 .replace("&apos;", "'").replace("&amp;", "&"))

    def plain(self):
        return "".join(self._unescape(t[2]) for t in self.tokens if t[0] == "run")

    def _offsets(self):
        """每个 run token 在纯文本中的 [start, end) 偏移"""
        offs, cur = [], 0
        for tok in self.tokens:
            if tok[0] == "run":
                n = len(self._unescape(tok[2]))
                offs.append((cur, cur + n))
                cur += n
            else:
                offs.append(None)
        return offs

    def _split_run(self, idx, cut):
        """在 run token idx 的字符偏移 cut 处切成两个 run（rPr 相同）。"""
        kind, rpr, text, raw = self.tokens[idx]
        raw_text = self._unescape(text)
        left, right = raw_text[:cut], raw_text[cut:]
        def mk(t):
            return ("run", rpr, t, "")
        self.tokens[idx:idx+1] = [mk(left), mk(right)]

    def apply(self, find, op, new, rev_id, comment_id=None):
        """返回 (updated_tokens_done)。find 必须在段内唯一出现（转义后匹配在纯文本上进行）。"""
        plain = self.plain()
        cnt = plain.count(find)
        if cnt != 1:
            raise ValueError(f"定位子串出现 {cnt} 次（要求唯一）: {find[:30]!r} in {plain[:40]!r}")
        start = plain.index(find)
        end = start + len(find)
        offs = self._offsets()

        # 1) 在 start、end 处切分 run
        for boundary in (start, end):
            for i, tok in enumerate(self.tokens):
                if tok[0] != "run":
                    continue
                s, e = self._offsets()[i]  # 重新算（切分后 offs 变化）——低效但稳妥
                if s < boundary < e:
                    self._split_run(i, boundary - s)
                    break

        offs = self._offsets()
        # 2) 找出范围内的 run 索引
        inside = [i for i, tok in enumerate(self.tokens)
                  if tok[0] == "run" and offs[i] and offs[i][0] >= start and offs[i][1] <= end and offs[i][0] < offs[i][1]]

        # 3) 构造替换 token 序列（先完整构建，再一次性拼接回 tokens）
        def ins_runs(text):
            # rPr 复制自范围内第一个 run 或其前一个 run
            rpr = ""
            for i in inside:
                rpr = self.tokens[i][1]
                if rpr:
                    break
            if not rpr:
                for i in range(inside[0] - 1, -1, -1) if inside else []:
                    if self.tokens[i][0] == "run" and self.tokens[i][1]:
                        rpr = self.tokens[i][1]
                        break
            if text == "<BR>":
                body = f'<w:r>{rpr}<w:br/></w:r>'
            else:
                body = f'<w:r>{rpr}{make_t("t", text)}</w:r>'
            return ("raw", f'<w:ins w:id="{rev_id}" w:author="{AUTHOR}" w:date="{REV_DATE}">{body}</w:ins>')

        new_tokens = []
        if comment_id is not None:
            new_tokens.append(("raw", f'<w:commentRangeStart w:id="{comment_id}"/>'))
        if op in ("delete", "replace"):
            for i in inside:
                kind, rpr, text, raw = self.tokens[i]
                delrun = f'<w:r>{rpr}{make_t("delText", self._unescape(text))}</w:r>'
                new_tokens.append(("raw", f'<w:del w:id="{rev_id}" w:author="{AUTHOR}" w:date="{REV_DATE}">{delrun}</w:del>'))
                rev_id += 1
        if op == "replace":
            new_tokens.append(ins_runs(new))
            rev_id += 1
        if op in ("delete", "replace") and comment_id is not None:
            new_tokens.append(("raw", f'<w:commentRangeEnd w:id="{comment_id}"/>'))
            new_tokens.append(("raw", f'<w:r><w:commentReference w:id="{comment_id}"/></w:r>'))

        if op in ("delete", "replace") and inside:
            self.tokens[inside[0]:inside[-1]+1] = new_tokens
        elif op == "comment":
            # 纯批注：不改动文字，仅在目标文本范围外包批注范围标记
            if comment_id is None:
                raise ValueError("op=comment 必须提供 comment 文本")
            self.tokens[inside[0]:inside[0]] = [("raw", f'<w:commentRangeStart w:id="{comment_id}"/>')]
            self.tokens[inside[-1]+2:inside[-1]+2] = [
                ("raw", f'<w:commentRangeEnd w:id="{comment_id}"/>'),
                ("raw", f'<w:r><w:commentReference w:id="{comment_id}"/></w:r>')]
        elif op in ("insert_before", "insert_after"):
            # 范围即 find 文本；插入点在其前/后
            anchor = inside[0] if op == "insert_before" else inside[-1] + 1
            seq = []
            if comment_id is not None:
                seq.append(("raw", f'<w:commentRangeStart w:id="{comment_id}"/>'))
            seq.append(ins_runs(new))
            rev_id += 1
            if comment_id is not None:
                seq.append(("raw", f'<w:commentRangeEnd w:id="{comment_id}"/>'))
                seq.append(("raw", f'<w:r><w:commentReference w:id="{comment_id}"/></w:r>'))
            self.tokens[anchor:anchor] = seq
        return rev_id

    def render(self):
        out = []
        for tok in self.tokens:
            if tok[0] == "run":
                kind, rpr, text, raw = tok
                if text == "" and raw == "":
                    continue  # 切分产生的空 run，丢弃
                if raw:
                    out.append(raw)
                else:
                    out.append(f'<w:r>{rpr}{make_t("t", text)}</w:r>')
            elif tok[0] == "raw":
                out.append(tok[1])
            else:
                out.append(tok[1])
        return "".join(out)


def build(src, dst, revisions):
    zin = zipfile.ZipFile(src)
    doc = zin.read("word/document.xml").decode("utf-8")

    # 段落切分（保留段间 XML 原样）
    parts = re.split(r'(<w:p\b.*?</w:p>)', doc, flags=re.S)
    paras = [i for i, p in enumerate(parts) if p.startswith("<w:p")]

    # 按段落分组指令；同段内按 find 出现位置从后往前应用，避免偏移干扰（引擎按子串定位，顺序无关，但保持倒序更稳）
    by_para = {}
    for r in revisions:
        by_para.setdefault(r["para"], []).append(r)

    rev_id = 1000
    comment_id = 0
    comments = []
    applied = []
    for pno, instrs in sorted(by_para.items()):
        part_idx = paras[pno - 1]
        ed = ParaEditor(parts[part_idx])
        for ins in instrs:
            cid = None
            if ins.get("comment"):
                cid = comment_id
                comments.append((cid, ins["comment"]))
                comment_id += 1
            rev_id = ed.apply(ins["find"], ins["op"], ins.get("new", ""), rev_id, cid)
            applied.append((pno, ins["op"], ins["find"][:30]))
        parts[part_idx] = ed.render()

    new_doc = "".join(parts)

    # comments.xml
    if comments:
        cxml = ['<?xml version="1.0" encoding="UTF-8" standalone="yes"?>',
                f'<w:comments xmlns:w="{W_NS}">']
        for cid, ctext in comments:
            cxml.append(
                f'<w:comment w:id="{cid}" w:author="{AUTHOR}" w:initials="{INITIALS}" w:date="{REV_DATE}">'
                f'<w:p><w:r><w:rPr><w:rFonts w:hint="eastAsia"/><w:sz w:val="21"/><w:szCs w:val="21"/></w:rPr>'
                f'{make_t("t", ctext)}</w:r></w:p></w:comment>')
        cxml.append('</w:comments>')
        comments_xml = "".join(cxml)
    else:
        comments_xml = None

    # [Content_Types].xml
    ct = zin.read("[Content_Types].xml").decode("utf-8")
    if comments_xml and "/word/comments.xml" not in ct:
        ct = ct.replace("</Types>",
            '<Override PartName="/word/comments.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.comments+xml"/></Types>')

    # document.xml.rels
    rels = zin.read("word/_rels/document.xml.rels").decode("utf-8")
    if comments_xml and "comments.xml" not in rels:
        max_id = max(int(m) for m in re.findall(r'Id="rId(\d+)"', rels))
        rels = rels.replace("</Relationships>",
            f'<Relationship Id="rId{max_id+1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/comments" Target="comments.xml"/></Relationships>')

    # XML 良构校验
    for name, data in (("document.xml", new_doc), ("comments.xml", comments_xml),
                       ("[Content_Types].xml", ct), ("rels", rels)):
        if data:
            parseString(data)

    # 重写 zip：其余部件字节原样
    with zipfile.ZipFile(dst, "w", zipfile.ZIP_DEFLATED) as zout:
        for item in zin.infolist():
            data = zin.read(item.filename)
            if item.filename == "word/document.xml":
                data = new_doc.encode("utf-8")
            elif item.filename == "[Content_Types].xml":
                data = ct.encode("utf-8")
            elif item.filename == "word/_rels/document.xml.rels":
                data = rels.encode("utf-8")
            zout.writestr(item, data)
        if comments_xml:
            zout.writestr("word/comments.xml", comments_xml.encode("utf-8"))
    zin.close()
    return applied, len(comments)


def extract_text(path, mode):
    """mode='reject' 拒绝所有修订（应为原文）；mode='accept' 接受所有修订（应为终稿）。"""
    z = zipfile.ZipFile(path)
    d = z.read("word/document.xml").decode("utf-8")
    if mode == "reject":
        d = re.sub(r'<w:ins\b[^>]*>.*?</w:ins>', '', d, flags=re.S)
        d = d.replace('<w:delText', '<w:t').replace('</w:delText>', '</w:t>')
    else:
        d = re.sub(r'<w:del\b[^>]*>.*?</w:del>', '', d, flags=re.S)
        d = re.sub(r'</?w:ins\b[^>]*>', '', d)
    paras = re.findall(r'<w:p\b.*?</w:p>', d, re.S)
    lines = []
    for p in paras:
        texts = re.findall(r'<w:t\b[^>]*>(.*?)</w:t>', p, re.S)
        line = "".join(texts)
        line = (line.replace("&lt;", "<").replace("&gt;", ">").replace("&quot;", '"')
                    .replace("&apos;", "'").replace("&amp;", "&"))
        lines.append(line)
    return "\n".join(lines)


if __name__ == "__main__":
    # 用法：python revise_engine.py <src.docx> <dst.docx> <revisions.json>
    src, dst, revfile = sys.argv[1], sys.argv[2], sys.argv[3]
    with open(revfile, encoding="utf-8") as f:
        revisions = json.load(f)
    applied, ncomments = build(src, dst, revisions)
    print(f"已应用修订指令 {len(applied)} 条，批注 {ncomments} 条")
    for a in applied:
        print(" ", a)
