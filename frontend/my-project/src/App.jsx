
import { Route,Routes } from "react-router-dom"
import Lobby from "./screens/Lobby"
import RoomPage from "./screens/RoomPage"


function App() {

return(
   <>
   <Routes>

     <Route path="/" element={<Lobby/>}/>
     <Route path="/room/:id" element={<RoomPage/>}/>
   </Routes>
   </>
   )
  
}

export default App
