<?php

namespace App\apps\core\Entity;

use App\apps\core\Repository\ContextRepository\PeriodoRepository;
use App\shared\Entity\EntityTrait;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Table(name: 'core_periodo')]
#[ORM\HasLifecycleCallbacks]
#[ORM\Entity(repositoryClass: PeriodoRepository::class)]
class Periodo implements \Stringable
{
    use EntityTrait;

    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 20)]
    private ?string $codigo = null;

    #[ORM\Column(length: 100)]
    private ?string $nombre = null;

    #[ORM\Column(type: 'datetime')]
    private ?\DateTime $fechaInicio = null;

    #[ORM\Column(type: 'datetime')]
    private ?\DateTime $fechaFin = null;

    public function __toString(): string
    {
        return $this->getNombre() ?? '';
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getCodigo(): ?string
    {
        return $this->codigo;
    }

    public function setCodigo(string $codigo): static
    {
        $this->codigo = $codigo;
        return $this;
    }

    public function getNombre(): ?string
    {
        return $this->nombre;
    }

    public function setNombre(string $nombre): static
    {
        $this->nombre = $nombre;
        return $this;
    }

    public function getFechaInicio(): ?\DateTime
    {
        return $this->fechaInicio;
    }

    public function setFechaInicio(\DateTime $fechaInicio): static
    {
        $this->fechaInicio = $fechaInicio;
        return $this;
    }

    public function getFechaFin(): ?\DateTime
    {
        return $this->fechaFin;
    }

    public function setFechaFin(\DateTime $fechaFin): static
    {
        $this->fechaFin = $fechaFin;
        return $this;
    }

    /**
     * Verificar si el período está activo en una fecha dada
     */
    public function isActivoEn(\DateTime $fecha): bool
    {
        return $fecha >= $this->fechaInicio && $fecha <= $this->fechaFin;
    }

    /**
     * Verificar si el período está activo actualmente
     */
    public function isActivoActualmente(): bool
    {
        return $this->isActivoEn(new \DateTime());
    }
}
