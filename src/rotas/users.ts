import { Router, Request, Response } from 'express';
import path from 'path';
import { open } from 'sqlite';
import sqlite3 from 'sqlite3';

const usersRoutes = Router();
const dbPromise = open({ filename: 'src/database.db', driver: sqlite3.Database });

// Middleware para verificar se o usuário está logado
const requireLogin = (req: Request, res: Response, next: any) => {
    if (req.session.userId) {
        next();
    } else {
        res.redirect('/login');
    }
};

// Rota para registrar um novo usuário
usersRoutes.post('/register', async (req: Request, res: Response) => {
    const { name, email, password } = req.body;
    try {
        const db = await dbPromise;
        await db.run('INSERT INTO users (name, email, password) VALUES (?, ?, ?)', [name, email, password]);
        res.status(201).send('Usuário cadastrado com sucesso!');
    } catch (error) {
        console.error(error);
        res.status(500).send('Email já registrado, tente outro email');
    }
});

// Rota para a página de atualização de usuário
usersRoutes.get('/atualizar/:id', requireLogin, async (req: Request, res: Response) => {
    const userId = req.params.id;
    if (req.session.userId !== Number(userId)) {
        return res.status(403).send('Acesso negado');
    }
    try {
        const db = await dbPromise;
        const user = await db.get('SELECT * FROM users WHERE id = ?', [userId]);
        if (user) {
            res.sendFile(path.join(__dirname, '../views', 'atualizar.html'));
        } else {
            res.status(404).send('Usuário não encontrado');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Erro ao tentar carregar os dados');
    }
});

// Rota para atualizar um usuário
usersRoutes.post('/update', requireLogin, async (req: Request, res: Response) => {
    const { id, name, email, password } = req.body;
    if (req.session.userId !== Number(id)) {
        return res.status(403).send('Acesso negado');
    }
    try {
        const db = await dbPromise;
        await db.run('UPDATE users SET name = ?, email = ?, password = ? WHERE id = ?', [name, email, password, id]);
        res.redirect('/users.html');
    } catch (error) {
        console.error(error);
        res.status(500).send('Erro ao tentar atualizar os dados');
    }
});

// Rota para excluir um usuário
usersRoutes.post('/delete/:id', requireLogin, async (req: Request, res: Response) => {
    const userId = req.params.id;
    if (req.session.userId !== Number(userId)) {
        return res.status(403).send('Acesso negado');
    }
    try {
        const db = await dbPromise;
        await db.run('DELETE FROM users WHERE id = ?', [userId]);
        req.session.destroy(() => res.redirect('/login'));
    } catch (error) {
        console.error(error);
        res.status(500).send('Erro ao tentar excluir o usuário');
    }
});

// Rota para excluir todos os usuários
usersRoutes.post('/delete-all', requireLogin, async (req: Request, res: Response) => {
    try {
        const db = await dbPromise;
        await db.run('DELETE FROM users');
        req.session.destroy(() => res.redirect('/login'));
    } catch (error) {
        console.error(error);
        res.status(500).send('Erro ao tentar excluir todos os usuários');
    }
});

// Rota para API de usuários
usersRoutes.get('/api/users', requireLogin, async (req: Request, res: Response) => {
    try {
        const db = await dbPromise;
        const users = await db.all('SELECT name, email, id FROM users');
        res.json(users); // Envia a lista de usuários como JSON
    } catch (error) {
        console.error(error);
        res.status(500).send('Erro ao buscar usuários');
    }
});

export default usersRoutes;
