const whatsappBtn = document.querySelectorAll('.whatsapp-btn');

whatsappBtn.forEach(btn => {
    btn.addEventListener('click', () => {
        const phoneNumber = '11932153865'; // Substitua pelo número de telefone desejado

        const horaAtual = new Date().getHours();

        let saudacao;

        if (horaAtual < 12) {
            saudacao = 'Bom dia';
        } else if (horaAtual < 18) {
            saudacao = 'Boa tarde';
        } else {
            saudacao = 'Boa noite';
        }

        const mensagem = `Olá, ${saudacao}! Gostaria de saber mais sobre o link de indicação?`;

        const link = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(mensagem)}`;

        window.open(link, "_blank");
    });

});


gsap.registerPlugin(ScrollTrigger);

gsap.utils.toArray("section").forEach((section) => {

    const elementos = section.querySelectorAll(
        "img, .btn-style-two .btn-wrap"
    );

    gsap.from(elementos, {
        y: 80,
        opacity: 0,
        duration: 1,
        stagger: 0.15,
        ease: "power3.out",

        scrollTrigger: {
            trigger: section,
            start: "top 80%"
        }
    });

});