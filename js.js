let deck = [];
const suits = ['♠', '♥', '♦', '♣'];
const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
let playerHand = [];
let dealerHand = [];
let playerScore = 0;
let dealerScore = 0;
let playerBank = loadBank();
let betAmount = 100;

function createDeck() {
    deck = [];
    for (let suit of suits) {
        for (let value of values) {
            deck.push({ suit, value });
        }
    }
    deck = shuffle(deck);
}

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function dealCard(hand) {
    const card = deck.pop();
    hand.push(card);
    return card;
}

function calculateScore(hand) {
    let score = 0;
    let aceCount = 0;
    for (let card of hand) {
        if (card.value === 'J' || card.value === 'Q' || card.value === 'K') {
            score += 10;
        } else if (card.value === 'A') {
            score += 11;
            aceCount++;
        } else {
            score += parseInt(card.value);
        }
    }
    while (score > 21 && aceCount > 0) {
        score -= 10;
        aceCount--;
    }
    return score;
}

function updateScores() {
    playerScore = calculateScore(playerHand);
    dealerScore = calculateScore(dealerHand);
    document.getElementById('player-score').textContent = playerScore;
    document.getElementById('dealer-score').textContent = dealerScore;
}

function displayCard(card, elementId) {
    const cardDiv = document.createElement('div');
    cardDiv.className = 'card';
    cardDiv.textContent = `${card.value}${card.suit}`;
    document.getElementById(elementId).appendChild(cardDiv);
}

function hit() {
    const card = dealCard(playerHand);
    displayCard(card, 'player-cards');
    updateScores();
    checkForEnd();
}

function stand() {
    while (dealerScore < 17) {
        const card = dealCard(dealerHand);
        displayCard(card, 'dealer-cards');
        updateScores();
    }
    checkForEnd();
}

function restart() {
    deck = [];
    playerHand = [];
    dealerHand = [];
    playerScore = 0;
    dealerScore = 0;
    document.getElementById('player-cards').innerHTML = '';
    document.getElementById('dealer-cards').innerHTML = '';
    document.getElementById('message').textContent = '';

    // Получаем и устанавливаем ставку
    betAmount = parseInt(document.getElementById('bet-amount').value);
    if (isNaN(betAmount) || betAmount <= 0) {
        document.getElementById('message').textContent = 'Please enter a valid bet amount!';
        return;
    }
    if (betAmount > playerBank) {
        document.getElementById('message').textContent = 'Bet amount exceeds player bank!';
        return;
    }

    createDeck();
    startGame();
}

function startGame() {
    dealCard(playerHand);
    dealCard(playerHand);
    dealCard(dealerHand);
    dealCard(dealerHand);
    updateScores();
    playerHand.forEach(card => displayCard(card, 'player-cards'));
    dealerHand.forEach(card => displayCard(card, 'dealer-cards'));
    document.getElementById('hit-button').disabled = false;
    document.getElementById('stand-button').disabled = false;
}

function checkForEnd() {
    if (playerScore > 21) {
        document.getElementById('message').textContent = 'Дилер выиграл!';
        playerBank -= betAmount;
        saveBank(playerBank);
        disableButtons();
    } else if (dealerScore > 21) {
        document.getElementById('message').textContent = 'Вы выиграли!';
        playerBank += betAmount;
        saveBank(playerBank);
        disableButtons();
    } else if (playerScore === 21) {
        document.getElementById('message').textContent = 'BlackJack! Победа!!!';
        playerBank += betAmount * 1.5;
        saveBank(playerBank);
        disableButtons();
    } else if (dealerScore === 21) {
        document.getElementById('message').textContent = 'BlackJack! Дилер выиграл!!';
        playerBank -= betAmount;
        saveBank(playerBank);
        disableButtons();
    } else if (dealerScore >= 17 && playerScore <= 21) {
        if (dealerScore > playerScore) {
            document.getElementById('message').textContent = 'Вы проиграли!';
            playerBank -= betAmount;
        } else if (dealerScore < playerScore) {
            document.getElementById('message').textContent = 'Вы выиграли!';
            playerBank += betAmount;
        } else {
            document.getElementById('message').textContent = 'Ничья!';
        }
        saveBank(playerBank);
        disableButtons();
    }
    document.getElementById('player-bank').textContent = playerBank;
}

function disableButtons() {
    document.getElementById('hit-button').disabled = true;
    document.getElementById('stand-button').disabled = true;
}

function saveBank(bank) {
    localStorage.setItem('playerBank', bank);
}

function loadBank() {
    return parseInt(localStorage.getItem('playerBank')) || 19750;
}

document.getElementById('hit-button').addEventListener('click', hit);
document.getElementById('stand-button').addEventListener('click', stand);
document.getElementById('restart-button').addEventListener('click', restart);

document.getElementById('player-bank').textContent = playerBank;

createDeck();
startGame();
