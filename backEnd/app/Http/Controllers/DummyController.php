<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class DummyController extends Controller
{
    public function getNotes()
    {
        // Return some dummy data
        return response()->json([
            'notes' => [
                ['id' => 1, 'title' => 'Note 1', 'content' => 'Content for note 1'],
                ['id' => 2, 'title' => 'Note 2', 'content' => 'Content for note 2'],
            ]
        ]);
    }

    public function createNote(Request $request)
    {
        // Just return the request data for testing purposes
        return response()->json([
            'message' => 'Note created successfully!',
            'note' => $request->all(),
        ]);
    }
}
