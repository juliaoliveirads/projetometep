// Funções para controle do Menu Lateral (Mobile)
function openSidebar() {
    const sidebar = document.getElementById('main-sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    if (sidebar) sidebar.classList.add('active');
    if (overlay) overlay.classList.add('active');
}

function closeSidebar() {
    const sidebar = document.getElementById('main-sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    if (sidebar) sidebar.classList.remove('active');
    if (overlay) overlay.classList.remove('active');
}

function voltarParaContatos() {
    const chatSidebar = document.querySelector('.chat-sidebar');
    const chatWindow = document.querySelector('.chat-window');
    if (chatSidebar) chatSidebar.style.display = 'flex';
    if (chatWindow) chatWindow.style.display = 'none';
}

// Roteamento Simples (SPA)
function switchPage(pageId) {
    // Esconde todas as páginas
    document.querySelectorAll('.page-view').forEach(page => {
        page.classList.remove('active');
    });

    // Remove 'active' do menu
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });

    // Mostra a página selecionada
    document.getElementById('page-' + pageId).classList.add('active');

    // Ativa o item do menu correspondente
    const activeNav = Array.from(document.querySelectorAll('.nav-item')).find(el => el.getAttribute('onclick').includes(pageId));
    if(activeNav) activeNav.classList.add('active');

    // Correção crucial para o Leaflet: renderizar o mapa corretamente ao exibir a div
    if(pageId === 'mapa' && map) {
        setTimeout(() => { map.invalidateSize(); }, 100);
    }

    // Fechar sidebar no mobile ao navegar
    closeSidebar();

    // Se for a página de chat no mobile, decidir se mostra contatos ou chat ativo
    if (pageId === 'chat' && window.innerWidth <= 768) {
        voltarParaContatos();
    }
}

// Inicialização do Mapa Leaflet (Focado em Maringá-PR com base no seu contexto atual)
const map = L.map('leaflet-map').setView([-23.4210, -51.9331], 13);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap'
}).addTo(map);

const dangerIcon = L.icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34]
});

const warningIcon = L.icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34]
});

const orangeIcon = L.icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34]
});

const blueIcon = L.icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34]
});

const violetIcon = L.icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-violet.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34]
});

// --- SISTEMA DE MAPA DE RESGATE & ALERTAS ---
let alertas = [
    {
        id: 1,
        titulo: "Cachorro machucado",
        categoria: "Urgente",
        endereco: "Praça da Catedral, Centro",
        descricao: "Cão de médio porte atropelado, com machucado na pata traseira. Bastante assustado.",
        lat: -23.4250,
        lng: -51.9380,
        status: "Aberto",
        imagem: ""
    },
    {
        id: 2,
        titulo: "Colônia de Gatos",
        categoria: "Alimentação",
        endereco: "Terreno Av. Mandacaru",
        descricao: "Cerca de 6 gatos abandonados em um terreno baldio. Precisam de ração.",
        lat: -23.4110,
        lng: -51.9200,
        status: "Aberto",
        imagem: ""
    }
];

let activeMarkers = [];
let tempMarker = null;
let fotoReporteBase64 = null;

