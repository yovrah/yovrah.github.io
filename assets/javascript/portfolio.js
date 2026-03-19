'use strict';

const ipgeolocation = 'https://api.ipgeolocation.io/ipgeo?apiKey=71d5413f6eb746e9bbbae5559f600a0a';
const visitCounterKey = 'yovrah-github-io/site-visits';
const visitCounterHosts = ['https://api.countapi.xyz', 'https://countapi.xyz'];

const timeouts = [];
const scrambleChars = ';#$&983*№%@!?01ABCDEF';

const mobileAndTabletCheck = () => /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
const getBrowserName = () => {
    const ua = navigator.userAgent;

    if (ua.includes('Edg/')) return 'Edge';
    if (ua.includes('OPR/') || ua.includes('Opera')) return 'Opera';
    if (ua.includes('Chrome/') && !ua.includes('Edg/')) return 'Chrome';
    if (ua.includes('Firefox/')) return 'Firefox';
    if (ua.includes('Safari/') && !ua.includes('Chrome/')) return 'Safari';

    return 'UnknownBrowser';
};

const scrambleText = (text, reveal = 0) => {
    let output = '';
    const revealCount = Math.floor(text.length * reveal);

    for (let i = 0; i < text.length; i++) {
        output += i < revealCount ? text[i] : scrambleChars[Math.floor(Math.random() * scrambleChars.length)];
    }

    return output;
};

const animateDecrypt = (element, finalText, frames = 20, intervalMs = 45) => {
    if (!element) return;

    let frame = 0;
    const interval = setInterval(() => {
        frame++;
        element.textContent = scrambleText(finalText, frame / frames);

        if (frame >= frames) {
            clearInterval(interval);
            element.textContent = finalText;
        }
    }, intervalMs);
};

const initVisitCounter = () => {
    if (document.getElementById('terminal-visits')) return;

    const counter = document.createElement('div');
    counter.id = 'terminal-visits';
    counter.textContent = `${ts()} [visits] decrypting...`;
    document.body.appendChild(counter);
    let lastValue = '...';
    const fallbackKey = 'yovrah_local_visits';

    const readFallback = () => {
        const value = Number(localStorage.getItem(fallbackKey) || '0');
        return Number.isFinite(value) && value > 0 ? value : 1;
    };

    const incFallback = () => {
        const next = readFallback() + 1;
        localStorage.setItem(fallbackKey, String(next));
        return next;
    };

    const setCounterLine = (countText) => {
        const line = `${ts()} [visits] total=${countText}`;
        animateDecrypt(counter, line, 14, 36);
    };

    const fetchCount = (mode = 'get') => {
        const paths = visitCounterHosts.map((host) => `${host}/${mode}/${visitCounterKey}`);
        let index = 0;

        const tryNext = () => {
            if (index >= paths.length) {
                return Promise.reject(new Error('counter unavailable'));
            }

            const url = paths[index++];
            return Promise.race([
                fetch(url),
                new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 5000))
            ])
                .then((response) => {
                    if (!response.ok) throw new Error(`status ${response.status}`);
                    return response.json();
                })
                .then((data) => {
                    if (typeof data.value !== 'number') throw new Error('bad payload');
                    return data.value;
                })
                .catch(tryNext);
        };

        return tryNext();
    };

    const refreshVisitValue = () => fetchCount('get')
        .then((value) => {
            lastValue = String(value);
            setCounterLine(lastValue);
        })
        .catch(() => {
            if (lastValue === '...') lastValue = String(readFallback());
            setCounterLine(lastValue);
        });

    fetchCount('hit')
        .then((value) => {
            lastValue = String(value);
            setCounterLine(lastValue);
        })
        .catch(() => {
            lastValue = String(incFallback());
            setCounterLine(lastValue);
        });

    setInterval(() => {
        refreshVisitValue();
    }, 45000);

    setInterval(() => {
        const line = `${ts()} [visits] total=${lastValue}`;
        animateDecrypt(counter, line, 10, 34);
    }, 9000);
};

const playConfirmBeep = () => {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;

    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'square';
    osc.frequency.value = 920;
    gain.gain.value = 0.02;

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.06);
};

