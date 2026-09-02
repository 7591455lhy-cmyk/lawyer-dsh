# -*- coding: utf-8 -*-
"""Extract paragraph numbers + text from a docx (stdlib only)."""
import sys, zipfile, re

src = sys.argv[1] if len(sys.argv) > 1 else "软件开发委托合同（待审稿）.docx"
with zipfile.ZipFile(src) as z:
    xml = z.read("word/document.xml").decode("utf-8")

paras = re.findall(r"<w:p\b.*?</w:p>", xml, re.S)
for i, p in enumerate(paras, start=1):
    texts = re.findall(r"<w:t(?:\s[^>]*)?>(.*?)</w:t>", p, re.S)
    txt = "".join(texts)
    print(f"[{i:02d}] {txt}")
print(f"TOTAL_PARAS={len(paras)}")
