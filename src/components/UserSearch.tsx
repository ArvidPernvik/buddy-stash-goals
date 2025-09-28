import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Search, UserPlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { ProfileDialog } from "./ProfileDialog";

interface UserResult {
  user_id: string;
  display_name: string | null;
  email: string | null;
  avatar_url: string | null;
}

interface UserSearchProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const UserSearch = ({ open: externalOpen, onOpenChange }: UserSearchProps = {}) => {
  const { user } = useAuth();
  const [internalOpen, setInternalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [showProfileDialog, setShowProfileDialog] = useState(false);

  // Use external state if provided, otherwise use internal state
  const open = externalOpen !== undefined ? externalOpen : internalOpen;
  const setOpen = onOpenChange || setInternalOpen;

  const handleSearch = async () => {
    if (!searchQuery.trim() || !user?.id) return;

    setSearching(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, display_name, email, avatar_url')
        .or(`display_name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%`)
        .neq('user_id', user.id) // Exclude current user
        .limit(10);

      if (error) throw error;
      setSearchResults(data || []);
    } catch (error) {
      console.error('Error searching users:', error);
      toast.error('Failed to search users');
    } finally {
      setSearching(false);
    }
  };

  const handleUserClick = (userId: string) => {
    setSelectedUserId(userId);
    setShowProfileDialog(true);
    setOpen(false);
  };

  return (
    <>
      {externalOpen === undefined && (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Search className="w-4 h-4 mr-2" />
              Find Friends
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Find Friends</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                <Button onClick={handleSearch} disabled={searching || !searchQuery.trim()}>
                  {searching ? '...' : 'Search'}
                </Button>
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {searchResults.length === 0 && !searching && searchQuery && (
                  <p className="text-center text-text-secondary py-4">
                    No users found matching "{searchQuery}"
                  </p>
                )}

                {searchResults.map((result) => (
                  <div
                    key={result.user_id}
                    className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-surface cursor-pointer transition-colors"
                    onClick={() => handleUserClick(result.user_id)}
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={result.avatar_url || undefined} />
                      <AvatarFallback>
                        {result.display_name?.[0] || result.email?.[0] || '?'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-text-primary truncate">
                        {result.display_name || 'No display name'}
                      </p>
                      <p className="text-sm text-text-secondary truncate">
                        {result.email}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
      
      {externalOpen !== undefined && (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Find Friends</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                <Button onClick={handleSearch} disabled={searching || !searchQuery.trim()}>
                  {searching ? '...' : 'Search'}
                </Button>
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {searchResults.length === 0 && !searching && searchQuery && (
                  <p className="text-center text-text-secondary py-4">
                    No users found matching "{searchQuery}"
                  </p>
                )}

                {searchResults.map((result) => (
                  <div
                    key={result.user_id}
                    className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-surface cursor-pointer transition-colors"
                    onClick={() => handleUserClick(result.user_id)}
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={result.avatar_url || undefined} />
                      <AvatarFallback>
                        {result.display_name?.[0] || result.email?.[0] || '?'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-text-primary truncate">
                        {result.display_name || 'No display name'}
                      </p>
                      <p className="text-sm text-text-secondary truncate">
                        {result.email}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      <ProfileDialog
        open={showProfileDialog}
        onOpenChange={setShowProfileDialog}
        userId={selectedUserId || undefined}
      />
    </>
  );
};