const initTerminalConsole = () => {
    if (document.getElementById('terminal-console')) return;

    const root = document.createElement('div');
    root.id = 'terminal-console';
    root.innerHTML = `
        <div id="terminal-stats"></div>
        <div id="terminal-log"></div>
        <div class="terminal-row">
            <span class="terminal-prompt">&gt;</span>
            <input id="terminal-input" type="text" autocomplete="off" spellcheck="false" placeholder="type: help" />
        </div>
    `;
    document.body.appendChild(root);
    const updateConsoleHeight = () => {
        document.documentElement.style.setProperty('--terminal-console-height', `${root.offsetHeight}px`);
    };

    const startedAt = Date.now();
    const stats = document.getElementById('terminal-stats');
    const log = document.getElementById('terminal-log');
    const input = document.getElementById('terminal-input');
    const quotes = [
        'stay sharp, stay online',
        'silence is also a signal',
        'glitch less, ship more',
        'one line can change everything'
    ];
    let quote = quotes[Math.floor(Math.random() * quotes.length)];
    let matrixTicker = null;
    let matrixCanvas = null;
    let matrixCtx = null;
    let matrixDrops = [];
    const filterClasses = ['fx-mono', 'fx-invert', 'fx-crt', 'fx-glitch', 'fx-neon'];
    const missions = {
        cmd: false,
        music: false,
        link: false
    };

    const unlockMission = (key, text) => {
        if (missions[key]) return;
        missions[key] = true;
        print(`[mission] unlocked :: ${text}`);
    };

    const setTheme = (name) => {
        const rootStyle = document.documentElement.style;
        if (name === 'red') {
            rootStyle.setProperty('--terminal-accent', '#ff6d8a');
            rootStyle.setProperty('--terminal-glow', 'rgba(255, 84, 125, 0.55)');
            print('theme switched: red');
            return;
        }

        rootStyle.setProperty('--terminal-accent', '#7dffb8');
        rootStyle.setProperty('--terminal-glow', 'rgba(62, 255, 157, 0.55)');
        print('theme switched: blue');
    };

    const setVisualFilter = (name) => {
        filterClasses.forEach((className) => document.body.classList.remove(className));
        if (name && name !== 'none') document.body.classList.add(`fx-${name}`);
        print(`filter set: ${name || 'none'}`);
    };

    const ensureMatrixCanvas = () => {
        if (matrixCanvas) return;

        matrixCanvas = document.createElement('canvas');
        matrixCanvas.id = 'matrix-layer';
        document.body.appendChild(matrixCanvas);
        matrixCtx = matrixCanvas.getContext('2d');

        const resize = () => {
            matrixCanvas.width = window.innerWidth;
            matrixCanvas.height = window.innerHeight;
            matrixDrops = new Array(Math.ceil(matrixCanvas.width / 14)).fill(0);
        };

        resize();
        window.addEventListener('resize', resize);
    };

    const startMatrix = () => {
        ensureMatrixCanvas();
        if (!matrixCtx || matrixTicker) return;

        document.body.classList.add('matrix-mode');
        matrixTicker = setInterval(() => {
            matrixCtx.fillStyle = 'rgba(0, 0, 0, 0.08)';
            matrixCtx.fillRect(0, 0, matrixCanvas.width, matrixCanvas.height);
            matrixCtx.fillStyle = '#63ff8a';
            matrixCtx.font = '14px consolas, monospace';

            for (let i = 0; i < matrixDrops.length; i++) {
                const text = String.fromCharCode(0x30A0 + Math.random() * 96);
                const x = i * 14;
                const y = matrixDrops[i] * 14;
                matrixCtx.fillText(text, x, y);

                if (y > matrixCanvas.height && Math.random() > 0.975) matrixDrops[i] = 0;
                matrixDrops[i]++;
            }
        }, 55);
    };

    const stopMatrix = () => {
        document.body.classList.remove('matrix-mode');
        if (matrixTicker) {
            clearInterval(matrixTicker);
            matrixTicker = null;
        }
        if (matrixCtx && matrixCanvas) {
            matrixCtx.clearRect(0, 0, matrixCanvas.width, matrixCanvas.height);
        }
    };

    const print = (text) => {
        const line = document.createElement('div');
        line.className = 'terminal-line';
        line.textContent = `${ts()} ${text}`;
        log.appendChild(line);

        while (log.children.length > 4) {
            log.removeChild(log.firstChild);
        }

        updateConsoleHeight();
    };

    const formatUptime = () => {
        const secs = Math.floor((Date.now() - startedAt) / 1000);
        const mm = String(Math.floor(secs / 60)).padStart(2, '0');
        const ss = String(secs % 60).padStart(2, '0');
        return `${mm}:${ss}`;
    };

    const renderStats = () => {
        const playing = app.audioElement && !app.audioElement.paused ? 'playing' : 'paused';
        stats.textContent = `[stats] uptime:${formatUptime()} | track:${playing} | quote:"${quote}"`;
    };

    renderStats();
    updateConsoleHeight();
    setInterval(renderStats, 1000);
    setInterval(() => {
        quote = quotes[Math.floor(Math.random() * quotes.length)];
    }, 12000);

    document.addEventListener('click', (event) => {
        const anchor = event.target.closest ? event.target.closest('a[target="_blank"]') : null;
        if (!anchor) return;
        unlockMission('link', 'opened external link');
    });

    print('terminal ready :: type "help"');

    input.addEventListener('keydown', (event) => {
        if (event.key !== 'Enter') return;

        const raw = input.value.trim();
        if (!raw) return;

        const tokens = raw.toLowerCase().split(/\s+/);
        const command = tokens[0];
        const arg = tokens[1];
        print(`> ${raw}`);
        unlockMission('cmd', 'first command entered');

        if (command === 'help') {
            print('base: help, about, contact, clear, stats, music on, music off');
            print('secret: matrix on/off, whoami, sudo, theme red/blue, pixel on/off');
            print('filters: filter mono|invert|crt|glitch|neon|none');
        } else if (command === 'about') {
            print('yovrah.github.io // terminal profile');
        } else if (command === 'contact') {
            print('telegram: @im2sexy | steam: /id/yovrah');
        } else if (command === 'stats') {
            renderStats();
            print(stats.textContent.replace('[stats] ', ''));
        } else if (command === 'clear') {
            log.innerHTML = '';
            updateConsoleHeight();
        } else if (command === 'music' && arg === 'on') {
            if (app.audioElement) {
                app.audioElement.play();
                if (app.videoElement && !app.shouldIgnoreVideo) app.videoElement.play();
                app.backgroundToggler = true;
                print('music enabled');
                unlockMission('music', 'used music controls');
            } else {
                print('audio device unavailable');
            }
        } else if (command === 'music' && arg === 'off') {
            if (app.audioElement) {
                app.audioElement.pause();
                if (app.videoElement && !app.shouldIgnoreVideo) app.videoElement.pause();
                app.backgroundToggler = false;
                print('music disabled');
                unlockMission('music', 'used music controls');
            } else {
                print('audio device unavailable');
            }
        } else if (command === 'matrix') {
            playConfirmBeep();
            const mode = arg || (document.body.classList.contains('matrix-mode') ? 'off' : 'on');
            if (mode === 'on') {
                startMatrix();
                print('matrix stream active // wake up, neon rider');
            } else if (mode === 'off') {
                stopMatrix();
                print('matrix stream offline');
            } else {
                print('usage: matrix on|off');
            }
        } else if (command === 'whoami') {
            playConfirmBeep();
            print(`visitor@${getBrowserName().toLowerCase()} // ghost-session`);
        } else if (command === 'sudo') {
            playConfirmBeep();
            print('permission denied: this incident will be reported');
        } else if (command === 'theme' && (arg === 'red' || arg === 'blue')) {
            playConfirmBeep();
            setTheme(arg);
        } else if (command === 'pixel' && (arg === 'on' || arg === 'off')) {
            playConfirmBeep();
            document.body.classList.toggle('pixel-mode', arg === 'on');
            print(`pixel mode ${arg}`);
        } else if (command === 'filter' && ['mono', 'invert', 'crt', 'glitch', 'neon', 'none'].includes(arg)) {
            playConfirmBeep();
            setVisualFilter(arg);
        } else {
            print(`unknown command: ${raw}`);
        }

        input.value = '';
    });

    window.addEventListener('resize', updateConsoleHeight);
};

