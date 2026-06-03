$b64 = Get-Content base64.txt -Raw
$html = Get-Content SehatTrack_Esnesaba.html -Raw -Encoding UTF8
$dataUri = 'data:image/png;base64,' + $b64.Trim()
$html = $html.Replace('https://logo.clearbit.com/nutrifood.co.id', $dataUri)
Set-Content SehatTrack_Esnesaba.html $html -Encoding UTF8
