document.addEventListener('DOMContentLoaded', () => {
    const audioFileInput = document.getElementById('audio-file');
    const audioUrlInput = document.getElementById('audio-url');
    const loadUrlButton = document.getElementById('audio-load-url');
    const playButton = document.getElementById('audio-play');
    const pauseButton = document.getElementById('audio-pause');
    const stopButton = document.getElementById('audio-stop');
    const currentTrackLabel = document.getElementById('current-track');
    const statusLabel = document.getElementById('audio-status');
    const timeDisplay = document.getElementById('time-display');
    const audio = document.getElementById('audio-player');

    if (!audio) {
        console.error('Audio element not found.');
        return;
    }

    audio.preload = 'metadata';
    audio.volume = 0.9;

    let audioCtx = null;
    let analyser = null;
    let sourceNode = null;
    let dataArray = null;
    let animationFrameId = null;
    let objectUrl = null;
    let isVisualizing = false;

    function formatTime(seconds) {
        if (!seconds || Number.isNaN(seconds) || seconds === Infinity) {
            return '0:00';
        }
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    function updateTimeDisplay() {
        const duration = audio.duration;
        const currentTime = audio.currentTime;
        if (timeDisplay) {
            timeDisplay.textContent = `${formatTime(currentTime)} / ${formatTime(duration)}`;
        }
    }

    function setStatus(text, isError = false) {
        if (statusLabel) {
            statusLabel.textContent = text;
            statusLabel.style.color = isError ? '#ff6b6b' : '#ccc';
        }
    }

    function updateWave(amplitude = 0) {
        if (window.siriWave) {
            if (typeof siriWave.setAmplitude === 'function') {
                siriWave.setAmplitude(amplitude);
            } else if (typeof siriWave.set === 'function') {
                siriWave.set({ amplitude });
            }
        }
    }

    function createAudioContext() {
        if (audioCtx) return;

        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        analyser = audioCtx.createAnalyser();
        analyser.fftSize = 1024;
        analyser.smoothingTimeConstant = 0.85;
        dataArray = new Uint8Array(analyser.frequencyBinCount);

        sourceNode = audioCtx.createMediaElementSource(audio);
        sourceNode.connect(analyser);
        analyser.connect(audioCtx.destination);
    }

    function setAudioSource(source, labelText = 'Loaded audio') {
        if (objectUrl) {
            URL.revokeObjectURL(objectUrl);
            objectUrl = null;
        }

        if (source instanceof File) {
            objectUrl = URL.createObjectURL(source);
            audio.src = objectUrl;
            if (currentTrackLabel) {
                currentTrackLabel.textContent = `Loaded: ${source.name}`;
            }
        } else {
            audio.src = source;
            if (currentTrackLabel) {
                currentTrackLabel.textContent = `Loaded: ${labelText}`;
            }
        }

        audio.load();
        setStatus('Ready to play.');
    }

    function startVisualizer() {
        if (isVisualizing) return;
        isVisualizing = true;
        const step = () => {
            if (!isVisualizing) return;
            if (analyser) {
                analyser.getByteFrequencyData(dataArray);
                const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
                const normalized = Math.min(Math.max((average / 255) * 1.2, 0.01), 1);
                updateWave(normalized);
            }
            animationFrameId = requestAnimationFrame(step);
        };
        step();
    }

    function stopVisualizer() {
        isVisualizing = false;
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
        }
    }

    async function playAudio() {
        if (!audio.src) {
            setStatus('No audio loaded. Select a file or enter a URL.', true);
            return;
        }

        createAudioContext();
        if (audioCtx && audioCtx.state === 'suspended') {
            await audioCtx.resume();
        }

        try {
            await audio.play();
            startVisualizer();
            setStatus('Playing.');
        } catch (error) {
            console.warn('Audio playback failed:', error);
            const blocked = error && (error.name === 'NotAllowedError' || error.name === 'AbortError');
            setStatus(blocked ? 'Playback blocked by browser. Press Play again.' : 'Playback failed. Check file or URL.', true);
        }
    }

    function pauseAudio() {
        if (!audio.paused) {
            audio.pause();
        }
        updateWave(0);
        stopVisualizer();
        setStatus('Paused.');
    }

    function stopAudio() {
        audio.pause();
        audio.currentTime = 0;
        updateWave(0);
        stopVisualizer();
        updateTimeDisplay();
        setStatus('Stopped.');
    }

    function handleFileSelection(file, autoPlay = false) {
        if (!file) {
            setStatus('No file selected.', true);
            return;
        }
        const fileName = file.name || '';
        const isAudioFile = file.type.startsWith('audio/') || /\.(mp3|wav|ogg)$/i.test(fileName);
        if (!isAudioFile) {
            setStatus('Please select a valid audio file (MP3, WAV, OGG).', true);
            return;
        }
        setAudioSource(file);
        if (autoPlay) {
            playAudio();
        }
    }

    function handleRemoteUrl(url) {
        if (!url || !url.trim()) {
            setStatus('Enter a remote audio URL first.', true);
            return;
        }
        try {
            const trimmed = url.trim();
            setAudioSource(trimmed, trimmed);
            playAudio();
        } catch (error) {
            setStatus('Unable to load remote URL.', true);
            console.warn('Remote audio error:', error);
        }
    }

    audioFileInput?.addEventListener('change', (event) => {
        const file = event.target.files?.[0];
        handleFileSelection(file, false);
    });

    loadUrlButton?.addEventListener('click', () => {
        handleRemoteUrl(audioUrlInput?.value);
    });

    audioUrlInput?.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            handleRemoteUrl(audioUrlInput.value);
        }
    });

    playButton?.addEventListener('click', playAudio);
    pauseButton?.addEventListener('click', pauseAudio);
    stopButton?.addEventListener('click', stopAudio);

    audio.addEventListener('loadedmetadata', updateTimeDisplay);
    audio.addEventListener('timeupdate', updateTimeDisplay);
    audio.addEventListener('ended', () => {
        updateWave(0);
        stopVisualizer();
        setStatus('Ended.');
    });

    audio.addEventListener('pause', () => {
        if (!audio.ended) {
            updateWave(0);
            stopVisualizer();
            setStatus('Paused.');
        }
    });

    audio.addEventListener('play', () => {
        setStatus('Playing.');
    });

    audio.addEventListener('waiting', () => {
        setStatus('Buffering...');
    });

    audio.addEventListener('canplay', () => {
        setStatus('Ready to play.');
    });

    audio.addEventListener('error', () => {
        setStatus('Audio load error. Check file or URL.', true);
        console.warn('Audio error:', audio.error);
    });

    window.addEventListener('beforeunload', () => {
        if (objectUrl) {
            URL.revokeObjectURL(objectUrl);
        }
    });

    setStatus('Audio module ready. Select a file or enter a remote URL.');
});