$(document).ready(() => {
    const links = [
        {
            name: 'made with ❤ by yovrah',
            link: '76561198439688262',
    }
  ];

    for (let i in links) {
        let link = links[i];

        $('#marquee').append(`<a href="${link.link}" target="_BLANK">${link.name}</a>`);

        link = $('#marquee').children('a').last();

        if (i != links.length - 1) $('#marquee').append('<img class="emoticon" src="assets/icons/icons16.png">');
    }

    if (mobileAndTabletCheck()) {
        $('#background').replaceWith('<div id="background" style="background-image: url(assets/image/ae3e18841ce9527dd4d47419c2f2ccc4.jpg);"></div>');

        app.shouldIgnoreVideo = true;
    }

    app.titleChanger(['y', 'yo', 'yov', 'yovr', 'yovra', 'yovrah', 'yovrah.github.io', 'psilo - Kill Again']);
    app.iconChanger(['assets/icons/baby.png']);
});

if ($.cookie('videoTime')) {
    app.videoElement.currentTime = $.cookie('videoTime');
    app.audioElement.currentTime = $.cookie('videoTime');
}

document.addEventListener('contextmenu', (event) => {
    event.preventDefault();
});

document.body.onkeyup = (event) => {
    if (event.keyCode == 32 && app.skippedIntro) {
        if (app.backgroundToggler) {
            app.videoElement.play();
            app.audioElement.play();
        } else {
            app.videoElement.pause();
            app.audioElement.pause();
        }

        return (app.backgroundToggler = !app.backgroundToggler);
    }
};

