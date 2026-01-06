<?php

namespace App\apps\core\Service\Contexto\Periodo\Dto;

use App\apps\core\Entity\Periodo;

class PeriodoFactory
{
    public function __construct()
    {
    }

    public function ofDto(PeriodoDto $dto): ?Periodo
    {
        if (null === $dto) {
            return null;
        }

        $periodo = new Periodo();
        $this->updateOfDto($dto, $periodo);

        return $periodo;
    }

    public function updateOfDto(PeriodoDto $dto, Periodo $periodo): void
    {
        $periodo->setCodigo($dto->codigo);
        $periodo->setNombre($dto->nombre);
        $periodo->setFechaInicio(new \DateTime($dto->fechaInicio));
        $periodo->setFechaFin(new \DateTime($dto->fechaFin));

        match ($dto->isActive) {
            false => $periodo->disable(),
            default => $periodo->enable(),
        };
    }

}
