import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Target, Users, TrendingUp, ArrowRight, Menu, X, LogOut, Trophy, MessageCircle } from "lucide-react";
import { SavingsGoalCard } from "@/components/SavingsGoalCard";
import { AddContributionDialog } from "@/components/AddContributionDialog";
import { CreateGoalDialog } from "@/components/CreateGoalDialog";
import { AnimatedSavingsGoals } from "@/components/AnimatedSavingsGoals";
import { GamificationPanel } from "@/components/GamificationPanel";
import { GroupsPanel } from "@/components/GroupsPanel";
import { LeaderboardPanel } from "@/components/LeaderboardPanel";
import { useAuth } from "@/hooks/useAuth";
import { SavingsGoal } from "@/types";
import heroImage from "@/assets/hero-image.jpg";
import elderlyPersonImage from "@/assets/elderly-person.png";
import groupPeopleImage from "@/assets/group-people.png";
import mountainSuccessImage from "@/assets/mountain-success.png";

// Mock data with proper typing
const mockGoals: SavingsGoal[] = [];

const Index = () => {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [goals, setGoals] = useState(mockGoals);
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);
  const [showContributionDialog, setShowContributionDialog] = useState(false);
  const [showCreateGoalDialog, setShowCreateGoalDialog] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-text-primary">Laddar...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

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
              <div className="text-xl font-bold text-text-primary">Croowa</div>
              
              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center space-x-8">
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
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={signOut}
                  className="text-text-secondary hover:text-text-primary"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logga ut
                </Button>
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
                <AnimatedSavingsGoals />
              </div>
            </div>
          </div>
        </section>

        {/* Saving Methods Section */}
        <section id="saving-methods" className="py-16 bg-surface/50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-5xl lg:text-7xl xl:text-8xl font-bold text-text-primary mb-6 leading-tight">
                What are you saving for?
              </h2>
              <p className="text-lg lg:text-xl text-text-secondary max-w-3xl mx-auto leading-relaxed">
                From saving solo to chipping in as a group, these are the everyday moments where Croows can make a difference.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <Card className="p-6 text-center bg-surface border-border/50">
                <div className="w-32 h-32 mx-auto mb-6 rounded-xl overflow-hidden shadow-lg">
                  <img 
                    src={elderlyPersonImage} 
                    alt="Planning a trip" 
                    className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-300"
                  />
                </div>
                <h3 className="text-lg font-semibold text-text-primary mb-2">
                  Planning a trip?
                </h3>
                <p className="text-text-secondary">
                  Set a goal and start saving before you book. Whether it's a weekend getaway or a bucket-list adventure, Croowa helps you get there without the money stress.
                </p>
              </Card>
              
              <Card className="p-6 text-center bg-surface border-border/50">
                <div className="w-32 h-32 mx-auto mb-6 rounded-xl overflow-hidden shadow-lg">
                  <img 
                    src={groupPeopleImage} 
                    alt="Saving for experiences" 
                    className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-300"
                  />
                </div>
                <h3 className="text-lg font-semibold text-text-primary mb-2">
                  Saving for experiences?
                </h3>
                <p className="text-text-secondary">
                  From music festivals to dream trips to once-in-a-lifetime events, Croowa makes sure the money's ready when the moment comes.
                </p>
              </Card>
              
              <Card className="p-6 text-center bg-surface border-border/50">
                <div className="w-32 h-32 mx-auto mb-6 rounded-xl overflow-hidden shadow-lg">
                  <img 
                    src={mountainSuccessImage} 
                    alt="Reaching a goal together" 
                    className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-300"
                  />
                </div>
                <h3 className="text-lg font-semibold text-text-primary mb-2">
                  Reaching a goal together?
                </h3>
                <p className="text-text-secondary">
                  From family milestones to trips with friends, Croowa syncs contributions so progress feels fair, visible, and worth celebrating.
                </p>
              </Card>
            </div>
          </div>
        </section>

        {/* How it works Section */}
        <section id="how-it-works" className="py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-5xl lg:text-7xl xl:text-8xl font-bold text-text-primary mb-6 leading-tight">
                How it works
              </h2>
              <p className="text-lg lg:text-xl text-text-secondary max-w-3xl mx-auto leading-relaxed">
                Getting started with group savings is simple and straightforward.
              </p>
            </div>
            
            {/* Step 1 */}
            <div className="mb-16 bg-green-50 rounded-3xl p-8 lg:p-12">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <div className="bg-white rounded-2xl p-6 shadow-lg">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-sm text-text-secondary mb-4">
                      <span>← Back</span>
                    </div>
                    <h3 className="text-2xl font-bold text-text-primary mb-6">Set a goal</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-gray-100 rounded-lg p-3 text-center">
                        <span className="text-sm">🎂 Birthday</span>
                      </div>
                      <div className="bg-gray-100 rounded-lg p-3 text-center">
                        <span className="text-sm">✈️ Travel</span>
                      </div>
                      <div className="bg-gray-100 rounded-lg p-3 text-center">
                        <span className="text-sm">👥 Hanging out</span>
                      </div>
                      <div className="bg-primary text-white rounded-lg p-3 text-center">
                        <span className="text-sm">🎉 Celebration</span>
                      </div>
                      <div className="bg-gray-100 rounded-lg p-3 text-center">
                        <span className="text-sm">💒 Wedding</span>
                      </div>
                      <div className="bg-gray-100 rounded-lg p-3 text-center">
                        <span className="text-sm">🎁 Gift</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-3xl font-bold text-text-primary mb-4">
                    1. Set a goal
                  </h3>
                  <p className="text-lg text-text-secondary">
                    From travel to emergency funds, birthdays to big purchases, Croowa helps you make it happen.
                  </p>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="mb-16 bg-orange-50 rounded-3xl p-8 lg:p-12">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <div>
                  <h3 className="text-3xl font-bold text-text-primary mb-4">
                    2. Set your savings goal amount
                  </h3>
                  <p className="text-lg text-text-secondary">
                    Set the target amount and the payment frequency that works for you.
                  </p>
                </div>
                
                <div className="bg-white rounded-2xl p-6 shadow-lg">
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold mb-3">Contribution amount</h4>
                      <div className="grid grid-cols-4 gap-2">
                        <div className="bg-gray-100 rounded-lg p-3 text-center text-sm">$25</div>
                        <div className="bg-gray-100 rounded-lg p-3 text-center text-sm">$50</div>
                        <div className="bg-gray-100 rounded-lg p-3 text-center text-sm">$75</div>
                        <div className="bg-primary text-white rounded-lg p-3 text-center text-sm">$100</div>
                      </div>
                      <div className="mt-3">
                        <div className="bg-gray-100 rounded-lg p-3 text-center text-sm text-text-secondary">
                          Custom amount
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-3">Select payment frequency</h4>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-gray-100 rounded-lg p-3 text-center text-sm">Every 2 weeks</div>
                        <div className="bg-gray-100 rounded-lg p-3 text-center text-sm">Monthly</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="mb-16 bg-yellow-50 rounded-3xl p-8 lg:p-12">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <div className="bg-white rounded-2xl p-6 shadow-lg">
                  <div className="space-y-4">
                    <h4 className="font-semibold">Invite members</h4>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <span className="text-sm text-text-secondary">🔍 Search for contacts</span>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-primary rounded-full"></div>
                          <span className="font-medium">Nick Smith</span>
                        </div>
                        <div className="w-4 h-4 bg-primary rounded-full"></div>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                          <span className="font-medium">Haley Deacon</span>
                        </div>
                        <div className="w-4 h-4 border-2 border-gray-300 rounded-full"></div>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                          <span className="font-medium">Tina Conner</span>
                        </div>
                        <div className="w-4 h-4 border-2 border-gray-300 rounded-full"></div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-3xl font-bold text-text-primary mb-4">
                    3. Invite your friends
                  </h3>
                  <p className="text-lg text-text-secondary">
                    Add your friends to your savings group so everyone can participate. Skip this step if you are saving alone.
                  </p>
                </div>
              </div>
            </div>

            {/* Step 4 */}
            <div className="mb-16 bg-blue-50 rounded-3xl p-8 lg:p-12">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <div>
                  <h3 className="text-3xl font-bold text-text-primary mb-4">
                    4. Watch your savings grow
                  </h3>
                  <p className="text-lg text-text-secondary">
                    See who's in, who's saving, and how close you are to your goal.
                  </p>
                </div>
                
                <div className="bg-white rounded-2xl p-6 shadow-lg">
                  <div className="space-y-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 bg-primary rounded-full"></div>
                        <span className="font-medium">Haley Deacon</span>
                      </div>
                      <div className="text-sm text-primary font-semibold">$1,900 / $3,600</div>
                      <div className="flex gap-1 mt-2">
                        {[...Array(5)].map((_, i) => (
                          <div key={i} className="w-3 h-3 bg-primary rounded-full"></div>
                        ))}
                        {[...Array(4)].map((_, i) => (
                          <div key={i} className="w-3 h-3 bg-gray-200 rounded-full"></div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 bg-blue-500 rounded-full"></div>
                        <div>
                          <div className="font-medium">Nick Smith</div>
                          <div className="text-xs text-gray-500">Nice</div>
                        </div>
                      </div>
                      <div className="text-sm text-primary font-semibold">Contribution: $1,800 / $3,600</div>
                      <div className="flex gap-1 mt-2">
                        {[...Array(6)].map((_, i) => (
                          <div key={i} className="w-3 h-3 bg-primary rounded-full"></div>
                        ))}
                        {[...Array(6)].map((_, i) => (
                          <div key={i} className="w-3 h-3 bg-gray-200 rounded-full"></div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 5 */}
            <div className="bg-green-50 rounded-3xl p-8 lg:p-12">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <div className="bg-white rounded-2xl p-6 shadow-lg">
                  <div className="text-center space-y-4">
                    <div className="bg-gray-100 rounded-xl p-6">
                      <div className="text-sm text-gray-600 mb-2">Hello, Luis!</div>
                      <div className="text-xs text-gray-500">Savymoolah</div>
                    </div>
                    
                    <div className="space-y-3">
                      <h4 className="text-xl font-bold">Cash out</h4>
                      <div className="text-sm text-gray-600">Available balance: $3,000</div>
                      <div className="text-4xl font-bold text-primary">$120</div>
                      
                      <div className="bg-blue-600 text-white rounded-lg p-3">
                        <span className="text-sm">💳 Max Cashout</span>
                      </div>
                      
                      <div className="text-xs text-gray-500">
                        Transfer cash balance to:<br/>
                        Bank Checking • x4934
                      </div>
                      
                      <div className="bg-primary text-white rounded-lg p-3">
                        <span className="text-sm">Transfer to bank</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-3xl font-bold text-text-primary mb-4">
                    5. Funds unlock when you're done
                  </h3>
                  <p className="text-lg text-text-secondary">
                    Once your group hits the goal or timeline, the funds unlock and go where they're supposed to. No stress. No surprises.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-16 bg-surface/50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-5xl lg:text-7xl xl:text-8xl font-bold text-text-primary mb-6 leading-tight">
                Helt gratis
              </h2>
              <p className="text-lg lg:text-xl text-text-secondary max-w-3xl mx-auto leading-relaxed">
                Croowa är helt gratis att använda. Inga dolda avgifter, inga prenumerationer.
              </p>
            </div>
            
            <div className="max-w-2xl mx-auto">
              <Card className="p-12 bg-gradient-to-br from-success/5 to-success/10 border-success/20 shadow-lg">
                <div className="text-center">
                  <h3 className="text-3xl font-bold text-text-primary mb-4">Gratis för alltid</h3>
                  <div className="text-6xl font-bold text-success mb-8">
                    0 kr
                  </div>
                  <ul className="space-y-4 text-left max-w-lg mx-auto text-text-secondary mb-8">
                    <li className="flex items-start gap-3">
                      <span className="text-success mt-1">✓</span>
                      <span>Obegränsat antal sparmål</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-success mt-1">✓</span>
                      <span>Obegränsat antal gruppmedlemmar</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-success mt-1">✓</span>
                      <span>Realtidsuppdateringar av framsteg</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-success mt-1">✓</span>
                      <span>Fullständig mobilapp</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-success mt-1">✓</span>
                      <span>Säker datahantering</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-success mt-1">✓</span>
                      <span>Alla funktioner inkluderade</span>
                    </li>
                  </ul>
                  <Button 
                    onClick={() => setShowDashboard(true)}
                    size="lg"
                    className="bg-success hover:bg-success/90 text-success-foreground text-lg px-12 py-4"
                  >
                    Kom igång gratis
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                  <p className="text-sm text-text-tertiary mt-4">
                    Inget kreditkort behövs • Ingen registrering • Börja direkt
                  </p>
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="py-16 bg-surface/50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-5xl lg:text-7xl xl:text-8xl font-bold text-text-primary mb-6 leading-tight">
                Get in touch
              </h2>
              <p className="text-lg lg:text-xl text-text-secondary max-w-3xl mx-auto leading-relaxed">
                Vi är här för att hjälpa dig. Kontakta oss så svarar vi direkt.
              </p>
            </div>
            
            <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
              {/* Contact Form */}
              <Card className="p-8 bg-surface border-border/50">
                <h3 className="text-2xl font-bold text-text-primary mb-6">Skicka ett meddelande</h3>
                <form className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-2">
                        Förnamn
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-border rounded-lg bg-background text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                        placeholder="Ditt förnamn"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-2">
                        Efternamn
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-border rounded-lg bg-background text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                        placeholder="Ditt efternamn"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">
                      E-post
                    </label>
                    <input
                      type="email"
                      className="w-full px-3 py-2 border border-border rounded-lg bg-background text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                      placeholder="din.email@exempel.se"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">
                      Ämne
                    </label>
                    <select className="w-full px-3 py-2 border border-border rounded-lg bg-background text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary">
                      <option value="">Välj ett ämne</option>
                      <option value="support">Teknisk support</option>
                      <option value="feature">Funktionsförslag</option>
                      <option value="billing">Fakturering</option>
                      <option value="partnership">Partnerskap</option>
                      <option value="other">Övrigt</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">
                      Meddelande
                    </label>
                    <textarea
                      rows={4}
                      className="w-full px-3 py-2 border border-border rounded-lg bg-background text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary resize-none"
                      placeholder="Beskriv ditt ärende..."
                    ></textarea>
                  </div>
                  
                  <Button 
                    type="submit"
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    Skicka meddelande
                  </Button>
                </form>
              </Card>
              
              {/* Contact Information */}
              <div className="space-y-8">
                <Card className="p-6 bg-surface border-border/50">
                  <h3 className="text-lg font-semibold text-text-primary mb-4">Kontakta oss direkt</h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <span className="text-primary font-semibold">@</span>
                      </div>
                      <div>
                        <p className="font-medium text-text-primary">E-post</p>
                        <p className="text-text-secondary">hello@croowa.com</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <span className="text-primary font-semibold">Tel</span>
                      </div>
                      <div>
                        <p className="font-medium text-text-primary">Telefon</p>
                        <p className="text-text-secondary">+46 123 456 789</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <span className="text-primary font-semibold">SE</span>
                      </div>
                      <div>
                        <p className="font-medium text-text-primary">Adress</p>
                        <p className="text-text-secondary">Stockholm, Sverige</p>
                      </div>
                    </div>
                  </div>
                </Card>
                
                <Card className="p-6 bg-surface border-border/50">
                  <h3 className="text-lg font-semibold text-text-primary mb-4">Följ oss</h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <span className="text-primary font-semibold">X</span>
                      </div>
                      <div>
                        <p className="font-medium text-text-primary">Twitter</p>
                        <p className="text-text-secondary">@croowa</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <span className="text-primary font-semibold">IG</span>
                      </div>
                      <div>
                        <p className="font-medium text-text-primary">Instagram</p>
                        <p className="text-text-secondary">@croowa</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <span className="text-primary font-semibold">in</span>
                      </div>
                      <div>
                        <p className="font-medium text-text-primary">LinkedIn</p>
                        <p className="text-text-secondary">Croowa</p>
                      </div>
                    </div>
                  </div>
                </Card>
                
                <Card className="p-6 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
                  <h3 className="text-lg font-semibold text-text-primary mb-2">Tillgänglighet</h3>
                  <p className="text-text-secondary text-sm mb-4">
                    Vi svarar på alla meddelanden direkt och är tillgängliga dygnet runt.
                  </p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Support</span>
                      <span className="text-text-primary font-medium">24/7</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Svarstid</span>
                      <span className="text-text-primary font-medium">Direkt</span>
                    </div>
                  </div>
                </Card>
              </div>
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
            <div className="flex items-center space-x-8">
              <div>
                <h1 className="text-2xl font-bold text-text-primary">Croowa</h1>
              </div>
              
              {/* Navigation Links */}
              <div className="hidden md:flex space-x-6">
                <button onClick={() => setShowDashboard(false)} className="text-text-secondary hover:text-text-primary transition-colors">
                  Home
                </button>
                <button onClick={() => {setShowDashboard(false); setTimeout(() => scrollToSection('saving-methods'), 100)}} className="text-text-secondary hover:text-text-primary transition-colors">
                  Saving methods
                </button>
                <button onClick={() => {setShowDashboard(false); setTimeout(() => scrollToSection('how-it-works'), 100)}} className="text-text-secondary hover:text-text-primary transition-colors">
                  How it works
                </button>
                <button onClick={() => {setShowDashboard(false); setTimeout(() => scrollToSection('pricing'), 100)}} className="text-text-secondary hover:text-text-primary transition-colors">
                  Pricing
                </button>
                <button onClick={() => {setShowDashboard(false); setTimeout(() => scrollToSection('contact'), 100)}} className="text-text-secondary hover:text-text-primary transition-colors">
                  Contact
                </button>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Mobile menu button */}
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
              
              <Button 
                onClick={() => setShowCreateGoalDialog(true)}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                <Plus className="w-4 h-4 mr-2" />
                New goal
              </Button>
            </div>
          </div>
          
          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 space-y-2 border-t border-border mt-4">
              <button onClick={() => {setShowDashboard(false); setMobileMenuOpen(false)}} className="block w-full text-left py-2 text-text-secondary hover:text-text-primary">
                Home
              </button>
              <button onClick={() => {setShowDashboard(false); setMobileMenuOpen(false); setTimeout(() => scrollToSection('saving-methods'), 100)}} className="block w-full text-left py-2 text-text-secondary hover:text-text-primary">
                Saving methods
              </button>
              <button onClick={() => {setShowDashboard(false); setMobileMenuOpen(false); setTimeout(() => scrollToSection('how-it-works'), 100)}} className="block w-full text-left py-2 text-text-secondary hover:text-text-primary">
                How it works
              </button>
              <button onClick={() => {setShowDashboard(false); setMobileMenuOpen(false); setTimeout(() => scrollToSection('pricing'), 100)}} className="block w-full text-left py-2 text-text-secondary hover:text-text-primary">
                Pricing
              </button>
              <button onClick={() => {setShowDashboard(false); setMobileMenuOpen(false); setTimeout(() => scrollToSection('contact'), 100)}} className="block w-full text-left py-2 text-text-secondary hover:text-text-primary">
                Contact
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Tabs Navigation */}
      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-6">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            Mål
          </TabsTrigger>
          <TabsTrigger value="groups" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Grupper  
          </TabsTrigger>
          <TabsTrigger value="achievements" className="flex items-center gap-2">
            <Trophy className="w-4 h-4" />
            Prestationer
          </TabsTrigger>
          <TabsTrigger value="leaderboard" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Rankning
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-8">
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
                  Här är dina delade sparmål. Klicka "Bidra" för att spara pengar.
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
        </TabsContent>

        <TabsContent value="groups">
          <GroupsPanel />
        </TabsContent>

        <TabsContent value="achievements">
          <GamificationPanel />
        </TabsContent>

        <TabsContent value="leaderboard">
          <LeaderboardPanel />
        </TabsContent>
      </Tabs>

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