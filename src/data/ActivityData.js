import Swal from 'sweetalert2';

function clampStat(value) {
    return Math.max(0, Math.min(value, 100));
}

const possibleRewards = {
    mancing: {
        items: ['🐟 Ikan', '🦐 Udang', '🦀 Kepiting', '🐠 Ikan Hias'],
        money: [10000, 15000, 20000, 25000]
    },
    berenang: {
        items: ['🐚 Kerang', '🌊 Air Laut', '🏊‍♂️ Kacamata Renang'],
        money: [5000, 10000, 15000]
    },
    camping: {
        items: ['🌲 Kayu', '🍄 Jamur', '🌿 Daun', '🪨 Batu'],
        money: [15000, 20000, 25000]
    },
    belajar: {
        items: ['📚 Buku', '✏️ Pensil', '📝 Catatan', '🎓 Topi Wisuda'],
        money: [5000, 10000]
    }
};

const getRandomReward = (activity) => {
    const activityRewards = possibleRewards[activity];
    if (!activityRewards) return null;

    const rewards = [];
    
    // 70% chance to get an item
    if (Math.random() < 0.7) {
        const randomItem = activityRewards.items[Math.floor(Math.random() * activityRewards.items.length)];
        rewards.push(randomItem);
    }
    
    // 50% chance to get money
    if (Math.random() < 0.5) {
        const randomMoney = activityRewards.money[Math.floor(Math.random() * activityRewards.money.length)];
        rewards.push(randomMoney);
    }
    
    return rewards;
};

