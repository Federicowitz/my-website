param(
    [string]$Source = (Join-Path $PSScriptRoot '../teaching/materials/reti/dispensa.md')
)
$ErrorActionPreference = 'Stop'
$folder = Join-Path $PSScriptRoot '../teaching/materials/reti'
New-Item -ItemType Directory -Force -Path $folder | Out-Null
$sourcePath = (Resolve-Path -LiteralPath $Source).Path
$retained = [IO.Path]::GetFullPath((Join-Path $folder 'dispensa.md'))
if ($sourcePath -ne $retained) { Copy-Item -LiteralPath $sourcePath -Destination $retained }
$text = [IO.File]::ReadAllText($retained)
$starts = [regex]::Matches($text, '(?m)^# (?:Lezione \d+ — |Appendice — )')
if ($starts.Count -ne 19) { throw 'Attese 18 lezioni e una appendice.' }
$parts = @($text.Substring(0, $starts[0].Index))
for ($i = 0; $i -lt $starts.Count; $i++) {
    $end = if ($i + 1 -lt $starts.Count) { $starts[$i + 1].Index } else { $text.Length }
    $parts += $text.Substring($starts[$i].Index, $end - $starts[$i].Index)
}
if (($parts -join '') -cne $text) { throw 'La suddivisione ha modificato il testo.' }
for ($i = 0; $i -lt $parts.Count; $i++) {
    $part = $parts[$i]
    $title = [regex]::Match($part, '(?m)^# (.+)\r?$').Groups[1].Value.TrimEnd("`r")
    $name = if ($i -eq 0) { '00-introduzione.html' } elseif ($i -eq 19) { '19-appendice.html' } else { '{0:00}-lezione.html' -f $i }
    $safeTitle = [Net.WebUtility]::HtmlEncode($title)
    $body = (ConvertFrom-Markdown -InputObject $part).Html
    $html = @"
<!doctype html>
<html lang="it"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>$safeTitle</title><meta name="school-kind" content="lesson"><meta name="description" content="$safeTitle"><link rel="stylesheet" href="../../reader.css"><link rel="stylesheet" href="reti.css"></head><body><main class="reading reti-reading">
<!-- RETI:CONTENT:START -->$body<!-- RETI:CONTENT:END -->
</main></body></html>
"@
    [IO.File]::WriteAllText((Join-Path $folder $name), $html, [Text.UTF8Encoding]::new($false))
}
Write-Output 'Importate 18 lezioni, introduzione e appendice. Testo sorgente integralmente conservato.'
