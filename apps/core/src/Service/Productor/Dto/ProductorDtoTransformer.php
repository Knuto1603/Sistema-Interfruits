<?php

namespace App\apps\core\Service\Productor\Dto;

use App\apps\core\Entity\Productor;
use App\shared\Doctrine\UidType;
use App\shared\Service\Transformer\DtoTransformer;

final class ProductorDtoTransformer extends DtoTransformer
{
    /** @param Productor $object */
    public function fromObject(mixed $object): ?ProductorDto
    {
        if (null === $object) {
            return null;
        }

        $dto = new ProductorDto();
        $dto->codigo = $object->getCodigo();
        $dto->nombre = $object->getNombre();
        $dto->clp = $object->getClp();
        $dto->mtdCeratitis = $object->getMtdCeratitis();
        $dto->mtdAnastrepha = $object->getMtdAnastrepha();
        $dto->campahnaId = UidType::toString($object->getCampahna()?->uuid());
        $dto->campahnaName = $object->getCampahna()?->getNombre();
        $dto->frutaName = $object->getFruta()?->getNombre();
        $dto->periodoName = $object->getPeriodo()?->getNombre();
        $dto->ofEntity($object);

        return $dto;
    }
}
