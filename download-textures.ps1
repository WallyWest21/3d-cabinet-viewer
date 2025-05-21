$textureSets = @{
    "wood" = @(
        "https://ambientcg.com/get?file=Wood_008_basecolor.jpg",
        "https://ambientcg.com/get?file=Wood_008_normal.jpg",
        "https://ambientcg.com/get?file=Wood_008_roughness.jpg",
        "https://ambientcg.com/get?file=Wood_008_ambientOcclusion.jpg"
    )
    "metal" = @(
        "https://ambientcg.com/get?file=Metal_006_basecolor.jpg",
        "https://ambientcg.com/get?file=Metal_006_normal.jpg",
        "https://ambientcg.com/get?file=Metal_006_roughness.jpg",
        "https://ambientcg.com/get?file=Metal_006_metallic.jpg",
        "https://ambientcg.com/get?file=Metal_006_ambientOcclusion.jpg"
    )
    "plastic" = @(
        "https://ambientcg.com/get?file=Plastic_001_basecolor.jpg",
        "https://ambientcg.com/get?file=Plastic_001_normal.jpg",
        "https://ambientcg.com/get?file=Plastic_001_roughness.jpg",
        "https://ambientcg.com/get?file=Plastic_001_ambientOcclusion.jpg"
    )
}

$baseDir = "N:\My Drive\Programming\Web\React\New folder\cabinet-test\public\textures"

foreach ($material in $textureSets.Keys) {
    $urls = $textureSets[$material]
    $dir = Join-Path $baseDir $material
    
    foreach ($url in $urls) {
        $fileName = [System.IO.Path]::GetFileName($url)
        $outFile = Join-Path $dir $fileName
        
        Write-Host "Downloading $fileName to $outFile"
        Invoke-WebRequest -Uri $url -OutFile $outFile
    }
}
