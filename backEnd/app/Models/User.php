<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Support\Collection;

class User extends Authenticatable
{
    use Notifiable, HasFactory;

    protected $fillable = [
        'name', 'email', 'password',
    ];

    protected $hidden = [
        'password',
    ];

    public function pitches()
    {
        return $this->hasMany(Pitch::class);
    }

    public function userInfo()
    {
        return $this->hasOne(UserInfo::class);
    }

    // Conversations where the user is user_one
    public function conversationsInitiated()
    {
        return $this->hasMany(Conversation::class, 'user_one_id');
    }

    // Conversations where the user is user_two
    public function conversationsReceived()
    {
        return $this->hasMany(Conversation::class, 'user_two_id');
    }

    // All conversations (merged from both ends)
    public function getConversationsAttribute(): Collection
    {
        return $this->conversationsInitiated->merge($this->conversationsReceived);
    }

    // Messages sent by the user
    public function messages()
    {
        return $this->hasMany(Message::class, 'sender_id');
    }
}
