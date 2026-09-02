# -*- coding: utf-8 -*-
"""以指定修订人署名运行 revise_engine，生成修订留痕审阅稿。"""
import importlib.util, json

ENGINE = os.path.join(
    os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))),
    "skills", "docx-tracked-changes", "scripts", "revise_engine.py")
spec = importlib.util.spec_from_file_location("revise_engine", ENGINE)
eng = importlib.util.module_from_spec(spec)
spec.loader.exec_module(eng)
eng.AUTHOR = "云帆律师事务所-张律师"
eng.INITIALS = "云帆"

with open("revisions.json", encoding="utf-8") as f:
    revisions = json.load(f)

applied, ncomments = eng.build(
    "软件开发委托合同（待审稿）.docx",
    "软件开发委托合同（待审稿）-审阅稿.docx",
    revisions,
)
print(f"applied={len(applied)} comments={ncomments}")
for a in applied:
    print(" ", a)
