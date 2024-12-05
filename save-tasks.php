<?php
$file = 'yahtzee-game.json';
$gameData = file_get_contents('php://input');

if ($gameData) {
  file_put_contents($file, $gameData);
  echo "Game saved!";
} else {
  echo "No data received.";
}
?>
