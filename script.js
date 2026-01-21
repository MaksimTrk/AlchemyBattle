const state = {
    playerHP: 100,
    enemyHP: 100,
    enemyMaxHP: 100,
    currentEnemyIndex: 0,
    deck: ['fire', 'water', 'root', 'mercury', 'fire', 'water', 'root'],
    hand: [],
    selected: [],
    effects: {
        shield: 0
    }
};

const ENEMIES = [
    { 
        name: "Goblin", 
        hp: 100, 
        asset: 'assets/goblin.png', 
        attackAsset: 'assets/goblin_attack.png',
        background: 'assets/forest_bg.png',
        attackSound: "goblin_atack",
        ability: null, 
        chance: 0
    },
    { 
        name: "Swamp Wizard", 
        hp: 100, 
        asset: 'assets/swamp_wizard.png', 
        attackAsset: 'assets/swamp_wizard_attack.png',
        background: 'assets/swamp_bg.png',
        attackSound: "swamp_wizard_atack",
        ability: "vampirism", 
        chance: 0.2
    },
    { 
        name: "Swamp Ghost", 
        hp: 150, 
        asset: 'assets/swamp_ghost.png', 
        attackAsset: 'assets/swamp_ghost_attack.png',
        background: 'assets/swamp_ghost_bg.png',
        attackSound: "swamp_ghost_atack",
        ability: "dodge", 
        chance: 0.25
    },
    { 
        name: "Cursed Bride", 
        hp: 130, 
        asset: 'assets/bride.png', 
        attackAsset: 'assets/bride_attack.png',
        reflectAsset: 'assets/bride_reflect.png', 
        background: 'assets/cathedral_bg.png',
        attackSound: "bride_atack",
        ability: "reflect", 
        chance: 0.4 
    },
    { 
    name: "Cursed Witch & Rat", 
    hp: 200, 
    maxHp: 200,
    asset: 'assets/witch.png', 
    attackAsset: 'assets/witch_attack.png',
    protectedAsset: 'assets/witch_protected.png',
    size: "150px",
    background: 'assets/cathedral_interior.png',
    attackSound: "witch_atack",
    ability: "summon",
    minion: {
        name: "Plague Rat",
        hp: 50,
        maxHp: 50,
        asset: 'assets/rat.png',
        attackAsset: 'assets/rat_attack.png',
        attackSound: "rat_atack",
        size: "95px",
        alive: true
    }
}
];

const ASSETS = {
    // Інгредієнти
    fire: 'assets/fire.png',
    water: 'assets/water.png',
    root: 'assets/root.png',
    mercury: 'assets/mercury.png',
    
    // Гравець
    playerDefault: 'assets/wizard.png',
    playerAttack: 'assets/wizard_attack.png',
    playerHeal: 'assets/wizard_heal.png',
};

const RECIPES = {
    "fire,fire": { name: "Fireball", damage: 25, heal: 0, msg: "Huge explosion!" },
    "water,water": { name: "Pure Water", damage: 0, heal: 5, msg: "Refreshing." },
    "root,water": { name: "Healing Brew", damage: 0, heal: 20, msg: "You feel better." },
    "fire,mercury": { name: "Acid Cloud", damage: 15, heal: 0, msg: "Enemy is dissolving!" },
    "fire,water": { name: "Steam Blast", damage: 8, heal: 0, msg: "Hot steam burns the enemy." },
    "root,root": { name: "Ironwood Shield", damage: 0, heal: 12, msg: "Your defense is stronger." },
    "mercury,root": { name: "Toxic Thorn", damage: 18, heal: 0, msg: "Nature and poison combine." }
};

const handContainer = document.getElementById('hand');
const slot1 = document.getElementById('slot-1');
const slot2 = document.getElementById('slot-2');
const log = document.getElementById('log');
const restartContainer = document.getElementById('restart-container');
let backgroundMusic = null;

function startBackgroundMusic() {
    if (backgroundMusic) return;

    backgroundMusic = new Audio('assets/sounds/background.mp3');
    
    backgroundMusic.loop = true;  
    backgroundMusic.volume = 0.2; 
    
    backgroundMusic.play().catch(e => console.log("Music wait for interaction"));
}


document.addEventListener('click', startBackgroundMusic, { once: true });
function refillHand() {
    while (state.hand.length < 5) {
        const randomIngredient = state.deck[Math.floor(Math.random() * state.deck.length)];
        state.hand.push(randomIngredient);
    }
    renderHand();
}

