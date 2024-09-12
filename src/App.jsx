import React, { useState, useRef, useCallback, useEffect } from 'react';
import Webcam from 'react-webcam';

function App() {
  const webcamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const [capturing, setCapturing] = useState(false);
  const [recordedChunks, setRecordedChunks] = useState([]);
  const [timer, setTimer] = useState(0);
  const [intervalId, setIntervalId] = useState(null);
  const [pausedTime, setPausedTime] = useState(0);
  const [selectedMimeType, setSelectedMimeType] = useState("video/webm; codecs=vp8");

  // Video constraints for responsiveness
  const videoConstraints = {
    width: window.innerWidth <= 768 ? 640 : 1280, // Smaller width on mobile
    height: window.innerWidth <= 768 ? 480 : 720,
    facingMode: "user"
  };

  const handleDataAvailable = useCallback(
    ({ data }) => {
      if (data.size > 0) {
        setRecordedChunks(prev => [...prev, data]);
      }
    },
    []
  );

  // Function to start the timer
  const startTimer = () => {
    setTimer(0);
    const id = setInterval(() => {
      setTimer(prevTime => prevTime + 1);
    }, 1000);
    setIntervalId(id);
  };

  // Function to stop the timer
  const stopTimer = () => {
    if (intervalId) {
      clearInterval(intervalId);
      setPausedTime(timer);
      setIntervalId(null);
    }
  };

  const handleStartCaptureClick = useCallback(() => {
    if (intervalId) {
      stopTimer();
    }
    setCapturing(true);
    setTimer(0);
    startTimer();
    mediaRecorderRef.current = new MediaRecorder(webcamRef.current.stream, {
      mimeType: selectedMimeType
    });
    mediaRecorderRef.current.addEventListener("dataavailable", handleDataAvailable);
    mediaRecorderRef.current.start();
  }, [intervalId, selectedMimeType]);

  const handleStopCaptureClick = useCallback(() => {
    mediaRecorderRef.current.stop();
    setCapturing(false);
    stopTimer();
  }, []);

  const handleDownload = useCallback(() => {
    if (recordedChunks.length > 0) {
      const blob = new Blob(recordedChunks, { type: selectedMimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = 'none';
      a.href = url;
      a.download = "react-webcam-stream-capture.webm";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      setRecordedChunks([]);
      // Refresh the page after download
      window.location.reload();
    }
  }, [recordedChunks, selectedMimeType]);

  useEffect(() => {
    return () => {
      stopTimer();
    };
  }, [stopTimer]);

  // Responsive styles
  const appStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '10px',
    margin: '0 auto',
    width: '100%',
    maxWidth: '1280px'
  };

  const webcamStyle = {
    width: '100%',
    maxWidth: '1280px',
    height: 'auto'
  };

  const controlStyle = {
    margin: '10px 0',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  };

  const timerStyle = {
    fontSize: '20px',
    margin: '10px 0'
  };

  const selectStyle = {
    padding: '10px',
    margin: '10px 0',
    fontSize: '16px'
  };

  const buttonStyle = {
    padding: '10px 20px',
    fontSize: '16px',
    margin: '10px',
    cursor: 'pointer'
  };

  return (
    <div style={appStyle}>
      <Webcam 
        audio={false} 
        ref={webcamRef} 
        videoConstraints={videoConstraints} 
        style={webcamStyle} 
      />
      <div style={controlStyle}>
        {/* Dropdown for MIME type selection */}
        <label>Select MIME Type: </label>
        <select
          value={selectedMimeType}
          onChange={(e) => setSelectedMimeType(e.target.value)}
          style={selectStyle}
        >
          <option value="video/webm; codecs=vp8">video/webm; codecs=vp8</option>
          <option value="video/webm; codecs=vp9">video/webm; codecs=vp9</option>
          <option value="video/webm; codecs=avc1">video/webm; codecs=avc1</option>
          <option value="video/mp4; codecs=avc1">video/mp4; codecs=avc1</option>
        </select>
      </div>
      {capturing ? (
        <button onClick={handleStopCaptureClick} style={buttonStyle}>Stop Capture</button>
      ) : (
        <button onClick={handleStartCaptureClick} style={buttonStyle}>Start Capture</button>
      )}
      {recordedChunks.length > 0 && (
        <button onClick={handleDownload} style={buttonStyle}>Download</button>
      )}
      {/* Display the timer */}
      <div style={timerStyle}>Time: {capturing ? timer : pausedTime} seconds</div>
    </div>
  );
}

export default App;
