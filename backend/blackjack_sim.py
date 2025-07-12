import random
from game_rules import GameRules

class Card:
    def __init__(self, suit, rank):
        self.suit = suit
        self.rank = rank
        self.value = min(rank, 10) if rank > 1 else 11  # Ace = 11, Face cards = 10

class Deck:
    def __init__(self, num_decks=6):
        self.num_decks = num_decks
        self.cards = []
        self.reset()
        self.shuffle()
        
    def reset(self):
        suits = ['hearts', 'diamonds', 'clubs', 'spades']
        ranks = list(range(1, 14))  # 1=Ace, 11=Jack, 12=Queen, 13=King
        self.cards = []
        for _ in range(self.num_decks):
            for suit in suits:
                for rank in ranks:
                    self.cards.append(Card(suit, rank))
    
    def shuffle(self):
        random.shuffle(self.cards)
    
    def deal_card(self):
        return self.cards.pop() if self.cards else None
    
    def cards_remaining(self):
        return len(self.cards)
    
    def get_running_count(self):
        # Hi-Lo count system
        dealt_cards = (self.num_decks * 52) - len(self.cards)
        if dealt_cards == 0:
            return 0
        
        # Simulate running count based on cards dealt
        # This is simplified - in reality you'd track each card
        count = 0
        for _ in range(dealt_cards):
            card_value = random.randint(1, 13)
            if card_value in [2, 3, 4, 5, 6]:
                count += 1
            elif card_value in [10, 11, 12, 13, 1]:  # 10s and Aces
                count -= 1
        return count
    
    def get_true_count(self):
        decks_remaining = len(self.cards) / 52
        if decks_remaining <= 0:
            return 0
        return self.get_running_count() / decks_remaining

class Hand:
    def __init__(self):
        self.cards = []
        self.is_soft = False
        
    def add_card(self, card):
        self.cards.append(card)
        
    def get_value(self):
        total = 0
        aces = 0
        
        for card in self.cards:
            if card.rank == 1:  # Ace
                aces += 1
                total += 11
            else:
                total += card.value
        
        # Adjust for aces
        while total > 21 and aces > 0:
            total -= 10
            aces -= 1
            
        self.is_soft = (aces > 0)
        return total
    
    def is_blackjack(self):
        return len(self.cards) == 2 and self.get_value() == 21
    
    def is_bust(self):
        return self.get_value() > 21
    
    def can_split(self):
        return len(self.cards) == 2 and self.cards[0].rank == self.cards[1].rank

