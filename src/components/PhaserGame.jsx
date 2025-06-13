import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser';

function PhaserGame({ mapKey = 'map', mapUrl = '/maps/Exterior.tmj', character = 'boy', onPlayerMove }) {
  const phaserRef = useRef(null);

  useEffect(() => {
    let game;

    class MyScene extends Phaser.Scene {
      preload() {
        this.load.tilemapTiledJSON(mapKey, mapUrl);
        // luar rumah
        this.load.image('ground_grass_details', '/assets/images/tilesets/ground_grass_details.png');
        this.load.image('exterior', '/assets/images/tilesets/exterior.png');
        this.load.image('house_details', '/assets/images/tilesets/house_details.png');
        this.load.image('Smoke_animation', '/assets/images/tilesets/Smoke_animation.png');
        this.load.image('Doors_windows_animation', '/assets/images/tilesets/Doors_windows_animation.png');
        this.load.image('Trees_animation', '/assets/images/tilesets/Trees_animation.png');
        this.load.image('bird_fly_animation', '/assets/images/tilesets/bird_fly_animation.png');
        this.load.image('bird_jump_animation', '/assets/images/tilesets/bird_jump_animation.png');
        this.load.image('cat_animation', '/assets/images/tilesets/cat_animation.png');
        this.load.image('16x16', '/assets/images/tilesets/16x16.png');
        // rumah
        this.load.image('Interior', '/assets/images/tilesets/Interior.png');
        this.load.image('walls_floor', '/assets/images/tilesets/walls_floor.png');
        // pantai
        this.load.image('ex_beach', '/assets/images/tilesets/ex_beach.png');
        //campus
        this.load.image('CP_V1.0.4', '/assets/images/tilesets/CP_V1.0.4.png');
        this.load.image('LbGGGS', '/assets/images/tilesets/LbGGGS.png');
        // character
        this.load.image('character', `/assets/images/avatar/${character}.png`);
        //music
        this.load.audio('bgMusic', '/assets/audios/bgmusic.mp3');
      }
      create() {
        if (!this.sound.get('bgMusic')?.isPlaying) {
            this.bgMusic = this.sound.add('bgMusic', {
              loop: true,
              volume: 0.05,
            });
            this.bgMusic.play();
          }
          
        const map = this.make.tilemap({ key: mapKey });
        // Add all tilesets
        const tilesets = map.tilesets.map(ts =>
          map.addTilesetImage(ts.name, ts.name)
        );
        // Create all layers with all tilesets
        if (Array.isArray(map.layers)) {
          map.layers.forEach(layerData => {
            map.createLayer(layerData.name, tilesets, 0, 0);
          });
        } else {
          console.error('Map layers is not an array:', map.layers);
        }
        // Add player sprite

        let spawnX = 220;
        let spawnY = 340;
        if (mapKey === 'interior') {
            spawnX = 538;
            spawnY = 318;
        } else if (mapKey === 'Beach') {
            spawnX = 400;
            spawnY = 300;
        }
        this.player = this.add.sprite(spawnX, spawnY, 'character');
        this.player.setDisplaySize(60, 60);
        this.player.setFlipX(false);
        this.cursors = this.input.keyboard.createCursorKeys();
        this.facingLeft = false;
      }
      update() {
        if (!this.player || !this.cursors) return;
        const prevX = this.player.x;
        const prevY = this.player.y;
        let moved = false;
        if (this.cursors.left.isDown) {
          this.player.x -= 2;
          this.player.setFlipX(true);
          this.facingLeft = true;
          moved = true;
        } else if (this.cursors.right.isDown) {
          this.player.x += 2;
          this.player.setFlipX(false);
          this.facingLeft = false;
          moved = true;
        }
        if (this.cursors.up.isDown) {
          this.player.y -= 2;
          moved = true;
        } else if (this.cursors.down.isDown) {
          this.player.y += 2;
          moved = true;
        }

        // Set boundaries based on map
        if (mapKey === 'interior') {
          // Interior map boundaries
          this.player.x = Phaser.Math.Clamp(this.player.x, 334, 566);
          this.player.y = Phaser.Math.Clamp(this.player.y, 202, 324);
        } else if (mapKey === 'Beach') {
          // Beach map boundaries
          this.player.x = Phaser.Math.Clamp(this.player.x, 0, 800);
          this.player.y = Phaser.Math.Clamp(this.player.y, 0, 500);
        } else {
          // Default boundaries for other maps
          this.player.x = Phaser.Math.Clamp(this.player.x, 0, this.sys.game.config.width);
          this.player.y = Phaser.Math.Clamp(this.player.y, 0, this.sys.game.config.height);
        }

        if (moved && (this.player.x !== prevX || this.player.y !== prevY)) {
          console.log(`Player position: (${this.player.x.toFixed(0)}, ${this.player.y.toFixed(0)})`);
          if (onPlayerMove) {
            // Check if player is at specific coordinates for the "pergi" button based on current map
            let isAtPergiLocation = false;
            if (mapKey === 'interior') {
              isAtPergiLocation = Math.abs(this.player.x - 22) < 10 && Math.abs(this.player.y - 376) < 10;
            } else if (mapKey === 'Beach') {
              isAtPergiLocation = Math.abs(this.player.x - 400) < 10 && Math.abs(this.player.y - 300) < 10;
            }
            
            onPlayerMove({ 
              x: this.player.x, 
              y: this.player.y, 
              mapKey,
              isAtPergiLocation 
            });
          }
        }
      }
    }

    game = new Phaser.Game({
      type: Phaser.AUTO,
      width: 1024,
      height: 576,
      parent: phaserRef.current,
      scene: MyScene,
      physics: { default: 'arcade' },
      backgroundColor: '#222'
    });

    return () => {
      game && game.destroy(true);
    };
  }, [mapKey, mapUrl, character, onPlayerMove]);

  return <div ref={phaserRef} />;
}

export default PhaserGame; 