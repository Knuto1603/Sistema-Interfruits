<?php

namespace App\apps\core\Entity;

use App\apps\core\Repository\CampahnaRepository;
use App\shared\Entity\EntityTrait;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

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
    private ?string $nombre = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $descripcion = null;

    #[ORM\ManyToOne(targetEntity: Periodo::class)]
    #[ORM\JoinColumn(name: 'periodo_id', nullable: false)]
    private ?Periodo $periodo = null;

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
    }

    public function __toString(): string
    {
        return $this->getNombre() ?? '';
    }

    public function getId(): ?int
    {
        return $this->id;
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

    public function getDescripcion(): ?string
    {
        return $this->descripcion;
    }

    public function setDescripcion(?string $descripcion): static
    {
        $this->descripcion = $descripcion;
        return $this;
    }

    public function getPeriodo(): ?Periodo
    {
        return $this->periodo;
    }

    public function setPeriodo(?Periodo $periodo): static
    {
        $this->periodo = $periodo;
        return $this;
    }

    public function getFruta(): ?Fruta
    {
        return $this->fruta;
    }

    public function setFruta(?Fruta $fruta): static
    {
        $this->fruta = $fruta;
        return $this;
    }

    /**
     * @return Collection<int, Productor>
     */
    public function getProductores(): Collection
    {
        return $this->productores;
    }

    public function addProductor(Productor $productor): static
    {
        if (!$this->productores->contains($productor)) {
            $this->productores->add($productor);
            $productor->setCampahna($this);
        }
        return $this;
    }

    public function removeProductor(Productor $productor): static
    {
        if ($this->productores->removeElement($productor)) {
            if ($productor->getCampahna() === $this) {
                $productor->setCampahna(null);
            }
        }
        return $this;
    }

    /**
     * Obtener nombre completo para mostrar (Fruta - Período: Nombre)
     */
    public function getNombreCompleto(): string
    {
        $fruta = $this->fruta?->getNombre() ?? 'Sin fruta';
        $periodo = $this->periodo?->getNombre() ?? 'Sin período';
        return "{$fruta} - {$periodo}: {$this->nombre}";
    }
}
