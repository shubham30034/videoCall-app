import React from 'react';
import { useState } from 'react';
import { useSocket } from '../context/SocketProvider';
import { useCallback } from 'react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Lobby = () => {
   const[email,setEmail] = useState("")
   const[room,setRoom]= useState()
   const navigate = useNavigate()

   const socket = useSocket()


   const submit = useCallback((e)=>{

    socket.emit("room:join",{email,room})
        console.log(email,room);
    
   },[socket,email,room])

   const handeRoomJoin =(data)=>{
    console.log("data hamara",data);
    navigate(`/room/${data.room}`)
   }

  
   useEffect(()=>{
   socket.on("room:join",handeRoomJoin)

   return ()=>{
    socket.off("room:join",handeRoomJoin)
   }
   },[])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white shadow-md rounded-lg p-8 max-w-md w-full">
        <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">Welcome to the Lobby</h1>
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2">Email ID</label>
          <input
            type="email"
            value={email}
            onChange={(e)=> setEmail(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your email"
          />
        </div>
        <div className="mb-6">
          <label className="block text-gray-700 font-medium mb-2">Room Number</label>
          <input
            type="text"
            value={room}
            onChange={(e)=> setRoom(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter room number"
          />
        </div>
        <button
         onClick={(e)=> submit(e)}
        className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors duration-300">
          Join
        </button>
      </div>
    </div>
  );
};

export default Lobby;
