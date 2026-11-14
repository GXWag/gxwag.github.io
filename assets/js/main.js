const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- mesh background ---------- */
function mesh() {
  if (reduceMotion) return;
  const canvas = document.getElementById("mesh");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  let width = 0;
  let height = 0;
  let points = [];
  const dpr = Math.min(window.devicePixelRatio || 1, 2);

  const resize = () => {
    width = canvas.clientWidth;
    height = canvas.clientHeight;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = Math.min(90, Math.round((width * height) / 22000));
    points = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.28,
      vy: (Math.random() - 0.5) * 0.28,
      r: Math.random() * 1.6 + 0.6,
    }));
  };

  let frame = 0;
  const step = () => {
    frame = requestAnimationFrame(step);
    ctx.clearRect(0, 0, width, height);

    for (const p of points) {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < -20) p.x = width + 20;
      if (p.x > width + 20) p.x = -20;
      if (p.y < -20) p.y = height + 20;
      if (p.y > height + 20) p.y = -20;
    }

    for (let i = 0; i < points.length; i++) {
      const a = points[i];
      for (let j = i + 1; j < points.length; j++) {
        const b = points[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const dist = dx * dx + dy * dy;
        if (dist < 16000) {
          const alpha = (1 - dist / 16000) * 0.16;
          ctx.strokeStyle = `rgba(200, 242, 107, ${alpha})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
      ctx.fillStyle = "rgba(200, 242, 107, 0.42)";
      ctx.beginPath();
      ctx.arc(a.x, a.y, a.r, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  resize();
  window.addEventListener("resize", resize, { passive: true });
  step();

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      cancelAnimationFrame(frame);
    } else {
      step();
    }
  });
}

/* ---------- reveal on scroll ---------- */
function reveal() {
  const items = document.querySelectorAll(".reveal");
  if (reduceMotion || !("IntersectionObserver" in window)) {
    items.forEach((item) => item.classList.add("is-visible"));
    return;
  }
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
  );
  items.forEach((item) => observer.observe(item));
}

/* ---------- counters ---------- */
function counters() {
  const nodes = [...document.querySelectorAll("[data-count]")];
  if (!nodes.length) return;

  const run = (node) => {
    const target = Number(node.dataset.count || 0);
    const suffix = node.dataset.suffix || "";
    if (!target || reduceMotion) {
      node.textContent = `${target}${suffix}`;
      return;
    }
    const start = performance.now();
    const duration = 1100;
    const tick = (now) => {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      node.textContent = `${Math.round(target * eased)}${suffix}`;
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  if (!("IntersectionObserver" in window)) {
    nodes.forEach(run);
    return;
  }
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        run(entry.target);
        observer.unobserve(entry.target);
      }
    },
    { threshold: 0.6 },
  );
  nodes.forEach((node) => observer.observe(node));
}

/* ---------- nav ---------- */
function nav() {
  const bar = document.getElementById("nav");
  const burger = document.getElementById("burger");
  const links = document.getElementById("navLinks");

  const onScroll = () => {
    if (window.scrollY > 12) bar.classList.add("is-scrolled");
    else bar.classList.remove("is-scrolled");
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  if (!burger || !links) return;
  const close = () => {
    burger.classList.remove("is-open");
    links.classList.remove("is-open");
    burger.setAttribute("aria-expanded", "false");
  };
  burger.addEventListener("click", () => {
    const open = !links.classList.contains("is-open");
    burger.classList.toggle("is-open", open);
    links.classList.toggle("is-open", open);
    burger.setAttribute("aria-expanded", String(open));
  });
  links.querySelectorAll("a").forEach((link) => link.addEventListener("click", close));
  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape") close();
  });
}

/* ---------- tilt ---------- */
function tilt() {
  if (reduceMotion) return;
  const cards = document.querySelectorAll(".card");
  const fine = window.matchMedia("(pointer: fine)").matches;
  if (!fine) return;

  for (const card of cards) {
    card.addEventListener("mousemove", (event) => {
      const rect = card.getBoundingClientRect();
      const px = (event.clientX - rect.left) / rect.width - 0.5;
      const py = (event.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = `translateY(-5px) rotateX(${(-py * 5).toFixed(2)}deg) rotateY(${(px * 5).toFixed(2)}deg)`;
    });
    card.addEventListener("mouseleave", () => {
      card.style.transform = "";
    });
  }
}

/* ---------- lightbox ---------- */
function lightbox() {
  const box = document.getElementById("lightbox");
  if (!box) return;
  const img = box.querySelector("img");
  const close = () => {
    box.hidden = true;
    img.src = "";
  };

  document.querySelectorAll(".shot").forEach((shot) => {
    shot.addEventListener("click", () => {
      img.src = shot.dataset.full || shot.querySelector("img")?.src || "";
      box.hidden = false;
    });
  });
  box.addEventListener("click", (event) => {
    if (event.target === box || event.target.classList.contains("lightbox-close")) close();
  });
  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !box.hidden) close();
  });
}

/* ---------- live versions from GitHub ---------- */
async function githubJson(url) {
  const response = await fetch(url, { headers: { Accept: "application/vnd.github+json" } });
  if (!response.ok) throw new Error(`GitHub ${response.status}`);
  return response.json();
}

async function liveVersions() {
  try {
    const release = await githubJson("https://api.github.com/repos/GXWag/gxw-launcher/releases/latest");
    const asset = (release.assets || []).find((item) => /Setup.*\.exe$/i.test(item.name));
    const version = String(release.tag_name || "").replace(/^v/, "");
    if (version) {
      document.querySelectorAll("[data-launcher-version]").forEach((node) => {
        node.textContent = version;
      });
    }
    if (asset) {
      document.querySelectorAll("[data-download-launcher]").forEach((node) => {
        node.href = asset.browser_download_url;
      });
    } else if (release.html_url) {
      document.querySelectorAll("[data-download-launcher]").forEach((node) => {
        node.href = release.html_url;
      });
    }
  } catch {
    /* остаются статические ссылки */
  }

  try {
    const releases = await githubJson("https://api.github.com/repos/GXWag/gxw-minecraft-battle/releases?per_page=6");
    const pack = releases.find((item) => String(item.tag_name || "").startsWith("pack-battle-"));
    if (!pack) return;
    const zip = (pack.assets || []).find((item) => item.name.endsWith(".zip") && !/delta/i.test(item.name));
    const version = String(pack.tag_name).replace("pack-battle-", "");
    document.querySelectorAll("[data-pack-version]").forEach((node) => {
      node.textContent = version;
    });
    if (zip) {
      document.querySelectorAll("[data-download-pack]").forEach((node) => {
        node.href = zip.browser_download_url;
      });
      const label = document.querySelector("[data-pack-size]");
      if (label && zip.size) label.textContent = `${Math.round(zip.size / 1048576)} МБ`;
    }
  } catch {
    /* статическая ссылка на релиз */
  }
}

/* ---------- boot ---------- */
mesh();
nav();
reveal();
counters();
tilt();
lightbox();
liveVersions();
