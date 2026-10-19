// =====================================================
// ai-fuzzy.js — Модуль ИИ №2: Fuzzy-проверка (NLP)
// =====================================================
// Тип ИИ: обработка естественного языка (NLP)
// Алгоритмы: расстояние Левенштейна + Soundex (фонетика)
// =====================================================

(function() {
    'use strict';

    function levenshteinDistance(a, b) {
        a = a.toLowerCase().trim();
        b = b.toLowerCase().trim();

        if (a === b) return 0;
        if (a.length === 0) return b.length;
        if (b.length === 0) return a.length;

        const matrix = [];
        for (let i = 0; i <= b.length; i++) matrix[i] = [i];
        for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

        for (let i = 1; i <= b.length; i++) {
            for (let j = 1; j <= a.length; j++) {
                if (b.charAt(i - 1) === a.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1,
                        matrix[i][j - 1] + 1,
                        matrix[i - 1][j] + 1
                    );
                }
            }
        }
        return matrix[b.length][a.length];
    }

    // ========== ФОНЕТИЧЕСКОЕ СРАВНЕНИЕ (Soundex) ==========
        function soundex(word) {
        if (!word) return '';
        word = word.toLowerCase().replace(/[^a-z]/g, '');
       
        if (word.length === 0) return '';

        const map = {
            b:1, f:1, p:1, v:1,
            c:2, g:2, j:2, k:2, q:2, s:2, x:2, z:2,
            d:3, t:3,
            l:4,
            m:5, n:5,
            r:6
        };

        let result = word[0].toUpperCase();
        let prevCode = map[word[0]] || 0;

        for (let i = 1; i < word.length; i++) {
            const code = map[word[i]] || 0;
            if (code !== 0 && code !== prevCode) {
                result += code;
            }
            prevCode = code;
        }

        return (result + '000').slice(0, 4);
    }

    const FUZZY_CONFIG = {
        SHORT_MAX_DISTANCE: 0,
        SHORT_MAX_LENGTH: 4,
        MEDIUM_MAX_DISTANCE: 1,
        MEDIUM_MAX_LENGTH: 7,
        LONG_MAX_DISTANCE: 2
    };

    function fuzzyCheckSpelling(userInput, correctWord) {
        const user = userInput.toLowerCase().trim();
        const correct = correctWord.toLowerCase().trim();

        if (user.length === 0) {
            return { status: 'wrong', distance: 999, message: 'Please type something!', reason: 'empty' };
        }

        const distance = levenshteinDistance(user, correct);

        let maxDistance;
        if (correct.length <= FUZZY_CONFIG.SHORT_MAX_LENGTH) {
            maxDistance = FUZZY_CONFIG.SHORT_MAX_DISTANCE;
        } else if (correct.length <= FUZZY_CONFIG.MEDIUM_MAX_LENGTH) {
            maxDistance = FUZZY_CONFIG.MEDIUM_MAX_DISTANCE;
        } else {
            maxDistance = FUZZY_CONFIG.LONG_MAX_DISTANCE;
        }

        if (distance === 0) {
            return { status: 'correct', distance: 0, message: '✅ Perfect!', reason: 'exact' };
        } else if (distance <= maxDistance) {
            return { status: 'almost', distance: distance, message: 'Almost!', reason: 'levenshtein' };
        }

        // Проверка через Soundex
        const userSoundex = soundex(user);
        const correctSoundex = soundex(correct);
        if (correct.length > FUZZY_CONFIG.SHORT_MAX_LENGTH && distance <= 3 &&
            userSoundex === correctSoundex && userSoundex.length > 0 && user !== correct) {
            return { status: 'almost', distance: distance, message: 'Almost (phonetic)!', reason: 'phonetic' };
        }

        return { status: 'wrong', distance: distance, message: 'Wrong!', reason: 'levenshtein' };
    }

    window.AIFuzzy = {
        levenshteinDistance: levenshteinDistance,
        soundex: soundex,
        checkSpelling: fuzzyCheckSpelling,
        config: FUZZY_CONFIG
    };

    window.levenshteinDistance = levenshteinDistance;
    window.soundex = soundex;
    window.fuzzyCheckSpelling = fuzzyCheckSpelling;

    console.log('[AI-Fuzzy] Модуль загружен (Левенштейн + Soundex + адаптивные пороги)');
})();
