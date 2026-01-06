<?php

namespace App\apps\core\Service\Contexto\Periodo\Dto;

use App\shared\Service\Dto\DtoRequestInterface;
use App\shared\Service\Dto\DtoTrait;
use Symfony\Component\Validator\Constraints as Assert;


class PeriodoDto implements DtoRequestInterface
{
    use DtoTrait;

    public function __construct(

        #[Assert\Length(min: 2, max: 10)]
        public ?string $codigo = null,
        #[Assert\Length(min: 2, max: 100)]
        public ?string $nombre = null,
        #[Assert\DateTime]
        public ?string $fechaInicio = null,
        #[Assert\DateTime]
        public ?string $fechaFin = null,
    ) {
    }

}
