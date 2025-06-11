<?php

namespace App\apps\security\Entity;


use App\shared\Entity\EntityTrait;
use App\shared\Service\Helper;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: UserRoleRepository::class)]
#[ORM\Table(name: 'security_user_role')]
#[ORM\HasLifecycleCallbacks]
class UserRole
{
    use EntityTrait;

    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 100)]
    private ?string $name = null;

    #[ORM\Column(length: 100)]
    private ?string $alias = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getName(): ?string
    {
        return $this->name;
    }

    public function setName(string $name): static
    {
        $this->name = $name;

        return $this;
    }

    public function getAlias(): ?string
    {
        return $this->alias;
    }

    public function setAlias(string $alias): static
    {
        $this->alias = Helper::slugUpper($alias);

        return $this;
    }
}
