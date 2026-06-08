$f = 'c:\Users\q\Desktop\my\script.js'
$content = [System.IO.File]::ReadAllText($f)
$lines = [System.Collections.Generic.List[string]]$content.Split("`n")
Write-Host "Total lines: $($lines.Count)"
$start = 1433
$end = 1873
Write-Host "Line $($start+1): $($lines[$start])"
Write-Host "Line $($end+1): $($lines[$end])"
