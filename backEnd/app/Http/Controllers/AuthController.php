<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use DateTimeImmutable;
use Lcobucci\JWT\Configuration;
use Lcobucci\JWT\Signer\Hmac\Sha256;
use Lcobucci\JWT\Signer\Key\InMemory;
use Lcobucci\JWT\Validation\Constraint\LooseValidAt;
use Lcobucci\JWT\Validation\Constraint\SignedWith;

class AuthController extends Controller
{
    private Configuration $jwtConfig;

    public function __construct()
    {
        $this->jwtConfig = Configuration::forSymmetricSigner(
            new Sha256(),
            InMemory::plainText(config('app.jwt_secret'))
        );
    }

    public function register(Request $request)
{
    $request->validate([
        'name' => 'required',
        'email' => 'required|email|unique:users',
        'password' => 'required|min:6',
    ]);

    $user = User::create([
        'name' => $request->name,
        'email' => $request->email,
        'password' => Hash::make($request->password),
    ]);

    $token = $this->issueJwtToken($user->id);

    return response()->json([
        'message' => 'User registered successfully',
        'token' => $token, 
        'user' => $user, 
    ], 201);
}


    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Invalid credentials.'],
            ]);
        }

        $token = $this->issueJwtToken($user->id);

        return response()->json([
            'message' => 'logged in successfully',
            'token' => $token, 
            'user' => $user, 
        ], 201);
    }

    private function issueJwtToken($userId)
    {
        $now = new DateTimeImmutable();

        $token = $this->jwtConfig->builder()
            ->issuedAt($now)
            ->expiresAt($now->modify('+1 hour'))
            ->withClaim('uid', $userId)
            ->getToken($this->jwtConfig->signer(), $this->jwtConfig->signingKey());

        return $token->toString();
    }

    public function validateJwtToken(Request $request)
    {
        $jwt = $request->header('Authorization');

        if (!$jwt) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        try {
            $token = $this->jwtConfig->parser()->parse(str_replace('Bearer ', '', $jwt));

            $constraints = [
                new SignedWith($this->jwtConfig->signer(), $this->jwtConfig->signingKey()),
                new LooseValidAt(),
            ];

            if (!$this->jwtConfig->validator()->validate($token, ...$constraints)) {
                return response()->json(['error' => 'Invalid token'], 401);
            }

            return response()->json(['message' => 'Token is valid', 'claims' => $token->claims()->all()]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Invalid token'], 401);
        }
    }
}
