/* ====== EDITE AQUI os dados do studio ====== */
const CONFIG = {
  whatsapp: "5514991096648", // só números com DDI+DDD
  instagram: "rrstudio_details",
  endereco: "Endereço enviado no agendamento",
  horario: "Seg a Sex 08h–18h · Sáb e Dom 08h–12h",
  horariosSemana: ["08:00","09:00","10:00","11:00","13:00","14:00","15:00","16:00","17:00"], // seg a sex
  horariosSabado: ["08:00","09:00","10:00","11:00"],                                       // sábado
  horariosDomingo: ["08:00","09:00","10:00","11:00"],                                      // domingo
  diasFechados: [],       // ex.: [0] fecha o domingo
  mesesAFrente: 2          // até quantos meses o cliente pode escolher
};
/* =========================================== */

const SERVICOS = [
  {code:"LG-01", nome:"Lavagem geral",         desc:"Lavagem técnica completa com dois baldes, rodas, caixas de roda, frisos, vãos de porta e acabamento com cera de proteção.",                     tag:"Externo",  featured:true},
  {code:"HI-02", nome:"Higienização completa", desc:"Bancos, carpetes, teto e forros limpos com extratora e produtos para cada material. Tira mancha, odor e ácaro.",                                          tag:"Interior", featured:true},
  {code:"PT-03", nome:"Polimento",             desc:"Correção de riscos, hologramas e marcas de lavagem com corte e refino. Devolve profundidade à cor e reflexo de espelho.",                                 tag:"Pintura",  featured:true},
  {code:"EC-04", nome:"Enceramento",           desc:"Aplicação de cera protetora sobre a pintura polida para mais brilho, proteção contra sol e chuva ácida e fácil manutenção.",                             tag:"Proteção", featured:true},
  {code:"PF-05", nome:"PPF",                   desc:"Película de proteção de pintura nas regiões mais vulneráveis: soleira, quina de porta, concha de porta e mídias. Preserva o verniz original.",           tag:"Proteção", featured:true},
  {code:"VT-06", nome:"Vitrificação",          desc:"Proteção cerâmica sobre a pintura já corrigida. Mais brilho, água escorrendo fácil e sujeira que sai na lavagem simples.",                               tag:"Proteção"},
  {code:"CR-07", nome:"Hidratação de couro",   desc:"Limpeza com pH adequado e hidratante que repõe a maciez do couro e evita rachaduras no volante e nos bancos.",                                           tag:"Interior"},
  {code:"FA-08", nome:"Restauração de faróis", desc:"Lixamento, polimento e verniz UV nos faróis amarelados. Mais luz na pista e o carro com cara de novo.",                                                  tag:"Externo"}
];

const state = { sel:new Set(), dia:null, hora:null, view:null };

function waLink(text){
  const t = encodeURIComponent(text || "Olá! Vim pelo site e gostaria de agendar no RR Studio Details.");
  if (CONFIG.whatsapp) return `https://wa.me/${CONFIG.whatsapp}?text=${t}`;
  return `https://ig.me/m/${CONFIG.instagram}`;
}

// menu
// chips do orçamento
const chips = document.getElementById("chips");
SERVICOS.forEach(s=>{
  const c = document.createElement("button");
  c.type="button"; c.textContent=s.nome; c.dataset.s=s.nome; c.setAttribute("aria-pressed","false");
  chips.appendChild(c);
});

// Lista de serviços
(function(){
  var wrap = document.getElementById("menu");
  if (!wrap) return;
  wrap.innerHTML = SERVICOS.map(function(s, i) {
    return '<div class="svc" data-svc-idx="' + i + '">' +
      '<span class="code">' + s.code + '</span>' +
      '<div><h3>' + s.nome + '</h3><p>' + s.desc + '</p></div>' +
      '<div class="meta">' +
        '<button type="button" class="add" data-s="' + s.nome + '" aria-pressed="false">+ Orçamento</button>' +
      '</div>' +
    '</div>';
  }).join("");
})();

