    let slideIndex = 0;

    function openModal(n) {
        slideIndex = n;
        document.getElementById("myModal").style.display = "block";
        showSlides(slideIndex);
    }

    function closeModal() {
        document.getElementById("myModal").style.display = "none";
        // Pause any playing videos when closing modal
        let videos = document.getElementsByTagName('video');
        for(let video of videos) {
            video.pause();
        }
    }

    function plusSlides(n) {
        showSlides(slideIndex += n);
    }

    function showSlides(n) {
        let slides = document.getElementsByClassName("mySlides");
        if (n >= slides.length) {slideIndex = 0}
        if (n < 0) {slideIndex = slides.length - 1}
        
        // Hide all slides
        for (let i = 0; i < slides.length; i++) {
            slides[i].style.display = "none";
            // Pause any playing videos
            let videos = slides[i].getElementsByTagName('video');
            for(let video of videos) {
                video.pause();
            }
        }
        
        // Show current slide
        slides[slideIndex].style.display = "block";
        
        // Auto-play video if current slide contains one
        let currentVideo = slides[slideIndex].getElementsByTagName('video')[0];
        if(currentVideo) {
            currentVideo.play();
        }
    }

    // Close modal when clicking outside
    window.onclick = function(event) {
        let modal = document.getElementById('myModal');
        if (event.target == modal) {
            closeModal();
        }
    }





    