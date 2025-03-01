<?php

namespace App\Http\Controllers;

use App\Services\AuthService;
use App\Services\JwtService;
use Illuminate\Http\Request;

class AuthController extends Controller
{
    protected AuthService $authService;
    protected JwtService $jwtService;

    public function __construct(AuthService $authService, JwtService $jwtService)
    {
        $this->authService = $authService;
        $this->jwtService = $jwtService;
    }

    public function register(Request $request)
    {
        return response()->json($this->authService->registerUser($request), 201);
    }

    public function login(Request $request)
    {
        return response()->json($this->authService->loginUser($request), 201);
    }

    public function validateJwtToken(Request $request)
    {
        $jwt = $request->header('Authorization');
        if (!$jwt || !$this->jwtService->validateJwtToken($jwt)) {
            return response()->json(['error' => 'Invalid token'], 401);
        }
        return response()->json(['message' => 'Token is valid']);
    }
}