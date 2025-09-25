import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  ThumbsUp, 
  Smile, 
  Star,
  Send,
  Users
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface Reaction {
  id: string;
  user_id: string;
  reaction_type: string;
  user_name: string;
}

interface ChatMessage {
  id: string;
  user_id: string;
  message: string;
  created_at: string;
  user_name: string;
}

interface SocialFeaturesProps {
  targetType: 'goal' | 'contribution' | 'group';
  targetId: string;
  groupId?: string;
}

export const SocialFeatures = ({ targetType, targetId, groupId }: SocialFeaturesProps) => {
  const { user } = useAuth();
  const [reactions, setReactions] = useState<Reaction[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);

  const reactionTypes = [
    { type: 'like', icon: ThumbsUp, label: 'Gilla' },
    { type: 'love', icon: Heart, label: 'Älska' },
    { type: 'celebrate', icon: Star, label: 'Fira' },
    { type: 'smile', icon: Smile, label: 'Le' }
  ];

  useEffect(() => {
    fetchReactions();
    if (groupId) {
      fetchChatMessages();
    }
  }, [targetId, groupId]);

  const fetchReactions = async () => {
    try {
      const { data } = await supabase
        .from('reactions')
        .select(`
          *,
          profiles(display_name)
        `)
        .eq('target_type', targetType)
        .eq('target_id', targetId);

      if (data) {
        const processedReactions = data.map((reaction: any) => ({
          ...reaction,
          user_name: reaction.profiles?.display_name || 'Okänd användare'
        }));
        setReactions(processedReactions);
      }
    } catch (error) {
      console.error('Error fetching reactions:', error);
    }
  };

  const fetchChatMessages = async () => {
    if (!groupId) return;

    try {
      const { data } = await supabase
        .from('group_chat_messages')
        .select(`
          *,
          profiles(display_name)
        `)
        .eq('group_id', groupId)
        .order('created_at', { ascending: true })
        .limit(50);

      if (data) {
        const processedMessages = data.map((message: any) => ({
          ...message,
          user_name: message.profiles?.display_name || 'Okänd användare'
        }));
        setChatMessages(processedMessages);
      }
    } catch (error) {
      console.error('Error fetching chat messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReaction = async (reactionType: string) => {
    if (!user) return;

    try {
      // Check if user already reacted with this type
      const existingReaction = reactions.find(
        r => r.user_id === user.id && r.reaction_type === reactionType
      );

      if (existingReaction) {
        // Remove reaction
        await supabase
          .from('reactions')
          .delete()
          .eq('id', existingReaction.id);
      } else {
        // Add reaction
        await supabase
          .from('reactions')
          .insert([
            {
              user_id: user.id,
              target_type: targetType,
              target_id: targetId,
              reaction_type: reactionType
            }
          ]);
      }

      fetchReactions(); // Refresh reactions
    } catch (error) {
      console.error('Error handling reaction:', error);
    }
  };

  const sendMessage = async () => {
    if (!user || !groupId || !newMessage.trim()) return;

    setSendingMessage(true);
    try {
      await supabase
        .from('group_chat_messages')
        .insert([
          {
            group_id: groupId,
            user_id: user.id,
            message: newMessage.trim()
          }
        ]);

      setNewMessage("");
      fetchChatMessages(); // Refresh messages
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSendingMessage(false);
    }
  };

  const shareProgress = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Kolla mitt sparframsteg på Croowa!',
          text: 'Jag gör stora framsteg mot mitt sparmål. Häng med och spara tillsammans!',
          url: window.location.href
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback - copy to clipboard
      try {
        await navigator.clipboard.writeText(window.location.href);
        // Could add a toast notification here
      } catch (error) {
        console.error('Error copying to clipboard:', error);
      }
    }
  };

  const getReactionCount = (type: string) => {
    return reactions.filter(r => r.reaction_type === type).length;
  };

  const hasUserReacted = (type: string) => {
    return reactions.some(r => r.user_id === user?.id && r.reaction_type === type);
  };

  return (
    <div className="space-y-6">
      {/* Reactions */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-semibold text-text-primary flex items-center gap-2">
            <Heart className="w-4 h-4" />
            Reaktioner
          </h4>
          <Button variant="outline" size="sm" onClick={shareProgress}>
            <Share2 className="w-4 h-4 mr-2" />
            Dela
          </Button>
        </div>

        <div className="flex gap-2 flex-wrap">
          {reactionTypes.map(({ type, icon: Icon, label }) => {
            const count = getReactionCount(type);
            const isActive = hasUserReacted(type);

            return (
              <Button
                key={type}
                variant={isActive ? "default" : "outline"}
                size="sm"
                onClick={() => handleReaction(type)}
                className={`flex items-center gap-2 ${
                  isActive ? 'bg-primary text-primary-foreground' : ''
                }`}
              >
                <Icon className="w-4 h-4" />
                {count > 0 && <span>{count}</span>}
              </Button>
            );
          })}
        </div>

        {/* Reaction Summary */}
        {reactions.length > 0 && (
          <div className="mt-3 text-sm text-text-secondary">
            {reactions.slice(0, 3).map(reaction => reaction.user_name).join(', ')}
            {reactions.length > 3 && ` och ${reactions.length - 3} till`} reagerade
          </div>
        )}
      </Card>

      {/* Group Chat */}
      {groupId && (
        <Card className="p-4">
          <h4 className="font-semibold text-text-primary mb-4 flex items-center gap-2">
            <MessageCircle className="w-4 h-4" />
            Gruppchatt
          </h4>

          <div className="space-y-3 max-h-60 overflow-y-auto mb-4">
            {chatMessages.map((message) => (
              <div key={message.id} className="flex items-start gap-2">
                <Avatar className="w-8 h-8">
                  <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                    <span className="text-primary font-semibold text-xs">
                      {message.user_name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-text-primary text-sm">
                      {message.user_name}
                    </span>
                    <span className="text-xs text-text-secondary">
                      {new Date(message.created_at).toLocaleDateString('sv-SE')}
                    </span>
                  </div>
                  <p className="text-sm text-text-secondary">{message.message}</p>
                </div>
              </div>
            ))}
            
            {chatMessages.length === 0 && (
              <div className="text-center py-8 text-text-secondary">
                <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Inga meddelanden än. Starta konversationen!</p>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <Textarea
              placeholder="Skriv ett meddelande..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              rows={2}
              className="flex-1"
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
            />
            <Button 
              onClick={sendMessage} 
              disabled={!newMessage.trim() || sendingMessage}
              className="self-end"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};