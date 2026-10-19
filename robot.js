// =====================================================
// ROBOT.JS v13.5 — без скейта
// =====================================================
// Изменения в v13.5:
// - 🛹 СКЕЙТ: удалён полностью
// - 🎵 Дирижирование: палочка в кисти правой руки
// - 📸 Фото: руки держат фотоаппарат
// - 🎣 Рыбалка: удалена
// =====================================================

class Robot {
  constructor(containerId, options = {}) {
    this.container = document.getElementById(containerId);
    if (!this.container) {
      console.warn('Robot: контейнер не найден:', containerId);
      return;
    }
    this.size = options.size || 200;
    this.color = options.color || '#c8d2de';
    this.accent = options.accent || '#5bc8e8';
    this.dark = options.dark || '#2c3e50';
    this.state = 'idle';
    this._timers = [];
    this._intervals = [];
    this._uid = Math.random().toString(36).slice(2, 8);
    this._lastIdleAction = -1;
    this._ambientFrame = null;
    this._isDestroyed = false;
    this._render();
    this._bindInteractions();
    this.idle();
    this._startAmbient();
  }

  _render() {
    const s = this.size;
    const uid = this._uid;
    const svg = `
<svg class="robot-svg" viewBox="0 0 200 260" width="${s}" height="${Math.round(s * 1.3)}"
     xmlns="http://www.w3.org/2000/svg" aria-label="Robot mascot">
  <defs>
    <linearGradient id="metalMain-${uid}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#fafcff"/>
      <stop offset="20%" stop-color="#e2eaf3"/>
      <stop offset="60%" stop-color="${this.color}"/>
      <stop offset="100%" stop-color="#8b98a8"/>
    </linearGradient>
    <linearGradient id="metalDark-${uid}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#7a8697"/>
      <stop offset="100%" stop-color="#364556"/>
    </linearGradient>
    <linearGradient id="metalSide-${uid}" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#6a7a8c"/>
      <stop offset="25%" stop-color="${this.color}"/>
      <stop offset="50%" stop-color="#eef4fa"/>
      <stop offset="75%" stop-color="${this.color}"/>
      <stop offset="100%" stop-color="#6a7a8c"/>
    </linearGradient>
    <radialGradient id="coreGlow-${uid}" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="30%" stop-color="#b8ecff"/>
      <stop offset="65%" stop-color="${this.accent}"/>
      <stop offset="100%" stop-color="#1a6b8a"/>
    </radialGradient>
    <radialGradient id="coreHalo-${uid}" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="${this.accent}" stop-opacity="0.9"/>
      <stop offset="100%" stop-color="${this.accent}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="eyeGlass-${uid}" cx="40%" cy="30%" r="70%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="50%" stop-color="#eaf2fa"/>
      <stop offset="100%" stop-color="#b0c0d0"/>
    </radialGradient>
    <radialGradient id="eyeIris-${uid}" cx="40%" cy="35%" r="70%">
      <stop offset="0%" stop-color="#8ee0f5"/>
      <stop offset="55%" stop-color="#2f7ea0"/>
      <stop offset="100%" stop-color="#0d2535"/>
    </radialGradient>
    <linearGradient id="headShine-${uid}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.8"/>
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
    </linearGradient>
    <radialGradient id="shadowGrad-${uid}" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#000000" stop-opacity="0.32"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="sparkGrad-${uid}" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="40%" stop-color="#ffe98a"/>
      <stop offset="100%" stop-color="#ffb84a" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="bubbleGrad-${uid}" cx="40%" cy="35%" r="60%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.9"/>
      <stop offset="60%" stop-color="#a8e8ff" stop-opacity="0.5"/>
      <stop offset="100%" stop-color="#5bc8e8" stop-opacity="0.1"/>
    </radialGradient>
    <radialGradient id="appleGrad-${uid}" cx="35%" cy="30%" r="70%">
      <stop offset="0%" stop-color="#ff8a7a"/>
      <stop offset="60%" stop-color="#e74c3c"/>
      <stop offset="100%" stop-color="#8a1a1a"/>
    </radialGradient>
    <linearGradient id="appleLeaf-${uid}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#7ee787"/>
      <stop offset="100%" stop-color="#2e8b47"/>
    </linearGradient>
    <radialGradient id="ballGrad-${uid}" cx="35%" cy="30%" r="70%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="40%" stop-color="#ff9a9e"/>
      <stop offset="100%" stop-color="#c0392b"/>
    </radialGradient>
    <radialGradient id="pizzaGrad-${uid}" cx="40%" cy="35%" r="70%">
      <stop offset="0%" stop-color="#ffd97a"/>
      <stop offset="60%" stop-color="#f39c12"/>
      <stop offset="100%" stop-color="#8a5a1a"/>
    </radialGradient>
    <radialGradient id="donutGrad-${uid}" cx="35%" cy="30%" r="70%">
      <stop offset="0%" stop-color="#ffd0e0"/>
      <stop offset="60%" stop-color="#e84393"/>
      <stop offset="100%" stop-color="#8a1a4a"/>
    </radialGradient>
    <linearGradient id="boxGrad-${uid}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#d4a373"/>
      <stop offset="100%" stop-color="#8a5a2a"/>
    </linearGradient>
    <filter id="glow-${uid}" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="2.5" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <filter id="softShadow-${uid}" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur in="SourceAlpha" stdDeviation="2"/>
      <feOffset dx="0" dy="3" result="off"/>
      <feComponentTransfer><feFuncA type="linear" slope="0.22"/></feComponentTransfer>
      <feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <filter id="coreBlur-${uid}" x="-100%" y="-100%" width="300%" height="300%">
      <feGaussianBlur stdDeviation="5"/>
    </filter>
    <filter id="sparkGlow-${uid}" x="-100%" y="-100%" width="300%" height="300%">
      <feGaussianBlur stdDeviation="1.5"/>
    </filter>
  </defs>

  <ellipse class="robot-shadow" cx="100" cy="252" rx="48" ry="6"
           fill="url(#shadowGrad-${uid})"/>

  <!-- ЯБЛОКО -->
  <g class="apple" opacity="0" style="transform-box: fill-box;">
    <path d="M 165 195 Q 168 190 170 185" stroke="#5a3a1a" stroke-width="2" fill="none" stroke-linecap="round"/>
    <path d="M 168 190 Q 175 186 180 190 Q 174 194 168 190 Z" fill="url(#appleLeaf-${uid})"/>
    <circle cx="165" cy="207" r="10" fill="url(#appleGrad-${uid})"/>
    <ellipse cx="161" cy="202" rx="3.5" ry="5" fill="#ffffff" opacity="0.5"/>
  </g>

  <!-- МЯЧ -->
  <g class="ball" opacity="0" style="transform-box: fill-box;">
    <circle cx="165" cy="220" r="12" fill="url(#ballGrad-${uid})"/>
    <path d="M 155 220 Q 165 212 175 220" stroke="#ffffff" stroke-width="1.5" fill="none" opacity="0.6"/>
    <path d="M 155 220 Q 165 228 175 220" stroke="#ffffff" stroke-width="1.5" fill="none" opacity="0.6"/>
    <ellipse cx="161" cy="215" rx="3" ry="4" fill="#ffffff" opacity="0.7"/>
  </g>

  <!-- ПИЦЦА -->
  <g class="pizza" opacity="0" style="transform-box: fill-box;">
    <path d="M 160 200 L 185 220 L 160 230 Z" fill="url(#pizzaGrad-${uid})"/>
    <circle cx="170" cy="218" r="2" fill="#e74c3c"/>
    <circle cx="178" cy="222" r="2" fill="#e74c3c"/>
    <circle cx="165" cy="224" r="1.5" fill="#2ecc71"/>
    <circle cx="175" cy="215" r="1.5" fill="#2ecc71"/>
  </g>

  <!-- ПОНЧИК -->
  <g class="donut" opacity="0" style="transform-box: fill-box;">
    <circle cx="170" cy="215" r="14" fill="url(#donutGrad-${uid})"/>
    <circle cx="170" cy="215" r="5" fill="#ffffff"/>
    <circle cx="163" cy="208" r="1.5" fill="#ffffff"/>
    <circle cx="177" cy="208" r="1.5" fill="#ffffff"/>
    <circle cx="163" cy="222" r="1.5" fill="#ffffff"/>
    <circle cx="177" cy="222" r="1.5" fill="#ffffff"/>
    <circle cx="170" cy="203" r="1.5" fill="#2ecc71"/>
    <circle cx="170" cy="227" r="1.5" fill="#f5c842"/>
  </g>

  <!-- КОРОБКА -->
  <g class="box" opacity="0" style="transform-box: fill-box;">
    <rect x="155" y="200" width="30" height="30" rx="3" fill="url(#boxGrad-${uid})"/>
    <line x1="155" y1="210" x2="185" y2="210" stroke="#5a3a1a" stroke-width="1.5"/>
    <line x1="170" y1="200" x2="170" y2="230" stroke="#5a3a1a" stroke-width="1.5"/>
  </g>

  <g class="robot-root" filter="url(#softShadow-${uid})">

    <!-- ЛЕВАЯ НОГА -->
    <g class="leg leg-left">
      <g class="leg-content">
        <rect x="79" y="192" width="16" height="22" rx="6"
              fill="url(#metalSide-${uid})" stroke="${this.dark}" stroke-width="1"/>
        <circle cx="87" cy="197" r="1.3" fill="${this.dark}" opacity="0.6"/>
        <circle cx="87" cy="215" r="7.5" fill="url(#metalDark-${uid})"/>
        <circle cx="87" cy="215" r="2.5" fill="#1a2a3a"/>
        <rect x="81" y="218" width="12" height="8" rx="3"
              fill="url(#metalSide-${uid})" stroke="${this.dark}" stroke-width="0.8"/>
        <ellipse cx="87" cy="230" rx="14" ry="6" fill="url(#metalDark-${uid})"/>
        <ellipse cx="87" cy="228" rx="11" ry="3.5" fill="${this.color}" opacity="0.55"/>
        <ellipse cx="85" cy="227.5" rx="5" ry="1.8" fill="#ffffff" opacity="0.5"/>
      </g>
    </g>

    <!-- ПРАВАЯ НОГА -->
    <g class="leg leg-right">
      <g class="leg-content">
        <rect x="105" y="192" width="16" height="22" rx="6"
              fill="url(#metalSide-${uid})" stroke="${this.dark}" stroke-width="1"/>
        <circle cx="113" cy="197" r="1.3" fill="${this.dark}" opacity="0.6"/>
        <circle cx="113" cy="215" r="7.5" fill="url(#metalDark-${uid})"/>
        <circle cx="113" cy="215" r="2.5" fill="#1a2a3a"/>
        <rect x="107" y="218" width="12" height="8" rx="3"
              fill="url(#metalSide-${uid})" stroke="${this.dark}" stroke-width="0.8"/>
        <ellipse cx="113" cy="230" rx="14" ry="6" fill="url(#metalDark-${uid})"/>
        <ellipse cx="113" cy="228" rx="11" ry="3.5" fill="${this.color}" opacity="0.55"/>
        <ellipse cx="111" cy="227.5" rx="5" ry="1.8" fill="#ffffff" opacity="0.5"/>
      </g>
    </g>

    <!-- ЛЕВАЯ РУКА -->
    <g class="arm arm-left">
      <circle cx="68" cy="138" r="8" fill="url(#metalDark-${uid})"/>
      <circle cx="68" cy="138" r="3" fill="#1a2a3a"/>
      <circle cx="66.5" cy="136.5" r="1.2" fill="#ffffff" opacity="0.6"/>
      <g class="arm-content">
        <rect x="60" y="144" width="15" height="30" rx="7"
              fill="url(#metalSide-${uid})" stroke="${this.dark}" stroke-width="1"/>
        <rect x="63" y="147" width="3.5" height="22" rx="1.75" fill="#ffffff" opacity="0.5"/>
        <circle cx="67.5" cy="155" r="1.2" fill="${this.dark}" opacity="0.5"/>
        <circle cx="67.5" cy="170" r="1.2" fill="${this.dark}" opacity="0.5"/>
        <ellipse class="hand hand-left" cx="67.5" cy="178" rx="8" ry="7" fill="url(#metalDark-${uid})"/>
        <ellipse cx="67.5" cy="177" rx="5" ry="4" fill="${this.color}" opacity="0.5"/>
        <ellipse cx="66" cy="175.5" rx="2" ry="1.2" fill="#ffffff" opacity="0.5"/>
      </g>
    </g>

    <!-- ПРАВАЯ РУКА -->
    <g class="arm arm-right">
      <circle cx="132" cy="138" r="8" fill="url(#metalDark-${uid})"/>
      <circle cx="132" cy="138" r="3" fill="#1a2a3a"/>
      <circle cx="130.5" cy="136.5" r="1.2" fill="#ffffff" opacity="0.6"/>
      <g class="arm-content">
        <rect x="125" y="144" width="15" height="30" rx="7"
              fill="url(#metalSide-${uid})" stroke="${this.dark}" stroke-width="1"/>
        <rect x="128" y="147" width="3.5" height="22" rx="1.75" fill="#ffffff" opacity="0.5"/>
        <circle cx="132.5" cy="155" r="1.2" fill="${this.dark}" opacity="0.5"/>
        <circle cx="132.5" cy="170" r="1.2" fill="${this.dark}" opacity="0.5"/>
        <ellipse class="hand hand-right" cx="132.5" cy="178" rx="8" ry="7" fill="url(#metalDark-${uid})"/>
        <ellipse cx="132.5" cy="177" rx="5" ry="4" fill="${this.color}" opacity="0.5"/>
        <ellipse cx="131" cy="175.5" rx="2" ry="1.2" fill="#ffffff" opacity="0.5"/>
      </g>
    </g>

    <!-- ТЕЛО -->
    <g class="body-group">
      <rect x="68" y="122" width="64" height="78" rx="22"
            fill="url(#metalMain-${uid})" stroke="${this.dark}" stroke-width="1.5"/>
      <ellipse cx="86" cy="130" rx="22" ry="5" fill="#ffffff" opacity="0.42"/>
      <line x1="72" y1="184" x2="128" y2="184"
            stroke="${this.dark}" stroke-width="1.2" opacity="0.5"/>
      <circle cx="76" cy="184" r="1.3" fill="${this.dark}" opacity="0.7"/>
      <circle cx="124" cy="184" r="1.3" fill="${this.dark}" opacity="0.7"/>
      <line x1="100" y1="126" x2="100" y2="134"
            stroke="${this.dark}" stroke-width="0.8" opacity="0.4"/>
      <line x1="120" y1="146" x2="124" y2="146" stroke="${this.dark}" stroke-width="1" opacity="0.5"/>
      <line x1="120" y1="150" x2="124" y2="150" stroke="${this.dark}" stroke-width="1" opacity="0.5"/>
      <line x1="120" y1="154" x2="124" y2="154" stroke="${this.dark}" stroke-width="1" opacity="0.5"/>

      <rect x="79" y="134" width="42" height="48" rx="13"
            fill="url(#metalDark-${uid})" opacity="0.85"/>
      <circle cx="84" cy="140" r="1.7" fill="#1a2a3a"/>
      <circle cx="116" cy="140" r="1.7" fill="#1a2a3a"/>
      <circle cx="84" cy="176" r="1.7" fill="#1a2a3a"/>
      <circle cx="116" cy="176" r="1.7" fill="#1a2a3a"/>

      <circle class="core-halo" cx="100" cy="158" r="20"
              fill="url(#coreHalo-${uid})" filter="url(#coreBlur-${uid})" opacity="0.7"/>
      <circle class="core" cx="100" cy="158" r="11"
              fill="url(#coreGlow-${uid})" filter="url(#glow-${uid})"/>
      <circle class="core-ring" cx="100" cy="158" r="14"
              fill="none" stroke="${this.accent}" stroke-width="1.2" opacity="0.7"/>
      <circle cx="97" cy="155" r="3" fill="#ffffff" opacity="0.9"/>

      <g class="core-particles" opacity="0.9">
        <circle class="particle p1" cx="100" cy="145" r="1.6" fill="#b8ecff" filter="url(#sparkGlow-${uid})"/>
        <circle class="particle p2" cx="113" cy="158" r="1.8" fill="#8ee0f5" filter="url(#sparkGlow-${uid})"/>
        <circle class="particle p3" cx="100" cy="171" r="1.5" fill="#ffffff" filter="url(#sparkGlow-${uid})"/>
        <circle class="particle p4" cx="87"  cy="158" r="1.7" fill="#b8ecff" filter="url(#sparkGlow-${uid})"/>
        <circle class="particle p5" cx="108" cy="150" r="1.2" fill="#ffffff" opacity="0.8"/>
        <circle class="particle p6" cx="92"  cy="166" r="1.2" fill="#ffffff" opacity="0.8"/>
      </g>

      <circle cx="86" cy="142" r="1.8" fill="${this.accent}"/>
      <circle cx="114" cy="142" r="1.8" fill="#7ee787"/>
      <circle cx="86" cy="174" r="1.8" fill="#ffb86c"/>
      <circle cx="114" cy="174" r="1.8" fill="#ff6b6b"/>
    </g>

    <!-- ШЕЯ -->
    <rect x="92" y="114" width="16" height="14" rx="4"
          fill="url(#metalDark-${uid})" opacity="0.9"/>
    <line x1="94" y1="120" x2="106" y2="120"
          stroke="${this.dark}" stroke-width="0.8" opacity="0.5"/>

    <!-- ГОЛОВА -->
    <g class="head">
      <g class="antenna antenna-top">
        <line x1="100" y1="54" x2="100" y2="38"
              stroke="${this.dark}" stroke-width="2.5" stroke-linecap="round"/>
        <circle cx="100" cy="34" r="6" fill="${this.accent}" filter="url(#glow-${uid})"/>
        <circle cx="97.5" cy="31.5" r="1.8" fill="#ffffff" opacity="0.9"/>
      </g>
      <g class="antenna antenna-left">
        <line x1="62" y1="78" x2="48" y2="64"
              stroke="${this.dark}" stroke-width="2" stroke-linecap="round"/>
        <circle cx="46" cy="62" r="4" fill="${this.accent}" filter="url(#glow-${uid})"/>
        <circle cx="44.5" cy="60.5" r="1.2" fill="#ffffff" opacity="0.9"/>
      </g>
      <g class="antenna antenna-right">
        <line x1="138" y1="78" x2="152" y2="64"
              stroke="${this.dark}" stroke-width="2" stroke-linecap="round"/>
        <circle cx="154" cy="62" r="4" fill="${this.accent}" filter="url(#glow-${uid})"/>
        <circle cx="152.5" cy="60.5" r="1.2" fill="#ffffff" opacity="0.9"/>
      </g>

      <ellipse cx="58" cy="96" rx="7" ry="9" fill="url(#metalDark-${uid})"/>
      <ellipse cx="58" cy="96" rx="4" ry="5" fill="${this.accent}" opacity="0.45"/>
      <circle cx="58" cy="96" r="1.3" fill="#0a1520" opacity="0.6"/>
      <ellipse cx="142" cy="96" rx="7" ry="9" fill="url(#metalDark-${uid})"/>
      <ellipse cx="142" cy="96" rx="4" ry="5" fill="${this.accent}" opacity="0.45"/>
      <circle cx="142" cy="96" r="1.3" fill="#0a1520" opacity="0.6"/>

      <ellipse cx="100" cy="88" rx="45" ry="40"
               fill="url(#metalMain-${uid})" stroke="${this.dark}" stroke-width="1.5"/>
      <ellipse cx="90" cy="62" rx="24" ry="8" fill="url(#headShine-${uid})"/>
      <path d="M 62 82 Q 100 92 138 82"
            stroke="${this.dark}" stroke-width="0.8" fill="none" opacity="0.3"/>
      <circle cx="70" cy="80" r="1.2" fill="${this.dark}" opacity="0.5"/>
      <circle cx="130" cy="80" r="1.2" fill="${this.dark}" opacity="0.5"/>

      <g class="eye eye-left">
        <ellipse cx="82" cy="106" rx="10" ry="2" fill="${this.dark}" opacity="0.15"/>
        <ellipse cx="82" cy="92" rx="14" ry="15" fill="url(#metalDark-${uid})"/>
        <ellipse cx="82" cy="92" rx="11.5" ry="12.5"
                 fill="url(#eyeGlass-${uid})" stroke="#8a9ba8" stroke-width="0.7"/>
        <ellipse class="iris" cx="82" cy="93" rx="9.5" ry="10.5" fill="url(#eyeIris-${uid})"/>
        <ellipse class="pupil" cx="82" cy="93" rx="7.5" ry="8.5" fill="#0a1520"/>
        <ellipse class="eye-shine-big" cx="78.5" cy="88" rx="3.5" ry="3.8" fill="#ffffff" opacity="0.98"/>
        <ellipse class="eye-shine-sm" cx="86" cy="99" rx="1.5" ry="1.5" fill="#ffffff" opacity="0.85"/>
        <path class="eyelid eyelid-left"
              d="M 68 92 Q 82 78 96 92 L 96 72 L 68 72 Z"
              fill="url(#metalMain-${uid})" opacity="0"/>
      </g>

      <g class="eye eye-right">
        <ellipse cx="118" cy="106" rx="10" ry="2" fill="${this.dark}" opacity="0.15"/>
        <ellipse cx="118" cy="92" rx="14" ry="15" fill="url(#metalDark-${uid})"/>
        <ellipse cx="118" cy="92" rx="11.5" ry="12.5"
                 fill="url(#eyeGlass-${uid})" stroke="#8a9ba8" stroke-width="0.7"/>
        <ellipse class="iris" cx="118" cy="93" rx="9.5" ry="10.5" fill="url(#eyeIris-${uid})"/>
        <ellipse class="pupil" cx="118" cy="93" rx="7.5" ry="8.5" fill="#0a1520"/>
        <ellipse class="eye-shine-big" cx="114.5" cy="88" rx="3.5" ry="3.8" fill="#ffffff" opacity="0.98"/>
        <ellipse class="eye-shine-sm" cx="122" cy="99" rx="1.5" ry="1.5" fill="#ffffff" opacity="0.85"/>
        <path class="eyelid eyelid-right"
              d="M 104 92 Q 118 78 132 92 L 132 72 L 104 72 Z"
              fill="url(#metalMain-${uid})" opacity="0"/>
      </g>

      <ellipse class="cheek cheek-left" cx="65" cy="108" rx="7" ry="4" fill="#ff9a9e" opacity="0"/>
      <ellipse class="cheek cheek-right" cx="135" cy="108" rx="7" ry="4" fill="#ff9a9e" opacity="0"/>

      <path class="mouth" d="M 92 110 Q 100 118 108 110"
            stroke="${this.dark}" stroke-width="2" fill="none" stroke-linecap="round"/>

      <g class="tear" opacity="0">
        <ellipse cx="82" cy="108" rx="2.5" ry="3.4" fill="#7dd8f0" opacity="0.9"/>
        <ellipse cx="81.5" cy="107" rx="1.2" ry="1.6" fill="#ffffff" opacity="0.75"/>
      </g>

      <g class="star-eyes" opacity="0">
        <path d="M 78 86 L 80 92 L 86 92 L 81 96 L 83 102 L 78 98 L 73 102 L 75 96 L 70 92 L 76 92 Z" fill="#f5c842"/>
        <path d="M 114 86 L 116 92 L 122 92 L 117 96 L 119 102 L 114 98 L 109 102 L 111 96 L 106 92 L 112 92 Z" fill="#f5c842"/>
      </g>
    </g>

    <!-- Предметы в руках (палочка, фотоаппарат) -->
    <g class="hand-items-layer"></g>

    <!-- Эффекты -->
    <g class="effects-layer"></g>

  </g>
</svg>`;
    this.container.innerHTML = svg;
    this.svg = this.container.querySelector('.robot-svg');
    this.root = this.svg.querySelector('.robot-root');
    this.head = this.svg.querySelector('.head');
    this.bodyEl = this.svg.querySelector('.body-group');
    this.effectsLayer = this.svg.querySelector('.effects-layer');
    this.handItemsLayer = this.svg.querySelector('.hand-items-layer');
    this.eyes = this.svg.querySelectorAll('.eye');
    this.pupils = this.svg.querySelectorAll('.pupil');
    this.irises = this.svg.querySelectorAll('.iris');
    this.eyelids = this.svg.querySelectorAll('.eyelid');
    this.mouth = this.svg.querySelector('.mouth');
    this.cheeks = this.svg.querySelectorAll('.cheek');
    this.arms = {
      left:  this.svg.querySelector('.arm-left'),
      right: this.svg.querySelector('.arm-right')
    };
    this.armContents = {
      left:  this.svg.querySelector('.arm-left .arm-content'),
      right: this.svg.querySelector('.arm-right .arm-content')
    };
    this.hands = {
      left:  this.svg.querySelector('.hand-left'),
      right: this.svg.querySelector('.hand-right')
    };
    this.legs = {
      left:  this.svg.querySelector('.leg-left'),
      right: this.svg.querySelector('.leg-right')
    };
    this.legContents = {
      left:  this.svg.querySelector('.leg-left .leg-content'),
      right: this.svg.querySelector('.leg-right .leg-content')
    };
    this.antennas = this.svg.querySelectorAll('.antenna');
    this.core = this.svg.querySelector('.core');
    this.coreHalo = this.svg.querySelector('.core-halo');
    this.coreRing = this.svg.querySelector('.core-ring');
    this.coreParticles = this.svg.querySelectorAll('.particle');
    this.shadow = this.svg.querySelector('.robot-shadow');
    this.tear = this.svg.querySelector('.tear');
    this.apple = this.svg.querySelector('.apple');
    this.ball = this.svg.querySelector('.ball');
    this.pizza = this.svg.querySelector('.pizza');
    this.donut = this.svg.querySelector('.donut');
    this.box = this.svg.querySelector('.box');
    this.starEyes = this.svg.querySelector('.star-eyes');

    this._applyTransformBox(this.armContents.left,  '50% 0%');
    this._applyTransformBox(this.armContents.right, '50% 0%');
    this._applyTransformBox(this.legContents.left,  '50% 0%');
    this._applyTransformBox(this.legContents.right, '50% 0%');
    this._applyTransformBox(this.pupils[0], '50% 50%');
    this._applyTransformBox(this.pupils[1], '50% 50%');
    this._applyTransformBox(this.irises[0], '50% 50%');
    this._applyTransformBox(this.irises[1], '50% 50%');
    this._applyTransformBox(this.eyes[0], '50% 50%');
    this._applyTransformBox(this.eyes[1], '50% 50%');
    this._applyTransformBox(this.core,      '50% 50%');
    this._applyTransformBox(this.coreHalo,  '50% 50%');
    this._applyTransformBox(this.head, '50% 100%');
    this.antennas.forEach(a => this._applyTransformBox(a, '50% 100%'));
  }

