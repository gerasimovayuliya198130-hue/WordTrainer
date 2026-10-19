// =====================================================
// ai-progress.js — Модуль ИИ №3: Прогноз успеваемости
// =====================================================
// Тип ИИ: Машинное обучение, линейная регрессия y = ax + b
// + метрики качества: R², MAE, RMSE
// =====================================================

(function() {
    'use strict';

    const AI_PROGRESS = {
        STORAGE_KEY: 'wordTrainer_AI_progress',
        MAX_HISTORY: 20
    };

    let aiScoreHistory = [];

    function aiLoadProgress() {
        try {
            const saved = localStorage.getItem(AI_PROGRESS.STORAGE_KEY);
            if (saved) {
                aiScoreHistory = JSON.parse(saved);
                console.log('[AI-Progress] История загружена:', aiScoreHistory.length, 'игр');
            }
        } catch (e) {
            aiScoreHistory = [];
        }
    }

    function aiSaveProgress() {
        try {
            localStorage.setItem(AI_PROGRESS.STORAGE_KEY, JSON.stringify(aiScoreHistory));
        } catch (e) {}
    }

    window.aiSaveGameResult = function(score, maxScore, theme) {
        if (!maxScore || maxScore <= 0) return;

        if (score < 0) score = 0;
        if (score > maxScore) score = maxScore;

        const ratio = Math.max(0, Math.min(1, score / maxScore));

        aiScoreHistory.push({
            score: score,
            max: maxScore,
            ratio: ratio,
            theme: theme || 'unknown',
            date: new Date().toISOString()
        });

        if (aiScoreHistory.length > AI_PROGRESS.MAX_HISTORY) {
            aiScoreHistory = aiScoreHistory.slice(-AI_PROGRESS.MAX_HISTORY);
        }

        aiSaveProgress();
        console.log('[AI-Progress] Сохранено: ' + score + '/' + maxScore + ' (' + (ratio * 100).toFixed(1) + '%) тема: ' + (theme || 'unknown'));
    };

    function aiLinearRegression(values) {
        const n = values.length;
        if (n < 2) return { a: 0, b: values[0] || 0 };
        let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
        for (let i = 0; i < n; i++) {
            sumX += i;
            sumY += values[i];
            sumXY += i * values[i];
            sumX2 += i * i;
        }
        const denom = (n * sumX2 - sumX * sumX);
        if (denom === 0) return { a: 0, b: sumY / n };
        const a = (n * sumXY - sumX * sumY) / denom;
        const b = (sumY - a * sumX) / n;
        return { a: a, b: b };
    }

    // ========== МЕТРИКИ КАЧЕСТВА ==========
    function aiRegressionMetrics(values, reg) {
        const n = values.length;
        if (n < 2) return null;

        let ssRes = 0, ssTot = 0, mae = 0;
        const mean = values.reduce((s, v) => s + v, 0) / n;

        for (let i = 0; i < n; i++) {
            const predicted = reg.a * i + reg.b;
            const actual = values[i];
            ssRes += Math.pow(actual - predicted, 2);
            ssTot += Math.pow(actual - mean, 2);
            mae += Math.abs(actual - predicted);
        }

        const r2 = ssTot === 0 ? 0 : 1 - ssRes / ssTot;
        const mse = ssRes / n;
        const rmse = Math.sqrt(mse);
        mae = mae / n;

        return { r2: r2, mse: mse, rmse: rmse, mae: mae, n: n };
    }

    function aiPredictNext() {
        if (aiScoreHistory.length < 3) return null;   // 3+ для осмысленных метрик
        const ratios = aiScoreHistory.map(h => h.ratio);
        const reg = aiLinearRegression(ratios);
        const nextIndex = ratios.length;
        let prediction = reg.a * nextIndex + reg.b;
        prediction = Math.max(0, Math.min(1, prediction));
        const trend = reg.a > 0.01 ? 'Progress is growing!'
                    : reg.a < -0.01 ? 'There is a decline'
                    : 'Stable';

        const metrics = aiRegressionMetrics(ratios, reg);

        return {
            prediction: prediction,
            percent: (prediction * 100).toFixed(1),
            trend: trend,
            slope: reg.a,
            metrics: metrics
        };
    }

    function drawProgressChart() {
        const canvas = document.getElementById('aiProgressChart');
        if (!canvas) return;

        canvas.width  = 600;
        canvas.height = 280;

        if (aiScoreHistory.length < 1) {
            canvas.style.display = 'none';
            return;
        }

        canvas.style.display = 'block';
        const ctx = canvas.getContext('2d');
        const W = canvas.width;
        const H = canvas.height;

        const padLeft = 70;
        const padRight = 40;
        const padTop = 30;
        const padBottom = 55;

        const chartW = W - padLeft - padRight;
        const chartH = H - padTop - padBottom;

        ctx.clearRect(0, 0, W, H);

        // ============================================================
        // ОБЩЕЕ ЧИСЛО ПОЗИЦИЙ: реальные игры + 1 для прогноза
        // ============================================================
        const totalGames = aiScoreHistory.length;
        const totalPositions = totalGames + 1;  // ← +1 для прогноза

        // ============================================================
        // 1. ГОРИЗОНТАЛЬНАЯ СЕТКА + ПОДПИСИ Y
        // ============================================================
        ctx.strokeStyle = 'rgba(0,0,0,0.08)';
        ctx.lineWidth = 1;

        for (let i = 0; i <= 4; i++) {
            const y = padTop + chartH * (1 - i / 4);
            ctx.beginPath();
            ctx.moveTo(padLeft, y);
            ctx.lineTo(W - padRight, y);
            ctx.stroke();

            ctx.fillStyle = '#666';
            ctx.font = '11px Segoe UI, sans-serif';
            ctx.textAlign = 'right';
            ctx.fillText((i * 25) + '%', padLeft - 8, y + 4);
        }

        // ============================================================
        // 2. ВЕРТИКАЛЬНАЯ СЕТКА + ПОДПИСИ X
        // ============================================================
        let step;
        if (totalPositions <= 6) step = 1;
        else if (totalPositions <= 12) step = 2;
        else if (totalPositions <= 25) step = 5;
        else step = 10;

        let verticalLines = [];
        for (let i = 0; i < totalPositions; i += step) {
            verticalLines.push(i);
        }
        if (verticalLines[verticalLines.length - 1] !== totalPositions - 1) {
            verticalLines.push(totalPositions - 1);
        }

        while (verticalLines.length > 8) {
            step *= 2;
            verticalLines = [];
            for (let i = 0; i < totalPositions; i += step) {
                verticalLines.push(i);
            }
            if (verticalLines[verticalLines.length - 1] !== totalPositions - 1) {
                verticalLines.push(totalPositions - 1);
            }
        }

        verticalLines.forEach(function(idx) {
            const x = padLeft + (chartW * idx) / (totalPositions - 1);

            ctx.beginPath();
            ctx.moveTo(x, padTop);
            ctx.lineTo(x, padTop + chartH);
            ctx.stroke();

            ctx.fillStyle = '#666';
            ctx.font = '11px Segoe UI, sans-serif';
            ctx.textAlign = 'center';

            const label = (idx + 1).toString();
            ctx.fillText(label, x, padTop + chartH + 20);
        });

        // ============================================================
        // 3. РЕАЛЬНЫЕ ТОЧКИ (не включая прогноз)
        // ============================================================
        const points = [];
        for (let i = 0; i < totalGames; i++) {
            const x = padLeft + (chartW * i) / (totalPositions - 1);

            let ratio = aiScoreHistory[i].ratio;
            if (ratio < 0) ratio = 0;
            if (ratio > 1) ratio = 1;

            const y = padTop + chartH * (1 - ratio);
            points.push({ x: x, y: y, ratio: ratio });
        }

        // ============================================================
        // 4. СОЕДИНЕНИЕ ЛИНИЕЙ + ЗАЛИВКА
        // ============================================================
        if (points.length >= 2) {
            ctx.beginPath();
            ctx.moveTo(points[0].x, padTop + chartH);
            points.forEach(function(p) {
                ctx.lineTo(p.x, p.y);
            });
            ctx.lineTo(points[points.length - 1].x, padTop + chartH);
            ctx.closePath();
            ctx.fillStyle = 'rgba(91, 200, 232, 0.12)';
            ctx.fill();

            ctx.strokeStyle = '#5bc8e8';
            ctx.lineWidth = 2.5;
            ctx.lineJoin = 'round';
            ctx.lineCap = 'round';
            ctx.beginPath();
            points.forEach(function(p, i) {
                if (i === 0) ctx.moveTo(p.x, p.y);
                else ctx.lineTo(p.x, p.y);
            });
            ctx.stroke();
        }

        // ============================================================
        // 5. ТОЧКИ
        // ============================================================
        points.forEach(function(p) {
            const ratio = p.ratio;
            ctx.fillStyle = ratio >= 0.8 ? '#2ecc71'
                          : ratio >= 0.5 ? '#f39c12'
                          : '#e74c3c';
            ctx.beginPath();
            ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 1.5;
            ctx.stroke();
        });

        // ============================================================
        // 6. ПРОГНОЗ (пунктир к позиции totalPositions - 1)
        // ============================================================
        const pred = aiPredictNext();
        if (pred && points.length >= 2) {
            const lastX = points[points.length - 1].x;
            const lastY = points[points.length - 1].y;

            let predValue = pred.prediction;
            if (predValue < 0) predValue = 0;
            if (predValue > 1) predValue = 1;

            // Прогноз на ПОСЛЕДНЕЙ позиции
            const predX = padLeft + (chartW * (totalPositions - 1)) / (totalPositions - 1);
            const predY = padTop + chartH * (1 - predValue);

            ctx.strokeStyle = '#f39c12';
            ctx.lineWidth = 2;
            ctx.setLineDash([6, 4]);
            ctx.beginPath();
            ctx.moveTo(lastX, lastY);
            ctx.lineTo(predX, predY);
            ctx.stroke();
            ctx.setLineDash([]);

            ctx.fillStyle = '#f39c12';
            ctx.beginPath();
            ctx.arc(predX, predY, 6, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.stroke();

            ctx.fillStyle = '#f39c12';
            ctx.font = 'bold 11px Segoe UI, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('Next', predX, predY - 12);
        }

        // ============================================================
        // 7. ПОДПИСИ ОСЕЙ
        // ============================================================
        ctx.fillStyle = '#333';
        ctx.font = 'bold 12px Segoe UI, sans-serif';
        ctx.textAlign = 'center';

        ctx.save();
        ctx.translate(22, padTop + chartH / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.fillText('Result, %', 0, 0);
        ctx.restore();

        ctx.fillText('Game number', padLeft + chartW / 2, H - 8);
    }

    function renderAIProgress() {
        const content = document.getElementById('aiProgressContent');
        if (!content) return;

        if (aiScoreHistory.length === 0) {
            content.innerHTML = 'No games yet. Play at least 1 game!';
            const canvas = document.getElementById('aiProgressChart');
            if (canvas) canvas.style.display = 'none';
            return;
        }

        let html = '';
        html += '<div style="margin-bottom: 8px;">Games played: <b>' + aiScoreHistory.length + '</b></div>';

        html += '<div style="margin-bottom: 10px;"><b>Recent:</b><br>';

        const recent = aiScoreHistory.slice(-5).reverse();
        recent.forEach(function(g) {
            const pct = (g.ratio * 100).toFixed(0);
            const color = g.ratio >= 0.8 ? '#2ecc71' : g.ratio >= 0.5 ? '#f39c12' : '#e74c3c';
            const date = g.date ? new Date(g.date).toLocaleDateString('ru-RU') : '';
            const theme = g.theme && g.theme !== 'unknown' ? g.theme : '—';
            html += '<div style="padding: 4px 0; border-bottom: 1px solid rgba(0,0,0,0.05); display: flex; justify-content: space-between; align-items: center; gap: 8px;">';
            html += '<span style="color:' + color + '; font-weight:700; font-size: 14px; min-width: 45px;">' + pct + '%</span>';
            html += '<span style="color:#5bc8e8; font-size:12px; font-weight:600; flex:1; text-align:center;">' + theme + '</span>';
            if (date) html += '<span style="color:#999; font-size:12px;">' + date + '</span>';
            html += '</div>';
        });
        html += '</div>';

        const avg = aiScoreHistory.reduce((s, g) => s + g.ratio, 0) / aiScoreHistory.length;
        html += '<div style="margin-bottom: 10px;">Average: <b>' + (avg * 100).toFixed(1) + '%</b></div>';

        const pred = aiPredictNext();
        if (pred) {
            html += '<div style="padding: 12px; background: rgba(91,200,232,0.15); border-radius: 12px; border-left: 4px solid #5bc8e8;">';
            html += '<div style="font-weight:700; color:#1a1a2e; margin-bottom: 6px;">AI Prediction</div>';
            html += '<div style="font-size: 22px; font-weight: 800; color:#5bc8e8;">' + pred.percent + '%</div>';
            html += '<div style="font-size: 12px; color:#666; margin-top: 4px;">' + pred.trend + '</div>';
            if (pred.metrics) {
                const r2 = pred.metrics.r2;
                const r2Color = r2 >= 0.7 ? '#2ecc71' : r2 >= 0.3 ? '#f39c12' : '#e74c3c';
                html += '<div style="font-size: 11px; color:#999; margin-top: 6px; padding-top: 6px; border-top: 1px solid rgba(0,0,0,0.08);">';
                html += 'R² = <span style="color:' + r2Color + '; font-weight:700;">' + r2.toFixed(3) + '</span>';
                html += ' · MAE = ' + (pred.metrics.mae * 100).toFixed(1) + '%';
                html += ' · RMSE = ' + (pred.metrics.rmse * 100).toFixed(1) + '%';
                html += '</div>';
            }
            html += '</div>';
        } else {
            html += '<div style="color:#999; font-size:12px;">Play at least 3 games to get AI prediction.</div>';
        }

        content.innerHTML = html;
        setTimeout(drawProgressChart, 100);
    }

    function initButton() {
        const btn = document.getElementById('aiProgressBtn');
        const panel = document.getElementById('aiProgressPanel');

        if (!btn || !panel) {
            console.warn('[AI-Progress] Кнопка или панель не найдены');
            return;
        }

        btn.addEventListener('click', function() {
            if (panel.style.display === 'none') {
                const statsPanel = document.getElementById('aiStatsPanel');
                if (statsPanel) statsPanel.style.display = 'none';
                const clusterPanel = document.getElementById('aiClusterPanel');
                if (clusterPanel) clusterPanel.style.display = 'none';
                const classifierPanel = document.getElementById('aiClassifierPanel');
                if (classifierPanel) classifierPanel.style.display = 'none';
                panel.style.display = 'block';
                renderAIProgress();
            } else {
                panel.style.display = 'none';
            }
        });
    }

    aiLoadProgress();

    window.aiResetProgress = function() {
    aiScoreHistory = [];
    localStorage.removeItem(AI_PROGRESS.STORAGE_KEY);
    console.log('[AI-Progress] История сброшена');
}; 
    // Кнопка aiProgressBtn обрабатывается в index.html
    // Экспортируем функцию рендера для модального окна
    window.aiRenderProgress = renderAIProgress;

    console.log('[AI-Progress] Модуль загружен (экспорт renderAIProgress)');
})();