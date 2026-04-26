Param(
    [switch]$Install,
    [switch]$Start,
    [switch]$All,
    [switch]$IncludeFunctions
)

if (-not ($Install -or $Start -or $All)) { $All = $true }

$root = Split-Path -Parent $MyInvocation.MyCommand.Definition

function FailExit($msg) {
    Write-Error $msg
    exit 1
}

Write-Host "Root: $root"

# Check Node
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    FailExit "Node.js not found. Install Node.js (v18+) and re-run this script. https://nodejs.org/"
}

# Choose package manager
if (Get-Command pnpm -ErrorAction SilentlyContinue) { $pm = 'pnpm' }
elseif (Get-Command npm -ErrorAction SilentlyContinue) { $pm = 'npm' }
else { FailExit "Neither pnpm nor npm found. Install one and re-run." }

if ($Install -or $All) {
    Write-Host "Installing frontend dependencies using $pm..."
    Push-Location $root
    & $pm install
    Pop-Location

    if (Test-Path (Join-Path $root 'functions')) {
        Write-Host "Installing functions dependencies (npm)..."
        Push-Location (Join-Path $root 'functions')
        if (Get-Command npm -ErrorAction SilentlyContinue) { & npm install } else { Write-Warning "npm not found; skipping functions install." }
        Pop-Location
    }

    # Python deps
    if (-not (Get-Command python -ErrorAction SilentlyContinue)) {
        Write-Warning "Python not found. Skipping Python dependency install. Install Python 3.10+ and run this script again to install ML backend deps."
    } else {
        Write-Host "Setting up Python venv and installing ML backend requirements..."
        $ml = Join-Path $root 'ml-backend'
        if (Test-Path $ml) {
            Push-Location $ml
            if (-not (Test-Path '.venv')) { python -m venv .venv }
            $pip = Join-Path $ml '.venv\Scripts\pip.exe'
            if (Test-Path $pip) {
                & $pip install --upgrade pip
                & $pip install -r requirements.txt
            } else {
                Write-Warning "Could not find pip in venv; you may need to activate the venv and install requirements manually."
            }
            Pop-Location
        }
    }
}

if ($Start -or $All) {
    # Start frontend in new PowerShell window
    $frontendCmd = "cd '$root'; $pm run dev"
    Write-Host "Starting frontend: $frontendCmd"
    Start-Process -FilePath powershell -ArgumentList '-NoExit','-Command',$frontendCmd

    # Start ML backend if present
    $ml = Join-Path $root 'ml-backend'
    if (Test-Path $ml) {
        $backendCmd = "cd '$ml'; if (Test-Path .venv) { . .\venv\Scripts\Activate.ps1 }; uvicorn main:app --reload --host 127.0.0.1 --port 8000"
        Write-Host "Starting ML backend: $backendCmd"
        Start-Process -FilePath powershell -ArgumentList '-NoExit','-Command',$backendCmd
    } else {
        Write-Warning "No ml-backend folder found; skipping backend start."
    }

    if ($IncludeFunctions) {
        $funcDir = Join-Path $root 'functions'
        if (Test-Path $funcDir) {
            $funcCmd = "cd '$funcDir'; npm run serve"
            Write-Host "Starting Functions emulator: $funcCmd"
            Start-Process -FilePath powershell -ArgumentList '-NoExit','-Command',$funcCmd
        } else {
            Write-Warning 'No functions folder found; skipping functions emulator.'
        }
    }
}

Write-Host "Done. Use the opened PowerShell windows to monitor servers."
