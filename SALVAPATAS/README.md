# 🐾 Salva Patas

> Plataforma web que conecta **adotantes, doadores, ONGs e protetores independentes** para facilitar adoções, doações e o apoio a animais em situação de vulnerabilidade.

🔗 **Site no ar:** https://gabiimarotti.github.io/salva-patas/

![status](https://img.shields.io/badge/status-em%20desenvolvimento-blueviolet)
![stack](https://img.shields.io/badge/stack-HTML%20%7C%20CSS%20%7C%20JS%20vanilla-orange)
![deploy](https://img.shields.io/badge/deploy-GitHub%20Pages-success)

---

## 📋 Sobre o projeto

O **Salva Patas** nasceu como projeto integrador das disciplinas de **Mentalidade Criativa e Empreendedora** e **Front-End**. A proposta é centralizar, em um único lugar, as ações que hoje ficam espalhadas em grupos de WhatsApp e posts soltos de redes sociais: encontrar um animal para adotar, reportar um animal de rua que precisa de resgate, apoiar uma vaquinha de tratamento e conversar com quem cuida do animal.

A aplicação foi construída como **SPA (Single Page Application)**: tudo roda em uma única página, e a navegação entre os módulos acontece via JavaScript, sem recarregar o navegador.

## 🎯 Público-alvo

Pessoas que querem **adotar** um animal, **doar** (dinheiro ou insumos), **ONGs e lares temporários** que precisam de gestão e visibilidade, e **protetores independentes** que resgatam animais de rua.

## ✨ Funcionalidades

- **Painel Inicial** — boas-vindas, dicas para lares temporários, casos de sucesso e mural de avisos da comunidade.
- **Painel do Lar** — dashboard de indicadores (hospedados, adotados, vaquinhas), abas de animais hospedados e histórico de adoções, criação de vaquinhas e gestão de insumos.
- **Mapa de Resgate** — mapa interativo (Leaflet) com alertas de animais avistados, classificados por categoria e status, com cálculo de distância e registro de novos alertas direto no mapa.
- **Cadastro de Animal** — formulário completo com upload de foto (pré-visualização) e geração automática de tags de saúde.
- **Vitrine de Adoção** — listagem de animais com filtros por espécie, porte e localização.
- **Apoio e Vaquinhas** — campanhas financeiras com barra de progresso e mural de doação de itens físicos.
- **Checkout de Doação** — seleção de valor, identificação do doador e pagamento simulado via Pix, Cartão ou Boleto, com tela de sucesso.
- **Mensagens** — chat entre adotantes e lares, com filtros, busca e resposta automática simulada.
- **Perfil do Lar** — edição de dados e controle de capacidade de vagas.

## 🛠️ Tecnologias

| Camada | Tecnologia |
|---|---|
| Marcação | HTML5 |
| Estilo | CSS3 puro (CSS Variables, Flexbox, Grid, media queries, `@keyframes`) |
| Lógica | JavaScript Vanilla (ES6), sem framework |
| Mapas | [Leaflet 1.9.4](https://leafletjs.com/) + OpenStreetMap |
| Ícones | Font Awesome 6.5.1 |
| Tipografia | Google Fonts (Inter) |
| Hospedagem | GitHub Pages |

> **Observação:** o projeto **não usa Bootstrap nem nenhum framework de UI**. Todo o design system (botões, cards, badges, grids) foi escrito do zero em CSS puro.

## 📁 Estrutura de pastas

```
salva-patas/
├── index.html              # Estrutura HTML de todas as telas
├── README.md               # Este arquivo
├── assets/
│   ├── css/
│   │   └── style.css       # Todo o CSS (extraído do <style>)
│   ├── js/
│   │   └── app.js          # Toda a lógica (extraída do <script>)
│   └── img/
│       └── logo.jpeg       # Logo da marca
└── docs/
    ├── documentacao.md     # Documento de requisitos / projeto
    └── img/                # Imagens dos diagramas (se houver)
```

## 🚀 Como rodar localmente

Por ser um projeto estático, basta abrir o `index.html`. Para evitar bloqueios do navegador (mapa, fontes), o ideal é subir um servidor local:

```bash
# Opção 1 — Python
python -m http.server 5500

# Opção 2 — VS Code
# Instale a extensão "Live Server" e clique em "Go Live"
```

Depois acesse `http://localhost:5500`.

## 📖 Documentação

A documentação completa (requisitos, decisões de layout, tecnologias e diagramas) está em
[`docs/documentacao.md`](docs/documentacao.md).

## 👥 Equipe

> _Preencher com os integrantes do grupo._

- Gabi Marotti
- Julia
- _(demais integrantes)_

---

_Projeto acadêmico — Mentalidade Criativa e Empreendedora & Front-End._