function toggle(name){
  state.sel.has(name) ? state.sel.delete(name) : state.sel.add(name);
  render();
}
document.addEventListener("click",e=>{
  const b = e.target.closest("[data-s]");
  if (b){ toggle(b.dataset.s); }
});
function seg(id,key){
  document.getElementById(id).addEventListener("click",e=>{
    const b=e.target.closest("button"); if(!b) return;
    [...e.currentTarget.children].forEach(x=>x.setAttribute("aria-pressed", x===b));
    state[key]=b.textContent; render();
  });
}

const $=id=>document.getElementById(id);
["nome","modelo","obs"].forEach(id=>$(id).addEventListener("input",()=>{ $(id).classList.remove("invalid"); $(id).removeAttribute("aria-invalid"); const e=$("err-"+id); if(e) e.hidden=true; render(); }));

let step=1, maxStep=1;
const STEP_CHECKS={
  1:()=>[{ok:!!$("nome").value.trim(),field:"nome"},{ok:!!$("modelo").value.trim(),field:"modelo"}],
  2:()=>[{ok:state.sel.size>0,err:"err-svc",box:null}],
  3:()=>[{ok:!!state.dia,err:"err-dia",box:"cal"},{ok:!!state.hora,err:"err-hora",box:"slots"}]
};
function stepOk(n){ return STEP_CHECKS[n]().every(x=>x.ok); }
function showErrors(n){
  const bad=STEP_CHECKS[n]().filter(x=>!x.ok);
  bad.forEach(x=>{
    if(x.field){ $(x.field).classList.add("invalid"); $(x.field).setAttribute("aria-invalid","true"); $("err-"+x.field).hidden=false; }
    else { $(x.err).hidden=false; if(x.box) $(x.box).classList.add("invalid"); }
  });
  if(bad[0] && bad[0].field) $(bad[0].field).focus();
  else if(bad[0]) $(bad[0].err).scrollIntoView({behavior:"smooth",block:"center"});
  return !bad.length;
}
function goTo(n,scroll=true){
  step=n; maxStep=Math.max(maxStep,n);
  var prevPane = document.querySelector('.pane:not([hidden])');
  var nextPane = document.getElementById('st-'+n);
  if(prevPane && prevPane !== nextPane){
    prevPane.classList.add('pane--exit');
    nextPane.hidden = false;
    nextPane.classList.add('pane--enter');
    setTimeout(function(){
      prevPane.hidden = true;
      prevPane.classList.remove('pane--exit');
      nextPane.classList.remove('pane--enter');
    }, 320);
  } else if(nextPane){
    nextPane.hidden = false;
  }
  document.querySelectorAll("#stepper li").forEach(li=>{
    const k=+li.dataset.go;
    li.classList.toggle("is-active",k===n);
    li.classList.toggle("is-done",k<n || (k!==n && k<=maxStep && stepOk(k)));
    li.querySelector("button").disabled = k>maxStep;
  });
  const st=$("stepper"); let fill=st.querySelector(".fill"); if(!fill){ fill=document.createElement("span"); fill.className="fill"; st.appendChild(fill); }
  fill.style.width = ((n-1)/2*66.66)+"%";
  $("back").hidden = n===1;
  $("next").hidden = n===3;
  $("send").hidden = n!==3;
  $("hint").hidden = n!==3;
  const top=$("stepper").getBoundingClientRect().top;
  if(scroll && (top<60 || top>innerHeight*0.6)) $("stepper").scrollIntoView({behavior:"smooth",block:"start"});
}
$("next").addEventListener("click",()=>{ if(showErrors(step)) goTo(step+1); });
$("back").addEventListener("click",()=>goTo(step-1));
$("stepper").addEventListener("click",e=>{
  const li=e.target.closest("li"); if(!li) return;
  const k=+li.dataset.go;
  if(k<step) return goTo(k);
  for(let i=step;i<k;i++){ if(!stepOk(i)){ if(i!==step) goTo(i); showErrors(i); return; } }
  goTo(k);
});
$("qform").addEventListener("submit",e=>e.preventDefault());
$("nome").addEventListener("keydown",e=>{ if(e.key==="Enter"){ e.preventDefault(); $("modelo").focus(); } });
$("modelo").addEventListener("keydown",e=>{ if(e.key==="Enter"){ e.preventDefault(); $("next").click(); } });

