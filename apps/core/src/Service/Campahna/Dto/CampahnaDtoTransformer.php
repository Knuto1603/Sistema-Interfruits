<?php

namespace App\apps\core\Service\Campahna\Dto;

use App\apps\core\Entity\Campahna;
use App\shared\Doctrine\UidType;
use App\shared\Service\Transformer\DtoTransformer;

final class CampahnaDtoTransformer extends DtoTransformer
{
    /** @param Campahna $object */
    public function fromObject(mixed $object): ?CampahnaDto
    {
        if (null === $object) {
            return null;
        }

        $dto = new CampahnaDto();
        $dto->nombre = $object->getNombre();
        $dto->descripcion = $object->getDescripcion();
        $dto->periodoId = UidType::toString($object->getPeriodo()?->uuid());
        $dto->frutaId = UidType::toString($object->getFruta()?->uuid());
        $dto->periodoNombre = $object->getPeriodo()?->getNombre();
        $dto->frutaNombre = $object->getFruta()?->getNombre();
        $dto->nombreCompleto = $object->getNombreCompleto();
        $dto->ofEntity($object);

        return $dto;
    }
}
