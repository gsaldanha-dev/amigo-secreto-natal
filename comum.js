/* Amigo Secreto · Natal 2026 — código compartilhado entre cadastro e sorteio */
window.AS = (() => {
  const URL_SB = "https://adamlaxpbvckihfscljf.supabase.co";
  const KEY = "sb_publishable_EiP8xyw4yO0I_c0-CVUupw_tNY9F3Fz";
  const ABERTURA = new Date("2026-11-17T08:00:00-03:00"); // sorteio abre terça, 8h
  const PRAZO = new Date("2026-12-24T23:59:59-03:00");    // último dia para sortear

  const $ = s => document.querySelector(s);
  const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  /* sessão neste aparelho */
  let eu = null;
  try { eu = JSON.parse(localStorage.getItem("amigo_eu") || "null"); } catch (e) {}
  const getEu = () => eu;
  const guardarEu = v => { eu = v; try { v ? localStorage.setItem("amigo_eu", JSON.stringify(v)) : localStorage.removeItem("amigo_eu"); } catch (e) {} };

  async function rpc(fn, args = {}) {
    const r = await fetch(`${URL_SB}/rest/v1/rpc/${fn}`, {
      method: "POST", headers: { apikey: KEY, "Content-Type": "application/json" }, body: JSON.stringify(args)
    });
    if (!r.ok) throw new Error(await r.text());
    return r.json();
  }
  async function lista() {
    const ps = await rpc("amigo_lista");
    if (eu && !ps.some(p => p.id === eu.id && p.reivindicado)) guardarEu(null);
    return ps;
  }

  function avatar(p) {
    const bg = p && p.foto ? `style="background-image:url('${p.foto}')"` : "";
    return `<div class="av"><div ${bg}>${p && !p.foto ? esc(p.nome[0]) : ""}</div></div>`;
  }
  function lojasFrase(p) {
    if (p.loja_aberta) return "Loja em aberto: vale qualquer loja com troca.";
    if (p.loja && p.loja2) return `Suas lojas: ${esc(p.loja)} ou ${esc(p.loja2)}.`;
    if (p.loja) return `Sua loja: ${esc(p.loja)}.`;
    return "Falta escolher a sua loja.";
  }

  /* peças da página: neve, brilho, modal e aviso */
  document.body.insertAdjacentHTML("afterbegin", `<canvas id="neve"></canvas><canvas id="brilho"></canvas>`);
  document.body.insertAdjacentHTML("beforeend", `
    <div class="veu" id="veu" role="dialog" aria-modal="true"><div class="caixa"><div class="caixa-in" id="modal"></div></div></div>
    <div class="toast" id="toast"></div>`);
  const veu = $("#veu"), modal = $("#modal");
  function abrir(html) {
    modal.innerHTML = `<button class="fechar" aria-label="Fechar">×</button>` + html;
    veu.classList.add("aberto");
    modal.querySelector(".fechar").onclick = fechar;
  }
  function fechar() { veu.classList.remove("aberto"); modal.innerHTML = ""; }
  veu.addEventListener("click", e => { if (e.target === veu) fechar(); });
  document.addEventListener("keydown", e => { if (e.key === "Escape") fechar(); });

  function toast(t) {
    const el = $("#toast"); el.textContent = t; el.classList.add("on");
    clearTimeout(toast.t); toast.t = setTimeout(() => el.classList.remove("on"), 3000);
  }

  /* PIN: digitado uma vez só. criar=true para quem ainda não tem PIN. */
  function pedirPin(p, { criar, aoEntrar }) {
    abrir(`
      ${avatar(p)}
      <h2 class="foil">${criar ? "Você é " + esc(p.nome) + "?" : "Oi, " + esc(p.nome) + "!"}</h2>
      <p class="sub">${criar ? "Escolha 4 números para ser o seu PIN e anote. Você vai usar no dia do sorteio." : "Digite o seu PIN de 4 números."}</p>
      <form id="fPin">
        <input class="pin" id="pin" inputmode="numeric" pattern="[0-9]*" maxlength="4" autocomplete="off" aria-label="PIN de 4 números">
        <p class="erro" id="erro"></p>
        <div class="rodape"><button class="btn botao-grande" id="bOk">${criar ? "Continuar" : "Entrar"}</button></div>
      </form>`);
    const campo = $("#pin");
    setTimeout(() => campo.focus(), 60);
    campo.addEventListener("input", () => { campo.value = campo.value.replace(/\D/g, "").slice(0, 4); });
    $("#fPin").onsubmit = async ev => {
      ev.preventDefault();
      const pin = campo.value, err = $("#erro"), b = $("#bOk");
      if (!/^\d{4}$/.test(pin)) { err.textContent = "O PIN tem 4 números."; return; }
      b.disabled = true; err.textContent = "";
      try {
        let ok;
        if (criar) {
          const r = await rpc("amigo_reivindicar", { p_id: p.id, p_pin: pin });
          if (r === "ja_reivindicado") { err.textContent = "Já existe um PIN para " + p.nome + ". Se não foi você, fale com o Gustavo."; b.disabled = false; return; }
          ok = r === "ok";
        } else ok = await rpc("amigo_entrar", { p_id: p.id, p_pin: pin });
        if (!ok) { err.textContent = "PIN errado. Tente de novo."; campo.value = ""; campo.focus(); b.disabled = false; return; }
        guardarEu({ id: p.id, pin });
        fechar();
        aoEntrar && aoEntrar(pin);
      } catch (e) { err.textContent = "A internet falhou. Tente de novo."; b.disabled = false; }
    };
  }

  /* neve dourada */
  (function neve() {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const c = $("#neve"), x = c.getContext("2d");
    let fl = [];
    const tam = () => {
      c.width = innerWidth; c.height = innerHeight;
      fl = Array.from({ length: Math.min(90, innerWidth / 12 | 0) }, () => ({ x: Math.random() * c.width, y: Math.random() * c.height, r: Math.random() * 1.8 + .4, v: Math.random() * .5 + .2, d: Math.random() * 6, g: Math.random() < .25 }));
    };
    tam(); addEventListener("resize", tam);
    (function f() {
      x.clearRect(0, 0, c.width, c.height);
      fl.forEach(p => {
        p.y += p.v; p.d += .01; p.x += Math.sin(p.d) * .3;
        if (p.y > c.height) { p.y = -4; p.x = Math.random() * c.width; }
        x.beginPath(); x.arc(p.x, p.y, p.r, 0, 7); x.fillStyle = p.g ? "rgba(245,226,168,.75)" : "rgba(255,255,255,.55)"; x.fill();
      });
      requestAnimationFrame(f);
    })();
  })();

  function confete() {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const c = $("#brilho"), x = c.getContext("2d"); c.width = innerWidth; c.height = innerHeight;
    const cores = ["#f5e2a8", "#d6b25e", "#fff1c4", "#8f1d30", "#2f8a63"];
    const ps = Array.from({ length: 140 }, () => ({ x: c.width / 2, y: c.height / 2.4, vx: (Math.random() - .5) * 14, vy: Math.random() * -13 - 3, s: Math.random() * 6 + 3, r: Math.random() * 6, c: cores[Math.random() * cores.length | 0] }));
    let t = 0;
    (function f() {
      x.clearRect(0, 0, c.width, c.height);
      ps.forEach(p => { p.vy += .32; p.vx *= .99; p.x += p.vx; p.y += p.vy; p.r += .15; x.save(); x.translate(p.x, p.y); x.rotate(p.r); x.fillStyle = p.c; x.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2); x.restore(); });
      if (++t < 160) requestAnimationFrame(f); else x.clearRect(0, 0, c.width, c.height);
    })();
  }

  return { ABERTURA, PRAZO, $, esc, rpc, lista, avatar, lojasFrase, abrir, fechar, toast, pedirPin, confete, eu: getEu, guardarEu };
})();