export const activityEffects = {
    masuk: {
        location: 'rumah',
        effect: (player, changeLocation, modifyStats, showGif, changeMap) => {
            changeLocation('dlmrumah');
            changeMap('interior', '/maps/InteriorHouse.tmj');
        },
    },

    tidur: {
        location: 'dlmrumah',
        condition: (player) => player.energy < 100,
        effect: (_, changeLocation, modifyStats, showGif) => {
            showGif('tidur', 1500, () => {
                modifyStats({
                    energy: clampStat(_.energy + 40),
                    hunger: clampStat(_.hunger - 10),
                    hygiene: clampStat(_.hygiene - 5),
                    happiness: clampStat(_.happiness + 5),
                    hour: _.hour + 6,
                });
            });
        },
        failMessage: {
            title: 'Energi Penuh',
            text: 'Energi kamu sudah penuh!',
        },
    },

    makan: {
        location: 'dlmrumah',
        condition: (player) => player.money >= 20000,
        effect: (player, _, modifyStats, showGif) => {
            showGif('makan', 1500, () => {
                modifyStats({
                    hunger: clampStat(player.hunger + 40),
                    money: player.money - 20000,
                    hygiene: clampStat(player.hygiene - 2),
                    happiness: clampStat(player.happiness + 2),
                    hour: player.hour + 1,
                });
            });
        },
        failMessage: {
            title: 'Uang Tidak Cukup',
            text: 'Uangmu gak cukup buat makan!',
        },
    },

    mandi: {
        location: 'dlmrumah',
        condition: (player) => player.hygiene < 100 && player.energy >= 15,
        effect: (player, _, modifyStats, showGif) => {
            showGif('mandi', 1500, () => {
                modifyStats({
                    hygiene: clampStat(player.hygiene + 50),
                    energy: clampStat(player.energy - 5),
                    hour: player.hour + 1,
                });
            });
        },
        failMessage: {
            title: 'Mandi Gak Bisa',
            text: 'Kamu udah bersih/energi kamu kurang!',
        },
    },

    mainGame: {
        location: 'dlmrumah',
        condition: (player) => player.energy >= 10 && player.hunger >= 10,
        effect: (player, _, modifyStats, showGif) => {
            showGif('mainGame', 1500);
            setTimeout(() => {
                modifyStats({
                    happiness: clampStat(player.happiness + 30),
                    energy: clampStat(player.energy - 10),
                    hunger: clampStat(player.hunger - 10),
                    hour: player.hour + 2,
                });
            }, 1500);
        },
        failMessage: {
            title: 'Gak Kuat Main',
            text: 'Kamu terlalu capek/lapar buat main game!',
        },
    },

    belajar: {
        location: ['dlmrumah', 'kampus'],
        condition: (player) => player.energy >= 20 && player.hunger >= 20,
        effect: (player, _, modifyStats, showGif) => {
            showGif('belajar', 1500);
            setTimeout(() => {
                const rewards = getRandomReward('belajar');
                const newInventory = [...(player.inventory || [])];
                let moneyEarned = 0;

                if (rewards) {
                    rewards.forEach(reward => {
                        if (typeof reward === 'number') {
                            moneyEarned += reward;
                        } else {
                            newInventory.push(reward);
                        }
                    });
                }

                modifyStats({
                    knowledge: player.knowledge + 20,
                    energy: clampStat(player.energy - 15),
                    hunger: clampStat(player.hunger - 10),
                    happiness: clampStat(player.happiness - 5),
                    hour: player.hour + 2,
                    money: player.money + moneyEarned,
                    inventory: newInventory
                });

                if (rewards && rewards.length > 0) {
                    const rewardText = rewards.map(reward => 
                        typeof reward === 'number' ? `Rp ${reward.toLocaleString()}` : reward
                    ).join(', ');
                    Swal.fire({
                        title: '🎉 Kamu Mendapatkan!',
                        text: rewardText,
                        icon: 'success',
                        timer: 2000
                    });
                }
            }, 1500);
        },
        failMessage: {
            title: 'Belajar Ditunda',
            text: 'Kamu butuh makan/istirahat sebelum belajar!',
        },
    },

    keluar: {
        location: 'dlmrumah',
        effect: (player, changeLocation, modifyStats, showGif, changeMap) => {
            changeLocation('rumah');
            changeMap('exterior', '/maps/Exterior.tmj');
        },
    },

    // Split pergi into separate activities for each destination
    pergiPantai: {
        location: 'rumah',
        effect: (player, changeLocation, updatePlayer, showGif, changeMap) => {
            showGif('mobil', 2500, () => {
                changeLocation('pantai');
                changeMap('Beach', '/maps/Beach.tmj');
            });
        },
    },
    pergiKampus: {
        location: 'rumah',
        effect: (player, changeLocation, updatePlayer, showGif, changeMap) => {
            showGif('mobil', 2500, () => {
                changeLocation('kampus');
                changeMap('kampus', '/maps/Campus.tmj');
            });
        },
    },
    pergiGunung: {
        location: 'rumah',
        effect: (player, changeLocation, updatePlayer, showGif, changeMap) => {
            showGif('mobil', 2500, () => {
                changeLocation('gunung');
                changeMap('gunung', '/maps/Mountain.tmj');
            });
        },
    },

    bermain: {
        location: 'pantai',
        condition: (player) => player.energy >= 30 && player.hunger >= 20,
        effect: (player, _, modifyStats, showGif) => {
            showGif('bermain', 1500);
            setTimeout(() => {
                modifyStats({
                    money: player.money - 50000,
                    energy: clampStat(player.energy - 25),
                    hunger: clampStat(player.hunger - 15),
                    happiness: clampStat(player.happiness + 25),
                    hygiene: clampStat(player.hygiene - 10),
                    hour: player.hour + 1,
                });
            }, 1500);
        },
        failMessage: {
            title: 'Bermain Gak Bisa',
            text: 'Kamu lapar/energi kamu kurang',
        },
    },

    mancing: {
        location: 'pantai',
        condition: (player) => player.energy >= 20 && player.hunger >= 20,
        effect: (player, _, modifyStats, showGif) => {
            showGif('mancing', 1500);
            setTimeout(() => {
                const rewards = getRandomReward('mancing');
                const newInventory = [...(player.inventory || [])];
                let moneyEarned = 0;

                if (rewards) {
                    rewards.forEach(reward => {
                        if (typeof reward === 'number') {
                            moneyEarned += reward;
                        } else {
                            newInventory.push(reward);
                        }
                    });
                }

                modifyStats({
                    money: player.money + moneyEarned - 50000,
                    energy: clampStat(player.energy - 20),
                    hunger: clampStat(player.hunger - 30),
                    happiness: clampStat(player.happiness + 30),
                    hygiene: clampStat(player.hygiene - 10),
                    hour: player.hour + 3,
                    inventory: newInventory
                });

                if (rewards && rewards.length > 0) {
                    const rewardText = rewards.map(reward => 
                        typeof reward === 'number' ? `Rp ${reward.toLocaleString()}` : reward
                    ).join(', ');
                    Swal.fire({
                        title: '🎉 Kamu Mendapatkan!',
                        text: rewardText,
                        icon: 'success',
                        timer: 2000
                    });
                }
            }, 1500);
        },
        failMessage: {
            title: 'Mancing Gak Bisa',
            text: 'Kamu lapar/energi kamu kurang',
        },
    },

    camping: {
        location: 'gunung',
        condition: (player) => player.energy >= 30 && player.hunger >= 20,
        effect: (player, _, modifyStats, showGif) => {
            showGif('camping', 1500);
            setTimeout(() => {
                const rewards = getRandomReward('camping');
                const newInventory = [...(player.inventory || [])];
                let moneyEarned = 0;

                if (rewards) {
                    rewards.forEach(reward => {
                        if (typeof reward === 'number') {
                            moneyEarned += reward;
                        } else {
                            newInventory.push(reward);
                        }
                    });
                }

                modifyStats({
                    happiness: clampStat(player.happiness + 50),
                    energy: clampStat(player.energy - 25),
                    hunger: clampStat(player.hunger - 15),
                    money: player.money + moneyEarned - 50000,
                    hour: player.hour + 3,
                    inventory: newInventory
                });

                if (rewards && rewards.length > 0) {
                    const rewardText = rewards.map(reward => 
                        typeof reward === 'number' ? `Rp ${reward.toLocaleString()}` : reward
                    ).join(', ');
                    Swal.fire({
                        title: '🎉 Kamu Mendapatkan!',
                        text: rewardText,
                        icon: 'success',
                        timer: 2000
                    });
                }
            }, 1500);
        },
        failMessage: {
            title: 'Camping Gak Bisa',
            text: 'Kamu lapar/energi kamu kurang',
        },
    },

    pulang: {
        location: ['pantai', 'kampus', 'gunung', 'dlmrumah'],
        effect: (player, changeLocation, updatePlayer, showGif, changeMap) => {
            showGif('mobil', 2500, () => {
                changeLocation('rumah');
                changeMap('exterior', '/maps/Exterior.tmj');
            });
        },
    },

    berenang: {
        location: 'pantai',
        condition: (player) => player.energy >= 20 && player.hunger >= 10,
        effect: (player, _, modifyStats, showGif) => {
            showGif('renang', 1500);
            setTimeout(() => {
                const rewards = getRandomReward('berenang');
                const newInventory = [...(player.inventory || [])];
                let moneyEarned = 0;

                if (rewards) {
                    rewards.forEach(reward => {
                        if (typeof reward === 'number') {
                            moneyEarned += reward;
                        } else {
                            newInventory.push(reward);
                        }
                    });
                }

                modifyStats({
                    energy: clampStat(player.energy - 20),
                    hunger: clampStat(player.hunger - 10),
                    happiness: clampStat(player.happiness + 20),
                    hygiene: clampStat(player.hygiene - 10),
                    hour: player.hour + 2,
                    money: player.money + moneyEarned,
                    inventory: newInventory
                });

                if (rewards && rewards.length > 0) {
                    const rewardText = rewards.map(reward => 
                        typeof reward === 'number' ? `Rp ${reward.toLocaleString()}` : reward
                    ).join(', ');
                    Swal.fire({
                        title: '🎉 Kamu Mendapatkan!',
                        text: rewardText,
                        icon: 'success',
                        timer: 2000
                    });
                }
            }, 1500);
        },
        failMessage: {
            title: 'Gak Bisa Berenang',
            text: 'Energi atau lapar kamu kurang!',
        },
    },
};
