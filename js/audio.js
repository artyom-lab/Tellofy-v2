document.addEventListener('DOMContentLoaded', function() {
  const wavesurfer = WaveSurfer.create({
    container: '#waveform',
    height: 25,
    waveColor: '#C4C9D9',
    progressColor: '#440FCF',
    cursorWidth: 2,
    cursorHeight: 8,
    cursorColor: '#1D253F',
    cursorRadius: 100,
    cursorOpacity: 1,
    barWidth: 2,
    barGap: 2,
    barRadius: 100,
    responsive: true,
    fillParent: true
  });

  let mediaRecorder;
  let chunks = [];
  let isRecording = false;
  let isPlaying = false;
  let recordingStartTime;
  let recordingDuration = 0;
  let recordingInterval;
  let positionSlider = document.getElementById('positionSlider');

  const playPauseBtn = document.getElementById('playPauseBtn');
  const recordBtn = document.getElementById('recordBtn');
  const recordTimeDisplay = document.getElementById('recordTimeDisplay');
  const playTimeDisplay = document.getElementById('playTimeDisplay');
  const waveformDiv = document.getElementById('waveform');
  const deleteBtn = document.querySelector('.btn-delete');

  // Format time as mm:ss
  function formatTime(time) {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  // Update record time display and position slider
  function updateRecordTimeDisplay() {
    const currentTimeFormatted = formatTime(recordingDuration);
    const totalTimeFormatted = '2:00'; 
    recordTimeDisplay.innerHTML = `<span>${currentTimeFormatted}</span><span class="limit">/${totalTimeFormatted}</span>`;
    
    // Calculate position slider value based on recording duration
    const sliderValue = (recordingDuration / 120) * 100; // 120 seconds = 100% of the slider range
    positionSlider.value = Math.round(sliderValue); // Ensure slider value does not exceed 100%

    // Add classes based on recording duration
    if (recordingDuration >= 100 && recordingDuration < 110) {
      document.querySelector('.audio-recording').classList.add('orange');
      document.querySelector('.textarea-box .message').classList.add('orange');
    } else if (recordingDuration >= 110) {
      document.querySelector('.audio-recording').classList.remove('orange');
      document.querySelector('.textarea-box .message').classList.remove('orange');
      document.querySelector('.audio-recording').classList.add('red');
      document.querySelector('.textarea-box .message').classList.add('red');
    }
  }

  // Update play time display
  function updatePlayTimeDisplay(currentTime) {
    playTimeDisplay.textContent = `${formatTime(currentTime)}/${formatTime(recordingDuration)}`;
  }

  // Update position slider
  function updatePositionSlider(currentTime) {
    const sliderValue = (currentTime / 120) * 100; // 120 seconds = 100% of the slider range
    positionSlider.value = Math.round(sliderValue); // Ensure slider value does not exceed 100%
  }

  // Reset position slider to start
  function resetPositionSlider() {
    positionSlider.value = 0;
  }

  // Start recording function
  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder = new MediaRecorder(stream);

      resetPositionSlider(); // Reset position slider to start

      // Hide waveform during recording
      waveformDiv.style.display = 'none';

      mediaRecorder.ondataavailable = function(e) {
        chunks.push(e.data);
      };

      mediaRecorder.onstart = function() {
        recordingStartTime = Date.now();
        recordingInterval = setInterval(function() {
          const currentTime = Math.floor((Date.now() - recordingStartTime) / 1000);
          if (currentTime <= 120) {
            recordingDuration = currentTime;
            updateRecordTimeDisplay();
            updatePositionSlider(currentTime);
          } else {
            stopRecording(); // Stop recording if 2 minutes are reached
          }
        }, 1000);
      };

      mediaRecorder.onstop = function() {
        clearInterval(recordingInterval);
        const blob = new Blob(chunks, { type: 'audio/wav' });
        const url = URL.createObjectURL(blob);
        wavesurfer.load(url);
        wavesurfer.on('ready', function() {
          recordingDuration = Math.min(Math.ceil(wavesurfer.getDuration()), 120);
          updatePlayTimeDisplay(0); // Start with currentTime 0 when audio is ready
          updatePositionSlider(0); // Set slider position to start when audio is ready
        });

        wavesurfer.on('finish', function() {
          isPlaying = false;
          playPauseBtn.innerHTML = '<img src="img/play-violet.svg" alt="">';
        });

        wavesurfer.on('audioprocess', function() {
          const currentTime = wavesurfer.getCurrentTime();
          updatePlayTimeDisplay(currentTime);
          updatePositionSlider(currentTime);
        });

        chunks = [];
        mediaRecorder = null;

        // Show waveform after recording is finished
        waveformDiv.style.display = 'block';
        // Show play button after recording is finished and make it clickable
        playPauseBtn.style.display = 'block';
        playPauseBtn.disabled = false; // Ensure button is enabled

        positionSlider.style.display = 'none';
        positionSlider.value = 0;

        // Reset classes after recording is finished
        document.querySelector('.audio-recording').classList.remove('orange', 'red');
        document.querySelector('.textarea-box .message').classList.remove('orange', 'red');
      };

      mediaRecorder.start();
      recordBtn.innerHTML = '<img src="img/stop-red.svg" alt="">';
      isRecording = true;

    } catch (err) {
      console.error('Error starting recording:', err);
    }
  }

  // Stop recording function
  function stopRecording() {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      recordBtn.innerHTML = '<img src="img/record.svg" alt="">';
      isRecording = false;
      recordingDuration = 0; // Reset recording duration
      updateRecordTimeDisplay(); // Update record time display

      // Hide waveform during recording
      waveformDiv.style.display = 'none';
    }

    // Stop playback if it's currently playing
    if (isPlaying) {
      wavesurfer.stop();
      playPauseBtn.innerHTML = '<img src="img/play-violet.svg" alt="">';
      isPlaying = false;
    }
  }

  // Toggle recording function
  function toggleRecording() {
    if (!isRecording) {
      startRecording();
    } else {
      stopRecording();
    }
  }

  // Toggle play or pause function
  function togglePlayPause() {
    if (!isPlaying) {
      wavesurfer.play();
      playPauseBtn.innerHTML = '<img src="img/pause-violet.svg" alt="">';
      isPlaying = true;

      // Show play button when playback starts
      playPauseBtn.style.display = 'block';
      playPauseBtn.disabled = false;

      // Show waveform when playback starts
      waveformDiv.style.display = 'block';
    } else {
      wavesurfer.pause();
      playPauseBtn.innerHTML = '<img src="img/play-violet.svg" alt="">';
      isPlaying = false;
    }
  }

  // Event listener for record/play button
  recordBtn.addEventListener('click', function() {
    if (!isRecording && !isPlaying) {
      // Start recording
      toggleRecording();
      playPauseBtn.style.display = 'none'; // Hide play button during recording
      playPauseBtn.disabled = true;
      playTimeDisplay.style.display = 'none';
      waveformDiv.style.display = 'none';
      recordTimeDisplay.style.display = 'inline-block';
      positionSlider.style.display = 'inline-block';
      positionSlider.value = 0;
    } else if (isRecording && !isPlaying) {
      // Pause recording
      stopRecording();
      playPauseBtn.style.display = 'block'; // Show play button after recording
      playPauseBtn.disabled = false;
      playTimeDisplay.style.display = 'inline-block';
      recordTimeDisplay.style.display = 'none';
      positionSlider.style.display = 'none';
    }
  });

  // Event listener for play/pause button
  playPauseBtn.addEventListener('click', function() {
    if (!isRecording && !isPlaying) {
      // Start playback
      togglePlayPause();
      playTimeDisplay.style.display = 'inline-block';
      recordTimeDisplay.style.display = 'none';
    } else if (!isRecording && isPlaying) {
      // Pause playback
      togglePlayPause();
      playTimeDisplay.style.display = 'inline-block';
      recordTimeDisplay.style.display = 'none';
    }
  });

  // Update time display during playback
  wavesurfer.on('audioprocess', function() {
    const currentTime = wavesurfer.getCurrentTime();
    updatePlayTimeDisplay(currentTime);
    updatePositionSlider(currentTime);
  });

  // Event listener for delete button
  deleteBtn.addEventListener('click', function() {
    stopRecording();
  });

});
