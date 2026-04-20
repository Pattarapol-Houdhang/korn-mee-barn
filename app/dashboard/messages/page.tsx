"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { MessageSquare, Loader2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";

export default function MessagesPage() {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/messages")
      .then((r) => r.json())
      .then((d) => setMessages(Array.isArray(d) ? d : []))
      .catch(() => setMessages([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>
  );

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
        <p className="text-gray-500 text-sm mt-1">{messages.length} message{messages.length !== 1 ? "s" : ""}</p>
      </div>

      {messages.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed border-gray-200 rounded-2xl">
          <MessageSquare className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No messages yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {messages.map((msg) => {
            const userId = (session?.user as any)?.id;
            const isSent = msg.senderId === userId;
            const images = (() => { try { return JSON.parse(msg.property.images) as string[]; } catch { return []; } })();
            const thumb = images[0] ?? "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=100";

            return (
              <div key={msg.id} className={`bg-white border rounded-xl p-4 ${!msg.read && !isSent ? "border-blue-200 bg-blue-50/30" : "border-gray-200"}`}>
                <div className="flex gap-3">
                  <img src={thumb} alt="" className="w-12 h-10 rounded-lg object-cover flex-shrink-0 bg-gray-100" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <Link href={`/properties/${msg.property.id}`} className="text-sm font-semibold text-gray-900 hover:text-blue-600 line-clamp-1">
                          {msg.property.title}
                        </Link>
                        <p className="text-xs text-gray-500">
                          {isSent ? `To: ${msg.receiver.name}` : `From: ${msg.sender.name}`}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {!msg.read && !isSent && (
                          <span className="w-2 h-2 bg-blue-500 rounded-full" />
                        )}
                        <span className="text-xs text-gray-400">{formatDate(msg.createdAt)}</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mt-1.5 line-clamp-2">{msg.content}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
