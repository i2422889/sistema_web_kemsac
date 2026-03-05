let index = 0;
const slides = document.querySelectorAll(".carousel-slide");
let interval = null;
const TIME = 4000; // 4 segundos

// Mostrar slide actual
function showSlide(i) {
  slides.forEach(slide => slide.classList.remove("active"));
  slides[i].classList.add("active");
}

// Cambiar slide con botones
function changeSlide(n) {
  if (slides.length <= 1) return;

  index = (index + n + slides.length) % slides.length;
  showSlide(index);
  restartAutoPlay();
}

// Auto play
function startAutoPlay() {
  if (slides.length <= 1) return;

  interval = setInterval(() => {
    index = (index + 1) % slides.length;
    showSlide(index);
  }, TIME);
}

// Reinicia el autoplay al tocar botones
function restartAutoPlay() {
  clearInterval(interval);
  startAutoPlay();
}

// Inicializar
document.addEventListener("DOMContentLoaded", () => {
  showSlide(index);
  startAutoPlay();
});