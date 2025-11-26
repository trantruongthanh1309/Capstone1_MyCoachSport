# Script to add SwapButton to PlannerWithSwap.jsx
$file = "FRONTEND/pages/PlannerWithSwap.jsx"
$content = Get-Content $file -Raw

# Add SwapButton to meal items (after info button, before closing </div>)
$pattern1 = '(\s+<button\s+className="action-btn info-btn"\s+onClick=\{\(\) => showItemDetail\(mealItem\)\}\s+title="Chi tiết"\s+>\s+ℹ️\s+</button>\s+)(</div>)'
$replacement1 = '$1<SwapButton item={{ ...mealItem, date }} type="meal" onSwapSuccess={fetchWeeklyPlan} />`n                            $2'
$content = $content -replace $pattern1, $replacement1

# Add SwapButton to workout morning items
$pattern2 = '(\s+<button\s+className="action-btn info-btn"\s+onClick=\{\(\) => showItemDetail\(workoutItem\)\}\s+title="Chi tiết"\s+>\s+ℹ️\s+</button>\s+)(</div>)'
$replacement2 = '$1<SwapButton item={{ ...workoutItem, date }} type="workout" onSwapSuccess={fetchWeeklyPlan} />`n                          $2'
$content = $content -replace $pattern2, $replacement2

Set-Content $file -Value $content
Write-Host "✅ Added SwapButton to PlannerWithSwap.jsx"
