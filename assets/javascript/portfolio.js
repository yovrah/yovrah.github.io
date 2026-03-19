'use strict';

const ipgeolocation = 'https://api.ipgeolocation.io/ipgeo?apiKey=71d5413f6eb746e9bbbae5559f600a0a';
const visitCounterApi = 'https://api.countapi.xyz/hit/yovrah-github-io/site-visits';

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
    const counter = document.createElement('div');
    counter.id = 'terminal-visits';
    counter.textContent = `${ts()} [visits] decrypting...`;
    document.body.appendChild(counter);
    let lastValue = '...';

    const setCounterLine = (countText) => {
        const line = `${ts()} [visits] total=${countText}`;
        animateDecrypt(counter, line, 14, 36);
    };

    const refreshVisitValue = () => fetch(visitCounterApi.replace('/hit/', '/get/'))
        .then((response) => response.json())
        .then((data) => {
            lastValue = typeof data.value === 'number' ? String(data.value) : 'N/A';
            setCounterLine(lastValue);
        })
        .catch(() => {
            lastValue = 'N/A';
            setCounterLine(lastValue);
        });

    fetch(visitCounterApi)
        .then((response) => response.json())
        .then((data) => {
            lastValue = typeof data.value === 'number' ? String(data.value) : 'N/A';
            setCounterLine(lastValue);
        })
        .catch(() => {
            lastValue = 'N/A';
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
    initVisitCounter();
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
