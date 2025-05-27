<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Pitch;
use App\Models\User;

class PitchController extends Controller
{   
    public function getAllPitches(Request $request)
    {
        try {
            $query = Pitch::with('user');
        
            if ($request->has('industry')) {
                $query->where('industry', 'like', '%' . $request->industry . '%');
            }
            if ($request->has('stage')) {
                $query->where('stage', 'like', '%' . $request->stage . '%');
            }
            if ($request->has('country')) {
                $query->where('country', 'like', '%' . $request->country . '%');
            }

            $pitches = $query->get();
            return response()->json($pitches, 200);
            } catch (\Exception $e) {
                return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function getPitchById($id){
        try {
            $pitch = Pitch::with('user')->findOrFail($id); 
            return response()->json($pitch, 200);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Pitch not found'], 404);
        }
    }

    // public function getUserPitches($userId){
    //     try {
    //         $user = User::findOrFail($userId);
    //         $pitches = $user->pitches; 

    //         if ($pitches->isEmpty()) {
    //             return response()->json(['message' => 'No pitches found for this user'], 404);
    //         }

    //         return response()->json($pitches, 200);
    //     } catch (\Exception $e) {
    //         return response()->json(['error' => 'User not found'], 404);
    //     }
    // }

    public function getUserPitches($userId){
        try {
            $user = User::findOrFail($userId);
            $pitches = $user->pitches;

            return response()->json($pitches, 200);
        } catch (\Exception $e) {
            return response()->json(['error' => 'User not found'], 404);
        }
    }


    public function destroy($userId, $pitchId)
    {
        try {
            $pitch = Pitch::findOrFail($pitchId);

            // Check if pitch belongs to the user
            if ($pitch->user_id != (int)$userId) {
                return response()->json(['error' => 'Unauthorized'], 403);
            }

            $pitch->delete();

            return response()->json(['message' => 'Pitch deleted successfully']);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to delete pitch'], 500);
        }
    }



    public function createPitch(Request $request){
        $validatedData = $request->validate([
            'user_id' => 'required|exists:users,id',
            'title' => 'required|string',
            'company_location' => 'nullable|string',
            'country' => 'nullable|string',
            'cell_number' => 'nullable|string',
            'industry' => 'required|string',
            'stage' => 'nullable|string',
            'ideal_investor_role' => 'nullable|string',
            'total_raising_amount' => 'nullable|numeric',
            'minimum_investment' => 'nullable|numeric',
            'the_business' => 'nullable|string',
            'the_market' => 'nullable|string',
            'progress' => 'nullable|string',
            'objective' => 'nullable|string',
        ]);

        try {
            $pitch = Pitch::create($validatedData);
            return response()->json($pitch, 201);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Pitch creation failed'], 500);
        }
    }
}
