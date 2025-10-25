document.addEventListener('DOMContentLoaded', () => {
    // Ekranlar
    const loginScreen = document.getElementById('login-screen');
    const gameScreen = document.getElementById('game-screen');
    const gameTableScreen = document.getElementById('game-table-screen');
    
    // 1. Giriş/Qeydiyyat
    const loginForm = document.getElementById('login-form');
    const showRegisterButton = document.getElementById('show-register');
    const registerPopup = document.getElementById('register-popup');
    const registerForm = document.getElementById('register-form');
    const backToLoginButton = document.getElementById('back-to-login');

    // 2. Oyun Ekranı
    const logoutButton = document.getElementById('logout-button');
    const depositButton = document.getElementById('deposit-button');
    const withdrawalButton = document.getElementById('withdrawal-button');
    const tablesList = document.getElementById('tables-list');
    const balanceSpan = document.getElementById('current-balance');

    // 3. Oyun Masası
    const exitTableButton = document.getElementById('exit-table-button');
    const sitDownButton = document.getElementById('sit-down-button');
    const playerControls = document.querySelectorAll('.game-control-btn');
    const mySeat = document.querySelector('.seat-1');
    const myCards = document.querySelector('.seat-1 .my-cards');
    const timerProgress = document.querySelector('.seat-1 .timer-progress');

    // 5. Depozit
    const depositModal = document.getElementById('deposit-modal');
    const closeDepositModal = depositModal.querySelector('.close-button');
    const methodLeoCardButton = document.getElementById('method-leo-card');
    const leoPaymentFlow = document.getElementById('leo-payment-flow');
    const leoAmountForm = document.getElementById('leo-amount-form');
    const leoDetails = document.getElementById('leo-details');
    const copyLeoCardButton = document.getElementById('copy-leo-card');
    const leoTimerDisplay = document.getElementById('leo-timer-display');

    // Məntiqi dəyişkənlər
    let currentBalance = 0.00; 
    let leoTimerInterval;
    const minTableBalance = 5.00;
    const minDeposit = 5.00;

    // --- Köməkçi Funksiyalar ---
    const switchScreen = (targetScreen) => {
        [loginScreen, gameScreen, gameTableScreen].forEach(screen => {
            if (screen) screen.classList.add('hidden');
        });
        if (targetScreen) targetScreen.classList.remove('hidden');
    };

    const updateBalance = (newBalance = currentBalance) => {
        currentBalance = newBalance;
        balanceSpan.textContent = currentBalance.toFixed(2) + " AZN";
    };

    // --- 1. Giriş/Qeydiyyat Məntiqi ---
    showRegisterButton.addEventListener('click', () => {
        document.getElementById('login-form-container').classList.add('hidden');
        registerPopup.classList.remove('hidden');
    });

    backToLoginButton.addEventListener('click', () => {
        registerPopup.classList.add('hidden');
        document.getElementById('login-form-container').classList.remove('hidden');
    });

    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        // Təsdiq və Giriş Ekranına Qayıt
        alert("Qeydiyyat uğurlu! Avtomatik Giriş ekranına qayıt.");
        registerPopup.classList.add('hidden');
        document.getElementById('login-form-container').classList.remove('hidden');
    });

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        // Giriş uğurlu
        updateBalance(currentBalance); // Balansı göstər
        switchScreen(gameScreen);
    });

    // --- 2. Oyun Ekranı Məntiqi ---
    logoutButton.addEventListener('click', () => {
        if (confirm("Çıxış etmək istəyirsiniz?")) switchScreen(loginScreen);
    });
    
    withdrawalButton.addEventListener('click', () => {
        alert("Çıxarış funksiyası aktiv deyil.");
    });

    tablesList.addEventListener('click', (e) => {
        let btn = e.target.closest('.join-table-btn');
        if (!btn) return;
        
        let item = e.target.closest('.poker-table-card');
        const min = parseFloat(item.dataset.min);
        const isFull = item.dataset.full === 'true';
        
        if (isFull) {
            alert("Masa doludur. Sadəcə baxa bilərsiniz.");
            // Baxma rejimində oyuna daxil ola bilər (kontrollarsız)
        } else if (currentBalance < min) {
             alert(`Masaya giriş üçün ən azı ${min.toFixed(2)} AZN balansınız olmalıdır. Depozit edin.`);
             return;
        }

        document.querySelector('#game-table-screen .screen-title').textContent = item.querySelector('.table-name').textContent;
        // Oturma düyməsini göstər
        sitDownButton.classList.remove('hidden'); 
        myCards.classList.add('hidden');
        document.querySelector('.seat-1 .player-controls').classList.add('hidden');
        switchScreen(gameTableScreen);
    });

    // --- 3. Oyun Masası Məntiqi ---
    exitTableButton.addEventListener('click', () => {
        if (confirm("Masadan çıxmaq istəyirsiniz?")) {
            stopTimerDemo();
            switchScreen(gameScreen);
        }
    });

    sitDownButton.addEventListener('click', () => {
        sitDownButton.classList.add('hidden');
        myCards.classList.remove('hidden'); // Kartları göstər
        document.querySelector('.seat-1 .player-controls').classList.remove('hidden'); // Kontrolları göstər
        alert("Masaya oturdunuz. 3 kart paylanıldı. Növbə Sizdədir. (Demo)");
        startTimerDemo();
    });

    playerControls.forEach(button => {
        button.addEventListener('click', () => {
            const action = button.dataset.action;
            
            if (action === 'raise') {
                const amount = prompt("Xod Qaldırılacaq məbləği daxil edin (AZN):");
                if (amount && !isNaN(amount) && parseFloat(amount) > 0) {
                    alert(`${parseFloat(amount).toFixed(2)} AZN 'Xod Artır'dınız.`);
                } else { return; }
            } else if (action === 'pass') {
                alert("Kartlarınız 'Pas At'ıldı.");
            } else if (action === 'forward') {
                alert("'İrəli' seçdiniz. Növbə ötürüldü.");
            }
            
            // Hərəkətdən sonra növbəti oyunçuya keç
            stopTimerDemo(); 
            // Realda burada serverə sorğu gedəcək.
        });
    });

    // Geri Sayım (Timer) Məntiqi
    let timerInterval;
    const timerDuration = 35; 

    const startTimerDemo = () => {
        let timeElapsed = 0;
        const totalSteps = 350; 
        const stepAngle = 360 / totalSteps;
        
        mySeat.querySelector('.player-photo').style.borderColor = '#ffd700'; // Növbənin göstərilməsi
        
        clearInterval(timerInterval);
        timerInterval = setInterval(() => {
            timeElapsed++;
            const angle = 360 - (timeElapsed * stepAngle);
            timerProgress.style.background = `conic-gradient(black ${angle}deg, transparent ${angle}deg)`;
            
            if (timeElapsed >= totalSteps) {
                clearInterval(timerInterval);
                alert("Vaxt bitdi! Kartlar avtomatik Pasa Atıldı.");
                document.querySelector('.seat-1 .player-controls').classList.add('hidden');
            }
        }, 100); 
    };

    const stopTimerDemo = () => {
        clearInterval(timerInterval);
        timerProgress.style.background = `conic-gradient(black 360deg, transparent 360deg)`;
        mySeat.querySelector('.player-photo').style.borderColor = '#fff';
    };

    // --- 5. Depozit Məntiqi ---
    depositButton.addEventListener('click', () => {
        depositModal.classList.remove('hidden');
        // Modalı sıfırla
        leoPaymentFlow.classList.add('hidden');
        leoAmountForm.classList.remove('hidden');
        leoDetails.classList.add('hidden');
        document.getElementById('leo-deposit-amount').value = '';
    });
    
    closeDepositModal.addEventListener('click', () => {
        depositModal.classList.add('hidden');
        clearInterval(leoTimerInterval);
    });

    methodLeoCardButton.addEventListener('click', () => {
        methodLeoCardButton.classList.add('hidden');
        leoPaymentFlow.classList.remove('hidden');
    });

    leoAmountForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const amount = parseFloat(document.getElementById('leo-deposit-amount').value);
        if (amount < minDeposit) {
            alert(`Minimum depozit məbləği ${minDeposit.toFixed(2)} AZN olmalıdır.`);
            return;
        }
        
        leoAmountForm.classList.add('hidden');
        leoDetails.classList.remove('hidden');
        
        // Geri sayımı başlat
        startLeoDepositTimer();
        alert(`Ödəniş üçün ${amount.toFixed(2)} AZN təyin edildi. Nömrəni kopyalayın və ödəniş edin.`);
    });
    
    copyLeoCardButton.addEventListener('click', () => {
        navigator.clipboard.writeText('5411249812290497');
        copyLeoCardButton.textContent = "Kopyalandı!";
        setTimeout(() => { copyLeoCardButton.innerHTML = '<i class="fas fa-copy"></i> Kopyala'; }, 1500);
    });
    
    // LEO Depozit Geri Sayım Məntiqi
    const startLeoDepositTimer = () => {
        let timeLeft = 600; // 10 dəqiqə
        clearInterval(leoTimerInterval);
        leoTimerDisplay.textContent = '10:00';

        leoTimerInterval = setInterval(() => {
            timeLeft--;
            const minutes = Math.floor(timeLeft / 60);
            const seconds = timeLeft % 60;
            leoTimerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

            if (timeLeft <= 0) {
                clearInterval(leoTimerInterval);
                leoTimerDisplay.textContent = 'Vaxt Bitdi!';
                alert("Ödəniş üçün ayrılan vaxt bitdi.");
            }
        }, 1000);
    };

    // Başlanğıc balansı
    updateBalance(0.00); 
});
