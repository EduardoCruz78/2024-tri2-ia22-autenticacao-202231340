import { Router, Request, Response } from 'express';
import path from 'path';
import { open } from 'sqlite';
import sqlite3 from 'sqlite3';

const authRoutes = Router();

// Atualize o caminho para o banco de dados, garantindo que esteja correto
const dbPromise = open({ filename: path.join(__dirname, '../database.db'), driver: sqlite3.Database });

// Middleware para verificar se o usuário está logado
const requireLogin = (req: Request, res: Response, next: any) => {
    if (req.session.userId) {
        next();
    } else {
        res.redirect('/login');
    }
};

// Rota para a página de login
authRoutes.get('/login', (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, '../views', 'login.html'));
});

// Rota para login
authRoutes.post('/login', async (req: Request, res: Response) => {
    const { name, password } = req.body;

    // Logando os dados para verificar se os valores estão sendo enviados corretamente
    console.log(`Attempting login with name: ${name} and password: ${password}`);

    try {
        const db = await dbPromise;
        const user = await db.get('SELECT * FROM users WHERE name = ? AND password = ?', [name, password]);

        if (user) {
            // Criação da sessão para o usuário
            req.session.userId = user.id;
            req.session.userName = user.name;

            // Logando sucesso
            console.log(`Login successful for user: ${user.name}`);

            res.redirect('/acesso-privado');
        } else {
            // Caso as credenciais sejam incorretas
            console.log('Invalid login credentials');
            res.status(401).send('Nome ou senha incorretos!');
        }
    } catch (error) {
        console.error('Error during login process:', error);  // Logando erro no servidor
        res.status(500).send('Erro ao tentar fazer login');
    }
});

// Rota para logout
authRoutes.post('/logout', (req: Request, res: Response) => {
    req.session.destroy(() => {
        res.redirect('/login');
    });
});

export default authRoutes;
