import { useRef, useEffect, useState } from "react";
import io from "socket.io-client";

const socket = io("/webRTCPeers", {
  path: "/webrtc",
});

function App() {
  const localVideoRef = useRef();
  const remoteVideoRef = useRef();
  const pc = useRef(new RTCPeerConnection(null));
  const [status, setStatus] = useState("Make a call!");
  const [offerVisible, setOfferVisible] = useState(true);
  const [answerVisible, setAnswerVisible] = useState(false);
  useEffect(() => {
    socket.on("connection-success", (success) => {
      console.log(success);
    });

    socket.on("sdp", (data) => {
      console.log(data,'dadadada',offerVisible,answerVisible);
      pc.current.setRemoteDescription(new RTCSessionDescription(data.sdp));
      console.log(data.sdp,'sdsdsd')
     
      if (data.sdp.type === "offer") {
        setOfferVisible(false);
        setAnswerVisible(true);
        setStatus("Incoming Call!!!!");
      } else {
        setStatus("Call connected");
      }
    });

    socket.on("candidate", (candidate) => {
      pc.current.addIceCandidate(new RTCIceCandidate(candidate));
    });

    const constraints = {
      audio: false,
      video: true,
    };

    navigator.mediaDevices
      .getUserMedia(constraints)
      .then((stream) => {
        stream.getTracks().forEach((track) => {
          _pc.addTrack(track, stream);
        });
        localVideoRef.current.srcObject = stream;
      })
      .catch((err) => {
        console.log(err);
      });

    const _pc = new RTCPeerConnection(null);
    _pc.onicecandidate = (e) => {
      if (e.candidate) {
        console.log(JSON.stringify(e.candidate));
        sendToPeer("candidate", e.candidate);
      }
    };
    _pc.oniceconnectionstatechange = (e) => {
      console.log(e);
    };

    _pc.ontrack = (e) => {
      remoteVideoRef.current.srcObject = e.streams[0];
    };
    pc.current = _pc;
  }, []);

  const sendToPeer = (eventType, payload) => {
    socket.emit(eventType, payload);
  };
  const processSdp = (sdp) => {
    console.log(JSON.stringify(sdp));
    pc.current.setLocalDescription(sdp);
    sendToPeer("sdp", { sdp });
  };
  const createOffer = () => {
    pc.current
      .createOffer({
        offerToReceiveAudio: 1,
        offerToReceiveVideo: 1,
      })
      .then((sdp) => {
        processSdp(sdp);
        setOfferVisible(false);
        setStatus("Calling...");
      })
      .catch((e) => {
        console.log(e);
      });
  };
  const createAnswer = () => {
    pc.current
      .createAnswer({
        offerToReceiveAudio: 1,
        offerToReceiveVideo: 1,
      })
      .then((sdp) => {
        processSdp(sdp);
        setAnswerVisible(false);
        setStatus("Call connected");
      })
      .catch((e) => {
        console.log(e);
      });
  };

  const showHideButtons = () => {
    if (offerVisible) {
      return (
        <div>
          <button onClick={createOffer}>Call</button>
        </div>
      );
    } else if (answerVisible) {
      return (
        <div>
          <button onClick={createAnswer}>Answer!!!</button>
        </div>
      );
    }
  };
  // const setRemoteDescription = () => {
  //   const sdp = JSON.parse(textRef.current.value);
  //   console.log(sdp, "text sdp");
  //   pc.current.setRemoteDescription(new RTCSessionDescription(sdp));
  // };

  // const addCandidate = () => {
  //   candidates.current.forEach((candidate) => {
  //     console.log(candidate);
  //     pc.current.addIceCandidate(new RTCIceCandidate(candidate));
  //   });
  // };
  return (
    <div style={{ margin: 10 }}>
      <video
        style={{ width: 240, height: 240, margin: 5, backgroundColor: "black" }}
        ref={localVideoRef}
        autoPlay
      ></video>
      <video
        style={{ width: 240, height: 240, margin: 5, backgroundColor: "black" }}
        ref={remoteVideoRef}
        autoPlay
      ></video>
      <br />
      {/* <button onClick={() => createOffer()}>Create Offer</button>
      <button onClick={() => createAnswer()}>Create Answer</button>
      <br /> */}
      <div>{status}</div>
      {showHideButtons()}
    </div>
  );
}

export default App;
