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
  email: z.string().email('Invalid email address').max(255, 'Email must not be longer than 255 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  displayName: z.string().max(100, 'Name must not be longer than 100 characters').optional(),
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
        let errorMessage = 'An error occurred';
        
        if (result.error.message.includes('Invalid login credentials')) {
          errorMessage = 'Incorrect email or password';
        } else if (result.error.message.includes('User already registered')) {
          errorMessage = 'A user with this email already exists';
        } else if (result.error.message.includes('Email not confirmed')) {
          errorMessage = 'Please confirm your email before logging in';
        }

        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      } else if (!isLogin) {
        toast({
          title: "Registration successful!",
          description: "Check your email to confirm your account.",
        });
        setIsLogin(true);
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const firstError = error.errors[0];
        toast({
          title: "Validation error",
          description: firstError.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "An unexpected error occurred",
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
            Back to homepage
          </Button>
          <h1 className="text-3xl font-bold text-text-primary">Croowa</h1>
          <p className="text-text-secondary">
            {isLogin ? 'Log in to your account' : 'Create a new account'}
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
                placeholder="your@email.com"
              />
            </div>

            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="displayName">Name (optional)</Label>
                <Input
                  id="displayName"
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="bg-background"
                  placeholder="Your name"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-background pr-10"
                  placeholder="Your password"
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
              {loading ? 'Loading...' : (isLogin ? 'Log in' : 'Create account')}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Button
              variant="link"
              onClick={() => setIsLogin(!isLogin)}
              className="text-text-secondary"
            >
              {isLogin
                ? "Don't have an account? Create one here"
                : 'Already have an account? Log in here'}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Auth;