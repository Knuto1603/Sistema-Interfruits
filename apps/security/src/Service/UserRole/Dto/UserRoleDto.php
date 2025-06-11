<?php

namespace App\apps\security\Service\UserRole\Dto;

use App\shared\Service\Dto\DtoRequestInterface;
use App\shared\Service\Dto\DtoTrait;
use Symfony\Component\Validator\Constraints as Assert;

final class UserRoleDto implements DtoRequestInterface
{
    use DtoTrait;

    public function __construct(
        #[Assert\Length(min: 1, max: 100)]
        public ?string $name = null,

        #[Assert\Length(min: 1, max: 100)]
        public ?string $alias = null,
    ) {
    }
}
