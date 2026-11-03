@echo off
setlocal
cd /d "%~dp0"

if not defined HOST set "HOST=127.0.0.1"
if not defined PORT set "PORT=8989"

where node >nul 2>nul
if errorlevel 1 (
  echo Node.js 18 or newer is required. Install Node.js, then run this file again.
  exit /b 1
)

echo Starting the ChooseMore local site and API...
if defined TLS_CERT_PATH if defined TLS_KEY_PATH goto https
echo Storefront: http://127.0.0.1:%PORT%/
echo API health: http://127.0.0.1:%PORT%/api/health
echo Product catalog: http://127.0.0.1:%PORT%/api/products
goto start
:https
echo HTTPS storefront: https://127.0.0.1:%PORT%/
echo HTTPS API health: https://127.0.0.1:%PORT%/api/health
:start
node server.js