function calcularDistancia(lat1, lon1, lat2, lon2) {
    const R = 6371; // raio da Terra em km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

function renderAlertas() {
    // Limpa os marcadores existentes do mapa
    activeMarkers.forEach(m => map.removeLayer(m));
    activeMarkers = [];

    const listContainer = document.getElementById('alertas-list');
    if (!listContainer) return;
    listContainer.innerHTML = '';

    // Coordenada do centro de Maringá (simulando a posição do usuário)
    const userLat = -23.4210;
    const userLng = -51.9331;

    alertas.forEach(a => {
        let icon = blueIcon;
        let badgeClass = 'badge-blue';

        if (a.categoria === 'Urgente') {
            icon = dangerIcon;
            badgeClass = 'badge-red';
        } else if (a.categoria === 'Alimentação') {
            icon = warningIcon;
            badgeClass = 'badge-warning';
        } else if (a.categoria === 'Abandono') {
            icon = orangeIcon;
            badgeClass = 'badge-orange';
        } else if (a.categoria === 'Perdido') {
            icon = blueIcon;
            badgeClass = 'badge-blue';
        }

        const popupContent = `
            <div style="font-family: 'Inter', sans-serif; min-width: 150px; line-height: 1.4;">
                <h4 style="margin: 0 0 5px; font-weight: 700; font-size: 13px; color: var(--secondary);">${a.titulo}</h4>
                <span class="badge ${badgeClass}" style="font-size: 10px; padding: 2px 6px; display: inline-block; margin-bottom: 5px;">${a.categoria}</span>
                <p style="margin: 0; font-size: 11px; color: var(--text-muted);"><i class="fa-solid fa-map-pin"></i> ${a.endereco}</p>
                ${a.descricao ? `<p style="margin: 5px 0 0; font-size: 11px; color: var(--text-main); font-style: italic;">"${a.descricao}"</p>` : ''}
                <p style="margin: 5px 0 0; font-size: 11px; font-weight: 600; color: ${a.status === 'Resolvido' ? '#10b981' : (a.status === 'Em Resgate' ? 'var(--primary)' : 'var(--danger)')};">Status: ${a.status}</p>
            </div>
        `;

        const marker = L.marker([a.lat, a.lng], {icon: icon})
            .addTo(map)
            .bindPopup(popupContent);

        activeMarkers.push(marker);

        const dist = calcularDistancia(userLat, userLng, a.lat, a.lng);
        const distText = dist < 1 ? `${(dist * 1000).toFixed(0)} m daqui` : `${dist.toFixed(1)} km daqui`;

        const card = document.createElement('div');
        card.className = 'card report-card';

        let borderColor = 'var(--primary)';
        if (a.categoria === 'Urgente') borderColor = 'var(--danger)';
        else if (a.categoria === 'Alimentação') borderColor = 'var(--warning)';
        else if (a.categoria === 'Abandono') borderColor = '#f97316';

        card.style.borderLeft = `4px solid ${borderColor}`;
        card.style.cursor = 'pointer';
        card.style.transition = 'transform 0.2s, box-shadow 0.2s';
        card.style.padding = '15px';

        card.onclick = (e) => {
            if (e.target.closest('button')) return;
            map.setView([a.lat, a.lng], 15);
            setTimeout(() => { marker.openPopup(); }, 150);
        };

        card.onmouseenter = () => { card.style.transform = 'translateY(-2px)'; card.style.boxShadow = '0 6px 12px rgba(0,0,0,0.05)'; };
        card.onmouseleave = () => { card.style.transform = 'none'; card.style.boxShadow = 'none'; };

        let btnHtml = '';
        if (a.status === 'Aberto') {
            if (a.categoria === 'Urgente') {
                btnHtml = `<button type="button" class="btn btn-outline" style="width: 100%; font-size: 12px; padding: 6px; margin-top: 10px;" onclick="alterarStatusAlerta(${a.id}, 'Em Resgate')">Assumir Resgate</button>`;
            } else {
                btnHtml = `<button type="button" class="btn btn-outline" style="width: 100%; font-size: 12px; padding: 6px; margin-top: 10px;" onclick="alterarStatusAlerta(${a.id}, 'Em Resgate')">Oferecer Ajuda</button>`;
            }
        } else if (a.status === 'Em Resgate') {
            btnHtml = `<button type="button" class="btn btn-primary" style="width: 100%; font-size: 12px; padding: 6px; margin-top: 10px; background: #10b981; color: white;" onclick="alterarStatusAlerta(${a.id}, 'Resolvido')"><i class="fa-solid fa-circle-check"></i> Concluir Resgate</button>`;
        } else {
            btnHtml = `<div style="text-align: center; color: #10b981; font-weight: 600; font-size: 12px; padding: 6px 0; margin-top: 5px;"><i class="fa-solid fa-circle-check"></i> Resgate Concluído!</div>`;
        }

        card.innerHTML = `
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px; align-items: center;">
                <span class="badge ${badgeClass}">${a.categoria}</span>
                <span style="font-size: 12px; color: var(--text-muted); font-weight: 500;">${distText}</span>
            </div>
            <h4 style="font-size: 14px; margin-bottom: 5px; font-weight: 700; color: var(--secondary);">${a.titulo}</h4>
            <p style="font-size: 13px; color: var(--text-muted); margin-bottom: 5px;"><i class="fa-solid fa-map-pin"></i> ${a.endereco}</p>
            ${a.descricao ? `<p style="font-size: 12px; color: var(--text-muted); margin-bottom: 10px; font-style: italic; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${a.descricao}</p>` : ''}
            ${btnHtml}
        `;

        listContainer.appendChild(card);
    });
}

function alterarStatusAlerta(id, novoStatus) {
    const alerta = alertas.find(a => a.id === id);
    if (!alerta) return;

    alerta.status = novoStatus;
    renderAlertas();

    if (novoStatus === 'Em Resgate') {
        mostrarToast(`Você assumiu o suporte para: "${alerta.titulo}"!`);
    } else if (novoStatus === 'Resolvido') {
        mostrarToast(`Sucesso! Alerta concluído/animal resgatado.`);
    }
}

function abrirModalReportar(lat, lng) {
    document.getElementById('modal-reportar').style.display = 'flex';

    let defaultLat = lat;
    let defaultLng = lng;

    if (!defaultLat || !defaultLng) {
        const center = map.getCenter();
        defaultLat = center.lat;
        defaultLng = center.lng;
    }

    document.getElementById('reporte-lat').value = defaultLat.toFixed(6);
    document.getElementById('reporte-lng').value = defaultLng.toFixed(6);

    if (tempMarker) {
        tempMarker.setLatLng([defaultLat, defaultLng]);
    } else {
        tempMarker = L.marker([defaultLat, defaultLng], {icon: violetIcon, draggable: true}).addTo(map)
            .bindPopup('<b>Local de resgate selecionado</b><br>Arraste para ajustar a posição se necessário.').openPopup();

        tempMarker.on('dragend', function(event) {
            const position = event.target.getLatLng();
            document.getElementById('reporte-lat').value = position.lat.toFixed(6);
            document.getElementById('reporte-lng').value = position.lng.toFixed(6);
        });
    }
    map.setView([defaultLat, defaultLng], 14);
}

function fecharModalReportar() {
    document.getElementById('modal-reportar').style.display = 'none';
    document.getElementById('modal-reportar-form').reset();
    removerPreviewImagemReporte();

    if (tempMarker) {
        map.removeLayer(tempMarker);
        tempMarker = null;
    }
}

function handleReporteImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
        alert('A imagem excede o tamanho máximo de 5MB.');
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        fotoReporteBase64 = e.target.result;
        document.getElementById('upload-preview-img-reporte').src = e.target.result;
        document.getElementById('upload-prompt-reporte').style.display = 'none';
        document.getElementById('upload-preview-reporte').style.display = 'block';
    };
    reader.readAsDataURL(file);
}

function removerPreviewImagemReporte(event) {
    if (event) event.stopPropagation();
    document.getElementById('reporte-foto').value = '';
    fotoReporteBase64 = null;
    document.getElementById('upload-prompt-reporte').style.display = 'block';
    document.getElementById('upload-preview-reporte').style.display = 'none';
}

function salvarReporte(event) {
    event.preventDefault();

    const titulo = document.getElementById('reporte-titulo').value.trim();
    const categoria = document.getElementById('reporte-categoria').value;
    const endereco = document.getElementById('reporte-endereco').value.trim();
    const lat = parseFloat(document.getElementById('reporte-lat').value);
    const lng = parseFloat(document.getElementById('reporte-lng').value);
    const descricao = document.getElementById('reporte-descricao').value.trim();

    const novoAlerta = {
        id: alertas.length + 1,
        titulo: titulo,
        categoria: categoria,
        endereco: endereco,
        descricao: descricao,
        lat: lat,
        lng: lng,
        status: "Aberto",
        imagem: fotoReporteBase64 || ""
    };

    alertas.unshift(novoAlerta);

    if (tempMarker) {
        map.removeLayer(tempMarker);
        tempMarker = null;
    }

    renderAlertas();
    fecharModalReportar();
    mostrarToast(`Alerta "${titulo}" registrado com sucesso!`);
}

// Clique no mapa para capturar coordenadas
map.on('click', function(e) {
    abrirModalReportar(e.latlng.lat, e.latlng.lng);
});

// --- SISTEMA DE APOIO FINANCEIRO / DOAÇÕES ---
let campanhaAtiva = null;
let totalDoadoGeral = 4250; // Valor inicial do Painel Inicial

function abrirApoioCampanha(id, titulo, descricao, meta, arrecadado, imagem) {
    campanhaAtiva = {
        id: id,
        titulo: titulo,
        descricao: descricao,
        meta: meta,
        arrecadado: arrecadado,
        imagem: imagem,
        doado: 50.0 // Valor padrão
    };

    // Preenche dados da esquerda (Resumo)
    document.getElementById('apoio-img').src = imagem;
    document.getElementById('apoio-titulo').innerText = titulo;
    document.getElementById('apoio-desc').innerText = descricao;
    document.getElementById('apoio-arrecadado-lbl').innerText = `Arrecadado: R$ ` + arrecadado.toLocaleString('pt-BR');
    document.getElementById('apoio-meta-lbl').innerText = `Meta: R$ ` + meta.toLocaleString('pt-BR');
    document.getElementById('apoio-progresso-bar').style.width = Math.min(((arrecadado / meta) * 100), 100) + `%`;

    // Reseta estados do formulário
    document.getElementById('apoio-checkout-flow').style.display = 'grid';
    document.getElementById('apoio-sucesso').style.display = 'none';
    document.getElementById('apoio-loading').style.display = 'none';
    document.getElementById('apoio-valor-customizado').value = '';

    // Reseta os botões de valor (seleciona o R$ 50 por padrão)
    document.querySelectorAll('.value-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.innerText.includes('50')) {
            btn.classList.add('active');
        }
    });

    // Reseta os campos de cartão
    document.getElementById('cc-number').value = '';
    document.getElementById('cc-name').value = '';
    document.getElementById('cc-expiry').value = '';
    document.getElementById('cc-cvv').value = '';

    // Atualiza o botão de submit
    atualizarTextoBotaoSubmit(50);

    // Abre a aba Pix por padrão
    switchMetodoPagamento('pix');

    // Navega para a página de apoio
    switchPage('apoiar');
}

function selecionarValor(valor, btnElement) {
    // Remove a classe active de todos os botões de valor
    document.querySelectorAll('.value-btn').forEach(btn => btn.classList.remove('active'));
    // Adiciona no botão clicado
    if (btnElement) btnElement.classList.add('active');

    // Limpa o valor customizado
    document.getElementById('apoio-valor-customizado').value = '';

    campanhaAtiva.doado = parseFloat(valor);
    atualizarTextoBotaoSubmit(valor);
}

function selecionarValorCustomizado(valorStr) {
    // Remove a classe active de todos os botões de valor
    document.querySelectorAll('.value-btn').forEach(btn => btn.classList.remove('active'));

    let valor = parseFloat(valorStr);
    if (isNaN(valor) || valor <= 0) {
        valor = 0;
    }

    campanhaAtiva.doado = valor;
    atualizarTextoBotaoSubmit(valor);
}

function atualizarTextoBotaoSubmit(valor) {
    const btn = document.getElementById('apoio-btn-submit');
    btn.innerText = `Confirmar Apoio de R$ ` + valor.toFixed(2).replace('.', ',');
}

function switchMetodoPagamento(metodo) {
    // Desativa todas as abas e painéis
    document.querySelectorAll('.payment-tab').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.payment-pane').forEach(pane => pane.classList.remove('active'));

    // Ativa o selecionado
    document.getElementById('tab-' + metodo).classList.add('active');
    document.getElementById('pane-' + metodo).classList.add('active');

    // Gerencia os campos obrigatórios do cartão
    const camposCartao = ['cc-number', 'cc-name', 'cc-expiry', 'cc-cvv'];
    camposCartao.forEach(id => {
        const el = document.getElementById(id);
        if (metodo === 'cartao') {
            el.setAttribute('required', 'required');
        } else {
            el.removeAttribute('required');
        }
    });
}

function copiarTexto(inputId, mensagemToast) {
    const inputEl = document.getElementById(inputId);
    inputEl.select();
    inputEl.setSelectionRange(0, 99999); // Para mobile

    navigator.clipboard.writeText(inputEl.value).then(() => {
        mostrarToast(mensagemToast);
    }).catch(err => {
        // Fallback para navegadores sem suporte ao clipboard API
        try {
            document.execCommand('copy');
            mostrarToast(mensagemToast);
        } catch (e) {
            alert('Não foi possível copiar o código. Copie manualmente.');
        }
    });
}

function mostrarToast(mensagem) {
    const toast = document.getElementById('toast-notification');
    document.getElementById('toast-message').innerText = mensagem;
    toast.style.display = 'flex';

    // Esconde após 3 segundos
    setTimeout(() => {
        toast.style.animation = 'fadeOut 0.3s ease-in';
        setTimeout(() => {
            toast.style.display = 'none';
            toast.style.animation = ''; // Limpa a animação
        }, 300);
    }, 3000);
}

function processarDoacao(event) {
    event.preventDefault();

    if (!campanhaAtiva || campanhaAtiva.doado <= 0) {
        alert('Por favor, selecione um valor de doação válido.');
        return;
    }

    // Exibe o spinner de carregamento
    document.getElementById('apoio-loading').style.display = 'flex';

    // Simula o delay da rede (gateway de pagamento)
    setTimeout(() => {
        // Oculta o loader
        document.getElementById('apoio-loading').style.display = 'none';

        // Calcula novos valores
        const valorDoacao = campanhaAtiva.doado;
        const novoArrecadado = campanhaAtiva.arrecadado + valorDoacao;

        // 1. Atualiza a campanha na base de dados e re-renderiza
        const v = vaquinhas.find(item => item.id === campanhaAtiva.id);
        if (v) {
            v.arrecadado = novoArrecadado;
        }
        renderVaquinhas();
        renderLarPets();

        // 2. Atualiza o dashboard global
        totalDoadoGeral += valorDoacao;
        const dashArrecadacao = document.getElementById('dashboard-arrecadacao');
        if (dashArrecadacao) {
            dashArrecadacao.innerText = `R$ ` + totalDoadoGeral.toLocaleString('pt-BR');
        }

        // 3. Popula a tela de sucesso
        const doadorNome = document.getElementById('doador-nome').value.trim() || 'Doador';
        document.getElementById('sucesso-doador').innerText = doadorNome.split(' ')[0]; // Apenas o primeiro nome
        document.getElementById('sucesso-valor').innerText = `R$ ` + valorDoacao.toFixed(2).replace('.', ',');

        const sucessoCampanhaEl = document.getElementById('sucesso-campanha');
        if (sucessoCampanhaEl) sucessoCampanhaEl.innerText = campanhaAtiva.titulo;

        document.getElementById('sucesso-progresso-lbl').innerText = `R$ ` + novoArrecadado.toLocaleString('pt-BR') + ` arrecadados`;
        document.getElementById('sucesso-meta-lbl').innerText = `Meta: R$ ` + campanhaAtiva.meta.toLocaleString('pt-BR');
        document.getElementById('sucesso-progresso-bar').style.width = Math.min(((novoArrecadado / campanhaAtiva.meta) * 100), 100) + `%`;

        // Chaveia para a tela de sucesso
        document.getElementById('apoio-checkout-flow').style.display = 'none';
        document.getElementById('apoio-sucesso').style.display = 'block';

    }, 1500); // 1.5s de simulação
}

function finalizarRetornoCampanhas() {
    switchPage('doacao');
}

// --- SISTEMA DE CADASTRO E VITRINE DE ADOÇÃO ---
let pets = [
    {
        nome: "Amendoim",
        especie: "Cachorro",
        porte: "Pequeno",
        idade: "2 anos",
        sexo: "Macho",
        tags: ["Vacinado", "Castrado"],
        localizacao: "Abrigo Municipal - Centro",
        imagem: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=600&q=80"
    },
    {
        nome: "Mia",
        especie: "Gato",
        porte: "Pequeno",
        idade: "1 ano",
        sexo: "Fêmea",
        tags: ["FIV/FeLV Neg.", "Castrada"],
        localizacao: "Lar Temporário da Ana",
        imagem: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=600&q=80"
    },
    {
        nome: "Duke",
        especie: "Cachorro",
        porte: "Grande",
        idade: "3 anos",
        sexo: "Macho",
        tags: ["Dócil", "Necessita Espaço"],
        localizacao: "ONG Vida Animal - Zona Sul",
        imagem: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=600&q=80"
    }
];

let fotoPreviewBase64 = null;
let filtroPorteAtivo = 'Todos';
let totalResgatadosGeral = 124; // Valor inicial do Painel Inicial

// Renderiza a lista de pets
function renderPets(listaFiltered) {
    const petGrid = document.getElementById('pet-grid');
    if (!petGrid) return;

    petGrid.innerHTML = '';
    const lista = listaFiltered || pets;

    if (lista.length === 0) {
        petGrid.innerHTML = `
            <div style="grid-column: span 3; text-align: center; padding: 40px; color: var(--text-muted);">
                <i class="fa-solid fa-paw" style="font-size: 48px; margin-bottom: 15px; opacity: 0.3;"></i>
                <p>Nenhum animal encontrado com os filtros selecionados.</p>
            </div>
        `;
        return;
    }

    lista.forEach(pet => {
        const card = document.createElement('div');
        card.className = 'card pet-card';

        const sexIcon = pet.sexo === 'Macho'
            ? '<i class="fa-solid fa-mars" style="color: #3b82f6;"></i>'
            : '<i class="fa-solid fa-venus" style="color: #ec4899;"></i>';

        const tagsHtml = pet.tags.map(tag => `<span class="badge badge-green">${tag}</span>`).join('');

        card.innerHTML = `
            <img src="${pet.imagem}" alt="${pet.nome}" class="pet-img">
            <div class="pet-info">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <h2 style="font-size: 20px;">${pet.nome}</h2>
                    ${sexIcon}
                </div>
                <div class="pet-tags" style="display: flex; gap: 6px; margin: 10px 0; flex-wrap: wrap;">
                    ${tagsHtml}
                </div>
                <p style="font-size: 13px; color: var(--text-muted); margin: 10px 0;">
                    <i class="fa-solid fa-location-dot"></i> ${pet.localizacao}
                </p>
                <button class="btn btn-primary" style="width: 100%;" onclick="iniciarConversaAdocao('${pet.nome}', '${pet.imagem}')">Quero Adotar</button>
            </div>
        `;
        petGrid.appendChild(card);
    });
}

// Upload de imagem no cadastro
function handleImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    // Valida tamanho de arquivo (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
        alert('A imagem excede o tamanho máximo de 5MB.');
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        fotoPreviewBase64 = e.target.result;
        document.getElementById('upload-preview-img').src = e.target.result;
        document.getElementById('upload-prompt').style.display = 'none';
        document.getElementById('upload-preview').style.display = 'block';
    };
    reader.readAsDataURL(file);
}

function removerPreviewImagem(event) {
    if (event) event.stopPropagation(); // Evita reabrir o seletor
    document.getElementById('cadastro-foto').value = '';
    fotoPreviewBase64 = null;
    document.getElementById('upload-prompt').style.display = 'block';
    document.getElementById('upload-preview').style.display = 'none';
}

// Salvar cadastro de animal
function cadastrarAnimal(event) {
    event.preventDefault();

    let nome = document.getElementById('cadastro-nome').value.trim();
    if (!nome) {
        nome = 'Amiguinho sem Nome';
    }

    const especie = document.getElementById('cadastro-especie').value;
    const sexo = document.getElementById('cadastro-sexo').value;
    const porte = document.getElementById('cadastro-porte').value;
    const idade = document.getElementById('cadastro-idade').value.trim() || 'Idade desconhecida';
    const descricao = document.getElementById('cadastro-descricao').value.trim();

    // Determinar imagem (Base64 ou fallback Unsplash bonito)
    let imagem = fotoPreviewBase64;
    if (!imagem) {
        if (especie === 'Cachorro') {
            imagem = 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=600&q=80';
        } else if (especie === 'Gato') {
            imagem = 'https://images.unsplash.com/photo-1533738363-b7f9aef128ce?auto=format&fit=crop&w=600&q=80';
        } else {
            imagem = 'https://images.unsplash.com/photo-1474511320723-9a56873867b5?auto=format&fit=crop&w=600&q=80';
        }
    }

    // Gerar tags de saúde baseadas nos checkboxes e sexo
    const tags = [];
    const isFemea = sexo === 'Fêmea';

    if (document.getElementById('cadastro-castrado').checked) {
        tags.push(isFemea ? 'Castrada' : 'Castrado');
    }
    if (document.getElementById('cadastro-vacinado').checked) {
        tags.push(isFemea ? 'Vacinada' : 'Vacinado');
    }
    if (document.getElementById('cadastro-vermifugado').checked) {
        tags.push(isFemea ? 'Vermifugada' : 'Vermifugado');
    }
    if (document.getElementById('cadastro-especial').checked) {
        tags.push('Especial');
    }

    // Fallback tags se nada for selecionado
    if (tags.length === 0) {
        tags.push('Resgatado');
        tags.push(especie);
    }

    // Novo pet objeto
    const novoPet = {
        nome: nome,
        especie: especie,
        porte: porte,
        idade: idade,
        sexo: sexo,
        tags: tags,
        localizacao: 'ONG Vida Animal - Maringá, PR',
        imagem: imagem
    };

    // Adiciona na lista global
    pets.unshift(novoPet); // Adiciona no início da lista

    // Incrementa contagem do Dashboard
    totalResgatadosGeral++;
    const dashResgatados = document.getElementById('dashboard-resgatados');
    if (dashResgatados) {
        dashResgatados.innerText = totalResgatadosGeral;
    }

    // Limpa o formulário e preview
    document.getElementById('cadastro-form').reset();
    removerPreviewImagem();

    // Feedback visual e redirecionamento
    mostrarToast(`${nome} cadastrado(a) com sucesso!`);
    renderPets();
    switchPage('adocao');
}

// Gerenciamento de filtros de busca da vitrine
function selecionarFiltroPorte(porte, btn) {
    // Remove a classe active de todos os botões de porte
    document.querySelectorAll('.filtro-porte-btn').forEach(b => {
        b.classList.remove('active');
        b.style.background = '#f1f5f9';
        b.style.color = 'var(--text-muted)';
    });

    // Ativa o clicado
    btn.classList.add('active');
    btn.style.background = 'var(--primary)';
    btn.style.color = 'white';

    filtroPorteAtivo = porte;
}

function aplicarFiltrosAdocao() {
    const local = document.getElementById('filtro-localizacao').value.trim().toLowerCase();

    // Pega espécie selecionada via radio button
    const specieRadio = document.querySelector('input[name="specie"]:checked');
    const especieSelected = specieRadio ? specieRadio.value : 'Todos';

    const filtered = pets.filter(pet => {
        // Filtro espécie
        let matchEspecie = true;
        if (especieSelected === 'Cachorro') {
            matchEspecie = pet.especie === 'Cachorro';
        } else if (especieSelected === 'Gato') {
            matchEspecie = pet.especie === 'Gato';
        }

        // Filtro porte
        let matchPorte = true;
        if (filtroPorteAtivo !== 'Todos') {
            matchPorte = pet.porte === filtroPorteAtivo;
        }

        // Filtro localização
        let matchLocal = true;
        if (local) {
            matchLocal = pet.localizacao.toLowerCase().includes(local);
        }

        return matchEspecie && matchPorte && matchLocal;
    });

    renderPets(filtered);
    mostrarToast(`Filtros aplicados! ${filtered.length} animais encontrados.`);
}

// --- GESTÃO E INTERATIVIDADE DO LAR TEMPORÁRIO (JS BUSINESS LOGIC) ---
let currentShelterName = "ONG Vida Animal";

// Banco de Dados de Animais Adotados
let adotados = [
    {
        nome: "Pipoca",
        especie: "Gato",
        porte: "Pequeno",
        sexo: "Macho",
        imagem: "https://images.unsplash.com/photo-1573865526739-10659fec78a5?auto=format&fit=crop&w=150&q=80",
        adotante: "Mariana Silva",
        data: "12/05/2026"
    },
    {
        nome: "Luna",
        especie: "Cachorro",
        porte: "Médio",
        sexo: "Fêmea",
        imagem: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=150&q=80",
        adotante: "Ricardo Santos",
        data: "28/05/2026"
    }
];

// Banco de Dados de Vaquinhas
let vaquinhas = [
    {
        id: 1,
        titulo: "Cirurgia Ortopédica do Bob",
        descricao: "Bob foi atropelado e precisa de cirurgia urgente no fêmur.",
        meta: 2000,
        arrecadado: 1300,
        categoria: "Cirurgia",
        badgeClass: "badge-red",
        tempoRestante: "5 dias restantes",
        imagem: "https://images.unsplash.com/photo-1593134257782-e89567b7718a?auto=format&fit=crop&w=300&q=80"
    },
    {
        id: 2,
        titulo: "Reforma dos Canis - ONG SOS",
        descricao: "Precisamos cobrir o teto para o inverno rigoroso que se aproxima.",
        meta: 5000,
        arrecadado: 1500,
        categoria: "Estrutura",
        badgeClass: "badge-blue",
        tempoRestante: "Contínuo",
        imagem: "https://images.unsplash.com/photo-1592194996308-7b43878e84a6?auto=format&fit=crop&w=300&q=80"
    }
];

// Banco de Dados de Insumos no Mural
let insumosMural = [
    { id: 1, produto: "Ração Filhotes (Gatos)", local: "Lar Temporário Ana", icone: "fa-bowl-food" },
    { id: 2, produto: "Vermífugo / Antipulgas", local: "ONG Vida Animal", icone: "fa-pills" },
    { id: 3, produto: "Cobertores e Caminhas", local: "Abrigo Municipal", icone: "fa-blanket" }
];

// Banco de Dados de Chat/Mensagens
let conversas = [
    {
        id: 1,
        nome: "Ana Souza",
        pet: "Duke",
        avatar: "https://i.pravatar.cc/100?img=1",
        status: "Online",
        tipo: "received",
        mensagens: [
            { remetente: "adotante", texto: "Olá! Vi o Duke na vitrine e me apaixonei. Ele se dá bem com gatos?", tempo: "14:20" },
            { remetente: "lar", texto: "Olá Ana! O Duke é super manso e brincalhão, se dá muito bem com outros animais sim!", tempo: "14:25" },
            { remetente: "adotante", texto: "Que ótimo! Gostaria de agendar uma visita para conhecê-lo. É possível?", tempo: "14:30" }
        ]
    },
    {
        id: 2,
        nome: "Ricardo Santos",
        pet: "Mia",
        avatar: "https://i.pravatar.cc/100?img=12",
        status: "Offline",
        tipo: "received",
        mensagens: [
            { remetente: "adotante", texto: "Olá, gostaria de saber mais informações sobre a Mia. Ela é muito ativa?", tempo: "Ontem" },
            { remetente: "lar", texto: "Olá Ricardo! A Mia é calma, gosta de dormir no sol e é bem carinhosa.", tempo: "Ontem" }
        ]
    }
];
let conversaAtivaId = 1;

// Renderização dos Animais no Painel do Lar
function renderLarPets() {
    const hospedadosGrid = document.getElementById('lar-hospedados-grid');
    const adotadosGrid = document.getElementById('lar-adotados-grid');
    if (!hospedadosGrid || !adotadosGrid) return;

    // Filtra hospedados ativos com base no nome atual do lar
    let ativos = pets.filter(p => p.localizacao.includes(currentShelterName));

    // Atualiza os indicadores superiores
    document.getElementById('lar-total-ativos').innerText = ativos.length;
    document.getElementById('lar-total-adotados').innerText = adotados.length;
    document.getElementById('lar-total-vaquinhas').innerText = vaquinhas.length;

    // Renderiza Hospedados Ativos
    hospedadosGrid.innerHTML = '';
    if (ativos.length === 0) {
        hospedadosGrid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--text-muted);">
                <i class="fa-solid fa-paw" style="font-size: 32px; margin-bottom: 10px; opacity: 0.3;"></i>
                <p>Nenhum animal hospedado no momento.</p>
            </div>
        `;
    } else {
        ativos.forEach(pet => {
            const card = document.createElement('div');
            card.className = 'admin-pet-card';

            const sexIcon = pet.sexo === 'Macho'
                ? '<i class="fa-solid fa-mars" style="color: #3b82f6;"></i>'
                : '<i class="fa-solid fa-venus" style="color: #ec4899;"></i>';

            card.innerHTML = `
                <img src="${pet.imagem}" class="admin-pet-img" alt="${pet.nome}">
                <div style="flex-grow: 1;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <h4 style="font-weight: 600; font-size: 15px; color: var(--text-main);">${pet.nome}</h4>
                        ${sexIcon}
                    </div>
                    <p style="font-size: 12px; color: var(--text-muted); margin-top: 3px;">${pet.especie} • ${pet.porte} • ${pet.idade}</p>
                    <span class="badge badge-blue" style="margin-top: 5px; display: inline-block; font-size: 11px;">Hospedado</span>
                </div>
            `;
            hospedadosGrid.appendChild(card);
        });
    }

    // Renderiza Histórico de Adotados
    adotadosGrid.innerHTML = '';
    if (adotados.length === 0) {
        adotadosGrid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--text-muted);">
                <i class="fa-solid fa-circle-check" style="font-size: 32px; margin-bottom: 10px; opacity: 0.3;"></i>
                <p>Nenhum histórico de adoção registrado.</p>
            </div>
        `;
    } else {
        adotados.forEach(pet => {
            const card = document.createElement('div');
            card.className = 'admin-pet-card';

            const sexIcon = pet.sexo === 'Macho'
                ? '<i class="fa-solid fa-mars" style="color: #3b82f6;"></i>'
                : '<i class="fa-solid fa-venus" style="color: #ec4899;"></i>';

            card.innerHTML = `
                <img src="${pet.imagem}" class="admin-pet-img" alt="${pet.nome}">
                <div style="flex-grow: 1;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <h4 style="font-weight: 600; font-size: 15px; color: var(--text-main);">${pet.nome}</h4>
                        ${sexIcon}
                    </div>
                    <p style="font-size: 12px; color: var(--text-muted); margin-top: 3px;">Adotado por: <strong>${pet.adotante}</strong></p>
                    <p style="font-size: 11px; color: var(--primary-dark); font-weight: 500; margin-top: 2px;">
                        <i class="fa-regular fa-calendar-check"></i> Em ${pet.data}
                    </p>
                </div>
            `;
            adotadosGrid.appendChild(card);
        });
    }
}

// Alternância de Abas no Painel do Lar
function switchAbaLar(aba) {
    document.getElementById('tab-btn-hospedados').classList.remove('active');
    document.getElementById('tab-btn-adotados').classList.remove('active');
    document.getElementById('pane-lar-hospedados').style.display = 'none';
    document.getElementById('pane-lar-adotados').style.display = 'none';

    if (aba === 'hospedados') {
        document.getElementById('tab-btn-hospedados').classList.add('active');
        document.getElementById('pane-lar-hospedados').style.display = 'block';
    } else {
        document.getElementById('tab-btn-adotados').classList.add('active');
        document.getElementById('pane-lar-adotados').style.display = 'block';
    }
}

// Modais do Painel do Lar
function abrirModalVaquinha() {
    document.getElementById('modal-vaquinha').style.display = 'flex';
}

function fecharModalVaquinha() {
    document.getElementById('modal-vaquinha').style.display = 'none';
    document.getElementById('modal-vaquinha-form').reset();
}

function criarVaquinhaLar(event) {
    event.preventDefault();

    const titulo = document.getElementById('vaquinha-titulo').value.trim();
    const meta = parseFloat(document.getElementById('vaquinha-meta').value);
    const descricao = document.getElementById('vaquinha-descricao').value.trim();

    if (!titulo || isNaN(meta) || meta <= 0 || !descricao) {
        alert("Por favor, preencha todos os campos obrigatórios.");
        return;
    }

    const novoId = vaquinhas.length + 1;

    const fotosAdicionais = [
        "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=300&q=80",
        "https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=300&q=80",
        "https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=300&q=80"
    ];
    const randomImg = fotosAdicionais[novoId % fotosAdicionais.length];

    const novaVaquinha = {
        id: novoId,
        titulo: titulo,
        descricao: descricao,
        meta: meta,
        arrecadado: 0,
        categoria: "Emergência",
        badgeClass: "badge-red",
        tempoRestante: "30 dias restantes",
        imagem: randomImg
    };

    vaquinhas.unshift(novaVaquinha);

    // Re-render
    renderVaquinhas();
    renderLarPets();

    fecharModalVaquinha();
    mostrarToast(`Campanha "${titulo}" publicada com sucesso!`);
}

function abrirModalInsumos() {
    document.getElementById('modal-insumos').style.display = 'flex';
    atualizarLabelJustificativa('solicitar');
}

function fecharModalInsumos() {
    document.getElementById('modal-insumos').style.display = 'none';
    document.getElementById('modal-insumos-form').reset();
}

function atualizarLabelJustificativa(acao) {
    const label = document.getElementById('insumo-justificativa-label');
    const btn = document.getElementById('insumo-submit-btn');

    if (acao === 'solicitar') {
        label.innerText = 'Justificativa / Observação *';
        btn.innerText = 'Solicitar Doação';
        document.getElementById('insumo-justificativa').placeholder = 'Ex: Recebemos 3 filhotes e estamos sem ração...';
    } else {
        label.innerText = 'Motivo da Retirada / Destinatário *';
        btn.innerText = 'Retirar do Estoque';
        document.getElementById('insumo-justificativa').placeholder = 'Ex: Ração consumida pelos filhotes hospedados esta semana.';
    }
}

function processarInsumosLar(event) {
    event.preventDefault();

    const produto = document.getElementById('insumo-produto').value;
    const quantidade = parseInt(document.getElementById('insumo-quantidade').value);
    const acao = document.getElementById('insumo-acao').value;
    const justificativa = document.getElementById('insumo-justificativa').value.trim();

    if (isNaN(quantidade) || quantidade <= 0 || !justificativa) {
        alert("Por favor, preencha todos os campos obrigatórios.");
        return;
    }

    if (acao === 'solicitar') {
        let icone = "fa-box";
        if (produto.includes("Ração")) icone = "fa-bowl-food";
        else if (produto.includes("Vermífugo") || produto.includes("Medicamento")) icone = "fa-pills";
        else if (produto.includes("Cobertores")) icone = "fa-blanket";

        const novoInsumo = {
            id: insumosMural.length + 1,
            produto: `${produto} (${quantidade}x)`,
            local: currentShelterName,
            icone: icone
        };

        insumosMural.push(novoInsumo);
        renderInsumosMural();
        mostrarToast(`Solicitação de ${produto} adicionada ao mural!`);
    } else {
        mostrarToast(`Sucesso! ${quantidade}x ${produto} retirados do estoque central.`);
    }

    fecharModalInsumos();
}

// Renderização do Mural de Insumos e Vaquinhas
function renderVaquinhas() {
    const container = document.getElementById('vaquinhas-container');
    if (!container) return;

    container.innerHTML = '';
    vaquinhas.forEach(v => {
        const card = document.createElement('div');
        card.className = 'card';
        card.style.display = 'flex';
        card.style.gap = '20px';

        const pct = Math.min(((v.arrecadado / v.meta) * 100), 100).toFixed(0);

        card.innerHTML = `
            <img src="${v.imagem}" style="width: 140px; height: 140px; border-radius: 8px; object-fit: cover;">
            <div style="flex-grow: 1;">
                <div style="display: flex; justify-content: space-between;">
                    <span class="badge ${v.badgeClass || 'badge-red'}">${v.categoria}</span>
                    <span style="font-size: 12px; color: var(--text-muted);"><i class="fa-solid fa-clock"></i> ${v.tempoRestante}</span>
                </div>
                <h3 style="margin: 10px 0 5px; font-size: 16px;">${v.titulo}</h3>
                <p style="font-size: 13px; color: var(--text-muted); margin-bottom: 10px;">${v.descricao}</p>

                <div class="progress-bar"><div id="progresso-fill-${v.id}" class="progress-fill" style="width: ${pct}%;"></div></div>
                <div style="display: flex; justify-content: space-between; font-size: 12px; font-weight: 600;">
                    <span id="arrecadado-txt-${v.id}">Arrecadado: R$ ${v.arrecadado.toLocaleString('pt-BR')}</span>
                    <span style="color: var(--text-muted);">Meta: R$ ${v.meta.toLocaleString('pt-BR')}</span>
                </div>
                <button class="btn btn-primary" style="width: 100%; margin-top: 15px;" onclick="abrirApoioCampanha(${v.id}, '${v.titulo.replace(/'/g, "\\'")}', '${v.descricao.replace(/'/g, "\\'")}', ${v.meta}, ${v.arrecadado}, '${v.imagem}')">Apoiar Financeiramente</button>
            </div>
        `;
        container.appendChild(card);
    });
}

function renderInsumosMural() {
    const container = document.getElementById('mural-insumos-container');
    if (!container) return;

    container.innerHTML = '';
    insumosMural.forEach(item => {
        const card = document.createElement('div');
        card.className = 'card';
        card.style.textAlign = 'center';

        card.innerHTML = `
            <i class="fa-solid ${item.icone}" style="font-size: 32px; color: var(--secondary); margin-bottom: 10px;"></i>
            <h4 style="font-size: 15px;">${item.produto}</h4>
            <p style="font-size: 12px; color: var(--text-muted); margin: 10px 0;">${item.local}</p>
            <button class="btn btn-outline" style="width: 100%; font-size: 13px;" onclick="alert('Obrigado! Um e-mail de contato foi enviado para o responsável por este item.')">Combinar Entrega</button>
        `;
        container.appendChild(card);
    });
}

// Lógica do Sistema de Chat/Mensagens
let activeChatTab = 'all'; // 'all', 'mine', 'received'
let chatSearchQuery = '';

function renderConversas() {
    const contactsContainer = document.getElementById('chat-contacts');
    if (!contactsContainer) return;

    contactsContainer.innerHTML = '';

    // Filtrar conversas por aba e por termo de busca
    const filtered = conversas.filter(c => {
        // Filtro por aba
        if (activeChatTab === 'mine' && c.tipo !== 'mine') return false;
        if (activeChatTab === 'received' && c.tipo !== 'received') return false;

        // Filtro por busca
        if (chatSearchQuery) {
            const query = chatSearchQuery.toLowerCase();
            return c.nome.toLowerCase().includes(query) || c.pet.toLowerCase().includes(query);
        }

        return true;
    });

    if (filtered.length === 0) {
        contactsContainer.innerHTML = `
            <div style="text-align: center; padding: 30px 10px; color: var(--text-muted); font-size: 13px;">
                <i class="fa-regular fa-comments" style="font-size: 24px; opacity: 0.3; margin-bottom: 8px; display: block;"></i>
                Nenhuma conversa encontrada
            </div>
        `;
        return;
    }

    filtered.forEach(c => {
        const lastMsg = c.mensagens[c.mensagens.length - 1];
        const lastMsgText = lastMsg ? lastMsg.texto : 'Escreva uma mensagem...';
        const lastMsgTime = lastMsg ? lastMsg.tempo : '';

        const activeClass = c.id === conversaAtivaId ? 'active' : '';

        // Definir cores de tag para visualização premium
        let tagText = "";
        let tagStyle = "";
        if (c.tipo === "mine") {
            tagText = "Meu Interesse";
            tagStyle = "background: #e0f2fe; color: #0369a1; border: 1px solid #bae6fd;";
        } else {
            tagText = "Me Contatou";
            tagStyle = "background: #faf5ff; color: #6b21a8; border: 1px solid #f3e8ff;";
        }

        const item = document.createElement('div');
        item.className = `contact-item ${activeClass}`;
        item.onclick = () => { selectConversa(c.id); };

        item.innerHTML = `
            <img src="${c.avatar}" class="contact-avatar" alt="${c.nome}">
            <div class="contact-details">
                <div class="contact-name">
                    <span>${c.nome}</span>
                    <span style="font-weight: 400; font-size: 11px; color: var(--text-muted);">${lastMsgTime}</span>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 4px; gap: 5px;">
                    <span style="font-size: 11px; color: var(--primary); font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 110px;">Interesse: ${c.pet}</span>
                    <span class="badge" style="${tagStyle} font-size: 9px; padding: 1px 6px; border-radius: 10px; font-weight: 600; white-space: nowrap;">${tagText}</span>
                </div>
                <div class="contact-preview">${lastMsgText}</div>
            </div>
        `;
        contactsContainer.appendChild(item);
    });

    const badges = document.querySelectorAll('.badge-notification');
    badges.forEach(b => {
        b.innerText = conversas.length;
    });
}

function filtrarConversas(val) {
    chatSearchQuery = val;
    renderConversas();
}

function filterChatTab(tab) {
    activeChatTab = tab;

    const buttons = {
        all: document.getElementById('chat-filter-all'),
        mine: document.getElementById('chat-filter-mine'),
        received: document.getElementById('chat-filter-received')
    };

    Object.keys(buttons).forEach(key => {
        const btn = buttons[key];
        if (!btn) return;
        if (key === tab) {
            btn.classList.add('active');
            btn.style.background = 'var(--primary)';
            btn.style.color = 'white';
        } else {
            btn.classList.remove('active');
            btn.style.background = '#e2e8f0';
            btn.style.color = 'var(--text-muted)';
        }
    });

    renderConversas();
}

function selectConversa(id) {
    conversaAtivaId = id;

    document.querySelectorAll('.contact-item').forEach(el => el.classList.remove('active'));

    const conversa = conversas.find(c => c.id === id);
    if (!conversa) return;

    renderConversas();

    document.getElementById('chat-active-avatar').src = conversa.avatar;
    document.getElementById('chat-active-name').innerText = `${conversa.nome} (Interesse em ${conversa.pet})`;

    const statusEl = document.getElementById('chat-active-status');
    if (conversa.status === 'Online') {
        statusEl.innerHTML = `<i class="fa-solid fa-circle" style="font-size: 8px; margin-right: 5px; color: #10b981;"></i> Online`;
        statusEl.style.color = '#10b981';
    } else {
        statusEl.innerHTML = `<i class="fa-solid fa-circle" style="font-size: 8px; margin-right: 5px; color: #94a3b8;"></i> Offline`;
        statusEl.style.color = '#94a3b8';
    }

    const viewport = document.getElementById('chat-viewport');
    viewport.innerHTML = '';

    conversa.mensagens.forEach(msg => {
        const bubble = document.createElement('div');
        const isSent = msg.remetente === 'lar';
        bubble.className = `chat-bubble ${isSent ? 'chat-bubble-sent' : 'chat-bubble-received'}`;

        bubble.innerHTML = `
            ${msg.texto}
            <span class="chat-message-time">${msg.tempo}</span>
        `;
        viewport.appendChild(bubble);
    });

    setTimeout(() => { viewport.scrollTop = viewport.scrollHeight; }, 50);

    // Controle de visualização responsiva de chat no celular
    const chatSidebar = document.querySelector('.chat-sidebar');
    const chatWindow = document.querySelector('.chat-window');
    if (window.innerWidth <= 768) {
        if (chatSidebar) chatSidebar.style.display = 'none';
        if (chatWindow) chatWindow.style.display = 'flex';
    }
}

function enviarMensagemChat(event) {
    event.preventDefault();

    const input = document.getElementById('chat-input-field');
    const texto = input.value.trim();
    if (!texto) return;

    const conversa = conversas.find(c => c.id === conversaAtivaId);
    if (!conversa) return;

    const now = new Date();
    const hora = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');

    conversa.mensagens.push({
        remetente: 'lar',
        texto: texto,
        tempo: hora
    });

    input.value = '';
    selectConversa(conversaAtivaId);

    setTimeout(() => {
        if (conversaAtivaId === conversa.id) {
            const respostasSimuladas = [
                "Perfeito! Vou ver certinho e aviso você para combinarmos a visita.",
                "Muito obrigado! O trabalho de vocês é lindo.",
                "Entendido! Vou me planejar e volto a falar com você.",
                "Maravilha, agradeço muito o retorno."
            ];
            const randomResposta = respostasSimuladas[Math.floor(Math.random() * respostasSimuladas.length)];

            conversa.mensagens.push({
                remetente: 'adotante',
                texto: randomResposta,
                tempo: new Date().getHours().toString().padStart(2, '0') + ':' + new Date().getMinutes().toString().padStart(2, '0')
            });

            selectConversa(conversa.id);
        }
    }, 2000);
}

function iniciarConversaAdocao(petNome, petImg) {
    // Achar o pet na lista global para saber quem é o dono/localização
    const petObj = pets.find(p => p.nome === petNome);
    let local = petObj ? petObj.localizacao : "Protetor Independente";

    // Determinar o nome do dono/responsável baseado na localização
    let nomeResponsavel = "Protetor Independente";
    let avatarNum = 1;

    if (local.includes("Ana")) {
        nomeResponsavel = "Ana Souza (Lar Temporário)";
        avatarNum = 1;
    } else if (local.includes("Municipal")) {
        nomeResponsavel = "Abrigo Municipal (Centro)";
        avatarNum = 22;
    } else if (local.includes("Vida Animal")) {
        nomeResponsavel = "Voluntário SOS (Vida Animal)";
        avatarNum = 35;
    } else {
        nomeResponsavel = "Protetor Independente";
        avatarNum = Math.floor(Math.random() * 50) + 1;
    }

    // Procurar se já existe chat iniciado com esse responsável sobre esse pet
    let conversaExistente = conversas.find(c => c.pet === petNome && c.nome === nomeResponsavel);

    if (!conversaExistente) {
        const novaConversa = {
            id: conversas.length + 1,
            nome: nomeResponsavel,
            pet: petNome,
            avatar: `https://i.pravatar.cc/100?img=${avatarNum}`,
            status: "Online",
            tipo: "mine", // [CORREÇÃO] conversa iniciada por mim => filtro "Demonstrei Interesse"
            mensagens: [] // Começa vazio para sugerir a mensagem
        };

        conversas.unshift(novaConversa);
        conversaAtivaId = novaConversa.id;
    } else {
        conversaAtivaId = conversaExistente.id;
    }

    // Navegar para o chat e selecionar a conversa
    switchPage('chat');
    selectConversa(conversaAtivaId);

    // Preencher o campo de texto do chat com a sugestão de mensagem
    const inputField = document.getElementById('chat-input-field');
    if (inputField) {
        inputField.value = `Olá! Estou muito interessado(a) em adotar o(a) ${petNome}. Ele(a) está disponível para visitas?`;
        inputField.focus();
    }

    mostrarToast(`Chat aberto. Edite ou envie a mensagem sugerida para ${nomeResponsavel}!`);
}

