//Global variables
let n = 10
let AVAILABLE_FLAGS = 2*n
let REVEALED = 0;
let BOMB_NUMBER = 0;
let correctly_flagged = 0;
let GAMEOVER = false;
let GAMEWON = false;
let MUTED = false;
let PAUSED = true;

//sound effects
const flap = new Audio('flap.mp3');
const explosion = new  Audio('explosion.mp3');
const correct = new Audio("correct-choice.mp3")
const success = new Audio("success.mp3")
const sounds = [flap,explosion,correct,success]



// DOM elements
let field = document.getElementById("field")
field.style.gridTemplateColumns =  `repeat(${n}, auto)`;

let result = document.getElementById("result")
let flagDisplay = document.getElementById("flag")
flagDisplay.innerHTML=AVAILABLE_FLAGS
let restartButton = document.getElementById("restart")
let timeDisplay = document.getElementById("time")

field.addEventListener("click", function(){
    PAUSED= false
}, {once:true})

function bindEventListeners(cell){
    cell.addEventListener('click',function(){
        if (this.classList.contains("flagged")==false){
        click_cell(this.dataset.row, this.dataset.column)
        if (hasWon()){
            GAMEWON = true;
            pauseGame()
        }
    }
    })

    cell.addEventListener('contextmenu',function(e){
        e.preventDefault()
        if (board[this.dataset.row][ this.dataset.column]=="E" || board[this.dataset.row][ this.dataset.column]=="M"){

            if (this.classList.contains("flagged")){
                this.classList.remove("flagged")
                AVAILABLE_FLAGS++
            flap.play()

                if (board[this.dataset.row][this.dataset.column]=="M") {correctly_flagged-=1}
            }
            else if (AVAILABLE_FLAGS>0){
                this.classList.add("flagged")
                AVAILABLE_FLAGS--
                if (board[this.dataset.row][this.dataset.column]=="M") 
                correctly_flagged+=1
                flap.play()

            }
            
            if (hasWon()){
            GAMEWON = true;

            pauseGame()
        }
        }
        flagDisplay.innerHTML = AVAILABLE_FLAGS
    });
}

for (let i=0;i<n;i++){
    for (let j=0;j<n;j++){
        let cell = document.createElement("div")
        cell.classList.add("cell")
        cell.setAttribute("data-row", i)
        cell.setAttribute("data-column", j)
        field.appendChild(cell)
       
        bindEventListeners(cell)

    }
}



let dir = [[0,1], [0,-1], [-1,0], [1,0], [1,1], [-1,-1], [1,-1], [-1,1]]
function inbound(r,c){
    if (r<0 || r>=n) return false
    if (c<0 || c>=n) return false
    return true}
function count_adjacent_mines(r,c){
    let mines=0;
    for (let [x,y] of dir ){
         if (inbound(Number(r)+x,Number(c)+y) && board[Number(r)+x][Number(c)+y]=="M"){
             mines++}
    }
    return mines
}

function click_cell(r,c){
    cell = field.querySelector('[data-row="'+r+'"][data-column="'+c+'"]');
    if (board[r][c]=="M"){
        GAMEOVER = true;
        pauseGame()
        return 
    }
    if (board[r][c]=="E") {
    REVEALED += 1
    correct.play()}


    if (cell.classList.contains("flagged")){
        cell.classList.remove("flagged")
    }

    let adjacent_mines = count_adjacent_mines(r,c);
    if (adjacent_mines>0){
        board[r][c]=adjacent_mines
        cell.classList.add("revealed")
        cell.innerHTML = adjacent_mines
        return
    }
    board[r][c]="B"
    cell.classList.add("revealed")

    
    for (let [x,y] of dir ){
        if (inbound(Number(r)+x,Number(c)+y) && board[Number(r)+x][Number(c)+y]=="E")
            click_cell(Number(r)+x,Number(c)+y)
        }
    
}

function pauseGame(){
    PAUSED = true;
    restartButton.innerHTML = "Play Again"
    if (GAMEOVER) {explosion.play() 
        result.innerHTML="GAME OVER"}

    if (GAMEWON) {success.play()
        result.innerHTML="YOU HAVE WON"

    }
    for (let i=0;i<n;i++){
        for (let j=0;j<n;j++){
            let cell = field.querySelector('[data-row="'+i+'"][data-column="'+j+'"]');
            if (board[i][j]=="M" && cell.classList.contains("flagged")){
                cell.classList.remove("flagged")
                cell.classList.add("defused")

            }
            if (board[i][j]=="M"){
                cell.classList.add("exploded")

            }
            const clone = cell.cloneNode(true);
            cell.replaceWith(clone);
        }
}}

function generate_bombs(n){
 let numberOfBombs= Math.floor(Math.random()* (2*n-n)) + n
let bombPositions = []
let row;
let col;
for (let i=0;i<numberOfBombs;i++){
    row = Math.floor(Math.random()* n)
    col = Math.floor(Math.random()* n)
    bombPositions.push([row,col])
    }


 return bombPositions
}

function hasWon(){
    if (correctly_flagged!=BOMB_NUMBER) return false
    return correctly_flagged==BOMB_NUMBER && REVEALED == ((n*n)-BOMB_NUMBER)
}
let bombs = generate_bombs(n)
BOMB_NUMBER = bombs.length
let board = Array.from({ length: n }, () => Array(n).fill("E"));
function burry_bombs(){
    for (let [row,col] of bombs){
        if (board[row][col] == "M"){BOMB_NUMBER--}

        board[row][col] = "M"
    }
}
burry_bombs()

function restartGame(){
    AVAILABLE_FLAGS = 2*n
    flagDisplay.innerHTML=AVAILABLE_FLAGS
    restartButton.innerHTML = "Restart"
    PAUSED = true;
    seconds = 0;

    REVEALED = 0;
    BOMB_NUMBER = 0;
    correctly_flagged = 0;
    bombs = generate_bombs(n)
    BOMB_NUMBER = bombs.length
    board = Array.from({ length: n }, () => Array(n).fill("E"));
    burry_bombs()

    for (let i=0;i<n;i++){
        for (let j=0;j<n;j++){
            let cell = field.querySelector('[data-row="'+i+'"][data-column="'+j+'"]');
            cell.classList.remove("flagged" ,"revealed", "exploded", "defused")
            cell.textContent = ""
            if (GAMEOVER || GAMEWON) bindEventListeners(cell)
             }
    }
    field.addEventListener("click", function(){
        PAUSED = false;
    }, {once:true})
    GAMEOVER = false;
    GAMEWON = false;
    result.innerHTML=""
}
restartButton.addEventListener("click",restartGame)


let voluemeButton = document.getElementById("volume")
voluemeButton.addEventListener("click", function(){
    MUTED = !MUTED
    for (let sound of sounds){
        sound.muted = MUTED;
    }
    if (MUTED){
        voluemeButton.classList = "fas fa-volume-mute"
    }else voluemeButton.classList = "fas fa-volume-up"
});

function displayTime(){
    if (seconds<1000)timeDisplay.innerHTML= seconds}
let seconds = 0;
function updateTime() {
    if (!PAUSED && GAMEOVER==false){
        seconds++}
}

setInterval(updateTime,1000)
setInterval(displayTime,100)