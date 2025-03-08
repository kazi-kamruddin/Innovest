<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\InvestorInfo;
use App\Models\User;

class InvestorInfoController extends Controller
{
    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'user_id' => 'required|exists:users,id',
            'fields_of_interest' => 'nullable|string',  
            'investment_range_min' => 'nullable|numeric',
            'investment_range_max' => 'nullable|numeric',
            'preferred_industries' => 'nullable|string',
        ]);

        try {
            $user = User::findOrFail($validatedData['user_id']);

            $validatedData['investment_range_min'] = (float) $validatedData['investment_range_min'];
            $validatedData['investment_range_max'] = (float) $validatedData['investment_range_max'];

            $investorInfo = InvestorInfo::updateOrCreate(
                ['user_id' => $validatedData['user_id']], 
                $validatedData
            );

            return response()->json($investorInfo, 201); 
        } catch (\Exception $e) {
            return response()->json(['error' => 'Investor info creation failed', 'message' => $e->getMessage()], 500);
        }
    }

    public function getInvestorInfo($userId)
    {
        try {
            $investorInfo = InvestorInfo::where('user_id', $userId)->first();

            if (!$investorInfo) {
                return response()->json(['message' => 'Investor info not found'], 404);
            }

            return response()->json($investorInfo, 200); 
        } catch (\Exception $e) {
            return response()->json(['error' => 'Error retrieving investor info', 'message' => $e->getMessage()], 500);
        }
    }

    public function getInvestorList()
    {
        try {
            $investors = InvestorInfo::with('user')->get();

            if ($investors->isEmpty()) {
                return response()->json(['message' => 'No investor information found'], 404);
            }

            return response()->json($investors, 200);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Error retrieving investor list', 'message' => $e->getMessage()], 500);
        }
    }

}