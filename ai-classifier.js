// =====================================================
// ai-classifier.js — Модуль ИИ №5: Классификация ошибок
// =====================================================
// Тип ИИ: машинное обучение с учителем (supervised learning)
// Алгоритм: логистическая регрессия (gradient descent)
// Идея: по признакам слова и истории ученика предсказать,
//       ошибётся ли он в следующем показе.
// =====================================================
(function() {
    'use strict';

    const CLASSIFIER_CONFIG = {
        STORAGE_KEY: 'wordTrainer_AI_classifier',
        LEARNING_RATE: 0.1,
        EPOCHS: 200,
// Порог 0.5 выбран осознанно: так как ошибкам задан вес 3 (для повышения recall),
// эффективный порог по реальной вероятности смещается. 0.5 дает баланс без подгонки под тест.
        THRESHOLD: 0.5,
        MIN_SAMPLES: 10,
        MAX_TRAINING_DATA: 2000
    };

    let classifierModel = null;
    let trainingData = [];
    let lastTestMetrics = null;
    let lastTestSet = null;
    let lastTrainSize = 0;

    // ========== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ==========

    function sigmoid(z) {
        if (z < -500) return 0;
        if (z > 500) return 1;
        return 1 / (1 + Math.exp(-z));
    }

    function buildFeatures(word, s) {
        const shown = s.shown || 0;
        const accuracy = shown > 0 ? s.correct / shown : 0.5;
        const avgTime = (shown > 0 && s.totalTime > 0) ? s.totalTime / shown : 5;
        return [
            (s.weight || 1) / 10,
            1 - accuracy,
            Math.min(avgTime / 10, 1),
            Math.min(word.length / 15, 1)
        ];
    }

    function predict(features, model) {
        if (!model || !model.weights || !Array.isArray(features)) return 0.5;
        
        let z = model.bias || 0;
        for (let i = 0; i < features.length && i < model.weights.length; i++) {
            const feature = features[i];
            if (!isFinite(feature)) continue;
            z += model.weights[i] * feature;
        }
        
        const result = sigmoid(z);
        return isFinite(result) ? result : 0.5;
    }

    // ========== ОБУЧЕНИЕ МОДЕЛИ ==========

    function trainLogisticRegression(data, epochs, lr) {
        if (!data || data.length < 5) return null;
        
        const numFeatures = data[0].features.length;
        const model = {
            weights: new Array(numFeatures).fill(0),
            bias: 0
        };

        for (let epoch = 0; epoch < epochs; epoch++) {
            let totalError = 0;

            for (let i = 0; i < data.length; i++) {
                const x = data[i].features;
                const y = data[i].label;
                const w = data[i].weight || 1;
                const yPred = predict(x, model);
                const error = (y - yPred) * w;
                
                totalError += Math.abs(y - yPred);

                for (let j = 0; j < numFeatures; j++) {
                    if (!isFinite(x[j])) continue;
                    model.weights[j] += lr * error * x[j];
                }
                model.bias += lr * error;
            }

            const avgError = totalError / data.length;
            if (avgError < 0.01) {
                console.log('[AI-Classifier] Ранняя остановка на эпохе ' + epoch + ', ошибка: ' + avgError.toFixed(4));
                break;
            }
        }

        return model;
    }

function computeAUC(data, model) {
    const pos = [], neg = [];
    data.forEach(d => { const p = predict(d.features, model); (d.label === 1 ? pos : neg).push(p); });
    if (!pos.length || !neg.length) return null;
    let wins = 0;
    pos.forEach(p => neg.forEach(n => { wins += p > n ? 1 : (p === n ? 0.5 : 0); }));
    return wins / (pos.length * neg.length);
}

    // ========== МЕТРИКИ ==========

    function computeMetrics(data, model) {
        if (!model || !data || data.length === 0) return null;

        let tp = 0, tn = 0, fp = 0, fn = 0;
        let correct = 0;

        for (let i = 0; i < data.length; i++) {
            const yTrue = data[i].label;
            const yPred = predict(data[i].features, model) >= CLASSIFIER_CONFIG.THRESHOLD ? 1 : 0;

            if (yTrue === yPred) correct++;
            if (yTrue === 1 && yPred === 1) tp++;
            if (yTrue === 0 && yPred === 0) tn++;
            if (yTrue === 0 && yPred === 1) fp++;
            if (yTrue === 1 && yPred === 0) fn++;
        }

        const accuracy = correct / data.length;
        const precision = (tp + fp) > 0 ? tp / (tp + fp) : 0;
        const recall = (tp + fn) > 0 ? tp / (tp + fn) : 0;
        const f1 = (precision + recall) > 0 ? 2 * precision * recall / (precision + recall) : 0;

        return { accuracy, precision, recall, f1, tp, tn, fp, fn, n: data.length };
    }

    function computeBaselineMetrics(data) {
        if (!data || data.length === 0) return null;

        let tp = 0, tn = 0, fp = 0, fn = 0;

        for (let i = 0; i < data.length; i++) {
            const yTrue = data[i].label;
            const yPred = 0; // baseline: всегда "ошибки не будет"

            if (yTrue === 1 && yPred === 1) tp++;
            if (yTrue === 0 && yPred === 0) tn++;
            if (yTrue === 0 && yPred === 1) fp++;
            if (yTrue === 1 && yPred === 0) fn++;
        }

        const accuracy = (tp + tn) / data.length;
        const recall = (tp + fn) > 0 ? tp / (tp + fn) : 0;
        const precision = (tp + fp) > 0 ? tp / (tp + fp) : 0;
        const f1 = (precision + recall) > 0 ? 2 * precision * recall / (precision + recall) : 0;

        return { accuracy, precision, recall, f1, tp, tn, fp, fn, n: data.length };
    }

    // ========== ЛОГИРОВАНИЕ ПРИМЕРОВ ==========

        window.aiLogTrainingExample = function(theme, word, result, elapsedSeconds, snapshot) {
        if (!theme || !word) return;
        
        // Используем snapshot, а если его нет — текущие данные
        let s = snapshot;
        if (!s) {
            const key = theme + '_' + word.toLowerCase();
            const data = (typeof window.aiWordWeights !== 'undefined' && window.aiWordWeights[key]) 
                ? window.aiWordWeights[key] : null;
            s = {
                weight: data ? (data.weight || 1.0) : 1.0,
                shown: data ? (data.shown || 0) : 0,
                correct: data ? (data.correct || 0) : 0,
                totalTime: data ? (data.totalTime || 0) : 0
            };
        }
        const features = buildFeatures(word, s);
        const label = (result === true || result === 'correct') ? 0 : 1;
        const sampleWeight = label === 1 ? 2 : 1;


        trainingData.push({ 
            features, 
            label, 
            weight: sampleWeight, 
            timestamp: Date.now() 
        });

        if (trainingData.length > CLASSIFIER_CONFIG.MAX_TRAINING_DATA) {
            trainingData = trainingData.slice(-CLASSIFIER_CONFIG.MAX_TRAINING_DATA);
        }

        saveTrainingData();
        classifierModel = null; // ФИКС: заставляем переобучиться при следующем предсказании
    };

    // ========== СОХРАНЕНИЕ И ЗАГРУЗКА ==========

    function saveTrainingData() {
        try {
            localStorage.setItem(CLASSIFIER_CONFIG.STORAGE_KEY, JSON.stringify(trainingData));
        } catch (e) {
            console.warn('[AI-Classifier] Не удалось сохранить данные:', e.message);
        }
    }

    function loadTrainingData() {
        try {
            const saved = localStorage.getItem(CLASSIFIER_CONFIG.STORAGE_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed)) {
                    trainingData = parsed.filter(d => d && Array.isArray(d.features) && d.features.length === 4);
                    console.log('[AI-Classifier] Загружено ' + trainingData.length + ' примеров');
                } else {
                    console.warn('[AI-Classifier] Неверный формат данных, инициализация пустого массива');
                    trainingData = [];
                }
            }
        } catch (e) {
            console.warn('[AI-Classifier] Ошибка загрузки данных:', e.message);
            trainingData = [];
        }
    }

    // ========== РАЗДЕЛЕНИЕ ДАННЫХ ==========

    
    function trainTestSplit(data, testRatio) {
    const positives = data.filter(d => d.label === 1);
    const negatives = data.filter(d => d.label === 0);
    
    // Фиксированный seed для воспроизводимости (Fisher-Yates)
    const mulberry32 = (a) => () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
    const rnd = mulberry32(42);
    const shuffleArr = (arr) => { 
        const a = [...arr]; 
        for (let i = a.length - 1; i > 0; i--) { 
            const j = Math.floor(rnd() * (i + 1)); 
            [a[i], a[j]] = [a[j], a[i]]; 
        } 
        return a; 
    };
        if (positives.length < 3 || negatives.length < 3) {
            const shuffled = shuffleArr([...data]);
            const cut = Math.max(1, Math.floor(data.length * testRatio));
            return {
                train: shuffled.slice(cut),
                test: shuffled.slice(0, cut)
            };
        }

        const posShuffled = shuffleArr(positives);
        const negShuffled = shuffleArr(negatives);
        const posTestSize = Math.max(1, Math.floor(positives.length * testRatio));
        const negTestSize = Math.max(1, Math.floor(negatives.length * testRatio));

        const test = [
            ...posShuffled.slice(0, posTestSize),
            ...negShuffled.slice(0, negTestSize)
        ];
        const train = [
            ...posShuffled.slice(posTestSize),
            ...negShuffled.slice(negTestSize)
        ];

        return {
            train: shuffleArr(train),
            test: shuffleArr(test)
        };
    }

    // ========== ПЕРЕОБУЧЕНИЕ ==========

    function retrain() {
        if (trainingData.length < CLASSIFIER_CONFIG.MIN_SAMPLES) {
            classifierModel = null;
            lastTestMetrics = null;
            lastTestSet = null;
            return null;
        }

        const split = trainTestSplit(trainingData, 0.3);
        lastTestSet = split.test;
        lastTrainSize = split.train.length;

        classifierModel = trainLogisticRegression(
            split.train,
            CLASSIFIER_CONFIG.EPOCHS,
            CLASSIFIER_CONFIG.LEARNING_RATE
        );

        lastTestMetrics = computeMetrics(split.test, classifierModel);
        console.log('[AI-Classifier] Метрики на тестовой выборке:', lastTestMetrics);

        return classifierModel;
    }

    // ========== ПРЕДСКАЗАНИЕ ==========

        function aiPredictErrorProbability(theme, word) {
        if (!classifierModel) retrain();
        if (!classifierModel) return 0.5;

        const key = theme + '_' + word.toLowerCase();
        const data = (typeof window.aiWordWeights !== 'undefined' && window.aiWordWeights[key]) 
            ? window.aiWordWeights[key] 
            : null;

        // ФИКС: признаки считаются точно так же, как при обучении
        const s = (data && typeof data === 'object')
            ? { weight: data.weight || 1, shown: data.shown || 0, correct: data.correct || 0, totalTime: data.totalTime || 0 }
            : { weight: typeof data === 'number' ? data : 1, shown: 0, correct: 0, totalTime: 0 };
        
        return predict(buildFeatures(word, s), classifierModel);
    }

        // ========== ОТОБРАЖЕНИЕ ==========

    function aiRenderClassifier() {
        const content = document.getElementById('aiClassifierContent');
        if (!content) return;

        if (trainingData.length < CLASSIFIER_CONFIG.MIN_SAMPLES) {
            content.innerHTML = '<div style="color:#999; font-size:13px;">Need at least ' + 
                CLASSIFIER_CONFIG.MIN_SAMPLES + ' answered words. Play more games!</div>';
            return;
        }

        if (!classifierModel) retrain();

        const metrics = lastTestMetrics || computeMetrics(trainingData, classifierModel);
        let html = '';

        html += '<div style="margin-bottom: 10px; color: #333; font-size: 13px; font-weight: 600;">';
        html += 'Logistic Regression Classifier';
        html += '</div>';

        html += '<div style="margin-bottom: 10px; font-size: 12px; color: #666;">';
        html += 'Total examples: <b>' + trainingData.length + '</b><br>';
        html += 'Train: <b>' + lastTrainSize + '</b> · Test: <b>' + (lastTestSet ? lastTestSet.length : 0) + '</b><br>';
        html += 'Features: weight, error rate, avg time, word length';
        html += '</div>';

        
        if (metrics) {
            html += '<div style="padding: 12px; background: rgba(91,200,232,0.15); border-radius: 12px; border-left: 4px solid #5bc8e8; margin-bottom: 12px;">';
            html += '<div style="font-weight:700; color:#1a1a2e; margin-bottom: 8px;">Model Quality</div>';
            html += '<table style="width:100%; font-size:12px; border-collapse: collapse;">';
            html += '<tr><td style="padding:3px 0;">Accuracy:</td><td style="text-align:right; font-weight:700; color:#2ecc71;">' + 
                (metrics.accuracy * 100).toFixed(1) + '%</td></tr>';
            html += '<tr><td style="padding:3px 0;">Precision:</td><td style="text-align:right; font-weight:700; color:#3498db;">' + 
                (metrics.precision * 100).toFixed(1) + '%</td></tr>';
            html += '<tr><td style="padding:3px 0;">Recall:</td><td style="text-align:right; font-weight:700; color:#9b59b6;">' + 
                (metrics.recall * 100).toFixed(1) + '%</td></tr>';
            html += '<tr><td style="padding:3px 0;">F1-score:</td><td style="text-align:right; font-weight:700; color:#f39c12;">' + 
                (metrics.f1 * 100).toFixed(1) + '%</td></tr>';
            
            // ВОТ ЭТИ ДВЕ СТРОКИ ДОБАВЛЯЮТ ROC AUC:
            const auc = lastTestSet ? computeAUC(lastTestSet, classifierModel) : null;
            if (auc !== null) html += '<tr><td style="padding:3px 0;">ROC AUC:</td><td style="text-align:right; font-weight:700;">' + auc.toFixed(2) + '</td></tr>';
            
            html += '</table>';
            html += '</div>';
            html += '<div style="padding: 10px; background: rgba(0,0,0,0.04); border-radius: 10px; font-size: 12px;">';
            html += '<b>Confusion matrix:</b><br>';
            html += 'TP: ' + metrics.tp + ' · TN: ' + metrics.tn + ' · FP: ' + metrics.fp + ' · FN: ' + metrics.fn;
            html += '</div>';
        }

        const baseline = computeBaselineMetrics(lastTestSet || trainingData);
        if (baseline && metrics) {
            html += '<div style="padding: 10px; background: rgba(231,76,60,0.08); border-radius: 10px; font-size: 12px; margin-top: 10px; border-left: 4px solid #e74c3c;">';
            html += '<div style="font-weight:700; color:#1a1a2e; margin-bottom: 6px;">Baseline (always "no mistake")</div>';
            html += '<table style="width:100%; font-size:11px; border-collapse: collapse;">';
            html += '<tr><td>Accuracy:</td><td style="text-align:right;">' + 
                (baseline.accuracy * 100).toFixed(1) + '%</td></tr>';
            html += '<tr><td>Recall:</td><td style="text-align:right;">' + 
                (baseline.recall * 100).toFixed(1) + '%</td></tr>';
            html += '<tr><td>F1:</td><td style="text-align:right;">' + 
                (baseline.f1 * 100).toFixed(1) + '%</td></tr>';
            html += '</table>';
            
            // ВОЗВРАЩАЕМ ВЕРДИКТ:
            const verdict = metrics.f1 > baseline.f1
                ? 'Model F1 ' + (metrics.f1*100).toFixed(1) + '% vs baseline ' + (baseline.f1*100).toFixed(1) + '%'
                : 'Model does not beat the baseline yet — more data needed';
            html += '<div style="font-size: 10px; color: #666; margin-top: 6px;">' + verdict + '</div>';
            
            html += '</div>'; // ЗАКРЫВАЕМ КРАСНУЮ РАМКУ
        }

        // ВОЗВРАЩАЕМ ФУТЕР:
        html += '<div style="margin-top:14px; padding-top:10px; border-top: 1px solid rgba(0,0,0,0.08); font-size:11px; color:#999; line-height:1.6;">';
        html += '<b>Algorithm:</b> logistic regression (' + CLASSIFIER_CONFIG.EPOCHS + ' epochs, lr=' + 
            CLASSIFIER_CONFIG.LEARNING_RATE + ')<br>';
        html += 'Predicts probability of mistake for the next word.';
        html += '</div>';

        // ВОЗВРАЩАЕМ ВСТАВКУ HTML:
        content.innerHTML = html;
    }
    // ========== ПУБЛИЧНЫЙ ИНТЕРФЕЙС ==========

    window.AIClassifier = {
        predict: aiPredictErrorProbability,
        retrain: retrain,
        render: aiRenderClassifier,
        getModel: function() { return classifierModel; },
        getMetrics: function() { return lastTestMetrics; }
    };

    window.aiPredictErrorProbability = aiPredictErrorProbability;

    // ФИКС: возвращена функция сброса
    window.aiResetClassifier = function() {
        trainingData = [];
        classifierModel = null;
        lastTestMetrics = null;
        lastTestSet = null;
        lastTrainSize = 0;
        localStorage.removeItem(CLASSIFIER_CONFIG.STORAGE_KEY);
        console.log('[AI-Classifier] Классификатор сброшен');
    };
    // ========== ИНИЦИАЛИЗАЦИЯ ==========
    loadTrainingData();
    console.log('[AI-Classifier] Модуль загружен (логистическая регрессия)');
})();