<?php

namespace App\apps\security\Service\UserRole;

use App\apps\security\Entity\UserRole;
use App\apps\security\Repository\UserRoleRepository;

final readonly class GetUserRolesService
{
    public function __construct(
        private UserRoleRepository $repository,
    ) {
    }

    /** @return UserRole[] */
    public function execute(): array
    {
        return $this->repository->findAll();
    }
}
