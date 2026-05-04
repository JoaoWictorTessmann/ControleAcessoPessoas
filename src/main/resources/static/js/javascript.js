// URL base do backend — endereço do túnel Cloudflare
const BASE_URL = " https://tear-cat-named-sense.trycloudflare.com";

// Headers comuns a todas as requisições
// Cloudflare não exige headers especiais como o ngrok exigia
const HEADERS = {};

// ─────────────────────────────────────────
// Utilitários de UI
// ─────────────────────────────────────────

// Atualiza o texto de última atualização no rodapé
function log(msg) {
  document.getElementById("log-msg").textContent = msg;
}

// Exibe um feedback colorido por 3 segundos e some
// tipo: "ok" (verde) ou "err" (vermelho)
function feedback(msg, tipo) {
  const el = document.getElementById("feedback");
  el.textContent = msg;
  el.className = "ca-feedback show " + tipo;
  setTimeout(() => el.classList.remove("show"), 3000);
}

// ─────────────────────────────────────────
// Aplica o StatusDTO recebido do backend na UI
// Chamada por todas as funções que fazem fetch
// ─────────────────────────────────────────
function aplicarStatus(data) {
  // Atualiza os cards de métricas
  document.getElementById("val-total").textContent = data.total;
  document.getElementById("val-limite").textContent = data.limite;

  // Calcula o percentual de ocupação e atualiza a barra
  const pct = data.limite > 0 ? Math.round((data.total / data.limite) * 100) : 0;
  const fill = document.getElementById("progress-fill");
  fill.style.width = Math.min(pct, 100) + "%";

  // Barra fica vermelha quando lotado
  fill.classList.toggle("danger", data.lotado);

  // Atualiza o badge de status
  const badge = document.getElementById("status-badge");
  if (data.lotado) {
    badge.textContent = "Lotado";
    badge.className = "ca-badge ca-badge-full";
  } else {
    badge.textContent = "Disponível";
    badge.className = "ca-badge ca-badge-ok";
  }

  // Ponto do header fica verde ao receber resposta com sucesso
  document.getElementById("conn-dot").style.background = "#4ade80";

  // Log com horário exato da última atualização
  const agora = new Date();
  log("Atualizado às " + agora.toLocaleTimeString("pt-BR", {
    hour: "2-digit", minute: "2-digit", second: "2-digit"
  }));
}

// ─────────────────────────────────────────
// Busca o status atual — chamada ao carregar e a cada 3s
// ─────────────────────────────────────────
async function fetchStatus() {
  try {
    const res = await fetch(BASE_URL + "/status", { headers: HEADERS });
    const data = await res.json();
    aplicarStatus(data);
  } catch (e) {
    // Ponto fica vermelho se perder conexão com o backend
    document.getElementById("conn-dot").style.background = "#f87171";
    log("Erro ao conectar com o backend");
  }
}

// ─────────────────────────────────────────
// Registra entrada ou saída
// tipo: "entrada" ou "saida"
// A validação real vem do Java — aqui só exibimos o resultado
// ─────────────────────────────────────────
async function acao(tipo) {
  try {
    const res = await fetch(BASE_URL + "/" + tipo, {
      method: "POST",
      headers: HEADERS
    });
    const data = await res.json();
    aplicarStatus(data);

    // data.permitido vem do StatusDTO — o Java decidiu se a ação foi executada
    if (!data.permitido) {
      const msg = tipo === "entrada"
        ? "Entrada bloqueada — capacidade máxima atingida"
        : "Saída bloqueada — contador já está em zero";
      feedback(msg, "err");
    } else {
      feedback(tipo === "entrada" ? "Entrada registrada" : "Saída registrada", "ok");
    }
  } catch (e) {
    feedback("Erro ao comunicar com o backend", "err");
  }
}

// ─────────────────────────────────────────
// Atualiza o limite máximo via /config/limite
// Validação de UX aqui (campo vazio) — regra de negócio fica no Java
// ─────────────────────────────────────────
async function salvarLimite() {
  const val = document.getElementById("input-limite").value;

  // Validação de UX: evita requisição inútil com campo vazio
  if (!val || val < 1) {
    feedback("Digite um limite válido (mínimo 1)", "err");
    return;
  }

  try {
    const res = await fetch(BASE_URL + "/config/limite?valor=" + val, {
      method: "POST",
      headers: HEADERS
    });
    const data = await res.json();
    aplicarStatus(data);
    document.getElementById("input-limite").value = "";
    feedback("Limite atualizado para " + val, "ok");
  } catch (e) {
    feedback("Erro ao salvar limite", "err");
  }
}

// ─────────────────────────────────────────
// Zera o contador via /reset
// confirm() evita clique acidental — único ponto de defesa no frontend
// ─────────────────────────────────────────
async function resetar() {
  if (!confirm("Zerar o contador de presentes?")) return;

  try {
    const res = await fetch(BASE_URL + "/reset", {
      method: "POST",
      headers: HEADERS
    });
    const data = await res.json();
    aplicarStatus(data);
    feedback("Contador zerado", "ok");
  } catch (e) {
    feedback("Erro ao resetar", "err");
  }
}

// ─────────────────────────────────────────
// Inicialização
// ─────────────────────────────────────────

// Busca imediata ao carregar a página
fetchStatus();

// Polling a cada 3 segundos — mantém a UI sincronizada com o backend
// inclusive quando o ESP32 registra entradas e saídas pelo hardware
setInterval(fetchStatus, 3000);