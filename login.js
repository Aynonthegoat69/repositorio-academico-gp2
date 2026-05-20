<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Documentos - Repositório Acadêmico</title>
    <link rel="stylesheet" href="/estilos/principal.css">
    <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet">
    <style>
        .lista-container {
            margin-top: 80px;
            padding: 3rem 5%;
            min-height: calc(100vh - 80px);
        }

        .lista-header {
            margin-bottom: 3rem;
        }

        .breadcrumbs {
            color: var(--azul-medio);
            font-size: 0.9rem;
            margin-bottom: 0.5rem;
        }

        .lista-header h1 {
            font-family: 'Playfair Display', serif;
            font-size: 2.5rem;
            color: var(--azul-escuro);
            display: flex;
            align-items: center;
            gap: 1rem;
        }

        .area-icone-grande {
            font-size: 3rem;
        }

        .filtros {
            display: flex;
            gap: 1rem;
            margin-bottom: 2rem;
            flex-wrap: wrap;
        }

        .filtro-btn {
            padding: 0.6rem 1.2rem;
            border: 2px solid var(--azul-escuro);
            background: transparent;
            color: var(--azul-escuro);
            border-radius: 20px;
            cursor: pointer;
            font-size: 0.9rem;
            transition: all 0.3s ease;
        }

        .filtro-btn:hover,
        .filtro-btn.ativo {
            background: var(--azul-escuro);
            color: var(--bege);
        }

        .documentos-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
            gap: 2rem;
        }

        .documento-card {
            background: var(--branco);
            border-radius: 20px;
            padding: 2rem;
            transition: all 0.3s ease;
            border: 2px solid transparent;
            cursor: pointer;
        }

        .documento-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 15px 40px rgba(17, 46, 74, 0.15);
            border-color: var(--azul-medio);
        }

        .doc-tipo {
            display: inline-block;
            padding: 0.4rem 1rem;
            background: rgba(99, 134, 172, 0.15);
            color: var(--azul-escuro);
            border-radius: 20px;
            font-size: 0.8rem;
            font-weight: 600;
            margin-bottom: 1rem;
            text-transform: uppercase;
        }

        .documento-card h3 {
            font-family: 'Playfair Display', serif;
            color: var(--azul-escuro);
            margin-bottom: 1rem;
            font-size: 1.2rem;
        }

        .doc-autor {
            color: var(--azul-medio);
            font-size: 0.95rem;
            margin-bottom: 0.5rem;
        }

        .doc-info {
            display: flex;
            gap: 1.5rem;
            font-size: 0.85rem;
            color: rgba(17, 46, 74, 0.7);
            margin-bottom: 1.5rem;
        }

        .doc-resumo {
            font-size: 0.9rem;
            line-height: 1.6;
            opacity: 0.8;
            margin-bottom: 1.5rem;
        }

        .doc-acoes {
            display: flex;
            gap: 1rem;
        }

        .btn-doc {
            flex: 1;
            padding: 0.8rem;
            border-radius: 12px;
            border: none;
            cursor: pointer;
            font-size: 0.9rem;
            font-weight: 500;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
            transition: all 0.3s ease;
        }

        .btn-ver {
            background: var(--azul-escuro);
            color: var(--bege);
        }

        .btn-ver:hover {
            background: var(--azul-medio);
        }

        .btn-baixar {
            background: var(--bege);
            color: var(--azul-escuro);
            border: 2px solid var(--azul-escuro);
        }

        .btn-baixar:hover {
            background: var(--azul-escuro);
            color: var(--bege);
        }

        .paginacao {
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 1rem;
            margin-top: 3rem;
        }

        .pagina-btn {
            width: 45px;
            height: 45px;
            border-radius: 12px;
            border: 2px solid var(--azul-escuro);
            background: transparent;
            color: var(--azul-escuro);
            cursor: pointer;
            font-size: 1rem;
            transition: all 0.3s ease;
        }

        .pagina-btn:hover,
        .pagina-btn.ativo {
            background: var(--azul-escuro);
            color: var(--bege);
        }

        .sem-resultados {
            text-align: center;
            padding: 4rem;
            color: var(--azul-medio);
        }

        .sem-resultados span {
            font-size: 4rem;
            display: block;
            margin-bottom: 1rem;
        }

        @media (max-width: 768px) {
            .lista-header h1 {
                font-size: 1.8rem;
            }

            .documentos-grid {
                grid-template-columns: 1fr;
            }
        }
    </style>
