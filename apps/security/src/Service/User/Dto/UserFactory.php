<?php

namespace App\apps\security\Service\User\Dto;

use App\apps\security\Entity\User;
use App\shared\Doctrine\UidType;
use App\shared\Service\TextCleaner;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

final readonly class UserFactory
{
    public function __construct(
        private UserPasswordHasherInterface $passwordHasher,
        private TextCleaner $cleaner,
    ) {
    }

    public function ofDto(?UserDto $dto): ?User
    {
        if (null === $dto) {
            return null;
        }

        $user = new User();
        $this->updateOfDto($dto, $user);

        return $user;
    }

    public function updateOfDto(UserDto $dto, User $user): void
    {
        $username = $dto->username ?? $user->getUsername() ?? 'no-username';
        $user->setUsername($this->cleaner->username($username));
        $user->setFullName($dto->fullname ?? $user->getFullName());
        if (null !== $dto->password) {
            $user->setPassword($this->passwordEncrypt($dto->password, $user));
        }
        $user->setGender($dto->gender ? UidType::fromString($dto->gender) : null);
        match ($dto->isActive) {
            false => $user->disable(),
            default => $user->enable(),
        };
        $user->setRoles($dto->roles);
    }

    public function passwordEncrypt(string $password, User $user): string
    {
        return $this->passwordHasher->hashPassword($user, $password);
    }
}
