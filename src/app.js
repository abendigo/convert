// tiny local cache — just two small values (rates, date), so plain
// localStorage covers it without pulling in a library
function cacheGet(key) {
  try {
    var raw = localStorage.getItem("convert:" + key);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null; // storage unavailable (private mode, etc.) — non-fatal
  }
}
function cacheSet(key, value) {
  try {
    localStorage.setItem("convert:" + key, JSON.stringify(value));
  } catch (e) {
    /* non-fatal — just skip caching */
  }
}

// Copied from https://gist.github.com/chinchang/8106a82c56ad007e27b1
function xmlToJson(xml) {
  var obj = {};

  if (xml.nodeType == 1) {
    if (xml.attributes.length > 0) {
      obj["@attributes"] = {};
      for (var j = 0; j < xml.attributes.length; j++) {
        var attribute = xml.attributes.item(j);
        obj["@attributes"][attribute.nodeName] = attribute.nodeValue;
      }
    }
  } else if (xml.nodeType == 3) {
    obj = xml.nodeValue;
  }

  var textNodes = [].slice.call(xml.childNodes).filter(function (node) {
    return node.nodeType === 3;
  });
  if (xml.hasChildNodes() && xml.childNodes.length === textNodes.length) {
    obj = [].slice.call(xml.childNodes).reduce(function (text, node) {
      return text + node.nodeValue;
    }, "");
  } else if (xml.hasChildNodes()) {
    for (var i = 0; i < xml.childNodes.length; i++) {
      var item = xml.childNodes.item(i);
      var nodeName = item.nodeName;
      if (typeof obj[nodeName] == "undefined") {
        obj[nodeName] = xmlToJson(item);
      } else {
        if (typeof obj[nodeName].push == "undefined") {
          var old = obj[nodeName];
          obj[nodeName] = [];
          obj[nodeName].push(old);
        }
        obj[nodeName].push(xmlToJson(item));
      }
    }
  }
  return obj;
}

