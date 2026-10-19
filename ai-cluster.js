// =====================================================
// ai-cluster.js — Модуль ИИ №4: Кластеризация слов (k-means)
// =====================================================
// Тип ИИ: машинное обучение без учителя (unsupervised learning)
// Алгоритм: k-means (k=3)
// Идея: разбить все изученные слова на 3 кластера сложности
//       на основе веса, процента ошибок и среднего времени ответа.
// =====================================================

(function() {
    'use strict';

    const CLUSTER_CONFIG = {
        K: 3,
        MAX_ITER: 50,
        STORAGE_KEY: 'wordTrainer_AI_clusters',
        MIN_WORDS: 6,
        SEED: 42
    };
    
    function seededRandom(seed) {
        let s = seed;
        return function() {
            s = (s * 9301 + 49297) % 233280;
            return s / 233280;
        };
    }

    let rng = seededRandom(CLUSTER_CONFIG.SEED);

    function euclideanDistance(a, b) {
        let sum = 0;
        for (let i = 0; i < a.length; i++) {
            sum += Math.pow(a[i] - b[i], 2);
        }
        return Math.sqrt(sum);
    }

    function kMeans(points, k, maxIter) {
        if (!points || points.length < k) return null;

        rng = seededRandom(CLUSTER_CONFIG.SEED); // сбрасываем seed перед каждым запуском
const centroids = [];
const used = new Set();
let safety = 0;
while (centroids.length < k && safety < 1000) {
    safety++;
        const idx = Math.floor(rng() * points.length);
    const dup = centroids.some(c => euclideanDistance(c, points[idx].features) < 1e-9);
    if (!used.has(idx) && !dup) {
        used.add(idx);
        centroids.push([...points[idx].features]);
    }
}
        if (centroids.length < k) return null;

        let assignments = new Array(points.length).fill(0);

        for (let iter = 0; iter < maxIter; iter++) {
            let changed = false;

            for (let i = 0; i < points.length; i++) {
                let minDist = Infinity;
                let bestCluster = 0;
                for (let c = 0; c < k; c++) {
                    const dist = euclideanDistance(points[i].features, centroids[c]);
                    if (dist < minDist) {
                        minDist = dist;
                        bestCluster = c;
                    }
                }
                if (assignments[i] !== bestCluster) {
                    assignments[i] = bestCluster;
                    changed = true;
                }
            }

            if (!changed) break;

            for (let c = 0; c < k; c++) {
                const clusterPoints = points.filter((_, i) => assignments[i] === c);
                if (clusterPoints.length === 0) continue;
                const dim = clusterPoints[0].features.length;
                const newCentroid = new Array(dim).fill(0);
                clusterPoints.forEach(p => {
                    for (let d = 0; d < dim; d++) newCentroid[d] += p.features[d];
                });
                for (let d = 0; d < dim; d++) newCentroid[d] /= clusterPoints.length;
                centroids[c] = newCentroid;
            }
        }

        let silhouetteSum = 0;
        for (let i = 0; i < points.length; i++) {
            const ownCluster = assignments[i];
            const ownPoints = points.filter((_, j) => assignments[j] === ownCluster && j !== i);
            const otherClusters = [];
            for (let c = 0; c < k; c++) {
                if (c === ownCluster) continue;
                const otherPoints = points.filter((_, j) => assignments[j] === c);
                if (otherPoints.length > 0) otherClusters.push(otherPoints);
            }
            if (ownPoints.length === 0 || otherClusters.length === 0) continue;

            const a = ownPoints.reduce((s, p) => s + euclideanDistance(points[i].features, p.features), 0) / ownPoints.length;
            const b = Math.min(...otherClusters.map(cluster =>
                cluster.reduce((s, p) => s + euclideanDistance(points[i].features, p.features), 0) / cluster.length
            ));
            const maxAB = Math.max(a, b);
            if (maxAB > 0) silhouetteSum += (b - a) / maxAB;
        }
        const silhouette = points.length > 0 ? silhouetteSum / points.length : 0;

        return { assignments, centroids, silhouette };
    }

        function collectFeatures() {
    if (typeof window.aiWordWeights === 'undefined') return [];

    const points = [];
    for (const key in window.aiWordWeights) {
        const data = window.aiWordWeights[key];
        let weight, shown, correct, wrong, totalTime;
        if (typeof data === 'number') {
            weight = data; shown = 1; correct = 0; wrong = 0; totalTime = 5;
        } else {
            weight = data.weight || 1.0;
            shown = data.shown || 1;
            correct = data.correct || 0;
            wrong = data.wrong || 0;
            totalTime = data.totalTime || 5;
        }
        const accuracy = shown > 0 ? correct / shown : 0.5;
        const errorRate = 1 - accuracy;
        const avgTime = shown > 0 ? totalTime / shown : 5;
        points.push({
            key: key,
            rawFeatures: [Math.log(1 + weight), errorRate, avgTime],
            raw: { weight, errorRate, avgTime, shown, correct, wrong }
        });
    }

    if (points.length === 0) return [];

    // Min-max нормализация по каждому признаку
    const dims = points[0].rawFeatures.length;
    const mins = new Array(dims).fill(Infinity);
    const maxs = new Array(dims).fill(-Infinity);
    points.forEach(p => {
        for (let d = 0; d < dims; d++) {
            if (p.rawFeatures[d] < mins[d]) mins[d] = p.rawFeatures[d];
            if (p.rawFeatures[d] > maxs[d]) maxs[d] = p.rawFeatures[d];
        }
    });

    points.forEach(p => {
        p.features = p.rawFeatures.map((v, d) => {
            const range = maxs[d] - mins[d];
            return range > 0 ? (v - mins[d]) / range : 0;
        });
    });

    return points;
}

    function aiClusterWords() {
        const points = collectFeatures();
        if (points.length < CLUSTER_CONFIG.MIN_WORDS) return null;

        const result = kMeans(points, CLUSTER_CONFIG.K, CLUSTER_CONFIG.MAX_ITER);
        if (!result) return null;

        const clusterStats = [];
        for (let c = 0; c < CLUSTER_CONFIG.K; c++) {
            const clusterPoints = points.filter((_, i) => result.assignments[i] === c);
            if (clusterPoints.length === 0) continue;
            const avgWeight = clusterPoints.reduce((s, p) => s + p.raw.weight, 0) / clusterPoints.length;
            const avgError = clusterPoints.reduce((s, p) => s + p.raw.errorRate, 0) / clusterPoints.length;
            clusterStats.push({
                cluster: c,
                avgWeight: avgWeight,
                avgError: avgError,
                words: clusterPoints
            });
        }
        clusterStats.sort((a, b) => a.avgWeight - b.avgWeight);

                const labelSets = { 1: ['medium'], 2: ['easy', 'hard'], 3: ['easy', 'medium', 'hard'] };
        const labels = labelSets[clusterStats.length] || ['easy', 'medium', 'hard'];
        const clusters = {};
        clusterStats.forEach((stat, i) => {
            clusters[labels[i]] = {
                words: stat.words.map(p => p.key),
                avgWeight: stat.avgWeight,
                avgError: stat.avgError,
                count: stat.words.length
            };
        });

        try {
            localStorage.setItem(CLUSTER_CONFIG.STORAGE_KEY, JSON.stringify({
                clusters: clusters,
                silhouette: result.silhouette,
                timestamp: Date.now(),
                totalWords: points.length
            }));
        } catch (e) {}

        return {
            clusters: clusters,
            silhouette: result.silhouette,
            totalWords: points.length
        };
    }

    function aiGetWordLevel(theme, word) {
        const cached = localStorage.getItem(CLUSTER_CONFIG.STORAGE_KEY);
        if (!cached) return null;
        try {
            const data = JSON.parse(cached);
            const key = theme + '_' + word.toLowerCase();
            for (const level in data.clusters) {
                if (data.clusters[level].words.includes(key)) {
                    return level;
                }
            }
        } catch (e) {}
        return null;
    }

    function aiGetRecommendations(limit) {
        const result = aiClusterWords();
        if (!result) return [];

        const hard = result.clusters.hard ? result.clusters.hard.words : [];
        const medium = result.clusters.medium ? result.clusters.medium.words : [];

        const recommendations = [];
        hard.forEach(key => {
            const parts = key.split('_');
            recommendations.push({ theme: parts[0], word: parts[1], level: 'hard', priority: 1 });
        });
        medium.forEach(key => {
            const parts = key.split('_');
            recommendations.push({ theme: parts[0], word: parts[1], level: 'medium', priority: 2 });
        });

        recommendations.sort((a, b) => a.priority - b.priority);
        return recommendations.slice(0, limit || 10);
    }

    function aiRenderClusters() {
        const content = document.getElementById('aiClusterContent');
        if (!content) return;

        const result = aiClusterWords();
        if (!result) {
            content.innerHTML = '<div style="color:#999; font-size:13px;">Need at least ' + CLUSTER_CONFIG.MIN_WORDS + ' words with data. Play more games!</div>';
            return;
        }

        const labels = {
            easy:   { name: '🟢 Easy',   color: '#2ecc71' },
            medium: { name: '🟡 Medium', color: '#f39c12' },
            hard:   { name: '🔴 Hard',   color: '#e74c3c' }
        };

        let html = '';
        html += '<div style="margin-bottom: 12px; color: #333; font-size: 13px; font-weight: 600;">';
        html += result.totalWords + ' words clustered into 3 groups';
        html += '</div>';

        html += '<div style="margin-bottom: 12px; padding: 8px 12px; background: rgba(91,200,232,0.15); border-radius: 10px; font-size: 12px; color: #1a1a2e;">';
        html += '<b>Silhouette score:</b> ' + result.silhouette.toFixed(3);
        html += '</div>';

        ['easy', 'medium', 'hard'].forEach(function(level) {
            const c = result.clusters[level];
            if (!c || c.count === 0) return;
            const info = labels[level];

            html += '<div style="margin: 10px 0 6px 0; padding: 8px 12px; background: ' + info.color + '22; border-left: 4px solid ' + info.color + '; border-radius: 8px;">';
            html += '<div style="font-weight: 700; color: #1a1a2e; font-size: 13px;">' + info.name + ' <span style="color:#666; font-weight:600;">(' + c.count + ' words)</span></div>';
            html += '<div style="font-size: 11px; color: #666; margin-top: 2px;">Avg weight: ' + c.avgWeight.toFixed(2) + ' · Avg error rate: ' + (c.avgError * 100).toFixed(0) + '%</div>';
            html += '</div>';

            html += '<div style="font-size: 12px; color: #333; margin-bottom: 8px; padding-left: 4px;">';
            html += c.words.map(function(k) {
            return k.split('_')[1];
            }).join(', ');
            html += '</div>';
        });

        html += '<div style="margin-top:14px; padding-top:10px; border-top: 1px solid rgba(0,0,0,0.08); font-size:11px; color:#999; line-height:1.6;">';
        html += '<b>Algorithm:</b> k-means (k=3, seed=' + CLUSTER_CONFIG.SEED + ')<br>';
        html += 'Features: weight · error rate · avg response time';
        html += '</div>';

        content.innerHTML = html;
    }

    window.AICluster = {
        cluster: aiClusterWords,
        getLevel: aiGetWordLevel,
        getRecommendations: aiGetRecommendations,
        render: aiRenderClusters
    };

    // Сброс кластеров (только localStorage — кэша в памяти нет)
    window.aiResetClusters = function() {
        localStorage.removeItem(CLUSTER_CONFIG.STORAGE_KEY);
        console.log('[AI-Cluster] Кластеры сброшены');
    };

    console.log('[AI-Cluster] Модуль загружен (k-means, k=3, silhouette)');
})();
