// Fazer a requisição para obter a lista de filmes
fetch('/mostrar-filmes-publico')
    .then(response => response.json())
    .then(data => {
        const tabela = document.getElementById('filmes-lista');
        data.forEach(filme => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${filme.filme}</td>
                <td>${filme.usuario}</td>
            `;
            tabela.appendChild(row);
        });
    })
    .catch(error => console.error('Erro ao carregar filmes:', error));
