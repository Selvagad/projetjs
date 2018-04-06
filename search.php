<?php
$kw=$_REQUEST['data'];
$req=urlencode($kw);
$a="+";$b="%20";
$req=str_replace($a,$b,$req);
$url = "http://www-etu-info.iut2.upmf-grenoble.fr/~brouardc/M4103C/news228/search_news.php?kw=".$req;
// Open the file using the HTTP headers set above
$body = file_get_contents($url, true);
// now, process the JSON string
echo $body;
?>