(function(__run){ if (document.readyState !== 'loading') __run(); else document.addEventListener('DOMContentLoaded', __run); })(function() {
    const image = document.getElementById('imageContainer');
    const video = document.getElementById('introVideo');
    const videoContainer = document.getElementById('videoContainer');
    const playBtn = document.getElementById('pauseBtn');
    const pauseBtn = document.getElementById('pauseBtn');
    const playIcon = document.getElementById('playIcon');
    const pauseIcon = document.getElementById('pauseIcon');
    
    let videoLoaded = false;
    let isPlaying = false;

    // Show video and hide thumbnail
    function showVideo() {
        image.style.display = 'none';
        videoContainer.style.display = 'block';
    }

    // Show thumbnail and hide video
    function showThumbnail() {
        image.style.display = 'block';
        videoContainer.style.display = 'none';
    }

    // Update button icons
    function updateButtonIcon() {
        playIcon.style.display = isPlaying ? 'none' : 'block';
        pauseIcon.style.display = isPlaying ? 'block' : 'none';
    }

    // Play video
    function playVideo() {
        if (!videoLoaded) {
            videoLoaded = true;
            showVideo();
        }
        video.muted = false;
        video.play().then(() => {
            isPlaying = true;
            updateButtonIcon();
        }).catch(() => {
            video.muted = true;
            video.play().then(() => {
                isPlaying = true;
                updateButtonIcon();
            });
        });
    }

    // Pause video
    function pauseVideo() {
        video.pause();
        isPlaying = false;
        updateButtonIcon();
        showThumbnail();
    }

    // Toggle play/pause
    function togglePlayPause() {
        if (isPlaying) {
            pauseVideo();
        } else {
            playVideo();
        }
    }

    // Event listeners
    playBtn.addEventListener('click', togglePlayPause);
    pauseBtn.addEventListener('click', togglePlayPause);
    image.addEventListener('click', playVideo);
    video.addEventListener('click', togglePlayPause);

    video.addEventListener('play', () => {
        isPlaying = true;
        updateButtonIcon();
        showVideo();
    });

    video.addEventListener('pause', () => {
        isPlaying = false;
        updateButtonIcon();
        showThumbnail();
    });

    video.addEventListener('ended', pauseVideo);
});