function message(){
  const nome=$("nome").value.trim(), modelo=$("modelo").value.trim(), obs=$("obs").value.trim();
  const lista=[...state.sel];
  return `Olá, RR Studio Details! ${nome ? "Meu nome é "+nome+" e g" : "G"}ostaria de um orçamento.\n\n` +
    `Veículo: ${modelo || "_____"}\n\n` +
    `Serviços:\n${lista.length ? lista.map(s=>"• "+s).join("\n") : "• _____"}\n\n` +
    `Dia de preferência: ${state.dia ? fmtDia(state.dia) : "_____"}\n` +
    `Horário de preferência: ${state.hora || "_____"}\n\n` +
    `Gostaria de saber se esse horário está disponível e o valor do serviço.` +
    (obs ? `\n\nDetalhes: ${obs}` : "") +
    `\n\nVim pelo site.`;
}
function render(){
  document.querySelectorAll("[data-s]").forEach(b=>{
    const on=state.sel.has(b.dataset.s);
    b.setAttribute("aria-pressed",on);
    if(b.classList.contains("add")) b.textContent=on?"✓ No orçamento":"+ Orçamento";
  });
  if(state.sel.size){ $("err-svc").hidden=true; }
  $("svc-count").textContent = state.sel.size ? `${state.sel.size} escolhido${state.sel.size>1?"s":""}` : "Nenhum";
  const m=message();
  $("msg").textContent=m;
  $("send").href=waLink(m);
  $("send").setAttribute("aria-disabled", stepOk(1)&&stepOk(2)&&stepOk(3) ? "false" : "true");
}
$("send").addEventListener("click",e=>{
  if($("send").getAttribute("aria-disabled")==="true"){
    e.preventDefault();
    for(const n of [1,2,3]){ if(!stepOk(n)){ if(n!==step) goTo(n); showErrors(n); return; } }
    return;
  }
  e.preventDefault();
  var btn = $("send");
  var origHTML = btn.innerHTML;
  btn.classList.add("btn-wa-loading");
  btn.innerHTML = ' Abrindo WhatsApp...';
  var waUrl = waLink(message());
  setTimeout(function(){
    btn.classList.remove("btn-wa-loading");
    btn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="2.2" d="M5 13l4 4L19 7"/></svg> Enviado!';
    setTimeout(function(){
      btn.innerHTML = origHTML;
      window.open(waUrl, "_blank", "noopener");
    }, 400);
  }, 400);

  // Toast ao retornar (visibilitychange)
  document.addEventListener("visibilitychange", function onVis(){
    if(document.visibilityState==="visible"){
      document.removeEventListener("visibilitychange", onVis);
      var toast = document.createElement("div");
      toast.className = "toast";
      toast.textContent = "Mensagem pronta no WhatsApp";
      document.body.appendChild(toast);
      void toast.offsetWidth;
      toast.classList.add("toast--visible");
      setTimeout(function(){ toast.classList.remove("toast--visible"); setTimeout(function(){ toast.remove(); }, 350); }, 3000);
    }
  }, { once: true });
});

document.getElementById("copy").addEventListener("click",async e=>{
  const btn=e.currentTarget, m=message();
  try{ await navigator.clipboard.writeText(m); btn.textContent="Copiado"; }
  catch{ const r=document.createRange(); r.selectNodeContents($("msg")); const s=getSelection(); s.removeAllRanges(); s.addRange(r); btn.textContent="Texto selecionado"; }
  setTimeout(()=>btn.textContent="Copiar texto",2000);
});

document.querySelectorAll(".js-wa").forEach(a=>a.href=waLink());