// Lógica da Página do Perfil
function atualizarVagasPreview() {
    const capInput = document.getElementById('perfil-input-capacidade');
    let totalCap = parseInt(capInput.value);
    if (isNaN(totalCap) || totalCap <= 0) totalCap = 1;

    let ativos = pets.filter(p => p.localizacao.includes(currentShelterName));
    let hospedadosCount = ativos.length;

    document.getElementById('perfil-hospedados-atual').innerText = hospedadosCount;
    document.getElementById('perfil-capacidade-lbl').innerText = totalCap;

    const pct = Math.min(((hospedadosCount / totalCap) * 100), 100);
    document.getElementById('perfil-capacidade-bar').style.width = pct + '%';

    const vagasRestantes = Math.max(0, totalCap - hospedadosCount);
    document.getElementById('perfil-vagas-restantes').innerText = vagasRestantes;
}

function salvarPerfilLar(event) {
    event.preventDefault();

    const novoNome = document.getElementById('perfil-input-nome').value.trim();
    const novoLocal = document.getElementById('perfil-input-local').value.trim();
    const novaCapacidade = parseInt(document.getElementById('perfil-input-capacidade').value);

    if (!novoNome || !novoLocal || isNaN(novaCapacidade) || novaCapacidade <= 0) {
        alert("Por favor, preencha todos os campos obrigatórios.");
        return;
    }

    const oldShelterName = currentShelterName;
    currentShelterName = novoNome;

    pets.forEach(p => {
        if (p.localizacao.includes(oldShelterName)) {
            p.localizacao = p.localizacao.replace(oldShelterName, novoNome);
        }
    });

    document.getElementById('sidebar-user-name').innerText = novoNome;
    document.getElementById('sidebar-user-location').innerText = novoLocal;
    document.getElementById('perfil-name-side').innerText = novoNome;

    atualizarVagasPreview();

    renderLarPets();
    renderPets();

    mostrarToast("Perfil atualizado com sucesso!");
}

// Renderização inicial geral
renderPets();
renderLarPets();
renderVaquinhas();
renderInsumosMural();
renderConversas();
selectConversa(conversaAtivaId);
atualizarVagasPreview();
renderAlertas();
