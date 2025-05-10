// 肥料計算アプリケーションのメインJavaScriptファイル

// グローバル変数
let fertilizers = []; // 肥料リスト
let defaultPresets = []; // デフォルトのプリセット
let userPresets = []; // ユーザー定義のプリセット
let calculationHistory = []; // 計算履歴

// DOM読み込み完了時の初期化
document.addEventListener('DOMContentLoaded', () => {
    // 初期設定を読み込む
    loadSettings();
    
    // プリセットを描画
    renderPresets();
    
    // タブの初期化
    initTabs();

    // モバイル対応の初期化
    initMobileSupport();
    
    // イベントリスナーの設定
    setupEventListeners();
    
    // 履歴リストの表示
    renderHistoryList();
    
    // ページ読み込み完了時に一度プリセットを強制的に描画（モバイル表示問題対策）
    setTimeout(() => {
        renderPresets();
        
        // モバイルで表示確認
        if (window.innerWidth <= 767) {
            const presetContainer = document.getElementById('userPresetContainer');
            if (presetContainer) {
                // コンテナが表示されるように明示的に再計算
                presetContainer.style.display = 'flex';
                presetContainer.style.opacity = '1';
                presetContainer.style.visibility = 'visible';
            }
        }
    }, 500);
});

// タブの初期化
function initTabs() {
    const tabs = document.querySelectorAll('.tab');
    const tabContents = document.querySelectorAll('.tab-content');
    
    // 最初のタブをアクティブにする
    if (tabs.length > 0 && tabContents.length > 0) {
        tabs[0].classList.add('active');
        tabContents[0].classList.add('active');
    }
    
    // タブ切り替えのイベントリスナー
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            switchTab(this.getAttribute('data-tab'));
        });
        
        // キーボードアクセシビリティ
        tab.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.click();
            } else if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
                e.preventDefault();
                const allTabs = Array.from(document.querySelectorAll('.tab'));
                const currentIndex = allTabs.indexOf(this);
                let nextIndex;
                
                if (e.key === 'ArrowLeft') {
                    nextIndex = currentIndex > 0 ? currentIndex - 1 : allTabs.length - 1;
                } else {
                    nextIndex = currentIndex < allTabs.length - 1 ? currentIndex + 1 : 0;
                }
                
                allTabs[nextIndex].focus();
            }
        });
    });
}

// タブ切り替え関数
function switchTab(tabId) {
    // すべてのタブを非アクティブにする
    document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.remove('active');
        tab.setAttribute('aria-selected', 'false');
    });
    
    // すべてのタブコンテンツを非表示にする
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
        content.setAttribute('aria-hidden', 'true');
    });
    
    // クリックされたタブとコンテンツをアクティブにする
    const activeTab = document.querySelector(`.tab[data-tab="${tabId}"]`);
    const activeContent = document.getElementById(tabId);
    
    if (activeTab && activeContent) {
        activeTab.classList.add('active');
        activeTab.setAttribute('aria-selected', 'true');
        activeContent.classList.add('active');
        activeContent.setAttribute('aria-hidden', 'false');
        
        // アクセシビリティのために、アクティブなコンテンツにフォーカスを移動
        const focusableElement = activeContent.querySelector('button, input, [tabindex="0"]');
        if (focusableElement) {
            focusableElement.focus();
        } else {
            activeContent.focus();
        }
    }
}

// テーマの初期化 - ダークモード機能を削除

// モバイルデバイス向けの最適化
function initMobileSupport() {
    // iOSでのダブルタップズームを防止
    document.addEventListener('touchstart', function(e) {
        if (e.touches.length > 1) {
            e.preventDefault();
        }
    }, { passive: false });
    
    // モバイルでのプリセット表示を強制的に再描画
    function refreshPresetsOnResize() {
        if (window.innerWidth <= 768) {
            setTimeout(() => {
                renderPresets();
                
                // モバイルで表示確認
                const presetContainer = document.getElementById('userPresetContainer');
                if (presetContainer) {
                    // コンテナが表示されるように明示的に再計算
                    presetContainer.style.display = 'flex';
                    presetContainer.style.opacity = '1';
                    presetContainer.style.visibility = 'visible';
                }
            }, 100);
        }
    }
    
    // 初期ロード時と画面サイズ変更時にプリセットを更新
    refreshPresetsOnResize();
    window.addEventListener('resize', refreshPresetsOnResize);
    
    // FastClickの実装（タップの遅延を解消）
    const attachFastClick = function() {
        const touchElements = document.querySelectorAll('button, .preset-btn, .tab');
        touchElements.forEach(el => {
            let touchStartTime = 0;
            let touchStartX = 0;
            let touchStartY = 0;
            
            el.addEventListener('touchstart', function(e) {
                touchStartTime = Date.now();
                touchStartX = e.touches[0].clientX;
                touchStartY = e.touches[0].clientY;
            }, { passive: true });
            
            el.addEventListener('touchend', function(e) {
                const touchTime = Date.now() - touchStartTime;
                const touchEndX = e.changedTouches[0].clientX;
                const touchEndY = e.changedTouches[0].clientY;
                const touchDistance = Math.sqrt(
                    Math.pow(touchEndX - touchStartX, 2) +
                    Math.pow(touchEndY - touchStartY, 2)
                );
                
                // 300ms以内の短いタップでかつ移動距離が少ない場合のみクリックイベントを発火
                if (touchTime < 300 && touchDistance < 10) {
                    e.preventDefault();
                    e.target.click();
                }
            });
        });
    };
    
    // FastClickの初期化
    attachFastClick();
    
    // 入力フィールドのiOS対応
    const numericInputs = document.querySelectorAll('input[type="number"]');
    numericInputs.forEach(input => {
        // iOSでは入力時に数値キーボードを表示するためpattern属性を追加
        input.setAttribute('pattern', '[0-9]*');
        input.setAttribute('inputmode', 'numeric');
        
        // 入力値の検証
        input.addEventListener('input', function() {
            // 数値のみを許可
            this.value = this.value.replace(/[^0-9\.]/g, '');
        });
    });
}

