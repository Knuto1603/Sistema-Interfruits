<?php

namespace App\apps\core\Repository;

use App\apps\core\Entity\Productor;
use App\shared\Doctrine\DoctrineEntityRepository;
use App\shared\Repository\PaginatorInterface;
use App\shared\Service\FilterService;
use Doctrine\ORM\QueryBuilder;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends DoctrineEntityRepository<Productor>
 */
class ProductorRepository extends DoctrineEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Productor::class);
    }

    public function allQuery(): QueryBuilder
    {
        return $this->createQueryBuilder('productor')
            ->select(['productor']);
    }

    public function paginateAndFilter(FilterService $filterService): PaginatorInterface
    {
        $queryBuilder = $this->allQuery();
        $filterService->apply($queryBuilder);

        return $this->paginator($queryBuilder);
    }

    public function downloadAndFilter(FilterService $filterService): iterable
    {
        $queryBuilder = $this->allQuery()
            ->addSelect('productor.name as parametroName')
            ->addSelect('productor.alias as parametroAlias')
            ->addSelect('productor.isActive as parametroIsActive');

        $filterService->apply($queryBuilder);

        return $queryBuilder->getQuery()->getResult();
    }

    public function allShared(): array
    {
        return $this->createQueryBuilder('productor')
            ->select('productor.uuid as id')
            ->addSelect('productor.name as name')
            ->addSelect('productor.name as alias')
            ->where('productor.isActive = true')
            ->orderBy('productor.name', 'asc')
            ->getQuery()
            ->getResult();
    }
}
