const state = {
    playerHP: 100,
    enemyHP: 100,
    // Deck contains only IDs (strings) for stable logic
    deck: ['fire', 'water', 'root', 'mercury', 'fire', 'water', 'root'],
    hand: [],
    selected: [] 
};

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
    
    // Ворог
    enemyDefault: 'assets/goblin.png',
    enemyAttack: 'assets/goblin_attack.png'
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

        card.innerHTML = `<img src="${ASSETS[id]}" alt="${id}" style="width:100%; height:auto;">`;
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

function updateSlots() {
    const s1 = state.selected[0];
    const s2 = state.selected[1];

    slot1.innerHTML = s1 ? `<img src="${ASSETS[s1]}" style="width:100%;">` : '?';
    slot2.innerHTML = s2 ? `<img src="${ASSETS[s2]}" style="width:100%;">` : '?';
}
function triggerAction(entity, type) {
    const elementId = entity === 'player' ? 'player-sprite' : 'enemy-sprite';
    const container = document.getElementById(elementId);
    const img = container.querySelector('img');
    let newSrc;
    if (entity === 'player') {
        newSrc = type === 'attack' ? ASSETS.playerAttack : ASSETS.playerHeal;
    } else {
        newSrc = ASSETS.enemyAttack;
    }
    
    img.src = newSrc;
    container.classList.add('action-pulse');
    setTimeout(() => {
        img.src = entity === 'player' ? ASSETS.playerDefault : ASSETS.enemyDefault;
        container.classList.remove('action-pulse');
    }, 1200);
}
function setupSprites() {
    const playerSprite = document.getElementById('player-sprite');
    const enemySprite = document.getElementById('enemy-sprite');

    playerSprite.innerHTML = `<img src="${ASSETS.playerDefault}" style="width:120px;">`;
    enemySprite.innerHTML = `<img src="${ASSETS.enemyDefault}" style="width:120px;">`;
}

setupSprites();

function checkCombo() {
    const combo = [...state.selected].sort().join(',');
    console.log("Checking combo for:", combo); 
    
    const result = RECIPES[combo];

    if (result) {
        applyEffect(result);
    } else {
        log.innerText = "Failure! The potion exploded (5 damage to self)";
        state.playerHP -= 5;
    }

    state.selected = [];
    updateSlots();
    updateUI();
    
    if (state.enemyHP > 0 && state.playerHP > 0) {
        enemyTurn();
    }
}

function applyEffect(effect) {
    if (effect.damage > 0) {
        triggerAction('player', 'attack');
        state.enemyHP -= effect.damage;
    }
    if (effect.heal > 0) {
        triggerAction('player', 'heal');
        state.playerHP += effect.heal;
    }
    if (state.playerHP > 100) state.playerHP = 100;
    log.innerText = `You crafted ${effect.name}! ${effect.msg}`;
}

function updateUI() {
    document.getElementById('player-hp-fill').style.width = Math.max(0, state.playerHP) + '%';
    document.getElementById('player-hp-text').innerText = `${state.playerHP}/100`;
    
    document.getElementById('enemy-hp-fill').style.width = Math.max(0, state.enemyHP) + '%';
    document.getElementById('enemy-hp-text').innerText = `${state.enemyHP}/100`;
    
    if (state.playerHP <= 0) {
        log.innerText = "GAME OVER. The darkness consumes you...";
        endGame();
    } else if (state.enemyHP <= 0) {
        log.innerText = "VICTORY! The monster has been banished.";
        endGame();
    }
}

function enemyTurn() {
    log.innerText += " ...Enemy is preparing...";
    
    setTimeout(() => {
        if (state.enemyHP <= 0) return; // Перевірка, чи ворог живий

        // 1. Розрахунок випадкової шкоди (наприклад, від 8 до 16)
        const minDamage = 8;
        const maxDamage = 16;
        const randomDamage = Math.floor(Math.random() * (maxDamage - minDamage + 1)) + minDamage;

        // 2. Візуальна активація атаки
        triggerAction('enemy', 'attack');
        
        // 3. Нанесення шкоди
        state.playerHP -= randomDamage;
        
        // 4. Виведення повідомлення (стилізоване під повідомлення гравця)
        log.innerText = `Enemy attacks! It dealt ${randomDamage} damage to you.`;
        
        // 5. Оновлення інтерфейсу та добір карт
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

refillHand();
updateUI();