<?php

namespace App\apps\core\Repository;

use App\apps\core\Entity\Productor;
use App\shared\Doctrine\DoctrineEntityRepository;
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

    //    /**
    //     * @return Productor[] Returns an array of Productor objects
    //     */
    //    public function findByExampleField($value): array
    //    {
    //        return $this->createQueryBuilder('p')
    //            ->andWhere('p.exampleField = :val')
    //            ->setParameter('val', $value)
    //            ->orderBy('p.id', 'ASC')
    //            ->setMaxResults(10)
    //            ->getQuery()
    //            ->getResult()
    //        ;
    //    }

    //    public function findOneBySomeField($value): ?Productor
    //    {
    //        return $this->createQueryBuilder('p')
    //            ->andWhere('p.exampleField = :val')
    //            ->setParameter('val', $value)
    //            ->getQuery()
    //            ->getOneOrNullResult()
    //        ;
    //    }
}
