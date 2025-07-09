<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Lcobucci\JWT\Configuration;
use Lcobucci\JWT\Validation\Constraint\SignedWith;
use Lcobucci\JWT\Validation\Constraint\ValidAt;
use Lcobucci\Clock\SystemClock;
use DateTimeZone;
use App\Models\User;

class JwtBroadcastAuth
{
    protected Configuration $jwtConfig;

    public function __construct()
    {
        $this->jwtConfig = Configuration::forSymmetricSigner(
            new \Lcobucci\JWT\Signer\Hmac\Sha256(),
            \Lcobucci\JWT\Signer\Key\InMemory::plainText(env('JWT_SECRET'))
        );
    }

    public function handle(Request $request, Closure $next)
    {
        $authHeader = $request->header('Authorization');

        if (!$authHeader || !str_starts_with($authHeader, 'Bearer ')) {
            return response()->json(['message' => 'Missing token'], 401);
        }

        $tokenString = substr($authHeader, 7); 

        try {
            $token = $this->jwtConfig->parser()->parse($tokenString);

            $constraints = [
                new SignedWith(
                    $this->jwtConfig->signer(),
                    $this->jwtConfig->signingKey()
                ),
                new ValidAt(
                    new SystemClock(new DateTimeZone('UTC'))
                )
            ];

            if (!$this->jwtConfig->validator()->validate($token, ...$constraints)) {
                return response()->json(['message' => 'Invalid token'], 401);
            }

            $uid = $token->claims()->get('uid');

            $user = User::find($uid);
            if (!$user) {
                return response()->json(['message' => 'User not found'], 401);
            }

            auth()->setUser($user);

            \Log::info('JwtBroadcastAuth middleware called', [
                'auth_header' => $authHeader,
                'user_id' => $user->id,
            ]);
        } catch (\Throwable $e) {
            \Log::error('JwtBroadcastAuth: Token error', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Token error', 'error' => $e->getMessage()], 401);
        }

        return $next($request);
    }
}
