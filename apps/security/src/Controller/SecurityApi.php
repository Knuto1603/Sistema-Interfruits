<?php

namespace App\apps\security\Controller;

use App\apps\security\Repository\UserRepository;
use App\apps\security\Service\Auth\TokenCheckDto;
use Lexik\Bundle\JWTAuthenticationBundle\Security\Http\Authentication\AuthenticationSuccessHandler;
use Lexik\Bundle\JWTAuthenticationBundle\Services\JWTTokenManagerInterface;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/security')]
final class SecurityApi
{
    #[Route(path: '/login_token', methods: ['POST'])]
    public function loginToken(
        TokenCheckDto $tokenDto,
        JWTTokenManagerInterface $jwtManager,
        UserRepository $userRepository,
        AuthenticationSuccessHandler $successHandler,
    ): Response {
        $data = $jwtManager->parse($tokenDto->token);
        $user = $userRepository->ofId($data['id']);

        return $successHandler->handleAuthenticationSuccess($user); // Return new token
    }
}
