let runningTotal = 0;
let buffer = "0";
let previeousOperator;

const screen = document.querySelector('.screen');
const music = document.getElementById('background-music');

function buttonClick(value){
    if (!value || value.length > 3) return; 
    
    if(isNaN(value)){
        handleSymbol(value);
    }else{
        handleNumber(value);
    }
    screen.innerText = buffer;
}

function handleSymbol(symbol){
    switch(symbol){
        case 'C':
            buffer = '0';
            runningTotal = 0;
            // PILIHAN: Jika tombol C diklik, kembalikan background ke warna semula dan matikan musik
            document.body.style.backgroundImage = "none";
            document.body.style.background = "linear-gradient(320deg, #eb92be, #ffef78, #63c9b4)";
            music.pause();
            music.currentTime = 0;
            break;
            
        case "=":
            if(previeousOperator === null){
                return
            }
            flushOperation(parseFloat(buffer));
            previeousOperator = null;
            buffer = runningTotal;
            runningTotal = 0 ;

            // === TRICK KEJUTAN TELETUBBIES ===
            // 1. Ubah background body menjadi gambar Teletubbies
            document.body.style.backgroundImage = "url('teletubbies.jpg')";
            
            // 2. Putar musik secara otomatis (Legal karena dipicu klik tombol "=")
            music.play().catch(error => {
                console.log("Gagal memutar musik:", error);
            });
            break;
            
        case "←":
            if(buffer.length ===1){
                buffer = '0';
            }else{
                buffer = buffer.substring(0, buffer.length - 1);
            }
            break;
        case "+":
        case "−":
        case "×":
        case "÷":
            handleMath(symbol);
            break;
    }
}

function handleMath(symbol){
    if(buffer === '0'){
        return;
    }

    const intBuffer = parseFloat(buffer);

    if(runningTotal === 0){
        runningTotal=intBuffer;
    }else{
        flushOperation(intBuffer);
    }
    previeousOperator = symbol;
    buffer = '0';
}

function flushOperation(intBuffer){
    if(previeousOperator === '+'){
        runningTotal += intBuffer;
    }else if(previeousOperator === '−'){
        runningTotal -= intBuffer;
    }else if(previeousOperator === '×'){
        runningTotal *= intBuffer;
    }else if(previeousOperator === '÷'){
        runningTotal /= intBuffer;
    }
}

function handleNumber(numberString){
    if(buffer === "0"){
        buffer = numberString;
    }else{
        buffer += numberString;
    }
}

function init(){
    document.querySelector('.calc-buttons').
    addEventListener('click', function(event){
        buttonClick(event.target.innerText);            
    })
}

init();
