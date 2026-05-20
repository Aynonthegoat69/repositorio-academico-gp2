// ============================================
// REPOSITÓRIO ACADÊMICO - Sistema Principal
// ============================================

const express = require('express');
const caminho = require('path');
const sistemaDeArquivos = require('fs');

const aplicativo = express();
const PORTA = 3000;

// Configurar pasta de arquivos estáticos
aplicativo.use(express.static('paginas'));
aplicativo.use('/estilos', express.static('estilos'));
aplicativo.use('/scripts', express.static('scripts'));
aplicativo.use('/dados', express.static('dados'));

// ============================================
// ROTAS DAS PÁGINAS
// ============================================

// Página inicial
aplicativo.get('/', (requisicao, resposta) => {
    resposta.sendFile(caminho.join(__dirname, 'paginas', 'inicio.html'));
});

// Página sobre
aplicativo.get('/sobre', (requisicao, resposta) => {
    resposta.sendFile(caminho.join(__dirname, 'paginas', 'sobre.html'));
});

// Página contacto
aplicativo.get('/contacto', (requisicao, resposta) => {
    resposta.sendFile(caminho.join(__dirname, 'paginas', 'contacto.html'));
});

// Área do aluno
aplicativo.get('/area-aluno', (requisicao, resposta) => {
    resposta.sendFile(caminho.join(__dirname, 'paginas', 'area-aluno.html'));
});

// Administração
aplicativo.get('/administracao', (requisicao, resposta) => {
    resposta.sendFile(caminho.join(__dirname, 'paginas', 'administracao.html'));
});

// Visualizar documento
aplicativo.get('/documento/:id', (requisicao, resposta) => {
    resposta.sendFile(caminho.join(__dirname, 'paginas', 'documento.html'));
});

// Lista de documentos por área
aplicativo.get('/area/:id', (requisicao, resposta) => {
    resposta.sendFile(caminho.join(__dirname, 'paginas', 'lista-documentos.html'));
});

// ============================================
// ROTAS DA API (DADOS)
// ============================================

// Buscar todas as áreas
aplicativo.get('/api/areas', (requisicao, resposta) => {
    const conteudo = sistemaDeArquivos.readFileSync(
        caminho.join(__dirname, 'dados', 'areas-de-conhecimento.json'), 
        'utf8'
    );
    resposta.json(JSON.parse(conteudo));
});

// Buscar área específica
aplicativo.get('/api/area/:id', (requisicao, resposta) => {
    const areas = JSON.parse(sistemaDeArquivos.readFileSync(
        caminho.join(__dirname, 'dados', 'areas-de-conhecimento.json'), 'utf8'
    ));
    const area = areas.find(a => a.id === parseInt(requisicao.params.id));
    if (area) {
        resposta.json(area);
    } else {
        resposta.status(404).json({ erro: 'Área não encontrada' });
    }
});

// Buscar todos os documentos
aplicativo.get('/api/documentos', (requisicao, resposta) => {
    const conteudo = sistemaDeArquivos.readFileSync(
        caminho.join(__dirname, 'dados', 'documentos.json'), 
        'utf8'
    );
    resposta.json(JSON.parse(conteudo));
});

// Buscar documento específico
aplicativo.get('/api/documento/:id', (requisicao, resposta) => {
    const documentos = JSON.parse(sistemaDeArquivos.readFileSync(
        caminho.join(__dirname, 'dados', 'documentos.json'), 'utf8'
    ));
    const doc = documentos.find(d => d.id === parseInt(requisicao.params.id));
    if (doc) {
        resposta.json(doc);
    } else {
        resposta.status(404).json({ erro: 'Documento não encontrado' });
    }
});

// Buscar documentos por área
aplicativo.get('/api/documentos/area/:areaId', (requisicao, resposta) => {
    const documentos = JSON.parse(sistemaDeArquivos.readFileSync(
        caminho.join(__dirname, 'dados', 'documentos.json'), 'utf8'
    ));
    const filtrados = documentos.filter(d => d.areaId === parseInt(requisicao.params.areaId));
    resposta.json(filtrados);
});

// Pesquisar documentos
aplicativo.get('/api/pesquisar', (requisicao, resposta) => {
    const termo = requisicao.query.q ? requisicao.query.q.toLowerCase() : '';
    const documentos = JSON.parse(sistemaDeArquivos.readFileSync(
        caminho.join(__dirname, 'dados', 'documentos.json'), 'utf8'
    ));
    
    const resultados = documentos.filter(doc => 
        doc.titulo.toLowerCase().includes(termo) ||
        doc.autor.toLowerCase().includes(termo) ||
        doc.area.toLowerCase().includes(termo)
    );
    
    resposta.json(resultados);
});

// Estatísticas do site
aplicativo.get('/api/estatisticas', (requisicao, resposta) => {
    const areas = JSON.parse(sistemaDeArquivos.readFileSync(
        caminho.join(__dirname, 'dados', 'areas-de-conhecimento.json'), 'utf8'
    ));
    const documentos = JSON.parse(sistemaDeArquivos.readFileSync(
        caminho.join(__dirname, 'dados', 'documentos.json'), 'utf8'
    ));
    
    resposta.json({
        totalDeArtigos: documentos.length * 100,
        totalDeAreas: areas.length,
        totalDeDownloads: 200,
        totalDeVisualizacoes: 12500
    });
});

// Login (simulação)
aplicativo.post('/api/login', express.json(), (requisicao, resposta) => {
    const { email, senha } = requisicao.body;
    
    // Simulação de autenticação
    if (email === 'aluno@teste.com' && senha === '123456') {
        resposta.json({ 
            sucesso: true, 
            usuario: { nome: 'Aluno Teste', tipo: 'aluno', email: email }
        });
    } else if (email === 'admin@teste.com' && senha === 'admin123') {
        resposta.json({ 
            sucesso: true, 
            usuario: { nome: 'Administrador', tipo: 'admin', email: email }
        });
    } else {
        resposta.status(401).json({ sucesso: false, mensagem: 'Credenciais inválidas' });
    }
});

// ============================================
// INICIAR SERVIDOR
// ============================================

aplicativo.listen(PORTA, '0.0.0.0', () => {
    console.log('========================================');
    console.log('📚 REPOSITÓRIO ACADÊMICO');
    console.log('========================================');
    console.log('Sistema iniciado com sucesso!');
    console.log('');
    console.log('Acesse no PC:');
    console.log('  → http://localhost:' + PORTA);
    console.log('');
    console.log('Acesse no celular:');
    console.log('  → http://192.168.1.130:' + PORTA);
    console.log('========================================');
});