function renderHand() {
    handContainer.innerHTML = '';
    state.hand.forEach((id, index) => {
        const card = document.createElement('div');
        card.className = 'card';

        card.innerHTML = `
            <img src="${ASSETS[id]}" alt="${id}">
            <div class="card-label">${id}</div>
        `;
        card.onclick = () => selectIngredient(index);
        handContainer.appendChild(card);
    });
}

function selectIngredient(index) {
    if (state.selected.length < 2) {
        const id = state.hand[index];
        state.selected.push(id);
        state.hand.splice(index, 1);
        
        updateSlots();
        renderHand();

        if (state.selected.length === 2) {
            setTimeout(checkCombo, 600);
        }
    }
}
function toggleRecipeBook() {
    const book = document.getElementById('recipe-book');
    if (!book) return;
    
    book.classList.toggle('hidden');

    if (!book.classList.contains('hidden')) {
        renderRecipes();
    }
}

function renderRecipes() {
    const list = document.getElementById('recipes-list');
    list.innerHTML = '';

    for (const [ingredients, data] of Object.entries(RECIPES)) {
        const entry = document.createElement('div');
        entry.className = 'recipe-entry';

        const ingredientIcons = ingredients.split(',').join(' + ');

        entry.innerHTML = `
            <div><small>${ingredientIcons}</small></div>
            <div><b>${data.name}</b></div>
            <div style="font-size: 0.85rem; opacity: 0.8;">${data.msg}</div>
            <div style="font-size: 0.8rem; margin-top: 4px;">
                ${data.damage > 0 ? '⚔️ Damage: ' + data.damage : ''}
                ${data.heal > 0 ? '💚 Heal: ' + data.heal : ''}
            </div>
        `;
        list.appendChild(entry);
    }
}
function updateSlots() {
    const s1 = state.selected[0];
    const s2 = state.selected[1];

    slot1.innerHTML = s1 ? `<img src="${ASSETS[s1]}" style="width:70%;"><div class="card-label">${s1}</div>` : '?';
    slot2.innerHTML = s2 ? `<img src="${ASSETS[s2]}" style="width:70%;"><div class="card-label">${s2}</div>` : '?';
}
function triggerAction(entity, type) {
    const elementId = entity === 'player' ? 'player-sprite' : 'enemy-sprite';
    const container = document.getElementById(elementId);
    const img = container.querySelector('img');
    const currentEnemy = ENEMIES[state.currentEnemyIndex];

    let newSrc;
    if (entity === 'player') {
        newSrc = type === 'attack' ? ASSETS.playerAttack : ASSETS.playerHeal;
    } else {
        newSrc = currentEnemy.attackAsset; 
    }
    
    img.src = newSrc;
    container.classList.add('action-pulse');
    setTimeout(() => {
        img.src = entity === 'player' ? ASSETS.playerDefault : currentEnemy.asset;
        container.classList.remove('action-pulse');
    }, 1200);
}
function loadEnemy(index) {
    const enemy = ENEMIES[index];
    const minionArea = document.getElementById('minion-container');
    state.enemyHP = enemy.hp;
    state.enemyMaxHP = enemy.hp;

    const gameContainer = document.getElementById('game-container');
    
    // Міньйон
    if (enemy.minion) {
        minionArea.style.display = 'block';
        document.getElementById('minion-name').innerText = enemy.minion.name;

        const minionSize = enemy.minion.size || "60px"; 
        document.getElementById('minion-sprite').innerHTML = 
            `<img src="${enemy.minion.asset}" style="width:${minionSize};">`;
    } else {
        minionArea.style.display = 'none';
    }

    if (enemy.background) {
        gameContainer.style.backgroundImage = `url('${enemy.background}')`;
    }

    const enemySprite = document.getElementById('enemy-sprite');
    const displaySize = enemy.size || "120px"; 
    enemySprite.innerHTML = `<img src="${enemy.asset}" style="width:${displaySize};">`;
    
    log.innerText = `A wild ${enemy.name} appears!`;
    updateUI();
}
function setupSprites() {
    const playerSprite = document.getElementById('player-sprite');
    playerSprite.innerHTML = `<img src="${ASSETS.playerDefault}" style="width:120px;">`;
    loadEnemy(state.currentEnemyIndex); 
}

setupSprites();

