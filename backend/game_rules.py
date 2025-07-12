class GameRules:
    """Blackjack game rules and basic strategy logic"""
    
    def __init__(self, 
                 dealer_hits_soft_17=False,
                 blackjack_payout=1.5,
                 double_after_split=True,
                 resplit_aces=False,
                 surrender_allowed=False,
                 max_splits=3):
        """
        Initialize game rules
        
        Args:
            dealer_hits_soft_17: Whether dealer hits on soft 17 (S17 vs H17)
            blackjack_payout: Payout for blackjack (1.5 for 3:2, 1.2 for 6:5)
            double_after_split: Whether doubling after split is allowed
            resplit_aces: Whether aces can be resplit
            surrender_allowed: Whether late surrender is allowed
            max_splits: Maximum number of splits allowed per hand
        """
        self.dealer_hits_soft_17 = dealer_hits_soft_17
        self.blackjack_payout_rate = blackjack_payout
        self.double_after_split = double_after_split
        self.resplit_aces = resplit_aces
        self.surrender_allowed = surrender_allowed
        self.max_splits = max_splits
    
    def basic_strategy(self, player_hand, dealer_upcard, can_double=True, can_split=True):
        """
        Returns the optimal basic strategy decision for a given hand
        
        Args:
            player_hand: Hand object representing player's cards
            dealer_upcard: Card object representing dealer's up card
            can_double: Whether doubling down is allowed
            can_split: Whether splitting is allowed
            
        Returns:
            str: One of "hit", "stand", "double", "split"
        """
        player_value = player_hand.get_value()
        dealer_value = dealer_upcard.value if dealer_upcard.rank != 1 else 11
        
        # Pair splitting
        if can_split and player_hand.can_split():
            player_rank = player_hand.cards[0].rank
            if player_rank == 1:  # Aces
                return "split"
            elif player_rank == 8:  # 8s
                return "split"
            elif player_rank in [2, 3, 7] and dealer_value <= 7:
                return "split"
            elif player_rank == 6 and dealer_value <= 6:
                return "split"
            elif player_rank == 9 and dealer_value not in [7, 10, 11]:
                return "split"
        
        # Soft hands (with Ace)
        if player_hand.is_soft:
            if player_value >= 19:
                return "stand"
            elif player_value == 18:
                if dealer_value <= 6:
                    return "double" if can_double else "stand"
                elif dealer_value in [7, 8]:
                    return "stand"
                else:
                    return "hit"
            elif player_value == 17:
                return "double" if can_double and dealer_value <= 6 else "hit"
            elif player_value in [15, 16]:
                return "double" if can_double and dealer_value in [4, 5, 6] else "hit"
            elif player_value in [13, 14]:
                return "double" if can_double and dealer_value in [5, 6] else "hit"
            else:
                return "hit"
        
        # Hard hands
        if player_value >= 17:
            return "stand"
        elif player_value in [13, 14, 15, 16]:
            return "stand" if dealer_value <= 6 else "hit"
        elif player_value == 12:
            return "stand" if dealer_value in [4, 5, 6] else "hit"
        elif player_value == 11:
            return "double" if can_double else "hit"
        elif player_value == 10:
            return "double" if can_double and dealer_value <= 9 else "hit"
        elif player_value == 9:
            return "double" if can_double and dealer_value in [3, 4, 5, 6] else "hit"
        else:
            return "hit"
    
    def dealer_should_hit(self, dealer_hand):
        """
        Determines if dealer should hit based on configurable casino rules
        
        Args:
            dealer_hand: Hand object representing dealer's cards
            
        Returns:
            bool: True if dealer should hit, False if dealer should stand
        """
        dealer_value = dealer_hand.get_value()
        
        # Basic rule: dealer hits on 16 and below
        if dealer_value < 17:
            return True
        
        # Rule variation: dealer hits soft 17 (H17) vs stands on soft 17 (S17)
        if dealer_value == 17 and dealer_hand.is_soft and self.dealer_hits_soft_17:
            return True
            
        return False
    
    def blackjack_payout(self):
        """Returns the payout multiplier for blackjack"""
        return self.blackjack_payout_rate
    
    def calculate_hand_result(self, player_hand, dealer_hand, bet, is_blackjack=False):
        """
        Calculate the result of a single hand
        
        Args:
            player_hand: Hand object
            dealer_hand: Hand object  
            bet: int - amount bet on this hand
            is_blackjack: bool - whether this was a natural blackjack
            
        Returns:
            int: positive for win, negative for loss, 0 for push
        """
        player_value = player_hand.get_value()
        dealer_value = dealer_hand.get_value()
        
        # Player bust always loses
        if player_hand.is_bust():
            return -bet
        
        # Dealer bust, player wins
        if dealer_hand.is_bust():
            if is_blackjack:
                return int(bet * self.blackjack_payout())
            return bet
        
        # Both standing, compare values
        if player_value > dealer_value:
            if is_blackjack:
                return int(bet * self.blackjack_payout())
            return bet
        elif player_value < dealer_value:
            return -bet
        else:
            return 0  # Push
