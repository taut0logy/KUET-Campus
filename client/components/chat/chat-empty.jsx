import { MessageSquare } from "lucide-react";

export default function ChatEmpty() {

    
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
      <div className="bg-primary/10 p-4 rounded-full mb-4">
        <MessageSquare className="h-12 w-12 text-primary" />
      </div>
      <h2 className="text-2xl font-semibold mb-2">Welcome to KUET Campus Chat</h2>
      <p className="text-muted-foreground max-w-md mb-6">
        Connect with faculty members and students through secure messaging.
        Select a chat from the list or start a new conversation.
      </p>
    </div>
  );
}