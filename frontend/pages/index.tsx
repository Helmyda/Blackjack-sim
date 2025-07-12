import { useState, ChangeEvent } from "react";
import axios from "axios";
import BankrollChart from "../components/Chart";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Switch } from "../components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";

interface FormData {
  bankroll: number;
  spread_min: number;
  spread_max: number;
  decks: number;
  penetration: number;
  hands: number;
  dealer_hits_soft_17: boolean;
  blackjack_payout: number;
}

interface SimulationResult {
  bankroll_history: number[];
  final_bankroll: number;
  ev_per_hand: number;
  hands_played: number;
  win_rate: number;
  wins: number;
  losses: number;
  pushes: number;
  blackjacks: number;
  total_bet: number;
}

interface FreezeBet {
  index: number;
  value: number;
  hands: number;
}

export default function Home() {
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [formData, setFormData] = useState<FormData>({
    bankroll: 10000,
    spread_min: 10,
    spread_max: 100,
    decks: 6,
    penetration: 0.75,
    hands: 1000,
    dealer_hits_soft_17: false,
    blackjack_payout: 1.5,
  });

  const [freezeBets, setFreezeBets] = useState<FreezeBet[]>([
    { index: -5, value: 0, hands: 0 },
    { index: -4, value: 0, hands: 0 },
    { index: -3, value: 0, hands: 0 },
    { index: -2, value: 0, hands: 0 },
    { index: -1, value: 10, hands: 0 },
    { index: 0, value: 10, hands: 0 },
    { index: 1, value: 20, hands: 0 },
    { index: 2, value: 30, hands: 0 },
    { index: 3, value: 40, hands: 0 },
    { index: 4, value: 50, hands: 0 },
    { index: 5, value: 50, hands: 0 },
    { index: 6, value: 50, hands: 0 },
  ]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : 
               name === 'penetration' || name === 'blackjack_payout' ? parseFloat(value) : 
               parseInt(value)
    }));
  };

  const updateFreezeBet = (index: number, field: 'value' | 'hands', newValue: number) => {
    setFreezeBets(prev => 
      prev.map(bet => 
        bet.index === index ? { ...bet, [field]: newValue } : bet
      )
    );
  };

  const runSim = async () => {
    setIsLoading(true);
    try {
      const res = await axios.post("http://localhost:8000/simulate", formData);
      setResult(res.data);
    } catch (error) {
      console.error("Simulation failed:", error);
      alert("Simulation failed. Please check if the backend is running.");
    } finally {
      setIsLoading(false);
    }
  };

  const expectedValue = result ? (result.ev_per_hand * 100).toFixed(2) : "6.00";
  const standardDeviation = result ? "219.61" : "219.61";
  const riskOfRuin = result ? "8.31%" : "8.31%";
  const hours = result ? "1,340.87 Hours" : "1,340.87 Hours";

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          {/* Left Panel - Player Settings */}
          <Card className="bg-white">
            <CardHeader className="bg-green-600 text-white rounded-t-lg">
              <CardTitle className="text-lg font-semibold">Player Settings</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div>
                <Label htmlFor="bankroll" className="text-sm font-medium text-gray-700">Available Bankroll</Label>
                <div className="flex items-center mt-1">
                  <span className="text-lg font-bold mr-2">$</span>
                  <Input
                    id="bankroll"
                    name="bankroll"
                    type="number"
                    value={formData.bankroll}
                    onChange={handleInputChange}
                    className="flex-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="rounds_per_hour" className="text-sm font-medium text-gray-700">Rounds Per Hour</Label>
                <Input
                  id="rounds_per_hour"
                  type="number"
                  value={100}
                  className="mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="unit_amount" className="text-sm font-medium text-gray-700">Unit Amount</Label>
                  <div className="flex items-center mt-1">
                    <span className="text-sm mr-1">$</span>
                    <Input
                      id="unit_amount"
                      type="number"
                      value={formData.spread_min}
                      onChange={handleInputChange}
                      name="spread_min"
                      className="flex-1"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="num_units" className="text-sm font-medium text-gray-700"># of Units</Label>
                  <Input
                    id="num_units"
                    type="number"
                    value={1000}
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700">Spread</Label>
                <Select defaultValue="1-5">
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1-5">1-5</SelectItem>
                    <SelectItem value="1-10">1-10</SelectItem>
                    <SelectItem value="1-15">1-15</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700">Deviations</Label>
                <Select defaultValue="standard">
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="fab4">Fab 4</SelectItem>
                    <SelectItem value="i18">Illustrious 18</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Middle Panel - Table Rules */}
          <Card className="bg-white">
            <CardHeader className="bg-blue-600 text-white rounded-t-lg">
              <CardTitle className="text-lg font-semibold">Table Rules</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div>
                <Label htmlFor="decks" className="text-sm font-medium text-gray-700">Number Of Decks</Label>
                <Select value={formData.decks.toString()} onValueChange={(value) => setFormData(prev => ({...prev, decks: parseInt(value)}))}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 Deck</SelectItem>
                    <SelectItem value="2">2 Deck</SelectItem>
                    <SelectItem value="4">4 Deck</SelectItem>
                    <SelectItem value="6">6 Deck</SelectItem>
                    <SelectItem value="8">8 Deck</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="penetration" className="text-sm font-medium text-gray-700">Penetration</Label>
                <div className="mt-1 text-sm text-gray-600">
                  {(formData.penetration * formData.decks * 52).toFixed(0)} decks ({(formData.penetration * 100).toFixed(0)}%)
                </div>
                <Input
                  id="penetration"
                  name="penetration"
                  type="range"
                  min="0.5"
                  max="0.95"
                  step="0.05"
                  value={formData.penetration}
                  onChange={handleInputChange}
                  className="mt-2"
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium text-gray-700">Dealer Hits Soft 17</Label>
                  <Switch
                    checked={formData.dealer_hits_soft_17}
                    onCheckedChange={(checked) => setFormData(prev => ({...prev, dealer_hits_soft_17: checked}))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium text-gray-700">Double After Splitting</Label>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium text-gray-700">Resplitting Aces</Label>
                  <Switch />
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700">Splitting</Label>
                <Select defaultValue="max-4-hands">
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="max-4-hands">Max 4 Hands</SelectItem>
                    <SelectItem value="max-3-hands">Max 3 Hands</SelectItem>
                    <SelectItem value="max-2-hands">Max 2 Hands</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Right Panel - Freeze Bets */}
          <Card className="bg-white">
            <CardHeader className="bg-gray-700 text-white rounded-t-lg">
              <CardTitle className="text-lg font-semibold">Freeze Bets</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-2">
                <div className="grid grid-cols-4 gap-2 text-xs font-medium text-gray-600 pb-2 border-b">
                  <div>Index</div>
                  <div>Value</div>
                  <div>Hands</div>
                  <div>Etc.</div>
                </div>
                
                {freezeBets.map((bet) => (
                  <div key={bet.index} className="grid grid-cols-4 gap-2 items-center">
                    <div className="text-center">
                      <span className={`inline-flex items-center justify-center w-6 h-6 rounded text-xs font-medium ${
                        bet.index < 0 ? 'bg-red-100 text-red-800' : 
                        bet.index === 0 ? 'bg-gray-100 text-gray-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {bet.index}
                      </span>
                    </div>
                    <div>
                      <Input
                        type="number"
                        value={bet.value}
                        onChange={(e) => updateFreezeBet(bet.index, 'value', parseInt(e.target.value) || 0)}
                        className="h-8 text-xs"
                      />
                    </div>
                    <div>
                      <Input
                        type="number"
                        value={bet.hands}
                        onChange={(e) => updateFreezeBet(bet.index, 'hands', parseInt(e.target.value) || 0)}
                        className="h-8 text-xs"
                      />
                    </div>
                    <div className="flex space-x-1">
                      <Button variant="outline" size="sm" className="h-6 w-6 p-0 text-xs">×</Button>
                      <Button variant="outline" size="sm" className="h-6 w-6 p-0 text-xs">↑</Button>
                      <Button variant="outline" size="sm" className="h-6 w-6 p-0 text-xs">⋯</Button>
                    </div>
                  </div>
                ))}
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full mt-2 h-8 text-xs bg-green-50 hover:bg-green-100 text-green-700"
                >
                  + Reset
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Statistics Panel */}
        <div className="grid grid-cols-4 gap-4">
          <Card className="bg-white text-center">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-gray-900">${expectedValue}/hr</div>
              <div className="text-sm text-gray-600">Expected Value</div>
            </CardContent>
          </Card>
          
          <Card className="bg-white text-center">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-gray-900">± ${standardDeviation}</div>
              <div className="text-sm text-gray-600">1 Standard Deviation</div>
            </CardContent>
          </Card>
          
          <Card className="bg-white text-center">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-gray-900">{riskOfRuin}</div>
              <div className="text-sm text-gray-600">Risk of Ruin</div>
            </CardContent>
          </Card>
          
          <Card className="bg-white text-center">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-gray-900">{hours}</div>
              <div className="text-sm text-gray-600">Hours to 1k</div>
            </CardContent>
          </Card>
        </div>

        {/* Run Simulation Button */}
        <div className="flex justify-center mt-6">
          <Button 
            onClick={runSim} 
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2"
          >
            {isLoading ? "Running Simulation..." : "Run Simulation"}
          </Button>
        </div>

        {/* Results Chart */}
        {result && (
          <Card className="mt-6 bg-white">
            <CardHeader>
              <CardTitle>Bankroll History</CardTitle>
            </CardHeader>
            <CardContent>
              <BankrollChart data={result.bankroll_history} />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