  _applyTransformBox(el, origin) {
    if (!el) return;
    el.style.transformBox = 'fill-box';
    el.style.transformOrigin = origin;
  }

  _clearTimers() {
    this._timers.forEach(t => clearTimeout(t));
    this._timers = [];
    this._intervals.forEach(i => clearInterval(i));
    this._intervals = [];
  }

  _schedule(fn, delay) {
    if (this._isDestroyed) return null;
    const id = setTimeout(fn, delay);
    this._timers.push(id);
    return id;
  }

  // ==================== ЭФФЕКТЫ ====================
  _startAmbient() {
    if (!this.coreParticles || !this.coreParticles.length) return;
    const centerX = 100, centerY = 158;
    const startTime = performance.now();
    const animate = (time) => {
      if (this._isDestroyed) return;
      const t = (time - startTime) / 1000;
      this.coreParticles.forEach((p, i) => {
        const angle = t * (0.8 + i * 0.15) + (i * Math.PI / 3);
        const radius = 16 + Math.sin(t * 1.5 + i) * 3;
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius * 0.6;
        p.setAttribute('cx', x.toFixed(2));
        p.setAttribute('cy', y.toFixed(2));
        const opacity = 0.6 + Math.sin(t * 3 + i) * 0.4;
        p.setAttribute('opacity', opacity.toFixed(2));
      });
      this._ambientFrame = requestAnimationFrame(animate);
    };
    this._ambientFrame = requestAnimationFrame(animate);
  }

  _spawnSparks(count = 6) {
    if (!this.effectsLayer) return;
    for (let i = 0; i < count; i++) {
      const spark = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      const x = 80 + Math.random() * 40;
      const y = 240;
      const r = 1.5 + Math.random() * 1.5;
      spark.setAttribute('cx', x);
      spark.setAttribute('cy', y);
      spark.setAttribute('r', r);
      spark.setAttribute('fill', Math.random() < 0.5 ? '#ffe98a' : '#ffb84a');
      spark.setAttribute('filter', `url(#sparkGlow-${this._uid})`);
      this.effectsLayer.appendChild(spark);
      const dx = (Math.random() - 0.5) * 30;
      const dy = -15 - Math.random() * 25;
      const duration = 600 + Math.random() * 300;
      spark.animate([
        { transform: 'translate(0, 0) scale(1)', opacity: 1 },
        { transform: `translate(${dx}px, ${dy}px) scale(0)`, opacity: 0 }
      ], { duration, easing: 'cubic-bezier(0.2, 0.7, 0.3, 1)' });
      setTimeout(() => spark.remove(), duration + 50);
    }
  }

  _spawnStars(count = 6) {
    if (!this.effectsLayer) return;
    for (let i = 0; i < count; i++) {
      const star = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      const size = 5 + Math.random() * 4;
      const pts = [];
      for (let k = 0; k < 10; k++) {
        const angle = (Math.PI / 5) * k - Math.PI / 2;
        const rad = k % 2 === 0 ? size : size * 0.45;
        pts.push(`${(Math.cos(angle) * rad).toFixed(2)},${(Math.sin(angle) * rad).toFixed(2)}`);
      }
      star.setAttribute('d', `M${pts.join(' L')} Z`);
      star.setAttribute('fill', '#ffe98a');
      star.setAttribute('filter', `url(#sparkGlow-${this._uid})`);
      const startX = 100 + (Math.random() - 0.5) * 60;
      const startY = 60 + Math.random() * 20;
      const dx = (Math.random() - 0.5) * 80;
      const dy = -40 - Math.random() * 30;
      const rotate = (Math.random() - 0.5) * 720;
      const duration = 1200 + Math.random() * 400;
      this.effectsLayer.appendChild(star);
      star.animate([
        { transform: `translate(${startX}px, ${startY}px) rotate(0deg) scale(0)`, opacity: 0 },
        { transform: `translate(${startX}px, ${startY}px) rotate(${rotate * 0.3}deg) scale(1.2)`, opacity: 1, offset: 0.25 },
        { transform: `translate(${startX + dx}px, ${startY + dy}px) rotate(${rotate}deg) scale(0)`, opacity: 0 }
      ], { duration, easing: 'ease-out' });
      setTimeout(() => star.remove(), duration + 50);
    }
  }

