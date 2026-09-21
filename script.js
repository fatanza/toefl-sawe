let currentMode = '';
let currentQuestionIndex = 0;

// Logika Navigasi Sederhana
function startQuiz(mode) {
    currentMode = mode;
    document.getElementById('dashboard').classList.remove('active');
    document.getElementById('quiz-area').classList.add('active');
    
    // Nanti kita tambahkan logika fetch soal dari JSON di sini
    console.log("Mulai kuis dengan mode:", mode);
}

function nextQuestion() {
    console.log("Pindah ke soal selanjutnya");
    // Nanti diisi logika ganti soal
}

function prevQuestion() {
    console.log("Kembali ke soal sebelumnya");
    // Nanti diisi logika ganti soal
}

function finishQuiz() {
    document.getElementById('quiz-area').classList.remove('active');
    document.getElementById('result-area').classList.add('active');
    
    // Nanti diisi logika perhitungan skor persentase atau konversi ITP
    document.getElementById('final-score').innerText = "Sedang Dihitung...";
}
