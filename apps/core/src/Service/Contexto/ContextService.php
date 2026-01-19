<?php

namespace App\apps\core\Service\Contexto;

// Service/ContextoService.php

use App\apps\core\Entity\Fruta;
use App\apps\core\Entity\Periodo;
use App\apps\core\Repository\ContextRepository\PeriodoRepository;
use App\apps\core\Repository\FrutaRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\RequestStack;

class ContextService
{
    private ?Periodo $periodoActual = null;
    private ?Fruta $frutaActual = null;

    public function __construct(
        private EntityManagerInterface $em,
        private RequestStack $requestStack,
        private PeriodoRepository $periodoRepository,
        private FrutaRepository $frutaRepository
    ) {}

    public function setPeriodo(Periodo $periodo): void
    {
        $this->periodoActual = $periodo;
        $this->requestStack->getSession()->set('periodo_actual', $periodo->getId());
    }

    public function setFruta(Fruta $fruta): void
    {
        $this->frutaActual = $fruta;
        $this->requestStack->getSession()->set('fruta_actual', $fruta->getId());
    }

    public function getPeriodoActual(): ?Periodo
    {
        if (!$this->periodoActual) {
            $periodoId = $this->requestStack->getSession()->get('periodo_actual');
            if ($periodoId) {
                $this->periodoActual = $this->em->find(Periodo::class, $periodoId);
            }
        }
        return $this->periodoActual;
    }

    public function getFrutaActual(): ?Fruta
    {
        if (!$this->frutaActual) {
            $frutaId = $this->requestStack->getSession()->get('fruta_actual');
            if ($frutaId) {
                $this->frutaActual = $this->em->find(Fruta::class, $frutaId);
            }
        }
        return $this->frutaActual;
    }

    /**
     * Resolver contexto desde el request (body o headers)
     */
    public function resolverDesdeRequest(Request $request): array
    {
        // Intentar obtener desde el body JSON
        $contexto = $this->obtenerDesdeBody($request);

        // Si no está en el body, intentar desde headers
        if (!$contexto['periodo'] && !$contexto['fruta']) {
            $contexto = $this->obtenerDesdeHeaders($request);
        }

        // Si no está en ningún lado, intentar desde query parameters
        if (!$contexto['periodo'] && !$contexto['fruta']) {
            $contexto = $this->obtenerDesdeQuery($request);
        }

        return $contexto;
    }

    /**
     * Obtener contexto desde el body JSON
     */
    private function obtenerDesdeBody(Request $request): array
    {
        $data = json_decode($request->getContent(), true) ?? [];
        return [
            'periodo' => $this->obtenerPeriodo($data['periodoId'] ?? null),
            'fruta' => $this->obtenerFruta($data['frutaId'] ?? null)
        ];
    }

    /**
     * Obtener contexto desde headers
     */
    private function obtenerDesdeHeaders(Request $request): array
    {
        return [
            'periodo' => $this->obtenerPeriodo($request->headers->get('X-Periodo-Id')),
            'fruta' => $this->obtenerFruta($request->headers->get('X-Fruta-Id'))
        ];
    }

    /**
     * Obtener contexto desde query parameters
     */
    private function obtenerDesdeQuery(Request $request): array
    {
        return [
            'periodo' => $this->obtenerPeriodo($request->query->get('periodoId')),
            'fruta' => $this->obtenerFruta($request->query->get('frutaId'))
        ];
    }

    /**
     * Validar que el contexto esté completo
     */
    public function validarContexto(array $contexto): bool
    {
        return $contexto['periodo'] instanceof Periodo &&
            $contexto['fruta'] instanceof Fruta;
    }

    private function obtenerPeriodo(?string $id): ?Periodo
    {
        if (!$id) {
            return null;
        }
        return $this->periodoRepository->ofId($id);
    }

    private function obtenerFruta(?string $id): ?Fruta
    {
        if (!$id) {
            return null;
        }
        return $this->frutaRepository->ofId($id);
    }
}
