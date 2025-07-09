<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Conversation extends Model
{
    protected $fillable = ['user_one_id', 'user_two_id'];

    public function userOne()
    {
        return $this->belongsTo(User::class, 'user_one_id');
    }

    public function userTwo()
    {
        return $this->belongsTo(User::class, 'user_two_id');
    }

    public function messages()
    {
        return $this->hasMany(Message::class);
    }

    // Check if a user is in this conversation
    public function hasParticipant($userId): bool
    {
        return $this->user_one_id === $userId || $this->user_two_id === $userId;
    }

    // Get the other participant (from the POV of current user)
    public function getOtherParticipant(User $authUser)
    {
        return $this->user_one_id === $authUser->id ? $this->userTwo : $this->userOne;
    }
}
