<?php

namespace App\apps\core\Repository\ContextRepository;

use App\apps\core\Entity\Periodo;
use App\shared\Doctrine\DoctrineEntityRepository;
use App\shared\Repository\PaginatorInterface;
use App\shared\Service\FilterService;
use Doctrine\ORM\QueryBuilder;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends DoctrineEntityRepository<Periodo>
 */
class PeriodoRepository extends DoctrineEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Periodo::class);
    }

    public function allQuery(): QueryBuilder
    {
        return $this->createQueryBuilder('periodo')
            ->select(['periodo']);
    }

    public function findBy(array $criteria, ?array $orderBy = null, ?int $limit = null, ?int $offset = null): array{
        return $this->createQueryBuilder('periodo')
            ->select(['periodo'])
            ->where('periodo.isActive = true')
            ->orderBy('periodo.nombre', 'asc')
            ->getQuery()
            ->getResult();
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
            ->addSelect('periodo.nombre as frutaName')
            ->addSelect('periodo.codigo as frutaCodigo')
            ->addSelect('periodo.fechaInicio as fechaInicio')
            ->addSelect('periodo.fechaFin as fechaFin')
            ->addSelect('periodo.createdAt as createdAt')
            ->addSelect('periodo.updatedAt as updateAt')
            ->addSelect('periodo.isActive as frutaIsActive');

        $filterService->apply($queryBuilder);

        return $queryBuilder->getQuery()->getResult();
    }

    public function allShared(): array
    {
        return $this->createQueryBuilder('periodo')
            ->select('periodo.uuid as id')
            ->addSelect('periodo.nombre as nombre')
            ->addSelect('periodo.codigo as codigo')
            ->where('periodo.isActive = true')
            ->orderBy('periodo.nombre', 'asc')
            ->getQuery()
            ->getResult();
    }


}
