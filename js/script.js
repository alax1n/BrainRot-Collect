
/* --- DATABASE --- */
const baseCharacters = [
    { id: "cactufant", name: "Cactufantul Suprem", img: "assets/cactufant.jpg" },
    { id: "shark", name: "Drip Shark", img: "assets/shark.jpg" },
    { id: "croco", name: "Croco-Bomber", img: "assets/croco.jpg" },
    { id: "batul", name: "Bățul de Pază", img: "assets/batul.jpg" },
    { id: "tree", name: "Arborele Nasos", img: "assets/tree.jpg" }
];

const rarities = ["common", "rare", "epic", "legendary"];
const allCards = [];

// Generate all card variants (4 rarities per character)
baseCharacters.forEach(char => {
    rarities.forEach(rarity => {
        allCards.push({
            id: `${char.id}_${rarity}`,
            baseId: char.id,
            name: char.name,
            rarity: rarity,
            img: char.img,
            rankIndex: rarities.indexOf(rarity)
        });
    });
});

let user = {
    gold: 1000,
    gems: 50,
    collection: {} // format: { "tree_common": 5, "shark_rare": 1 }
};

/* --- LOGICA PRINCIPALĂ --- */
function updateResources() {
    const goldEl = document.getElementById('gold-display');
    const gemsEl = document.getElementById('gems-display');

    if(goldEl.innerText != user.gold) {
        goldEl.innerText = user.gold;
        goldEl.parentElement.classList.add('res-pop');
        setTimeout(() => goldEl.parentElement.classList.remove('res-pop'), 200);
    }

    gemsEl.innerText = user.gems;
}

function addGold() {
    user.gold += 1;
    updateResources();
}

function showSection(sectionName) {
    const content = document.getElementById('main-content');
    document.querySelectorAll('nav button').forEach(btn => btn.classList.remove('active'));
    document.getElementById('btn-' + sectionName).classList.add('active');

    if (sectionName === 'shop') renderShop(content);
    else if (sectionName === 'chest') renderChest(content);
    else if (sectionName === 'collection') renderCollection(content);
    else if (sectionName === 'juicer') renderJuicer(content);
}

/* --- CHEST & ANIMAȚII --- */
function renderChest(container) {
    container.innerHTML = `
        <div class="chest-scene">
            <div id="chest-visual" class="chest-idle" onclick="startChestOpening()">📦</div>
            <h3 id="chest-status" style="color:#ccc; margin-bottom: 30px;">Deschide pentru a câștiga!</h3>
            <button id="btn-open-chest" class="chest-btn" onclick="startChestOpening()">
                DESCHIDE (100 💰)
            </button>
        </div>
    `;
}

function startChestOpening() {
    const cost = 100;
    const chestVisual = document.getElementById('chest-visual');
    const btn = document.getElementById('btn-open-chest');

    if (btn && btn.disabled) return;

    if (user.gold >= cost) {
        user.gold -= cost;
        updateResources();

        if(btn) {
            btn.disabled = true;
            btn.innerText = "DESCHIDERE...";
        }

        chestVisual.classList.remove('chest-idle');
        chestVisual.classList.add('is-shaking');

        setTimeout(() => {
            chestVisual.classList.remove('is-shaking');
            chestVisual.classList.add('is-popping');

            triggerFlash();
            triggerScreenShake();
            createParticles(window.innerWidth / 2, window.innerHeight / 2 - 50);

            setTimeout(() => {
                // DROP LOGIC
                const droppedCard = getRandomCardDrop();

                // Add to collection
                if (!user.collection[droppedCard.id]) user.collection[droppedCard.id] = 0;
                user.collection[droppedCard.id]++;

                showPopup(droppedCard);

                chestVisual.classList.remove('is-popping');
                chestVisual.classList.add('chest-idle');
                if(btn) {
                    btn.disabled = false;
                    btn.innerText = "DESCHIDE (100 💰)";
                }

            }, 400);

        }, 1000);

    } else {
        if(btn) {
            btn.style.animation = "shake 0.3s";
            setTimeout(() => btn.style.animation = "", 300);
        }
        alert("Nu ai destul Gold! (Click pe Gold sus pentru a primi 1)");
    }
}

function getRandomCardDrop() {
    const rand = Math.random() * 100;
    let rarity = 'common';
    if (rand < 1) rarity = 'legendary';
    else if (rand < 5) rarity = 'epic';
    else if (rand < 30) rarity = 'rare';

    // Filter cards by rarity
    const pool = allCards.filter(c => c.rarity === rarity);
    return pool[Math.floor(Math.random() * pool.length)];
}

/* --- JUICY EFFECTS --- */
function triggerFlash() {
    const flash = document.getElementById('flash-overlay');
    flash.style.opacity = '1';
    setTimeout(() => { flash.style.opacity = '0'; }, 100);
}

function triggerScreenShake() {
    const app = document.getElementById('app-container');
    app.classList.remove('shake-screen');
    void app.offsetWidth;
    app.classList.add('shake-screen');
}

