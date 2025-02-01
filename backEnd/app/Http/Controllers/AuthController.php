<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;

class AuthController extends Controller
{
    public function signup(Request $request)
    {
        $userData = [
            'email' => 'user@example.com',
            'password' => 'password123'
        ];

        if ($request->email === $userData['email'] && $request->password === $userData['password']) {
            return response()->json(['message' => 'User signed up successfully']);
        }

        return response()->json(['error' => 'Invalid sign-up data'], 400);
    }

    public function login(Request $request)
    {
        $userData = [
            'email' => 'user@example.com',
            'password' => 'password123'
        ];

        if ($request->email === $userData['email'] && $request->password === $userData['password']) {
            return response()->json(['message' => 'User logged in successfully']);
        }

        return response()->json(['error' => 'Invalid login credentials'], 401);
    }
}

