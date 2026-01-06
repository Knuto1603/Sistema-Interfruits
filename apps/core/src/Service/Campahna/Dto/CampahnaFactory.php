<?php

namespace App\apps\core\Service\Campahna\Dto;

use App\apps\core\Entity\Campahna;
use App\apps\core\Repository\ContextRepository\FrutaRepository;
use App\apps\core\Repository\ContextRepository\PeriodoRepository;

final readonly class CampahnaFactory
{
    public function __construct(
        private PeriodoRepository $periodoRepository,
        private FrutaRepository $frutaRepository,
    ) {
    }

    public function ofDto(CampahnaDto $campahnaDto): Campahna
    {
        $campahna = new Campahna();
        $this->updateOfDto($campahnaDto, $campahna);

        return $campahna;
    }

    public function updateOfDto(CampahnaDto $campahnaDto, Campahna $campahna): void
    {
        $campahna->setNombre($campahnaDto->nombre);
        $campahna->setDescripcion($campahnaDto->descripcion);

        if ($campahnaDto->periodoId) {
            $periodo = $this->periodoRepository->ofId($campahnaDto->periodoId);
            $campahna->setPeriodo($periodo);
        }

        if ($campahnaDto->frutaId) {
            $fruta = $this->frutaRepository->ofId($campahnaDto->frutaId);
            $campahna->setFruta($fruta);
        }
    }
}
