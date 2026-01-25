let mediaRecorder;
let chunks = [];
let audiosCache = {};
let idPendente = null;
const SCRIPT_URL = "SUA_URL_DO_APPS_SCRIPT_AQUI";

// Menu hambúrguer
const hamburguer = document.getElementById('hamburguer');
const navMenu = document.getElementById('nav-menu');

if (hamburguer && navMenu) {
    hamburguer.addEventListener('click', function(e) {
        e.stopPropagation();
        navMenu.classList.toggle('ativa');
    });
    
    // Fechar ao clicar fora
    document.addEventListener('click', function(e) {
        if (!e.target.closest('header')) {
            navMenu.classList.remove('ativa');
        }
    });
    
    // Fechar ao clicar em um link
    navMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', function() {
            navMenu.classList.remove('ativa');
        });
    });
}

// Navegação fluída para links internos
document.addEventListener('click', (e) => {
    const link = e.target.closest('a');
    if (!link || link.target === '_blank') return;
    
    const href = link.getAttribute('href');
    // Só interceptar links internos (começam com / ou não têm protocolo)
    if (!href || href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('#')) return;
    
    e.preventDefault();
    let url = href;
    
    // Se for raiz (/), fetch de /index.html
    if (url === '/') {
        url = '/index.html';
    }
    
    // Converter para caminho absoluto se for relativo
    if (!url.startsWith('/')) {
        const basePath = window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/'));
        url = basePath + '/' + url;
    }
    
    // Adicionar /index.html se for uma pasta
    if (!url.endsWith('.html') && !url.endsWith('/')) {
        url = url + '/index.html';
    }
    
    const main = document.querySelector('main');
    main.style.transition = 'opacity 0.2s ease';
    main.style.opacity = '0';
    
    setTimeout(async () => {
        try {
            const response = await fetch(url);
            const html = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            const newMain = doc.querySelector('main');
            if (newMain) {
                main.innerHTML = newMain.innerHTML;
                // Mostrar a URL limpa no browser (sem /index.html)
                let displayUrl = url.replace(/\/index\.html$/, '') || '/';
                window.history.pushState({}, '', displayUrl);
            }
        } catch (e) {
            window.location.href = url;
            return;
        }
        
        main.style.opacity = '1';
        window.scrollTo(0, 0);
    }, 200);
});

function handleNavClick(e) {
    e.preventDefault();
    const page = e.currentTarget.dataset.page;
    carregarPagina(page);
}

async function carregarPagina(page) {
    if (page === paginaAtual) return;
    
    const main = document.getElementById('conteudo-dinamico');
    
    // Fade out
    main.classList.add('fade-out');
    
    setTimeout(async () => {
        if (page === 'home') {
            main.innerHTML = conteudoPrincipal.home;
            paginaAtual = 'home';
        } else if (page === 'termo') {
            try {
                const response = await fetch('pages/termo-consentimento.html');
                const html = await response.text();
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');
                const bodyContent = doc.body.innerHTML;
                main.innerHTML = bodyContent;
                paginaAtual = 'termo';
            } catch (error) {
                main.innerHTML = '<h1>Erro ao carregar a página</h1><p>Tente novamente.</p>';
                console.error('Erro ao carregar página:', error);
            }
        }
        
        // Atualizar links de navegação
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('ativo');
            if (link.dataset.page === page) {
                link.classList.add('ativo');
            }
        });
        
        // Fade in
        main.classList.remove('fade-out');
        
        // Scroll para o topo
        window.scrollTo(0, 0);
    }, 300);
}

// Suportar navegação com o histórico do navegador
window.addEventListener('hashchange', () => {
    const page = window.location.hash.slice(1) || 'home';
    carregarPagina(page);
});


async function iniciarGravacao(id) {
    chunks = [];
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(stream);
    mediaRecorder.ondataavailable = e => chunks.push(e.data);
    mediaRecorder.onstop = () => {
    mediaRecorder.stream.getTracks().forEach(track => track.stop());
    audiosCache[id] = new Blob(chunks, { type: 'audio/webm' });
    abrirModal(id);
};
    mediaRecorder.start();
    alternarBotoes(id, true);
}

function pararGravacao(id) {
    mediaRecorder.stop();
    alternarBotoes(id, false);
}

let arquivoParaUpload = null; // Variável global para armazenar o arquivo selecionado

// 1. Função disparada ao clicar no botão "Validar e Enviar"
function prepararUploadArquivo() {
    const input = document.getElementById('inputArquivo');
    
    if (input.files.length === 0) {
        return alert("Por favor, selecione um arquivo de áudio primeiro.");
    }

    // Armazena o arquivo na variável global e define o ID como 'Arquivo_Externo'
    arquivoParaUpload = input.files[0];
    idPendente = "Arquivo_Externo"; 
    
    // Abre o seu modal de consentimento existente
    abrirModal(idPendente);
}


/* =========================
   PARTICULAS / PEDRAS INTERATIVAS
   ========================= */
let ultimoMouse = 0;
let ultimoTouch = 0;
let ultimoX = null;
let ultimoY = null;

function alvoIgnorado(tag) {
    return ["input","button","label","textarea"].includes(tag.toLowerCase());
}

