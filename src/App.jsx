import React, { useState, useRef, useCallback, useEffect } from 'react';
import Webcam from 'react-webcam';
import './App.css';

function App() {
  const webcamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const [capturing, setCapturing] = useState(false);
  const [recordedChunks, setRecordedChunks] = useState([]);
  const [timer, setTimer] = useState(0);
  const [intervalId, setIntervalId] = useState(null);
  const [pausedTime, setPausedTime] = useState(0);
  const [selectedMimeType, setSelectedMimeType] = useState("video/webm; codecs=vp8"); // State for selected MIME type

  // Video constraints
  const videoConstraints = {
    width: 1280,
    height: 720,
    facingMode: "user"
  };

  const handleDataAvailable = useCallback(
    ({ data }) => {
      if (data.size > 0) {
        setRecordedChunks((prev) => prev.concat(data));
      }
    },
    [setRecordedChunks]
  );

  // Function to start the timer
  const startTimer = () => {
    setTimer(0);
    const id = setInterval(() => {
      setTimer((prevTime) => prevTime + 1);
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
      mimeType: selectedMimeType // Use the selected MIME type
    });
    mediaRecorderRef.current.addEventListener("dataavailable", handleDataAvailable);
    mediaRecorderRef.current.start();
  }, [webcamRef, setCapturing, mediaRecorderRef, handleDataAvailable, intervalId, selectedMimeType]);

  const handleStopCaptureClick = useCallback(() => {
    mediaRecorderRef.current.stop();
    setCapturing(false);
    stopTimer();
  }, [mediaRecorderRef, setCapturing]);

  const handleDownload = useCallback(() => {
    if (recordedChunks.length > 0) {
      const blob = new Blob(recordedChunks, { type: selectedMimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      document.body.appendChild(a);
      a.style = "display: none";
      a.href = url;
      a.download = "react-webcam-stream-capture.webm";
      a.click();
      window.URL.revokeObjectURL(url);
      setRecordedChunks([]);
    }
  }, [recordedChunks, selectedMimeType]);

  useEffect(() => {
    return () => {
      stopTimer();
    };
  }, []);

  return (
    <div className="App">
      <Webcam 
        audio={false} 
        ref={webcamRef} 
        videoConstraints={videoConstraints} 
      />
      <div>
        {/* Dropdown for MIME type selection */}
        <label>Select MIME Type: </label>
        <select
          value={selectedMimeType}
          onChange={(e) => setSelectedMimeType(e.target.value)}
        >
         <option value="video/webm; codecs=vp8">video/webm; codecs=vp8</option>
          <option value="video/webm; codecs=vp9">video/webm; codecs=vp9</option>
          <option value="video/webm; codecs=avc1">video/webm; codecs=avc1</option>
          <option value="video/mp4; codecs=avc1">video/mp4; codecs=avc1</option>
          <option value="video/mp4; codecs=mp4v.20.8">video/mp4; codecs=mp4v.20.8</option>
          <option value="video/mp4; codecs=hev1">video/mp4; codecs=hev1</option>
        </select>
      </div>
      {capturing ? (
        <button onClick={handleStopCaptureClick}>Stop Capture</button>
      ) : (
        <button onClick={handleStartCaptureClick}>Start Capture</button>
      )}
      {recordedChunks.length > 0 && (
        <button onClick={handleDownload}>Download</button>
      )}
      {/* Display the timer */}
      <div>Time: {capturing ? timer : pausedTime} seconds</div>
    </div>
  );
}

export default App;