function checkCombo() {
    const combo = [...state.selected].sort().join(',');
    console.log("Checking combo for:", combo); 
    
    const result = RECIPES[combo];

    if (result) {
        applyEffect(result);
    } else {
        playSound('fail');
        log.innerText = "Failure! The potion exploded (5 damage to self)";
        state.playerHP -= 5;
    }

    state.selected = [];
    updateSlots();
    refillHand();
    updateUI();
    
    if (state.enemyHP > 0 && state.playerHP > 0) {
        enemyTurn();
    }
}

function applyEffect(effect) {
    const enemy = ENEMIES[state.currentEnemyIndex];
    let message = `You crafted ${effect.name}! ${effect.msg}`;
    if (effect.name === "Ironwood Shield") {
    state.effects.shield = 1; 
    log.innerText = "You are protected by ironwood!";
}

    if (effect.damage > 0) {
        if (enemy.ability == "dodge" && Math.random() < enemy.chance) {
            playSound('damage_dodge');
            log.innerText = `${enemy.name} dodged your attack!`;
            updateUI(); 
            return; 
        }

        if (enemy.ability == "reflect" && Math.random() < enemy.chance) {
            const enemyContainer = document.getElementById('enemy-sprite');
            enemyContainer.classList.add('reflect-shake');
            setTimeout(() => enemyContainer.classList.remove('reflect-shake'), 500);
            
            const reflectedDamage = Math.floor(effect.damage * 0.5); 
            state.playerHP -= reflectedDamage;

            const enemyImg = document.querySelector('#enemy-sprite img');
            if (enemy.reflectAsset) enemyImg.src = enemy.reflectAsset;
            
            playSound('bride_reflect'); 
            message = `The Bride reflects it! You took ${reflectedDamage} damage!`;

            setTimeout(() => {
                enemyImg.src = enemy.asset;
            }, 1000);
        }

       if (enemy.minion && enemy.minion.hp > 0) {
            enemy.minion.hp -= effect.damage;
            message = `The ${enemy.minion.name} protects the Witch! (-${effect.damage} HP)`;

            const enemyImg = document.querySelector('#enemy-sprite img');
            if (enemyImg && enemy.protectedAsset) {
                enemyImg.src = enemy.protectedAsset; 
                const baseSize = parseInt(enemy.size) || 120;
                const enlargedSize = (baseSize * 1.1) + "px"; 

                enemyImg.style.width = enlargedSize;
                setTimeout(() => {
                    if (state.enemyHP > 0) {
                        enemyImg.src = enemy.asset;
                        enemyImg.style.width = (baseSize + "px");
                    }
                }, 800);
            }

            if (enemy.minion.hp <= 0) {
                enemy.minion.hp = 0;
                message = `The ${enemy.minion.name} is defeated! Witch is now vulnerable!`;
            }
        } else {
            state.enemyHP -= effect.damage;
        }

        playSound('wizard_atack');
        triggerAction('player', 'attack');
    }

    if (effect.heal > 0) {
        playSound('wizard_heal');
        triggerAction('player', 'heal');
        state.playerHP += effect.heal;
    }

    if (state.playerHP > 100) state.playerHP = 100;

    log.innerText = message;
    updateUI();
}

function updateUI() {
    document.getElementById('player-hp-fill').style.width = Math.max(0, state.playerHP) + '%';
    document.getElementById('player-hp-text').innerText = `${state.playerHP}/100`;

    const enemyPercentage = (state.enemyHP / state.enemyMaxHP) * 100;
    document.getElementById('enemy-hp-fill').style.width = Math.max(0, enemyPercentage) + '%';
    document.getElementById('enemy-hp-text').innerText = `${state.enemyHP}/${state.enemyMaxHP}`;
    const enemy = ENEMIES[state.currentEnemyIndex];
    if (enemy.minion) {
        const minionPercent = (enemy.minion.hp / enemy.minion.maxHp) * 100;
        document.getElementById('minion-hp-fill').style.width = Math.max(0, minionPercent) + '%';

        document.getElementById('minion-sprite').style.opacity = enemy.minion.hp <= 0 ? '0.3' : '1';
    }
    if (state.enemyHP <= 0) {
        const healAmount = Math.floor(state.playerHP * 0.5); 
            state.playerHP += healAmount;
            if (state.playerHP > 100) state.playerHP = 100; 
            
            playSound('wizard_heal');
            log.innerText = `Enemy defeated! Restoring ${healAmount} HP. Next one is coming...`;
        if (state.currentEnemyIndex < ENEMIES.length - 1) {
            state.currentEnemyIndex++;
            log.innerText = "Enemy defeated! Next one is coming...";
            setTimeout(() => loadEnemy(state.currentEnemyIndex), 2000);
        } else {
            log.innerText = "VICTORY! All enemies defeated!";
            endGame();
        }
    } else if (state.playerHP <= 0) {
        log.innerText = "GAME OVER...";
        endGame();
    }
    const effectsContainer = document.getElementById('player-effects');
    effectsContainer.innerHTML = ''; 

    if (state.effects.shield > 0) {
        const shieldWrapper = document.createElement('div');
        shieldWrapper.style.position = 'relative';
        shieldWrapper.style.display = 'inline-block';

        // Іконка
        shieldWrapper.innerHTML = `
            <span style="font-size: 24px;">🛡️</span>
            <b style="
                position: absolute; 
                bottom: -5px; 
                right: -5px; 
                background: white; 
                border-radius: 50%; 
                padding: 2px 5px; 
                font-size: 10px; 
                color: black;
                border: 1px solid green;
            ">${state.effects.shield}</b>
        `;
        
        effectsContainer.appendChild(shieldWrapper);
    }
}

