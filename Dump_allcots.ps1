<#
.SYNOPSIS
  Dump contents of ALL files (all extensions, all folders) under a root into one output text file.

.PARAMETER Root
  Root folder to scan. Default: current directory "."

.PARAMETER OutFile
  Full path to the single output text file. If exists, it will be overwritten unless -Append is used.

.PARAMETER Append
  If set, appends to OutFile instead of overwriting.

.PARAMETER Encoding
  Output encoding. Default: UTF8
#>

param(
  [string]$Root = ".",
  [Parameter(Mandatory=$true)][string]$OutFile,
  [switch]$Append,
  [ValidateSet('UTF8','UTF8BOM','ASCII','Unicode','UTF7','UTF32','BigEndianUnicode')][string]$Encoding = 'UTF8'
)

# --- Resolve paths and prepare output ---
$rootPath = Convert-Path -LiteralPath $Root

# Ensure output directory exists
$outDir = Split-Path -Path $OutFile -Parent
if ($outDir -and -not (Test-Path -LiteralPath $outDir)) {
  $null = New-Item -ItemType Directory -Force -Path $outDir
}

# Initialize or append file
if ($Append) {
  "`n===== RUN START: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') =====`n" | Out-File -LiteralPath $OutFile -Encoding $Encoding -Append
} else {
  "===== RUN START: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') =====`n" | Out-File -LiteralPath $OutFile -Encoding $Encoding
}

# Enumerate ALL files (no include/exclude filters)
$files = Get-ChildItem -LiteralPath $rootPath -Recurse -File -ErrorAction SilentlyContinue

# Output each file with header and contents
foreach ($f in $files) {
  $header = "===== FILE: {0} | Size: {1:N2} MB | Modified: {2} =====" -f $f.FullName, ($f.Length/1MB), ($f.LastWriteTime.ToString('yyyy-MM-dd HH:mm:ss'))
  $header | Out-File -LiteralPath $OutFile -Encoding $Encoding -Append

  try {
    # Stream content efficiently; will dump raw text (binary files may produce garbled output)
    Get-Content -LiteralPath $f.FullName -ReadCount 500 -ErrorAction Stop | `
      Out-File -LiteralPath $OutFile -Encoding $Encoding -Append
  } catch {
    ("!! Failed to read: {0}" -f $_.Exception.Message) | Out-File -LiteralPath $OutFile -Encoding $Encoding -Append
  }

  "`n" | Out-File -LiteralPath $OutFile -Encoding $Encoding -Append
}

"===== RUN END: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') =====" | Out-File -LiteralPath $OutFile -Encoding $Encoding -Append
Write-Host "Completed. Output written to: $OutFile"