<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TeamMember extends Model {
    use HasFactory;

    protected $fillable = ['pitch_id', 'name', 'email', 'linkedin_url'];

    public function pitch() {
        return $this->belongsTo(Pitch::class);
    }
}