$('html').on('contextmenu', (event) => {
    const img = document.createElement('img');

    const trollfaceLight = app.skippedIntro ? '' : 'trollface-light';

    img.src = 'assets/icons/rose.png';
    img.width = 25;
    img.height = 25;
    img.alt = 'fullbright';
    img.style = `position: absolute; left: ${event.pageX}px; top: ${event.pageY}px; z-index: 10`;
    img.className = `troll ${trollfaceLight}`;

    document.body.appendChild(img);
});

setInterval(() => {
    $('.troll').remove();
}, 1000000000);

$('.skip').click(() => {
    skipIntro();
});

$.fn.extend({
    animateCss: function (animationName) {
        const animationEnd = 'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend';

        this.addClass(`animated ${animationName}`).one(animationEnd, () => {
            $(this).removeClass(`animated ${animationName}`);
        });

        return this;
    },
});

const writeLine = (text, speed, timeout, callback) => {
    if (typeof timeout === 'function') {
        callback = timeout;
        timeout = 0;
    }

    timeout = typeof timeout === 'number' ? timeout : 0;

    const lineNumber = ++app.id;
    const strings = Array.isArray(text) ? text : [text];

    setTimeout(() => {
        const typed = new Typed(`#line${lineNumber}`, {
            strings: strings,
            typeSpeed: speed,
            onComplete: callback,
        });
    }, timeout);
};

const writeLines = (lines, speed, timeout, callback) => {
    const queue = Array.isArray(lines) ? lines : [lines];
    let index = 0;
    const linePause = 120;

    const next = () => {
        if (index >= queue.length) {
            if (callback) callback();
            return;
        }

        const delay = index === 0 ? timeout : linePause;
        writeLine(queue[index++], speed, delay, next);
    };

    next();
};

const decodeLine = (selector, finalText, callback) => {
    const element = document.querySelector(selector);

    if (!element) {
        if (callback) callback();
        return;
    }

    const chars = ';#$&983*№%@!?';
    const totalFrames = 24;
    let frame = 0;

    const interval = setInterval(() => {
        if (app.skippedIntro) return clearInterval(interval);

        const reveal = Math.floor((frame / totalFrames) * finalText.length);
        let output = '';

        for (let i = 0; i < finalText.length; i++) {
            output += i < reveal ? finalText[i] : chars[Math.floor(Math.random() * chars.length)];
        }

        element.textContent = output;
        frame++;

        if (frame > totalFrames) {
            clearInterval(interval);
            element.textContent = finalText;
            if (callback) callback();
        }
    }, 42);
};

