<?php

namespace App\Services;

use DateTimeImmutable;
use Lcobucci\JWT\Configuration;
use Lcobucci\JWT\Signer\Hmac\Sha256;
use Lcobucci\JWT\Signer\Key\InMemory;
use Lcobucci\JWT\Validation\Constraint\SignedWith;

class JwtService
{
    private Configuration $jwtConfig;

    public function __construct()
    {
        $this->jwtConfig = Configuration::forSymmetricSigner(
            new Sha256(),
            InMemory::plainText(config('app.jwt_secret'))
        );
    }

    public function issueJwtToken($userId)
    {
        $now = new DateTimeImmutable();

        $token = $this->jwtConfig->builder()
            ->issuedAt($now)
            ->expiresAt($now->modify('+1 days'))
            ->withClaim('uid', $userId)
            ->getToken($this->jwtConfig->signer(), $this->jwtConfig->signingKey());

        return $token;  
    }

    public function validateJwtToken($jwt)
    {
        try {
            $token = $this->jwtConfig->parser()->parse(str_replace('Bearer ', '', $jwt));

            $isSignedCorrectly = $this->jwtConfig->validator()->validate(
                $token,
                new SignedWith($this->jwtConfig->signer(), $this->jwtConfig->signingKey())
            );

            if (!$isSignedCorrectly) {
                return false;
            }

            $now = new DateTimeImmutable();
            $exp = $token->claims()->get('exp'); 
            $iat = $token->claims()->get('iat'); 

            if (!$exp || !$iat) {
                return false; 
            }

            if ($exp->getTimestamp() < $now->getTimestamp()) {
                return false; 
            }

            if ($iat->getTimestamp() > $now->getTimestamp()) {
                return false; 
            }

            return true; 
        } catch (\Exception $e) {
            return false;
        }
    }

    public function getUserIdFromToken($jwt)
    {
        try {
            $token = $this->jwtConfig->parser()->parse(str_replace('Bearer ', '', $jwt));

            if (!$this->validateJwtToken($jwt)) {
                return null;
            }

            return $token->claims()->get('uid'); 
        } catch (\Exception $e) {
            return null;
        }
    }
}