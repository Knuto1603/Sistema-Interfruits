<?php

namespace App\apps\core\Service\Contexto\Periodo\Dto;

use App\shared\Service\Transformer\DtoTransformer;

class PeriodoDtoTransformer extends DtoTransformer
{
    public function __construct()
    {
    }

    public function fromObject(mixed $object): ?PeriodoDto
    {
        if (null === $object) {
            return null;
        }

        $dto = new PeriodoDto();
        $dto->codigo = $object->getCodigo();
        $dto->nombre = $object->getNombre();
        $dto->fechaInicio = $object->getFechaInicio()?->format('Y-m-d H:i:s');
        $dto->fechaFin = $object->getFechaFin()?->format('Y-m-d H:i:s');
        $dto->ofEntity($object);

        return $dto;
    }

}
