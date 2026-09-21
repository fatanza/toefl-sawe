let questions = [];
let currentQuestionIndex = 0;
let userAnswers = [];

// 1. Mengambil data soal dari questions.json
fetch('questions.json')
    .then(response => response.json())
    .then(data => { questions = data; })
    .catch(err => console.error("Gagal memuat soal:", err));

// 2. Fungsi Mulai Kuis
function startQuiz(mode) {
    if(questions.length === 0) {
        alert("Soal sedang dimuat, coba beberapa detik lagi.");
        return;
    }
    currentQuestionIndex = 0;
    userAnswers = [];
    document.getElementById('dashboard').classList.remove('active');
    document.getElementById('quiz-area').classList.add('active');
    showQuestion();
}

// 3. Menampilkan Soal ke Layar
function showQuestion() {
    let q = questions[currentQuestionIndex];
    document.getElementById('question-number').innerText = `Soal ${currentQuestionIndex + 1} dari ${questions.length}`;
    
    // Highlight [A], [B], [C], [D] untuk soal Part B
    let formattedQuestion = q.question_text.replace(/\[([A-D])\]/g, '<strong style="color:#3b82f6;">[$1]</strong>');
    document.getElementById('question-text').innerHTML = formattedQuestion;
    
    let optionsHtml = '';
    q.options.forEach(opt => {
        let isSelected = userAnswers[currentQuestionIndex] === opt.label ? 'selected' : '';
        optionsHtml += `<button class="option-btn ${isSelected}" onclick="selectOption('${opt.label}')"><b>${opt.label}.</b> ${opt.text}</button>`;
    });
    
    document.getElementById('options-container').innerHTML = optionsHtml;
    
    // Atur tombol navigasi
    document.getElementById('prev-btn').classList.toggle('hidden', currentQuestionIndex === 0);
    document.getElementById('next-btn').classList.toggle('hidden', currentQuestionIndex === questions.length - 1);
    document.getElementById('submit-btn').classList.toggle('hidden', currentQuestionIndex !== questions.length - 1);
}

// 4. Memilih Jawaban
function selectOption(label) {
    userAnswers[currentQuestionIndex] = label;
    showQuestion(); // Render ulang agar tombol yang dipilih tersorot
}

// 5. Navigasi Next / Prev
function nextQuestion() {
    if(currentQuestionIndex < questions.length - 1) {
        currentQuestionIndex++;
        showQuestion();
    }
}

function prevQuestion() {
    if(currentQuestionIndex > 0) {
        currentQuestionIndex--;
        showQuestion();
    }
}

// 6. Menyelesaikan Kuis & Menampilkan Evaluasi
function finishQuiz() {
    document.getElementById('quiz-area').classList.remove('active');
    document.getElementById('result-area').classList.add('active');
    
    let correctCount = 0;
    let reviewHtml = '';
    
    questions.forEach((q, index) => {
        let userAnswer = userAnswers[index];
        if(userAnswer === q.answer_key) {
            correctCount++;
        } else {
            // Tampilan untuk soal yang salah
            reviewHtml += `
            <div style="background:#fef2f2; border-left: 4px solid #ef4444; padding: 15px; margin-bottom: 20px; border-radius: 4px;">
                <p style="font-weight:600; margin-top:0;">Soal ${index + 1}:</p>
                <p>${q.question_text}</p>
                <p style="color: #b91c1c;"><b>Jawaban Anda:</b> ${userAnswer || 'Tidak dijawab'} &nbsp;|&nbsp; <b>Kunci Benar:</b> ${q.answer_key}</p>
                <p><b>Pembahasan:</b> ${q.explanation}</p>
                <button class="btn-primary" style="margin-top:10px; font-size:14px; padding: 8px 15px;" onclick="alert('Fitur Simulasi Soal Sejenis untuk materi [${q.syllabus_tag}] sedang dikembangkan. Nanti akan muncul di layar ini tanpa pindah halaman!')">Latih Materi Ini (${q.syllabus_tag})</button>
            </div>`;
        }
    });
    
    let finalScore = Math.round((correctCount / questions.length) * 100);
    document.getElementById('final-score').innerText = `${finalScore}%`;
    document.getElementById('review-container').innerHTML = reviewHtml || "<p style='color:#16a34a; font-weight:bold;'>Sempurna! Anda tidak memiliki kesalahan.</p>";
}
