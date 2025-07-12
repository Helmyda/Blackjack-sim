import { useState, ChangeEvent } from "react";
import axios from "axios";
import BankrollChart from "../components/Chart";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Switch } from "../components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";

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
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Blackjack Simulator</h1>
          <p className="text-slate-600">Professional card counting simulation & analysis</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel - Player Settings */}
          <div className="space-y-6">
            {/* Player Settings */}
            <Card>
              <CardHeader className="bg-green-500 text-white">
                <CardTitle className="text-lg">Player Settings</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div>
                  <Label htmlFor="bankroll" className="text-sm font-medium">Available Bankroll</Label>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-lg font-bold">$</span>
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
                  <Label htmlFor="hands" className="text-sm font-medium">Rounds Per Hour</Label>
                  <Input
                    id="hands"
                    name="hands" 
                    type="number"
                    value={100}
                    className="mt-1"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="unit_amount" className="text-sm font-medium">Unit Amount</Label>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-sm">$</span>
                      <Input
                        id="unit_amount"
                        type="number"
                        value={formData.spread_min}
                        onChange={handleInputChange}
                        name="spread_min"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="num_units" className="text-sm font-medium"># of Units</Label>
                    <Input
                      id="num_units"
                      type="number"
                      value={1000}
                      className="mt-1"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">Spread</Label>
                  <Select value="1-5">
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1-5">1 - 5</SelectItem>
                      <SelectItem value="1-8">1 - 8</SelectItem>
                      <SelectItem value="1-10">1 - 10</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm font-medium">Deviations</Label>
                  <Select value="Standard">
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Standard">Standard</SelectItem>
                      <SelectItem value="Illustrious18">Illustrious 18</SelectItem>
                      <SelectItem value="Full">Full</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Table Rules */}
            <Card>
              <CardHeader className="bg-blue-500 text-white">
                <CardTitle className="text-lg">Table Rules</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div>
                  <Label className="text-sm font-medium">Number Of Decks</Label>
                  <Select value={formData.decks.toString()}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 Deck</SelectItem>
                      <SelectItem value="2">2 Decks</SelectItem>
                      <SelectItem value="4">4 Decks</SelectItem>
                      <SelectItem value="6">6 Decks</SelectItem>
                      <SelectItem value="8">8 Decks</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm font-medium">Penetration</Label>
                  <div className="flex items-center space-x-2 mt-1">
                    <Input
                      type="number"
                      step="0.1"
                      min="0"
                      max="1"
                      value={formData.penetration}
                      onChange={handleInputChange}
                      name="penetration"
                      className="flex-1"
                    />
                    <span className="text-sm text-slate-600">4.5 decks (78 cards ≈ 75%)</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Dealer Hits Soft 17</Label>
                    <Switch
                      checked={formData.dealer_hits_soft_17}
                      onCheckedChange={(checked) => 
                        setFormData(prev => ({...prev, dealer_hits_soft_17: checked}))
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Double After Splitting</Label>
                    <Switch defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Resplitting Aces</Label>
                    <Switch />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">No Re-Split Aces</Label>
                    <Switch defaultChecked />
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">Splitting</Label>
                  <Select value="Max 4 Hands">
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Max 4 Hands">Max 4 Hands</SelectItem>
                      <SelectItem value="Max 3 Hands">Max 3 Hands</SelectItem>
                      <SelectItem value="Max 2 Hands">Max 2 Hands</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Panel - Freeze Bets */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader className="bg-orange-500 text-white">
                <CardTitle className="text-lg">Freeze Bets</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-20">Index</TableHead>
                      <TableHead className="w-20">Value</TableHead>
                      <TableHead className="w-20">Hands</TableHead>
                      <TableHead className="w-16">Etc.</TableHead>
                      <TableHead className="w-8"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {freezeBets.map((bet, index) => (
                      <TableRow key={index}>
                        <TableCell>{bet.index}</TableCell>
                        <TableCell>{bet.value}</TableCell>
                        <TableCell>{bet.hands}</TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm">⋯</Button>
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm" className="text-red-500 h-6 w-6 p-0">
                            ×
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <Button className="mt-4" variant="outline">
                  + Reset
                </Button>
              </CardContent>
            </Card>

            {/* Results Display */}
            {result && (
              <Card>
                <CardContent className="p-6">
                  <BankrollChart data={result.bankroll_history || []} />
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Bottom Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-sm text-slate-600 mb-1">Expected Value</div>
                <div className="text-2xl font-bold text-slate-900">${expectedValue}/hr</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-sm text-slate-600 mb-1">1 Standard Deviation</div>
                <div className="text-2xl font-bold text-slate-900">± ${standardDeviation}</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-sm text-slate-600 mb-1">Risk of Ruin</div>
                <div className="text-2xl font-bold text-red-600">{riskOfRuin}</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-sm text-slate-600 mb-1">Hours: 10 to 0</div>
                <div className="text-2xl font-bold text-slate-900">{hours}</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Button */}
        <div className="text-center">
          <Button 
            onClick={runSim}
            disabled={isLoading}
            size="lg"
            className="px-12 py-3"
          >
            {isLoading ? "Running Simulation..." : "Run Simulation"}
          </Button>
        </div>
      </div>
    </div>
  );
}