(function () {
  var ECB_PROXY_URL = "https://red-band-e7de.pokerdiary.workers.dev/";

  var names = {
    CAD: "Canadian Dollar",
    USD: "US Dollar",
    GBP: "British Pound",
    THB: "Thai Baht",
    AUD: "Australian Dollar",
    JPY: "Japanese Yen",
    CHF: "Swiss Franc",
    SGD: "Singapore Dollar",
    NZD: "New Zealand Dollar",
    MXN: "Mexican Peso"
  };

  var ratesEUR = {}; // filled once the ECB feed resolves (or from cache)
  var date = null;

  function formatDateYMD(iso) {
    // ECB's date is already YYYY-MM-DD; y/m/d (not a locale format) is
    // deliberate here — this leaves its original context when shared, and
    // year-first reads unambiguously everywhere, unlike d/m/y vs m/d/y
    return iso.replace(/-/g, "/");
  }

  // a shared link freezes the row's two actual computed values into the
  // URL, not just the inputs — so whoever opens it later sees exactly what
  // was shared, never different (live-recalculated) numbers. Both facts
  // travel together because the row shows them together.
  function shareHref(fromCode, toCode, amt, buyingValue, costValue) {
    var params = new URLSearchParams({
      amount: amt,
      from: fromCode,
      to: toCode,
      buying: buyingValue.toFixed(2),
      cost: costValue.toFixed(2),
      date: date
    });
    return location.pathname + "?" + params.toString();
  }

  // all 10 rotate via swipe; [0] is base
  var currencies = Object.keys(names);
  var amount = 100;
  var MIN = 1,
    MAX = 100000;

  var stage = document.getElementById("stage");
  var heroViewport = document.getElementById("heroViewport");
  var heroEl = document.getElementById("hero");
  var tbody = document.getElementById("ratesBody");
  var asOfEl = document.getElementById("asOf");

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function formatCurrency(value, code) {
    try {
      return value.toLocaleString("en-GB", { style: "currency", currency: code });
    } catch (e) {
      return code + " " + value.toFixed(2);
    }
  }

  function fontSizeFor(len) {
    return len <= 8 ? 3.8 : len <= 11 ? 3.0 : 2.4;
  }

  function heroInnerHTML(amt, code) {
    var formatted = formatCurrency(amt, code);
    var fs = fontSizeFor(formatted.length);
    return (
      '<div class="amount-figure" style="font-size:' + fs + 'rem">' + formatted + "</div>" +
      '<div class="currency-line">' +
        '<span class="currency-code">' + code + "</span>" +
        '<span class="currency-sep">·</span>' +
        '<span class="currency-name">' + names[code] + "</span>" +
      "</div>"
    );
  }

  function clampAmount(v) {
    return Math.max(MIN, Math.min(MAX, v));
  }

  function rotateLeft() {
    currencies.push(currencies.shift());
  }
  function rotateRight() {
    currencies.unshift(currencies.pop());
  }

  // would this swipe actually change anything? (false at the amount limits)
  function wouldChange(key, direction) {
    if (key === "x") {
      var na = direction > 0 ? amount * 10 : Math.round(amount / 10);
      return clampAmount(na) !== amount;
    }
    return true; // currency rotation has no limit
  }

  // what WOULD result from this swipe, without mutating state yet
  function previewFor(key, direction) {
    if (key === "x") {
      var na = direction > 0 ? amount * 10 : Math.round(amount / 10);
      return { amt: clampAmount(na), code: currencies[0] };
    }
    var idx = direction > 0 ? 1 : currencies.length - 1;
    return { amt: amount, code: currencies[idx] };
  }

  function commitStateReal(key, direction) {
    if (key === "x") {
      amount = clampAmount(direction > 0 ? amount * 10 : Math.round(amount / 10));
    } else if (direction > 0) {
      rotateLeft();
    } else {
      rotateRight();
    }
  }

  // everything but the base, alphabetically
  function renderTable() {
    var base = currencies[0];
    var others = currencies.filter(function (c) { return c !== base; }).sort();

    tbody.innerHTML = "";
    others.forEach(function (code) {
      var rate = ratesEUR[code] / ratesEUR[base];
      var buying = amount * rate;
      var costBase = amount / rate;

      var tr = document.createElement("tr");
      tr.dataset.code = code;
      tr.innerHTML =
        '<td><a class="share-link" href="' + shareHref(base, code, amount, buying, costBase) + '">' +
          '<span class="cur-code">' + code + '</span><span class="cur-name">' + names[code] + "</span>" +
        "</a></td>" +
        '<td class="col-buying">' + formatCurrency(buying, code) + "</td>" +
        '<td class="col-cost"><div class="cost-value">' + formatCurrency(costBase, base) + "</div>" +
        '<div class="cost-of">for ' + formatCurrency(amount, code) + "</div></td>";
      tbody.appendChild(tr);
    });
  }

  // tap a row to make it the base — moves it to the front of the rotation
  function selectBase(code) {
    if (code === currencies[0] || incomingEl) return;
    currencies.splice(currencies.indexOf(code), 1);
    currencies.unshift(code);

    if (reduceMotion) {
      render();
      return;
    }

    // a tap has no swipe direction to slide from, so cross-fade instead
    heroEl.style.transition = "opacity 120ms ease-in";
    heroEl.style.opacity = "0";
    window.setTimeout(function () {
      heroEl.innerHTML = heroInnerHTML(amount, currencies[0]);
      renderTable();
      heroEl.style.transition = "none";
      heroEl.style.opacity = "0";
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          heroEl.style.transition = "opacity 160ms ease-out";
          heroEl.style.opacity = "1";
        });
      });
    }, 120);
  }

  tbody.addEventListener("click", function (e) {
    // a normal tap still selects the base (don't navigate the real link
    // away); a long-press bypasses this entirely — the OS intercepts it
    // before any click ever fires, showing its native share menu instead
    var link = e.target.closest("a.share-link");
    if (link) e.preventDefault();
    var tr = e.target.closest("tr");
    if (tr && tr.dataset.code) selectBase(tr.dataset.code);
  });

  function render() {
    heroEl.innerHTML = heroInnerHTML(amount, currencies[0]);
    renderTable();
    asOfEl.textContent = date ? ", as of " + date : "";
  }

  // ---- carousel-style slide: incoming panel always visible, sliding in
  // as the current one slides out — never an empty frame in between.
  //
  // Two different "directions" are in play and must stay separate:
  //  - visual direction: which way the pixels move (follows the raw
  //    drag/finger 1:1 — always the same convention on both axes).
  //  - action direction: what it MEANS (amount up/down, rotate left/right).
  //    On the y axis these are inverted on purpose (swipe UP = visually
  //    negative = rotate LEFT = action +1), per the rotation model.
  // Mixing the two caused a real bug during prototyping: the panel geometry
  // was built from the action direction, so on the y axis the incoming
  // panel animated away from view instead of toward it. Keep them separate.
  var incomingEl = null,
    lockedKey = null,
    dir = 0,
    actionDir = 0,
    size = 0;

  function axisTranslate(key, px) {
    return key === "x" ? "translateX(" + px + "px)" : "translateY(" + px + "px)";
  }

  // self-inverse: converts a visual direction to an action direction, and
  // vice versa. x: they're the same. y: they're flipped.
  function actionDirFor(key, visualDirection) {
    return key === "x" ? visualDirection : -visualDirection;
  }

  function beginSlidePreview(key, visualDirection, actionDirection) {
    lockedKey = key;
    dir = visualDirection;
    actionDir = actionDirection;
    size = key === "x" ? heroViewport.clientWidth : heroViewport.clientHeight;
    var prev = previewFor(key, actionDirection);
    incomingEl = document.createElement("div");
    incomingEl.className = "hero";
    incomingEl.innerHTML = heroInnerHTML(prev.amt, prev.code);
    incomingEl.style.transition = "none";
    incomingEl.style.transform = axisTranslate(key, -visualDirection * size);
    heroEl.style.transition = "none";
    heroViewport.appendChild(incomingEl);
  }

  function updateSlidePreview(delta) {
    if (!incomingEl) return;
    heroEl.style.transform = axisTranslate(lockedKey, delta);
    incomingEl.style.transform = axisTranslate(lockedKey, -dir * size + delta);
  }

  function finishSlide(committed) {
    if (!incomingEl) return;
    var key = lockedKey,
      visualDirection = dir,
      semanticDirection = actionDir,
      incoming = incomingEl,
      outgoing = heroEl;
    var ease = "transform 170ms cubic-bezier(.2,.7,.3,1)";
    outgoing.style.transition = ease;
    incoming.style.transition = ease;
    if (committed) {
      outgoing.style.transform = axisTranslate(key, visualDirection * size);
      incoming.style.transform = axisTranslate(key, 0);
    } else {
      outgoing.style.transform = axisTranslate(key, 0);
      incoming.style.transform = axisTranslate(key, -visualDirection * size);
    }
    window.setTimeout(function () {
      if (committed) {
        commitStateReal(key, semanticDirection);
        heroViewport.removeChild(outgoing);
        incoming.style.transition = "none";
        incoming.style.transform = "none";
        heroEl = incoming;
      } else {
        heroViewport.removeChild(incoming);
      }
      incomingEl = null;
      renderTable();
    }, 190);
  }

  function instantCommit(key, direction) {
    commitStateReal(key, direction);
    render();
  }

  // small damped nudge + spring back — used at the amount limits, where
  // the swipe shouldn't move through to a (identical) value at all
  function bounceNudge(key, direction) {
    if (reduceMotion) return;
    heroEl.style.transition = "transform 90ms ease-out";
    heroEl.style.transform = axisTranslate(key, direction * 10);
    window.setTimeout(function () {
      heroEl.style.transition = "transform 140ms ease-out";
      heroEl.style.transform = "none";
    }, 90);
  }

  function keySlide(key, actionDirection) {
    if (incomingEl) return; // a slide is already animating
    if (!wouldChange(key, actionDirection)) {
      bounceNudge(key, actionDirection);
      return;
    }
    if (reduceMotion) {
      instantCommit(key, actionDirection);
      return;
    }
    beginSlidePreview(key, actionDirFor(key, actionDirection), actionDirection);
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        finishSlide(true);
      });
    });
  }

  // ---- pointer / swipe handling ----
  var dragging = false,
    startX = 0,
    startY = 0,
    blockedAxis = null;
  var LOCK = 8,
    THRESHOLD = 46,
    RESIST = 0.3,
    RESIST_MAX = 18;

  stage.addEventListener("pointerdown", function (e) {
    if (incomingEl) return;
    dragging = true;
    startX = e.clientX;
    startY = e.clientY;
    lockedKey = null;
    blockedAxis = null;
    if (!reduceMotion) stage.setPointerCapture(e.pointerId);
  });

  stage.addEventListener("pointermove", function (e) {
    if (!dragging || reduceMotion) return;
    var dx = e.clientX - startX,
      dy = e.clientY - startY;

    if (!lockedKey && !blockedAxis) {
      if (Math.abs(dx) > LOCK || Math.abs(dy) > LOCK) {
        var key = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
        var visualDirection = (key === "x" ? dx : dy) > 0 ? 1 : -1;
        var actionDirection = actionDirFor(key, visualDirection);
        if (wouldChange(key, actionDirection)) {
          beginSlidePreview(key, visualDirection, actionDirection);
        } else {
          blockedAxis = key; // at the limit: resist instead of sliding through
        }
      } else {
        return;
      }
    }

    if (blockedAxis) {
      var raw = blockedAxis === "x" ? dx : dy;
      var resisted = (raw < 0 ? -1 : 1) * Math.min(RESIST_MAX, Math.abs(raw) * RESIST);
      heroEl.style.transition = "none";
      heroEl.style.transform = axisTranslate(blockedAxis, resisted);
      return;
    }

    var rawDelta = lockedKey === "x" ? dx : dy;
    updateSlidePreview(Math.max(-size, Math.min(size, rawDelta))); // never drag a panel past fully in/out
  });

  function endDrag(e) {
    if (!dragging) return;
    dragging = false;
    var dx = e.clientX - startX,
      dy = e.clientY - startY;

    if (blockedAxis) {
      heroEl.style.transition = "transform 160ms ease-out";
      heroEl.style.transform = "none";
      blockedAxis = null;
      return;
    }

    if (reduceMotion) {
      var absX = Math.abs(dx),
        absY = Math.abs(dy);
      if (Math.max(absX, absY) <= THRESHOLD) return;
      if (absX > absY) {
        if (wouldChange("x", dx > 0 ? 1 : -1)) instantCommit("x", dx > 0 ? 1 : -1);
      } else {
        if (wouldChange("y", dy < 0 ? 1 : -1)) instantCommit("y", dy < 0 ? 1 : -1);
      }
      return;
    }
    if (!lockedKey) return;
    var delta = lockedKey === "x" ? dx : dy;
    var finalVisualSign = delta > 0 ? 1 : -1; // dir is visual too — compare like for like
    var committed = finalVisualSign === dir && Math.abs(delta) > THRESHOLD;
    finishSlide(committed);
    lockedKey = null;
  }

  stage.addEventListener("pointerup", endDrag);
  stage.addEventListener("pointercancel", endDrag);

  stage.addEventListener("keydown", function (e) {
    if (e.key === "ArrowRight") {
      keySlide("x", 1);
      e.preventDefault();
    } else if (e.key === "ArrowLeft") {
      keySlide("x", -1);
      e.preventDefault();
    } else if (e.key === "ArrowUp") {
      keySlide("y", 1);
      e.preventDefault();
    } else if (e.key === "ArrowDown") {
      keySlide("y", -1);
      e.preventDefault();
    }
  });

  // ---- shared-link snapshot: a frozen fact, not the live tool ----
  // Everything the snapshot needs is already in the URL, so when one is
  // present, skip the cache/fetch flow entirely — no network dependency to
  // show someone exactly what was shared with them.
  function parseShareParams() {
    var p = new URLSearchParams(location.search);
    if (!p.has("amount") || !p.has("from") || !p.has("to") || !p.has("buying") || !p.has("cost") || !p.has("date")) {
      return null;
    }
    return {
      amount: p.get("amount"),
      from: p.get("from"),
      to: p.get("to"),
      buying: parseFloat(p.get("buying")),
      cost: parseFloat(p.get("cost")),
      date: p.get("date")
    };
  }

  var shared = parseShareParams();

  if (shared) {
    // mirrors the row it came from: both facts, same as the table shows them
    var buyingLine = formatCurrency(Number(shared.amount), shared.from) + " buys " + formatCurrency(shared.buying, shared.to);
    var costLine = formatCurrency(Number(shared.amount), shared.to) + " costs " + formatCurrency(shared.cost, shared.from);
    document.getElementById("snapshotBuying").textContent = buyingLine;
    document.getElementById("snapshotCost").textContent = costLine;
    document.getElementById("snapshotAsOf").textContent = "as of " + formatDateYMD(shared.date);
    document.getElementById("liveView").hidden = true;
    document.getElementById("snapshot").hidden = false;
  } else {
    // ---- data: cached rates first (instant paint), then the live ECB feed ----

    var cachedRates = cacheGet("rates");
    var cachedDate = cacheGet("date");
    if (cachedRates) {
      ratesEUR = cachedRates;
      date = cachedDate;
      render();
    }

    fetch(ECB_PROXY_URL)
      .then(function (response) {
        return response.text();
      })
      .then(function (xmlString) {
        return new DOMParser().parseFromString(xmlString, "text/xml");
      })
      .then(function (xmlNode) {
        return xmlToJson(xmlNode);
      })
      .then(function (json) {
        var data = json["gesmes:Envelope"].Cube.Cube;
        date = data["@attributes"].time;

        var fetched = {};
        data.Cube.forEach(function (item) {
          var attrs = item["@attributes"];
          if (names[attrs.currency]) fetched[attrs.currency] = parseFloat(attrs.rate);
        });
        ratesEUR = fetched;

        cacheSet("rates", ratesEUR);
        cacheSet("date", date);
        render();
      });
  }
})();
