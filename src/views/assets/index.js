document.getElementById('register-form').addEventListener('submit', async function (event) {
    event.preventDefault();

    const formData = new FormData(this);
    const data = {
        name: formData.get('name'),
        email: formData.get('email'),
        password: formData.get('password')
    };

    try {
        const response = await fetch('/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        const modal = document.getElementById("popupModal");
        const modalMessage = document.getElementById("modalMessage");
        const closeModal = document.getElementsByClassName("close")[0];

        if (response.status === 201) {
            modalMessage.textContent = 'Usuário cadastrado com sucesso!';
            this.reset();
        } else {
            const errorText = await response.text();
            modalMessage.textContent = errorText;
        }

        // Exibir o popup
        modal.style.display = "block";

        // Fechar o popup ao clicar no "X"
        closeModal.onclick = function () {
            modal.style.display = "none";
        };

        // Fechar o popup ao clicar fora dele
        window.onclick = function (event) {
            if (event.target === modal) {
                modal.style.display = "none";
            }
        };

    } catch (error) {
        alert('Erro na requisição. Verifique sua conexão.');
    }
});
