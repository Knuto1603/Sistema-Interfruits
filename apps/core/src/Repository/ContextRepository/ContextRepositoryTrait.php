<?php

namespace App\apps\core\Repository\ContextRepository;

use App\apps\core\Entity\Fruta;
use App\apps\core\Entity\Periodo;
use Doctrine\ORM\QueryBuilder;

trait ContextRepositoryTrait
{
    /**
     * Aplica el contexto actual (periodo y fruta) al QueryBuilder
     */
    protected function aplicarContexto(
        QueryBuilder $qb,
        string $alias,
        ?Periodo $periodo = null,
        ?Fruta $fruta = null
    ): void
    {
        if ($periodo) {
            $qb->andWhere("{$alias}.periodo = :periodo")
                ->setParameter('periodo', $periodo);
        }

        if ($fruta) {
            $qb->andWhere("{$alias}.fruta = :fruta")
                ->setParameter('fruta', $fruta);
        }
    }

    /**
     * Crear QueryBuilder con contexto aplicado automáticamente
     */
    protected function createQueryBuilderWithContext(string $alias = 'e'): QueryBuilder
    {
        $qb = $this->createQueryBuilder($alias);
        return $this->aplicarContexto($qb, $alias);
    }

    /**
     * Validar que el contexto esté establecido
     */
    protected function validarContexto(): void
    {
        if (!$this->getPeriodoActual() || !$this->getFrutaActual()) {
            throw new \RuntimeException('El contexto (periodo y fruta) debe estar establecido para realizar esta consulta');
        }
    }

    /**
     * Obtener todos los registros con contexto
     */
    public function findByContextoActual(array $criteria = []): array
    {
        $qb = $this->createQueryBuilderWithContext('e');

        foreach ($criteria as $field => $value) {
            $qb->andWhere("e.{$field} = :{$field}")
                ->setParameter($field, $value);
        }

        return $qb->getQuery()->getResult();
    }

}
