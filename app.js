



(function () {
  'use strict';
  var C = window.INVITE;
  if (!C) { return; }

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var get = function (o, p) { return p.split('.').reduce(function (a, k) { return a == null ? a : a[k]; }, o); };
  var pad = function (n) { return String(n).padStart(2, '0'); };
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- fill text from config.js ---------- */
  document.title = C.siteTitle || document.title;

  $$('[data-t]').forEach(function (el) {
    var v = get(C, el.getAttribute('data-t'));
    if (v != null) { el.textContent = v; }
  });
  $$('[data-lines]').forEach(function (el) {
    var v = get(C, el.getAttribute('data-lines'));
    if (!Array.isArray(v)) { return; }
    el.textContent = '';
    v.forEach(function (line, i) {
      if (i) { el.appendChild(document.createElement('br')); }
      el.appendChild(document.createTextNode(line));
    });
  });
  if (C.venue && C.venue.photo) { $('#venue-wm').style.backgroundImage = 'url("' + C.venue.photo + '")'; }

  /* ---------- event dates and venue cards ---------- */
  function formatDate(value) {
    var parts = value.split('-').map(Number);
    var date = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2]));
    return date.toLocaleDateString('en-GB', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC'
    });
  }
  var wedding = C.events.find(function (event) { return event.id === 'wedding'; });
  if (!wedding) { throw new Error('The wedding event is missing from config.js'); }
  var weddingDate = formatDate(wedding.date);
  var start = new Date(C.countdown.date + 'T00:00:00' + (C.timezoneOffset || '+05:30'));

  var overview = $('#event-overview');
  var eventDays = C.events.map(function (event) {
    return new Date(event.date + 'T00:00:00Z').toLocaleDateString('en-GB', {
      day: 'numeric', timeZone: 'UTC'
    });
  });
  var daySummary = eventDays.length > 1 ?
    eventDays.slice(0, -1).join(', ') + ' & ' + eventDays[eventDays.length - 1] :
    eventDays[0];
  var monthYear = new Date(C.events[0].date + 'T00:00:00Z').toLocaleDateString('en-GB', {
    month: 'long', year: 'numeric', timeZone: 'UTC'
  });
  overview.textContent = C.events.map(function (event) { return event.label; }).join(' · ') + '\n' +
    daySummary + ' ' + monthYear;

  var eventList = $('#event-list');
  C.events.forEach(function (event) {
    var item = document.createElement('section');
    item.className = 'event-detail';

    var heading = document.createElement('h3');
    heading.textContent = event.label;
    item.appendChild(heading);

    var date = document.createElement('p');
    date.className = 'event-date';
    date.textContent = formatDate(event.date) + (event.time ? ' · ' + event.time : '');
    item.appendChild(date);

    var place = document.createElement('p');
    place.className = 'event-place';
    place.textContent = event.venue;
    item.appendChild(place);

    var address = document.createElement('p');
    address.className = 'event-address';
    address.textContent = event.address;
    item.appendChild(address);

    var map = document.createElement('a');
    map.className = 'event-map';
    map.href = 'https://www.google.com/maps/search/?api=1&query=' +
      encodeURIComponent(event.venue + ', ' + event.address);
    map.target = '_blank';
    map.rel = 'noopener';
    map.textContent = 'Open Google Maps';
    item.appendChild(map);

    eventList.appendChild(item);
  });

  /* ---------- keep long names inside the card ---------- */
  function fit() {
    var groups = {}, items = $$('.fit');
    items.forEach(function (el, i) {
      var card = el.closest('.card');
      if (!card || !card.clientWidth) { return; }
      el.style.setProperty('--fit', 1);
      var max = (parseFloat(el.getAttribute('data-fit-w')) / 1024) * card.clientWidth;
      var w = el.getBoundingClientRect().width;
      var ratio = w > 0 ? Math.min(1, max / w) : 1;
      var g = el.getAttribute('data-fit-group') || ('_' + i);
      groups[g] = Math.min(groups[g] || 1, ratio);
      el._g = g;
    });
    items.forEach(function (el) { if (el._g) { el.style.setProperty('--fit', groups[el._g].toFixed(4)); } });
  }
  fit();
  window.addEventListener('resize', fit);
  if (document.fonts && document.fonts.ready) { document.fonts.ready.then(fit); }
  window.addEventListener('load', fit);

  /* ---------- reveal cards on scroll ---------- */
  var opened = false;
  $$('.card').forEach(function (card) {
    $$('.r', card).forEach(function (el, i) { el.style.setProperty('--i', i); });
  });
  var io = ('IntersectionObserver' in window) ? new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) { return; }
      if (e.target.hasAttribute('data-gate') && !opened) { return; }
      e.target.classList.add('in');
      io.unobserve(e.target);
    });
  }, { threshold: 0.22 }) : null;
  function observeCards() {
    $$('.card').forEach(function (c) { if (io) { io.observe(c); } else { c.classList.add('in'); } });
  }
  observeCards();

  /* ---------- countdown ---------- */
  var cdEls = { d: $('#cd'), h: $('#ch'), m: $('#cm'), s: $('#cs') };
  var note = $('#cd-note');
  function tick() {
    var diff = start.getTime() - Date.now();
    if (diff <= 0) {
      cdEls.d.textContent = cdEls.h.textContent = cdEls.m.textContent = cdEls.s.textContent = '00';
      note.textContent = C.countdown.arrived || '';
      return;
    }
    var s = Math.floor(diff / 1000);
    cdEls.d.textContent = pad(Math.floor(s / 86400));
    cdEls.h.textContent = pad(Math.floor((s % 86400) / 3600));
    cdEls.m.textContent = pad(Math.floor((s % 3600) / 60));
    cdEls.s.textContent = pad(s % 60);
    note.textContent = weddingDate;
  }
  tick();
  setInterval(tick, 1000);

  /* ---------- links and buttons ---------- */
  var title = 'Wedding of ' + C.bride.name + ' & ' + C.groom.name;
  var where = wedding.venue + ', ' + wedding.address;

  $('#cal').addEventListener('click', function () {
    var f = function (d) {
      return d.getUTCFullYear() + pad(d.getUTCMonth() + 1) + pad(d.getUTCDate()) + 'T' +
             pad(d.getUTCHours()) + pad(d.getUTCMinutes()) + '00Z';
    };
    var ymd = function (value) { return value.replace(/-/g, ''); };
    var nextDay = function (value) {
      var parts = value.split('-').map(Number);
      var date = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2] + 1));
      return date.getUTCFullYear() + pad(date.getUTCMonth() + 1) + pad(date.getUTCDate());
    };
    var esc = function (t) { return String(t).replace(/([,;\\])/g, '\\$1').replace(/\n/g, '\\n'); };
    var lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Wedding Invitation//EN', 'CALSCALE:GREGORIAN'];
    C.events.forEach(function (event) {
      var details = event.label + ': ' + formatDate(event.date) +
        (event.time ? ' · ' + event.time : '') + ' · ' + event.venue + ', ' + event.address;
      lines.push(
        'BEGIN:VEVENT',
        'UID:' + event.id + '-' + ymd(event.date) + '@wedding-invitation',
        'DTSTAMP:' + f(new Date())
      );
      if (event.at) {
        lines.push('DTSTART:' + f(new Date(event.date + 'T' + event.at + ':00' +
          (C.timezoneOffset || '+05:30'))));
      } else {
        lines.push(
          'DTSTART;VALUE=DATE:' + ymd(event.date),
          'DTEND;VALUE=DATE:' + nextDay(event.date)
        );
      }
      lines.push(
        'SUMMARY:' + esc(event.label + ' — ' + title),
        'LOCATION:' + esc(event.venue + ', ' + event.address),
        'DESCRIPTION:' + esc(details + '. ' + C.thanks.message),
        'END:VEVENT'
      );
    });
    lines.push('END:VCALENDAR');
    var ics = lines.join('\r\n');
    var blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'wedding-invitation.ics';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 2000);
  });

  var rsvp = $('#rsvp');
  if (C.rsvpWhatsApp) {
    rsvp.hidden = false;
    rsvp.href = 'https://wa.me/' + C.rsvpWhatsApp + '?text=' +
      encodeURIComponent('Assalamu Alaikum, we will be attending the wedding of ' + C.bride.name + ' & ' + C.groom.name + ' on ' + weddingDate + '. Insha Allah.');
  }

  /* ---------- share panel ---------- */
  var sheet = $('#sheet'), urlBox = $('#share-url'), copyBtn = $('#copy'), hint = $('#share-hint');
  var lastFocus = null;

  function shareUrl() {
    var u = location.href.split('#')[0].split('?')[0];
    return u;
  }
  function openSheet() {
    var url = shareUrl();
    var msg = C.shareMessage || (title + ' — ' + weddingDate + ', ' + where + '.');
    urlBox.value = url;
    var enc = encodeURIComponent;
    $('#sh-wa').href = 'https://wa.me/?text=' + enc(msg + '\n' + url);
    $('#sh-tg').href = 'https://t.me/share/url?url=' + enc(url) + '&text=' + enc(msg);
    $('#sh-sms').href = 'sms:?&body=' + enc(msg + ' ' + url);
    $('#sh-mail').href = 'mailto:?subject=' + enc(title) + '&body=' + enc(msg + '\n\n' + url);
    $('#sh-more').hidden = !navigator.share;
    if (location.protocol === 'file:') {
      hint.hidden = false;
      hint.textContent = 'This link will work for everyone once the website is live online.';
    } else { hint.hidden = true; }
    copyBtn.classList.remove('done');
    copyBtn.firstElementChild.textContent = 'Copy Link';
    lastFocus = document.activeElement;
    sheet.hidden = false;
    setTimeout(function () { copyBtn.focus(); }, 60);
  }
  function closeSheet() {
    sheet.hidden = true;
    if (lastFocus && lastFocus.focus) { lastFocus.focus(); }
  }
  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text);
    }
    return new Promise(function (resolve, reject) {
      try {
        urlBox.focus(); urlBox.select(); urlBox.setSelectionRange(0, 99999);
        document.execCommand('copy') ? resolve() : reject();
      } catch (e) { reject(e); }
    });
  }
  function copied(ok) {
    copyBtn.classList.toggle('done', ok);
    copyBtn.firstElementChild.textContent = ok ? 'Copied ✓' : 'Press Ctrl+C';
    if (ok) { setTimeout(function () { copyBtn.classList.remove('done'); copyBtn.firstElementChild.textContent = 'Copy Link'; }, 2200); }
  }
  copyBtn.addEventListener('click', function () {
    copyText(urlBox.value).then(function () { copied(true); }, function () {
      urlBox.focus(); urlBox.select(); copied(false);
    });
  });
  urlBox.addEventListener('focus', function () { urlBox.select(); });
  $('#sh-more').addEventListener('click', function () {
    navigator.share({ title: title, text: C.shareMessage || title, url: shareUrl() }).catch(function () {});
  });
  $('#share').addEventListener('click', openSheet);
  $$('[data-close]', sheet).forEach(function (el) { el.addEventListener('click', closeSheet); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !sheet.hidden) { closeSheet(); } });

  /* ---------- music (plays from "start" seconds, loops back to it) ---------- */
  var M = C.music || {};
  var btn = $('#music');
  var vol = (M.volume == null ? 80 : M.volume) / 100;
  var startAt = M.start || 0;
  var ctx = null, gain = null, buf = null, srcNode = null, htmlAudio = null;
  var wantPlay = false, playing = false, mode = '';

  function ui(on) {
    playing = !!on;
    btn.classList.toggle('on', playing);
    btn.setAttribute('aria-pressed', playing ? 'true' : 'false');
  }

  function useHtmlAudio() {
    if (htmlAudio) { return; }
    mode = 'html';
    htmlAudio = new Audio(M.file);
    htmlAudio.preload = 'auto';
    htmlAudio.volume = vol;
    var seek = function () { try { htmlAudio.currentTime = startAt; } catch (e) {} };
    htmlAudio.addEventListener('loadedmetadata', function () { if (!htmlAudio._started) { seek(); } });
    htmlAudio.addEventListener('timeupdate', function () {
      if (htmlAudio.duration && htmlAudio.currentTime >= htmlAudio.duration - 0.3) { seek(); }
    });
    htmlAudio.addEventListener('ended', function () { seek(); htmlAudio.play(); });
    htmlAudio.addEventListener('play', function () { ui(true); });
    htmlAudio.addEventListener('pause', function () { ui(false); });
    if (wantPlay) { playHtml(); }
  }
  function playHtml() {
    if (!htmlAudio) { return; }
    if (!htmlAudio._started) { htmlAudio._started = true; try { htmlAudio.currentTime = startAt; } catch (e) {} }
    htmlAudio.play().catch(function () { ui(false); });
  }

  function startWeb() {
    if (srcNode || !buf) { return; }
    srcNode = ctx.createBufferSource();
    srcNode.buffer = buf;
    srcNode.loop = true;
    srcNode.loopStart = Math.min(startAt, Math.max(0, buf.duration - 1));
    srcNode.loopEnd = buf.duration;
    srcNode.connect(gain);
    srcNode.start(0, srcNode.loopStart);
  }
  function rampTo(v, secs) {
    var t = ctx.currentTime;
    gain.gain.cancelScheduledValues(t);
    gain.gain.setValueAtTime(gain.gain.value, t);
    gain.gain.linearRampToValueAtTime(v, t + secs);
  }
  function playWeb() {
    ctx.resume();
    if (buf) { startWeb(); }
    rampTo(vol, 1.6);
    ui(true);
  }

  function initAudio() {
    if (!M.file) { return; }
    var AC = window.AudioContext || window.webkitAudioContext;
    if (AC && window.fetch) {
      try {
        ctx = new AC();
        gain = ctx.createGain();
        gain.gain.value = 0;
        gain.connect(ctx.destination);
        mode = 'web';
        fetch(M.file)
          .then(function (r) { if (!r.ok) { throw new Error('audio'); } return r.arrayBuffer(); })
          .then(function (ab) { return new Promise(function (res, rej) { ctx.decodeAudioData(ab, res, rej); }); })
          .then(function (b) { buf = b; if (wantPlay) { startWeb(); } })
          .catch(function () { ctx = null; gain = null; useHtmlAudio(); });
        return;
      } catch (e) { ctx = null; }
    }
    useHtmlAudio();
  }

  function play() {
    wantPlay = true;
    if (ctx) { playWeb(); } else if (htmlAudio) { playHtml(); }
  }
  function pause() {
    wantPlay = false;
    if (ctx) {
      rampTo(0, 0.35); ui(false);
      setTimeout(function () { if (!playing && ctx) { ctx.suspend(); } }, 450);
    } else if (htmlAudio) { htmlAudio.pause(); }
    ui(false);
  }
  btn.addEventListener('click', function () { playing ? pause() : play(); });
  document.addEventListener('visibilitychange', function () {
    if (!playing && !wantPlay) { return; }
    if (document.hidden) {
      if (ctx) { ctx.suspend(); } else if (htmlAudio) { htmlAudio.pause(); }
    } else if (wantPlay) {
      if (ctx) { ctx.resume(); } else if (htmlAudio) { htmlAudio.play().catch(function () {}); }
    }
  });
  initAudio();

  /* ---------- floating particles ---------- */
  (function () {
    var box = $('#particles');
    var n = reduce ? 0 : (window.innerWidth < 600 ? 22 : 34);
    for (var i = 0; i < n; i++) {
      var p = document.createElement('i');
      var s = 3 + Math.random() * 7;
      p.style.cssText = 'left:' + (Math.random() * 100).toFixed(1) + '%;top:' + (30 + Math.random() * 75).toFixed(1) + '%;' +
        'width:' + s.toFixed(1) + 'px;height:' + s.toFixed(1) + 'px;' +
        '--dx:' + ((Math.random() - 0.5) * 60).toFixed(0) + 'px;' +
        'animation-duration:' + (7 + Math.random() * 9).toFixed(1) + 's;' +
        'animation-delay:-' + (Math.random() * 14).toFixed(1) + 's';
      box.appendChild(p);
    }
  })();

  /* ---------- envelope opening ---------- */
  var scene = $('#scene'), seal = $('#seal'), hero = $('.hero'), body = document.body;
  var autoScrollButton = $('#auto-scroll');
  var autoScrollActive = false, autoScrollCompleted = false, autoScrollFrame = 0, autoScrollTime = 0;
  var busy = false;

  function updateAutoScrollButton() {
    if (autoScrollActive) {
      autoScrollButton.textContent = 'Pause Auto Scroll';
      autoScrollButton.setAttribute('aria-label', 'Pause automatic scrolling');
      autoScrollButton.setAttribute('aria-pressed', 'true');
    } else if (autoScrollCompleted) {
      autoScrollButton.textContent = 'Replay Auto Scroll';
      autoScrollButton.setAttribute('aria-label', 'Return to the top and replay automatic scrolling');
      autoScrollButton.setAttribute('aria-pressed', 'false');
    } else {
      autoScrollButton.textContent = 'Resume Auto Scroll';
      autoScrollButton.setAttribute('aria-label', 'Resume automatic scrolling');
      autoScrollButton.setAttribute('aria-pressed', 'false');
    }
  }

  function stopAutoScroll(completed) {
    if (autoScrollFrame) { cancelAnimationFrame(autoScrollFrame); }
    autoScrollFrame = 0;
    autoScrollTime = 0;
    autoScrollActive = false;
    autoScrollCompleted = !!completed;
    updateAutoScrollButton();
  }

  function advanceAutoScroll(time) {
    if (!autoScrollActive) { return; }
    if (!autoScrollTime) { autoScrollTime = time; }
    var elapsed = Math.min(time - autoScrollTime, 50);
    autoScrollTime = time;
    var maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    if (window.scrollY >= maxScroll - 2) {
      stopAutoScroll(true);
      return;
    }
    window.scrollBy(0, elapsed * 0.035);
    autoScrollFrame = requestAnimationFrame(advanceAutoScroll);
  }

  function startAutoScroll() {
    autoScrollCompleted = false;
    autoScrollActive = true;
    updateAutoScrollButton();
    autoScrollFrame = requestAnimationFrame(advanceAutoScroll);
  }

  autoScrollButton.addEventListener('click', function () {
    if (autoScrollActive) {
      stopAutoScroll(false);
    } else if (autoScrollCompleted) {
      window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
      setTimeout(startAutoScroll, reduce ? 0 : 700);
    } else {
      startAutoScroll();
    }
  });

  function pauseForManualInput() {
    if (autoScrollActive) { stopAutoScroll(false); }
  }
  function pauseForPointerInput(event) {
    if (autoScrollActive && event.target !== autoScrollButton) { stopAutoScroll(false); }
  }
  window.addEventListener('wheel', pauseForManualInput, { passive: true });
  window.addEventListener('touchstart', pauseForPointerInput, { passive: true });
  window.addEventListener('pointerdown', pauseForPointerInput);
  window.addEventListener('keydown', function (event) {
    var scrollKeys = ['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Home', 'End', ' '];
    if (scrollKeys.indexOf(event.key) !== -1 && event.target !== autoScrollButton) {
      pauseForManualInput();
    }
  });

  function openEnvelope() {
    if (busy || opened) { return; }
    busy = true;
    scene.classList.add('opening');
    btn.hidden = false;
    play();

    var T = reduce ? [0, 0, 0, 200, 700] : [450, 1500, 2500, 2950, 4400];
    setTimeout(function () { scene.classList.add('o-top'); }, T[0]);
    setTimeout(function () { scene.classList.add('o-sides'); }, T[1]);
    setTimeout(function () { scene.classList.add('o-bottom'); }, T[2]);
    setTimeout(function () {
      opened = true;
      scene.classList.add('reveal');
      body.classList.add('revealed');
      setTimeout(function () { hero.classList.add('in'); }, reduce ? 0 : 700);
    }, T[3]);
    setTimeout(function () {
      scene.classList.add('gone');
      body.classList.remove('locked');
      window.scrollTo(0, 0);
      fit();
      autoScrollButton.hidden = false;
      startAutoScroll();
      busy = false;
    }, T[4]);
  }
  seal.addEventListener('click', openEnvelope);

  function openAgain() {
    if (busy) { return; }
    busy = true;
    stopAutoScroll(false);
    autoScrollCompleted = false;
    autoScrollButton.hidden = true;
    window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
    setTimeout(function () {
      body.classList.add('locked');
      body.classList.remove('revealed');
      scene.classList.add('noanim');
      scene.classList.remove('opening', 'o-top', 'o-sides', 'o-bottom', 'reveal');
      $$('.card').forEach(function (c) { c.classList.remove('in'); });
      opened = false;
      void scene.offsetWidth;
      scene.classList.remove('noanim');
      scene.classList.remove('gone');
      observeCards();
      setTimeout(function () { busy = false; }, 1300);
    }, reduce ? 0 : 500);
  }
  $('#again').addEventListener('click', openAgain);
})();
