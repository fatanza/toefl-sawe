let allQuestions = [];
let currentQuestions = [];
let currentQuestionIndex = 0;
let userAnswers = [];
let timerInterval;
let timeRemaining = 0;
let currentMode = '';

// Skala Penukaran Markah TOEFL ITP Section 2 (0-40 betul -> 31-68 markah)
const itpScale = [
    31, 31, 32, 33, 35, 36, 37, 38, 39, 40, // 0-9
    41, 42, 43, 44, 45, 46, 47, 48, 49, 50, // 10-19
    51, 52, 53, 54, 55, 56, 57, 58, 59, 60, // 20-29
    61, 62, 63, 64, 65, 66, 67, 68, 68, 68, 68 // 30-40
];

// 1. Muat turun bank soalan
fetch('questions.json')
    .then(response => response.json())
    .then(data => { allQuestions = data; })
    .catch(err => console.error("Ralat memuat turun soalan:", err));

// 2. Mulakan Kuiz
function startQuiz(mode) {
    if(allQuestions.length === 0) {
        alert("Soalan sedang dimuat turun, sila tunggu sebentar.");
        return;
    }
    
    currentMode = mode;
    if(mode === 'mini') {
        // Ambil 15 soalan secara rawak (shuffle)
        currentQuestions = [...allQuestions].sort(() => 0.5 - Math.random()).slice(0, 15);
        timeRemaining = 15 * 60; // 15 Minit
    } else {
        // Ambil kesemua soalan untuk simulasi penuh
        currentQuestions = [...allQuestions]; 
        timeRemaining = 25 * 60; // 25 Minit
    }

    currentQuestionIndex = 0;
    userAnswers = new Array(currentQuestions.length).fill(null);
    
    document.getElementById('dashboard').classList.remove('active');
    document.getElementById('quiz-area').classList.add('active');
    
    startTimer();
    showQuestion();
}

// 3. Pemasa (Timer)
function startTimer() {
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        if(timeRemaining <= 0) {
            clearInterval(timerInterval);
            finishQuiz();
        } else {
            timeRemaining--;
            let m = Math.floor(timeRemaining / 60).toString().padStart(2, '0');
            let s = (timeRemaining % 60).toString().padStart(2, '0');
            document.getElementById('timer').innerText = `Masa: ${m}:${s}`;
        }
    }, 1000);
}

// 4. Paparkan Soalan
function showQuestion() {
    let q = currentQuestions[currentQuestionIndex];
    document.getElementById('question-number').innerText = `Soalan ${currentQuestionIndex + 1} daripada ${currentQuestions.length}`;
    
    let formattedQuestion = q.question_text.replace(/\[([A-D])\]/g, '<strong style="color:#3b82f6;">[$1]</strong>');
    document.getElementById('question-text').innerHTML = formattedQuestion;
    
    let optionsHtml = '';
    q.options.forEach(opt => {
        let isSelected = userAnswers[currentQuestionIndex] === opt.label ? 'selected' : '';
        optionsHtml += `<button class="option-btn ${isSelected}" onclick="selectOption('${opt.label}')"><b>${opt.label}.</b> ${opt.text}</button>`;
    });
    
    document.getElementById('options-container').innerHTML = optionsHtml;
    
    document.getElementById('prev-btn').classList.toggle('hidden', currentQuestionIndex === 0);
    document.getElementById('next-btn').classList.toggle('hidden', currentQuestionIndex === currentQuestions.length - 1);
    document.getElementById('submit-btn').classList.toggle('hidden', currentQuestionIndex !== currentQuestions.length - 1);
}

// 5. Pilihan Jawapan & Navigasi
function selectOption(label) {
    userAnswers[currentQuestionIndex] = label;
    showQuestion();
}

function nextQuestion() {
    if(currentQuestionIndex < currentQuestions.length - 1) {
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

// 6. Penamatan & Pengiraan Markah
function finishQuiz() {
    clearInterval(timerInterval);
    document.getElementById('quiz-area').classList.remove('active');
    document.getElementById('result-area').classList.add('active');
    
    let correctCount = 0;
    let reviewHtml = '';
    
    currentQuestions.forEach((q, index) => {
        let userAnswer = userAnswers[index];
        if(userAnswer === q.answer_key) {
            correctCount++;
        } else {
            reviewHtml += `
            <div style="background:#fef2f2; border-left: 4px solid #ef4444; padding: 15px; margin-bottom: 20px; border-radius: 4px;">
                <p style="font-weight:600; margin-top:0;">Soalan ${index + 1}:</p>
                <p>${q.question_text.replace(/\[([A-D])\]/g, '<strong>[$1]</strong>')}</p>
                <p style="color: #b91c1c;"><b>Jawapan Anda:</b> ${userAnswer || 'Kosong'} &nbsp;|&nbsp; <b>Kunci:</b> ${q.answer_key}</p>
                <p><b>Penerangan:</b> ${q.explanation}</p>
                <button class="btn-primary" style="margin-top:10px; font-size:14px; padding: 8px 15px;" onclick="alert('Latihan khusus untuk topik: ${q.syllabus_tag} akan dipaparkan di sini.')">Latih Topik Ini (${q.syllabus_tag})</button>
            </div>`;
        }
    });
    
    let scoreDisplay = document.getElementById('final-score');
    let scoreNote = document.getElementById('score-note');

    if(currentMode === 'mini') {
        let finalPercentage = Math.round((correctCount / currentQuestions.length) * 100);
        scoreDisplay.innerText = `${finalPercentage}%`;
        scoreNote.innerText = `Anda menjawab ${correctCount} dengan betul daripada ${currentQuestions.length} soalan.`;
    } else {
        // Anggarkan markah kepada skala 40 jika soalan kurang daripada 40
        let scaledCorrect = Math.round((correctCount / currentQuestions.length) * 40);
        let itpScore = itpScale[scaledCorrect] || 31;
        scoreDisplay.innerText = itpScore;
        scoreNote.innerText = `Skor Rasmi ITP (Julat 31-68). Betul: ${correctCount}/${currentQuestions.length}`;
    }
    
    document.getElementById('review-container').innerHTML = reviewHtml || "<p style='color:#16a34a; font-weight:bold;'>Tahniah! Anda menjawab semua soalan dengan betul.</p>";
}
