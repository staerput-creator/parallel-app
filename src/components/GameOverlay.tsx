'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom'; // Импортируем Портал
import { X } from 'lucide-react';

// --- GAME ENGINE CONSTANTS ---
const GAME_WIDTH = 800;
const GAME_HEIGHT = 600;
const PLAYER_SPEED = 3;
const BULLET_SPEED = 7;
const ENEMY_SPEED = 1.5;

interface GameObject {
  x: number;
  y: number;
  w: number;
  h: number;
  dir: 'up' | 'down' | 'left' | 'right';
  color: string;
  id: number;
}

interface GameOverlayProps {
  onClose: () => void;
  texts: any;
}

export default function GameOverlay({ onClose, texts }: GameOverlayProps) {
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [mounted, setMounted] = useState(false); // Для портала

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  
  // ФИКС ОШИБКИ БИЛДА: Добавили 0 как начальное значение
  const requestRef = useRef<number>(0);
  
  const playerRef = useRef<GameObject>({ x: 400, y: 500, w: 30, h: 30, dir: 'up', color: '#10b981', id: 0 });
  const bulletsRef = useRef<GameObject[]>([]);
  const enemiesRef = useRef<GameObject[]>([]);
  const keysRef = useRef<{ [key: string]: boolean }>({});
  const lastShotTime = useRef(0);
  const lastSpawnTime = useRef(0);

  // Проверка монтирования компонента (нужно для доступа к document.body)
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const resetGame = () => {
    playerRef.current = { x: 385, y: 550, w: 30, h: 30, dir: 'up', color: '#10b981', id: 0 };
    bulletsRef.current = [];
    enemiesRef.current = [];
    setScore(0);
    setGameOver(false);
  };

  const spawnEnemy = () => {
    const x = Math.random() * (GAME_WIDTH - 30);
    enemiesRef.current.push({
      x, y: -30, w: 30, h: 30, dir: 'down', color: '#ef4444', id: Date.now()
    });
  };

  const updateGame = () => {
    if (gameOver) return;

    // Movement
    if (keysRef.current['ArrowUp'] && playerRef.current.y > 0) { playerRef.current.y -= PLAYER_SPEED; playerRef.current.dir = 'up'; }
    if (keysRef.current['ArrowDown'] && playerRef.current.y < GAME_HEIGHT - 30) { playerRef.current.y += PLAYER_SPEED; playerRef.current.dir = 'down'; }
    if (keysRef.current['ArrowLeft'] && playerRef.current.x > 0) { playerRef.current.x -= PLAYER_SPEED; playerRef.current.dir = 'left'; }
    if (keysRef.current['ArrowRight'] && playerRef.current.x < GAME_WIDTH - 30) { playerRef.current.x += PLAYER_SPEED; playerRef.current.dir = 'right'; }

    // Shooting
    if (keysRef.current[' '] && Date.now() - lastShotTime.current > 500) {
      const b = { x: playerRef.current.x + 10, y: playerRef.current.y + 10, w: 10, h: 10, dir: playerRef.current.dir, color: '#fbbf24', id: Date.now() };
      if (b.dir === 'up') b.y -= 20; if (b.dir === 'down') b.y += 20; if (b.dir === 'left') b.x -= 20; if (b.dir === 'right') b.x += 20;
      bulletsRef.current.push(b);
      lastShotTime.current = Date.now();
    }

    // Bullets Logic
    bulletsRef.current.forEach(b => {
      if (b.dir === 'up') b.y -= BULLET_SPEED;
      if (b.dir === 'down') b.y += BULLET_SPEED;
      if (b.dir === 'left') b.x -= BULLET_SPEED;
      if (b.dir === 'right') b.x += BULLET_SPEED;
    });
    bulletsRef.current = bulletsRef.current.filter(b => b.x > 0 && b.x < GAME_WIDTH && b.y > 0 && b.y < GAME_HEIGHT);

    // Enemies Logic
    if (Date.now() - lastSpawnTime.current > 2000) {
      spawnEnemy();
      lastSpawnTime.current = Date.now();
    }
    
    enemiesRef.current.forEach(e => {
      e.y += ENEMY_SPEED;
      if (playerRef.current.x < e.x + e.w && playerRef.current.x + playerRef.current.w > e.x && playerRef.current.y < e.y + e.h && playerRef.current.h + playerRef.current.y > e.y) {
        setGameOver(true);
      }
    });

    bulletsRef.current.forEach(b => {
      enemiesRef.current.forEach((e, eIdx) => {
        if (b.x < e.x + e.w && b.x + b.w > e.x && b.y < e.y + e.h && b.h + b.y > e.y) {
          enemiesRef.current.splice(eIdx, 1);
          bulletsRef.current = bulletsRef.current.filter(bul => bul.id !== b.id);
          setScore(s => s + 100);
        }
      });
    });
  };

  const drawGame = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Grid
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = 0; x <= GAME_WIDTH; x += 50) { ctx.moveTo(x, 0); ctx.lineTo(x, GAME_HEIGHT); }
    for (let y = 0; y <= GAME_HEIGHT; y += 50) { ctx.moveTo(0, y); ctx.lineTo(GAME_WIDTH, y); }
    ctx.stroke();

    // Player
    if (!gameOver) {
      ctx.fillStyle = playerRef.current.color;
      ctx.fillRect(playerRef.current.x, playerRef.current.y, 30, 30);
      ctx.fillStyle = '#059669';
      ctx.fillRect(playerRef.current.x + 10, playerRef.current.y, 10, 20); 
    }

    // Enemies & Bullets
    enemiesRef.current.forEach(e => {
      ctx.fillStyle = e.color;
      ctx.fillRect(e.x, e.y, 30, 30);
    });
    bulletsRef.current.forEach(b => {
      ctx.fillStyle = b.color;
      ctx.fillRect(b.x, b.y, 6, 6);
    });
  };

  const loop = () => {
    updateGame();
    drawGame();
    requestRef.current = requestAnimationFrame(loop);
  };

  useEffect(() => {
    resetGame();
    requestRef.current = requestAnimationFrame(loop);
    
    const handleGameKeys = (e: KeyboardEvent) => { keysRef.current[e.key] = true; };
    const handleGameKeysUp = (e: KeyboardEvent) => { keysRef.current[e.key] = false; };
    
    window.addEventListener('keydown', handleGameKeys);
    window.addEventListener('keyup', handleGameKeysUp);
    
    return () => {
      window.removeEventListener('keydown', handleGameKeys);
      window.removeEventListener('keyup', handleGameKeysUp);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [gameOver]);

  // Если компонент еще не смонтирован на клиенте, ничего не рендерим
  if (!mounted) return null;

  // ИСПОЛЬЗУЕМ PORTAL: Рендерим игру прямо в body, поверх всего остального
  return createPortal(
    <div className="fixed inset-0 z-[9999] bg-black/90 flex items-center justify-center font-mono backdrop-blur-sm">
       <button onClick={onClose} className="absolute top-6 right-6 text-green-500 hover:text-white p-2 border border-green-500/30 rounded transition-colors bg-black"><X className="w-8 h-8" /></button>
       
       <div className="relative border-4 border-green-900 rounded-lg bg-[#05100a] shadow-[0_0_100px_rgba(16,185,129,0.3)]">
         <div className="absolute top-4 left-4 text-green-500 text-xs tracking-widest uppercase">{texts.gameTitle}</div>
         <div className="absolute top-4 right-4 text-green-500 text-xl font-bold">{texts.score}: {score}</div>
         
         <canvas ref={canvasRef} width={GAME_WIDTH} height={GAME_HEIGHT} className="block w-full h-full max-w-[90vw] max-h-[80vh] object-contain bg-black/50" />

         {gameOver && (
           <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-md z-10">
              <h2 className="text-5xl font-black text-red-500 mb-6 animate-pulse tracking-tighter">{texts.gameOver}</h2>
              <p className="text-green-500 mb-10 text-2xl font-mono">{texts.score}: {score}</p>
              <button onClick={resetGame} className="px-10 py-4 bg-green-600 hover:bg-green-500 text-black font-bold uppercase tracking-widest rounded text-lg transition-transform hover:scale-105">{texts.restart}</button>
           </div>
         )}
         
         {!gameOver && <div className="absolute bottom-4 left-0 w-full text-center text-green-500/50 text-xs uppercase tracking-widest">{texts.controls}</div>}
       </div>
    </div>,
    document.body
  );
}