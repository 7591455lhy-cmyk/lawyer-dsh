# -*- coding: utf-8 -*-
"""预检：校验修订清单每条 find 在对应段落的纯文本中唯一出现。"""
import json, zipfile, re

ENGINE = os.path.join(
    os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))),
    "skills", "docx-tracked-changes", "scripts", "revise_engine.py")
import importlib.util
spec = importlib.util.spec_from_file_location("revise_engine", ENGINE)
eng = importlib.util.module_from_spec(spec)
spec.loader.exec_module(eng)

src = "软件开发委托合同（待审稿）.docx"
with zipfile.ZipFile(src) as z:
    xml = z.read("word/document.xml").decode("utf-8")
paras = re.findall(r"<w:p\b.*?</w:p>", xml, re.S)

with open("revisions.json", encoding="utf-8") as f:
    revisions = json.load(f)

ok = True
for r in revisions:
    pno = r["para"]
    if pno > len(paras):
        print(f"FAIL para {pno}: 超出段落数 {len(paras)}")
        ok = False
        continue
    ed = eng.ParaEditor(paras[pno - 1])
    plain = ed.plain()
    cnt = plain.count(r["find"])
    if cnt != 1:
        print(f"FAIL para {pno} find出现{cnt}次: {r['find'][:40]!r}")
        ok = False
    else:
        print(f"OK   para {pno} [{r['op']:14s}] {r['find'][:36]!r}")
print("ALL_OK" if ok else "HAS_FAIL")
