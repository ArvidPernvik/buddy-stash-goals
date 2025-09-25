import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { z } from 'zod';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';

const authSchema = z.object({
  email: z.string().email('Ogiltig email-adress').max(255, 'Email får inte vara längre än 255 tecken'),
  password: z.string().min(6, 'Lösenord måste vara minst 6 tecken'),
  displayName: z.string().max(100, 'Namn får inte vara längre än 100 tecken').optional(),
});

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signIn, signUp, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = {
        email: email.trim(),
        password,
        displayName: displayName.trim() || undefined,
      };

      const validatedData = authSchema.parse(formData);

      let result;
      if (isLogin) {
        result = await signIn(validatedData.email, validatedData.password);
      } else {
        result = await signUp(validatedData.email, validatedData.password, validatedData.displayName);
      }

      if (result.error) {
        let errorMessage = 'Ett fel uppstod';
        
        if (result.error.message.includes('Invalid login credentials')) {
          errorMessage = 'Felaktig email eller lösenord';
        } else if (result.error.message.includes('User already registered')) {
          errorMessage = 'En användare med denna email finns redan';
        } else if (result.error.message.includes('Email not confirmed')) {
          errorMessage = 'Bekräfta din email innan du loggar in';
        }

        toast({
          title: "Fel",
          description: errorMessage,
          variant: "destructive",
        });
      } else if (!isLogin) {
        toast({
          title: "Registrering lyckades!",
          description: "Kontrollera din email för att bekräfta ditt konto.",
        });
        setIsLogin(true);
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const firstError = error.errors[0];
        toast({
          title: "Valideringsfel",
          description: firstError.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Fel",
          description: "Ett oväntat fel uppstod",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Tillbaka till startsidan
          </Button>
          <h1 className="text-3xl font-bold text-text-primary">Croowa</h1>
          <p className="text-text-secondary">
            {isLogin ? 'Logga in på ditt konto' : 'Skapa ett nytt konto'}
          </p>
        </div>

        <Card className="p-6 bg-surface border-border/50">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-background"
                placeholder="din@email.se"
              />
            </div>

            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="displayName">Namn (valfritt)</Label>
                <Input
                  id="displayName"
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="bg-background"
                  placeholder="Ditt namn"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="password">Lösenord</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-background pr-10"
                  placeholder="Ditt lösenord"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-text-secondary" />
                  ) : (
                    <Eye className="h-4 w-4 text-text-secondary" />
                  )}
                </Button>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              disabled={loading}
            >
              {loading ? 'Laddar...' : (isLogin ? 'Logga in' : 'Skapa konto')}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Button
              variant="link"
              onClick={() => setIsLogin(!isLogin)}
              className="text-text-secondary"
            >
              {isLogin
                ? 'Har du inget konto? Skapa ett här'
                : 'Har du redan ett konto? Logga in här'}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Auth;