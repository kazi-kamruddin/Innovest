<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Pitch extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id', 'title', 'company_location', 'country', 'cell_number',
        'industry', 'stage', 'ideal_investor_role', 'total_raising_amount',
        'minimum_investment', 'the_business', 'the_market', 'progress', 'objective'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
