<?php

namespace App\apps\core\Service\Productor;

use App\apps\core\Entity\Productor;
use App\apps\core\Repository\ProductorRepository;
use App\apps\core\Service\Productor\Dto\ProductorDto;
use App\apps\core\Service\Productor\Dto\ProductorFactory;
use App\shared\Exception\RepositoryException;

final readonly class UpdateProductorService
{
    public function __construct(
        private ProductorRepository $productorRepository,
        private ProductorFactory $productorFactory,
    ) {
    }

    public function execute(string $id, ProductorDto $productorDto): Productor
    {
        $productor = $this->productorRepository->ofId($id, true);
        $this->isValid($productorDto, $productor);
        $this->productorFactory->updateOfDto($productorDto, $productor);
        $this->productorRepository->save($productor);

        return $productor;
    }

    public function isValid(ProductorDto $productorDto, ?Productor $productor): void
    {
        // Verificar que el CLP no exista en otro productor
        if ($productor->getClp() !== $productorDto->clp) {
            $existingByCLP = $this->productorRepository->findOneBy(['clp' => $productorDto->clp]);
            if (null !== $existingByCLP && $existingByCLP->getId() !== $productor->getId()) {
                throw new RepositoryException(\sprintf('CLP %s ya existe', $productorDto->clp));
            }
        }

        // Verificar que el código no exista en la misma campaña (en otro productor)
        if ($productor->getCodigo() !== $productorDto->codigo || 
            $productor->getCampahna()?->uuid() !== $productorDto->campahnaId) {
            
            $existingProductor = $this->productorRepository->createQueryBuilder('p')
                ->join('p.campahna', 'c')
                ->where('p.codigo = :codigo')
                ->andWhere('c.uuid = :campahnaId')
                ->andWhere('p.id != :currentId')
                ->setParameter('codigo', $productorDto->codigo)
                ->setParameter('campahnaId', $productorDto->campahnaId)
                ->setParameter('currentId', $productor->getId())
                ->getQuery()
                ->getOneOrNullResult();

            if (null !== $existingProductor) {
                throw new RepositoryException(\sprintf('Código %s ya existe en esta campaña', $productorDto->codigo));
            }
        }
    }
}
