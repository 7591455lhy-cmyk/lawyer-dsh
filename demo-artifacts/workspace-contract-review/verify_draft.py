# -*- coding: utf-8 -*-
"""验证审阅稿：双向断言（拒绝=原文 / 接受=预期终稿）+ 计数 + 署名 + 包完整性。"""
import os
import zipfile, re, json, importlib.util
from xml.dom.minidom import parseString

ENGINE = os.path.join(
    os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))),
    "skills", "docx-tracked-changes", "scripts", "revise_engine.py")
spec = importlib.util.spec_from_file_location("revise_engine", ENGINE)
eng = importlib.util.module_from_spec(spec)
spec.loader.exec_module(eng)

BASE = "软件开发委托合同（待审稿）.docx"
DRAFT = "软件开发委托合同（待审稿）-审阅稿.docx"
AUTHOR = "云帆律师事务所-张律师"

# ---- 1. 包完整性 + XML 良构 ----
z = zipfile.ZipFile(DRAFT)
assert z.testzip() is None, "zip 损坏"
doc = z.read("word/document.xml").decode("utf-8")
parseString(doc)
cxml = z.read("word/comments.xml").decode("utf-8")
parseString(cxml)
print("PASS zip 完整性 + XML 良构")

# ---- 2. 段落数不变 ----
n_base = len(re.findall(r"<w:p\b.*?</w:p>", z.read("word/document.xml").decode("utf-8"), re.S))
assert n_base == 53, f"段落数 {n_base} != 53"
print(f"PASS 段落数不变 = {n_base}")

# ---- 3. 拒绝全部修订 == 基线原文（逐字一致） ----
base_text = eng.extract_text(BASE, "reject")
draft_reject = eng.extract_text(DRAFT, "reject")
assert base_text == draft_reject, "拒绝修订后与原文不一致"
print("PASS 拒绝全部修订 = 基线原文逐字一致")

# ---- 4. 接受全部修订 == 预期终稿（逐段比对） ----
expected = {
 13: "乙方为甲方开发客户关系管理系统一套，含客户档案、商机管理、合同管理、数据看板四个功能模块，具体以双方确认的《需求规格说明书》为准。《需求规格说明书》由甲方于合同签订后 10 日内提供，乙方在收到后 10 个工作日内提出书面评审意见，双方共同确认后作为本合同附件及验收依据；需求未经双方书面确认的，乙方有权不予实施，相应工期顺延。",
 15: "总工期 120 个自然日，自《需求规格说明书》经双方书面确认之日起算。因甲方原因导致需求变更或确认延误的，工期相应顺延；甲方提出的需求变更须经双方书面确认后方为有效，未经书面确认的变更乙方无义务实施，且不因此承担逾期责任。",
 19: "1. 合同签订后 5 个工作日内，甲方支付合同总价的 20% 作为预付款；",
 22: "4. 剩余 40% 尾款于系统验收合格后 10 个工作日内一次性支付。",
 24: "1. 乙方完成开发后书面通知甲方验收，甲方应在收到通知后 10 个工作日内组织验收；",
 25: "2. 验收标准为系统功能符合经双方书面确认的《需求规格说明书》及本合同约定；",
 26: "3. 甲方逾期未组织验收亦未提出书面异议的，视为验收合格。",
 30: "系统交付且甲方付清全部合同价款后，本合同项下定制开发的交付成果（含源代码及文档）的知识产权归甲方所有；乙方开发过程中形成的、可独立于本合同成果使用的通用组件、工具、模板及乙方既有背景知识产权仍归乙方所有，乙方就此授予甲方在本合同成果范围内永久、不可撤销的免费使用许可。甲方付清全部合同价款前，不得将交付成果用于商业运营或向第三方披露。",
 32: "质保期为验收合格后 12 个月。质保期内乙方免费修复系统缺陷（指因乙方开发原因导致的功能错误或与《需求规格说明书》不符之处）；因甲方自行修改、甲方提供的第三方软件或运行环境原因造成的故障，乙方按每人天 1,500 元另行收费，并应在收到故障通知后 2 个工作日内响应。",
 34: "1. 乙方逾期交付的，每逾期一日按合同总价的万分之五向甲方支付违约金；",
 35: "2. 甲方逾期付款的，每逾期一日按应付未付款项的万分之五向乙方支付违约金；",
 38: "甲方有权在乙方交付验收前书面通知解除本合同，但应：（1）按已完成并经确认的工作量对应的合同价款全额支付；（2）赔偿乙方为履行本合同已实际发生的合理费用及合理利润损失。解除前乙方已交付的阶段性成果，甲方按约定付款后方可使用。",
 40: "双方对在合作过程中知悉的对方未公开的商业秘密及本合同内容负有保密义务，保密期限为本合同有效期内及合同终止后 3 年；法律另有规定或信息已进入公有领域的除外。未经披露方书面同意，任何一方不得向第三方披露或用于本合同以外的目的。",
 42: "乙方保证其交付成果不侵犯任何第三方知识产权；因交付成果本身侵犯第三方知识产权引发纠纷的，由乙方负责处理并赔偿甲方因此支出的合理费用；因甲方修改交付成果、甲方提供的资料或甲方指定的功能要求导致侵权的，由甲方自行承担责任。发生侵权指控时，双方应及时相互通知并协助抗辩。",
 44: "双方以本合同首部载明的地址及双方另行书面确认的电子邮箱为送达地址；以电子邮件方式送达的，邮件进入对方指定邮箱系统之日视为送达；一方变更地址未书面通知另一方的，按原地址送达即视为有效送达。",
 46: "因不可抗力不能履行合同的，根据不可抗力的影响部分或全部免除责任，但法律另有规定的除外。遭受不可抗力的一方应在不可抗力发生后 7 日内书面通知对方，并在合理期限内提供证明；未及时通知导致损失扩大的，就扩大部分不得免除责任。不可抗力致使合同目的不能实现的，任何一方均有权解除本合同。",
 48: "因本合同发生的争议，双方协商解决；协商不成的，提交合同签订地有管辖权的人民法院诉讼解决。",
 50: "本合同及其附件构成合同整体，附件与正文具有同等法律效力。本合同自双方盖章之日起生效。本合同一式肆份，双方各执贰份，具有同等法律效力。",
}
draft_accept_lines = eng.extract_text(DRAFT, "accept").split("\n")
assert len(draft_accept_lines) == 53, f"接受后段落数 {len(draft_accept_lines)} != 53"
for pno, want in expected.items():
    got = draft_accept_lines[pno - 1]
    assert got == want, f"段落 {pno} 终稿不一致:\n  want={want}\n  got ={got}"
