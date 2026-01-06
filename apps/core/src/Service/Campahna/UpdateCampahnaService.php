<?php

namespace App\apps\core\Service\Campahna;

use App\apps\core\Entity\Campahna;
use App\apps\core\Repository\CampahnaRepository;
use App\apps\core\Service\Campahna\Dto\CampahnaDto;
use App\apps\core\Service\Campahna\Dto\CampahnaFactory;
use App\shared\Exception\RepositoryException;

final readonly class UpdateCampahnaService
{
    public function __construct(
        private CampahnaRepository $campahnaRepository,
        private CampahnaFactory $campahnaFactory,
    ) {
    }

    public function execute(string $id, CampahnaDto $campahnaDto): Campahna
    {
        $campahna = $this->campahnaRepository->ofId($id, true);
        $this->isValid($campahnaDto, $campahna);
        $this->campahnaFactory->updateOfDto($campahnaDto, $campahna);
        $this->campahnaRepository->save($campahna);

        return $campahna;
    }

    public function isValid(CampahnaDto $campahnaDto, ?Campahna $campahna): void
    {
        // Verificar que no exista otra campaña con el mismo nombre, fruta y período
        if ($this->campahnaRepository->existsByNombreFrutaPeriodo(
            $campahnaDto->nombre,
            $campahnaDto->frutaId,
            $campahnaDto->periodoId,
            $campahna->uuid()
        )) {
            throw new RepositoryException(
                \sprintf(
                    'Ya existe una campaña con el nombre "%s" para esta fruta y período',
                    $campahnaDto->nombre
                )
            );
        }
    }
}
