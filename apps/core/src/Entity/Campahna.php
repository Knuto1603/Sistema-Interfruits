<?php

namespace App\apps\core\Entity;

use App\apps\core\Repository\CampahnaRepository;
use App\shared\Entity\EntityTrait;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

/**
 * Entidad que representa una campaña agrícola.
 * Según MER 3.4: Aísla los datos de procesos y controla el acceso.
 */
#[ORM\Entity(repositoryClass: CampahnaRepository::class)]
#[ORM\Table(name: 'core_campahna')]
#[ORM\HasLifecycleCallbacks]
class Campahna implements \Stringable
{
    use EntityTrait;

    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 100)]
    private ?string $nombre = null; // Ej: "Mango 2025-2026"

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $descripcion = null;

    #[ORM\Column(type: Types::DATE_MUTABLE)]
    private ?\DateTimeInterface $fechaInicio = null;

    #[ORM\Column(type: Types::DATE_MUTABLE, nullable: true)]
    private ?\DateTimeInterface $fechaFin = null;


    #[ORM\ManyToOne(targetEntity: Fruta::class)]
    #[ORM\JoinColumn(name: 'fruta_id', nullable: false)]
    private ?Fruta $fruta = null;

    /**
     * @var Collection<int, Productor>
     */
    #[ORM\OneToMany(targetEntity: Productor::class, mappedBy: 'campahna', cascade: ['persist'])]
    private Collection $productores;

    public function __construct()
    {
        $this->productores = new ArrayCollection();
        $this->fechaInicio = new \DateTime(); // Se inicializa al momento de crear
    }

    public function __toString(): string
    {
        return $this->getNombre() ?? '';
    }

    public function getId(): ?int { return $this->id; }

    public function getNombre(): ?string { return $this->nombre; }

    public function setNombre(string $nombre): static { $this->nombre = $nombre; return $this; }

    public function getDescripcion(): ?string { return $this->descripcion; }

    public function setDescripcion(?string $descripcion): static { $this->descripcion = $descripcion; return $this; }

    public function getFechaInicio(): ?\DateTimeInterface { return $this->fechaInicio; }

    public function setFechaInicio(\DateTimeInterface $fechaInicio): self { $this->fechaInicio = $fechaInicio; return $this; }

    public function getFechaFin(): ?\DateTimeInterface { return $this->fechaFin; }

    public function setFechaFin(?\DateTimeInterface $fechaFin): self { $this->fechaFin = $fechaFin; return $this; }

    public function getFruta(): ?Fruta { return $this->fruta; }

    public function setFruta(?Fruta $fruta): static { $this->fruta = $fruta; return $this; }

    /**
     * @return Collection<int, Productor>
     */
    public function getProductores(): Collection { return $this->productores; }

    public function addProductor(Productor $productor): static
    {
        if (!$this->productores->contains($productor)) {
            $this->productores->add($productor);
            $productor->setCampahna($this);
        }
        return $this;
    }

    /**
     * Helper para mostrar información completa en el selector del frontend
     */
    public function getNombreCompleto(): string
    {
        $frutaNombre = $this->fruta?->getNombre() ?? 'Sin Fruta';
        $rango = $this->fechaFin
            ? "({$this->fechaInicio->format('Y')} - {$this->fechaFin->format('Y')})"
            : "(Desde {$this->fechaInicio->format('Y')})";

        return "{$frutaNombre}: {$this->nombre} {$rango}";
    }
}
