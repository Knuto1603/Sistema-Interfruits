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
        private productorFactory $productorFactory,
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

    public function isValid(ProductorDto $productorDto ):void
    {
        if(null === $productorDto->nombre){
            throw new MissingParameterException('Missing parameter nombre  ');
        }

        if(null !== $this->productorRepository->findOneBy(['clp' => $productorDto->clp])){
            throw new RepositoryException(\sprintf('CLP %s ya existe', $productorDto->clp));
        }

        if(null !== $this->productorRepository->findOneBy(['codigo' => $productorDto->codigo])){
            throw new RepositoryException(\sprintf('Código %s ya existe', $productorDto->codigo));
        }
    }
}
