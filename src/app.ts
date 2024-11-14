import express, { Request, Response, NextFunction } from 'express';
import bodyParser from 'body-parser';
import path from 'path';
import session from 'express-session';
import './types'; // Importa as definições de tipo
import authRoutes from './rotas/auth';
import filmesRoutes from './rotas/filmes';
import usersRoutes from './rotas/users';
import { createTable } from './database'; // Importa o script de criação das tabelas

const app = express();

// Middleware global
app.use(bodyParser.urlencoded({ extended: true }));

// Middleware específico para a rota de cadastro
app.use('/register', bodyParser.json());

// Configuração da sessão
app.use(session({
    secret: 'your-secret-key', // Altere para um segredo seguro
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Mude para true em produção com HTTPS
}));

// Servir arquivos estáticos da pasta 'views'
app.use(express.static(path.join(__dirname, 'views')));

// Uso das rotas importadas
app.use('/', authRoutes);
app.use('/', filmesRoutes);
app.use('/', usersRoutes);

// Middleware para verificar se o usuário está logado
const requireLogin = (req: Request, res: Response, next: NextFunction) => {
    if (req.session.userId) {
        next();
    } else {
        res.redirect('/login');
    }
};

// Rota para página de cadastro
app.get('/', (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// Rota para página de login
app.get('/login', (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, 'views', 'login.html'));
});

// Rota para página de atualização de usuário
app.get('/atualizar/:id', requireLogin, (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, 'views', 'atualizar.html'));
});

// Rota para a página de inserção de filmes
app.get('/inserir-filmes', requireLogin, (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, 'views', 'inserir-filmes.html'));
});

// Rota para a página movies
app.get('/movies', requireLogin, (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, 'views', 'movies.html'));
});

// Adicionando a rota para /acesso-privado
app.get('/acesso-privado', requireLogin, (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, 'views', 'acesso-privado.html'));
});

// Chama a função para criar as tabelas no banco de dados
createTable().then(() => {
    // Configuração da porta do servidor
    const port = 3000;
    app.listen(port, () => {
        console.log(`Servidor rodando na porta ${port}`);
    });
}).catch(error => {
    console.error('Erro ao inicializar as tabelas do banco de dados:', error);
});
