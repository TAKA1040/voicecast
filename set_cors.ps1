# PowerShell script to set CORS on a GCS bucket
param (
    [string]$BucketName,
    [string]$CorsFile
)

$gcloudPath = "$env:ProgramFiles(x86)\Google\Cloud SDK\google-cloud-sdk\bin\gcloud.cmd"

if (-not (Test-Path $gcloudPath)) {
    Write-Error "gcloud.cmd not found at $gcloudPath"
    exit 1
}

Write-Host "Setting CORS for bucket: $BucketName using file: $CorsFile"
& $gcloudPath storage buckets update "gs://$BucketName" --cors-file="$CorsFile"
