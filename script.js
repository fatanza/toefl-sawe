let allQuestions = [];
let currentQuestions = [];
let currentQuestionIndex = 0;
let userAnswers = [];
let timerInterval;
let timeRemaining = 0;
let currentMode = '';

// Skala Konversi Nilai TOEFL ITP Section 2 (0-40 benar -> 31-68 skor)
const itpScale = [
    31, 31, 32, 33, 35, 36, 37, 38, 39, 40, // 0-9
    41, 42, 43, 44, 45, 46, 47, 48, 49, 50, // 10-19
    51, 52, 53, 54, 55, 56, 57, 58, 59, 60, // 20-29
    61, 62, 63, 64, 65, 66, 67, 68, 68, 68, 68 // 30-40
];

fetch('questions.json?v=' + new Date().getTime())
    .then(response => response.json())
    .then(data => { allQuestions = data; })
    .catch(err => console.error("Gagal memuat soal:", err));

function startQuiz(mode) {
    if(allQuestions.length === 0) {
        alert("Soal sedang dimuat, tunggu sebentar ya.");
        return;
    }
    
    currentMode = mode;
    let structureBank = allQuestions.filter(q => q.type === 'structure');
    let writtenBank = allQuestions.filter(q => q.type === 'written_expression');
    
    structureBank.sort(() => 0.5 - Math.random());
    writtenBank.sort(() => 0.5 - Math.random());

    if(mode === 'mini') {
        let miniStructure = structureBank.slice(0, 5);
        let miniWritten = writtenBank.slice(0, 10);
        currentQuestions = [...miniStructure, ...miniWritten];
        timeRemaining = 15 * 60; 
    } else {
        let fullStructure = structureBank.slice(0, 15);
        let fullWritten = writtenBank.slice(0, 25);
        currentQuestions = [...fullStructure, ...fullWritten];
        timeRemaining = 25 * 60; 
    }

    currentQuestionIndex = 0;
    userAnswers = new Array(currentQuestions.length).fill(null);
    
    document.getElementById('dashboard').classList.remove('active');
    document.getElementById('quiz-area').classList.add('active');
    
    startTimer();
    showQuestion();
}

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
            document.getElementById('timer').innerText = `Waktu: ${m}:${s}`;
        }
    }, 1000);
}

function showQuestion() {
    let q = currentQuestions[currentQuestionIndex];
    document.getElementById('question-number').innerText = `Soal ${currentQuestionIndex + 1} dari ${currentQuestions.length}`;
    
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

function finishQuiz() {
    clearInterval(timerInterval);
    document.getElementById('quiz-area').classList.remove('active');
    document.getElementById('result-area').classList.add('active');
    
    let correctCount = 0;
    let reviewHtml = '';
    
    currentQuestions.forEach((q, index) => {
        let userAnswer = userAnswers[index];
        let isCorrect = (userAnswer === q.answer_key);
        if(isCorrect) {
            correctCount++;
        }
        
        // Merangkai teks pilihan ganda (A, B, C, D) agar muncul lengkap di pembahasan
        let optionsListHtml = '<div style="margin: 10px 0; font-size: 14px;">';
        q.options.forEach(opt => {
            let style = "";
            if(opt.label === q.answer_key) style = "font-weight: bold; color: #16a34a;"; // Hijau untuk kunci
            if(opt.label === userAnswer && !isCorrect) style = "font-weight: bold; color: #ef4444; text-decoration: line-through;"; // Merah dicoret jika salah pilih
            
            optionsListHtml += `<div style="${style}"><b>${opt.label}.</b> ${opt.text}</div>`;
        });
        optionsListHtml += '</div>';

        // Desain kotak evaluasi (hijau jika benar, merah lembut jika salah)
        let borderColor = isCorrect ? '#22c55e' : '#ef4444';
        let bgColor = isCorrect ? '#f0fdf4' : '#fef2f2';
        let statusText = isCorrect ? '<span style="color: #16a34a; font-weight: bold;">✔ Benar</span>' : '<span style="color: #ef4444; font-weight: bold;">✖ Salah</span>';

        reviewHtml += `
        <div style="background:${bgColor}; border-left: 4px solid ${borderColor}; padding: 15px; margin-bottom: 20px; border-radius: 4px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <p style="font-weight:600; margin-top:0; margin-bottom: 5px;">Soal ${index + 1}</p>
                ${statusText}
            </div>
            <p style="margin-bottom: 10px;">${q.question_text.replace(/\[([A-D])\]/g, '<strong>[$1]</strong>')}</p>
            
            ${optionsListHtml}
            
            <p style="font-size: 14px; margin: 8px 0;"><b>Jawaban Anda:</b> ${userAnswer || 'Kosong'} &nbsp;|&nbsp; <b>Kunci Jawaban:</b> ${q.answer_key}</p>
            <p style="font-size: 14px; margin-bottom: 10px;"><b>Pembahasan:</b> ${q.explanation}</p>
            
            ${!isCorrect ? `<button class="btn-primary" style="margin-top:5px; font-size:13px; padding: 6px 12px;" onclick="alert('Latihan khusus untuk topik: ${q.syllabus_tag} akan segera diaktifkan.')">Latih Topik Ini (${q.syllabus_tag})</button>` : ''}
        </div>`;
    });
    
    let scoreDisplay = document.getElementById('final-score');
    let scoreNote = document.getElementById('score-note');

    if(currentMode === 'mini') {
        let finalPercentage = Math.round((correctCount / currentQuestions.length) * 100);
        scoreDisplay.innerText = `${finalPercentage}%`;
        scoreNote.innerText = `Anda menjawab benar ${correctCount} dari ${currentQuestions.length} soal.`;
    } else {
        let itpScore = itpScale[correctCount] || 31;
        scoreDisplay.innerText = itpScore;
        scoreNote.innerText = `Skor Konversi ITP (Skala 31-68). Total Benar: ${correctCount}/${currentQuestions.length}`;
    }
    
    document.getElementById('review-container').innerHTML = reviewHtml;
}
