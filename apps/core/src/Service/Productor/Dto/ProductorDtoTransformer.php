<?php

namespace App\apps\core\Service\Productor\Dto;

use App\shared\Service\Transformer\DtoTransformer;

class ProductorDtoTransformer extends DtoTransformer
{
    public function __construct(
    )
    {
    }

    public function fromObject(mixed $object): ?ProductorDto
    {
        if (null === $object) {
            return null;
        }

        $dto = new ProductorDto();
        $dto->codigo = $object->getCodigo();
        $dto->nombre = $object->getNombre();
        $dto->clp = $object->getClp();
        $dto->ofEntity($object);

        return $dto;
    }
}
