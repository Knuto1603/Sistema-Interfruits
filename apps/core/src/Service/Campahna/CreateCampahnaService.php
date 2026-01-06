<?php

namespace App\apps\core\Service\Campahna;

use App\apps\core\Entity\Campahna;
use App\apps\core\Repository\CampahnaRepository;
use App\apps\core\Service\Campahna\Dto\CampahnaDto;
use App\apps\core\Service\Campahna\Dto\CampahnaFactory;
use App\shared\Exception\MissingParameterException;
use App\shared\Exception\RepositoryException;

final readonly class CreateCampahnaService
{
    public function __construct(
        private CampahnaRepository $campahnaRepository,
        private CampahnaFactory $campahnaFactory,
    ) {
    }

    public function execute(CampahnaDto $campahnaDto): Campahna
    {
        $this->isValid($campahnaDto);

        $campahna = $this->campahnaFactory->ofDto($campahnaDto);
        $this->campahnaRepository->save($campahna);

        return $campahna;
    }

    public function isValid(CampahnaDto $campahnaDto): void
    {
        if (null === $campahnaDto->nombre) {
            throw new MissingParameterException('Missing parameter nombre');
        }

        if (null === $campahnaDto->frutaId) {
            throw new MissingParameterException('Missing parameter frutaId');
        }

        if (null === $campahnaDto->periodoId) {
            throw new MissingParameterException('Missing parameter periodoId');
        }

        // Verificar que no exista otra campaña con el mismo nombre, fruta y período
        if ($this->campahnaRepository->existsByNombreFrutaPeriodo(
            $campahnaDto->nombre,
            $campahnaDto->frutaId,
            $campahnaDto->periodoId
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