function criarParticulas(x, y, origem = "mouse") {
    const cores = [
        "rgba(200,180,160,1)",
        "rgba(170,150,130,1)",
        "rgba(150,140,125,1)",
        "rgba(180,160,140,1)"
    ];

    const quantidade = origem === "touch" ? 5 : 2; 
    const alcanceBase = origem === "touch" ? 14 : 10;

    for (let i=0; i<quantidade; i++){
        const p = document.createElement("span");
        p.classList.add("particula");

        p.style.left = `${x}px`;
        p.style.top = `${y}px`;

        const angulo = Math.random()*Math.PI*2;
        const distancia = Math.random()*alcanceBase + alcanceBase/2;

        const dx = Math.cos(angulo)*distancia + "rem";
        const dy = Math.sin(angulo)*distancia + "rem";

        p.style.setProperty("--dx", dx);
        p.style.setProperty("--dy", dy);

        p.style.backgroundColor = cores[Math.floor(Math.random()*cores.length)];
        p.style.opacity = origem==="touch"? "0.85":"0.60";

        document.body.appendChild(p);
        p.addEventListener("animationend", ()=> p.remove());
    }
}

// Movimento do mouse
document.addEventListener("mousemove",(e)=>{
    const agora = Date.now();
    if(ultimoX===null || ultimoY===null){ultimoX=e.clientX;ultimoY=e.clientY;return;}

    const dx = e.clientX - ultimoX;
    const dy = e.clientY - ultimoY;
    const distancia = Math.sqrt(dx*dx + dy*dy);

    const intervalo = agora - ultimoMouse > 500;
    const acaso = Math.random() < 0.45;

    if(distancia>3 && intervalo && acaso && !alvoIgnorado(e.target.tagName)){
        criarParticulas(e.clientX,e.clientY,"mouse");
        ultimoMouse = agora;
    }

    ultimoX=e.clientX;
    ultimoY=e.clientY;
});

// Toque / clique
document.addEventListener("pointerdown",(e)=>{
    if(!alvoIgnorado(e.target.tagName)){
        const agora = Date.now();
        if(agora - ultimoTouch > 400){
            criarParticulas(e.clientX,e.clientY,"touch");
            ultimoTouch = agora;
        }
    }
});




function abrirModal(id) {
    idPendente = id;
    document.getElementById('modalTermo').style.display = 'block';
    document.getElementById('overlay').style.display = 'block';
}

function fecharModal() {
    document.getElementById('modalTermo').style.display = 'none';
    document.getElementById('overlay').style.display = 'none';
    document.getElementById('nomeUsuario').value = "";
    document.getElementById('checkUnico').checked = false;
}

// Configurar input de arquivo ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
    const inputArquivo = document.getElementById("inputArquivo");
    const textoArquivo = document.querySelector(".texto-arquivo");
    
    if (inputArquivo && textoArquivo) {
        inputArquivo.addEventListener("change", () => {
            textoArquivo.textContent = inputArquivo.files.length
                ? inputArquivo.files[0].name
                : "Nenhum arquivo selecionado";
        });
    }
});

async function confirmarEnvio() {
    const nome = document.getElementById('nomeUsuario').value.trim();
    const contexto = document.getElementById('contextoAudio').value.trim(); // Captura o contexto
    const aceitou = document.getElementById('checkUnico').checked;

    if (!aceitou) return alert("Aceite o termo para enviar.");

    const agora = new Date();
    const horas = String(agora.getHours()).padStart(2, '0');
    const minutos = String(agora.getMinutes()).padStart(2, '0');

    const dataStr = agora.toLocaleDateString('pt-BR').replace(/\//g, '-') + "_" + horas + "h" + minutos;
    
    let arquivoFinal = (idPendente === "Arquivo_Externo")
    ? document.getElementById('inputArquivo').files[0]
    : audiosCache[idPendente];

    if (!arquivoFinal) {
        alert("Nenhum áudio encontrado para envio.");
        return;
    }

    const nomeSeguro = nome || "anonimo";

    let extensao = "webm";

    if (idPendente === "Arquivo_Externo") {
        extensao = arquivoFinal.type.split('/')[1] || 'audio';
    }

    const nomeFinal = `${nomeSeguro}_${idPendente}_${dataStr}.${extensao}`;

    // Agora passamos o contexto para a função de envio
    enviarParaDrive(arquivoFinal, nomeFinal, contexto);
    fecharModal();
    document.getElementById('contextoAudio').value = ""; // Limpa o campo
}


function limparCamposUpload() {
    const input = document.getElementById('inputArquivo');
    const texto = document.querySelector(".texto-arquivo");

    input.value = "";
    arquivoParaUpload = null;
    texto.textContent = "Nenhum arquivo selecionado"; // volta ao texto padrão
    document.getElementById('nomeUsuario').value = "";
    document.getElementById('checkUnico').checked = false;
    document.getElementById('contextoAudio').value = ""; // limpa o campo de contexto
}


function enviarParaDrive(blob, nomeArquivo, contexto) {
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onloadend = async () => {
        const base64 = reader.result.split(',')[1];
        // Adicionamos 'description' ao payload
        const payload = { 
            base64: base64, 
            fileName: nomeArquivo, 
            mimeType: blob.type,
            description: contexto 
        };

        try {
            await fetch(SCRIPT_URL, { method: 'POST', body: JSON.stringify(payload) });
            alert("Obrigada, o seu ruído foi recebido com sucesso!");
            limparCamposUpload();
        } catch (e) { alert("Erro ao enviar."); }
    };
}

function alternarBotoes(id, gravando) {
    const bloco = document.getElementById(id);
    bloco.querySelectorAll('button')[0].disabled = gravando;
    bloco.querySelectorAll('button')[1].disabled = !gravando;
}