<?php

namespace App\Http\Controllers;

use App\Events\NewMessageEvent;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class MessageController extends Controller
{
    
    public function getConversations()
    {
        $userId = Auth::id();

        $conversations = Conversation::with(['userOne', 'userTwo', 'messages' => function ($query) {
            $query->latest()->limit(1);
        }])
        ->where('user_one_id', $userId)
        ->orWhere('user_two_id', $userId)
        ->latest()
        ->get()
        ->map(function ($conv) use ($userId) {
            $conv->partner = $conv->user_one_id === $userId ? $conv->userTwo : $conv->userOne;
            return $conv;
        });

        return response()->json($conversations);
    }



    public function startConversation(Request $request)
    {
        $userId = Auth::id();
        $partnerId = $request->input('partner_id');

        if ($userId === $partnerId) {
            return response()->json(['error' => 'Cannot start conversation with yourself'], 400);
        }

        $existing = Conversation::where(function ($q) use ($userId, $partnerId) {
            $q->where('user_one_id', $userId)->where('user_two_id', $partnerId);
        })->orWhere(function ($q) use ($userId, $partnerId) {
            $q->where('user_one_id', $partnerId)->where('user_two_id', $userId);
        })->first();

        if ($existing) {
            return response()->json($existing);
        }

        $conversation = Conversation::create([
            'user_one_id' => $userId,
            'user_two_id' => $partnerId
        ]);

        return response()->json($conversation, 201);
    }



    public function getMessages($conversationId)
    {
        $userId = Auth::id();

        $conversation = Conversation::findOrFail($conversationId);

        if (!$conversation->hasParticipant($userId)) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $messages = Message::with('sender')
            ->where('conversation_id', $conversationId)
            ->orderBy('created_at')
            ->get();

        return response()->json($messages);
    }



    public function sendMessage(Request $request, $conversationId)
    {
        $userId = Auth::id();
        $conversation = Conversation::findOrFail($conversationId);

        if (!$conversation->hasParticipant($userId)) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'body' => 'required|string',
        ]);

        $message = Message::create([
            'conversation_id' => $conversationId,
            'sender_id' => $userId,
            'body' => $validated['body'],
        ]);


        \Log::info('Before firing event', ['message_id' => $message->id]);
        
        broadcast(new NewMessageEvent($message))->toOthers();
        // broadcast(new NewMessageEvent($message))->toOthers();

        \Log::info('Broadcasting message: ', $message->toArray());


        return response()->json($message, 201);
    }
}
