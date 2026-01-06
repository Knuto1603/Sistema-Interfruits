<?php

namespace App\apps\core\Service\Productor;

use App\apps\core\Entity\Productor;
use App\apps\core\Repository\ProductorRepository;
use App\apps\core\Service\Productor\Dto\ProductorDto;
use App\apps\core\Service\Productor\Dto\ProductorFactory;
use App\shared\Exception\MissingParameterException;
use App\shared\Exception\RepositoryException;

final readonly class CreateProductorService
{
    public function __construct(
        private ProductorRepository $productorRepository,
        private ProductorFactory $productorFactory,
    )
    {
    }

    public function execute(ProductorDto $productorDto): Productor
    {
        $this->isValid($productorDto);

        $productor = $this->productorFactory->ofDto($productorDto);
        $this->productorRepository->save($productor);
        return $productor;
    }

    public function isValid(ProductorDto $productorDto): void
    {
        if (null === $productorDto->nombre) {
            throw new MissingParameterException('Missing parameter nombre');
        }

        if (null === $productorDto->campahnaId) {
            throw new MissingParameterException('Missing parameter campahnaId');
        }

        if (null === $productorDto->codigo) {
            throw new MissingParameterException('Missing parameter codigo');
        }

        if (null === $productorDto->clp) {
            throw new MissingParameterException('Missing parameter clp');
        }

        // Verificar que el CLP no exista
        if (null !== $this->productorRepository->findOneBy(['clp' => $productorDto->clp])) {
            throw new RepositoryException(\sprintf('CLP %s ya existe', $productorDto->clp));
        }

        // Verificar que el código no exista en la misma campaña
        $existingProductor = $this->productorRepository->createQueryBuilder('p')
            ->join('p.campahna', 'c')
            ->where('p.codigo = :codigo')
            ->andWhere('c.uuid = :campahnaId')
            ->setParameter('codigo', $productorDto->codigo)
            ->setParameter('campahnaId', $productorDto->campahnaId)
            ->getQuery()
            ->getOneOrNullResult();

        if (null !== $existingProductor) {
            throw new RepositoryException(\sprintf('Código %s ya existe en esta campaña', $productorDto->codigo));
        }
    }
}
