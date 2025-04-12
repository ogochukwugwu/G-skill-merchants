const sliderStates = {
  1: { index: 0 }, // Removed interval reference
  2: { index: 0 },  // Removed interval reference
  3: { index: 0 }
};

function initializeDots(sliderNumber) {
  const dotsContainer = document.getElementById(`dotsContainer${sliderNumber}`);
  const slides = document.querySelectorAll(`.slider-container:nth-of-type(${sliderNumber}) .slide`);
  
  slides.forEach((_, index) => {
      const dot = document.createElement('div');
      dot.classList.add('dot');
      if (index === 0) dot.classList.add('active-dot');
      dot.addEventListener('click', () => currentSlide(sliderNumber, index));
      dotsContainer.appendChild(dot);
  });
}

function showSlide(sliderNumber, index) {
  const slidesContainer = document.querySelector(`.slider-container:nth-of-type(${sliderNumber}) .slides`);
  const dots = document.querySelectorAll(`#dotsContainer${sliderNumber} .dot`);
  const totalSlides = document.querySelectorAll(`.slider-container:nth-of-type(${sliderNumber}) .slide`).length;
  const state = sliderStates[sliderNumber];

  if (index >= totalSlides) state.index = 0;
  else if (index < 0) state.index = totalSlides - 1;
  else state.index = index;
  
  slidesContainer.style.transform = `translateX(-${state.index * 100}%)`;
  
  dots.forEach((dot, i) => {
      dot.classList.toggle('active-dot', i === state.index);
  });
}

function nextSlide(sliderNumber) {
  const state = sliderStates[sliderNumber];
  state.index++;
  showSlide(sliderNumber, state.index);
}

function prevSlide(sliderNumber) {
  const state = sliderStates[sliderNumber];
  state.index--;
  showSlide(sliderNumber, state.index);
}

function currentSlide(sliderNumber, index) {
  sliderStates[sliderNumber].index = index;
  showSlide(sliderNumber, index);
}

// Initialize sliders without any auto-play
initializeDots(1);
initializeDots(2);
initializeDots(3);