  _spawnBubbles(count = 3) {
    if (!this.effectsLayer) return;
    for (let i = 0; i < count; i++) {
      const bubble = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      const x = 60 + Math.random() * 80;
      const y = 180 + Math.random() * 40;
      const r = 2 + Math.random() * 2;
      bubble.setAttribute('cx', x);
      bubble.setAttribute('cy', y);
      bubble.setAttribute('r', r);
      bubble.setAttribute('fill', 'url(#bubbleGrad-' + this._uid + ')');
      bubble.setAttribute('stroke', '#a8e8ff');
      bubble.setAttribute('stroke-width', '0.5');
      bubble.setAttribute('stroke-opacity', '0.6');
      this.effectsLayer.appendChild(bubble);
      const dx = (Math.random() - 0.5) * 20;
      const dy = -30 - Math.random() * 20;
      const duration = 1500 + Math.random() * 800;
      bubble.animate([
        { transform: 'translate(0, 0) scale(0.5)', opacity: 0 },
        { transform: 'translate(0, -5px) scale(1)', opacity: 0.9, offset: 0.2 },
        { transform: `translate(${dx}px, ${dy}px) scale(0.8)`, opacity: 0 }
      ], { duration, easing: 'ease-out' });
      setTimeout(() => bubble.remove(), duration + 50);
    }
  }

  _spawnConfetti(count = 20) {
    if (!this.effectsLayer) return;
    const colors = ['#ff6b6b', '#f5c842', '#2ecc71', '#3498db', '#9b59b6', '#e84393', '#ffb86c'];
    for (let i = 0; i < count; i++) {
      const confetti = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      const x = 100 + (Math.random() - 0.5) * 100;
      const y = -20;
      confetti.setAttribute('x', x);
      confetti.setAttribute('y', y);
      confetti.setAttribute('width', 4 + Math.random() * 4);
      confetti.setAttribute('height', 6 + Math.random() * 4);
      confetti.setAttribute('rx', 1);
      confetti.setAttribute('fill', colors[Math.floor(Math.random() * colors.length)]);
      this.effectsLayer.appendChild(confetti);
      const dx = (Math.random() - 0.5) * 120;
      const dy = 200 + Math.random() * 100;
      const rotate = (Math.random() - 0.5) * 1440;
      const duration = 2000 + Math.random() * 1500;
      confetti.animate([
        { transform: `translate(0, 0) rotate(0deg)`, opacity: 1 },
        { transform: `translate(${dx}px, ${dy}px) rotate(${rotate}deg)`, opacity: 0.3 }
      ], { duration, easing: 'cubic-bezier(0.3, 0.1, 0.7, 1)', fill: 'forwards' });
      setTimeout(() => confetti.remove(), duration + 50);
    }
  }

  _spawnHeart() {
    if (!this.effectsLayer) return;
    const heart = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    heart.setAttribute('d', 'M 0 3 A 3 3 0 0 1 6 3 A 3 3 0 0 1 12 3 Q 12 8 6 13 Q 0 8 0 3 Z');
    heart.setAttribute('fill', '#e74c3c');
    heart.setAttribute('transform', 'translate(100, 50) scale(0)');
    this.effectsLayer.appendChild(heart);
    heart.animate([
      { transform: 'translate(100px, 50px) scale(0)', opacity: 0 },
      { transform: 'translate(100px, 30px) scale(1.5)', opacity: 1, offset: 0.3 },
      { transform: 'translate(100px, -10px) scale(1)', opacity: 0 }
    ], { duration: 1500, easing: 'ease-out' });
    setTimeout(() => heart.remove(), 1550);
  }

  // ==================== ПОКАЗ/СКРЫТИЕ ПРЕДМЕТОВ ====================
  _showItem(el, fromTransform, midTransform) {
    if (!el) return;
    el.setAttribute('opacity', '0');
    el.animate([
      { opacity: 0, transform: fromTransform },
      { opacity: 1, transform: midTransform },
      { opacity: 1, transform: 'scale(1)' }
    ], { duration: 500, fill: 'forwards', easing: 'ease-out' });
  }

  _hideItem(el, toTransform) {
    if (!el) return;
    el.animate([
      { opacity: 1, transform: 'scale(1)' },
      { opacity: 0, transform: toTransform }
    ], { duration: 400, fill: 'forwards', easing: 'ease-in' });
  }

  _showApple()      { this._showItem(this.apple, 'scale(0) translateY(-20px)', 'scale(1.15) translateY(0)'); }
  _hideApple()      { this._hideItem(this.apple, 'scale(0.5)'); }
  _showBall()       { this._showItem(this.ball, 'scale(0) translateX(30px)', 'scale(1.2) translateX(0)'); }
  _hideBall()       { this._hideItem(this.ball, 'scale(0.4) translateX(40px)'); }
  _showPizza()      { this._showItem(this.pizza, 'scale(0) rotate(-30deg)', 'scale(1.15) rotate(0deg)'); }
  _hidePizza()      { this._hideItem(this.pizza, 'scale(0.5) rotate(20deg)'); }
  _showDonut()      { this._showItem(this.donut, 'scale(0) rotate(180deg)', 'scale(1.15) rotate(0deg)'); }
  _hideDonut()      { this._hideItem(this.donut, 'scale(0.5) rotate(-180deg)'); }
  _showBox()        { this._showItem(this.box, 'translateY(-40px) scale(0.5)', 'translateY(0) scale(1.1)'); }
  _hideBox()        { this._hideItem(this.box, 'translateY(-30px) scale(0.6)'); }

  // ==================== ХОДЬБА ====================
  _walk(steps = 4, direction = 'right', speed = 300) {
    const stepDistance = 6;
    const sign = direction === 'right' ? 1 : -1;
    let currentX = 0;

    const currentTransform = this.root.getAttribute('transform') || '';
    const match = currentTransform.match(/translate\((-?\d+(?:\.\d+)?)[ ,]+(-?\d+(?:\.\d+)?)\)/);
    if (match) currentX = parseFloat(match[1]);

    for (let i = 0; i < steps; i++) {
      this._schedule(() => {
        if (this._isDestroyed) return;
        const newX = currentX + sign * stepDistance;
        currentX = newX;
        this.root.setAttribute('transform', `translate(${newX.toFixed(2)}, 0)`);

        const leftLegFirst = i % 2 === 0;
        this.legContents.left.animate([
          { transform: leftLegFirst ? 'rotate(-25deg)' : 'rotate(0deg)' },
          { transform: leftLegFirst ? 'rotate(0deg)' : 'rotate(-25deg)' }
        ], { duration: speed, easing: 'ease-in-out' });
        this.legContents.right.animate([
          { transform: leftLegFirst ? 'rotate(0deg)' : 'rotate(-25deg)' },
          { transform: leftLegFirst ? 'rotate(-25deg)' : 'rotate(0deg)' }
        ], { duration: speed, easing: 'ease-in-out' });

        this.bodyEl.animate([
          { transform: `rotate(${leftLegFirst ? -2 : 2}deg)` },
          { transform: `rotate(${leftLegFirst ? 2 : -2}deg)` }
        ], { duration: speed, easing: 'ease-in-out' });

        this.armContents.left.animate([
          { transform: leftLegFirst ? 'rotate(15deg)' : 'rotate(-15deg)' },
          { transform: leftLegFirst ? 'rotate(-15deg)' : 'rotate(15deg)' }
        ], { duration: speed, easing: 'ease-in-out' });
        this.armContents.right.animate([
          { transform: leftLegFirst ? 'rotate(-15deg)' : 'rotate(15deg)' },
          { transform: leftLegFirst ? 'rotate(15deg)' : 'rotate(-15deg)' }
        ], { duration: speed, easing: 'ease-in-out' });
      }, i * speed);
    }

    this._schedule(() => {
      this.legContents.left.animate([{ transform: 'rotate(0deg)' }], { duration: 200, fill: 'forwards' });
      this.legContents.right.animate([{ transform: 'rotate(0deg)' }], { duration: 200, fill: 'forwards' });
      this.bodyEl.animate([{ transform: 'rotate(0deg)' }], { duration: 200, fill: 'forwards' });
      this.armContents.left.animate([{ transform: 'rotate(0deg)' }], { duration: 200, fill: 'forwards' });
      this.armContents.right.animate([{ transform: 'rotate(0deg)' }], { duration: 200, fill: 'forwards' });
    }, steps * speed);
  }

  _returnHome(duration = 800) {
    this.root.removeAttribute('transform');
  }

  // ==================== СЦЕНА: ЯБЛОКО ====================
  _eatAppleScene() {
    if (this.state !== 'idle') return;

    this._showApple();

    this.pupils.forEach(p => p.setAttribute('transform', 'translate(4, 2)'));
    this.irises.forEach(p => p.setAttribute('transform', 'translate(4, 2)'));
    this.head.animate([
      { transform: 'rotate(0deg)' },
      { transform: 'rotate(-10deg)' }
    ], { duration: 600, fill: 'forwards', easing: 'ease-out' });

    this._schedule(() => {
      if (this.state !== 'idle') return;
      this.head.animate([
        { transform: 'rotate(-10deg)' },
        { transform: 'rotate(0deg)' }
      ], { duration: 400, fill: 'forwards', easing: 'ease-out' });
      this._walk(3, 'right', 280);
    }, 800);

    const walkEndTime = 800 + 3 * 280 + 400;
    this._schedule(() => {
      if (this.state !== 'idle') return;
      this.bodyEl.animate([
        { transform: 'rotate(0deg) translateY(0)' },
        { transform: 'rotate(8deg) translateY(4px)' }
      ], { duration: 400, fill: 'forwards', easing: 'ease-out' });
      this.armContents.right.animate([
        { transform: 'rotate(0deg)' },
        { transform: 'rotate(35deg)' }
      ], { duration: 500, fill: 'forwards', easing: 'ease-out' });
      this.pupils.forEach(p => p.setAttribute('transform', 'translate(2, 4)'));
      this.irises.forEach(p => p.setAttribute('transform', 'translate(2, 4)'));
    }, walkEndTime);

    this._schedule(() => {
      if (this.state !== 'idle') return;
      this._hideApple();
      this.armContents.right.animate([
        { transform: 'rotate(35deg)' },
        { transform: 'rotate(-40deg)' }
      ], { duration: 500, fill: 'forwards', easing: 'ease-out' });
      this.bodyEl.animate([
        { transform: 'rotate(8deg) translateY(4px)' },
        { transform: 'rotate(0deg) translateY(0)' }
      ], { duration: 500, fill: 'forwards', easing: 'ease-out' });
    }, walkEndTime + 600);

    const biteStart = walkEndTime + 1300;
    for (let i = 0; i < 3; i++) {
      this._schedule(() => {
        if (this.state !== 'idle') return;
        this.mouth.animate([
          { d: 'path("M 92 110 Q 100 118 108 110")' },
          { d: 'path("M 92 108 Q 100 122 108 108")' },
          { d: 'path("M 92 110 Q 100 118 108 110")' }
        ], { duration: 500, easing: 'ease-in-out' });
        this.armContents.right.animate([
          { transform: 'rotate(-40deg)' },
          { transform: 'rotate(-110deg)' },
          { transform: 'rotate(-40deg)' }
        ], { duration: 500, easing: 'ease-in-out' });
        this.eyelids.forEach(e => {
          e.animate([{ opacity: 0 }, { opacity: 0.6 }, { opacity: 0 }],
            { duration: 500, easing: 'ease-in-out' });
        });
      }, biteStart + i * 600);
    }

    this._schedule(() => {
      if (this.state !== 'idle') return;
      this._spawnStars(5);
      this.mouth.setAttribute('d', 'M 86 106 Q 100 126 114 106');
      this._schedule(() => {
        this.mouth.setAttribute('d', 'M 92 110 Q 100 118 108 110');
      }, 700);
      this.armContents.left.animate([
        { transform: 'rotate(0deg)' }, { transform: 'rotate(120deg)' }, { transform: 'rotate(0deg)' }
      ], { duration: 700, easing: 'ease-in-out' });
      this.armContents.right.animate([
        { transform: 'rotate(-40deg)' }, { transform: 'rotate(-120deg)' }, { transform: 'rotate(-40deg)' }
      ], { duration: 700, easing: 'ease-in-out' });
      this.cheeks.forEach(c => c.setAttribute('opacity', '0.7'));
      this._schedule(() => {
        this.cheeks.forEach(c => c.setAttribute('opacity', '0'));
      }, 1500);
    }, biteStart + 3 * 600);

    const homeStartTime = biteStart + 3 * 600 + 1200;
    this._schedule(() => {
      if (this.state !== 'idle') return;
      this.mouth.setAttribute('d', 'M 92 110 Q 100 118 108 110');
      this.cheeks.forEach(c => c.setAttribute('opacity', '0'));
      this.armContents.left.animate([{ transform: 'rotate(0deg)' }],
        { duration: 300, fill: 'forwards', easing: 'ease-out' });
      this.armContents.right.animate([{ transform: 'rotate(0deg)' }],
        { duration: 300, fill: 'forwards', easing: 'ease-out' });
      this.pupils.forEach(p => p.setAttribute('transform', ''));
      this.irises.forEach(p => p.setAttribute('transform', ''));
      this._walk(3, 'left', 280);
    }, homeStartTime);

    const endTime = homeStartTime + 3 * 280 + 400;
    this._schedule(() => {
      if (this.state !== 'idle') return;
      this._returnHome(400);
    }, endTime);
  }

  // ==================== СЦЕНА: ПИЦЦА ====================
  _eatPizzaScene() {
    if (this.state !== 'idle') return;

    this._showPizza();
    this.pupils.forEach(p => p.setAttribute('transform', 'translate(4, 2)'));
    this.irises.forEach(p => p.setAttribute('transform', 'translate(4, 2)'));

    this._schedule(() => {
      if (this.state !== 'idle') return;
      this._walk(2, 'right', 250);
    }, 500);

    const walkEnd = 500 + 2 * 250 + 300;

    this._schedule(() => {
      if (this.state !== 'idle') return;
      this._hidePizza();
      this.armContents.right.animate([
        { transform: 'rotate(0deg)' }, { transform: 'rotate(-50deg)' }
      ], { duration: 500, fill: 'forwards', easing: 'ease-out' });
    }, walkEnd);

    for (let i = 0; i < 4; i++) {
      this._schedule(() => {
        if (this.state !== 'idle') return;
        this.mouth.animate([
          { d: 'path("M 92 110 Q 100 118 108 110")' },
          { d: 'path("M 90 108 Q 100 124 110 108")' },
          { d: 'path("M 92 110 Q 100 118 108 110")' }
        ], { duration: 400, easing: 'ease-in-out' });
        this.armContents.right.animate([
          { transform: 'rotate(-50deg)' }, { transform: 'rotate(-120deg)' }, { transform: 'rotate(-50deg)' }
        ], { duration: 400, easing: 'ease-in-out' });
      }, walkEnd + 500 + i * 500);
    }

    this._schedule(() => {
      if (this.state !== 'idle') return;
      this._spawnStars(6);
      this.mouth.setAttribute('d', 'M 86 106 Q 100 126 114 106');
      this.cheeks.forEach(c => c.setAttribute('opacity', '0.8'));
      this._schedule(() => {
        this.mouth.setAttribute('d', 'M 92 110 Q 100 118 108 110');
        this.cheeks.forEach(c => c.setAttribute('opacity', '0'));
      }, 1200);
    }, walkEnd + 500 + 4 * 500);

    this._schedule(() => {
      if (this.state !== 'idle') return;
      this.cheeks.forEach(c => c.setAttribute('opacity', '0'));
      this.armContents.right.animate([{ transform: 'rotate(0deg)' }],
        { duration: 300, fill: 'forwards' });
      this.pupils.forEach(p => p.setAttribute('transform', ''));
      this.irises.forEach(p => p.setAttribute('transform', ''));
      this._walk(2, 'left', 250);
    }, walkEnd + 500 + 4 * 500 + 1500);

    this._schedule(() => {
      if (this.state !== 'idle') return;
      this._returnHome(400);
    }, walkEnd + 500 + 4 * 500 + 1500 + 2 * 250 + 400);
  }

