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
    public function __construct(
        ManagerRegistry $registry,
    ) {
        parent::__construct($registry, Productor::class);
    }

    public function allQuery(): QueryBuilder
    {
        return $this->createQueryBuilder('productor')
            ->select(['productor', 'campahna', 'fruta', 'periodo'])
            ->leftJoin('productor.campahna', 'campahna')
            ->leftJoin('campahna.fruta', 'fruta')
            ->leftJoin('campahna.periodo', 'periodo');
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
            ->select('productor.codigo as codigo')
            ->addSelect('productor.nombre as nombre')
            ->addSelect('productor.clp as clp')
            ->addSelect('productor.mtdCeratitis as mtdCeratitis')
            ->addSelect('productor.mtdAnastrepha as mtdAnastrepha')
            ->addSelect('campahna.nombre as campahna')
            ->addSelect('fruta.nombre as fruta')
            ->addSelect('periodo.nombre as periodo')
            ->addSelect('productor.isActive as isActive')
            ->addSelect('productor.createdAt as createdAt');

        $filterService->apply($queryBuilder);

        return $queryBuilder->getQuery()->getResult();
    }

    public function allShared(): array
    {
        return $this->allQuery()
            ->select('productor.uuid as id')
            ->addSelect('productor.nombre as nombre')
            ->addSelect('CONCAT(productor.codigo, \' - \', productor.nombre) as nombreCompleto')
            ->addSelect('fruta.nombre as frutaNombre')
            ->addSelect('periodo.nombre as periodoNombre')
            ->where('productor.isActive = true')
            ->orderBy('fruta.nombre', 'asc')
            ->addOrderBy('periodo.nombre', 'asc')
            ->addOrderBy('productor.nombre', 'asc')
            ->getQuery()
            ->getResult();
    }

    public function findLastProducerCode(?string $campahnaId = null): ?string
    {
        $queryBuilder = $this->createQueryBuilder('p')
            ->select('p.codigo')
            ->orderBy('p.id', 'DESC')
            ->setMaxResults(1);

        // Si se especifica una campaña, filtrar por ella
        if ($campahnaId) {
            $queryBuilder
                ->join('p.campahna', 'c')
                ->where('c.uuid = :campahnaId')
                ->setParameter('campahnaId', $campahnaId);
        }

        $result = $queryBuilder->getQuery()->getOneOrNullResult();

        return $result ? $result['codigo'] : null;
    }

    /**
     * Buscar productores por campaña
     */
    public function findByCampahna(string $campahnaId): array
    {
        return $this->allQuery()
            ->where('campahna.uuid = :campahnaId')
            ->setParameter('campahnaId', $campahnaId)
            ->getQuery()
            ->getResult();
    }

    /**
     * Buscar productores por fruta y período (a través de campaña)
     */
    public function findByFrutaAndPeriodo(string $frutaId, string $periodoId): array
    {
        return $this->allQuery()
            ->where('fruta.uuid = :frutaId')
            ->andWhere('periodo.uuid = :periodoId')
            ->setParameter('frutaId', $frutaId)
            ->setParameter('periodoId', $periodoId)
            ->getQuery()
            ->getResult();
    }
}
