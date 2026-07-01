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

$('.carrossel-indica').slick({
    slidesToShow: 6,
    slidesToScroll: 1,

    autoplay: true,        // roda sozinho
    autoplaySpeed: 0,      // sem pausa entre os movimentos

    speed: 5000,           // tempo que leva para atravessar
    cssEase: 'linear',     // movimento contínuo

    infinite: true,        // loop infinito
    arrows: false,
    dots: false,

    pauseOnHover: false,
    pauseOnFocus: false,
    pauseOnDotsHover: false,
    responsive: [
        {
            breakpoint: 1024,
            settings: {
                slidesToShow: 3,
                slidesToScroll: 3,
                infinite: true,
                dots: true
            }
        },
        {
            breakpoint: 600,
            settings: {
                slidesToShow: 2,
                slidesToScroll: 2
            }
        },
        {
            breakpoint: 480,
            settings: {
                slidesToShow: 1,
                slidesToScroll: 1
            }
        }
        // You can unslick at a given breakpoint now by adding:
        // settings: "unslick"
        // instead of a settings object
    ]
});