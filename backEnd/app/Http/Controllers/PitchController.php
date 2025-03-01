<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Pitch;

class PitchController extends Controller
{
    public function getAllPitches()
    {
        try {
            $pitches = Pitch::all(); // Fetch all records from the pitches table
            return response()->json($pitches, 200);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}
