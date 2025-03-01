<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Pitch;
use Illuminate\Support\Facades\Auth;

class PitchController extends Controller
{
    // Store a new pitch
    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'company_location' => 'required|string|max:255',
            'country' => 'required|string|max:255',
            'cell_number' => 'required|string|max:20',
            'industry' => 'required|string|max:255',
            'stage' => 'required|string|max:255',
            'ideal_investor_role' => 'required|string|max:255',
            'total_raising_amount' => 'required|numeric|min:0',
            'minimum_investment' => 'required|numeric|min:0',
            'the_business' => 'required|string',
            'the_market' => 'required|string',
            'progress' => 'required|string',
            'objective' => 'required|string',
        ]);

        $pitch = Pitch::create([
            'user_id' => Auth::id(),
            'title' => $request->title,
            'company_location' => $request->company_location,
            'country' => $request->country,
            'cell_number' => $request->cell_number,
            'industry' => $request->industry,
            'stage' => $request->stage,
            'ideal_investor_role' => $request->ideal_investor_role,
            'total_raising_amount' => $request->total_raising_amount,
            'minimum_investment' => $request->minimum_investment,
            'the_business' => $request->the_business,
            'the_market' => $request->the_market,
            'progress' => $request->progress,
            'objective' => $request->objective,
        ]);

        return response()->json(['message' => 'Pitch created successfully', 'pitch' => $pitch], 201);
    }

    // Fetch all pitches
    public function index()
    {
        $pitches = Pitch::with('user')->get();
        return response()->json($pitches);
    }

    // Fetch a single pitch
    public function show($id)
    {
        $pitch = Pitch::with('user')->findOrFail($id);
        return response()->json($pitch);
    }

    // Update a pitch
    public function update(Request $request, $id)
    {
        $pitch = Pitch::findOrFail($id);

        if ($pitch->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $pitch->update($request->all());

        return response()->json(['message' => 'Pitch updated successfully', 'pitch' => $pitch]);
    }

    // Delete a pitch
    public function destroy($id)
    {
        $pitch = Pitch::findOrFail($id);

        if ($pitch->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $pitch->delete();
        return response()->json(['message' => 'Pitch deleted successfully']);
    }
}