const ts = () => {
    const now = new Date();
    return `[${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}]`;
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const typeText = async (selector, text, speed = 12, append = false) => {
    const element = document.querySelector(selector);
    if (!element) return false;

    if (!append) element.textContent = '';

    for (let i = 0; i < text.length; i++) {
        if (app.skippedIntro) return false;
        element.textContent += text[i];
        await sleep(speed);
    }

    return true;
};

const typeColoredParts = async (selector, parts, speed = 12, append = false) => {
    const element = document.querySelector(selector);
    if (!element) return false;

    if (!append) element.innerHTML = '';

    for (let p = 0; p < parts.length; p++) {
        if (app.skippedIntro) return false;

        const part = parts[p];
        const span = document.createElement('span');
        if (part.color) span.style.color = part.color;
        element.appendChild(span);

        for (let i = 0; i < part.text.length; i++) {
            if (app.skippedIntro) return false;
            span.textContent += part.text[i];
            await sleep(speed);
        }
    }

    return true;
};

const eraseText = async (selector, speed = 7) => {
    const element = document.querySelector(selector);
    if (!element) return false;

    while (element.textContent.length > 0) {
        if (app.skippedIntro) return false;
        element.textContent = element.textContent.slice(0, -1);
        await sleep(speed);
    }

    return true;
};

const runIntro = (data = {}) => {
    writeLines([
        `${ts()} [boot] yovrah.node :: cold-start`,
        `${ts()} <span style='font-size: 14px; color: #00FF00;'>Authentication...</span>`,
        `${ts()} Providing access to <span style='font-size: 14px; color: #FF0000;'>[unidentified]</span>...`
    ], 22, 0, () => {
        if (app.skippedIntro) return;

        clearCursor();

        const usernames = ['user', 'dude'];

        const ip = data.ip ? data.ip : usernames[Math.floor(Math.random() * usernames.length)];
        const country = data.country_name ? data.country_name : 'your country';
        const city = data.city ? data.city : 'your city';
        const timezone = data.time_zone && data.time_zone.name ? data.time_zone.name : 'unknown-tz';
        const isp = data.isp ? data.isp : 'unknown-isp';
        const os = navigator.platform ? navigator.platform : 'unknown-os';
        const browser = getBrowserName();
        const language = navigator.language ? navigator.language : 'unknown-lang';
        const screenSize = window.screen && window.screen.width && window.screen.height ? `${window.screen.width}x${window.screen.height}` : 'unknown-screen';

        decodeLine('#line4', `${ts()} [decode] session token -> validated`, () => {
            if (app.skippedIntro) return;

            app.id = 7;
            clearCursor();

            (async () => {
                const metaLine = '#line5';
                const clientLine = '#line6';
                const missionLine = '#line7';
                const fast = 16;
                const metaSpeed = 26;
                const metaStamp = ts();

                if (!(await typeColoredParts(metaLine, [
                    { text: `${metaStamp} `, color: '#9da7c0' },
                    { text: '[geo]', color: '#7f9fff' },
                    { text: ` ${country}, ${city}`, color: '#edf2ff' },
                    { text: ' | ', color: '#8f9bc1' },
                    { text: 'note', color: '#8f9bc1' },
                    { text: ': ', color: '#8f9bc1' },
                    { text: 'clean route', color: '#7fffd1' },
                    { text: ' | ', color: '#8f9bc1' },
                    { text: 'ip', color: '#78a2ff' },
                    { text: ': ', color: '#8f9bc1' },
                    { text: ip, color: '#39c8ff' },
                    { text: ' | ', color: '#8f9bc1' },
                    { text: 'provider', color: '#8f9bc1' },
                    { text: ': ', color: '#8f9bc1' },
                    { text: isp, color: '#ffbe6e' },
                    { text: ' | ', color: '#8f9bc1' },
                    { text: 'device', color: '#8f9bc1' },
                    { text: ': ', color: '#8f9bc1' },
                    { text: os, color: '#ffffff' },
                    { text: ' | ', color: '#8f9bc1' },
                    { text: 'tz', color: '#8f9bc1' },
                    { text: ': ', color: '#8f9bc1' },
                    { text: timezone, color: '#d29dff' }
                ], metaSpeed))) return;
                clearCursor();

                await sleep(180);
                if (!(await typeColoredParts(clientLine, [
                    { text: `${ts()} `, color: '#9da7c0' },
                    { text: '[client]', color: '#7f9fff' },
                    { text: ' browser', color: '#8f9bc1' },
                    { text: ': ', color: '#8f9bc1' },
                    { text: browser, color: '#7dffb8' },
                    { text: ' | os', color: '#8f9bc1' },
                    { text: ': ', color: '#8f9bc1' },
                    { text: os, color: '#ffffff' },
                    { text: ' | lang', color: '#8f9bc1' },
                    { text: ': ', color: '#8f9bc1' },
                    { text: language, color: '#39c8ff' },
                    { text: ' | screen', color: '#8f9bc1' },
                    { text: ': ', color: '#8f9bc1' },
                    { text: screenSize, color: '#d29dff' }
                ], fast))) return;
                clearCursor();

                await sleep(260);
                if (!(await typeText(missionLine, `${ts()} [mission] node-extract / priority HIGH`, fast))) return;
                clearCursor();
                await sleep(560);
                if (!(await eraseText(missionLine, 9))) return;
                if (!(await typeText(missionLine, `${ts()} [log] firewall probe countered`, fast))) return;
                clearCursor();
                await sleep(540);
                if (!(await eraseText(missionLine, 9))) return;
                if (!(await typeColoredParts(missionLine, [
                    { text: `${ts()} `, color: '#9da7c0' },
                    { text: 'Access granted', color: '#ffffff' },
                    { text: ' ', color: '#e2e6ef' },
                    { text: '[success]', color: '#2aff7b' },
                    { text: ' /// ', color: '#e2e6ef' },
                    { text: 'session acknowledged // good to see you online, ', color: '#eef2ff' },
                    { text: ip, color: '#39c8ff' }
                ], fast))) return;
                clearCursor();

                timeouts.push(
                    setTimeout(() => {
                        if (app.skippedIntro) return;
                        clearCursor();
                        skipIntro();
                    }, 900)
                );
            })();
        });

    });
};

$.getJSON(ipgeolocation, runIntro).fail(() => runIntro({}));

const skipIntro = () => {
    if (app.skippedIntro) return;

    app.skippedIntro = true;

    timeouts.forEach((timeout) => {
        clearTimeout(timeout);
    });

    $('.top-right').remove();

    $('#main').fadeOut(100, () => {
        $('#main').remove();

        $('#marquee').marquee({
            duration: 15000,
            gap: 420,
            delayBeforeStart: 1000,
            direction: 'left',
            duplicated: true,
        });

        setTimeout(() => {
            $('.brand-header').animateCss(app.effects[Math.floor(Math.random() * app.effects.length)]);
        }, 200);

        setTimeout(() => {
            const typed = new Typed('#brand', {
                strings: app.brandDescription,
                typeSpeed: 40,

                onComplete: () => {
                    clearCursor();
                },
            });
        }, 1350);

        setTimeout(() => {
            if (!app.shouldIgnoreVideo) {
                app.videoElement.play();
                app.audioElement.play();
            }

            app.videoElement.addEventListener(
                'timeupdate',
                () => {
                    $.cookie('videoTime', app.videoElement.currentTime, {
                        expires: 1
                    });
                },
                false
            );

            $('.marquee-container').css('visibility', 'visible').hide().fadeIn(100);

            $('.marquee-container').animateCss('zoomIn');

            $('.container').fadeIn();
            initVisitCounter();
            initTerminalConsole();

            $('.background').fadeIn(200, () => {
                if (!app.shouldIgnoreVideo) $('#audio').animate({
                    volume: app.musicVolume
                }, app.musicFadeIn);
            });
        }, 200);
    });
};

const clearCursor = () => {
    return $('span').siblings('.typed-cursor').css('opacity', '0');
};
