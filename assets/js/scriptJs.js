const whatsappBtn = document.getElementById('whatsapp-btn');

whatsappBtn.addEventListener('click', () => {
    const phoneNumber = '55991999999'; // Substitua pelo número de telefone desejado

    const horaAtual = new Date().getHours();

    let saudacao;

    if (horaAtual < 12){
        saudacao = 'Bom dia';
    }else if (horaAtual < 18){
        saudacao = 'Boa tarde';
    }else{
        saudacao = 'Boa noite';
    }

    const mensagem = `Olá, ${saudacao}! Gostaria de saber mais sobre o link de indicação?`;
   
    const link = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(mensagem)}`;

    window.open(link, "_blank");
});