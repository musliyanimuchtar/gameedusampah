$env:PATH = "C:\Program Files\Git\cmd;" + $env:PATH

Clear-Host
Write-Host "====================================================" -ForegroundColor Cyan
Write-Host "       EcoBot - Push ke Repository GitHub           " -ForegroundColor Green
Write-Host "       Target: musliyanimuchtar/gameedusampah       " -ForegroundColor Yellow
Write-Host "====================================================" -ForegroundColor Cyan
Write-Host ""

# Cek git
try {
    $gitVer = & git --version
    Write-Host "Git terdeteksi: $gitVer" -ForegroundColor Gray
} catch {
    Write-Host "ERROR: Git tidak ditemukan di sistem!" -ForegroundColor Red
    pause
    exit 1
}

Write-Host ""
Write-Host "Pilih metode login & push:" -ForegroundColor White
Write-Host " [1] Login via Browser (Otomatis & Rekomendasi)" -ForegroundColor Green
Write-Host " [2] Masukkan Personal Access Token (PAT)" -ForegroundColor Yellow
Write-Host " [3] Batal / Keluar" -ForegroundColor Gray
Write-Host ""

$pilihan = Read-Host "Ketik pilihan Anda (1/2/3)"

if ($pilihan -eq "3") {
    exit 0
}

if ($pilihan -eq "2") {
    Write-Host ""
    Write-Host "--- Masukkan Kredensial GitHub ---" -ForegroundColor Yellow
    $user = Read-Host "Username GitHub"
    $token = Read-Host "Personal Access Token (PAT)"
    
    if (-not $user -or -not $token) {
        Write-Host "Username atau Token tidak boleh kosong!" -ForegroundColor Red
        pause
        exit 1
    }
    
    $authUrl = "https://${user}:${token}@github.com/musliyanimuchtar/gameedusampah.git"
    & git remote set-url origin $authUrl
    
    Write-Host ""
    Write-Host "Sedang mengunggah file ke GitHub..." -ForegroundColor Cyan
    & git push -u origin main
    $success = ($LASTEXITCODE -eq 0)
    
    # Kembalikan remote ke URL aman tanpa token
    & git remote set-url origin "https://github.com/musliyanimuchtar/gameedusampah.git"
} else {
    Write-Host ""
    Write-Host "Sedang memulai proses push..." -ForegroundColor Cyan
    Write-Host "Jika jendela browser terbuka, silakan klik 'Authorize' atau login." -ForegroundColor Gray
    Write-Host ""
    
    & git remote set-url origin "https://github.com/musliyanimuchtar/gameedusampah.git"
    & git push -u origin main
    $success = ($LASTEXITCODE -eq 0)
}

Write-Host ""
if ($success) {
    Write-Host "====================================================" -ForegroundColor Green
    Write-Host " [BERHASIL] Semua file berhasil di-push ke GitHub!  " -ForegroundColor Green
    Write-Host " https://github.com/musliyanimuchtar/gameedusampah   " -ForegroundColor Cyan
    Write-Host "====================================================" -ForegroundColor Green
    Start-Process "https://github.com/musliyanimuchtar/gameedusampah"
} else {
    Write-Host "====================================================" -ForegroundColor Red
    Write-Host " [GAGAL] Push belum berhasil.                       " -ForegroundColor Red
    Write-Host " Periksa error di atas atau pastikan akun sesuai.   " -ForegroundColor Yellow
    Write-Host "====================================================" -ForegroundColor Red
}

Write-Host ""
Write-Host "Tekan Enter untuk menutup..." -ForegroundColor Gray
[void][System.Console]::ReadLine()
