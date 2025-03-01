<?php

namespace App\Services;

use DateTimeImmutable;
use Lcobucci\JWT\Configuration;
use Lcobucci\JWT\Signer\Hmac\Sha256;
use Lcobucci\JWT\Signer\Key\InMemory;
use Lcobucci\JWT\Validation\Constraint\LooseValidAt;
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
            ->expiresAt($now->modify('+1 hour'))
            ->withClaim('uid', $userId)
            ->getToken($this->jwtConfig->signer(), $this->jwtConfig->signingKey());

        return $token->toString();
    }

    public function validateJwtToken($jwt)
    {
        try {
            $token = $this->jwtConfig->parser()->parse(str_replace('Bearer ', '', $jwt));
            $constraints = [
                new SignedWith($this->jwtConfig->signer(), $this->jwtConfig->signingKey()),
                new LooseValidAt(),
            ];
            return $this->jwtConfig->validator()->validate($token, ...$constraints);
        } catch (\Exception $e) {
            return false;
        }
    }
}

