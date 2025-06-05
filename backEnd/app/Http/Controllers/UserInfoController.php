<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\UserInfo;
use App\Models\User;

class UserInfoController extends Controller
{
    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'user_id' => 'required|exists:users,id',
            'location' => 'nullable|string',
            'investment_range_min' => 'nullable|numeric',
            'investment_range_max' => 'nullable|numeric',
            'areas_of_interest' => 'nullable|string',
            'about' => 'nullable|string',
        ]);

        try {
            $user = User::findOrFail($validatedData['user_id']);

            $userInfo = UserInfo::updateOrCreate(
                ['user_id' => $validatedData['user_id']],
                $validatedData
            );

            return response()->json($userInfo, 201);
        } catch (\Exception $e) {
            return response()->json(['error' => 'User info creation failed', 'message' => $e->getMessage()], 500);
        }
    }

public function getUserInfo($userId)
{
    try {
        // Try to get full user info
        $userInfo = UserInfo::with('user')
            ->where('user_id', $userId)
            ->first();

        if ($userInfo) {
            return response()->json([
                'user' => [
                    'id' => $userInfo->user->id,
                    'name' => $userInfo->user->name,
                    'email' => $userInfo->user->email,
                ],
                'location' => $userInfo->location,
                'areas_of_interest' => $userInfo->areas_of_interest,
                'about' => $userInfo->about,
            ]);
        }

        // Fallback: just fetch from users table
        $user = User::find($userId);

        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        return response()->json([
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
            ],
            'location' => null,
            'areas_of_interest' => null,
            'about' => null,
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'error' => 'Error retrieving user info',
            'message' => $e->getMessage()
        ], 500);
    }
}

}
