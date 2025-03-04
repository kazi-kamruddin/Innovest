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
        try {
            return response()->json($this->authService->registerUser($request), 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,'message' => 'Registration failed. Please check your input.','errors' => $e->errors(),
            ], 400);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,'message' => 'Something went wrong during registration.','error' => $e->getMessage(),
            ], 500);
        }
    }
    
    public function login(Request $request)
    {
        try {
            return response()->json($this->authService->loginUser($request), 200);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,'message' => 'Invalid credentials. Please check your email and password.','errors' => $e->errors(),
            ], 401);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,'message' => 'Something went wrong during login.','error' => $e->getMessage(),
            ], 500);
        }
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