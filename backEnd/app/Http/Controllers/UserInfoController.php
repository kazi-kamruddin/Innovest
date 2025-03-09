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
            $userInfo = UserInfo::with('user') 
            ->where('user_id', $userId)
            ->first();

            if (!$userInfo) {
                return response()->json(['message' => 'User info not found'], 404);
            }

            return response()->json($userInfo, 200);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Error retrieving user info', 'message' => $e->getMessage()], 500);
        }
    }
}