function enemyTurn() {
    log.innerText += " ...Enemy is preparing...";
    
    setTimeout(() => {
        if (state.enemyHP <= 0) return;

        const currentEnemy = ENEMIES[state.currentEnemyIndex];

        const minDamage = 8;
        const maxDamage = 16;
        let mainDamage = Math.floor(Math.random() * (maxDamage - minDamage + 1)) + minDamage;

        let minionDamage = 0;
        if (currentEnemy.minion && currentEnemy.minion.hp > 0) {
            minionDamage = Math.floor(Math.random() * 5) + 3; 
        }

        // Анімації та звуки (залишаємо як було)
        if (minionDamage > 0) {
            if (currentEnemy.minion.attackSound) playSound(currentEnemy.minion.attackSound);
            const minionImg = document.querySelector('#minion-sprite img');
            if (minionImg && currentEnemy.minion.attackAsset) {
                minionImg.src = currentEnemy.minion.attackAsset;
                setTimeout(() => { minionImg.src = currentEnemy.minion.asset; }, 800);
            }
        }

        if (currentEnemy.attackSound) playSound(currentEnemy.attackSound);
        triggerAction('enemy', 'attack');

        let totalDamage = mainDamage + minionDamage;
        let shieldWasActive = false;

        if (state.effects.shield > 0) {
            totalDamage = Math.floor(totalDamage * 0.3); 
            state.effects.shield -= 1; 
            shieldWasActive = true;
            playSound('shield_block'); 
        }

        state.playerHP -= totalDamage;

        let message = `Enemy attacks dealt ${totalDamage} damage.`;
        if (shieldWasActive) {
            message = `🛡️ Shield absorbed damage! You took only ${totalDamage}. Hits left: ${state.effects.shield}`;
        } else if (minionDamage > 0) {
            message += ` (including ${currentEnemy.minion.name} bite)`;
        }

        if (currentEnemy.ability == "vampirism" && Math.random() < currentEnemy.chance) {
            state.enemyHP += mainDamage; 
            if (state.enemyHP > state.enemyMaxHP) state.enemyHP = state.enemyMaxHP;
            message += ` Vampirism! +${mainDamage} HP!`;
        }

        log.innerText = message;
        refillHand(); 
        updateUI();
    }, 1200);
}

function endGame() {
    handContainer.style.pointerEvents = 'none';
    handContainer.style.opacity = '0.5';
    restartContainer.style.display = 'block';
}

function resetGame() {
    state.playerHP = 100;
    state.enemyHP = 100;
    state.hand = [];
    state.selected = [];
    
    restartContainer.style.display = 'none';
    handContainer.style.pointerEvents = 'all';
    handContainer.style.opacity = '1';
    log.innerText = "Prepare for duel! Choose 2 ingredients.";
    
    slot1.innerText = '?';
    slot2.innerText = '?';
    
    refillHand();
    updateUI();
}
function playSound(name) {
    const audio = new Audio(`assets/sounds/${name}.mp3`);
    audio.volume = 0.5; 
    audio.play().catch(e => console.log("Sound error:", e)); 
}
refillHand();
updateUI();

window.onclick = function(event) {
    const bookModal = document.getElementById('recipe-book');
    if (event.target == bookModal) {
        toggleRecipeBook();
    }
}
