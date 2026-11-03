$ErrorActionPreference = "Stop"
$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$node = Get-Command node -CommandType Application -ErrorAction SilentlyContinue
$cloudflared = Get-Command cloudflared -CommandType Application -ErrorAction SilentlyContinue

if (-not $node) {
  Write-Error "Node.js 18 or newer is required."
  exit 1
}
if (-not $cloudflared) {
  Write-Error "cloudflared is not installed. Run: winget install --id Cloudflare.cloudflared"
  exit 1
}

$env:HOST = "127.0.0.1"
$env:PORT = "8989"
$env:READ_ONLY_MODE = "1"
$env:TLS_CERT_PATH = ""
$env:TLS_KEY_PATH = ""
$server = $null
$exitCode = 0

try {
  $server = Start-Process -FilePath $node.Source -ArgumentList @("server.js") `
    -WorkingDirectory $projectRoot -NoNewWindow -PassThru

  $healthy = $false
  for ($attempt = 0; $attempt -lt 30; $attempt++) {
    if ($server.HasExited) {
      throw "The ChooseMore preview server stopped before it became ready. Check whether port 8989 is already in use."
    }

    try {
      $health = Invoke-RestMethod -Uri "http://127.0.0.1:8989/api/health" -TimeoutSec 2
      if ($health.status -eq "ok" -and $health.mode -eq "read-only-preview") {
        $healthy = $true
        break
      }
    } catch {
      Start-Sleep -Seconds 1
    }
    Start-Sleep -Milliseconds 500
  }

  if (-not $healthy) {
    throw "The local server did not confirm read-only preview mode on port 8989."
  }

  Write-Host "ChooseMore is serving a read-only preview on http://127.0.0.1:8989/."
  Write-Host "Cloudflare will print a temporary public HTTPS URL below. Share only sample data."
  Write-Host "Press Ctrl+C to stop the tunnel and local preview server."
  & $cloudflared.Source tunnel --url http://127.0.0.1:8989
  if ($LASTEXITCODE -ne 0) {
    throw "cloudflared exited with code $LASTEXITCODE."
  }
} catch {
  Write-Host "Preview setup failed: $_"
  $exitCode = 1
} finally {
  if ($server -and -not $server.HasExited) {
    Stop-Process -Id $server.Id -Force
  }
}

exit $exitCode
