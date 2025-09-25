import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, Target, Users, TrendingUp, ArrowRight } from "lucide-react";
import { SavingsGoalCard } from "@/components/SavingsGoalCard";
import { AddContributionDialog } from "@/components/AddContributionDialog";
import { CreateGoalDialog } from "@/components/CreateGoalDialog";
import { SavingsGoal } from "@/types";
import heroImage from "@/assets/hero-image.jpg";

// Mock data with proper typing
const mockGoals: SavingsGoal[] = [
  {
    id: "1",
    title: "Resa till Kroatien",
    description: "Sommarsemester för hela gänget till Split och Dubrovnik",
    targetAmount: 45000,
    currentAmount: 32400,
    category: "Resa",
    deadline: "2024-06-01",
    contributors: [
      { id: "1", name: "Anna", amount: 8500 },
      { id: "2", name: "Erik", amount: 7200 },
      { id: "3", name: "Sara", amount: 9100 },
      { id: "4", name: "Marcus", amount: 7600 },
    ],
  },
  {
    id: "2",
    title: "Konsert biljetter",
    description: "The Weeknd på Tele2 Arena - VIP biljetter för alla",
    targetAmount: 12000,
    currentAmount: 8800,
    category: "Evenemang",
    contributors: [
      { id: "1", name: "Anna", amount: 3000 },
      { id: "2", name: "Erik", amount: 2900 },
      { id: "5", name: "Julia", amount: 2900 },
    ],
  },
  {
    id: "3",
    title: "Gemensam bil",
    description: "Begagnad bil för roadtrips och utflykter",
    targetAmount: 80000,
    currentAmount: 23500,
    category: "Bil",
    contributors: [
      { id: "1", name: "Anna", amount: 6000 },
      { id: "2", name: "Erik", amount: 5500 },
      { id: "3", name: "Sara", amount: 7000 },
      { id: "4", name: "Marcus", amount: 5000 },
    ],
  },
];

