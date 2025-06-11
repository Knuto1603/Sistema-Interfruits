<?php

namespace App\apps\security\Service\UserRole\Dto;

use App\apps\security\Entity\UserRole;

final class UserRoleFactory
{
    public function ofDto(?UserRoleDto $dto): ?UserRole
    {
        if (null === $dto) {
            return null;
        }

        $user = new UserRole();
        $this->updateOfDto($dto, $user);

        return $user;
    }

    public function updateOfDto(UserRoleDto $dto, UserRole $user): void
    {
        $user->setName($dto->name);
        $user->setAlias($dto->alias);
        match ($dto->isActive) {
            false => $user->disable(),
            default => $user->enable(),
        };
    }
}
