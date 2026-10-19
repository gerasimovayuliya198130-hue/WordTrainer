// =====================================================
// ai-adaptive.js — Модуль ИИ №1: Адаптивный подбор слов
// =====================================================
// Тип ИИ: адаптивная система на основе модели забывания
// Идея: слова, в которых пользователь ошибается, получают
//       больший вес и чаще попадают в следующие игры.
//       Вес затухает со временем (кривая забывания Эббингауза).
// =====================================================

(function() {
    'use strict';

    const AI_WEIGHTS = {
        CORRECT_MULTIPLIER: 0.7,
        ALMOST_MULTIPLIER: 0.9,
        WRONG_MULTIPLIER: 2.5,
        MIN_WEIGHT: 0.1,
        MAX_WEIGHT: 10.0,
        DECAY_HALF_LIFE_DAYS: 3,
        STORAGE_KEY: 'wordTrainer_AI_weights'
    };

    let aiWordWeights = {};

    function aiLoadWeights() {
        try {
            const saved = localStorage.getItem(AI_WEIGHTS.STORAGE_KEY);
            if (saved) {
                aiWordWeights = JSON.parse(saved);
                console.log('[AI-Adaptive] Веса загружены:', Object.keys(aiWordWeights).length, 'слов');
            }
        } catch (e) {
            console.warn('[AI-Adaptive] Не удалось загрузить веса:', e);
            aiWordWeights = {};
        }
    }

    function aiSaveWeights() {
        try {
            localStorage.setItem(AI_WEIGHTS.STORAGE_KEY, JSON.stringify(aiWordWeights));
        } catch (e) {
            console.warn('[AI-Adaptive] Не удалось сохранить веса:', e);
        }
    }

    function aiWordKey(theme, word) {
        return theme + '_' + word.toLowerCase();
    }

    function aiGetWeight(theme, word) {
        const key = aiWordKey(theme, word);
        const data = aiWordWeights[key];
        if (!data) return 1.0;
        if (typeof data === 'number') return data;
        return data.weight || 1.0;
    }

        function aiUpdateWeight(theme, word, result, timeSpent) {
        const key = aiWordKey(theme, word);

        let data = aiWordWeights[key];
        if (typeof data === 'number' || !data) {
            data = {
                weight: typeof data === 'number' ? data : 1.0,
                lastSeen: Date.now(),
                shown: 0,
                correct: 0,
                wrong: 0,
                totalTime: 0
            };
        }

        // ФИКС: Снимок ДО обновления весов
        const snapshot = {
            weight: data.weight || 1.0,
            shown: data.shown || 0,
            correct: data.correct || 0,
            totalTime: data.totalTime || 0
        };

        // Затухание по времени (кривая забывания Эббингауза)
        const daysSince = (Date.now() - (data.lastSeen || Date.now())) / (1000 * 60 * 60 * 24);
        const decayFactor = Math.pow(2, daysSince / AI_WEIGHTS.DECAY_HALF_LIFE_DAYS);
        data.weight = Math.min(AI_WEIGHTS.MAX_WEIGHT, data.weight * decayFactor);

        data.shown = (data.shown || 0) + 1;
        data.lastSeen = Date.now();
        if (timeSpent) data.totalTime = (data.totalTime || 0) + timeSpent;

        let label = '';
        if (result === true || result === 'correct') {
            data.correct = (data.correct || 0) + 1;
            data.weight *= AI_WEIGHTS.CORRECT_MULTIPLIER;
            label = '✓ correct';
        } else if (result === 'almost') {
            data.weight *= AI_WEIGHTS.ALMOST_MULTIPLIER;
            label = '~ almost';
        } else {
            data.wrong = (data.wrong || 0) + 1;
            data.weight *= AI_WEIGHTS.WRONG_MULTIPLIER;
            label = '✗ wrong';
        }

        data.weight = Math.max(AI_WEIGHTS.MIN_WEIGHT, Math.min(AI_WEIGHTS.MAX_WEIGHT, data.weight));
        aiWordWeights[key] = data;
        aiSaveWeights();

        if (typeof window.aiLogTrainingExample === 'function') {
            window.aiLogTrainingExample(theme, word, result, timeSpent || 0, snapshot);
        }

        console.log('[AI-Adaptive] "' + word + '" → вес: ' + data.weight.toFixed(2) + ' (' + label + ')');
    }

    function aiPickAdaptiveWords(theme, words, count) {
    if (!words || words.length === 0) return [];
    if (words.length <= count) return shuffle([...words]);

    // Базовый вес — из адаптивного модуля
    const weights = words.map(w => aiGetWeight(theme, w.word));

    // Дополнительный коэффициент — из классификатора ошибок
    const riskFactors = words.map(w => {
        if (typeof window.aiPredictErrorProbability === 'function') {
            const p = window.aiPredictErrorProbability(theme, w.word);
            // p ∈ [0, 1] → коэффициент [1, 2]
            return 1 + p;
        }
        return 1;
    });

    // Итоговый вес = адаптивный вес × риск ошибки
    const finalWeights = weights.map((w, i) => w * riskFactors[i]);

    const picked = [];
    const remaining = words.map((w, i) => ({ word: w, weight: finalWeights[i] }));

    for (let i = 0; i < count && remaining.length > 0; i++) {
        const total = remaining.reduce((sum, item) => sum + item.weight, 0);
        let roll = Math.random() * total;
        let chosenIndex = 0;
        for (let j = 0; j < remaining.length; j++) {
            roll -= remaining[j].weight;
            if (roll <= 0) { chosenIndex = j; break; }
        }
        picked.push(remaining[chosenIndex].word);
        remaining.splice(chosenIndex, 1);
    }
    return picked;
}

    function aiGetProblemWords(theme, limit) {
        const result = [];
        const prefix = theme + '_';
        for (const key in aiWordWeights) {
            if (key.startsWith(prefix)) {
                const data = aiWordWeights[key];
                const weight = typeof data === 'number' ? data : (data.weight || 1.0);
                const word = key.substring(prefix.length);
                result.push({ word: word, weight: weight });
            }
        }
        result.sort((a, b) => b.weight - a.weight);
        return result.slice(0, limit || 50);
    }

    function aiGetAllProblemWords(limit) {
        const result = [];
        for (const key in aiWordWeights) {
            const data = aiWordWeights[key];
            const weight = typeof data === 'number' ? data : (data.weight || 1.0);
            if (weight > 1.2) {
                const underscoreIdx = key.indexOf('_');
                if (underscoreIdx === -1) continue;
                const theme = key.substring(0, underscoreIdx);
                const word = key.substring(underscoreIdx + 1);
                result.push({ theme: theme, word: word, weight: weight });
            }
        }
        result.sort((a, b) => b.weight - a.weight);
        return result.slice(0, limit || 200);
    }

    function aiResetWeights() {
    Object.keys(aiWordWeights).forEach(k => delete aiWordWeights[k]);
    localStorage.removeItem(AI_WEIGHTS.STORAGE_KEY);
    console.log('[AI-Adaptive] Веса сброшены');
}

    function shuffle(arr) {
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }

    window.AIAdaptive = {
        getWeight: aiGetWeight,
        updateWeight: aiUpdateWeight,
        pickWords: aiPickAdaptiveWords,
        getProblemWords: aiGetProblemWords,
        getAllProblemWords: aiGetAllProblemWords,
        reset: aiResetWeights
    };

    window.aiUpdateWeight = aiUpdateWeight;
    window.aiPickAdaptiveWords = aiPickAdaptiveWords;
    window.aiGetProblemWords = aiGetProblemWords;
    window.aiGetAllProblemWords = aiGetAllProblemWords;
    window.aiResetWeights = aiResetWeights;

    // ВАЖНО: сначала загружаем данные из localStorage,
    // только ПОТОМ отдаём ссылку наружу — иначе ссылка
    // будет указывать на старый пустой объект.
    aiLoadWeights();
    window.aiWordWeights = aiWordWeights;

    console.log('[AI-Adaptive] Модуль загружен (веса + затухание + статистика)');
})();
