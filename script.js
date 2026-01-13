const state = {
    playerHP: 100,
    enemyHP: 100,
    enemyMaxHP: 100,
    currentEnemyIndex: 0,
    deck: ['fire', 'water', 'root', 'mercury', 'fire', 'water', 'root'],
    hand: [],
    selected: [] 
};

const ENEMIES = [
    { 
        name: "Goblin", 
        hp: 100, 
        asset: 'assets/goblin.png', 
        attackAsset: 'assets/goblin_attack.png',
        background: 'assets/forest_bg.png',
        special: null 
    },
    { 
        name: "Swamp Wizard", 
        hp: 120, 
        asset: 'assets/swamp_wizard.png', 
        attackAsset: 'assets/swamp_wizard_attack.png',
        background: 'assets/swamp_bg.png',
        special: function(damage) {
            const chance = Math.random();
            if (chance < 0.33) {
                state.enemyHP += damage;
                if (state.enemyHP > state.enemyMaxHP) state.enemyHP = state.enemyMaxHP;
                return `Vampirism! Wizard stole ${damage} HP!`;
            }
            return null;
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
function toggleRecipeBook() {
    const book = document.getElementById('recipe-book');
    if (!book) return;
    
    book.classList.toggle('hidden');
    
    // Якщо книгу відкрито, оновлюємо список рецептів
    if (!book.classList.contains('hidden')) {
        renderRecipes();
    }
}

function renderRecipes() {
    const list = document.getElementById('recipes-list');
    list.innerHTML = '';

    // Перебираємо об'єкт RECIPES з вашого коду
    for (const [ingredients, data] of Object.entries(RECIPES)) {
        const entry = document.createElement('div');
        entry.className = 'recipe-entry';
        
        // Форматуємо інгредієнти для відображення
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

    slot1.innerHTML = s1 ? `<img src="${ASSETS[s1]}" style="width:100%;">` : '?';
    slot2.innerHTML = s2 ? `<img src="${ASSETS[s2]}" style="width:100%;">` : '?';
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
        newSrc = currentEnemy.attackAsset; // Беремо атаку поточного ворога
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
    state.enemyHP = enemy.hp;
    state.enemyMaxHP = enemy.hp;
    
    // Знаходимо основний контейнер гри
    const gameContainer = document.getElementById('game-container');
    
    if (enemy.background) {
        gameContainer.style.backgroundImage = `url('${enemy.background}')`;
    }
    
    const enemySprite = document.getElementById('enemy-sprite');
    enemySprite.innerHTML = `<img src="${enemy.asset}" style="width:120px;">`;
    
    log.innerText = `A wild ${enemy.name} appears!`;
    updateUI();
}
function setupSprites() {
    const playerSprite = document.getElementById('player-sprite');
    playerSprite.innerHTML = `<img src="${ASSETS.playerDefault}" style="width:120px;">`;
    loadEnemy(state.currentEnemyIndex); // Завантажуємо першого ворога
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
    refillHand();
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

    const enemyPercentage = (state.enemyHP / state.enemyMaxHP) * 100;
    document.getElementById('enemy-hp-fill').style.width = Math.max(0, enemyPercentage) + '%';
    document.getElementById('enemy-hp-text').innerText = `${state.enemyHP}/${state.enemyMaxHP}`;

    if (state.enemyHP <= 0) {
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
}

function enemyTurn() {
    log.innerText += " ...Enemy is preparing...";
    
    setTimeout(() => {
        if (state.enemyHP <= 0) return;

        const currentEnemy = ENEMIES[state.currentEnemyIndex];
        const minDamage = 8;
        const maxDamage = 16;
        const damage = Math.floor(Math.random() * (maxDamage - minDamage + 1)) + minDamage;

        triggerAction('enemy', 'attack');
        state.playerHP -= damage;
        
        let message = `Enemy attacks! It dealt ${damage} damage.`;

        // ПЕРЕВІРКА ОСОБЛИВОЇ ЗДІБНОСТІ
        if (currentEnemy.special) {
            const specialMessage = currentEnemy.special(damage);
            if (specialMessage) {
                message += ` ${specialMessage}`;
            }
        }
        
        log.innerText = message;
        
        // Добір карт тут, якщо ви не перенесли його в checkCombo
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