<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Services\JwtService;
use Illuminate\Auth\AuthenticationException;
use Symfony\Component\HttpFoundation\Response;

class JwtMiddleware
{
    protected $jwtService;

    public function __construct(JwtService $jwtService)
    {
        $this->jwtService = $jwtService;
    }

    public function handle(Request $request, Closure $next)
    {
        try {
            $token = $request->header('Authorization');

            if (!$token || !$this->jwtService->validateJwtToken($token)) {
                throw new AuthenticationException();
            }

            $userIdFromToken = $this->jwtService->getUserIdFromToken($token);

            if (!$userIdFromToken) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid token'
                ], Response::HTTP_UNAUTHORIZED);
            }

            $userIdFromRoute = $request->route('userId'); 

            if ($userIdFromRoute && $userIdFromToken != $userIdFromRoute) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized access'
                ], Response::HTTP_FORBIDDEN);
            }

            return $next($request);

        } catch (AuthenticationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized: You need to log in first.'
            ], 401);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Something went wrong!',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}