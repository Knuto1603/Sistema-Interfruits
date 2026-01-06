<?php

namespace App\apps\core\Service\Productor\Dto;

use App\apps\core\Entity\Productor;
use App\apps\core\Repository\CampahnaRepository;

final readonly class ProductorFactory
{
    public function __construct(
        private CampahnaRepository $campahnaRepository,
    )
    {
    }

    public function ofDto(?ProductorDto $dto): ?Productor
    {
        if (null === $dto) {
            return null;
        }

        $productor = new Productor();
        $this->updateOfDto($dto, $productor);

        return $productor;
    }

    public function updateOfDto(ProductorDto $dto, Productor $productor): void
    {
        $productor->setCodigo($dto->codigo);
        $productor->setNombre($dto->nombre);
        $productor->setClp($dto->clp);
        $productor->setMtdCeratitis($dto->mtdCeratitis);
        $productor->setMtdAnastrepha($dto->mtdAnastrepha);
        
        if ($dto->campahnaId) {
            $campahna = $this->campahnaRepository->ofId($dto->campahnaId);
            $productor->setCampahna($campahna);
        }

        match ($dto->isActive) {
            false => $productor->disable(),
            default => $productor->enable(),
        };
    }
}
