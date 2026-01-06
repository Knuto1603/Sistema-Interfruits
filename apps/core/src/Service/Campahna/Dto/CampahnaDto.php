<?php

namespace App\apps\core\Service\Campahna\Dto;

use App\shared\Service\Dto\DtoRequestInterface;
use App\shared\Service\Dto\DtoTrait;
use App\shared\Validator\Uid;
use Symfony\Component\Validator\Constraints as Assert;

final class CampahnaDto implements DtoRequestInterface
{
    use DtoTrait;

    public function __construct(
        #[Assert\NotBlank]
        #[Assert\Length(min: 2, max: 100)]
        public ?string $nombre = null,

        #[Assert\Length(max: 255)]
        public ?string $descripcion = null,

        #[Assert\NotBlank]
        #[Uid]
        public ?string $periodoId = null,

        #[Assert\NotBlank]
        #[Uid]
        public ?string $frutaId = null,

        // Campos para mostrar nombres en respuestas
        public ?string $periodoNombre = null,
        public ?string $frutaNombre = null,
        public ?string $nombreCompleto = null,
    ) {
    }
}
