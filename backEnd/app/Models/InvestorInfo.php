<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InvestorInfo extends Model
{
    use HasFactory;

    protected $table = 'investor_info'; 

    protected $fillable = [
        'user_id', 'fields_of_interest', 'investment_range_min', 'investment_range_max', 'preferred_industries',
    ];

    protected $casts = [
        'investment_range_min' => 'float',  
        'investment_range_max' => 'float',  
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function addFieldOfInterest($newField)
    {
        $fields = $this->fields_of_interest ? explode(', ', $this->fields_of_interest) : [];

        if (!in_array($newField, $fields)) {
            $fields[] = $newField;
        }

        $this->fields_of_interest = implode(', ', $fields);
        $this->save();
    }
}