  // ==================== СЦЕНА: ПОНЧИК ====================
  _eatDonutScene() {
    if (this.state !== 'idle') return;

    this._showDonut();
    this.pupils.forEach(p => p.setAttribute('transform', 'translate(4, 2)'));
    this.irises.forEach(p => p.setAttribute('transform', 'translate(4, 2)'));

    this._schedule(() => {
      if (this.state !== 'idle') return;
      this._walk(2, 'right', 250);
    }, 500);

    const walkEnd = 500 + 2 * 250 + 300;

    this._schedule(() => {
      if (this.state !== 'idle') return;
      this._hideDonut();
      this.armContents.right.animate([
        { transform: 'rotate(0deg)' }, { transform: 'rotate(-50deg)' }
      ], { duration: 500, fill: 'forwards', easing: 'ease-out' });
    }, walkEnd);

    for (let i = 0; i < 3; i++) {
      this._schedule(() => {
        if (this.state !== 'idle') return;
        this.mouth.animate([
          { d: 'path("M 92 110 Q 100 118 108 110")' },
          { d: 'path("M 92 108 Q 100 122 108 108")' },
          { d: 'path("M 92 110 Q 100 118 108 110")' }
        ], { duration: 500, easing: 'ease-in-out' });
        this.armContents.right.animate([
          { transform: 'rotate(-50deg)' }, { transform: 'rotate(-115deg)' }, { transform: 'rotate(-50deg)' }
        ], { duration: 500, easing: 'ease-in-out' });
      }, walkEnd + 500 + i * 550);
    }

    this._schedule(() => {
      if (this.state !== 'idle') return;
      this._spawnStars(5);
      this._spawnHeart();
      this.mouth.setAttribute('d', 'M 86 106 Q 100 126 114 106');
      this.cheeks.forEach(c => c.setAttribute('opacity', '0.9'));
      this._schedule(() => {
        this.mouth.setAttribute('d', 'M 92 110 Q 100 118 108 110');
        this.cheeks.forEach(c => c.setAttribute('opacity', '0'));
      }, 1500);
    }, walkEnd + 500 + 3 * 550);

    this._schedule(() => {
      if (this.state !== 'idle') return;
      this.cheeks.forEach(c => c.setAttribute('opacity', '0'));
      this.armContents.right.animate([{ transform: 'rotate(0deg)' }],
        { duration: 300, fill: 'forwards' });
      this.pupils.forEach(p => p.setAttribute('transform', ''));
      this.irises.forEach(p => p.setAttribute('transform', ''));
      this._walk(2, 'left', 250);
    }, walkEnd + 500 + 3 * 550 + 1500);

    this._schedule(() => {
      if (this.state !== 'idle') return;
      this._returnHome(400);
    }, walkEnd + 500 + 3 * 550 + 1500 + 2 * 250 + 400);
  }

  // ==================== СЦЕНА: ИГРА С МЯЧОМ ====================
  _playBallScene() {
    if (this.state !== 'idle') return;

    this._showBall();
    this.pupils.forEach(p => p.setAttribute('transform', 'translate(4, 2)'));
    this.irises.forEach(p => p.setAttribute('transform', 'translate(4, 2)'));

    this.head.animate([
      { transform: 'rotate(0deg)' }, { transform: 'rotate(-8deg)' }
    ], { duration: 500, fill: 'forwards', easing: 'ease-out' });

    this._schedule(() => {
      if (this.state !== 'idle') return;
      this.legContents.right.animate([
        { transform: 'rotate(0deg)' }, { transform: 'rotate(-40deg)' }, { transform: 'rotate(0deg)' }
      ], { duration: 500, easing: 'ease-out' });
      this._hideBall();
      this._spawnSparks(6);
    }, 1200);

    this._schedule(() => {
      if (this.state !== 'idle') return;
      this._showBall();
      this.ball.animate([
        { transform: 'translate(0, 0) scale(0)' },
        { transform: 'translate(-30px, -60px) scale(1.2)' },
        { transform: 'translate(-10px, 0) scale(1)' }
      ], { duration: 800, fill: 'forwards', easing: 'ease-out' });
    }, 1800);

    this._schedule(() => {
      if (this.state !== 'idle') return;
      this._spawnStars(6);
      this.mouth.setAttribute('d', 'M 86 106 Q 100 126 114 106');
      this.cheeks.forEach(c => c.setAttribute('opacity', '0.8'));
      this.armContents.left.animate([
        { transform: 'rotate(0deg)' }, { transform: 'rotate(120deg)' }, { transform: 'rotate(0deg)' }
      ], { duration: 600, easing: 'ease-in-out' });
      this.armContents.right.animate([
        { transform: 'rotate(0deg)' }, { transform: 'rotate(-120deg)' }, { transform: 'rotate(0deg)' }
      ], { duration: 600, easing: 'ease-in-out' });
      this._schedule(() => {
        this.mouth.setAttribute('d', 'M 92 110 Q 100 118 108 110');
        this.cheeks.forEach(c => c.setAttribute('opacity', '0'));
      }, 1200);
    }, 2700);

    this._schedule(() => {
      if (this.state !== 'idle') return;
      this._hideBall();
      this.mouth.setAttribute('d', 'M 92 110 Q 100 118 108 110');
      this.cheeks.forEach(c => c.setAttribute('opacity', '0'));
      this.pupils.forEach(p => p.setAttribute('transform', ''));
      this.irises.forEach(p => p.setAttribute('transform', ''));
      this.head.animate([
        { transform: 'rotate(-8deg)' }, { transform: 'rotate(0deg)' }
      ], { duration: 400, fill: 'forwards', easing: 'ease-out' });
    }, 4000);
  }

  // ==================== СЦЕНА: ТАСКАНИЕ КОРОБКИ ====================
  _carryBoxScene() {
    if (this.state !== 'idle') return;

    this._showBox();
    this.armContents.left.animate([
      { transform: 'rotate(0deg)' }, { transform: 'rotate(80deg)' }
    ], { duration: 500, fill: 'forwards', easing: 'ease-out' });
    this.armContents.right.animate([
      { transform: 'rotate(0deg)' }, { transform: 'rotate(-80deg)' }
    ], { duration: 500, fill: 'forwards', easing: 'ease-out' });

    this._schedule(() => {
      if (this.state !== 'idle') return;
      this._walk(4, 'right', 350);
    }, 800);

    this._schedule(() => {
      if (this.state !== 'idle') return;
      this._hideBox();
      this.armContents.left.animate([{ transform: 'rotate(80deg)' }, { transform: 'rotate(0deg)' }],
        { duration: 400, fill: 'forwards' });
      this.armContents.right.animate([{ transform: 'rotate(-80deg)' }, { transform: 'rotate(0deg)' }],
        { duration: 400, fill: 'forwards' });
      this._spawnSparks(5);
      this.mouth.setAttribute('d', 'M 86 106 Q 100 126 114 106');
      this._schedule(() => {
        this.mouth.setAttribute('d', 'M 92 110 Q 100 118 108 110');
      }, 1200);
    }, 800 + 4 * 350 + 400);

    this._schedule(() => {
      if (this.state !== 'idle') return;
      this._walk(4, 'left', 350);
    }, 800 + 4 * 350 + 1200);

    this._schedule(() => {
      if (this.state !== 'idle') return;
      this._returnHome(400);
    }, 800 + 4 * 350 + 1200 + 4 * 350 + 400);
  }