# 未修订段落也应与原文一致
for pno, line in enumerate(draft_accept_lines, 1):
    if pno in expected:
        continue
    assert line == base_text.split("\n")[pno - 1], f"段落 {pno} 不应变化"
print("PASS 接受全部修订 = 预期终稿（18 段逐一比对，其余 35 段未受影响）")

# ---- 5. 修订/批注计数 + 署名 ----
ins = re.findall(r'<w:ins\b', doc)
dels = re.findall(r'<w:del\b', doc)
cstart = re.findall(r'<w:commentRangeStart\b', doc)
assert len(ins) == 18, f"w:ins 数量 {len(ins)} != 18"
assert len(dels) == 18, f"w:del 数量 {len(dels)} != 18"
assert len(cstart) == 24, f"批注范围 {len(cstart)} != 24"
ncomments = len(re.findall(r'<w:comment\b', cxml))
assert ncomments == 24, f"comments 数量 {ncomments} != 24"
assert len(re.findall(rf'w:author="{AUTHOR}"', doc)) >= len(ins) + len(dels), "document 中修订署名错误"
assert re.findall(r'<w:comment\b[^>]*w:author="[^"]*"', cxml)[0].count(AUTHOR) == 0 or AUTHOR in cxml, "comments 署名错误"
assert f'w:author="{AUTHOR}"' in cxml, "comments.xml 无修订人署名"
assert f'w:initials="云帆"' in cxml, "批注 initials 错误"
print(f"PASS 计数：w:ins={len(ins)} w:del={len(dels)} 批注={ncomments}；署名=《{AUTHOR}》")

# ---- 6. 无 trackChanges 强留痕开关 ----
z2 = zipfile.ZipFile(DRAFT)
if "word/settings.xml" in z2.namelist():
    s = z2.read("word/settings.xml").decode("utf-8")
    assert "<w:trackChanges/>" not in s, "不应写入强制留痕开关"
print("PASS settings.xml 未写入强制留痕开关")
print("ALL_VERIFY_PASS")
