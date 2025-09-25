import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, Target, Users, TrendingUp, ArrowRight, Menu, X } from "lucide-react";
import { SavingsGoalCard } from "@/components/SavingsGoalCard";
import { AddContributionDialog } from "@/components/AddContributionDialog";
import { CreateGoalDialog } from "@/components/CreateGoalDialog";
import { SavingsGoal } from "@/types";
import heroImage from "@/assets/hero-image.jpg";

// Mock data with proper typing
const mockGoals: SavingsGoal[] = [
  {
    id: "1",
    title: "Trip to Croatia",
    description: "Summer vacation for the whole group to Split and Dubrovnik",
    targetAmount: 45000,
    currentAmount: 32400,
    category: "Travel",
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
    title: "Concert tickets",
    description: "The Weeknd at Tele2 Arena - VIP tickets for everyone",
    targetAmount: 12000,
    currentAmount: 8800,
    category: "Event",
    contributors: [
      { id: "1", name: "Anna", amount: 3000 },
      { id: "2", name: "Erik", amount: 2900 },
      { id: "5", name: "Julia", amount: 2900 },
    ],
  },
  {
    id: "3",
    title: "Shared car",
    description: "Used car for road trips and adventures",
    targetAmount: 80000,
    currentAmount: 23500,
    category: "Vehicle",
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileMenuOpen(false);
  };

  if (!showDashboard) {
    return (
      <div className="min-h-screen bg-background">
        {/* Navigation */}
        <nav className="fixed top-0 w-full bg-background/95 backdrop-blur-sm border-b border-border z-50">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              <div className="text-xl font-bold text-text-primary">SparGrupp</div>
              
              {/* Desktop Navigation */}
              <div className="hidden md:flex space-x-8">
                <button onClick={() => scrollToSection('home')} className="text-text-secondary hover:text-text-primary transition-colors">
                  Home
                </button>
                <button onClick={() => scrollToSection('saving-methods')} className="text-text-secondary hover:text-text-primary transition-colors">
                  Saving methods
                </button>
                <button onClick={() => scrollToSection('how-it-works')} className="text-text-secondary hover:text-text-primary transition-colors">
                  How it works
                </button>
                <button onClick={() => scrollToSection('pricing')} className="text-text-secondary hover:text-text-primary transition-colors">
                  Pricing
                </button>
                <button onClick={() => scrollToSection('contact')} className="text-text-secondary hover:text-text-primary transition-colors">
                  Contact
                </button>
              </div>

              {/* Mobile menu button */}
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>

            {/* Mobile Navigation */}
            {mobileMenuOpen && (
              <div className="md:hidden py-4 space-y-2 border-t border-border">
                <button onClick={() => scrollToSection('home')} className="block w-full text-left py-2 text-text-secondary hover:text-text-primary">
                  Home
                </button>
                <button onClick={() => scrollToSection('saving-methods')} className="block w-full text-left py-2 text-text-secondary hover:text-text-primary">
                  Saving methods
                </button>
                <button onClick={() => scrollToSection('how-it-works')} className="block w-full text-left py-2 text-text-secondary hover:text-text-primary">
                  How it works
                </button>
                <button onClick={() => scrollToSection('pricing')} className="block w-full text-left py-2 text-text-secondary hover:text-text-primary">
                  Pricing
                </button>
                <button onClick={() => scrollToSection('contact')} className="block w-full text-left py-2 text-text-secondary hover:text-text-primary">
                  Contact
                </button>
              </div>
            )}
          </div>
        </nav>

        {/* Hero Section */}
        <section id="home" className="relative overflow-hidden pt-16">
          <div className="absolute inset-0 bg-gradient-to-br from-surface via-background to-surface-hover"></div>
          <div className="relative container mx-auto px-4 py-16 lg:py-24">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-8">
                <div className="space-y-4">
                  <h1 className="text-4xl lg:text-6xl font-bold text-text-primary leading-relaxed">
                    Save Smarter.
                    <br />
                    <span className="text-text-secondary">Save Together.</span>
                  </h1>
                  <p className="text-lg text-text-secondary max-w-xl">
                    Set up savings goals together with friends and family. 
                    See live how much everyone has contributed and track your progress towards the goal.
                  </p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button 
                    onClick={() => setShowDashboard(true)}
                    size="lg"
                    className="bg-primary hover:bg-primary/90 text-primary-foreground text-lg px-8 py-3"
                  >
                    Get started
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="lg"
                    className="text-lg px-8 py-3"
                    onClick={() => scrollToSection('how-it-works')}
                  >
                    See how it works
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

        {/* Saving Methods Section */}
        <section id="saving-methods" className="py-16 bg-surface/50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-text-primary mb-4">
                Multiple ways to save
              </h2>
              <p className="text-text-secondary max-w-2xl mx-auto">
                Choose the saving method that works best for your group's lifestyle and preferences.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <Card className="p-6 text-center bg-surface border-border/50">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Target className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-text-primary mb-2">
                  Fixed amount
                </h3>
                <p className="text-text-secondary">
                  Set a fixed monthly contribution that everyone commits to.
                </p>
              </Card>
              
              <Card className="p-6 text-center bg-surface border-border/50">
                <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Users className="w-6 h-6 text-success" />
                </div>
                <h3 className="text-lg font-semibold text-text-primary mb-2">
                  Flexible contributions
                </h3>
                <p className="text-text-secondary">
                  Contribute whenever you can, as much as you want.
                </p>
              </Card>
              
              <Card className="p-6 text-center bg-surface border-border/50">
                <div className="w-12 h-12 bg-warning/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-6 h-6 text-warning" />
                </div>
                <h3 className="text-lg font-semibold text-text-primary mb-2">
                  Challenge based
                </h3>
                <p className="text-text-secondary">
                  Save based on challenges and milestones you create together.
                </p>
              </Card>
            </div>
          </div>
        </section>

        {/* How it works Section */}
        <section id="how-it-works" className="py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-text-primary mb-4">
                How it works
              </h2>
              <p className="text-text-secondary max-w-2xl mx-auto">
                Getting started with group savings is simple and straightforward.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-primary">
                  1
                </div>
                <h3 className="text-lg font-semibold text-text-primary mb-2">
                  Create a goal
                </h3>
                <p className="text-text-secondary">
                  Set up your savings goal with a target amount and deadline.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-primary">
                  2
                </div>
                <h3 className="text-lg font-semibold text-text-primary mb-2">
                  Invite friends
                </h3>
                <p className="text-text-secondary">
                  Share your goal with friends and family who want to join.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-primary">
                  3
                </div>
                <h3 className="text-lg font-semibold text-text-primary mb-2">
                  Track progress
                </h3>
                <p className="text-text-secondary">
                  Watch your savings grow in real-time as everyone contributes.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-16 bg-surface/50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-text-primary mb-4">
                Simple pricing
              </h2>
              <p className="text-text-secondary max-w-2xl mx-auto">
                Start for free and upgrade when you need more features.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <Card className="p-8 bg-surface border-border/50">
                <h3 className="text-2xl font-bold text-text-primary mb-4">Free</h3>
                <div className="text-3xl font-bold text-text-primary mb-6">
                  $0<span className="text-lg font-normal text-text-secondary">/month</span>
                </div>
                <ul className="space-y-3 text-text-secondary mb-8">
                  <li>• Up to 3 savings goals</li>
                  <li>• Up to 5 group members</li>
                  <li>• Basic progress tracking</li>
                  <li>• Mobile app access</li>
                </ul>
                <Button className="w-full" variant="outline">
                  Get started
                </Button>
              </Card>
              
              <Card className="p-8 bg-surface border-border/50 border-primary/50">
                <h3 className="text-2xl font-bold text-text-primary mb-4">Pro</h3>
                <div className="text-3xl font-bold text-text-primary mb-6">
                  $9<span className="text-lg font-normal text-text-secondary">/month</span>
                </div>
                <ul className="space-y-3 text-text-secondary mb-8">
                  <li>• Unlimited savings goals</li>
                  <li>• Unlimited group members</li>
                  <li>• Advanced analytics</li>
                  <li>• Custom categories</li>
                  <li>• Priority support</li>
                </ul>
                <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                  Upgrade to Pro
                </Button>
              </Card>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-text-primary mb-4">
                Get in touch
              </h2>
              <p className="text-text-secondary max-w-2xl mx-auto">
                Have questions? We'd love to hear from you.
              </p>
            </div>
            
            <div className="max-w-2xl mx-auto">
              <Card className="p-8 bg-surface border-border/50">
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-lg font-semibold text-text-primary mb-4">Contact us</h3>
                    <div className="space-y-2 text-text-secondary">
                      <p>Email: hello@spargrupp.com</p>
                      <p>Phone: +46 123 456 789</p>
                      <p>Address: Stockholm, Sweden</p>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-text-primary mb-4">Follow us</h3>
                    <div className="space-y-2 text-text-secondary">
                      <p>Twitter: @spargrupp</p>
                      <p>Instagram: @spargrupp</p>
                      <p>LinkedIn: SparGrupp</p>
                    </div>
                  </div>
                </div>
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
              <p className="text-sm text-text-secondary">Save together with friends</p>
            </div>
            <Button 
              onClick={() => setShowCreateGoalDialog(true)}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <Plus className="w-4 h-4 mr-2" />
              New goal
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
                  <p className="text-sm text-text-secondary">Total saved</p>
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
                  <p className="text-sm text-text-secondary">Target amount</p>
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
                  <p className="text-sm text-text-secondary">Active goals</p>
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
            <h2 className="text-2xl font-bold text-text-primary mb-2">Active savings goals</h2>
            <p className="text-text-secondary">
              Here are your shared savings goals. Click "Contribute" to add money.
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