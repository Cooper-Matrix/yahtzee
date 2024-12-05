<?php
$file = 'yahtzee-game.json';

if (file_exists($file)) {
  echo file_get_contents($file);
} else {
  echo json_encode(["dice" => [0, 0, 0, 0, 0], "rollsLeft" => 3, "score" => []]);
}
?>
