<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class DummyController extends Controller
{
    public function getNotes()
    {
        // Ensure the user is authenticated
        // $user = Auth::user();
        // if (!$user) {
        //     return response()->json(['message' => 'Unauthorized'], 401);
        // }

        return response()->json([
            //'user' => $user, // Get the authenticated user
            'notes' => [
                ['id' => 1, 'title' => 'Note 1', 'content' => 'Content for note 1'],
                ['id' => 2, 'title' => 'Note 2', 'content' => 'Content for note 2'],
            ]
        ]);
    }

    public function createNote(Request $request)
    {
        // Ensure the user is authenticated
        // $user = Auth::user();
        // if (!$user) {
        //     return response()->json(['message' => 'Unauthorized'], 401);
        // }

        return response()->json([
            'message' => 'Note created successfully!',
            //'user' => $user, // Get the authenticated user
            'note' => $request->all(),
        ]);
    }


    
    public function authCheck()
    {
        return response()->json([
            'auth_id' => Auth::id(),
            'auth_user' => Auth::user(),
        ]);
    }

}
