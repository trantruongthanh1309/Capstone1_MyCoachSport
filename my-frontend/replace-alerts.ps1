# Script to replace all alert() with toast in JSX files
# Run this in PowerShell from my-frontend directory

$files = Get-ChildItem -Path "FRONTEND" -Recurse -Include *.jsx,*.js

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    $modified = $false
    
    # Check if file contains alert(
    if ($content -match 'alert\(') {
        Write-Host "Processing: $($file.Name)" -ForegroundColor Yellow
        
        # Check if already has useToast import
        $hasUseToast = $content -match 'import.*useToast.*from.*ToastContext'
        
        if (-not $hasUseToast) {
            # Add import after first import statement
            $content = $content -replace '(import.*from.*[";])', "`$1`nimport { useToast } from '../contexts/ToastContext';"
            $modified = $true
            Write-Host "  Added useToast import" -ForegroundColor Green
        }
        
        # Check if component already has const toast = useToast()
        $hasToastHook = $content -match 'const\s+toast\s*=\s*useToast\(\)'
        
        if (-not $hasToastHook) {
            # Add toast hook after function declaration
            $content = $content -replace '(function\s+\w+\s*\([^)]*\)\s*\{)', "`$1`n  const toast = useToast();"
            $content = $content -replace '(export\s+default\s+function\s+\w+\s*\([^)]*\)\s*\{)', "`$1`n  const toast = useToast();"
            $content = $content -replace '(const\s+\w+\s*=\s*\([^)]*\)\s*=>\s*\{)', "`$1`n  const toast = useToast();"
            $modified = $true
            Write-Host "  Added toast hook" -ForegroundColor Green
        }
        
        # Replace alert() calls
        # Success alerts (with ✅ or "thành công")
        $content = $content -replace 'alert\(([^)]*✅[^)]*)\)', 'toast.success($1)'
        $content = $content -replace 'alert\(([^)]*thành công[^)]*)\)', 'toast.success($1)'
        $content = $content -replace 'alert\(([^)]*hoàn tất[^)]*)\)', 'toast.success($1)'
        
        # Error alerts (with ❌ or "lỗi")
        $content = $content -replace 'alert\(([^)]*❌[^)]*)\)', 'toast.error($1)'
        $content = $content -replace 'alert\(([^)]*[Ll]ỗi[^)]*)\)', 'toast.error($1)'
        $content = $content -replace 'alert\(([^)]*[Tt]hất bại[^)]*)\)', 'toast.error($1)'
        
        # Warning alerts (with ⚠️)
        $content = $content -replace 'alert\(([^)]*⚠️[^)]*)\)', 'toast.warning($1)'
        
        # Remaining alerts as info
        $content = $content -replace 'alert\(', 'toast.info('
        
        $modified = $true
        Write-Host "  Replaced alert() calls" -ForegroundColor Green
    }
    
    if ($modified) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        Write-Host "  Saved: $($file.Name)" -ForegroundColor Cyan
    }
}

Write-Host "`nDone! All alert() replaced with toast." -ForegroundColor Green