  // ==================== СЦЕНА: СОН ====================
  _sleepScene() {
    if (this.state !== 'idle') return;

    this.eyelids.forEach(e => {
      e.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 1000, fill: 'forwards', easing: 'ease-out' });
    });

    this.mouth.animate([
      { d: 'path("M 92 110 Q 100 118 108 110")' },
      { d: 'path("M 94 112 Q 100 120 106 112")' }
    ], { duration: 800, fill: 'forwards', easing: 'ease-out' });

    this.head.animate([
      { transform: 'rotate(0deg)' },
      { transform: 'rotate(15deg)' }
    ], { duration: 1200, fill: 'forwards', easing: 'ease-out' });

    const headSwayStart = performance.now();
    const headSwayAnim = (now) => {
      if (this._isDestroyed || this.state !== 'idle') return;
      const t = (now - headSwayStart) / 1000;
      const rot = Math.sin(t * 1.5) * 3;
      this.head.setAttribute('transform', `rotate(${(15 + rot).toFixed(2)}, 100, 128)`);
      this._sleepHeadRAF = requestAnimationFrame(headSwayAnim);
    };
    this._sleepHeadRAF = requestAnimationFrame(headSwayAnim);

    for (let i = 0; i < 3; i++) {
      this._schedule(() => {
        if (this.state !== 'idle') return;
        const z = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        z.setAttribute('x', 120 + i * 10);
        z.setAttribute('y', 60);
        z.setAttribute('font-size', 16 + i * 4);
        z.setAttribute('font-weight', 'bold');
        z.setAttribute('fill', '#5bc8e8');
        z.textContent = 'Z';
        this.effectsLayer.appendChild(z);
        z.animate([
          { transform: 'translate(0, 0) scale(0.5)', opacity: 0 },
          { transform: 'translate(10px, -20px) scale(1)', opacity: 1, offset: 0.3 },
          { transform: 'translate(30px, -60px) scale(1.3)', opacity: 0 }
        ], { duration: 2500, easing: 'ease-out' });
        setTimeout(() => z.remove(), 2550);
      }, i * 800);
    }

    this._schedule(() => {
      if (this.state !== 'idle') return;
      if (this._sleepHeadRAF) cancelAnimationFrame(this._sleepHeadRAF);
      this.head.removeAttribute('transform');
      this.eyelids.forEach(e => {
        e.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 400, fill: 'forwards' });
      });
      this.head.animate([{ transform: 'rotate(0deg)' }],
        { duration: 500, fill: 'forwards', easing: 'ease-out' });
      this.mouth.setAttribute('d', 'M 92 110 Q 100 118 108 110');
      this.armContents.left.animate([
        { transform: 'rotate(0deg)' }, { transform: 'rotate(150deg)' }, { transform: 'rotate(0deg)' }
      ], { duration: 1500, easing: 'ease-in-out' });
      this.armContents.right.animate([
        { transform: 'rotate(0deg)' }, { transform: 'rotate(-150deg)' }, { transform: 'rotate(0deg)' }
      ], { duration: 1500, easing: 'ease-in-out' });
    }, 6000);
  }

  // ==================== СЦЕНА: ЗАРЯДКА ====================
  _exerciseScene() {
    if (this.state !== 'idle') return;

    this.bodyEl.style.transformOrigin = '50% 100%';

    for (let i = 0; i < 3; i++) {
      this._schedule(() => {
        if (this.state !== 'idle') return;
        this.bodyEl.animate([
          { transform: 'rotate(0deg)' },
          { transform: 'rotate(20deg)' },
          { transform: 'rotate(0deg)' }
        ], { duration: 1000, easing: 'ease-in-out' });
        this.armContents.left.animate([
          { transform: 'rotate(0deg)' }, { transform: 'rotate(45deg)' }, { transform: 'rotate(0deg)' }
        ], { duration: 1000, easing: 'ease-in-out' });
        this.armContents.right.animate([
          { transform: 'rotate(0deg)' }, { transform: 'rotate(-45deg)' }, { transform: 'rotate(0deg)' }
        ], { duration: 1000, easing: 'ease-in-out' });
      }, i * 1100);
    }

    this._schedule(() => {
      if (this.state !== 'idle') return;
      for (let i = 0; i < 3; i++) {
        this._schedule(() => {
          if (this.state !== 'idle') return;
          this.legContents.left.animate([
            { transform: 'rotate(0deg)' }, { transform: 'rotate(15deg)' }, { transform: 'rotate(0deg)' }
          ], { duration: 700, easing: 'ease-in-out' });
          this.legContents.right.animate([
            { transform: 'rotate(0deg)' }, { transform: 'rotate(-15deg)' }, { transform: 'rotate(0deg)' }
          ], { duration: 700, easing: 'ease-in-out' });
          this.bodyEl.animate([
            { transform: 'rotate(0deg)' },
            { transform: 'rotate(3deg)' },
            { transform: 'rotate(0deg)' }
          ], { duration: 700, easing: 'ease-in-out' });
        }, i * 800);
      }
    }, 3500);

    this._schedule(() => {
      if (this.state !== 'idle') return;
      for (let i = 0; i < 5; i++) {
        this._schedule(() => {
          if (this.state !== 'idle') return;
          this.root.animate([
            { transform: 'translateY(0)' },
            { transform: 'translateY(-25px)' },
            { transform: 'translateY(0)' }
          ], { duration: 500, easing: 'ease-out' });
          this.legContents.left.animate([
            { transform: 'rotate(0deg)' }, { transform: 'rotate(20deg)' }, { transform: 'rotate(0deg)' }
          ], { duration: 500, easing: 'ease-in-out' });
          this.legContents.right.animate([
            { transform: 'rotate(0deg)' }, { transform: 'rotate(-20deg)' }, { transform: 'rotate(0deg)' }
          ], { duration: 500, easing: 'ease-in-out' });
          this._spawnSparks(3);
        }, i * 550);
      }
    }, 6200);

    this._schedule(() => {
      if (this.state !== 'idle') return;
      this.armContents.left.animate([
        { transform: 'rotate(0deg)' }, { transform: 'rotate(160deg)' }
      ], { duration: 600, fill: 'forwards', easing: 'ease-out' });
      this.armContents.right.animate([
        { transform: 'rotate(0deg)' }, { transform: 'rotate(-160deg)' }
      ], { duration: 600, fill: 'forwards', easing: 'ease-out' });
      this.mouth.setAttribute('d', 'M 86 106 Q 100 126 114 106');
      this._spawnStars(8);
      this._schedule(() => {
        if (this.state !== 'idle') return;
        this.armContents.left.animate([{ transform: 'rotate(160deg)' }, { transform: 'rotate(0deg)' }],
          { duration: 500, fill: 'forwards' });
        this.armContents.right.animate([{ transform: 'rotate(-160deg)' }, { transform: 'rotate(0deg)' }],
          { duration: 500, fill: 'forwards' });
        this.mouth.setAttribute('d', 'M 92 110 Q 100 118 108 110');
      }, 2000);
    }, 9200);
  }

  // ==================== СЦЕНА: МЕДИТАЦИЯ ====================
  _meditateScene() {
    if (this.state !== 'idle') return;

    this.eyelids.forEach(e => {
      e.animate([{ opacity: 0 }, { opacity: 0.8 }], { duration: 1000, fill: 'forwards', easing: 'ease-out' });
    });

    this.armContents.left.animate([
      { transform: 'rotate(0deg)' }, { transform: 'rotate(70deg)' }
    ], { duration: 800, fill: 'forwards', easing: 'ease-out' });
    this.armContents.right.animate([
      { transform: 'rotate(0deg)' }, { transform: 'rotate(-70deg)' }
    ], { duration: 800, fill: 'forwards', easing: 'ease-out' });

    const aura = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    aura.setAttribute('cx', 100);
    aura.setAttribute('cy', 158);
    aura.setAttribute('r', 40);
    aura.setAttribute('fill', 'none');
    aura.setAttribute('stroke', '#9b59b6');
    aura.setAttribute('stroke-width', '2');
    aura.setAttribute('opacity', '0.6');
    aura.setAttribute('filter', `url(#glow-${this._uid})`);
    this.effectsLayer.appendChild(aura);
    aura.animate([
      { r: 40, opacity: 0.6 },
      { r: 80, opacity: 0 }
    ], { duration: 3000, iterations: 2, easing: 'ease-out' });

    this._schedule(() => {
      if (this.state !== 'idle') {
        aura.remove();
        return;
      }
      aura.remove();
      this.eyelids.forEach(e => {
        e.animate([{ opacity: 0.8 }, { opacity: 0 }], { duration: 600, fill: 'forwards' });
      });
      this.armContents.left.animate([{ transform: 'rotate(70deg)' }, { transform: 'rotate(0deg)' }],
        { duration: 600, fill: 'forwards' });
      this.armContents.right.animate([{ transform: 'rotate(-70deg)' }, { transform: 'rotate(0deg)' }],
        { duration: 600, fill: 'forwards' });
      this.mouth.setAttribute('d', 'M 86 106 Q 100 126 114 106');
      this._schedule(() => {
        if (this.state !== 'idle') return;
        this.mouth.setAttribute('d', 'M 92 110 Q 100 118 108 110');
      }, 1500);
    }, 6000);
  }

  // ==================== СЦЕНА: ФОТО ====================
  _photoScene() {
    if (this.state !== 'idle') return;

    this.armContents.left.animate([
      { transform: 'rotate(0deg)' },
      { transform: 'rotate(-85deg)' }
    ], { duration: 600, fill: 'forwards', easing: 'ease-out' });
    this.armContents.right.animate([
      { transform: 'rotate(0deg)' },
      { transform: 'rotate(85deg)' }
    ], { duration: 600, fill: 'forwards', easing: 'ease-out' });

    this._schedule(() => {
      if (this.state !== 'idle') return;

      const camera = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      camera.setAttribute('class', 'camera-prop');
      camera.innerHTML = `
        <rect x="-22" y="-14" width="44" height="28" rx="5" fill="#2c3e50" stroke="#1a2a3a" stroke-width="1.5"/>
        <rect x="-8" y="-20" width="16" height="8" rx="2" fill="#2c3e50" stroke="#1a2a3a" stroke-width="1"/>
        <circle cx="0" cy="0" r="10" fill="#1a2a3a" stroke="#0a1520" stroke-width="1"/>
        <circle cx="0" cy="0" r="6" fill="#0d2535"/>
        <circle cx="0" cy="0" r="3" fill="#5bc8e8"/>
        <circle cx="-1.5" cy="-1.5" r="1.2" fill="#ffffff"/>
        <circle cx="16" cy="-10" r="2.5" fill="#e74c3c"/>
        <rect x="-18" y="-11" width="6" height="4" rx="1" fill="#f5c842"/>
        <rect x="-20" y="-12" width="40" height="2" rx="1" fill="#ffffff" opacity="0.15"/>
      `;
      camera.setAttribute('transform', 'translate(100, 170)');
      this.handItemsLayer.appendChild(camera);

      camera.animate([
        { opacity: 0, transform: 'translate(100px, 170px) scale(0.3)' },
        { opacity: 1, transform: 'translate(100px, 170px) scale(1.15)' },
        { opacity: 1, transform: 'translate(100px, 170px) scale(1)' }
      ], { duration: 400, fill: 'forwards', easing: 'ease-out' });
    }, 500);

    this._schedule(() => {
      if (this.state !== 'idle') return;
      this.head.animate([
        { transform: 'rotate(0deg)' },
        { transform: 'rotate(-10deg)' },
        { transform: 'rotate(10deg)' },
        { transform: 'rotate(0deg)' }
      ], { duration: 1500, easing: 'ease-in-out' });
    }, 1200);

    this._schedule(() => {
      if (this.state !== 'idle') return;
      const flash = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      flash.setAttribute('cx', 100);
      flash.setAttribute('cy', 170);
      flash.setAttribute('r', 5);
      flash.setAttribute('fill', '#ffffff');
      this.effectsLayer.appendChild(flash);
      flash.animate([
        { r: 5, opacity: 1 },
        { r: 70, opacity: 0 }
      ], { duration: 400, easing: 'ease-out' });
      setTimeout(() => flash.remove(), 450);
      this._spawnSparks(10);
      this.mouth.setAttribute('d', 'M 86 106 Q 100 126 114 106');
      this._schedule(() => {
        this.mouth.setAttribute('d', 'M 92 110 Q 100 118 108 110');
      }, 1200);
    }, 2800);

    this._schedule(() => {
      if (this.state !== 'idle') return;
      const cam = this.handItemsLayer.querySelector('.camera-prop');
      if (cam) {
        cam.animate([
          { opacity: 1, transform: 'translate(100px, 170px) scale(1)' },
          { opacity: 0, transform: 'translate(100px, 150px) scale(0.5)' }
        ], { duration: 400, fill: 'forwards', easing: 'ease-in' });
        setTimeout(() => cam.remove(), 450);
      }
      this.armContents.left.animate([
        { transform: 'rotate(-85deg)' }, { transform: 'rotate(0deg)' }
      ], { duration: 500, fill: 'forwards', easing: 'ease-out' });
      this.armContents.right.animate([
        { transform: 'rotate(85deg)' }, { transform: 'rotate(0deg)' }
      ], { duration: 500, fill: 'forwards', easing: 'ease-out' });
      this.mouth.setAttribute('d', 'M 92 110 Q 100 118 108 110');
    }, 4200);
  }

  // ==================== СЦЕНА: ТАНЕЦ С КОНФЕТТИ ====================
  _confettiDance() {
    if (this.state !== 'idle') return;

    this.mouth.setAttribute('d', 'M 86 106 Q 100 126 114 106');
    this.cheeks.forEach(c => c.setAttribute('opacity', '0.85'));
    this.eyelids.forEach(e => e.setAttribute('opacity', '0.35'));
    this._spawnConfetti(30);

    const beat = 400;
    const danceStart = performance.now();
    const danceAnim = (now) => {
      if (this._isDestroyed || this.state !== 'idle') return;
      const t = (now - danceStart) / 1000;
      const x = Math.sin(t * 6) * 5;
      const y = Math.abs(Math.sin(t * 4)) * -10;
      const rot = Math.sin(t * 6) * 8;
      this.root.setAttribute('transform', `translate(${x.toFixed(2)}, ${y.toFixed(2)}) rotate(${rot.toFixed(2)}, 100, 158)`);
      if (t < 5) {
        this._danceRAF = requestAnimationFrame(danceAnim);
      }
    };
    this._danceRAF = requestAnimationFrame(danceAnim);

    this.armContents.left.animate([
      { transform: 'rotate(0deg)' }, { transform: 'rotate(150deg)' }, { transform: 'rotate(0deg)' }
    ], { duration: beat * 2, iterations: 6, easing: 'ease-in-out' });
    this.armContents.right.animate([
      { transform: 'rotate(0deg)' }, { transform: 'rotate(-150deg)' }, { transform: 'rotate(0deg)' }
    ], { duration: beat * 2, iterations: 6, easing: 'ease-in-out', delay: beat });

    this.legContents.left.animate([
      { transform: 'rotate(0deg)' }, { transform: 'rotate(12deg)' }, { transform: 'rotate(0deg)' }
    ], { duration: beat, iterations: 12, easing: 'ease-in-out' });
    this.legContents.right.animate([
      { transform: 'rotate(0deg)' }, { transform: 'rotate(-12deg)' }, { transform: 'rotate(0deg)' }
    ], { duration: beat, iterations: 12, easing: 'ease-in-out', delay: beat / 2 });

    this._schedule(() => this._spawnConfetti(20), 1500);
    this._schedule(() => this._spawnConfetti(20), 3000);

    this._schedule(() => {
      if (this.state !== 'idle') return;
      if (this._danceRAF) cancelAnimationFrame(this._danceRAF);
      this.root.removeAttribute('transform');
      this.mouth.setAttribute('d', 'M 92 110 Q 100 118 108 110');
      this.cheeks.forEach(c => c.setAttribute('opacity', '0'));
      this.eyelids.forEach(e => e.setAttribute('opacity', '0'));
      this.armContents.left.animate([{ transform: 'rotate(0deg)' }], { duration: 300, fill: 'forwards' });
      this.armContents.right.animate([{ transform: 'rotate(0deg)' }], { duration: 300, fill: 'forwards' });
      this.legContents.left.animate([{ transform: 'rotate(0deg)' }], { duration: 300, fill: 'forwards' });
      this.legContents.right.animate([{ transform: 'rotate(0deg)' }], { duration: 300, fill: 'forwards' });
    }, 5000);
  }

  // ==================== СЦЕНА: ДИРИЖИРОВАНИЕ ====================
  _conductScene() {
    if (this.state !== 'idle') return;

    this.armContents.right.animate([
      { transform: 'rotate(0deg)' },
      { transform: 'rotate(-100deg)' }
    ], { duration: 600, fill: 'forwards', easing: 'ease-out' });

    this._schedule(() => {
      if (this.state !== 'idle') return;

      const baton = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      baton.setAttribute('class', 'baton-prop');
      baton.innerHTML = `
        <line x1="0" y1="0" x2="28" y2="-42" 
              stroke="#2c3e50" stroke-width="2.5" stroke-linecap="round"/>
        <circle cx="28" cy="-42" r="2.5" fill="#ffffff"/>
        <rect x="-3" y="-4" width="6" height="8" rx="2" fill="#8a5a2a"/>
      `;
      baton.setAttribute('transform', 'translate(166, 138)');
      this.handItemsLayer.appendChild(baton);

      baton.animate([
        { opacity: 0, transform: 'translate(166px, 138px) scale(0.3)' },
        { opacity: 1, transform: 'translate(166px, 138px) scale(1.1)' },
        { opacity: 1, transform: 'translate(166px, 138px) scale(1)' }
      ], { duration: 400, fill: 'forwards', easing: 'ease-out' });
    }, 600);

    for (let i = 0; i < 8; i++) {
      this._schedule(() => {
        if (this.state !== 'idle') return;
        const angle = i % 2 === 0 ? -15 : 15;
        const armAngle = i % 2 === 0 ? -100 : -80;

        this.armContents.right.animate([
          { transform: `rotate(${i % 2 === 0 ? -80 : -100}deg)` },
          { transform: `rotate(${armAngle}deg)` }
        ], { duration: 400, easing: 'ease-in-out', fill: 'forwards' });

        const baton = this.handItemsLayer.querySelector('.baton-prop');
        if (baton) {
          const handX = i % 2 === 0 ? 160 : 166;
          const handY = i % 2 === 0 ? 132 : 138;
          baton.setAttribute('transform', `translate(${handX}, ${handY}) rotate(${angle})`);
        }

        this.head.animate([
          { transform: `rotate(${i % 2 === 0 ? -5 : 5}deg)` },
          { transform: `rotate(${i % 2 === 0 ? 5 : -5}deg)` }
        ], { duration: 400, easing: 'ease-in-out' });

        if (i % 2 === 0) {
          const note = document.createElementNS('http://www.w3.org/2000/svg', 'text');
          note.setAttribute('font-size', '20');
          note.setAttribute('fill', '#9b59b6');
          note.textContent = ['♪', '♫', '♬'][i % 3];
          note.setAttribute('x', 120 + Math.random() * 40);
          note.setAttribute('y', 100);
          this.effectsLayer.appendChild(note);
          note.animate([
            { transform: 'translate(0, 0) scale(0.5)', opacity: 0 },
            { transform: 'translate(10px, -40px) scale(1.2)', opacity: 1, offset: 0.4 },
            { transform: 'translate(20px, -80px) scale(0.8)', opacity: 0 }
          ], { duration: 1500, easing: 'ease-out' });
          setTimeout(() => note.remove(), 1550);
        }
      }, 700 + i * 450);
    }

    this._schedule(() => {
      if (this.state !== 'idle') return;
      const baton = this.handItemsLayer.querySelector('.baton-prop');
      if (baton) {
        baton.animate([
          { opacity: 1 },
          { opacity: 0 }
        ], { duration: 400, fill: 'forwards', easing: 'ease-in' });
        setTimeout(() => baton.remove(), 450);
      }
      this.armContents.right.animate([
        { transform: 'rotate(-100deg)' }, { transform: 'rotate(0deg)' }
      ], { duration: 500, fill: 'forwards', easing: 'ease-out' });
      this.head.animate([{ transform: 'rotate(0deg)' }], { duration: 300, fill: 'forwards' });
      this.mouth.setAttribute('d', 'M 86 106 Q 100 126 114 106');
      this._spawnStars(5);
      this._schedule(() => {
        if (this.state !== 'idle') return;
        this.mouth.setAttribute('d', 'M 92 110 Q 100 118 108 110');
      }, 1500);
    }, 700 + 8 * 450);
  }

  setState(newState) {
    if (this.state === newState) return;
    this.state = newState;
    this._resetPose();
    switch (newState) {
      case 'idle':      this.idle();      break;
      case 'happy':     this.happy();     break;
      case 'sad':       this.sad();       break;
      case 'dance':     this.dance();     break;
      case 'jump':      this.jump();      break;
      case 'listen':    this.listen();    break;
      case 'think':     this.think();     break;
      case 'thinking':  this.thinking();  break;
      case 'waiting':   this.waiting();   break;
      case 'nervous':   this.nervous();   break;
      case 'lastSecond':this.lastSecond();break;
      case 'wink':      this.wink();      break;
      case 'shrug':     this.shrug();     break;
      case 'bow':       this.bow();       break;
      case 'encourage': this.encourage(); break;
    }
  }

  _resetPose() {
    this._clearTimers();
    if (this._sleepHeadRAF) {
      cancelAnimationFrame(this._sleepHeadRAF);
      this._sleepHeadRAF = null;
    }
    if (this._danceRAF) {
      cancelAnimationFrame(this._danceRAF);
      this._danceRAF = null;
    }
    if (this.root) this.root.removeAttribute('transform');
    if (this.head) this.head.removeAttribute('transform');

    const animated = [
      this.root, this.head, this.bodyEl,
      this.arms.left, this.arms.right,
      this.armContents.left, this.armContents.right,
      this.legs.left, this.legs.right,
      this.legContents.left, this.legContents.right,
      this.mouth, this.core, this.coreHalo, this.shadow,
      this.tear, this.eyes[0], this.eyes[1],
      this.pupils[0], this.pupils[1],
      this.irises[0], this.irises[1]
    ];
    animated.forEach(el => {
      if (el && el.getAnimations) el.getAnimations().forEach(a => a.cancel());
    });
    this.pupils.forEach(p => { p.style.transform = ''; p.setAttribute('transform', ''); });
    this.irises.forEach(p => { p.style.transform = ''; p.setAttribute('transform', ''); });
    this.cheeks.forEach(c => c.setAttribute('opacity', '0'));
    this.eyelids.forEach(e => e.setAttribute('opacity', '0'));
    if (this.mouth) this.mouth.setAttribute('d', 'M 92 110 Q 100 118 108 110');
    if (this.tear) this.tear.setAttribute('opacity', '0');
    if (this.core) this.core.setAttribute('opacity', '1');
    if (this.coreHalo) this.coreHalo.setAttribute('opacity', '0.7');
    if (this.starEyes) this.starEyes.setAttribute('opacity', '0');
    if (this.armContents.left)  this.armContents.left.style.transform = '';
    if (this.armContents.right) this.armContents.right.style.transform = '';
    if (this.legContents.left)  this.legContents.left.style.transform = '';
    if (this.legContents.right) this.legContents.right.style.transform = '';
    if (this.head) this.head.style.transform = '';
    if (this.bodyEl) {
      this.bodyEl.style.transform = '';
      this.bodyEl.style.transformOrigin = '';
    }
    [this.apple, this.ball, this.pizza, this.donut, this.box].forEach(el => {
      if (el) {
        el.setAttribute('opacity', '0');
        el.getAnimations().forEach(a => a.cancel());
      }
    });
    if (this.handItemsLayer) {
      while (this.handItemsLayer.firstChild) {
        this.handItemsLayer.removeChild(this.handItemsLayer.firstChild);
      }
    }
    if (this.effectsLayer) {
      while (this.effectsLayer.firstChild) {
        this.effectsLayer.removeChild(this.effectsLayer.firstChild);
      }
    }
  }

  // ==================== IDLE ====================
  idle() {
    this._resetPose();
    this.root.animate([
      { transform: 'translateY(0)' },
      { transform: 'translateY(-2px)' },
      { transform: 'translateY(0)' }
    ], { duration: 2800, iterations: Infinity, easing: 'ease-in-out' });

    this.antennas.forEach((a, i) => {
      a.animate([
        { transform: 'rotate(0deg)' },
        { transform: 'rotate(' + (i % 2 ? 4 : -4) + 'deg)' },
        { transform: 'rotate(0deg)' }
      ], { duration: 2200 + i * 250, iterations: Infinity, easing: 'ease-in-out' });
    });

    if (this.core) {
      this.core.animate([
        { opacity: 0.9, transform: 'scale(1)' },
        { opacity: 1,   transform: 'scale(1.1)' },
        { opacity: 0.9, transform: 'scale(1)' }
      ], { duration: 1800, iterations: Infinity, easing: 'ease-in-out' });
    }
    if (this.coreHalo) {
      this.coreHalo.animate([
        { opacity: 0.5, transform: 'scale(0.9)' },
        { opacity: 0.9, transform: 'scale(1.15)' },
        { opacity: 0.5, transform: 'scale(0.9)' }
      ], { duration: 1800, iterations: Infinity, easing: 'ease-in-out' });
    }

    this._scheduleBlink();
    this._scheduleIdleAction();
    this._scheduleBubbles();
  }

  _scheduleBubbles() {
    const delay = 2500 + Math.random() * 2500;
    this._schedule(() => {
      if (this.state !== 'idle') return;
      this._spawnBubbles(1);
      this._scheduleBubbles();
    }, delay);
  }

  _scheduleBlink() {
    const delay = 2500 + Math.random() * 3000;
    this._schedule(() => {
      if (this.state !== 'idle' && this.state !== 'listen' && this.state !== 'waiting') return;
      this._blink();
      this._scheduleBlink();
    }, delay);
  }

  _scheduleIdleAction() {
    const delay = 2500 + Math.random() * 3000;
    this._schedule(() => {
      if (this.state !== 'idle') return;
      if (Math.random() < 0.3) {
        const scenes = [
          this._eatAppleScene.bind(this),
          this._eatPizzaScene.bind(this),
          this._eatDonutScene.bind(this),
          this._playBallScene.bind(this),
          this._carryBoxScene.bind(this),
          this._sleepScene.bind(this),
          this._exerciseScene.bind(this),
          this._meditateScene.bind(this),
          this._photoScene.bind(this),
          this._confettiDance.bind(this),
          this._conductScene.bind(this)
        ];
        const sceneIdx = Math.floor(Math.random() * scenes.length);
        scenes[sceneIdx]();
      } else {
        const actions = [
          this._idleLookAround.bind(this),
          this._idleYawn.bind(this),
          this._idleSway.bind(this),
          this._idleLittleHop.bind(this),
          this._idleHeadTilt.bind(this),
          this._idleLookUp.bind(this),
          this._idleHum.bind(this),
          this._idleWave.bind(this),
          this._idleScratchHead.bind(this),
          this._idleWink.bind(this),
          this._idleSelfDance.bind(this),
          this._idleBow.bind(this),
          this._idleSurprise.bind(this),
          this._idleShrug.bind(this),
          this._idleTapFoot.bind(this),
          this._idleSpin.bind(this),
          this._idlePattyCake.bind(this),
          this._idlePunchAir.bind(this),
          this._idlePeekaboo.bind(this),
          this._idleStretch.bind(this),
          this._idleWalkAround.bind(this),
          this._idleRunInPlace.bind(this),
          this._idleWaveBoth.bind(this),
          this._idleHeartEyes.bind(this)
        ];
        let idx;
        let attempts = 0;
        do {
          idx = Math.floor(Math.random() * actions.length);
          attempts++;
        } while (idx === this._lastIdleAction && attempts < 30);
        this._lastIdleAction = idx;
        actions[idx]();
      }
      this._scheduleIdleAction();
    }, delay);
  }

  _blink() {
    this.eyes.forEach(eye => {
      eye.animate([
        { transform: 'scaleY(1)' },
        { transform: 'scaleY(0.1)' },
        { transform: 'scaleY(1)' }
      ], { duration: 220, easing: 'ease-in-out' });
    });
  }

  // ====== IDLE АНИМАЦИИ ======
  _idleLookAround() {
    if (this.state !== 'idle') return;
    const move = (dx, dur, delay) => {
      this.pupils.forEach(p => {
        p.animate([
          { transform: 'translate(0, 0)' },
          { transform: 'translate(' + dx + 'px, 0)' },
          { transform: 'translate(0, 0)' }
        ], { duration: dur, delay: delay, easing: 'ease-in-out', fill: 'forwards' });
      });
      this.irises.forEach(p => {
        p.animate([
          { transform: 'translate(0, 0)' },
          { transform: 'translate(' + dx + 'px, 0)' },
          { transform: 'translate(0, 0)' }
        ], { duration: dur, delay: delay, easing: 'ease-in-out', fill: 'forwards' });
      });
    };
    move(3, 700, 0); move(-3, 700, 800); move(2, 500, 1700);
  }

  _idleYawn() {
    if (this.state !== 'idle') return;
    this.mouth.animate([
      { d: 'path("M 92 110 Q 100 118 108 110")' },
      { d: 'path("M 92 108 Q 100 124 108 108")' },
      { d: 'path("M 92 108 Q 100 124 108 108")' },
      { d: 'path("M 92 110 Q 100 118 108 110")' }
    ], { duration: 1600, easing: 'ease-in-out' });
    this.eyelids.forEach(e => {
      e.animate([
        { opacity: 0 }, { opacity: 0.75 }, { opacity: 0.75 }, { opacity: 0 }
      ], { duration: 1600, easing: 'ease-in-out' });
    });
  }

  _idleSway() {
    if (this.state !== 'idle') return;
    this.root.animate([
      { transform: 'translateX(0) rotate(0deg)' },
      { transform: 'translateX(-2px) rotate(-1.5deg)' },
      { transform: 'translateX(2px) rotate(1.5deg)' },
      { transform: 'translateX(-2px) rotate(-1.5deg)' },
      { transform: 'translateX(0) rotate(0deg)' }
    ], { duration: 2600, easing: 'ease-in-out' });
  }

  _idleLittleHop() {
    if (this.state !== 'idle') return;
    this.root.animate([
      { transform: 'translateY(0) scaleY(1)' },
      { transform: 'translateY(3px) scaleY(0.96)' },
      { transform: 'translateY(-12px) scaleY(1.03)' },
      { transform: 'translateY(0) scaleY(0.97)' },
      { transform: 'translateY(0) scaleY(1)' }
    ], { duration: 700, easing: 'ease-out' });
  }

  _idleHeadTilt() {
    if (this.state !== 'idle') return;
    this.head.animate([
      { transform: 'rotate(0deg)' },
      { transform: 'rotate(-6deg)' },
      { transform: 'rotate(6deg)' },
      { transform: 'rotate(-4deg)' },
      { transform: 'rotate(0deg)' }
    ], { duration: 2000, easing: 'ease-in-out' });
  }

  _idleLookUp() {
    if (this.state !== 'idle') return;
    this.pupils.forEach(p => {
      p.animate([
        { transform: 'translate(0, 0)' }, { transform: 'translate(0, -2.5px)' }, { transform: 'translate(0, 0)' }
      ], { duration: 1500, easing: 'ease-in-out' });
    });
    this.irises.forEach(p => {
      p.animate([
        { transform: 'translate(0, 0)' }, { transform: 'translate(0, -2.5px)' }, { transform: 'translate(0, 0)' }
      ], { duration: 1500, easing: 'ease-in-out' });
    });
  }

  _idleHum() {
    if (this.state !== 'idle') return;
    for (let i = 0; i < 4; i++) {
      this._schedule(() => {
        if (this.state !== 'idle') return;
        this.mouth.animate([
          { d: 'path("M 92 110 Q 100 118 108 110")' },
          { d: 'path("M 94 110 Q 100 116 106 110")' },
          { d: 'path("M 92 110 Q 100 118 108 110")' }
        ], { duration: 400, easing: 'ease-in-out' });
      }, i * 450);
    }
    if (this.core) {
      this.core.animate([
        { opacity: 0.9, transform: 'scale(1)' },
        { opacity: 1, transform: 'scale(1.15)' },
        { opacity: 0.9, transform: 'scale(1)' },
        { opacity: 1, transform: 'scale(1.15)' },
        { opacity: 0.9, transform: 'scale(1)' }
      ], { duration: 1800, easing: 'ease-in-out' });
    }
  }

  _idleWave() {
    if (this.state !== 'idle') return;
    this.armContents.right.animate([
      { transform: 'rotate(0deg)' }, { transform: 'rotate(-110deg)' },
      { transform: 'rotate(-90deg)' }, { transform: 'rotate(-120deg)' },
      { transform: 'rotate(-90deg)' }, { transform: 'rotate(-120deg)' },
      { transform: 'rotate(0deg)' }
    ], { duration: 2200, easing: 'ease-in-out' });
  }

  _idleWaveBoth() {
    if (this.state !== 'idle') return;
    this.armContents.left.animate([
      { transform: 'rotate(0deg)' }, { transform: 'rotate(110deg)' },
      { transform: 'rotate(90deg)' }, { transform: 'rotate(120deg)' },
      { transform: 'rotate(90deg)' }, { transform: 'rotate(120deg)' },
      { transform: 'rotate(0deg)' }
    ], { duration: 2200, easing: 'ease-in-out' });
    this.armContents.right.animate([
      { transform: 'rotate(0deg)' }, { transform: 'rotate(-110deg)' },
      { transform: 'rotate(-90deg)' }, { transform: 'rotate(-120deg)' },
      { transform: 'rotate(-90deg)' }, { transform: 'rotate(-120deg)' },
      { transform: 'rotate(0deg)' }
    ], { duration: 2200, easing: 'ease-in-out' });
    this.mouth.setAttribute('d', 'M 86 106 Q 100 126 114 106');
    this.cheeks.forEach(c => c.setAttribute('opacity', '0.7'));
    this._schedule(() => {
      if (this.state !== 'idle') return;
      this.mouth.setAttribute('d', 'M 92 110 Q 100 118 108 110');
      this.cheeks.forEach(c => c.setAttribute('opacity', '0'));
    }, 2200);
  }

  _idleHeartEyes() {
    if (this.state !== 'idle') return;
    if (this.starEyes) {
      this.starEyes.setAttribute('opacity', '1');
      this.starEyes.animate([
        { opacity: 1, transform: 'scale(1)' },
        { opacity: 1, transform: 'scale(1.15)' },
        { opacity: 1, transform: 'scale(1)' }
      ], { duration: 600, iterations: 3, easing: 'ease-in-out' });
    }
    this._spawnHeart();
    this._schedule(() => this._spawnHeart(), 500);
    this._schedule(() => this._spawnHeart(), 1000);
    this.cheeks.forEach(c => c.setAttribute('opacity', '0.85'));
    this.mouth.setAttribute('d', 'M 86 106 Q 100 126 114 106');
    this._schedule(() => {
      if (this.state !== 'idle') return;
      if (this.starEyes) this.starEyes.setAttribute('opacity', '0');
      this.cheeks.forEach(c => c.setAttribute('opacity', '0'));
      this.mouth.setAttribute('d', 'M 92 110 Q 100 118 108 110');
    }, 3000);
  }

  _idleWalkAround() {
    if (this.state !== 'idle') return;
    const dir = Math.random() < 0.5 ? 'left' : 'right';
    this._walk(2, dir, 350);
    this._schedule(() => {
      if (this.state !== 'idle') return;
      this._walk(2, dir === 'left' ? 'right' : 'left', 350);
    }, 2 * 350 + 500);
  }

  _idleRunInPlace() {
    if (this.state !== 'idle') return;
    for (let i = 0; i < 8; i++) {
      this._schedule(() => {
        if (this.state !== 'idle') return;
        const leftFirst = i % 2 === 0;
        this.legContents.left.animate([
          { transform: leftFirst ? 'rotate(-30deg)' : 'rotate(20deg)' },
          { transform: leftFirst ? 'rotate(20deg)' : 'rotate(-30deg)' }
        ], { duration: 150, easing: 'ease-in-out' });
        this.legContents.right.animate([
          { transform: leftFirst ? 'rotate(20deg)' : 'rotate(-30deg)' },
          { transform: leftFirst ? 'rotate(-30deg)' : 'rotate(20deg)' }
        ], { duration: 150, easing: 'ease-in-out' });
        this.armContents.left.animate([
          { transform: leftFirst ? 'rotate(30deg)' : 'rotate(-30deg)' },
          { transform: leftFirst ? 'rotate(-30deg)' : 'rotate(30deg)' }
        ], { duration: 150, easing: 'ease-in-out' });
        this.armContents.right.animate([
          { transform: leftFirst ? 'rotate(-30deg)' : 'rotate(30deg)' },
          { transform: leftFirst ? 'rotate(30deg)' : 'rotate(-30deg)' }
        ], { duration: 150, easing: 'ease-in-out' });
      }, i * 150);
    }
    this._schedule(() => {
      if (this.state !== 'idle') return;
      this.legContents.left.animate([{ transform: 'rotate(0deg)' }], { duration: 200, fill: 'forwards' });
      this.legContents.right.animate([{ transform: 'rotate(0deg)' }], { duration: 200, fill: 'forwards' });
      this.armContents.left.animate([{ transform: 'rotate(0deg)' }], { duration: 200, fill: 'forwards' });
      this.armContents.right.animate([{ transform: 'rotate(0deg)' }], { duration: 200, fill: 'forwards' });
    }, 8 * 150 + 200);
  }

  _idleScratchHead() {
    if (this.state !== 'idle') return;
    this.armContents.right.animate([
      { transform: 'rotate(0deg)' }, { transform: 'rotate(-135deg)' },
      { transform: 'rotate(-130deg)' }, { transform: 'rotate(-138deg)' },
      { transform: 'rotate(-130deg)' }, { transform: 'rotate(-135deg)' },
      { transform: 'rotate(0deg)' }
    ], { duration: 2400, easing: 'ease-in-out' });
    this.head.animate([
      { transform: 'rotate(0deg)' }, { transform: 'rotate(3deg)' },
      { transform: 'rotate(2deg)' }, { transform: 'rotate(3deg)' }, { transform: 'rotate(0deg)' }
    ], { duration: 2400, easing: 'ease-in-out' });
  }

  _idleWink() {
    if (this.state !== 'idle') return;
    this._schedule(() => {
      if (this.state !== 'idle') return;
      this.eyes[1].animate([
        { transform: 'scaleY(1)' }, { transform: 'scaleY(0.1)' }, { transform: 'scaleY(1)' }
      ], { duration: 350, easing: 'ease-in-out' });
    }, 200);
  }

  _idleSelfDance() {
    if (this.state !== 'idle') return;
    const beat = 400;
    this.root.animate([
      { transform: 'translateY(0) rotate(0deg)' },
      { transform: 'translateY(-3px) rotate(-3deg)' },
      { transform: 'translateY(0) rotate(0deg)' },
      { transform: 'translateY(-3px) rotate(3deg)' },
      { transform: 'translateY(0) rotate(0deg)' }
    ], { duration: beat * 4, iterations: 2, easing: 'ease-in-out' });
    this.armContents.left.animate([
      { transform: 'rotate(0deg)' }, { transform: 'rotate(35deg)' }, { transform: 'rotate(0deg)' }
    ], { duration: beat, iterations: 8, easing: 'ease-in-out' });
    this.armContents.right.animate([
      { transform: 'rotate(0deg)' }, { transform: 'rotate(-35deg)' }, { transform: 'rotate(0deg)' }
    ], { duration: beat, iterations: 8, easing: 'ease-in-out', delay: beat / 2 });
  }

  _idleBow() {
    if (this.state !== 'idle') return;
    this.head.animate([
      { transform: 'rotate(0deg)' }, { transform: 'rotate(15deg)' },
      { transform: 'rotate(15deg)' }, { transform: 'rotate(0deg)' }
    ], { duration: 2000, easing: 'ease-in-out' });
  }

  _idleSurprise() {
    if (this.state !== 'idle') return;
    this.mouth.animate([
      { d: 'path("M 92 110 Q 100 118 108 110")' },
      { d: 'path("M 94 110 Q 100 116 106 110 Q 100 120 94 110")' },
      { d: 'path("M 92 110 Q 100 118 108 110")' }
    ], { duration: 1400, easing: 'ease-in-out' });
    this.eyes.forEach(eye => {
      eye.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.15)' }, { transform: 'scale(1)' }],
        { duration: 1400, easing: 'ease-in-out' });
    });
  }

  _idleShrug() {
    if (this.state !== 'idle') return;
    this.armContents.left.animate([
      { transform: 'rotate(0deg)' }, { transform: 'rotate(35deg)' }, { transform: 'rotate(35deg)' }, { transform: 'rotate(0deg)' }
    ], { duration: 1800, easing: 'ease-in-out' });
    this.armContents.right.animate([
      { transform: 'rotate(0deg)' }, { transform: 'rotate(-35deg)' }, { transform: 'rotate(-35deg)' }, { transform: 'rotate(0deg)' }
    ], { duration: 1800, easing: 'ease-in-out' });
  }

  _idleTapFoot() {
    if (this.state !== 'idle') return;
    this.legContents.right.animate([
      { transform: 'rotate(0deg)' }, { transform: 'rotate(8deg)' }, { transform: 'rotate(0deg)' },
      { transform: 'rotate(8deg)' }, { transform: 'rotate(0deg)' }, { transform: 'rotate(8deg)' }, { transform: 'rotate(0deg)' }
    ], { duration: 1800, easing: 'ease-in-out' });
  }

  _idleSpin() {
    if (this.state !== 'idle') return;
    this.root.animate([
      { transform: 'rotate(0deg) scale(1)' },
      { transform: 'rotate(180deg) scale(0.9)' },
      { transform: 'rotate(360deg) scale(1)' }
    ], { duration: 1400, easing: 'ease-in-out' });
  }

  _idlePattyCake() {
    if (this.state !== 'idle') return;
    this.armContents.left.animate([
      { transform: 'rotate(0deg)' }, { transform: 'rotate(75deg)' }, { transform: 'rotate(0deg)' },
      { transform: 'rotate(75deg)' }, { transform: 'rotate(0deg)' }
    ], { duration: 1800, easing: 'ease-in-out' });
    this.armContents.right.animate([
      { transform: 'rotate(0deg)' }, { transform: 'rotate(-75deg)' }, { transform: 'rotate(0deg)' },
      { transform: 'rotate(-75deg)' }, { transform: 'rotate(0deg)' }
    ], { duration: 1800, easing: 'ease-in-out' });
  }

  _idlePunchAir() {
    if (this.state !== 'idle') return;
    this.armContents.left.animate([
      { transform: 'rotate(0deg)' }, { transform: 'rotate(75deg)' },
      { transform: 'rotate(0deg)' }, { transform: 'rotate(0deg)' }
    ], { duration: 800, easing: 'ease-out' });
    this._schedule(() => {
      if (this.state !== 'idle') return;
      this.armContents.right.animate([
        { transform: 'rotate(0deg)' }, { transform: 'rotate(-75deg)' },
        { transform: 'rotate(0deg)' }, { transform: 'rotate(0deg)' }
      ], { duration: 800, easing: 'ease-out' });
    }, 400);
  }

  _idlePeekaboo() {
    if (this.state !== 'idle') return;
    this.eyelids.forEach(e => {
      e.animate([
        { opacity: 0 }, { opacity: 1 }, { opacity: 1 }, { opacity: 0 }
      ], { duration: 1600, easing: 'ease-in-out' });
    });
  }

  _idleStretch() {
    if (this.state !== 'idle') return;
    this.armContents.left.animate([
      { transform: 'rotate(0deg)' }, { transform: 'rotate(155deg)' },
      { transform: 'rotate(155deg)' }, { transform: 'rotate(0deg)' }
    ], { duration: 2000, easing: 'ease-in-out' });
    this.armContents.right.animate([
      { transform: 'rotate(0deg)' }, { transform: 'rotate(-155deg)' },
      { transform: 'rotate(-155deg)' }, { transform: 'rotate(0deg)' }
    ], { duration: 2000, easing: 'ease-in-out' });
    this.root.animate([
      { transform: 'scaleY(1)' }, { transform: 'scaleY(1.04)' },
      { transform: 'scaleY(1.04)' }, { transform: 'scaleY(1)' }
    ], { duration: 2000, easing: 'ease-in-out' });
  }

  // ==================== HAPPY ====================
  happy() {
    this._resetPose();
    this._spawnStars(6);
    this.mouth.setAttribute('d', 'M 86 106 Q 100 126 114 106');
    this.mouth.animate([{ strokeWidth: 2 }, { strokeWidth: 3.2 }, { strokeWidth: 2 }],
      { duration: 500, iterations: 4 });
    this.cheeks.forEach(c => {
      c.animate([{ opacity: 0 }, { opacity: 0.9 }, { opacity: 0.9 }, { opacity: 0 }],
        { duration: 3000, easing: 'ease-in-out' });
    });
    this.eyelids.forEach(e => {
      e.animate([
        { opacity: 0 }, { opacity: 0.4 }, { opacity: 0 }, { opacity: 0.4 }, { opacity: 0 }
      ], { duration: 1400, iterations: 2, easing: 'ease-in-out' });
    });
    this.pupils.forEach(p => {
      p.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.15)' }, { transform: 'scale(1)' }],
        { duration: 900, iterations: 3, easing: 'ease-in-out' });
    });

    this.legContents.left.animate([
      { transform: 'rotate(0deg)' }, { transform: 'rotate(12deg)' }
    ], { duration: 400, fill: 'forwards', easing: 'ease-out' });
    this.legContents.right.animate([
      { transform: 'rotate(0deg)' }, { transform: 'rotate(-12deg)' }
    ], { duration: 400, fill: 'forwards', easing: 'ease-out' });

    this.root.animate([
      { transform: 'translateY(0) scaleY(1)' },
      { transform: 'translateY(5px) scaleY(0.94)' },
      { transform: 'translateY(-25px) scaleY(1.06)' },
      { transform: 'translateY(0) scaleY(0.96)' },
      { transform: 'translateY(3px) scaleY(0.98)' },
      { transform: 'translateY(-25px) scaleY(1.06)' },
      { transform: 'translateY(0) scaleY(0.96)' },
      { transform: 'translateY(3px) scaleY(0.98)' },
      { transform: 'translateY(-25px) scaleY(1.06)' },
      { transform: 'translateY(0) scaleY(1)' }
    ], { duration: 2400, iterations: 1, easing: 'ease-in-out', fill: 'forwards' });

    this._schedule(() => this._spawnSparks(4), 300);
    this._schedule(() => this._spawnSparks(4), 800);
    this._schedule(() => this._spawnSparks(4), 1300);
    this._schedule(() => this._spawnSparks(6), 1800);

    this.armContents.left.animate([
      { transform: 'rotate(0deg)' }, { transform: 'rotate(130deg)' }, { transform: 'rotate(80deg)' },
      { transform: 'rotate(130deg)' }, { transform: 'rotate(80deg)' }, { transform: 'rotate(130deg)' }, { transform: 'rotate(0deg)' }
    ], { duration: 2400, iterations: 1, easing: 'ease-in-out', fill: 'forwards' });
    this.armContents.right.animate([
      { transform: 'rotate(0deg)' }, { transform: 'rotate(-130deg)' }, { transform: 'rotate(-80deg)' },
      { transform: 'rotate(-130deg)' }, { transform: 'rotate(-80deg)' }, { transform: 'rotate(-130deg)' }, { transform: 'rotate(0deg)' }
    ], { duration: 2400, iterations: 1, easing: 'ease-in-out', fill: 'forwards' });

    if (this.shadow) {
      this.shadow.animate([
        { rx: 48, opacity: 1 }, { rx: 32, opacity: 0.5 }, { rx: 48, opacity: 1 }, { rx: 32, opacity: 0.5 },
        { rx: 48, opacity: 1 }, { rx: 32, opacity: 0.5 }, { rx: 48, opacity: 1 }
      ], { duration: 2400, iterations: 1, easing: 'ease-in-out', fill: 'forwards' });
    }
    if (this.core) {
      this.core.animate([
        { opacity: 1, transform: 'scale(1)' }, { opacity: 1, transform: 'scale(1.4)' },
        { opacity: 1, transform: 'scale(1.2)' }, { opacity: 1, transform: 'scale(1.4)' },
        { opacity: 1, transform: 'scale(1.2)' }, { opacity: 1, transform: 'scale(1.4)' }, { opacity: 1, transform: 'scale(1)' }
      ], { duration: 2400, iterations: 1, easing: 'ease-in-out' });
    }
    this.antennas.forEach((a, i) => {
      a.animate([
        { transform: 'rotate(0deg)' }, { transform: 'rotate(' + (i % 2 ? 12 : -12) + 'deg)' },
        { transform: 'rotate(0deg)' }, { transform: 'rotate(' + (i % 2 ? 12 : -12) + 'deg)' }, { transform: 'rotate(0deg)' }
      ], { duration: 800, iterations: 3, easing: 'ease-in-out' });
    });
  }

  sad() {
    this._resetPose();
    this.mouth.setAttribute('d', 'M 92 116 Q 100 108 108 116');
    this.pupils.forEach(p => {
      p.animate([{ transform: 'translate(0, 0)' }, { transform: 'translate(0, 3px)' }],
        { duration: 600, fill: 'forwards', easing: 'ease-out' });
    });
    this.irises.forEach(p => {
      p.animate([{ transform: 'translate(0, 0)' }, { transform: 'translate(0, 3px)' }],
        { duration: 600, fill: 'forwards', easing: 'ease-out' });
    });
    this.eyelids.forEach(e => {
      e.animate([{ opacity: 0 }, { opacity: 0.55 }], { duration: 600, fill: 'forwards', easing: 'ease-out' });
    });
    if (this.tear) {
      this.tear.setAttribute('opacity', '0');
      this._schedule(() => {
        if (this.state !== 'sad') return;
        this.tear.setAttribute('opacity', '1');
        this.tear.animate([
          { transform: 'translate(0, 0)',   opacity: 0 },
          { transform: 'translate(0, 0)',   opacity: 1 },
          { transform: 'translate(0, 4px)', opacity: 1 },
          { transform: 'translate(0, 26px)', opacity: 0 }
        ], { duration: 1600, iterations: 2, easing: 'ease-in' });
      }, 700);
    }
    this.head.animate([
      { transform: 'rotate(0deg) translateY(0)' },
      { transform: 'rotate(-6deg) translateY(4px)' }
    ], { duration: 800, fill: 'forwards', easing: 'ease-out' });
    this.armContents.left.animate([{ transform: 'rotate(0deg)' }, { transform: 'rotate(-6deg)' }],
      { duration: 800, fill: 'forwards', easing: 'ease-out' });
    this.armContents.right.animate([{ transform: 'rotate(0deg)' }, { transform: 'rotate(6deg)' }],
      { duration: 800, fill: 'forwards', easing: 'ease-out' });
    this._schedule(() => {
      if (this.state !== 'sad') return;
      this.root.animate([
        { transform: 'translateX(0)' }, { transform: 'translateX(-1.5px)' }, { transform: 'translateX(1.5px)' },
        { transform: 'translateX(0)' }, { transform: 'translateX(-1.5px)' }, { transform: 'translateX(1.5px)' },
        { transform: 'translateX(0)' }
      ], { duration: 700, iterations: 3, easing: 'ease-in-out' });
    }, 1000);
    if (this.core) this.core.animate([{ opacity: 1 }, { opacity: 0.35 }], { duration: 900, fill: 'forwards' });
    if (this.coreHalo) this.coreHalo.animate([{ opacity: 0.7 }, { opacity: 0.15 }], { duration: 900, fill: 'forwards' });
  }

  dance() {
    this._resetPose();
    const beat = 420;
    this.mouth.setAttribute('d', 'M 86 106 Q 100 126 114 106');
    this.cheeks.forEach(c => c.setAttribute('opacity', '0.85'));
    this.eyelids.forEach(e => e.setAttribute('opacity', '0.35'));

    for (let i = 0; i < 4; i++) {
      this._schedule(() => this._spawnStars(3), i * 600);
    }
    this._spawnConfetti(15);
    this._schedule(() => this._spawnConfetti(15), 1500);

    this.root.animate([
      { transform: 'translateY(0) rotate(0deg) translateX(0)' },
      { transform: 'translateY(-6px) rotate(-7deg) translateX(-3px)' },
      { transform: 'translateY(0) rotate(0deg) translateX(0)' },
      { transform: 'translateY(-6px) rotate(7deg) translateX(3px)' },
      { transform: 'translateY(0) rotate(0deg) translateX(0)' }
    ], { duration: beat * 4, iterations: Infinity, easing: 'ease-in-out' });

    this.head.animate([
      { transform: 'rotate(0deg)' }, { transform: 'rotate(10deg)' }, { transform: 'rotate(0deg)' },
      { transform: 'rotate(-10deg)' }, { transform: 'rotate(0deg)' }
    ], { duration: beat * 4, iterations: Infinity, easing: 'ease-in-out' });

    this.armContents.left.animate([
      { transform: 'rotate(0deg)' }, { transform: 'rotate(140deg)' }, { transform: 'rotate(0deg)' }
    ], { duration: beat * 2, iterations: Infinity, easing: 'ease-in-out' });
    this.armContents.right.animate([
      { transform: 'rotate(0deg)' }, { transform: 'rotate(-140deg)' }, { transform: 'rotate(0deg)' }
    ], { duration: beat * 2, iterations: Infinity, easing: 'ease-in-out', delay: beat });

    this.legContents.left.animate([
      { transform: 'rotate(0deg)' }, { transform: 'rotate(10deg)' }, { transform: 'rotate(0deg)' }
    ], { duration: beat, iterations: Infinity, easing: 'ease-in-out' });
    this.legContents.right.animate([
      { transform: 'rotate(0deg)' }, { transform: 'rotate(-10deg)' }, { transform: 'rotate(0deg)' }
    ], { duration: beat, iterations: Infinity, easing: 'ease-in-out', delay: beat / 2 });

    if (this.core) {
      this.core.animate([
        { transform: 'scale(1)', opacity: 1 }, { transform: 'scale(1.35)', opacity: 1 }, { transform: 'scale(1)', opacity: 1 }
      ], { duration: beat, iterations: Infinity, easing: 'ease-in-out' });
    }
    this.antennas.forEach((a, i) => {
      a.animate([
        { transform: 'rotate(0deg)' }, { transform: 'rotate(' + (i % 2 ? 20 : -20) + 'deg)' },
        { transform: 'rotate(0deg)' }, { transform: 'rotate(' + (i % 2 ? 20 : -20) + 'deg)' }, { transform: 'rotate(0deg)' }
      ], { duration: beat * 2, iterations: Infinity, easing: 'ease-in-out' });
    });
  }

  jump() {
    this._resetPose();
    this.mouth.setAttribute('d', 'M 86 106 Q 100 126 114 106');
    this.cheeks.forEach(c => c.setAttribute('opacity', '0.65'));
    this.root.animate([
      { transform: 'translateY(0) scale(1,1)' },
      { transform: 'translateY(6px) scale(1.05,0.92)' },
      { transform: 'translateY(-35px) scale(0.94,1.1)' },
      { transform: 'translateY(0) scale(1.05,0.92)' },
      { transform: 'translateY(0) scale(1,1)' }
    ], { duration: 900, easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)' });
    this._schedule(() => this._spawnSparks(5), 800);
    this.armContents.left.animate([{ transform: 'rotate(0deg)' }, { transform: 'rotate(120deg)' }, { transform: 'rotate(0deg)' }],
      { duration: 900, easing: 'ease-in-out' });
    this.armContents.right.animate([{ transform: 'rotate(0deg)' }, { transform: 'rotate(-120deg)' }, { transform: 'rotate(0deg)' }],
      { duration: 900, easing: 'ease-in-out' });
    this.legContents.left.animate([{ transform: 'rotate(0deg)' }, { transform: 'rotate(18deg)' }, { transform: 'rotate(0deg)' }],
      { duration: 900, easing: 'ease-in-out' });
    this.legContents.right.animate([{ transform: 'rotate(0deg)' }, { transform: 'rotate(-18deg)' }, { transform: 'rotate(0deg)' }],
      { duration: 900, easing: 'ease-in-out' });
    if (this.shadow) {
      this.shadow.animate([{ rx: 48, opacity: 1 }, { rx: 28, opacity: 0.3 }, { rx: 48, opacity: 1 }],
        { duration: 900, easing: 'ease-in-out' });
    }
  }

  listen() {
    this._resetPose();
    this.head.animate([
      { transform: 'rotate(0deg)' }, { transform: 'rotate(4deg)' },
      { transform: 'rotate(-4deg)' }, { transform: 'rotate(0deg)' }
    ], { duration: 1400, iterations: Infinity, easing: 'ease-in-out' });
    this.antennas.forEach((a, i) => {
      a.animate([
        { transform: 'rotate(0deg)' }, { transform: 'rotate(' + (i % 2 ? 8 : -8) + 'deg)' }, { transform: 'rotate(0deg)' }
      ], { duration: 900 + i * 150, iterations: Infinity, easing: 'ease-in-out' });
    });
  }

  think() {
    this._resetPose();
    this.pupils.forEach(p => {
      p.animate([{ transform: 'translate(0, 0)' }, { transform: 'translate(2.5px, -2.5px)' }],
        { duration: 600, fill: 'forwards', easing: 'ease-out' });
    });
    this.irises.forEach(p => {
      p.animate([{ transform: 'translate(0, 0)' }, { transform: 'translate(2.5px, -2.5px)' }],
        { duration: 600, fill: 'forwards', easing: 'ease-out' });
    });
    this.mouth.setAttribute('d', 'M 96 110 Q 100 114 104 110 Q 100 116 96 110');
    this.head.animate([
      { transform: 'rotate(0deg)' }, { transform: 'rotate(-3deg)' }, { transform: 'rotate(0deg)' }
    ], { duration: 2400, iterations: Infinity, easing: 'ease-in-out' });
  }

  thinking() {
    this._resetPose();
    this.armContents.right.animate([
      { transform: 'rotate(0deg)' }, { transform: 'rotate(-155deg)' },
      { transform: 'rotate(-150deg)' }, { transform: 'rotate(-155deg)' }
    ], { duration: 2400, iterations: Infinity, easing: 'ease-in-out' });
    this.head.animate([
      { transform: 'rotate(0deg)' }, { transform: 'rotate(4deg)' },
      { transform: 'rotate(-2deg)' }, { transform: 'rotate(4deg)' }, { transform: 'rotate(0deg)' }
    ], { duration: 2400, iterations: Infinity, easing: 'ease-in-out' });
    this.pupils.forEach(p => p.setAttribute('transform', 'translate(2, -3)'));
    this.mouth.setAttribute('d', 'M 94 112 Q 100 110 106 112');
  }

  waiting() {
    this._resetPose();
    this.root.animate([
      { transform: 'translateY(0) rotate(0deg)' },
      { transform: 'translateY(-2px) rotate(-2deg)' },
      { transform: 'translateY(0) rotate(0deg)' },
      { transform: 'translateY(-2px) rotate(2deg)' },
      { transform: 'translateY(0) rotate(0deg)' }
    ], { duration: 2400, iterations: Infinity, easing: 'ease-in-out' });
    this.pupils.forEach(p => {
      p.animate([
        { transform: 'translate(0, 0)' }, { transform: 'translate(3px, 0)' },
        { transform: 'translate(-3px, 0)' }, { transform: 'translate(0, 0)' }
      ], { duration: 3000, iterations: Infinity, easing: 'ease-in-out' });
    });
    this.irises.forEach(p => {
      p.animate([
        { transform: 'translate(0, 0)' }, { transform: 'translate(3px, 0)' },
        { transform: 'translate(-3px, 0)' }, { transform: 'translate(0, 0)' }
      ], { duration: 3000, iterations: Infinity, easing: 'ease-in-out' });
    });
    this._scheduleBlink();
  }

  encourage() {
    this._resetPose();
    this.mouth.animate([
      { d: 'path("M 92 110 Q 100 118 108 110")' },
      { d: 'path("M 90 108 Q 100 120 110 108")' },
      { d: 'path("M 92 110 Q 100 118 108 110")' }
    ], { duration: 1500, easing: 'ease-in-out' });
    this.armContents.left.animate([
      { transform: 'rotate(0deg)' }, { transform: 'rotate(120deg)' },
      { transform: 'rotate(90deg)' }, { transform: 'rotate(120deg)' },
      { transform: 'rotate(90deg)' }, { transform: 'rotate(120deg)' }, { transform: 'rotate(0deg)' }
    ], { duration: 2200, easing: 'ease-in-out' });
    this.cheeks.forEach(c => {
      c.animate([{ opacity: 0 }, { opacity: 0.7 }, { opacity: 0.7 }, { opacity: 0 }],
        { duration: 2400, easing: 'ease-in-out' });
    });
  }

  nervous() {
    this._resetPose();
    this.root.animate([
      { transform: 'translateX(0)' }, { transform: 'translateX(-1px)' },
      { transform: 'translateX(1px)' }, { transform: 'translateX(0)' }
    ], { duration: 120, iterations: 20, easing: 'ease-in-out' });
    for (let i = 0; i < 6; i++) {
      this._schedule(() => { if (this.state !== 'nervous') return; this._blink(); }, i * 250);
    }
    this.mouth.setAttribute('d', 'M 96 112 L 104 112');
  }

  lastSecond() {
    this._resetPose();
    this.mouth.animate([
      { d: 'path("M 92 110 Q 100 118 108 110")' },
      { d: 'path("M 94 110 Q 100 116 106 110 Q 100 122 94 110")' },
      { d: 'path("M 92 110 Q 100 118 108 110")' }
    ], { duration: 800, iterations: 2, easing: 'ease-in-out' });
    this.eyes.forEach(eye => {
      eye.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.2)' }, { transform: 'scale(1)' }],
        { duration: 800, iterations: 2, easing: 'ease-in-out' });
    });
  }

  wink() {
    this._resetPose();
    this._schedule(() => {
      this.eyes[1].animate([{ transform: 'scaleY(1)' }, { transform: 'scaleY(0.1)' }, { transform: 'scaleY(1)' }],
        { duration: 400, easing: 'ease-in-out' });
    }, 100);
    this.armContents.right.animate([
      { transform: 'rotate(0deg)' }, { transform: 'rotate(-130deg)' },
      { transform: 'rotate(-130deg)' }, { transform: 'rotate(0deg)' }
    ], { duration: 1400, easing: 'ease-in-out' });
  }

  shrug() {
    this._resetPose();
    this.armContents.left.animate([
      { transform: 'rotate(0deg)' }, { transform: 'rotate(40deg)' },
      { transform: 'rotate(40deg)' }, { transform: 'rotate(0deg)' }
    ], { duration: 1600, easing: 'ease-in-out' });
    this.armContents.right.animate([
      { transform: 'rotate(0deg)' }, { transform: 'rotate(-40deg)' },
      { transform: 'rotate(-40deg)' }, { transform: 'rotate(0deg)' }
    ], { duration: 1600, easing: 'ease-in-out' });
    this.root.animate([
      { transform: 'translateY(0)' }, { transform: 'translateY(-3px)' },
      { transform: 'translateY(-3px)' }, { transform: 'translateY(0)' }
    ], { duration: 1600, easing: 'ease-in-out' });
  }

  bow() {
    this._resetPose();
    this.head.animate([
      { transform: 'rotate(0deg)' }, { transform: 'rotate(20deg)' },
      { transform: 'rotate(20deg)' }, { transform: 'rotate(0deg)' }
    ], { duration: 1800, easing: 'ease-in-out' });
    this.pupils.forEach(p => {
      p.animate([
        { transform: 'translate(0, 0)' }, { transform: 'translate(0, 4px)' },
        { transform: 'translate(0, 4px)' }, { transform: 'translate(0, 0)' }
      ], { duration: 1800, easing: 'ease-in-out' });
    });
  }

  _bindInteractions() {
    this.svg.style.cursor = 'pointer';
    this.svg.addEventListener('click', () => {
      if (this.state === 'idle') {
        this.jump();
        this._schedule(() => { if (this.state === 'idle') this.idle(); }, 1000);
      }
    });
  }

  onCorrect() {
    this.setState('happy');
    this._schedule(() => { if (this.state === 'happy') this.setState('idle'); }, 2600);
  }
  onWrong() {
    this.setState('sad');
    this._schedule(() => { if (this.state === 'sad') this.setState('idle'); }, 2600);
  }
  onComplete() {
    this.setState('dance');
    this._schedule(() => { if (this.state === 'dance') this.setState('idle'); }, 6000);
  }
  onListen()       { this.setState('listen'); }
  onThink()        { this.setState('think'); }
  onIdle()         { this.setState('idle'); }
  onJump()         { this.jump(); this._schedule(() => { if (this.state === 'idle') this.idle(); }, 1000); }
  onThinking()     { this.setState('thinking'); }
  onWaiting()      { this.setState('waiting'); }
  onNervous()      { this.setState('nervous'); this._schedule(() => { if (this.state === 'nervous') this.setState('idle'); }, 2000); }
  onLastSecond()   { this.setState('lastSecond'); }
  onWink()         { this.setState('wink'); this._schedule(() => { if (this.state === 'wink') this.setState('idle'); }, 1500); }
  onShrug()        { this.setState('shrug'); this._schedule(() => { if (this.state === 'shrug') this.setState('idle'); }, 1800); }
  onBow()          { this.setState('bow'); this._schedule(() => { if (this.state === 'bow') this.setState('idle'); }, 2000); }
  onEncourage()    { this.setState('encourage'); this._schedule(() => { if (this.state === 'encourage') this.setState('idle'); }, 2400); }

  // Публичные методы для запуска сцен
  onEatApple()        { if (this.state === 'idle') this._eatAppleScene(); }
  onEatPizza()        { if (this.state === 'idle') this._eatPizzaScene(); }
  onEatDonut()        { if (this.state === 'idle') this._eatDonutScene(); }
  onPlayBall()        { if (this.state === 'idle') this._playBallScene(); }
  onCarryBox()        { if (this.state === 'idle') this._carryBoxScene(); }
  onSleep()           { if (this.state === 'idle') this._sleepScene(); }
  onExercise()        { if (this.state === 'idle') this._exerciseScene(); }
  onMeditate()        { if (this.state === 'idle') this._meditateScene(); }
  onPhoto()           { if (this.state === 'idle') this._photoScene(); }
  onConfettiDance()   { if (this.state === 'idle') this._confettiDance(); }
  onConduct()         { if (this.state === 'idle') this._conductScene(); }

  // Ходьба и бег (публичные)
  walk(steps, direction, speed) { this._walk(steps, direction, speed); }
  returnHome(duration)          { this._returnHome(duration); }

  destroy() {
    this._isDestroyed = true;
    if (this._sleepHeadRAF) cancelAnimationFrame(this._sleepHeadRAF);
    if (this._danceRAF) cancelAnimationFrame(this._danceRAF);
    this._resetPose();
    this._clearTimers();
    if (this._ambientFrame) cancelAnimationFrame(this._ambientFrame);
    if (this.container) this.container.innerHTML = '';
  }
}

window.Robot = Robot;ф