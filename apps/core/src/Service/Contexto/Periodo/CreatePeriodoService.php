<?php

namespace App\apps\core\Service\Contexto\Periodo;

use App\apps\core\Entity\Periodo;
use App\apps\core\Repository\ContextRepository\PeriodoRepository;
use App\apps\core\Service\Contexto\Periodo\Dto\PeriodoDto;
use App\apps\core\Service\Contexto\Periodo\Dto\PeriodoFactory;
use App\shared\Exception\MissingParameterException;
use App\shared\Exception\RepositoryException;

/**
 * Service class responsible for creating a new Periodo entity.
 */
final readonly class CreatePeriodoService
{

    public function __construct(
        private PeriodoFactory $periodoFactory,
        private PeriodoRepository $repository,
    ) {
    }

    public function execute(PeriodoDto $dto): ?Periodo
    {
        $this->isValid($dto);
        $periodo = $this->periodoFactory->ofDto($dto);
        $this->repository->save($periodo);
        return $periodo;
    }

    private function isValid(PeriodoDto $dto): void
    {
        if (null === $dto->nombre) {
            throw new MissingParameterException('Missing parameter nombre');
        }
        if (null === $dto->codigo) {
            throw new MissingParameterException('Missing parameter código');
        }

        if (null === $dto->fechaInicio) {
            throw new MissingParameterException('Missing parameter fechaInicio');
        }

        if (null !== $this->repository->findOneBy(['nombre' => $dto->nombre])) {
            throw new RepositoryException(\sprintf('Nombre %s ya existe', $dto->nombre));
        }

        if (null !== $this->repository->findOneBy(['codigo' => $dto->codigo])) {
            throw new RepositoryException(\sprintf('Código %s ya existe', $dto->codigo));
        }
    }

}