function createParticles(x, y) {
    const colors = ['#ffcc00', '#ff0055', '#00ffcc', '#ffffff', '#ffaa00'];
    const particleCount = 60;
    const container = document.getElementById('app-container');

    const rect = container.getBoundingClientRect();
    const relX = rect.width / 2;
    const relY = rect.height / 2 - 100;

    for (let i = 0; i < particleCount; i++) {
        const p = document.createElement('div');
        p.classList.add('particle');
        container.appendChild(p);

        const color = colors[Math.floor(Math.random() * colors.length)];
        p.style.backgroundColor = color;
        p.style.left = relX + 'px';
        p.style.top = relY + 'px';

        const angle = Math.random() * Math.PI * 2;
        const velocity = Math.random() * 8 + 4;
        let vx = Math.cos(angle) * velocity;
        let vy = Math.sin(angle) * velocity;

        let posX = relX;
        let posY = relY;
        let opacity = 1;
        let size = Math.random() * 8 + 4;

        const anim = setInterval(() => {
            posX += vx;
            posY += vy;
            vy += 0.2;
            opacity -= 0.015;

            p.style.left = posX + 'px';
            p.style.top = posY + 'px';
            p.style.opacity = opacity;
            p.style.width = size + 'px';
            p.style.height = size + 'px';

            if (opacity <= 0) {
                clearInterval(anim);
                p.remove();
            }
        }, 16);
    }
}

function showPopup(card) {
    const popup = document.getElementById('popup');
    const popupContent = document.getElementById('popup-content');
    const imgElement = document.getElementById('popup-img');
    const title = document.getElementById('popup-title');

    popupContent.style.animation = 'none';
    popupContent.offsetHeight;
    popupContent.style.animation = null;

    imgElement.src = card.img;
    document.getElementById('popup-name').innerText = card.name;

    title.innerText = card.rarity.toUpperCase();

    let color = "white";
    let shadow = "30px white";

    if (card.rarity === 'legendary') {
        color = "#ffaa00"; shadow = "80px #ffaa00";
        createParticles(0,0);
    } else if (card.rarity === 'epic') {
        color = "#9d00ff"; shadow = "60px #9d00ff";
    } else if (card.rarity === 'rare') {
        color = "#00aaff"; shadow = "50px #00aaff";
    }

    title.style.color = color;
    imgElement.style.borderColor = color;
    imgElement.style.boxShadow = `0 0 ${shadow}`;

    popup.style.display = 'flex';
}

function closePopup() {
    document.getElementById('popup').style.display = 'none';
}

/* --- RENDERIZARE COLECȚIE --- */
function renderCollection(container) {
    // Only show cards we own at least 1 of
    const ownedIds = Object.keys(user.collection).filter(id => user.collection[id] > 0);

    // Sort by rarity (Legendary -> Common)
    const sortedIds = ownedIds.sort((a,b) => {
        const cardA = allCards.find(c => c.id === a);
        const cardB = allCards.find(c => c.id === b);
        return cardB.rankIndex - cardA.rankIndex;
    });

    if (sortedIds.length === 0) {
        container.innerHTML = '<div style="margin-top:50px; color:#777;">Colecție goală... Deschide cufere!</div>';
        return;
    }

    let html = '<div class="card-grid">';
    sortedIds.forEach(id => {
        const card = allCards.find(c => c.id === id);
        const count = user.collection[id];

        html += `
            <div class="card">
                <div class="count-badge">${count}</div>
                <img src="${card.img}" alt="${card.name}">
                <div style="padding:5px;">
                    <div class="rarity ${card.rarity}">${card.rarity}</div>
                    <h3>${card.name}</h3>
                </div>
            </div>
        `;
    });
    html += '</div>';
    container.innerHTML = html;
}

/* --- JUICER LOGIC --- */
function renderJuicer(container) {
    const mergeableIds = Object.keys(user.collection).filter(id => {
        const card = allCards.find(c => c.id === id);
        // Can merge if count >= 5 AND not legendary (max rank)
        return user.collection[id] >= 5 && card.rarity !== 'legendary';
    });

    if (mergeableIds.length === 0) {
        container.innerHTML = `
            <h2>The Juicer 🥤</h2>
            <p style="color:#aaa;">Ai nevoie de 5 duplicate pentru a face un upgrade!</p>
            <div style="font-size: 50px; margin-top:20px;">🤷‍♂️</div>
        `;
        return;
    }

    let html = '<h2>Merge 5 -> 1 Next Rank</h2><div class="card-grid">';
    mergeableIds.forEach(id => {
        const card = allCards.find(c => c.id === id);
        const count = user.collection[id];

        html += `
            <div class="card">
                <div class="count-badge">${count}</div>
                <img src="${card.img}" alt="${card.name}">
                <div style="padding:5px;">
                    <div class="rarity ${card.rarity}">${card.rarity}</div>
                    <h3>${card.name}</h3>
                    <button class="juicer-btn" onclick="mergeCards('${id}')">MERGE (5)</button>
                </div>
            </div>
        `;
    });
    html += '</div>';
    container.innerHTML = html;
}

function mergeCards(cardId) {
    const card = allCards.find(c => c.id === cardId);
    if (!card || user.collection[cardId] < 5) return;

    // Remove 5
    user.collection[cardId] -= 5;

    // Find next rank
    const nextRankIndex = card.rankIndex + 1;
    const nextRankRarity = rarities[nextRankIndex];
    const nextCardId = `${card.baseId}_${nextRankRarity}`;

    // Add 1 next rank
    if (!user.collection[nextCardId]) user.collection[nextCardId] = 0;
    user.collection[nextCardId]++;

    // Visual feedback
    triggerFlash();
    triggerScreenShake();

    // Show popup of new card
    const newCard = allCards.find(c => c.id === nextCardId);
    showPopup(newCard);

    // Refresh UI
    showSection('juicer');
}

function renderShop(c){ c.innerHTML = '<h2>Shop (WIP)</h2>'; }

// Init
updateResources();
showSection('chest');
