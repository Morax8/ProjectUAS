import { useEffect, useRef, useState } from 'react';
import { doActivity } from '../utils/Activity.js';
import { playGifAnimation } from './Animation.js';
import { loadMapAndTilesets } from '../utils/mapLoader.js';

export default function CanvasGame({ playerStats, onStatsUpdate, canvasRef }) {
    const transitionGifRef = useRef(null);
    const characterImageRef = useRef(new Image());
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [mapData, setMapData] = useState(null);
    const [tilesets, setTilesets] = useState([]);
    const [playerPos, setPlayerPos] = useState({ x: 300, y: 270 });
    const [facingLeft, setFacingLeft] = useState(false);
    const [cameraOffset, setCameraOffset] = useState({ x: 0, y: 0 });

    // Load character and map once
    useEffect(() => {
        console.log('CanvasGame: Initializing...');
        characterImageRef.current.src = `/assets/images/avatar/${localStorage.getItem('selectedCharacter') || 'boy'}.png`;

        const loadAssets = async () => {
            try {
                setLoading(true);
                setError(null);
                console.log('CanvasGame: Starting to load map...');
                const { mapData, tilesets } = await loadMapAndTilesets('/maps/Exterior.tmj');
                console.log('CanvasGame: Map loading result:', { mapData, tilesets });
                
                if (!mapData) {
                    throw new Error('Failed to load map data');
                }
                
                if (!tilesets || tilesets.length === 0) {
                    throw new Error('No tilesets loaded');
                }

                setMapData(mapData);
                setTilesets(tilesets);
                console.log('CanvasGame: Map and tilesets set successfully');
            } catch (err) {
                console.error('CanvasGame: Error loading map:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        loadAssets();
    }, []);

    // Re-render when map or stats change
    useEffect(() => {
        console.log('CanvasGame: Map data changed:', { mapData, tilesets });
    
        if (!mapData || tilesets.length === 0) return;
    
        const areAllImagesValid = tilesets.every(ts => ts.image.complete && ts.image.naturalWidth !== 0);
        
        if (!areAllImagesValid) {
            console.warn("CanvasGame: Waiting for all tileset images to fully load...");
            return; // Jangan render dulu
        }
    
        console.log('CanvasGame: All tileset images valid, starting render loop');
        renderGame();
        const interval = setInterval(() => renderGame(), 1000 / 60);
        return () => {
            console.log('CanvasGame: Cleaning up render loop');
            clearInterval(interval);
        };
    }, [mapData, tilesets, playerStats, cameraOffset]);
    
    const renderGame = () => {
        const canvas = canvasRef.current;
        if (!canvas) {
            console.error('CanvasGame: Canvas ref is null');
            return;
        }
        if (!mapData) {
            console.error('CanvasGame: Map data is null');
            return;
        }
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            console.error('CanvasGame: Could not get canvas context');
            return;
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw map tiles
        for (const layer of mapData.layers) {
            if (layer.type !== 'tilelayer') continue;
            
            
            // Handle infinite maps
            const chunks = layer.chunks || [{ data: layer.data, x: 0, y: 0, width: layer.width, height: layer.height }];
            
            for (const chunk of chunks) {
                for (let i = 0; i < chunk.data.length; i++) {
                    const gid = chunk.data[i];
                    if (gid === 0) continue;

                    const tileset = [...tilesets].reverse().find(ts => gid >= ts.firstgid);
                    if (!tileset) continue;

                    const localId = gid - tileset.firstgid;
                    const sx = (localId % tileset.columns) * tileset.tilewidth;
                    const sy = Math.floor(localId / tileset.columns) * tileset.tileheight;
                    
                    // Calculate position with camera offset
                    const dx = (i % chunk.width) * tileset.tilewidth + chunk.x * tileset.tilewidth - cameraOffset.x;
                    const dy = Math.floor(i / chunk.width) * tileset.tileheight + chunk.y * tileset.tileheight - cameraOffset.y;

                    // Only draw if visible
                    if (dx + tileset.tilewidth > 0 && dx < canvas.width &&
                        dy + tileset.tileheight > 0 && dy < canvas.height) {
                        // Skip drawing if image is not loaded or is broken
                        if (!tileset.image.complete || tileset.image.naturalWidth === 0) {
                            console.warn('Skipping broken or not-yet-loaded image:', tileset.image.src);
                            continue;
                        }
                        ctx.drawImage(
                            tileset.image,
                            sx, sy, tileset.tilewidth, tileset.tileheight,
                            dx, dy, tileset.tilewidth, tileset.tileheight
                        );
                    }
                }
            }
        }

        // Draw character
        const { x, y } = playerPos;
        const w = 48;
        const h = 48;
        const char = characterImageRef.current;

        if (!char.complete || char.naturalWidth === 0) {
            console.warn('Skipping character draw: image not loaded or broken', char.src);
        } else {
            if (facingLeft) {
                ctx.save();
                ctx.translate(x + w - cameraOffset.x, y - cameraOffset.y);
                ctx.scale(-1, 1);
                ctx.drawImage(char, 0, 0, char.width, char.height, 0, 0, w, h);
                ctx.restore();
            } else {
                ctx.drawImage(char, x - cameraOffset.x, y - cameraOffset.y, w, h);
            }
        }
    };

    const handleKeyDown = e => {
        // Prevent default browser behavior for arrow keys
        if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
            e.preventDefault();
        }
        const move = 10;
        setPlayerPos(prev => {
            let { x, y } = prev;
            switch (e.key) {
                case 'ArrowUp':
                    y = Math.max(0, y - move);
                    break;
                case 'ArrowDown':
                    y = Math.min(canvasRef.current.height - 48, y + move);
                    break;
                case 'ArrowLeft':
                    x = Math.max(0, x - move);
                    setFacingLeft(true);
                    break;
                case 'ArrowRight':
                    x = Math.min(canvasRef.current.width - 48, x + move);
                    setFacingLeft(false);
                    break;
                default:
                    return prev;
            }
            // Update camera to follow player
            setCameraOffset({
                x: Math.max(0, x - canvasRef.current.width / 2),
                y: Math.max(0, y - canvasRef.current.height / 2)
            });
            return { x, y };
        });
    };

    const handleActivity = type => {
        if (playerStats && onStatsUpdate) {
            doActivity(type, playerStats, onStatsUpdate);
        }
    };

    const handlePlayGif = () => {
        playGifAnimation(transitionGifRef, 2000, () => {
            console.log('Transisi selesai');
        });
    };

    if (loading) {
        return <div className="loading">Loading map...</div>;
    }

    if (error) {
        return <div className="error">Error loading map: {error}</div>;
    }

    return null;
}