// メインのイベントリスナー設定
function setupEventListeners() {
    // 肥料追加ボタン
    const addFertilizerBtn = document.getElementById('addFertilizerBtn');
    if (addFertilizerBtn) {
        addFertilizerBtn.addEventListener('click', addFertilizer);
    }
    
    // 計算ボタン
    const calculateBtn = document.getElementById('calculateBtn');
    if (calculateBtn) {
        calculateBtn.addEventListener('click', calculateResults);
    }
    
    // リセットボタン
    const resetBtn = document.getElementById('resetBtn');
    if (resetBtn) {
        resetBtn.addEventListener('click', resetCalculator);
    }
    
    // プリセット管理ボタン
    const managePresetsBtn = document.getElementById('managePresetsBtn');
    if (managePresetsBtn) {
        managePresetsBtn.addEventListener('click', openPresetsModal);
    }

    // 使い方ボタン
    const helpBtn = document.getElementById('helpButton');
    if (helpBtn) {
        // クリックイベント
        helpBtn.addEventListener('click', openHelpModal);

        // タッチデバイス向けに最適化
        helpBtn.addEventListener('touchstart', function(e) {
            // タッチ開始位置を記録
            this.touchStartX = e.touches[0].clientX;
            this.touchStartY = e.touches[0].clientY;
            // 視覚的なフィードバック
            this.style.opacity = '0.7';
        }, {passive: true});

        helpBtn.addEventListener('touchend', function(e) {
            // 視覚的なフィードバックを元に戻す
            this.style.opacity = '1';

            // タッチ移動距離をチェック（スワイプ操作と区別）
            if (this.touchStartX && this.touchStartY) {
                const touchEndX = e.changedTouches[0].clientX;
                const touchEndY = e.changedTouches[0].clientY;
                const dx = touchEndX - this.touchStartX;
                const dy = touchEndY - this.touchStartY;
                const distance = Math.sqrt(dx * dx + dy * dy);

                // 小さな移動距離ならタップとして処理
                if (distance < 10) {
                    e.preventDefault();
                    openHelpModal();
                }
            } else {
                // タッチ開始情報がない場合はそのままモーダルを開く
                e.preventDefault();
                openHelpModal();
            }

            // タッチ位置情報をリセット
            this.touchStartX = null;
            this.touchStartY = null;
        });
    }

    // モーダルの閉じるボタン
    const closeModalBtns = document.querySelectorAll('.close-modal');
    closeModalBtns.forEach(btn => {
        // クリックイベント
        if (btn.classList.contains('help-close')) {
            btn.addEventListener('click', closeHelpModal);
        } else {
            btn.addEventListener('click', closePresetsModal);
        }

        // タッチデバイス向けに最適化
        btn.addEventListener('touchstart', function(e) {
            // タッチ開始位置を記録
            this.touchStartX = e.touches[0].clientX;
            this.touchStartY = e.touches[0].clientY;
            // 視覚的なフィードバック
            this.style.opacity = '0.7';
        }, {passive: true});

        btn.addEventListener('touchend', function(e) {
            // 視覚的なフィードバックを元に戻す
            this.style.opacity = '1';

            // タッチ移動距離をチェック
            if (this.touchStartX && this.touchStartY) {
                const touchEndX = e.changedTouches[0].clientX;
                const touchEndY = e.changedTouches[0].clientY;
                const dx = touchEndX - this.touchStartX;
                const dy = touchEndY - this.touchStartY;
                const distance = Math.sqrt(dx * dx + dy * dy);

                // 小さな移動距離ならタップとして処理
                if (distance < 10) {
                    e.preventDefault();
                    if (this.classList.contains('help-close')) {
                        closeHelpModal();
                    } else {
                        closePresetsModal();
                    }
                }
            } else {
                // タッチ開始情報がない場合はそのまま閉じる
                e.preventDefault();
                if (this.classList.contains('help-close')) {
                    closeHelpModal();
                } else {
                    closePresetsModal();
                }
            }

            // タッチ位置情報をリセット
            this.touchStartX = null;
            this.touchStartY = null;
        });
    });
    
    // モーダル外をクリックしたら閉じる
    window.addEventListener('click', function(event) {
        const presetsModal = document.getElementById('presetsModal');
        const helpModal = document.getElementById('helpModal');

        if (event.target === presetsModal) {
            closePresetsModal();
        }

        if (event.target === helpModal) {
            closeHelpModal();
        }
    });
    
    // 新しいプリセットを追加するボタン
    const addPresetBtn = document.getElementById('addPresetBtn');
    if (addPresetBtn) {
        addPresetBtn.addEventListener('click', saveNewPreset);
    }
    
    // キーボードアクセシビリティのためのイベント
    document.addEventListener('keydown', function(e) {
        // ESCキーでモーダルを閉じる
        if (e.key === 'Escape') {
            const presetsModal = document.getElementById('presetsModal');
            const helpModal = document.getElementById('helpModal');

            if (presetsModal && presetsModal.style.display === 'block') {
                closePresetsModal();
            }

            if (helpModal && helpModal.style.display === 'block') {
                closeHelpModal();
            }
        }
    });
    
    // ボタンのリップルエフェクト
    const buttons = document.querySelectorAll('button');
    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            // リップルエフェクトの要素を作成
            const ripple = document.createElement('span');
            this.appendChild(ripple);
            
            // クリック位置を取得
            const x = e.clientX - this.getBoundingClientRect().left;
            const y = e.clientY - this.getBoundingClientRect().top;
            
            // リップルの位置を設定
            ripple.style.cssText = `
                position: absolute;
                background-color: rgba(255, 255, 255, 0.5);
                border-radius: 50%;
                width: 5px;
                height: 5px;
                top: ${y}px;
                left: ${x}px;
                transform: scale(0);
                animation: ripple 0.6s linear;
                pointer-events: none;
            `;
            
            // アニメーション後にリップル要素を削除
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });
    
    // アニメーションのためのスタイルを追加
    const style = document.createElement('style');
    style.textContent = `
        @keyframes ripple {
            to {
                transform: scale(30);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
}

// 肥料を追加する関数
function addFertilizer() {
    const name = document.getElementById('fertilizerName').value.trim();
    const n = parseFloat(document.getElementById('nitrogenContent').value) || 0;
    const p = parseFloat(document.getElementById('phosphorusContent').value) || 0;
    const k = parseFloat(document.getElementById('potassiumContent').value) || 0;
    const ca = parseFloat(document.getElementById('calciumContent').value) || 0;
    const mg = parseFloat(document.getElementById('magnesiumContent').value) || 0;
    const s = parseFloat(document.getElementById('sulfurContent').value) || 0;
    const fe = parseFloat(document.getElementById('ironContent').value) || 0;
    const mn = parseFloat(document.getElementById('manganeseContent').value) || 0;
    const zn = parseFloat(document.getElementById('zincContent').value) || 0;
    const b = parseFloat(document.getElementById('boronContent').value) || 0;
    const amount = parseFloat(document.getElementById('amount').value) || 0;
    
    if (!name) {
        alert('肥料名を入力してください');
        document.getElementById('fertilizerName').focus();
        return;
    }
    
    if (amount <= 0) {
        alert('使用量を入力してください');
        document.getElementById('amount').focus();
        return;
    }
    
    // 各成分の量を計算
    const nAmount = (n / 100) * amount;
    const pAmount = (p / 100) * amount;
    const kAmount = (k / 100) * amount;
    const caAmount = (ca / 100) * amount;
    const mgAmount = (mg / 100) * amount;
    const sAmount = (s / 100) * amount;
    const feAmount = (fe / 100) * amount;
    const mnAmount = (mn / 100) * amount;
    const znAmount = (zn / 100) * amount;
    const bAmount = (b / 100) * amount;
    
    // 肥料オブジェクトを作成
    const fertilizer = {
        name,
        nitrogen: n,
        phosphorus: p,
        potassium: k,
        calcium: ca,
        magnesium: mg,
        sulfur: s,
        iron: fe,
        manganese: mn,
        zinc: zn,
        boron: b,
        amount,
        nAmount,
        pAmount,
        kAmount,
        caAmount,
        mgAmount,
        sAmount,
        feAmount,
        mnAmount,
        znAmount,
        bAmount
    };
    
    // 肥料リストに追加
    fertilizers.push(fertilizer);
    
    // 肥料リストを更新
    updateFertilizerList();
    
    // 入力フィールドをクリア
    clearInputFields();
    
    // 入力タブに戻る
    switchTab('inputTab');
    
    // 追加成功のフィードバック
    const feedback = document.createElement('div');
    feedback.className = 'success-feedback';
    feedback.innerHTML = `
        <div style="
            padding: 15px;
            background-color: #e8f5e9;
            color: #2e7d32;
            border-radius: 5px;
            text-align: center;
            box-shadow: 0 2px 10px rgba(46, 125, 50, 0.2);
            animation: fadeInOut 3s ease-in-out;
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            z-index: 1000;
        ">
            <span style="font-size: 24px; margin-right: 10px;">✓</span>
            ${name} を追加しました
        </div>
    `;
    
    // CSS アニメーションの追加
    const feedbackStyle = document.createElement('style');
    feedbackStyle.textContent = `
        @keyframes fadeInOut {
            0% { opacity: 0; transform: translateX(-50%) translateY(20px); }
            15% { opacity: 1; transform: translateX(-50%) translateY(0); }
            85% { opacity: 1; transform: translateX(-50%) translateY(0); }
            100% { opacity: 0; transform: translateX(-50%) translateY(-20px); }
        }
    `;
    document.head.appendChild(feedbackStyle);
    
    document.body.appendChild(feedback);
    
    // フィードバックを一定時間後に削除
    setTimeout(() => {
        if (feedback.parentNode) {
            document.body.removeChild(feedback);
        }
    }, 3000);
}

// 肥料リストを更新する関数
function updateFertilizerList() {
    const listContainer = document.getElementById('fertilizerList');
    listContainer.innerHTML = '';
    
    if (fertilizers.length === 0) {
        listContainer.innerHTML = '<p>肥料がまだ追加されていません</p>';
        return;
    }
    
    fertilizers.forEach((fert, index) => {
        const item = document.createElement('div');
        item.className = 'fertilizer-item';
        item.setAttribute('role', 'listitem');
        
        const info = document.createElement('div');
        info.innerHTML = `
            <div class="fertilizer-name">${fert.name}</div>
            <div class="fertilizer-info">
                N: ${fert.nitrogen}%, P: ${fert.phosphorus}%, K: ${fert.potassium}%
                ${fert.calcium > 0 ? `, Ca: ${fert.calcium}%` : ''}
                ${fert.magnesium > 0 ? `, Mg: ${fert.magnesium}%` : ''}
                ${fert.sulfur > 0 ? `, S: ${fert.sulfur}%` : ''}
            </div>
            <div class="fertilizer-amount">${fert.amount} g</div>
        `;
        
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.textContent = '削除';
        deleteBtn.setAttribute('aria-label', `${fert.name}を削除`);
        deleteBtn.onclick = function() {
            fertilizers.splice(index, 1);
            updateFertilizerList();
        };
        
        item.appendChild(info);
        item.appendChild(deleteBtn);
        listContainer.appendChild(item);
    });
}

// 入力フィールドをクリアする関数
function clearInputFields() {
    document.getElementById('fertilizerName').value = '';
    document.getElementById('nitrogenContent').value = '';
    document.getElementById('phosphorusContent').value = '';
    document.getElementById('potassiumContent').value = '';
    document.getElementById('calciumContent').value = '';
    document.getElementById('magnesiumContent').value = '';
    document.getElementById('sulfurContent').value = '';
    document.getElementById('ironContent').value = '';
    document.getElementById('manganeseContent').value = '';
    document.getElementById('zincContent').value = '';
    document.getElementById('boronContent').value = '';
    document.getElementById('amount').value = '';
}

// 結果を計算する関数
function calculateResults() {
    if (fertilizers.length === 0) {
        // エラーメッセージに視覚効果を追加
        const errorMsg = document.createElement('div');
        errorMsg.innerHTML = `
            <div style="
                padding: 15px;
                background-color: #ffecec;
                color: #e74c3c;
                border-radius: 5px;
                text-align: center;
                box-shadow: 0 2px 10px rgba(231, 76, 60, 0.2);
                animation: shake 0.5s ease-in-out;
            ">
                <span style="font-size: 24px; margin-right: 10px;">⚠️</span>
                少なくとも1つの肥料を追加してください
            </div>
        `;
        
        // CSS アニメーションの追加
        const style = document.createElement('style');
        style.textContent = `
            @keyframes shake {
                0%, 100% { transform: translateX(0); }
                20%, 60% { transform: translateX(-10px); }
                40%, 80% { transform: translateX(10px); }
            }
        `;
        document.head.appendChild(style);
        
        // エラー表示
        const resultsDiv = document.getElementById('calculationResults');
        resultsDiv.innerHTML = '';
        resultsDiv.appendChild(errorMsg);
        
        // 結果タブに切り替え
        switchTab('resultsTab');
        
        // 5秒後にメッセージを消す
        setTimeout(() => {
            resultsDiv.innerHTML = '<p>まだ肥料が追加されていません</p>';
        }, 5000);
        
        return;
    }
    
    // 計算開始時のローディングエフェクト
    const resultsDiv = document.getElementById('calculationResults');
    resultsDiv.innerHTML = `
        <div style="text-align: center; padding: 30px;">
            <div style="
                width: 50px;
                height: 50px;
                border: 5px solid #f3f3f3;
                border-top: 5px solid #2c7744;
                border-radius: 50%;
                margin: 0 auto;
                animation: spin 1s linear infinite;
            "></div>
            <p style="margin-top: 15px;">計算中...</p>
        </div>
    `;
    
    // CSSアニメーションの追加
    const style = document.createElement('style');
    style.textContent = `
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    `;
    document.head.appendChild(style);
    
    // 計算を少し遅延させて視覚効果を見せる
    setTimeout(() => {
        // 総使用量と各要素の総量を計算
        const totalAmount = fertilizers.reduce((sum, fert) => sum + fert.amount, 0);
        const totalN = fertilizers.reduce((sum, fert) => sum + fert.nAmount, 0);
        const totalP = fertilizers.reduce((sum, fert) => sum + fert.pAmount, 0);
        const totalK = fertilizers.reduce((sum, fert) => sum + fert.kAmount, 0);
        const totalCa = fertilizers.reduce((sum, fert) => sum + fert.caAmount, 0);
        const totalMg = fertilizers.reduce((sum, fert) => sum + fert.mgAmount, 0);
        const totalS = fertilizers.reduce((sum, fert) => sum + fert.sAmount, 0);
        const totalFe = fertilizers.reduce((sum, fert) => sum + fert.feAmount, 0);
        const totalMn = fertilizers.reduce((sum, fert) => sum + fert.mnAmount, 0);
        const totalZn = fertilizers.reduce((sum, fert) => sum + fert.znAmount, 0);
        const totalB = fertilizers.reduce((sum, fert) => sum + fert.bAmount, 0);
        
        // 最終的な含有率を計算
        const finalN = (totalN / totalAmount) * 100;
        const finalP = (totalP / totalAmount) * 100;
        const finalK = (totalK / totalAmount) * 100;
        const finalCa = (totalCa / totalAmount) * 100;
        const finalMg = (totalMg / totalAmount) * 100;
        const finalS = (totalS / totalAmount) * 100;
        const finalFe = (totalFe / totalAmount) * 100;
        const finalMn = (totalMn / totalAmount) * 100;
        const finalZn = (totalZn / totalAmount) * 100;
        const finalB = (totalB / totalAmount) * 100;
        
        // 結果オブジェクトを作成
        const result = {
            totalAmount,
            totalN,
            totalP,
            totalK,
            totalCa,
            totalMg,
            totalS,
            totalFe,
            totalMn,
            totalZn,
            totalB,
            finalN,
            finalP,
            finalK,
            finalCa,
            finalMg,
            finalS,
            finalFe,
            finalMn,
            finalZn,
            finalB
        };
        
        // 履歴に追加
        addToHistory(result);
        
        // モバイルかどうかを検出
        const isMobile = window.innerWidth <= 767;
        
        // 結果のHTML作成（まだ表示せず）
        let resultHTML = '';
        
        if (isMobile) {
            // モバイル用のカードレイアウト
            resultHTML = `
            <div class="result-content" style="opacity: 0; transform: translateY(20px); transition: all 0.5s ease-out;">
                <div class="mobile-results">
                    <h3>総使用量</h3>
                    <div class="result-card">
                        ${totalAmount >= 1000 ? (totalAmount / 1000).toFixed(2) + ' kg' : totalAmount.toFixed(1) + ' g'}
                    </div>
                    
                    <h3>最終NPK比率</h3>
                    <div class="result-card highlight">
                        ${finalN.toFixed(1)}-${finalP.toFixed(1)}-${finalK.toFixed(1)}
                    </div>
                    
                    <h3>主要成分</h3>
                    <div class="result-cards">
                        <div class="result-card">
                            <div class="card-title">窒素 (N)</div>
                            <div class="card-value">${totalN.toFixed(2)} g</div>
                            <div class="card-percent">${finalN.toFixed(2)}%</div>
                        </div>
                        <div class="result-card">
                            <div class="card-title">リン酸 (P)</div>
                            <div class="card-value">${totalP.toFixed(2)} g</div>
                            <div class="card-percent">${finalP.toFixed(2)}%</div>
                        </div>
                        <div class="result-card">
                            <div class="card-title">カリウム (K)</div>
                            <div class="card-value">${totalK.toFixed(2)} g</div>
                            <div class="card-percent">${finalK.toFixed(2)}%</div>
                        </div>
                    </div>
                    
                    <h3>二次栄養素</h3>
                    <div class="result-cards">
                        <div class="result-card">
                            <div class="card-title">カルシウム (Ca)</div>
                            <div class="card-value">${totalCa.toFixed(2)} g</div>
                            <div class="card-percent">${finalCa.toFixed(2)}%</div>
                        </div>
                        <div class="result-card">
                            <div class="card-title">マグネシウム (Mg)</div>
                            <div class="card-value">${totalMg.toFixed(2)} g</div>
                            <div class="card-percent">${finalMg.toFixed(2)}%</div>
                        </div>
                        <div class="result-card">
                            <div class="card-title">硫黄 (S)</div>
                            <div class="card-value">${totalS.toFixed(2)} g</div>
                            <div class="card-percent">${finalS.toFixed(2)}%</div>
                        </div>
                    </div>
                    
                    <h3>微量栄養素</h3>
                    <div class="result-cards">
                        <div class="result-card">
                            <div class="card-title">鉄 (Fe)</div>
                            <div class="card-value">${totalFe.toFixed(2)} g</div>
                            <div class="card-percent">${finalFe.toFixed(3)}%</div>
                        </div>
                        <div class="result-card">
                            <div class="card-title">マンガン (Mn)</div>
                            <div class="card-value">${totalMn.toFixed(2)} g</div>
                            <div class="card-percent">${finalMn.toFixed(3)}%</div>
                        </div>
                    </div>
                    <div class="result-cards">
                        <div class="result-card">
                            <div class="card-title">亜鉛 (Zn)</div>
                            <div class="card-value">${totalZn.toFixed(2)} g</div>
                            <div class="card-percent">${finalZn.toFixed(3)}%</div>
                        </div>
                        <div class="result-card">
                            <div class="card-title">ホウ素 (B)</div>
                            <div class="card-value">${totalB.toFixed(2)} g</div>
                            <div class="card-percent">${finalB.toFixed(3)}%</div>
                        </div>
                    </div>
                    
                    <p style="margin-top: 20px; font-style: italic; color: #777;">※ 注意: これは肥料の混合総重量に対する各成分の割合です。</p>
                </div>
            </div>
            `;
        } else {
            // ダークモードの検出
            const isDarkMode = document.body.classList.contains('dark-mode');

            // NPK結果ボックスのスタイル（ダークモード対応）
            const npkResultStyle = isDarkMode
                ? `
                    margin-top: 20px;
                    background: linear-gradient(135deg, #2e7d32, #388e3c);
                    color: #e8f5e9;
                    padding: 15px;
                    border-radius: 8px;
                    text-align: center;
                    box-shadow: 0 3px 10px rgba(0,0,0,0.3);
                    transform: scale(0.95);
                    transition: all 0.3s ease;
                `
                : `
                    margin-top: 20px;
                    background: linear-gradient(135deg, #e9f7ef, #d5f5e3);
                    padding: 15px;
                    border-radius: 8px;
                    text-align: center;
                    box-shadow: 0 3px 10px rgba(0,0,0,0.1);
                    transform: scale(0.95);
                    transition: all 0.3s ease;
                `;

            // NPK比率の表示色（ダークモード対応）
            const npkValueColor = isDarkMode ? '#b9f6ca' : '#2c7744';

            // 注釈のテキスト色（ダークモード対応）
            const noteColor = isDarkMode ? '#bdbdbd' : '#777';

            // デスクトップ用の従来通りのテーブルレイアウト
            resultHTML = `
            <div class="result-content" style="opacity: 0; transform: translateY(20px); transition: all 0.5s ease-out;">
                <h3>主要成分</h3>
                <table>
                    <tr>
                        <th>総使用量</th>
                        <th>窒素 (N)</th>
                        <th>リン酸 (P)</th>
                        <th>カリウム (K)</th>
                    </tr>
                    <tr>
                        <td>${totalAmount >= 1000 ? (totalAmount / 1000).toFixed(2) + ' kg' : totalAmount.toFixed(1) + ' g'}</td>
                        <td>${totalN.toFixed(2)} g (${finalN.toFixed(2)}%)</td>
                        <td>${totalP.toFixed(2)} g (${finalP.toFixed(2)}%)</td>
                        <td>${totalK.toFixed(2)} g (${finalK.toFixed(2)}%)</td>
                    </tr>
                </table>

                <h3>二次栄養素</h3>
                <table>
                    <tr>
                        <th>カルシウム (Ca)</th>
                        <th>マグネシウム (Mg)</th>
                        <th>硫黄 (S)</th>
                    </tr>
                    <tr>
                        <td>${totalCa.toFixed(2)} g (${finalCa.toFixed(2)}%)</td>
                        <td>${totalMg.toFixed(2)} g (${finalMg.toFixed(2)}%)</td>
                        <td>${totalS.toFixed(2)} g (${finalS.toFixed(2)}%)</td>
                    </tr>
                </table>

                <h3>微量栄養素</h3>
                <table>
                    <tr>
                        <th>鉄 (Fe)</th>
                        <th>マンガン (Mn)</th>
                        <th>亜鉛 (Zn)</th>
                        <th>ホウ素 (B)</th>
                    </tr>
                    <tr>
                        <td>${totalFe.toFixed(2)} g (${finalFe.toFixed(3)}%)</td>
                        <td>${totalMn.toFixed(2)} g (${finalMn.toFixed(3)}%)</td>
                        <td>${totalZn.toFixed(2)} g (${finalZn.toFixed(3)}%)</td>
                        <td>${totalB.toFixed(2)} g (${finalB.toFixed(3)}%)</td>
                    </tr>
                </table>

                <div class="npk-result" style="${npkResultStyle}">
                    <h3 style="margin-top: 0;">最終NPK比率: <span style="color: ${npkValueColor};">${finalN.toFixed(1)}-${finalP.toFixed(1)}-${finalK.toFixed(1)}</span></h3>
                </div>

                <p style="margin-top: 20px; font-style: italic; color: ${noteColor};">※ 注意: これは肥料の混合総重量に対する各成分の割合です。</p>
            </div>
            `;
        }
        
        // 結果を表示してアニメーションを開始
        resultsDiv.innerHTML = resultHTML;
        
        // 結果タブに切り替え
        switchTab('resultsTab');
        
        // 要素のアニメーション（遅延させて表示）
        setTimeout(() => {
            const resultContent = document.querySelector('.result-content');
            if (resultContent) {
                resultContent.style.opacity = 1;
                resultContent.style.transform = 'translateY(0)';
                
                // NPK比率のスケールアニメーション（デスクトップのみ）
                if (!isMobile) {
                    setTimeout(() => {
                        const npkResult = document.querySelector('.npk-result');
                        if (npkResult) {
                            npkResult.style.transform = 'scale(1.05)';
                            npkResult.style.boxShadow = '0 5px 15px rgba(0,0,0,0.15)';
                        }
                    }, 500);
                }
            }
        }, 100);
    }, 800); // ローディングを0.8秒表示
}

// 履歴に追加する関数
function addToHistory(result) {
    // 現在の日時を取得
    const now = new Date();
    const formattedDate = now.toLocaleString('ja-JP');
    
    // 履歴オブジェクトを作成
    const historyItem = {
        date: formattedDate,
        result
    };
    
    // 履歴の先頭に追加
    calculationHistory.unshift(historyItem);
    
    // 履歴は最大10件まで保存
    if (calculationHistory.length > 10) {
        calculationHistory.pop();
    }
    
    // ローカルストレージに保存
    localStorage.setItem('calculationHistory', JSON.stringify(calculationHistory));
    
    // 履歴タブの更新
    renderHistoryList();
}

// 履歴リストを表示
function renderHistoryList() {
    const historyContainer = document.getElementById('historyList');
    if (!historyContainer) return;
    
    historyContainer.innerHTML = '';
    
    if (calculationHistory.length === 0) {
        historyContainer.innerHTML = '<p>まだ計算履歴がありません</p>';
        return;
    }
    
    calculationHistory.forEach((item, index) => {
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';
        historyItem.setAttribute('role', 'button');
        historyItem.tabIndex = 0;
        historyItem.setAttribute('aria-label', `${item.date}の計算結果を表示`);
        
        historyItem.innerHTML = `
            <h4>${item.date}</h4>
            <p>NPK比率: ${item.result.finalN.toFixed(1)}-${item.result.finalP.toFixed(1)}-${item.result.finalK.toFixed(1)}</p>
            <p>総使用量: ${item.result.totalAmount >= 1000 ? (item.result.totalAmount / 1000).toFixed(2) + ' kg' : item.result.totalAmount.toFixed(1) + ' g'}</p>
        `;
        
        historyItem.addEventListener('click', function() {
            displaySavedResult(item.result);
        });
        
        historyItem.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                displaySavedResult(item.result);
            }
        });
        
        historyContainer.appendChild(historyItem);
    });
}

// 保存された結果を表示
function displaySavedResult(result) {
    const resultsDiv = document.getElementById('calculationResults');

    // モバイルかどうかを検出
    const isMobile = window.innerWidth <= 767;

    // ダークモード機能を削除
    // 文字色の設定
    const noteColor = '#777';
    const emphasisColor = 'var(--color-primary-dark)';

    if (isMobile) {
        // NPK比率カードのスタイル
        const highlightCardStyle = 'background: linear-gradient(135deg, #e9f7ef, #d5f5e3); color: #2c7744;';

        // モバイル用のレイアウト
        resultsDiv.innerHTML = `
            <div class="mobile-results">
                <h3>総使用量</h3>
                <div class="result-card">
                    ${result.totalAmount >= 1000 ? (result.totalAmount / 1000).toFixed(2) + ' kg' : result.totalAmount.toFixed(1) + ' g'}
                </div>

                <h3>最終NPK比率</h3>
                <div class="result-card highlight" style="${highlightCardStyle}">
                    ${result.finalN.toFixed(1)}-${result.finalP.toFixed(1)}-${result.finalK.toFixed(1)}
                </div>

                <h3>主要成分</h3>
                <div class="result-cards">
                    <div class="result-card">
                        <div class="card-title">窒素 (N)</div>
                        <div class="card-value">${result.totalN.toFixed(2)} g</div>
                        <div class="card-percent">${result.finalN.toFixed(2)}%</div>
                    </div>
                    <div class="result-card">
                        <div class="card-title">リン酸 (P)</div>
                        <div class="card-value">${result.totalP.toFixed(2)} g</div>
                        <div class="card-percent">${result.finalP.toFixed(2)}%</div>
                    </div>
                    <div class="result-card">
                        <div class="card-title">カリウム (K)</div>
                        <div class="card-value">${result.totalK.toFixed(2)} g</div>
                        <div class="card-percent">${result.finalK.toFixed(2)}%</div>
                    </div>
                </div>

                <h3>二次栄養素</h3>
                <div class="result-cards">
                    <div class="result-card">
                        <div class="card-title">カルシウム (Ca)</div>
                        <div class="card-value">${result.totalCa.toFixed(2)} g</div>
                        <div class="card-percent">${result.finalCa.toFixed(2)}%</div>
                    </div>
                    <div class="result-card">
                        <div class="card-title">マグネシウム (Mg)</div>
                        <div class="card-value">${result.totalMg.toFixed(2)} g</div>
                        <div class="card-percent">${result.finalMg.toFixed(2)}%</div>
                    </div>
                    <div class="result-card">
                        <div class="card-title">硫黄 (S)</div>
                        <div class="card-value">${result.totalS.toFixed(2)} g</div>
                        <div class="card-percent">${result.finalS.toFixed(2)}%</div>
                    </div>
                </div>

                <h3>微量栄養素</h3>
                <div class="result-cards">
                    <div class="result-card">
                        <div class="card-title">鉄 (Fe)</div>
                        <div class="card-value">${result.totalFe.toFixed(2)} g</div>
                        <div class="card-percent">${result.finalFe.toFixed(3)}%</div>
                    </div>
                    <div class="result-card">
                        <div class="card-title">マンガン (Mn)</div>
                        <div class="card-value">${result.totalMn.toFixed(2)} g</div>
                        <div class="card-percent">${result.finalMn.toFixed(3)}%</div>
                    </div>
                </div>
                <div class="result-cards">
                    <div class="result-card">
                        <div class="card-title">亜鉛 (Zn)</div>
                        <div class="card-value">${result.totalZn.toFixed(2)} g</div>
                        <div class="card-percent">${result.finalZn.toFixed(3)}%</div>
                    </div>
                    <div class="result-card">
                        <div class="card-title">ホウ素 (B)</div>
                        <div class="card-value">${result.totalB.toFixed(2)} g</div>
                        <div class="card-percent">${result.finalB.toFixed(3)}%</div>
                    </div>
                </div>

                <p style="color: ${noteColor};">※ 注意: これは肥料の混合総重量に対する各成分の割合です。</p>
                <p><em style="color: ${emphasisColor};">※ この結果は履歴から読み込まれました</em></p>
            </div>
        `;
    } else {
        // NPK結果ボックスのスタイル
        const npkResultStyle = `
            margin-top: 20px;
            background: linear-gradient(135deg, #e9f7ef, #d5f5e3);
            padding: 15px;
            border-radius: 8px;
            text-align: center;
            box-shadow: 0 3px 10px rgba(0,0,0,0.1);
        `;

        // NPK比率の表示色
        const npkValueColor = '#2c7744';

        // デスクトップ用の従来通りのテーブルレイアウト
        resultsDiv.innerHTML = `
            <h3>主要成分</h3>
            <table>
                <tr>
                    <th>総使用量</th>
                    <th>窒素 (N)</th>
                    <th>リン酸 (P)</th>
                    <th>カリウム (K)</th>
                </tr>
                <tr>
                    <td>${result.totalAmount >= 1000 ? (result.totalAmount / 1000).toFixed(2) + ' kg' : result.totalAmount.toFixed(1) + ' g'}</td>
                    <td>${result.totalN.toFixed(2)} g (${result.finalN.toFixed(2)}%)</td>
                    <td>${result.totalP.toFixed(2)} g (${result.finalP.toFixed(2)}%)</td>
                    <td>${result.totalK.toFixed(2)} g (${result.finalK.toFixed(2)}%)</td>
                </tr>
            </table>

            <h3>二次栄養素</h3>
            <table>
                <tr>
                    <th>カルシウム (Ca)</th>
                    <th>マグネシウム (Mg)</th>
                    <th>硫黄 (S)</th>
                </tr>
                <tr>
                    <td>${result.totalCa.toFixed(2)} g (${result.finalCa.toFixed(2)}%)</td>
                    <td>${result.totalMg.toFixed(2)} g (${result.finalMg.toFixed(2)}%)</td>
                    <td>${result.totalS.toFixed(2)} g (${result.finalS.toFixed(2)}%)</td>
                </tr>
            </table>

            <h3>微量栄養素</h3>
            <table>
                <tr>
                    <th>鉄 (Fe)</th>
                    <th>マンガン (Mn)</th>
                    <th>亜鉛 (Zn)</th>
                    <th>ホウ素 (B)</th>
                </tr>
                <tr>
                    <td>${result.totalFe.toFixed(2)} g (${result.finalFe.toFixed(3)}%)</td>
                    <td>${result.totalMn.toFixed(2)} g (${result.finalMn.toFixed(3)}%)</td>
                    <td>${result.totalZn.toFixed(2)} g (${result.finalZn.toFixed(3)}%)</td>
                    <td>${result.totalB.toFixed(2)} g (${result.finalB.toFixed(3)}%)</td>
                </tr>
            </table>

            <div style="${npkResultStyle}">
                <h3 style="margin-top: 0;">最終NPK比率: <span style="color: ${npkValueColor};">${result.finalN.toFixed(1)}-${result.finalP.toFixed(1)}-${result.finalK.toFixed(1)}</span></h3>
            </div>

            <p style="color: ${noteColor}; margin-top: 20px; font-style: italic;">※ 注意: これは肥料の混合総重量に対する各成分の割合です。</p>
            <p style="color: ${emphasisColor}; font-style: italic;"><em>※ この結果は履歴から読み込まれました</em></p>
        `;
    }

    // 結果タブに切り替え
    switchTab('resultsTab');
}

// 計算機をリセットする関数
function resetCalculator() {
    if (confirm('すべてのデータをリセットしますか？')) {
        fertilizers = [];
        updateFertilizerList();
        clearInputFields();
        document.getElementById('calculationResults').innerHTML = '<p>まだ肥料が追加されていません</p>';
    }
}

// プリセットを追加する関数
function addPreset(name, n, p, k, ca, mg, s, fe, mn, zn, b) {
    document.getElementById('fertilizerName').value = name;
    document.getElementById('nitrogenContent').value = n;
    document.getElementById('phosphorusContent').value = p;
    document.getElementById('potassiumContent').value = k;
    
    if (ca) document.getElementById('calciumContent').value = ca;
    if (mg) document.getElementById('magnesiumContent').value = mg;
    if (s) document.getElementById('sulfurContent').value = s;
    if (fe) document.getElementById('ironContent').value = fe;
    if (mn) document.getElementById('manganeseContent').value = mn;
    if (zn) document.getElementById('zincContent').value = zn;
    if (b) document.getElementById('boronContent').value = b;
    
    // 使用量フィールドにフォーカス
    document.getElementById('amount').focus();
    
    // 入力タブに切り替え
    switchTab('inputTab');
}

// プリセット管理モーダルを開く
function openPresetsModal() {
    const modal = document.getElementById('presetsModal');
    modal.style.display = 'block';
    modal.setAttribute('aria-hidden', 'false');

    // ダークモード機能削除

    // モーダルコンテンツの背景色を設定
    const modalContent = modal.querySelector('.modal-content');
    if (modalContent) {
        modalContent.style.backgroundColor = '#f8f9fa';
        modalContent.style.borderColor = '#dee2e6';
    }

    // モーダル内のテキスト色を設定
    modal.querySelectorAll('h2, h3').forEach(title => {
        title.style.color = 'black';
    });

    // モーダル表示前に内容を更新
    renderPresetLists();

    // モーダルを開いたときに最初の要素にフォーカスを移動
    const closeButton = modal.querySelector('.close-modal');

    // アニメーションのために少し遅延させる
    setTimeout(() => {
        modal.classList.add('show');
        // フォーカストラップのためにフォーカスを移動
        if (closeButton) {
            closeButton.focus();
        }
    }, 10);
}

// プリセット管理モーダルを閉じる
function closePresetsModal() {
    const modal = document.getElementById('presetsModal');
    modal.classList.remove('show');
    modal.setAttribute('aria-hidden', 'true');

    // アニメーションの後にモーダルを非表示にする
    setTimeout(() => {
        modal.style.display = 'none';

        // フォーカスを元の「プリセット管理」ボタンに戻す
        const presetManageBtn = document.querySelector('.manage-presets-btn');
        if (presetManageBtn) {
            presetManageBtn.focus();
        }
    }, 300);
}

// 使い方モーダルを開く
function openHelpModal() {
    const modal = document.getElementById('helpModal');
    modal.style.display = 'block';
    modal.setAttribute('aria-hidden', 'false');

    // ダークモード機能削除

    // モーダルコンテンツの背景色を設定
    const modalContent = modal.querySelector('.modal-content');
    if (modalContent) {
        modalContent.style.backgroundColor = '#f8f9fa';
        modalContent.style.borderColor = '#dee2e6';
    }

    // モーダル内のテキスト色を設定
    const modalTexts = modal.querySelectorAll('h2, h3, h4, p, li, strong');
    modalTexts.forEach(text => {
        text.style.color = 'black';
    });

    // リストマーカーを調整
    const listElements = modal.querySelectorAll('li');
    listElements.forEach(li => {
        li.style.marginLeft = '15px';
        li.style.position = 'relative';
        li.style.listStylePosition = 'outside';
    });

    // モーダルを開いたときに最初の要素にフォーカスを移動
    const closeButton = modal.querySelector('.help-close');

    // アニメーションのために少し遅延させる
    setTimeout(() => {
        modal.classList.add('show');
        // フォーカストラップのためにフォーカスを移動
        if (closeButton) {
            closeButton.focus();
        }
    }, 10);
}

// 使い方モーダルを閉じる
function closeHelpModal() {
    const modal = document.getElementById('helpModal');
    modal.classList.remove('show');
    modal.setAttribute('aria-hidden', 'true');

    // アニメーションの後にモーダルを非表示にする
    setTimeout(() => {
        modal.style.display = 'none';

        // フォーカスを元の「使い方」ボタンに戻す
        const helpBtn = document.getElementById('helpButton');
        if (helpBtn) {
            helpBtn.focus();
        }
    }, 300);
}

// プリセットリストを描画
function renderPresets() {
    const container = document.getElementById('userPresetContainer');
    if (!container) return; // コンテナが見つからない場合は中断
    
    container.innerHTML = '';
    
    // アクセシビリティのためにプリセットグループの説明を追加
    if (container.getAttribute('aria-describedby') !== 'preset-description') {
        const description = document.createElement('div');
        description.id = 'preset-description';
        description.className = 'visually-hidden';
        description.textContent = 'これらのボタンをクリックすると、対応する肥料の情報が入力フォームに自動入力されます。';
        container.setAttribute('aria-describedby', 'preset-description');
        
        // 説明をページに追加（コンテナの前）
        container.parentNode.insertBefore(description, container);
    }
    
    // モバイル表示のために追加
    container.style.display = 'flex';
    
    // 表示するデフォルトプリセット
    defaultPresets.filter(preset => preset.isVisible).forEach(preset => {
        const btn = document.createElement('button');
        btn.className = 'preset-btn';

        // プリセット名とNPK値を別々の要素として追加
        const nameElem = document.createElement('span');
        nameElem.className = 'preset-name';
        nameElem.textContent = preset.name;

        const npkElem = document.createElement('span');
        npkElem.className = 'preset-npk';

        // NPK値は「N-P-K」形式で表示
        npkElem.textContent = `N-P-K: ${preset.nitrogen}-${preset.phosphorus}-${preset.potassium}`;

        // 要素を追加
        btn.appendChild(nameElem);
        btn.appendChild(npkElem);

        btn.setAttribute('aria-label', `${preset.name}を選択: 窒素${preset.nitrogen}%, リン酸${preset.phosphorus}%, カリウム${preset.potassium}%`);
        btn.onclick = function() {
            addPreset(
                preset.name,
                preset.nitrogen,
                preset.phosphorus,
                preset.potassium,
                preset.calcium,
                preset.magnesium,
                preset.sulfur,
                preset.iron,
                preset.manganese,
                preset.zinc,
                preset.boron
            );
        };
        container.appendChild(btn);
    });

    // ユーザープリセット
    userPresets.forEach(preset => {
        const btn = document.createElement('button');
        btn.className = 'preset-btn';

        // プリセット名とNPK値を別々の要素として追加
        const nameElem = document.createElement('span');
        nameElem.className = 'preset-name';
        nameElem.textContent = preset.name;

        const npkElem = document.createElement('span');
        npkElem.className = 'preset-npk';

        // NPK値は「N-P-K」形式で表示
        npkElem.textContent = `N-P-K: ${preset.nitrogen}-${preset.phosphorus}-${preset.potassium}`;

        // 要素を追加
        btn.appendChild(nameElem);
        btn.appendChild(npkElem);

        btn.setAttribute('aria-label', `${preset.name}を選択: 窒素${preset.nitrogen}%, リン酸${preset.phosphorus}%, カリウム${preset.potassium}%`);
        btn.setAttribute('data-preset-type', 'user');
        btn.onclick = function() {
            addPreset(
                preset.name,
                preset.nitrogen,
                preset.phosphorus,
                preset.potassium,
                preset.calcium,
                preset.magnesium,
                preset.sulfur,
                preset.iron,
                preset.manganese,
                preset.zinc,
                preset.boron
            );
        };
        container.appendChild(btn);
    });
    
    // プリセットが一つもない場合
    if (container.children.length === 0) {
        const noPresets = document.createElement('p');
        noPresets.textContent = '表示するプリセットがありません。プリセット管理から設定できます。';
        noPresets.setAttribute('role', 'status');
        container.appendChild(noPresets);
    }
}

// プリセットリストを表示（管理モーダル内）
function renderPresetLists() {
    // リサイズ時にもレイアウトを調整
    window.addEventListener('resize', function() {
        const checkboxes = document.querySelectorAll('.preset-list-item input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            if (window.innerWidth <= 767) {
                checkbox.style.transform = 'scale(0.85)';
            } else {
                checkbox.style.transform = 'scale(1.1)';
            }
        });
    });

    // デフォルトプリセットリストを表示
    const defaultList = document.getElementById('defaultPresetList');
    if (defaultList) {
        defaultList.innerHTML = '';

        defaultPresets.forEach(preset => {
            // 各プリセットの内容をログ出力（デバッグ用）
            console.log(`Rendering preset: ${preset.name}, N:${preset.nitrogen}, P:${preset.phosphorus}, K:${preset.potassium}`);

            // リストアイテム作成
            const item = document.createElement('div');
            item.className = 'preset-list-item';
            item.style.display = 'flex';
            item.style.alignItems = 'center';
            item.style.justifyContent = 'space-between';

            // チェックボックス部分
            const checkboxContainer = document.createElement('div');
            checkboxContainer.style.width = window.innerWidth <= 767 ? '30px' : '40px';
            checkboxContainer.style.display = 'flex';
            checkboxContainer.style.alignItems = 'center';
            checkboxContainer.style.justifyContent = 'center';

            // チェックボックス
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.checked = preset.isVisible;
            checkbox.id = `preset-${preset.id}`;
            checkbox.style.marginRight = '15px';

            // モバイルかどうかを検出して適切なサイズに
            if (window.innerWidth <= 767) {
                checkbox.style.transform = 'scale(0.9)';
                checkbox.style.marginRight = '8px';
                checkbox.style.flexShrink = '0';
                checkbox.style.position = 'relative';
                checkbox.style.top = '0';
            } else {
                checkbox.style.transform = 'scale(1.1)';
            }

            checkbox.onchange = function() {
                preset.isVisible = checkbox.checked;
                localStorage.setItem('defaultPresets', JSON.stringify(defaultPresets));
                renderPresets();

                alert(`${preset.name}を${checkbox.checked ? '表示' : '非表示'}に設定しました`);
            };

            checkboxContainer.appendChild(checkbox);

            // 肥料名とNPK値を含むテキストコンテナ
            const textContainer = document.createElement('div');
            textContainer.style.flexGrow = '1';
            textContainer.style.textAlign = 'left';
            textContainer.style.whiteSpace = 'nowrap';
            textContainer.style.overflow = 'hidden';
            textContainer.style.textOverflow = 'ellipsis';

            // 一行のテキストとして表示
            textContainer.textContent = `${preset.name} (${preset.nitrogen}-${preset.phosphorus}-${preset.potassium})`;
            textContainer.style.color = 'black';
            textContainer.style.fontWeight = 'normal';

            item.appendChild(checkboxContainer);
            item.appendChild(textContainer);
            defaultList.appendChild(item);
        });
    } else {
        console.error("defaultList element not found");
    }
    
    // ユーザープリセットリストを表示
    const userList = document.getElementById('userPresetList');
    if (userList) {
        userList.innerHTML = '';

        if (userPresets.length === 0) {
            userList.innerHTML = '<p style="color: black;">まだカスタムプリセットがありません</p>';
        } else {
            userPresets.forEach(preset => {
                console.log(`Rendering user preset: ${preset.name}`);

                // リストアイテム作成
                const item = document.createElement('div');
                item.className = 'preset-list-item';
                item.style.display = 'flex';
                item.style.alignItems = 'center';
                item.style.justifyContent = 'space-between';

                // テキスト表示部分
                const textContainer = document.createElement('div');
                textContainer.style.flexGrow = '1';
                textContainer.style.textAlign = 'left';
                textContainer.style.whiteSpace = 'nowrap';
                textContainer.style.overflow = 'hidden';
                textContainer.style.textOverflow = 'ellipsis';

                // 一行のテキストとして表示
                textContainer.textContent = `${preset.name} (${preset.nitrogen}-${preset.phosphorus}-${preset.potassium})`;
                textContainer.style.color = 'black';
                textContainer.style.fontWeight = 'normal';

                // 削除ボタン部分
                const actions = document.createElement('div');
                actions.style.display = 'flex';
                actions.style.justifyContent = 'flex-end';
                actions.style.width = '30%';

                const deleteBtn = document.createElement('button');
                deleteBtn.textContent = '削除';
                deleteBtn.style.backgroundColor = '#e53935';
                deleteBtn.style.color = 'white';
                deleteBtn.style.border = 'none';
                deleteBtn.style.borderRadius = '4px';
                deleteBtn.style.padding = '5px 10px';

                deleteBtn.onclick = function() {
                    if (confirm(`${preset.name}を削除してもよろしいですか？`)) {
                        const index = userPresets.findIndex(p => p.name === preset.name);
                        if (index !== -1) {
                            userPresets.splice(index, 1);
                            localStorage.setItem('userPresets', JSON.stringify(userPresets));
                            renderPresetLists();
                            renderPresets();
                            alert(`${preset.name}が削除されました`);
                        }
                    }
                };

                actions.appendChild(deleteBtn);

                item.appendChild(textContainer);
                item.appendChild(actions);
                userList.appendChild(item);
            });
        }
    } else {
        console.error("userList element not found");
    }
}

// 新しいプリセットを保存する
function saveNewPreset() {
    const name = document.getElementById('newPresetName').value.trim();
    const n = parseFloat(document.getElementById('newPresetN').value) || 0;
    const p = parseFloat(document.getElementById('newPresetP').value) || 0;
    const k = parseFloat(document.getElementById('newPresetK').value) || 0;
    const ca = parseFloat(document.getElementById('newPresetCa').value) || 0;
    const mg = parseFloat(document.getElementById('newPresetMg').value) || 0;
    const s = parseFloat(document.getElementById('newPresetS').value) || 0;
    const fe = parseFloat(document.getElementById('newPresetFe').value) || 0;
    const mn = parseFloat(document.getElementById('newPresetMn').value) || 0;
    const zn = parseFloat(document.getElementById('newPresetZn').value) || 0;
    const b = parseFloat(document.getElementById('newPresetB').value) || 0;
    
    if (!name) {
        alert('プリセット名を入力してください');
        document.getElementById('newPresetName').focus();
        return;
    }
    
    if (n === 0 && p === 0 && k === 0) {
        alert('N, P, Kのいずれかの値を入力してください');
        document.getElementById('newPresetN').focus();
        return;
    }
    
    // 既存のプリセットと名前の重複チェック
    if (userPresets.some(preset => preset.name === name) || 
        defaultPresets.some(preset => preset.name === name)) {
        alert('同じ名前のプリセットが既に存在します。別の名前を使用してください。');
        document.getElementById('newPresetName').focus();
        return;
    }
    
    // 新しいプリセットオブジェクトを作成
    const newPreset = {
        name,
        nitrogen: n,
        phosphorus: p,
        potassium: k,
        calcium: ca,
        magnesium: mg,
        sulfur: s,
        iron: fe,
        manganese: mn,
        zinc: zn,
        boron: b
    };
    
    // プリセットリストに追加
    userPresets.push(newPreset);
    
    // ローカルストレージに保存
    localStorage.setItem('userPresets', JSON.stringify(userPresets));
    
    // 入力フィールドをクリア
    clearNewPresetFields();
    
    // プリセットリストを更新
    renderPresetLists();
    renderPresets();
    
    alert('新しいプリセットが追加されました');
}

// 新しいプリセット入力フィールドをクリア
function clearNewPresetFields() {
    document.getElementById('newPresetName').value = '';
    document.getElementById('newPresetN').value = '';
    document.getElementById('newPresetP').value = '';
    document.getElementById('newPresetK').value = '';
    document.getElementById('newPresetCa').value = '';
    document.getElementById('newPresetMg').value = '';
    document.getElementById('newPresetS').value = '';
    document.getElementById('newPresetFe').value = '';
    document.getElementById('newPresetMn').value = '';
    document.getElementById('newPresetZn').value = '';
    document.getElementById('newPresetB').value = '';
}

// 詳細フィールドの表示切り替え
function toggleAdvancedFields() {
    const advancedSection = document.getElementById('advancedInputs');
    const toggleBtn = document.getElementById('toggleAdvanced');
    
    if (advancedSection.style.display === 'none' || getComputedStyle(advancedSection).display === 'none') {
        advancedSection.style.display = 'block';
        toggleBtn.textContent = '微量要素項目を隠す';
        toggleBtn.setAttribute('aria-expanded', 'true');
    } else {
        advancedSection.style.display = 'none';
        toggleBtn.textContent = '微量要素項目を表示する (Ca, Mg, S, Fe, Mn, Zn, B)';
        toggleBtn.setAttribute('aria-expanded', 'false');
    }
}

// プリセットの表示は renderPresets() 内で直接処理するように変更したため、
// この関数は削除

// 設定をローカルストレージから読み込む
function loadSettings() {
    // デフォルトプリセットを初期化
    initDefaultPresets();
    
    // デフォルトプリセットの表示設定を読み込む
    const savedDefaultPresets = localStorage.getItem('defaultPresets');
    if (savedDefaultPresets) {
        const parsedDefaults = JSON.parse(savedDefaultPresets);
        
        // 既存のデフォルトプリセットの表示状態を更新
        defaultPresets.forEach(preset => {
            const savedPreset = parsedDefaults.find(p => p.id === preset.id);
            if (savedPreset) {
                preset.isVisible = savedPreset.isVisible;
            }
        });
    }
    
    // ユーザープリセットを読み込む
    const savedUserPresets = localStorage.getItem('userPresets');
    if (savedUserPresets) {
        userPresets = JSON.parse(savedUserPresets);
    }
    
    // 計算履歴を読み込む
    const savedHistory = localStorage.getItem('calculationHistory');
    if (savedHistory) {
        calculationHistory = JSON.parse(savedHistory);
    }
}

// デフォルトプリセットを初期化
function initDefaultPresets() {
    defaultPresets = [
        {
            id: 'urea',
            name: '尿素',
            nitrogen: 46,
            phosphorus: 0,
            potassium: 0,
            calcium: 0,
            magnesium: 0,
            sulfur: 0,
            iron: 0,
            manganese: 0,
            zinc: 0,
            boron: 0,
            isVisible: true
        },
        {
            id: 'ammonium_sulfate',
            name: '硫安',
            nitrogen: 21,
            phosphorus: 0,
            potassium: 0,
            calcium: 0,
            magnesium: 0,
            sulfur: 24,
            iron: 0,
            manganese: 0,
            zinc: 0,
            boron: 0,
            isVisible: true
        },
        {
            id: 'calcium_nitrate',
            name: '硝酸カルシウム',
            nitrogen: 15.5,
            phosphorus: 0,
            potassium: 0,
            calcium: 19,
            magnesium: 0,
            sulfur: 0,
            iron: 0,
            manganese: 0,
            zinc: 0,
            boron: 0,
            isVisible: true
        },
        {
            id: 'superphosphate',
            name: '過リン酸石灰',
            nitrogen: 0,
            phosphorus: 20,
            potassium: 0,
            calcium: 16,
            magnesium: 0,
            sulfur: 12,
            iron: 0,
            manganese: 0,
            zinc: 0,
            boron: 0,
            isVisible: true
        },
        {
            id: 'potassium_chloride',
            name: '塩化カリウム',
            nitrogen: 0,
            phosphorus: 0,
            potassium: 60,
            calcium: 0,
            magnesium: 0,
            sulfur: 0,
            iron: 0,
            manganese: 0,
            zinc: 0,
            boron: 0,
            isVisible: true
        },
        {
            id: 'potassium_sulfate',
            name: '硫酸カリウム',
            nitrogen: 0,
            phosphorus: 0,
            potassium: 50,
            calcium: 0,
            magnesium: 0,
            sulfur: 18,
            iron: 0,
            manganese: 0,
            zinc: 0,
            boron: 0,
            isVisible: true
        },
        {
            id: 'magnesium_sulfate',
            name: '硫酸マグネシウム',
            nitrogen: 0,
            phosphorus: 0,
            potassium: 0,
            calcium: 0,
            magnesium: 9.8,
            sulfur: 13,
            iron: 0,
            manganese: 0,
            zinc: 0,
            boron: 0,
            isVisible: true
        },
        {
            id: 'npk151515',
            name: 'NPK 15-15-15',
            nitrogen: 15,
            phosphorus: 15,
            potassium: 15,
            calcium: 0,
            magnesium: 0,
            sulfur: 0,
            iron: 0,
            manganese: 0,
            zinc: 0,
            boron: 0,
            isVisible: true
        },
        {
            id: 'iron_sulfate',
            name: '硫酸第一鉄',
            nitrogen: 0,
            phosphorus: 0,
            potassium: 0,
            calcium: 0,
            magnesium: 0,
            sulfur: 12,
            iron: 30,
            manganese: 0,
            zinc: 0,
            boron: 0,
            isVisible: true
        },
        {
            id: 'manganese_sulfate',
            name: '硫酸マンガン',
            nitrogen: 0,
            phosphorus: 0,
            potassium: 0,
            calcium: 0,
            magnesium: 0,
            sulfur: 14,
            iron: 0,
            manganese: 32,
            zinc: 0,
            boron: 0,
            isVisible: true
        },
        {
            id: 'zinc_sulfate',
            name: '硫酸亜鉛',
            nitrogen: 0,
            phosphorus: 0,
            potassium: 0,
            calcium: 0,
            magnesium: 0,
            sulfur: 15,
            iron: 0,
            manganese: 0,
            zinc: 36,
            boron: 0,
            isVisible: true
        },
        {
            id: 'borax',
            name: 'ホウ砂',
            nitrogen: 0,
            phosphorus: 0,
            potassium: 0,
            calcium: 0,
            magnesium: 0,
            sulfur: 0,
            iron: 0,
            manganese: 0,
            zinc: 0,
            boron: 11,
            isVisible: true
        }
    ];
}