<?php
$myfile = fopen("pokedex.json", "r") or die("Unable to open file!");
echo fread($myfile,filesize("pokedex.json"));
fclose($myfile);
?>