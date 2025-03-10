// Game UI Elements
const gameContainers = {
    slots: createGameContainer('slots'),
    blackjack: createGameContainer('blackjack'),
    roulette: createGameContainer('roulette')
};

// Create game-specific UI containers
function createGameContainer(gameType) {
    const container = document.createElement('div');
    container.id = `${gameType}-container`;
    container.classList.add('game-container', 'hidden');

    const controls = document.createElement('div');
    controls.classList.add('game-controls');

    const betInput = document.createElement('input');
    betInput.type = 'number';
    betInput.min = '1';
    betInput.value = '10';
    betInput.placeholder = 'Enter bet amount';

    controls.appendChild(betInput);
    container.appendChild(controls);

    document.querySelector('.main-content').appendChild(container);
    return container;
}

// Show active game container
function showGameContainer(gameType) {
    Object.values(gameContainers).forEach(container => {
        container.classList.add('hidden');
    });
    gameContainers[gameType].classList.remove('hidden');
}

// Update game display
function updateGameDisplay(gameType, content) {
    const container = gameContainers[gameType];
    const displayArea = container.querySelector('.game-display') || 
        (() => {
            const display = document.createElement('div');
            display.classList.add('game-display');
            container.insertBefore(display, container.querySelector('.game-controls'));
            return display;
        })();

    displayArea.innerHTML = content;
}

// Initialize game event listeners
document.querySelectorAll('.play-btn').forEach(button => {
    button.addEventListener('click', (e) => {
        const gameType = e.target.parentElement.id;
        const betInput = gameContainers[gameType].querySelector('input');
        currentBet = parseInt(betInput.value);

        if (isNaN(currentBet) || currentBet <= 0) {
            alert('Please enter a valid bet amount');
            return;
        }

        showGameContainer(gameType);

        switch (gameType) {
            case 'slots':
                handleSlotsGame();
                break;
            case 'blackjack':
                handleBlackjackGame();
                break;
            case 'roulette':
                handleRouletteGame();
                break;
        }
    });
});

// Game handlers
function handleSlotsGame() {
    const result = slots.spin();
    updateGameDisplay('slots', `
        <div class="slots-result">
            <div class="slots-symbols">${result.result.join(' ')}</div>
            <div class="slots-outcome">
                ${result.winnings > 0 ? 
                    `You won $${result.winnings}!` : 
                    'Try again!'}
            </div>
        </div>
    `);
}

function handleBlackjackGame() {
    const gameState = blackjack.dealInitialCards();
    const container = gameContainers.blackjack;

    // Create action buttons if they don't exist
    if (!container.querySelector('.blackjack-actions')) {
        const actions = document.createElement('div');
        actions.classList.add('blackjack-actions');
        actions.innerHTML = `
            <button id="hit-btn">Hit</button>
            <button id="stand-btn">Stand</button>
        `;
        container.querySelector('.game-controls').appendChild(actions);

        // Add event listeners for blackjack actions
        document.getElementById('hit-btn').addEventListener('click', () => {
            const hitResult = blackjack.hit();
            if (hitResult.bust) {
                updateBlackjackDisplay(hitResult.hand, blackjack.dealerHand, 'Bust!');
            } else {
                updateBlackjackDisplay(hitResult.hand, blackjack.dealerHand);
            }
        });

        document.getElementById('stand-btn').addEventListener('click', () => {
            const standResult = blackjack.stand();
            updateBlackjackDisplay(
                standResult.playerHand, 
                standResult.dealerHand, 
                `Game Over - You ${standResult.result}!`
            );
        });
    }

    updateBlackjackDisplay(gameState.player, gameState.dealer);
}

function updateBlackjackDisplay(playerHand, dealerHand, message = '') {
    updateGameDisplay('blackjack', `
        <div class="blackjack-table">
            <div class="dealer-hand">
                <h3>Dealer's Hand</h3>
                <div class="cards">${dealerHand.map(card => 
                    `<div class="card">${card.value}${card.suit}</div>`).join('')}</div>
            </div>
            <div class="player-hand">
                <h3>Your Hand</h3>
                <div class="cards">${playerHand.map(card => 
                    `<div class="card">${card.value}${card.suit}</div>`).join('')}</div>
            </div>
            ${message ? `<div class="message">${message}</div>` : ''}
        </div>
    `);
}

function handleRouletteGame() {
    const container = gameContainers.roulette;

    // Create betting options if they don't exist
    if (!container.querySelector('.roulette-bets')) {
        const bets = document.createElement('div');
        bets.classList.add('roulette-bets');
        bets.innerHTML = `
            <button data-bet="red">Red</button>
            <button data-bet="black">Black</button>
            <button data-bet="even">Even</button>
            <button data-bet="odd">Odd</button>
            <input type="number" id="number-bet" min="0" max="36" placeholder="Number (0-36)">
        `;
        container.querySelector('.game-controls').appendChild(bets);

        // Add event listeners for roulette bets
        bets.querySelectorAll('button').forEach(button => {
            button.addEventListener('click', () => {
                const result = roulette.spin(button.dataset.bet);
                updateRouletteDisplay(result);
            });
        });

        document.getElementById('number-bet').addEventListener('change', (e) => {
            const number = parseInt(e.target.value);
            if (number >= 0 && number <= 36) {
                const result = roulette.spin('number', number);
                updateRouletteDisplay(result);
            }
        });
    }

    updateRouletteDisplay({ result: null, winnings: 0 });
}

function updateRouletteDisplay(result) {
    if (!result.result) {
        updateGameDisplay('roulette', `
            <div class="roulette-wheel">
                <div class="message">Place your bet!</div>
            </div>
        `);
        return;
    }

    updateGameDisplay('roulette', `
        <div class="roulette-wheel">
            <div class="result">${result.result}</div>
            <div class="message">
                ${result.winnings > 0 ? 
                    `You won $${result.winnings}!` : 
                    'Try again!'}
            </div>
        </div>
    `);
}