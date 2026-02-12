const slides = document.querySelectorAll(".slides img");
const nextBtn = document.querySelector(".next");
const prevBtn = document.querySelector(".prev");

let index = 0;

function showSlide(i) {
    slides.forEach(slide => slide.classList.remove("active"));
    slides[i].classList.add("active");
}

nextBtn.addEventListener("click", () => {
    index = (index + 1) % slides.length;
    showSlide(index);
});

prevBtn.addEventListener("click", () => {
    index = (index - 1 + slides.length) % slides.length;
    showSlide(index);
});

/* Cambio automático cada 4 segundos */
setInterval(() => {
    index = (index + 1) % slides.length;
    showSlide(index);
}, 4000);