class BlackjackSim:
    def __init__(self, num_decks=6, penetration=0.75, rules=None):
        self.num_decks = num_decks
        self.penetration = penetration
        self.deck = Deck(num_decks)
        self.reset_deck_threshold = int(num_decks * 52 * (1 - penetration))
        self.rules = rules if rules else GameRules()  # Use default rules if none provided
    
    def play_hand(self, bet):
        # Check if we need to reshuffle
        if self.deck.cards_remaining() <= self.reset_deck_threshold:
            self.deck.reset()
            self.deck.shuffle()
        
        # Deal initial cards
        player_hand = Hand()
        dealer_hand = Hand()
        
        player_hand.add_card(self.deck.deal_card())
        dealer_hand.add_card(self.deck.deal_card())
        player_hand.add_card(self.deck.deal_card())
        dealer_upcard = self.deck.deal_card()
        dealer_hand.add_card(dealer_upcard)
        
        # Check for blackjacks
        player_bj = player_hand.is_blackjack()
        dealer_bj = dealer_hand.is_blackjack()
        
        if player_bj and dealer_bj:
            return {"result": 0, "blackjack": False}  # Push
        elif player_bj:
            return {"result": bet * self.rules.blackjack_payout(), "blackjack": True}  # Configurable blackjack payout
        elif dealer_bj:
            return {"result": -bet, "blackjack": False}
        
        # Player's turn - basic strategy
        total_bet = bet
        hands_to_play = [(player_hand, bet)]
        results = []
        
        for hand, hand_bet in hands_to_play:
            while not hand.is_bust():
                action = self.rules.basic_strategy(hand, dealer_upcard, 
                                           can_double=len(hand.cards)==2,
                                           can_split=len(hands_to_play)==1)
                
                if action == "hit":
                    hand.add_card(self.deck.deal_card())
                elif action == "stand":
                    break
                elif action == "double":
                    hand.add_card(self.deck.deal_card())
                    hand_bet *= 2
                    total_bet += hand_bet - bet
                    break
                elif action == "split":
                    # Split logic (simplified)
                    new_hand = Hand()
                    new_hand.add_card(hand.cards.pop())
                    hand.add_card(self.deck.deal_card())
                    new_hand.add_card(self.deck.deal_card())
                    hands_to_play.append((new_hand, bet))
                    total_bet += bet
                    break
            
            results.append((hand, hand_bet))
        
        # Dealer's turn
        while self.rules.dealer_should_hit(dealer_hand):
            dealer_hand.add_card(self.deck.deal_card())
        
        # Calculate winnings
        total_result = 0
        dealer_value = dealer_hand.get_value()
        dealer_bust = dealer_hand.is_bust()
        
        for hand, hand_bet in results:
            player_value = hand.get_value()
            
            if hand.is_bust():
                total_result -= hand_bet
            elif dealer_bust:
                total_result += hand_bet
            elif player_value > dealer_value:
                total_result += hand_bet
            elif player_value < dealer_value:
                total_result -= hand_bet
            # Push (tie) = 0
        
        return {"result": total_result, "blackjack": False}

def run_sim(req):
    bankroll = req.bankroll
    spread_min = req.spread_min
    spread_max = req.spread_max
    hands = req.hands
    decks = req.decks
    penetration = req.penetration
    
    # Create game rules (use defaults if not specified)
    dealer_hits_soft_17 = getattr(req, 'dealer_hits_soft_17', False)
    blackjack_payout = getattr(req, 'blackjack_payout', 1.5)
    
    rules = GameRules(
        dealer_hits_soft_17=dealer_hits_soft_17,
        blackjack_payout=blackjack_payout
    )

    sim = BlackjackSim(decks, penetration, rules)
    history = [bankroll]
    hands_played = 0
    total_bet = 0
    wins = 0
    losses = 0
    pushes = 0
    blackjacks = 0
    
    for _ in range(hands):
        if bankroll <= 0:
            break
            
        # Get true count for betting decision
        true_count = sim.deck.get_true_count()
        
        # Betting strategy based on true count
        if true_count <= 0:
            bet = spread_min
        elif true_count >= 4:
            bet = spread_max
        else:
            # Linear scaling between min and max
            bet_multiplier = true_count / 4
            bet = int(spread_min + (spread_max - spread_min) * bet_multiplier)
        
        # Don't bet more than bankroll
        bet = min(bet, bankroll)
        
        # Play the hand
        hand_result = sim.play_hand(bet)
        result = hand_result["result"]
        is_blackjack = hand_result["blackjack"]
        
        bankroll += result
        history.append(bankroll)
        
        # Track statistics
        hands_played += 1
        total_bet += bet
        
        if is_blackjack:  # True blackjack
            blackjacks += 1
            wins += 1
        elif result > 0:  # Regular win (including doubles, splits)
            wins += 1
        elif result < 0:  # Loss
            losses += 1
        else:  # Push
            pushes += 1

    ev = (history[-1] - history[0]) / hands_played if hands_played > 0 else 0
    win_rate = wins / hands_played if hands_played > 0 else 0
    
    return {
        "bankroll_history": history,
        "final_bankroll": bankroll,
        "ev_per_hand": round(ev, 2),
        "hands_played": hands_played,
        "win_rate": round(win_rate, 3),
        "wins": wins,
        "losses": losses,
        "pushes": pushes,
        "blackjacks": blackjacks,
        "total_bet": total_bet
    }