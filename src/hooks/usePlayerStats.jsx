import { useState, useEffect } from 'react';

export default function usePlayerStats(onStatsChange, gameOver) {
    const [stats, setStats] = useState({
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
        currentLocation: 'Rumah',
        inventory: [],
    });

    useEffect(() => {
        if (gameOver) return;

        const interval = setInterval(() => {
            setStats(prev => {
                const updated = updateTimeAndStats(prev);
                onStatsChange(updated, updated.health <= 0);
                return updated;
            });
        }, 5000);

        return () => clearInterval(interval);
    }, [gameOver, onStatsChange]);

    const updateTimeAndStats = (prev) => {
        let { day, hour, minute, hunger, energy, hygiene, happiness, health } = prev;

        minute += 1;
        if (minute >= 60) {
            minute = 0;
            hour += 1;
        }
        if (hour >= 24) {
            hour = 0;
            day += 1;
        }

        hunger = Math.max(0, hunger - 1);
        energy = Math.max(0, energy - 1);
        hygiene = Math.max(0, hygiene - 0.5);
        happiness = Math.max(0, happiness - 0.5);

        if (hunger <= 0 || energy <= 0) {
            health = Math.max(0, health - 2);
        }

        return {
            ...prev,
            day,
            hour,
            minute,
            hunger,
            energy,
            hygiene,
            happiness,
            health
        };
    };

    const modifyStats = (changes) => {
        setStats(prev => {
            const updated = { ...prev, ...changes };

            ['health', 'energy', 'hunger', 'hygiene', 'happiness'].forEach(key => {
                if (updated[key] !== undefined) {
                    updated[key] = Math.max(0, Math.min(100, updated[key]));
                }
            });

            if (updated.knowledge !== undefined) {
                updated.knowledge = Math.max(0, updated.knowledge);
            }

            if (changes.inventory) {
                const prevInventory = prev.inventory || [];
                const newItems = changes.inventory.filter(item => !prevInventory.includes(item));
                updated.inventory = [...prevInventory, ...newItems];
            }

            onStatsChange(updated, updated.health <= 0);
            return updated;
        });
    };

    return [stats, modifyStats];
}
