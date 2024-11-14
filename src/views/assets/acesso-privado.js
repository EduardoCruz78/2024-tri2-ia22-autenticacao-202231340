// Fazer a requisição para obter a lista de filmes
fetch('/mostrar-filmes')
    .then(response => response.json())
    .then(data => {
        const tabela = document.getElementById('filmes-lista');
        data.forEach(filme => {
            // Verifique se cada filme tem um id
            if (filme.id) {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${filme.filme}</td>
                    <td>${filme.usuario}</td>
                    <td>
                        <form action="/delete-filme/${filme.id}" method="POST" style="display:inline;" onsubmit="return handleDelete(event, ${filme.id})">
                            <button type="submit">Excluir</button>
                        </form>
                    </td>
                `;
                tabela.appendChild(row);
            } else {
                console.error('Filme sem ID:', filme);
            }
        });
    })
    .catch(error => console.error('Erro ao carregar filmes:', error));

// Função para deletar um filme
function handleDelete(event, filmeId) {
    event.preventDefault();
    fetch(`/delete-filme/${filmeId}`, {
        method: 'POST'
    })
    .then(response => {
        if (response.status === 403) {
            alert('Acesso negado!');
        } else if (response.ok) {
            location.reload(); // Recarregar a página se a exclusão for bem-sucedida
        } else {
            alert('Erro ao tentar excluir o filme.');
        }
    })
    .catch(error => {
        console.error('Erro ao tentar excluir filme:', error);
        alert('Erro ao tentar excluir o filme.');
    });
}