</head>
<body>
    <!-- Navegação -->
    <nav>
        <a href="/" class="logo">
            <div class="logo-icone">📚</div>
            Repositório Acadêmico
        </a>
        
        <ul class="menu">
            <li><a href="inicio.html">Início</a></li>
            <li><a href="sobre.html">Sobre</a></li>
            <li><a href="contacto.html">Contacto</a></li>
        </ul>

        <div class="botoes-acesso">
            <a href="area-aluno.html" class="botao botao-aluno">Área do Aluno</a>
            <a href="area-admin.html" class="botao botao-admin">Administração</a>
        </div>
    </nav>

    <main class="lista-container">
        <div class="lista-header">
            <div class="breadcrumbs">
                <a href="/">Início</a> / <span id="areaNome">Área</span>
            </div>
            <h1>
                <span class="area-icone-grande" id="areaIcone">📚</span>
                <span id="areaTitulo">Carregando...</span>
            </h1>
        </div>

        <div class="filtros">
            <button class="filtro-btn ativo">Todos</button>
            <button class="filtro-btn">Mais Recentes</button>
            <button class="filtro-btn">Mais Baixados</button>
            <button class="filtro-btn">Artigos</button>
            <button class="filtro-btn">Teses</button>
        </div>

        <div class="documentos-grid" id="listaDocumentos">
            <!-- Documentos carregados via JS -->
        </div>

        <div class="paginacao">
            <button class="pagina-btn">←</button>
            <button class="pagina-btn ativo">1</button>
            <button class="pagina-btn">2</button>
            <button class="pagina-btn">3</button>
            <button class="pagina-btn">→</button>
        </div>
    </main>

    <script>
        const urlParts = window.location.pathname.split('/');
        const areaId = urlParts[urlParts.length - 1];

        const icones = {
            1: '💻', 2: '🧬', 3: '🏛️', 4: '📊', 5: '🎨', 6: '🌱'
        };

        const nomes = {
            1: 'Ciências Exatas',
            2: 'Ciências Biológicas',
            3: 'Ciências Humanas',
            4: 'Ciências Sociais',
            5: 'Artes e Design',
            6: 'Ciências Agrárias'
        };

        async function carregarArea() {
            document.getElementById('areaIcone').textContent = icones[areaId] || '📚';
            document.getElementById('areaTitulo').textContent = nomes[areaId] || 'Área';
            document.getElementById('areaNome').textContent = nomes[areaId] || 'Área';

            try {
                const resposta = await fetch('/api/documentos/area/' + areaId);
                const documentos = await resposta.json();
                renderizarDocumentos(documentos);
            } catch (erro) {
                // Dados de exemplo
                const docsExemplo = [
                    {
                        id: 1,
                        titulo: 'Inteligência Artificial na Educação: Um Estudo de Caso',
                        autor: 'Dr. Silva, Dra. Santos',
                        tipo: 'Artigo',
                        paginas: 25,
                        ano: 2026,
                        resumo: 'Estudo sobre a aplicação de IA em ambientes educacionais, analisando resultados de implementação em universidades.'
                    },
                    {
                        id: 2,
                        titulo: 'Machine Learning para Iniciantes',
                        autor: 'Prof. Oliveira',
                        tipo: 'Livro',
                        paginas: 180,
                        ano: 2025,
                        resumo: 'Guia completo introduzindo conceitos fundamentais de machine learning com exemplos práticos.'
                    },
                    {
                        id: 3,
                        titulo: 'Big Data e Análise de Dados Educacionais',
                        autor: 'Dra. Costa, Dr. Pereira',
                        tipo: 'Pesquisa',
                        paginas: 45,
                        ano: 2026,
                        resumo: 'Análise de grandes volumes de dados educacionais para identificar padrões de aprendizagem.'
                    },
                    {
                        id: 4,
                        titulo: 'Realidade Virtual no Ensino Superior',
                        autor: 'Dr. Ferreira',
                        tipo: 'Artigo',
                        paginas: 18,
                        ano: 2025,
                        resumo: 'Exploração do uso de RV em disciplinas práticas de engenharia e medicina.'
                    }
                ];
                renderizarDocumentos(docsExemplo);
            }
        }

        function renderizarDocumentos(documentos) {
            const container = document.getElementById('listaDocumentos');
            
            if (documentos.length === 0) {
                container.innerHTML = `
                    <div class="sem-resultados" style="grid-column: 1 / -1;">
                        <span>📭</span>
                        <h3>Nenhum documento encontrado</h3>
                        <p>Esta área ainda não possui documentos cadastrados.</p>
                    </div>
                `;
                return;
            }

            container.innerHTML = documentos.map(doc => `
                <div class="documento-card" onclick="verDocumento(${doc.id})">
                    <span class="doc-tipo">${doc.tipo || 'Artigo'}</span>
                    <h3>${doc.titulo}</h3>
                    <p class="doc-autor">👤 ${doc.autor}</p>
                    <div class="doc-info">
                        <span>📄 ${doc.paginas || '--'} páginas</span>
                        <span>📅 ${doc.ano || '2026'}</span>
                        <span>⬇️ ${Math.floor(Math.random() * 500)} downloads</span>
                    </div>
                    <p class="doc-resumo">${doc.resumo || 'Resumo não disponível.'}</p>
                    <div class="doc-acoes">
                        <button class="btn-doc btn-ver" onclick="event.stopPropagation(); verDocumento(${doc.id})">
                            👁️ Visualizar
                        </button>
                        <button class="btn-doc btn-baixar" onclick="event.stopPropagation(); baixar(${doc.id})">
                            ⬇️ Download
                        </button>
                    </div>
                </div>
            `).join('');
        }

        function verDocumento(id) {
            window.location.href = '/documento/' + id;
        }

        function baixar(id) {
            alert('Iniciando download do documento ' + id);
        }

        carregarArea();
    </script>
</body>
</html>