// Telefone como link tel:
(function(){
  var foneEl = document.getElementById("i-fone");
  if (!foneEl) return;
  if (CONFIG.whatsapp) {
    var formatted = "+"+CONFIG.whatsapp.replace(/^(\d{2})(\d{2})(\d{5})(\d{4})$/,"$1 $2 $3-$4");
    var link = document.createElement("a");
    link.href = "tel:+"+CONFIG.whatsapp;
    link.textContent = formatted;
    foneEl.textContent = "";
    foneEl.appendChild(link);
  } else {
    foneEl.textContent = "Pela DM do Instagram";
  }
})();

document.getElementById("i-end").textContent = CONFIG.endereco;
document.getElementById("i-hora").textContent = CONFIG.horario;

// luz de inspeção no hero
const hero=document.getElementById("hero");
if(!matchMedia("(prefers-reduced-motion: reduce)").matches){
  hero.addEventListener("pointermove",e=>{
    const r=hero.getBoundingClientRect();
    hero.style.setProperty("--lx",((e.clientX-r.left)/r.width*100)+"%");
    hero.style.setProperty("--ly",((e.clientY-r.top)/r.height*100)+"%");
  });
}

// calendário
const MESES=["janeiro","fevereiro","março","abril","maio","junho","julho","agosto","setembro","outubro","novembro","dezembro"];
const SEMANA=["domingo","segunda-feira","terça-feira","quarta-feira","quinta-feira","sexta-feira","sábado"];
const pad=n=>String(n).padStart(2,"0");
function fmtDia(d){ return `${SEMANA[d.getDay()]}, ${pad(d.getDate())}/${pad(d.getMonth()+1)}/${d.getFullYear()}`; }
const hoje=new Date(); hoje.setHours(0,0,0,0);
const limite=new Date(hoje.getFullYear(),hoje.getMonth()+CONFIG.mesesAFrente+1,0);
state.view=new Date(hoje.getFullYear(),hoje.getMonth(),1);
function slotsDe(d){
  if(!d) return [];
  let lista = d.getDay()===6 ? CONFIG.horariosSabado : d.getDay()===0 ? CONFIG.horariosDomingo : CONFIG.horariosSemana;
  if(d.getTime()===hoje.getTime()){ // hoje: só horários com 1h de antecedência
    const agora=new Date(); const min=agora.getHours()*60+agora.getMinutes()+60;
    lista=lista.filter(h=>{const [H,M]=h.split(":").map(Number); return H*60+M>=min;});
  }
  return lista;
}
function diaDisponivel(d){ return d>=hoje && d<=limite && !CONFIG.diasFechados.includes(d.getDay()) && slotsDe(d).length>0; }
function drawCal(){
  const v=state.view, y=v.getFullYear(), m=v.getMonth();
  $("cal-title").textContent=`${MESES[m]} ${y}`;
  $("cal-prev").disabled = y===hoje.getFullYear() && m===hoje.getMonth();
  $("cal-next").disabled = new Date(y,m+1,1)>limite;
  const g=$("cal-grid"); g.innerHTML="";
  const first=new Date(y,m,1).getDay(), dias=new Date(y,m+1,0).getDate();
  for(let i=0;i<first;i++) g.appendChild(document.createElement("span"));
  for(let d=1; d<=dias; d++){
    const dt=new Date(y,m,d), b=document.createElement("button");
    b.type="button"; b.textContent=d; b.dataset.d=dt.getTime();
    b.setAttribute("aria-label",fmtDia(dt));
    if(dt.getTime()===hoje.getTime()) b.classList.add("today");
    b.disabled=!diaDisponivel(dt);
    b.setAttribute("aria-pressed", !!state.dia && state.dia.getTime()===dt.getTime());
    g.appendChild(b);
  }
}
function drawSlots(){
  const box=$("slots");
  if(!state.dia){ box.innerHTML='<p class="slots-empty">Escolha um dia primeiro.</p>'; $("hora-dia").textContent=""; return; }
  $("hora-dia").textContent="· "+fmtDia(state.dia);
  box.innerHTML=slotsDe(state.dia).map(h=>`<button type="button" data-h="${h}" aria-pressed="${state.hora===h}">${h}</button>`).join("");
}
$("cal-grid").addEventListener("click",e=>{
  const b=e.target.closest("button[data-d]"); if(!b||b.disabled) return;
  state.dia=new Date(+b.dataset.d);
  if(state.hora && !slotsDe(state.dia).includes(state.hora)) state.hora=null;
  $("err-dia").hidden=true; $("cal").classList.remove("invalid");
  drawCal(); drawSlots(); render();
});
$("slots").addEventListener("click",e=>{
  const b=e.target.closest("button[data-h]"); if(!b) return;
  state.hora=b.dataset.h; $("err-hora").hidden=true; $("slots").classList.remove("invalid");
  drawSlots(); render();
});
$("cal-prev").addEventListener("click",()=>{state.view=new Date(state.view.getFullYear(),state.view.getMonth()-1,1);drawCal();});
$("cal-next").addEventListener("click",()=>{state.view=new Date(state.view.getFullYear(),state.view.getMonth()+1,1);drawCal();});
drawCal(); drawSlots();
goTo(1,false);
render();

