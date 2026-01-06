<?php

namespace App\apps\core\Repository;

use App\apps\core\Entity\Campahna;
use App\shared\Doctrine\DoctrineEntityRepository;
use App\shared\Repository\PaginatorInterface;
use App\shared\Service\FilterService;
use Doctrine\ORM\QueryBuilder;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends DoctrineEntityRepository<Campahna>
 *
 * @method Campahna|null find($id, $lockMode = null, $lockVersion = null)
 * @method Campahna|null findOneBy(array $criteria, array $orderBy = null)
 * @method Campahna[]    findAll()
 * @method Campahna[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class  CampahnaRepository extends DoctrineEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Campahna::class);
    }

    public function allQuery(): QueryBuilder
    {
        return $this->createQueryBuilder('campahna')
            ->select(['campahna', 'periodo', 'fruta'])
            ->leftJoin('campahna.periodo', 'periodo')
            ->leftJoin('campahna.fruta', 'fruta');
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
            ->select('campahna.nombre as nombre')
            ->addSelect('campahna.descripcion as descripcion')
            ->addSelect('fruta.nombre as frutaNombre')
            ->addSelect('periodo.nombre as periodoNombre')
            ->addSelect('campahna.isActive as isActive')
            ->addSelect('campahna.createdAt as createdAt');

        $filterService->apply($queryBuilder);

        return $queryBuilder->getQuery()->getResult();
    }

    /**
     * Obtener todas las campañas activas para select/dropdown
     */
    public function allActive(): array
    {
        return $this->allQuery()
            ->select('campahna.uuid as id')
            ->addSelect('campahna.nombre as nombre')
            ->addSelect("CONCAT(fruta.nombre, ' - ', periodo.nombre, ': ', campahna.nombre) as nombreCompleto")
            ->where('campahna.isActive = true')
            ->orderBy('fruta.nombre', 'asc')
            ->addOrderBy('periodo.nombre', 'asc')
            ->addOrderBy('campahna.nombre', 'asc')
            ->getQuery()
            ->getResult();
    }

    /**
     * Buscar campañas por fruta y período
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

    /**
     * Verificar si existe una campaña con el mismo nombre, fruta y período
     */
    public function existsByNombreFrutaPeriodo(string $nombre, string $frutaId, string $periodoId, ?string $excludeId = null): bool
    {
        $qb = $this->createQueryBuilder('campahna')
            ->select('COUNT(campahna.id)')
            ->join('campahna.fruta', 'fruta')
            ->join('campahna.periodo', 'periodo')
            ->where('campahna.nombre = :nombre')
            ->andWhere('fruta.uuid = :frutaId')
            ->andWhere('periodo.uuid = :periodoId')
            ->setParameter('nombre', $nombre)
            ->setParameter('frutaId', $frutaId)
            ->setParameter('periodoId', $periodoId);

        if ($excludeId) {
            $qb->andWhere('campahna.uuid != :excludeId')
                ->setParameter('excludeId', $excludeId);
        }

        return $qb->getQuery()->getSingleScalarResult() > 0;
    }

    public function allShared()
    {
    }
}
