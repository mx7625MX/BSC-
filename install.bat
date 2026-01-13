@echo off
echo ================================================
echo   BSC Defensive Bot - Installation Script
echo ================================================
echo.

REM Check Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo X Node.js is not installed. Please install Node.js v16 or higher.
    pause
    exit /b 1
)

echo √ Node.js version:
node -v
echo.

REM Check npm
where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo X npm is not installed.
    pause
    exit /b 1
)

echo √ npm version:
npm -v
echo.

REM Install dependencies
echo Installing dependencies...
call npm install

if %errorlevel% neq 0 (
    echo X Failed to install dependencies
    pause
    exit /b 1
)

echo.
echo √ Dependencies installed successfully
echo.

REM Create .env file if it doesn't exist
if not exist .env (
    echo Creating .env file from template...
    copy .env.example .env
    echo √ .env file created. Please edit it with your configuration.
) else (
    echo i .env file already exists
)

echo.
echo ================================================
echo   Installation Complete!
echo ================================================
echo.
echo Next steps:
echo 1. Edit .env file with your wallet address and private key
echo 2. Run 'npm run dev' to start in development mode
echo 3. Run 'npm start' to start in production mode
echo 4. Run 'npm run build' to build executables
echo.
pause
