<?php

namespace App\apps\core\Service\Contexto\Periodo;

use App\apps\core\Repository\ContextRepository\PeriodoRepository;
use App\shared\Doctrine\UidType;

class GetPeriodoShared
{
    public function __construct(
        private PeriodoRepository $repository,
    )
    {
    }

    public function execute(): array
    {
        $items = $this->repository->allShared();
        return array_map(function ($item) {
            return [
                'id' => UidType::toString($item['id']),
                'nombre' => $item['nombre'],
                'codigo' => $item['codigo'],
            ];
        }, $items);
    }

}
