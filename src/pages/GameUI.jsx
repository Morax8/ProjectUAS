import React, {useState, useRef} from 'react';
import {useParams} from "react-router-dom";
import GifModal from "./GifModal.jsx";
import usePlayerStats from '../hooks/usePlayerStats';
import { activityMap } from '../data/activityMap.js';
import {allButtons} from "../data/allButtons.js";
import PhaserGame from '../components/PhaserGame';
import { activityEffects } from '../data/ActivityData.js';
import Swal from 'sweetalert2';

export default function GameUI({currentUser}) {
    // Handle stats update from PlayerStats component
    const handleStatsChange = (newStats, isGameOver = false) => {
        setGameState(prev => ({
            ...prev, ...newStats,
            isGameOver,
            gameOverReason: isGameOver ? 'Kesehatanmu sudah habis!' : '',
            daysSurvived: isGameOver ? newStats.day : prev.daysSurvived
        }));
    };
    // Initialize game state
    const [gameState, setGameState] = useState({
        day: 1,
        hour: 8,
        minute: 0,
        money: 500000,
        health: 100,
        energy: 100,
        hunger: 100,
        hygiene: 100,
        happiness: 100,
        knowledge: 0,
        isGameOver: false,
        gameOverReason: '',
        daysSurvived: 0,
        currentLocation: 'Rumah',

    });

    const [showEvent] = useState(false);
    const [eventData] = useState({
        title: 'Event Title', message: 'Event message details will appear here.'
    });
    const [activeAnimation] = useState(null);
    const [currentLocation, setCurrentLocation] = useState('rumah'); // default location

    const [gifSrc, setGifSrc] = useState(null);
    const [isModalVisible, setModalVisible] = useState(false);

    const {username} = useParams();

    const [player, updatePlayer] = usePlayerStats(handleStatsChange, gameState.isGameOver);

    const [currentMap, setCurrentMap] = useState({
        key: 'exterior',
        url: '/maps/Exterior.tmj'
    });
    const [showMapButtons, setShowMapButtons] = useState(false);

    const selectedCharacter = localStorage.getItem('selectedCharacter') || 'boy';

    const [playerPos, setPlayerPos] = useState({ x: 0, y: 0, mapKey: '' });

    // GIF path mapping
    const gifMap = {
        mobil: '/assets/images/transitions/mobil.gif',
        makan: '/assets/images/Animations/makan.gif',
        mainGame: '/assets/images/Animations/mainGame.gif',
        tidur: '/assets/images/Animations/tidur.gif',
        mandi: '/assets/images/Animations/mandi.gif',
        belajar: '/assets/images/Animations/belajar.gif',
        camping: '/assets/images/Animations/camping.gif',
        bermain: '/assets/images/Animations/bermain.gif',
        mancing: '/assets/images/Animations/mancing.gif',
        kerja: '/assets/images/Animations/kerja.gif',
        renang: '/assets/images/Animations/renang.gif',
    };

    const showGif = (gifName, duration = 3000, onFinish) => {
        setModalVisible(false); // Hide first, in case it's already open
        setGifSrc(null);        // Clear previous GIF
        setTimeout(() => {
            setGifSrc(gifMap[gifName] || '/assets/images/Animations/default.gif');
            setModalVisible(true);
            setTimeout(() => {
                setModalVisible(false);
                setGifSrc(null);
                if (onFinish) onFinish();
            }, duration);
        }, 50); // Small delay to force React to update
    };

    const changeMap = (key, url) => {
        setCurrentMap({ key, url });
    };

    const handleActivityClick = (activity) => {
        const effectObj = activityEffects[activity];
        if (effectObj && effectObj.effect) {
            Swal.fire({
                title: 'Konfirmasi',
                text: `Apakah kamu ingin "${activity}"?`,
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: 'Ya',
                cancelButtonText: 'Batal'
            }).then((result) => {
                if (result.isConfirmed) {
                    effectObj.effect(
                        player,
                        setCurrentLocation,
                        updatePlayer,
                        showGif,
                        changeMap
                    );
                }
            });
        }
    };

    // Format money display
    const formatMoney = (amount) => {
        return `Rp ${amount.toLocaleString('id-ID')}`;
    };



    // Handle restart game
    const handleRestartGame = () => {
        setGameState({
            day: 1,
            hour: 8,
            minute: 0,
            money: 500000,
            health: 100,
            energy: 100,
            hunger: 100,
            hygiene: 100,
            happiness: 100,
            knowledge: 0,
            isGameOver: false,
            gameOverReason: '',
            daysSurvived: 0,
            currentLocation: 'Rumah',
        });
    };

    // Format time display
    const formatTime = () => {
        return `${String(gameState.hour).padStart(2, '0')}:${String(gameState.minute).padStart(2, '0')}`;
    };

    const inZone = (
        currentMap.key === 'exterior' &&
        Math.abs(playerPos.x - 716) < 10 &&
        Math.abs(playerPos.y - 342) < 10
    );

    // Define areas for activities
    const activityAreas = {
        masuk: {
            map: 'exterior',
            x1: 700, y1: 330,
            x2: 740, y2: 370
        },
        pergiPantai: {
            map: 'exterior',
            x1: 0, y1: 362,
            x2: 40, y2: 382
        },
        pergiKampus: {
            map: 'exterior',
            x1: 0, y1: 362,
            x2: 40, y2: 382
        },
        pergiGunung: {
            map: 'exterior',
            x1: 0, y1: 362,
            x2: 40, y2: 382
        },
        pergiKantor: {
            map: 'exterior',
            x1: 0, y1: 362,
            x2: 40, y2: 382
        }
    };
    function isInArea(pos, area) {
        return (
            pos.mapKey === area.map &&
            pos.x >= area.x1 && pos.x <= area.x2 &&
            pos.y >= area.y1 && pos.y <= area.y2
        );
    }

    return (<div className="bg-gray-900 text-white min-h-screen">
            <div className="container mx-auto px-4 py-6 max-w-4xl">
                {/* Header section with player info */}
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center text-xl">
                            👨‍🎓
                        </div>
                        <div>
                            <h3 className="font-bold text-lg">{currentUser?.username || username || 'Player'}</h3>
                            <div className="text-sm text-gray-300">Mahasiswa Semester 1</div>
                        </div>
                    </div>

                    <div className="flex items-center space-x-4">
                        <div className="flex items-center">
                            <i className="fas fa-clock mr-2"></i>
                            <span>Hari {gameState.day}, {formatTime()}</span>
                        </div>
                        <div className="flex items-center">
                            <i className="fas fa-coins mr-2"></i>
                            <span>{formatMoney(gameState.money)}</span>
                        </div>
                    </div>
                </div>

                {/* Status bars */}
                <div className="bg-gray-800 rounded-lg p-4 mb-6">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-2">
                        {/* Health */}
                        <div>
                            <div className="flex justify-between text-xs mb-1">
                                <span>Health</span>
                                <span>{Math.max(0, gameState.health)}%</span>
                            </div>
                            <div className="w-full bg-gray-700 rounded-full h-2">
                                <div
                                    className="h-2 bg-red-500 rounded-full transition-all duration-300"
                                    style={{width: `${Math.max(0, gameState.health)}%`}}
                                ></div>
                            </div>
                        </div>

                        {/* Energy */}
                        <div>
                            <div className="flex justify-between text-xs mb-1">
                                <span>Energy</span>
                                <span>{Math.max(0, gameState.energy)}%</span>
                            </div>
                            <div className="w-full bg-gray-700 rounded-full h-2">
                                <div
                                    className="h-2 bg-blue-500 rounded-full transition-all duration-300"
                                    style={{width: `${Math.max(0, gameState.energy)}%`}}
                                ></div>
                            </div>
                        </div>

                        {/* Hunger */}
                        <div>
                            <div className="flex justify-between text-xs mb-1">
                                <span>Hunger</span>
                                <span>{Math.max(0, gameState.hunger)}%</span>
                            </div>
                            <div className="w-full bg-gray-700 rounded-full h-2">
                                <div
                                    className="h-2 bg-green-500 rounded-full transition-all duration-300"
                                    style={{width: `${Math.max(0, gameState.hunger)}%`}}
                                ></div>
                            </div>
                        </div>

                        {/* Hygiene */}
                        <div>
                            <div className="flex justify-between text-xs mb-1">
                                <span>Hygiene</span>
                                <span>{Math.max(0, Math.round(gameState.hygiene))}%</span>
                            </div>
                            <div className="w-full bg-gray-700 rounded-full h-2">
                                <div
                                    className="h-2 bg-cyan-500 rounded-full transition-all duration-300"
                                    style={{width: `${Math.max(0, gameState.hygiene)}%`}}
                                ></div>
                            </div>
                        </div>

                        {/* Happiness */}
                        <div>
                            <div className="flex justify-between text-xs mb-1">
                                <span>Happiness</span>
                                <span>{Math.max(0, Math.round(gameState.happiness))}%</span>
                            </div>
                            <div className="w-full bg-gray-700 rounded-full h-2">
                                <div
                                    className="h-2 bg-yellow-500 rounded-full transition-all duration-300"
                                    style={{width: `${Math.max(0, gameState.happiness)}%`}}
                                ></div>
                            </div>
                        </div>

                        {/* Knowledge */}
                        <div>
                            <div className="flex justify-between text-xs mb-1">
                                <span>Knowledge</span>
                                <span>{Math.round(gameState.knowledge)}%</span>
                            </div>
                            <div className="w-full bg-gray-700 rounded-full h-2">
                                <div
                                    className="h-2 bg-purple-500 rounded-full transition-all duration-300"
                                    style={{width: `${gameState.knowledge}%`}}
                                ></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Inventory Section */}
                <div className="flex justify-center items-start gap-6 mb-6">
                    {/* Inventory (left) */}
                    <div className="w-64">
                        <div className="bg-gray-800 rounded-lg p-4 mb-6">
                            <h2 className="font-bold mb-2">Inventory</h2>
                            <div>
                                {player.inventory && player.inventory.length > 0
                                    ? player.inventory.map((item, idx) => <div key={idx}>{item}</div>)
                                    : <div className="text-gray-400">Your inventory is empty</div>
                                }
                            </div>
                        </div>
                    </div>

                    {/* Phaser Map (center) */}
                    <div>
                        <PhaserGame
                            mapKey={currentMap.key}
                            mapUrl={currentMap.url}
                            character={selectedCharacter}
                            onPlayerMove={setPlayerPos}
                        />
                    </div>

                    {/* Activity Buttons (right) */}
                    <div className="flex flex-col gap-2">
                        {(activityMap[currentLocation] || []).map((activity) => {
                            const area = activityAreas[activity];
                            if (area && !isInArea(playerPos, area)) return null;
                            const buttonInfo = allButtons[activity] || { label: activity, color: 'bg-blue-600' };
                            return (
                                <button
                                    key={activity}
                                    id={`btn-${activity}`}
                                    data-activity={activity}
                                    onClick={() => handleActivityClick(activity)}
                                    className={`px-6 py-3 rounded-lg ${buttonInfo.color} text-white hover:opacity-90 transition-all duration-200 w-48 text-left`}
                                >
                                    {buttonInfo.label}
                                </button>
                            );
                        })}
                        {showMapButtons && (
                            <div className="flex flex-col gap-2 mt-4">
                                <button onClick={() => { setCurrentMap({ key: 'interior', url: '/maps/ImteriorHouse.tmj' }); setShowMapButtons(false); }}>Masuk Rumah</button>
                                {/* <button onClick={() => { setCurrentMap({ key: 'map2', url: '/maps/Map2.tmj' }); setShowMapButtons(false); }}>Map 2</button> */}
                            </div>
                        )}
                    </div>
                </div>

                {/* Animation overlays */}
                {activeAnimation && (<img
                        src={`../assets/images/Animations/${activeAnimation}.gif`}
                        className="fixed top-0 left-0 w-screen h-screen object-cover z-50"
                        alt="Animation"
                    />)}

                
            </div>

            {/* Event notification */}
            {showEvent && (<div
                    className="fixed top-4 right-4 bg-gray-800 border border-gray-600 rounded-lg p-4 shadow-lg z-40 max-w-sm">
                    <div className="font-bold mb-1">{eventData.title}</div>
                    <div className="text-sm text-gray-300">{eventData.message}</div>
                </div>)}

            {/* Game over modal */}
            {gameState.isGameOver && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-gray-800 p-8 rounded-lg max-w-md w-full text-center">
                        <h1 className="text-3xl font-bold mb-2">Game Over!</h1>
                        <p className="mb-4">{gameState.gameOverReason}</p>
                        <div className="mb-6">
                            <p>Kamu bertahan selama: <span className="font-bold">{gameState.daysSurvived}</span> hari
                            </p>
                            <p className="mt-2">Pengetahuan yang didapat: <span
                                className="font-bold">{Math.round(gameState.knowledge)}%</span></p>
                        </div>
                        <button
                            onClick={handleRestartGame}
                            className="bg-gradient-to-r from-red-500 to-red-700 py-3 px-6 rounded-lg w-full shadow-md hover:scale-105 transition-all"
                        >
                            Main Lagi
                        </button>
                    </div>
                </div>)}
            {isModalVisible && <GifModal gifSrc={gifSrc}/>}
        </div>);
}