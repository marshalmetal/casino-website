// Game state management
let currentGame = null;
let currentBet = 0;

// Common game functions
function updateBalance(amount) {
    const userId = auth.currentUser.uid;
    const userRef = database.ref('users/' + userId);
    
    return userRef.transaction(userData => {
        if (userData) {
            userData.balance = (userData.balance || 0) + amount;
            document.getElementById('user-balance').textContent = `Balance: $${userData.balance}`;
            return userData;
        }
        return null;
    });
}

// Slots Game
class SlotsGame {
    constructor() {
        this.symbols = ['🍒', '🍊', '🍋', '💎', '7️⃣', '🎰'];
        this.reels = 3;
        this.spinning = false;
    }

    spin() {
        if (this.spinning) return;
        this.spinning = true;

        const result = [];
        for (let i = 0; i < this.reels; i++) {
            const randomIndex = Math.floor(Math.random() * this.symbols.length);
            result.push(this.symbols[randomIndex]);
        }

        // Calculate winnings
        let winnings = 0;
        if (result.every(symbol => symbol === result[0])) {
            winnings = currentBet * 5; // 5x for all matching
        } else if (result[0] === result[1] || result[1] === result[2]) {
            winnings = currentBet * 2; // 2x for two matching
        }

        updateBalance(winnings - currentBet);
        this.spinning = false;
        return { result, winnings };
    }
}

// Blackjack Game
class BlackjackGame {
    constructor() {
        this.deck = this.createDeck();
        this.playerHand = [];
        this.dealerHand = [];
        this.gameInProgress = false;
    }

    createDeck() {
        const suits = ['♠', '♣', '♥', '♦'];
        const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
        const deck = [];

        for (let suit of suits) {
            for (let value of values) {
                deck.push({ suit, value });
            }
        }

        return this.shuffle(deck);
    }

    shuffle(deck) {
        for (let i = deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [deck[i], deck[j]] = [deck[j], deck[i]];
        }
        return deck;
    }

    calculateHand(hand) {
        let total = 0;
        let aces = 0;

        for (let card of hand) {
            if (card.value === 'A') {
                aces++;
                total += 11;
            } else if (['K', 'Q', 'J'].includes(card.value)) {
                total += 10;
            } else {
                total += parseInt(card.value);
            }
        }

        while (total > 21 && aces > 0) {
            total -= 10;
            aces--;
        }

        return total;
    }

    dealInitialCards() {
        this.playerHand = [this.deck.pop(), this.deck.pop()];
        this.dealerHand = [this.deck.pop(), this.deck.pop()];
        this.gameInProgress = true;
        return {
            player: this.playerHand,
            dealer: [this.dealerHand[0], { value: '?', suit: '?' }]
        };
    }

    hit() {
        if (!this.gameInProgress) return null;
        
        this.playerHand.push(this.deck.pop());
        const total = this.calculateHand(this.playerHand);

        if (total > 21) {
            this.gameInProgress = false;
            updateBalance(-currentBet);
            return { bust: true, hand: this.playerHand };
        }

        return { bust: false, hand: this.playerHand };
    }

    stand() {
        if (!this.gameInProgress) return null;

        while (this.calculateHand(this.dealerHand) < 17) {
            this.dealerHand.push(this.deck.pop());
        }

        const playerTotal = this.calculateHand(this.playerHand);
        const dealerTotal = this.calculateHand(this.dealerHand);

        this.gameInProgress = false;

        let result;
        if (dealerTotal > 21 || playerTotal > dealerTotal) {
            result = 'win';
            updateBalance(currentBet * 2);
        } else if (playerTotal === dealerTotal) {
            result = 'push';
            updateBalance(currentBet);
        } else {
            result = 'lose';
            updateBalance(-currentBet);
        }

        return {
            result,
            playerHand: this.playerHand,
            dealerHand: this.dealerHand
        };
    }
}

// Roulette Game
class RouletteGame {
    constructor() {
        this.numbers = Array.from({ length: 37 }, (_, i) => i); // 0-36
        this.spinning = false;
    }

    spin(betType, betNumber) {
        if (this.spinning) return;
        this.spinning = true;

        const result = this.numbers[Math.floor(Math.random() * this.numbers.length)];
        let winnings = 0;

        switch (betType) {
            case 'number':
                if (result === betNumber) {
                    winnings = currentBet * 35;
                }
                break;
            case 'even':
                if (result !== 0 && result % 2 === 0) {
                    winnings = currentBet * 2;
                }
                break;
            case 'odd':
                if (result !== 0 && result % 2 === 1) {
                    winnings = currentBet * 2;
                }
                break;
            case 'red':
                if ([1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36].includes(result)) {
                    winnings = currentBet * 2;
                }
                break;
            case 'black':
                if ([2,4,6,8,10,11,13,15,17,20,22,24,26,28,29,31,33,35].includes(result)) {
                    winnings = currentBet * 2;
                }
                break;
        }

        updateBalance(winnings - currentBet);
        this.spinning = false;
        return { result, winnings };
    }
}

// Initialize games
const slots = new SlotsGame();
const blackjack = new BlackjackGame();
const roulette = new RouletteGame();

// Event listeners for game buttons
document.querySelectorAll('.play-btn').forEach(button => {
    button.addEventListener('click', (e) => {
        const gameId = e.target.parentElement.id;
        currentGame = gameId;
        currentBet = 10; // Default bet amount

        // Initialize selected game
        switch (gameId) {
            case 'slots':
                const slotsResult = slots.spin();
                console.log('Slots result:', slotsResult);
                break;
            case 'blackjack':
                const blackjackGame = blackjack.dealInitialCards();
                console.log('Blackjack initial deal:', blackjackGame);
                break;
            case 'roulette':
                const rouletteResult = roulette.spin('red');
                console.log('Roulette result:', rouletteResult);
                break;
        }
    });
});