<?php

namespace App\apps\security\Service\UserRole\Dto;

use App\apps\security\Entity\UserRole;
use App\shared\Service\Transformer\DtoTransformer;

final class UserRoleDtoTransformer extends DtoTransformer
{
    /** @param UserRole $object */
    public function fromObject(mixed $object): ?UserRoleDto
    {
        if (null === $object) {
            return null;
        }

        $dto = new UserRoleDto();
        $dto->name = $object->getName();
        $dto->alias = $object->getAlias();
        $dto->ofEntity($object);

        return $dto;
    }
}
