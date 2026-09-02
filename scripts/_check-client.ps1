# Temporary helper: fetch the served sidebar client bundle and assert the M8.5
# (实务画像) strings are present in what the browser actually downloads.
#
# 坑（历史误报来源，本脚本已处理）：
#   1. 打包器默认 charset=ascii，中文在 bundle 里是 \uXXXX 转义，比对前必须反转义。
#   2. MCP 端点名与部分文案是运行时模板串拼的，bundle 里没有字面量。
$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'

$resp = Invoke-WebRequest -Uri 'http://127.0.0.1:3080/plugins/lawyer-sidebar/client.js' -UseBasicParsing
$raw = [System.Text.Encoding]::UTF8.GetString($resp.RawContentStream.ToArray())
$body = [regex]::Replace($raw, '\\u([0-9a-fA-F]{4})', {
  param($m) [char][int]('0x' + $m.Groups[1].Value)
})

Write-Host ('status = ' + $resp.StatusCode)
Write-Host ('chars  = ' + $body.Length)

$checks = @(
  '实务画像',
  '实务画像配置',
  'L1 快速配置',
  'L2 完整访谈',
  'L3 原文直编',
  'cold-start-interview',
  '开始 15 分钟完整访谈',
  '仅重新检测集成',
  '留空则按通用标准',
  '[PLACEHOLDER]',
  'profileDismissed',
  'IMAGEHOLDER_SKIP'
)
$fail = 0
foreach ($c in $checks) {
  if ($c -eq 'IMAGEHOLDER_SKIP') { continue }
  $hit = $body.Contains($c)
  if (-not $hit) { $fail++ }
  Write-Host ('  ' + $(if ($hit) { 'PASS ' } else { 'FAIL ' }) + $c)
}

# RPC 端点与领域表都是运行时拼装的，bundle 里只有模板/字面量成分：
#   - 端点模板：`lawyerProfile/${method}`
#   - 领域目录名：打包器输出双引号键，故两种引号都要认
$rpcTemplate = [regex]::IsMatch($body, 'lawyerProfile/\$\{')
if (-not $rpcTemplate) { $fail++ }
Write-Host ('  ' + $(if ($rpcTemplate) { 'PASS ' } else { 'FAIL ' }) + 'RPC 端点模板 lawyerProfile/${method}')

$domainCount = ([regex]::Matches($body, "['\""][a-z]+(?:-[a-z]+)*-legal['\""]")).Count
$ok = $domainCount -ge 10
if (-not $ok) { $fail++ }
Write-Host ('  ' + $(if ($ok) { 'PASS ' } else { 'FAIL ' }) + "领域目录名字面量 >= 10（实测 $domainCount）")

Write-Host $(if ($fail -eq 0) { 'ALL PASS' } else { "$fail FAIL" })
