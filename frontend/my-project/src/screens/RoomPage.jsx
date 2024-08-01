import React, { useCallback, useEffect, useState } from 'react';
import { useSocket } from '../context/SocketProvider';
import ReactPlayer from "react-player";
import peer from '../service/peerService';

const RoomPage = () => {
  const socket = useSocket();
  const [remoteSocketId, setRemoteSocketId] = useState();
  const [myStream, setMyStream] = useState();
  const [remoteStream, setRemoteStream] = useState();

  console.log("remoteStream", remoteStream);

  const handleUserJoined = useCallback(({ email, id }) => {
    console.log(`User joined: Email: ${email}, ID: ${id}`);
    setRemoteSocketId(id);
  }, [socket]);

  const handelCallUser = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true
    });

    const offer = await peer.getOffer();
    socket.emit("user:call", { to: remoteSocketId, offer });
    setMyStream(stream);
  }, [remoteSocketId, socket]);

  const handelIncomingCall = useCallback(async ({ from, offer }) => {
    setRemoteSocketId(from);
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true
    });
    setMyStream(stream);
    const ans = await peer.getAnswer(offer);
    socket.emit("call:accepted", { to: from, ans });
  }, [socket]);

  const sendStreams = useCallback(() => {
    for (const track of myStream.getTracks()) {
      console.log("track yha ha kya", track);
      peer.peer.addTrack(track, myStream);
    }
  }, [myStream]);

  const handelCallAccepted = useCallback(({ from, ans }) => {
    peer.setLocalDescription(ans);
    console.log("call accepted");
    sendStreams();
  }, [sendStreams]);

  const handelNegoNeeded = useCallback(async () => {
    const offer = await peer.getOffer();
    socket.emit('peer:nego:needed', { offer, to: remoteSocketId });
  }, [remoteSocketId, socket]);

  useEffect(() => {
    peer.peer.addEventListener('negotiationneeded', handelNegoNeeded);

    return () => {
      peer.peer.removeEventListener('negotiationneeded', handelNegoNeeded);
    };
  }, [handelNegoNeeded]);

  useEffect(() => {
    peer.peer.addEventListener("track", async (ev) => {
      const remoteStream = ev.streams;
      console.log("GOT TRACKS!!", remoteStream);
      setRemoteStream(remoteStream[0]);
    });
  }, []);

  const handelNegoNeededIncoming = useCallback(async ({ from, offer }) => {
    const ans = await peer.getAnswer(offer);
    socket.emit("peer:nego:done", { to: from, ans });
  }, [socket]);

  const handelNegoNeededFinal = useCallback(async ({ ans }) => {
    console.log("ye wala answwer");
    await peer.setLocalDescription(ans);
  }, []);

  useEffect(() => {
    socket.on('user:joined', handleUserJoined);
    socket.on("incoming:call", handelIncomingCall);
    socket.on("call:accepted", handelCallAccepted);
    socket.on("peer:nego:needed", handelNegoNeededIncoming);
    socket.on("peer:nego:final", handelNegoNeededFinal);

    return () => {
      socket.off('user:joined', handleUserJoined);
      socket.off("incoming:call", handelIncomingCall);
      socket.off("call:accepted", handelCallAccepted);
      socket.off("peer:nego:needed", handelNegoNeededIncoming);
      socket.off("peer:nego:final", handelNegoNeededFinal);
    };
  }, [socket, handleUserJoined, handelIncomingCall, handelCallAccepted, handelNegoNeededIncoming, handelNegoNeededFinal]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="text-center max-w-4xl w-full p-6 bg-white rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold mb-4">Room Page</h1>
        <div className="flex justify-center mb-4">
          <button onClick={sendStreams} className='m-2 p-2 bg-green-500 text-white rounded hover:bg-green-600 transition'>
            Open Your Video
          </button>
          {remoteSocketId && (
            <button onClick={handelCallUser} className='m-2 p-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition'>
              Call the User
            </button>
          )}
        </div>
        <p className="text-gray-700 mb-6">
          {remoteSocketId ? "User Connected" : "Waiting for users to join..."}
        </p>
        <div className="flex justify-center space-x-4">
          {remoteSocketId && (
            <ReactPlayer
              playing
              muted
              height={300}
              width={400}
              url={myStream}
              className="rounded-lg shadow-lg"
            />
          )}
          {remoteStream && (
            <ReactPlayer
              playing
              height={300}
              width={400}
              url={remoteStream}
              className="rounded-lg shadow-lg"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default RoomPage;
