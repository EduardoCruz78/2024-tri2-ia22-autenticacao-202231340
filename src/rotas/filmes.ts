import { Router, Request, Response } from 'express';
import path from 'path';
import { open } from 'sqlite';
import sqlite3 from 'sqlite3';

const filmesRoutes = Router();
const dbPromise = open({ filename: 'src/database.db', driver: sqlite3.Database });

// Middleware para verificar se o usuário está logado
const requireLogin = (req: Request, res: Response, next: any) => {
    if (req.session.userId) {
        next();
    } else {
        res.redirect('/login');
    }
};

// Rota para a página de inserção de filmes
filmesRoutes.get('/inserir-filmes', requireLogin, (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, '../views', 'inserir-filmes.html'));
});

// Rota para inserir um filme no banco de dados
filmesRoutes.post('/inserir-filmes', requireLogin, async (req: Request, res: Response) => {
    const { filme } = req.body;
    const userId = req.session.userId;
    try {
        const db = await dbPromise;
        await db.run('INSERT INTO filmes (nome, user_id) VALUES (?, ?)', [filme, userId]);
    } catch (error) {
        console.error(error);
        res.status(500).send('Erro ao inserir o filme');
    }
});

// Rota para exibir filmes
filmesRoutes.get('/mostrar-filmes', requireLogin, async (req: Request, res: Response) => {
    try {
        const db = await dbPromise;
        const filmes = await db.all(`
            SELECT filmes.id, filmes.nome AS filme, users.name AS usuario
            FROM filmes
            JOIN users ON filmes.user_id = users.id
        `);
        res.json(filmes);
    } catch (error) {
        console.error('Erro ao buscar filmes:', error);
        res.status(500).send('Erro ao buscar filmes');
    }
});

// Rota para excluir um filme
filmesRoutes.post('/delete-filme/:id', requireLogin, async (req: Request, res: Response) => {
    const filmeId = req.params.id;
    try {
        const db = await dbPromise;
        const filme = await db.get('SELECT user_id FROM filmes WHERE id = ?', [filmeId]);
        if (!filme) {
            return res.status(404).send('Filme não encontrado');
        }
        if (req.session.userId !== filme.user_id) {
            return res.status(403).send('Acesso negado');
        }
        await db.run('DELETE FROM filmes WHERE id = ?', [filmeId]);
        res.status(204).send();
    } catch (error) {
        console.error('Erro ao tentar excluir o filme:', error);
        res.status(500).send('Erro ao tentar excluir o filme');
    }
});

// Rota pública para exibir filmes sem login
filmesRoutes.get('/mostrar-filmes-publico', async (req: Request, res: Response) => {
    try {
        const db = await dbPromise;
        const filmes = await db.all(`
            SELECT filmes.nome AS filme, users.name AS usuario
            FROM filmes
            JOIN users ON filmes.user_id = users.id
        `);
        res.json(filmes);
    } catch (error) {
        console.error('Erro ao buscar filmes:', error);
        res.status(500).send('Erro ao buscar filmes');
    }
});

export default filmesRoutes;
