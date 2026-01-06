<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250708164313 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE core_fruta (id INT AUTO_INCREMENT NOT NULL, nombre VARCHAR(100) NOT NULL, codigo VARCHAR(5) NOT NULL, uuid BINARY(16) NOT NULL COMMENT \'(DC2Type:uuid)\', created_at DATETIME NOT NULL, updated_at DATETIME NOT NULL, is_active TINYINT(1) NOT NULL, UNIQUE INDEX UNIQ_643B7B80D17F50A6 (uuid), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE core_periodo (id INT AUTO_INCREMENT NOT NULL, codigo VARCHAR(20) NOT NULL, nombre VARCHAR(100) NOT NULL, fecha_inicio DATETIME NOT NULL, fecha_fin DATETIME NOT NULL, uuid BINARY(16) NOT NULL COMMENT \'(DC2Type:uuid)\', created_at DATETIME NOT NULL, updated_at DATETIME NOT NULL, is_active TINYINT(1) NOT NULL, UNIQUE INDEX UNIQ_610171DED17F50A6 (uuid), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('DROP TABLE fruta');
        $this->addSql('DROP TABLE periodo');
        $this->addSql('ALTER TABLE core_productor ADD CONSTRAINT FK_4E1390549C3921AB FOREIGN KEY (periodo_id) REFERENCES core_periodo (id)');
        $this->addSql('ALTER TABLE core_productor ADD CONSTRAINT FK_4E1390544576E16E FOREIGN KEY (fruta_id) REFERENCES core_fruta (id)');
        $this->addSql('CREATE INDEX IDX_4E1390549C3921AB ON core_productor (periodo_id)');
        $this->addSql('CREATE INDEX IDX_4E1390544576E16E ON core_productor (fruta_id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE core_productor DROP FOREIGN KEY FK_4E1390544576E16E');
        $this->addSql('ALTER TABLE core_productor DROP FOREIGN KEY FK_4E1390549C3921AB');
        $this->addSql('CREATE TABLE fruta (id INT AUTO_INCREMENT NOT NULL, nombre VARCHAR(100) CHARACTER SET utf8mb4 NOT NULL COLLATE `utf8mb4_unicode_ci`, codigo VARCHAR(5) CHARACTER SET utf8mb4 NOT NULL COLLATE `utf8mb4_unicode_ci`, uuid BINARY(16) NOT NULL COMMENT \'(DC2Type:uuid)\', created_at DATETIME NOT NULL, updated_at DATETIME NOT NULL, is_active TINYINT(1) NOT NULL, UNIQUE INDEX UNIQ_32BA5A60D17F50A6 (uuid), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB COMMENT = \'\' ');
        $this->addSql('CREATE TABLE periodo (id INT AUTO_INCREMENT NOT NULL, codigo VARCHAR(20) CHARACTER SET utf8mb4 NOT NULL COLLATE `utf8mb4_unicode_ci`, nombre VARCHAR(100) CHARACTER SET utf8mb4 NOT NULL COLLATE `utf8mb4_unicode_ci`, fecha_inicio DATETIME NOT NULL, fecha_fin DATETIME NOT NULL, PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB COMMENT = \'\' ');
        $this->addSql('DROP TABLE core_fruta');
        $this->addSql('DROP TABLE core_periodo');
        $this->addSql('DROP INDEX IDX_4E1390549C3921AB ON core_productor');
        $this->addSql('DROP INDEX IDX_4E1390544576E16E ON core_productor');
    }
}