// nav: destaca link da seção visível
(function(){
  const links = document.querySelectorAll(".nav ul a[href^='#']");
  if(!links.length) return;
  const io = new IntersectionObserver(entries=>{
    entries.forEach(e=>{
      if(e.isIntersecting){
        links.forEach(a=>a.classList.remove("is-active"));
        const a=document.querySelector(`.nav ul a[href="#${e.target.id}"]`);
        if(a) a.classList.add("is-active");
      }
    });
  },{threshold:.25});
  document.querySelectorAll("section[id]").forEach(s=>io.observe(s));
})();

// FAQ: fecha o item aberto ao abrir outro
document.querySelectorAll(".faq details").forEach(d=>{
  d.addEventListener("toggle",()=>{
    if(d.open) document.querySelectorAll(".faq details").forEach(o=>{if(o!==d) o.open=false;});
  });
});

// scroll reveal
(function(){
  if(matchMedia("(prefers-reduced-motion:reduce)").matches){
    document.querySelectorAll("[data-reveal]").forEach(el=>el.classList.add("is-visible"));
    return;
  }
  const io=new IntersectionObserver(entries=>{
    entries.forEach(e=>{
      if(e.isIntersecting){ e.target.classList.add("is-visible"); io.unobserve(e.target); }
    });
  },{threshold:.08,rootMargin:"0px 0px -40px 0px"});
  document.querySelectorAll("[data-reveal]").forEach(el=>io.observe(el));
})();

// intro splash
(function(){
  const s = document.getElementById("splash");
  if (!s) return;
  if (matchMedia("(prefers-reduced-motion:reduce)").matches) { s.remove(); return; }
  setTimeout(() => {
    s.classList.add("splash-hide");
    s.addEventListener("transitionend", () => s.remove(), { once: true });
  }, 2100);
})();

// tema claro / escuro
(function(){
  const root=document.documentElement;
  const metaTheme=document.querySelector('meta[name="theme-color"]');
  function applyTheme(t){
    root.dataset.theme=t;
    if(metaTheme) metaTheme.content=t==="light"?"#f4f4f6":"#0b0b0d";
  }
  document.getElementById("theme-toggle").addEventListener("click",function(){
    const next=root.dataset.theme==="light"?"dark":"light";
    localStorage.setItem("theme",next);
    applyTheme(next);
  });
})();

// Header hide/show ao scroll
(function(){
  var header = document.querySelector('header');
  var lastY = 0;
  var ticking = false;
  window.addEventListener('scroll', function() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function() {
      var y = window.scrollY;
      if (y > lastY && y > 80) {
        header.classList.add('header--hidden');
      } else {
        header.classList.remove('header--hidden');
      }
      lastY = y;
      ticking = false;
    });
  }, { passive: true });
})();

// Mbar aparece só depois que o hero some
(function(){
  var hero = document.getElementById('hero');
  var mbar = document.querySelector('.mbar');
  if (!hero || !mbar) return;
  var io = new IntersectionObserver(function(entries) {
    mbar.classList.toggle('mbar--visible', !entries[0].isIntersecting);
  }, { threshold: 0 });
  io.observe(hero);
})();