const Index = () => {
  const [goals, setGoals] = useState(mockGoals);
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);
  const [showContributionDialog, setShowContributionDialog] = useState(false);
  const [showCreateGoalDialog, setShowCreateGoalDialog] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);

  const selectedGoal = goals.find(goal => goal.id === selectedGoalId);

  const handleAddContribution = (goalId: string) => {
    setSelectedGoalId(goalId);
    setShowContributionDialog(true);
  };

  const handleContribute = (amount: number, message?: string) => {
    if (!selectedGoalId) return;
    
    setGoals(prevGoals => 
      prevGoals.map(goal => 
        goal.id === selectedGoalId 
          ? { 
              ...goal, 
              currentAmount: goal.currentAmount + amount,
              contributors: [
                ...goal.contributors,
                { id: Date.now().toString(), name: "Du", amount }
              ]
            }
          : goal
      )
    );
  };

  const handleCreateGoal = (newGoal: {
    title: string;
    description: string;
    targetAmount: number;
    category: string;
    deadline?: string;
  }) => {
    const goal = {
      ...newGoal,
      id: Date.now().toString(),
      currentAmount: 0,
      contributors: [],
    };
    setGoals(prevGoals => [goal, ...prevGoals]);
  };

  const totalSaved = goals.reduce((sum, goal) => sum + goal.currentAmount, 0);
  const totalTarget = goals.reduce((sum, goal) => sum + goal.targetAmount, 0);
  const activeGoals = goals.filter(goal => goal.currentAmount < goal.targetAmount).length;

  if (!showDashboard) {
    return (
      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-surface via-background to-surface-hover"></div>
          <div className="relative container mx-auto px-4 py-16 lg:py-24">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-8">
                <div className="space-y-4">
                  <h1 className="text-4xl lg:text-6xl font-bold text-text-primary leading-tight">
                    Spara tillsammans.
                    <br />
                    <span className="text-text-secondary">Nå målen snabbare.</span>
                  </h1>
                  <p className="text-lg text-text-secondary max-w-xl">
                    Sätt upp sparmål tillsammans med vänner och familj. 
                    Se live hur mycket alla bidragit och följ er progress mot målet.
                  </p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button 
                    onClick={() => setShowDashboard(true)}
                    size="lg"
                    className="bg-primary hover:bg-primary/90 text-primary-foreground text-lg px-8 py-3"
                  >
                    Kom igång
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="lg"
                    className="text-lg px-8 py-3"
                  >
                    Se hur det fungerar
                  </Button>
                </div>
              </div>
              
              <div className="relative">
                <img 
                  src={heroImage} 
                  alt="Friends saving money together"
                  className="w-full h-auto rounded-2xl shadow-[var(--shadow-large)]"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 bg-surface/50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-text-primary mb-4">
                Varför spara tillsammans?
              </h2>
              <p className="text-text-secondary max-w-2xl mx-auto">
                När ni sparar tillsammans blir det roligare, enklare och ni når era mål snabbare.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <Card className="p-6 text-center bg-surface border-border/50">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Target className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-text-primary mb-2">
                  Tydliga mål
                </h3>
                <p className="text-text-secondary">
                  Sätt upp konkreta sparmål som alla kan se och bidra till.
                </p>
              </Card>
              
              <Card className="p-6 text-center bg-surface border-border/50">
                <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Users className="w-6 h-6 text-success" />
                </div>
                <h3 className="text-lg font-semibold text-text-primary mb-2">
                  Gruppstöd
                </h3>
                <p className="text-text-secondary">
                  Motivera varandra och se hur alla bidrar till era gemensamma mål.
                </p>
              </Card>
              
              <Card className="p-6 text-center bg-surface border-border/50">
                <div className="w-12 h-12 bg-warning/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-6 h-6 text-warning" />
                </div>
                <h3 className="text-lg font-semibold text-text-primary mb-2">
                  Live tracking
                </h3>
                <p className="text-text-secondary">
                  Följ er progress i realtid och se närma ni er era drömmar.
                </p>
              </Card>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-surface/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-text-primary">SparGrupp</h1>
              <p className="text-sm text-text-secondary">Spara tillsammans med vänner</p>
            </div>
            <Button 
              onClick={() => setShowCreateGoalDialog(true)}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nytt mål
            </Button>
          </div>
        </div>
      </header>

      {/* Stats Overview */}
      <section className="py-8 bg-gradient-to-r from-surface via-background to-surface">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6 bg-surface border-border/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-text-secondary">Totalt sparat</p>
                  <p className="text-2xl font-bold text-text-primary">
                    {totalSaved.toLocaleString('sv-SE')} kr
                  </p>
                </div>
                <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-success" />
                </div>
              </div>
            </Card>
            
            <Card className="p-6 bg-surface border-border/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-text-secondary">Målbelopp</p>
                  <p className="text-2xl font-bold text-text-primary">
                    {totalTarget.toLocaleString('sv-SE')} kr
                  </p>
                </div>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Target className="w-6 h-6 text-primary" />
                </div>
              </div>
            </Card>
            
            <Card className="p-6 bg-surface border-border/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-text-secondary">Aktiva mål</p>
                  <p className="text-2xl font-bold text-text-primary">{activeGoals}</p>
                </div>
                <div className="w-12 h-12 bg-warning/10 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-warning" />
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Savings Goals */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-text-primary mb-2">Aktiva sparmål</h2>
            <p className="text-text-secondary">
              Här är era gemensamma sparmål. Klicka på "Bidra" för att lägga till pengar.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {goals.map((goal) => (
              <SavingsGoalCard
                key={goal.id}
                goal={goal}
                onAddContribution={handleAddContribution}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Dialogs */}
      <AddContributionDialog
        open={showContributionDialog}
        onOpenChange={setShowContributionDialog}
        goalTitle={selectedGoal?.title || ""}
        onContribute={handleContribute}
      />
      
      <CreateGoalDialog
        open={showCreateGoalDialog}
        onOpenChange={setShowCreateGoalDialog}
        onCreateGoal={handleCreateGoal}
      />
    </div>
  );
};

export default Index;