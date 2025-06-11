<?php

namespace App\apps\core\Service\Productor\Dto;

use App\shared\Service\Dto\DtoRequestInterface;
use App\shared\Service\Dto\DtoTrait;
use Symfony\Component\Validator\Constraints as Assert;

class ProductorDto implements DtoRequestInterface
{
    use DtoTrait;

    public function __construct(
        #[Assert\Length(exactly: 4)]
        public ?string $codigo = null,

        #[Assert\Length(min: 2, max: 100)]
        public ?string $nombre = null,

        #[Assert\Length(exactly: 10)]
        public ?string $clp = null,
    )
    {
    }

}
