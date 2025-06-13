// src/components/LandingPage.jsx
import {useState} from "react";
import {useNavigate} from "react-router-dom";
import Swal from "sweetalert2";
import GameUI from "./GameUI.jsx";

import Background from "../assets/images/ui/preview.gif"

export default function LandingPage() {
    const [step, setStep] = useState("welcome");
    const [name, setName] = useState("");
    const [selectedChar, setSelectedChar] = useState(null);
    const [charIndex, setCharIndex] = useState(0);
    const navigate = useNavigate();
    // const [setCurrentUser] = useState(null);


    const characters = [
        {
            key: "boy",
            name: "Boy",
            desc: "A normal 17 years old school boy with a lot of interest",
            img: "assets/images/avatar/boy.png", // akses langsung via public/
        },
        {
            key: "girl",
            name: "Girl",
            desc: "A normal 17 years old school girl with a lot of interest",
            img: "assets/images/avatar/girl.png",
        },
    ];


    const validateName = () => {
        if (!name.trim()) {
            Swal.fire("Oops!", "Please enter your name!", "warning");
        } else {
            setStep("character");
        }
    };

    const changeCharacter = (dir) => {
        const newIndex = (charIndex + dir + characters.length) % characters.length;
        setCharIndex(newIndex);
        setSelectedChar(characters[newIndex].key);
    };

    const showRules = () => {
        if (!selectedChar) {
            Swal.fire("Oops!", "Please select a character!", "warning");
        } else {
            setStep("rules");
        }
    };

    const startGame = () => {
        // Redirect or start game logic here
        // setCurrentUser({username: name, avatar: selectedChar});
        navigate(`/Game/${name}`);


    };

    return (
        <div className="h-screen w-screen overflow-hidden text-white relative">
            {/* Background */}
            <img
                src={Background}
                alt=""
                className="absolute inset-0 w-full h-full object-cover brightness-50 -z-10"
            />

            <div className="flex items-center justify-center h-full">
                <div
                    className="bg-white/10 backdrop-blur-lg p-8 rounded-xl w-96 text-center border border-white/20 shadow-lg transition-all">
                    {step === "welcome" && (
                        <div>
                            <h1 className="text-3xl font-bold drop-shadow-lg">Welcome to the Game!</h1>
                            <p className="mt-2 text-gray-200">Are you ready for an epic adventure?</p>
                            <button
                                onClick={() => setStep("name")}
                                className="mt-4 bg-gradient-to-r from-green-400 to-green-600 hover:scale-105 transition-all text-white py-3 px-6 rounded-lg w-full shadow-md"
                            >
                                Start Game
                            </button>
                        </div>
                    )}

                    {step === "name" && (
                        <div>
                            <h2 className="text-2xl font-semibold">Enter Your Name</h2>
                            <input
                                type="text"
                                placeholder="Your Name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="mt-3 w-full p-3 rounded-lg bg-gray-800 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                            />
                            <button
                                onClick={validateName}
                                className="mt-4 bg-gradient-to-r from-green-400 to-green-600 hover:scale-105 transition-all text-white py-3 px-6 rounded-lg w-full shadow-md"
                            >
                                Next
                            </button>
                        </div>
                    )}

                    {step === "character" && (
                        <div>
                            <h2 className="text-2xl font-semibold mb-4">Choose Your Character</h2>

                            <div className="relative w-full overflow-hidden">
                                <div className="flex transition-transform duration-300 ease-in-out">
                                    <div className="w-full flex flex-col items-center">
                                        <img
                                            src={characters[charIndex].img}
                                            alt={characters[charIndex].name}
                                            className="w-64 h-64 object-contain mb-4"
                                        />
                                        <h3 className="text-xl font-semibold">{characters[charIndex].name}</h3>
                                        <p className="text-gray-300 text-center max-w-xs mt-2">{characters[charIndex].desc}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-center items-center mt-6 space-x-4">
                                <button onClick={() => changeCharacter(-1)}
                                        className="bg-gray-700 hover:bg-gray-600 p-2 rounded-full">
                                    &larr;
                                </button>
                                <button onClick={() => changeCharacter(1)}
                                        className="bg-gray-700 hover:bg-gray-600 p-2 rounded-full">
                                    &rarr;
                                </button>
                            </div>

                            <button
                                onClick={showRules}
                                disabled={!selectedChar}
                                className={`mt-4 bg-gradient-to-r from-green-400 to-green-600 text-white py-3 px-6 rounded-lg w-full shadow-md ${
                                    !selectedChar ? "opacity-50 cursor-not-allowed" : "hover:scale-105 transition-all"
                                }`}
                            >
                                Next
                            </button>
                        </div>
                    )}

                    {step === "rules" && (
                        <div>
                            <h2 className="text-2xl font-semibold">Game Rules</h2>
                            <ul className="mt-3 text-left text-gray-200 space-y-2 text-sm">
                                <li>1. Survive and win the game</li>
                                <li>2. Use your character's unique abilities</li>
                                <li>3. Collect items and defeat enemies</li>
                                <li>4. Have fun!</li>
                            </ul>
                            <button
                                onClick={startGame}
                                className="mt-4 bg-gradient-to-r from-green-400 to-green-600 hover:scale-105 transition-all text-white py-3 px-6 rounded-lg w-full shadow-md"
                            >
                                Let's Play!
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
