import {BrowserRouter as Router, Routes, Route} from "react-router-dom";
import {useState} from "react";
import LandingPage from "./pages/LandingPage";
import GameUI from "./pages/GameUI.jsx";

function App() {
    const [currentUser, setCurrentUser] = useState(null);

    return (
        <Router>
            <Routes>
                <Route path="/" element={
                    <LandingPage setCurrentUser={setCurrentUser} />
                } />

                <Route path="/Game/:username" element={<GameUI currentUser={currentUser}/>} />
            </Routes>
        </Router>
    )
}

export default App;

