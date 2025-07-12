from fastapi import FastAPI
from pydantic import BaseModel
from blackjack_sim import run_sim
from fastapi.middleware.cors import CORSMiddleware 

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # use ["http://localhost:3000"] in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
class SimRequest(BaseModel):
    bankroll: int
    spread_min: int
    spread_max: int
    decks: int
    penetration: float
    hands: int
    # Optional rule parameters
    dealer_hits_soft_17: bool = False  # S17 vs H17
    blackjack_payout: float = 1.5      # 3:2 vs 6:5

@app.post("/simulate")
def simulate(req: SimRequest):
    result = run_sim(req)
    return result