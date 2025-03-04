
const gameOverPanel=document.querySelector('.game-over');

export function gameOver(){
 gameOverPanel.classList.add('game-over-visible');
} 

export function gameRestart(){
 gameOverPanel.classList.remove('game-over-visible');
} 