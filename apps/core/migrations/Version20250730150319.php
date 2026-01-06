<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250730150319 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE core_campahna (id INT AUTO_INCREMENT NOT NULL, periodo_id INT NOT NULL, fruta_id INT NOT NULL, nombre VARCHAR(100) NOT NULL, descripcion VARCHAR(255) DEFAULT NULL, uuid BINARY(16) NOT NULL COMMENT \'(DC2Type:uuid)\', created_at DATETIME NOT NULL, updated_at DATETIME NOT NULL, is_active TINYINT(1) NOT NULL, UNIQUE INDEX UNIQ_E068A891D17F50A6 (uuid), INDEX IDX_E068A8919C3921AB (periodo_id), INDEX IDX_E068A8914576E16E (fruta_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('ALTER TABLE core_campahna ADD CONSTRAINT FK_E068A8919C3921AB FOREIGN KEY (periodo_id) REFERENCES core_periodo (id)');
        $this->addSql('ALTER TABLE core_campahna ADD CONSTRAINT FK_E068A8914576E16E FOREIGN KEY (fruta_id) REFERENCES core_fruta (id)');
        $this->addSql('ALTER TABLE core_productor DROP FOREIGN KEY FK_4E1390549C3921AB');
        $this->addSql('ALTER TABLE core_productor DROP FOREIGN KEY FK_4E1390544576E16E');
        $this->addSql('DROP INDEX IDX_4E1390549C3921AB ON core_productor');
        $this->addSql('DROP INDEX IDX_4E1390544576E16E ON core_productor');
        $this->addSql('ALTER TABLE core_productor ADD campahna_id INT NOT NULL, ADD productor VARCHAR(255) NOT NULL, DROP periodo_id, DROP fruta_id');
        $this->addSql('ALTER TABLE core_productor ADD CONSTRAINT FK_4E139054681656F6 FOREIGN KEY (campahna_id) REFERENCES core_campahna (id)');
        $this->addSql('CREATE INDEX IDX_4E139054681656F6 ON core_productor (campahna_id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE core_productor DROP FOREIGN KEY FK_4E139054681656F6');
        $this->addSql('ALTER TABLE core_campahna DROP FOREIGN KEY FK_E068A8919C3921AB');
        $this->addSql('ALTER TABLE core_campahna DROP FOREIGN KEY FK_E068A8914576E16E');
        $this->addSql('DROP TABLE core_campahna');
        $this->addSql('DROP INDEX IDX_4E139054681656F6 ON core_productor');
        $this->addSql('ALTER TABLE core_productor ADD fruta_id INT NOT NULL, DROP productor, CHANGE campahna_id periodo_id INT NOT NULL');
        $this->addSql('ALTER TABLE core_productor ADD CONSTRAINT FK_4E1390549C3921AB FOREIGN KEY (periodo_id) REFERENCES core_periodo (id)');
        $this->addSql('ALTER TABLE core_productor ADD CONSTRAINT FK_4E1390544576E16E FOREIGN KEY (fruta_id) REFERENCES core_fruta (id)');
        $this->addSql('CREATE INDEX IDX_4E1390549C3921AB ON core_productor (periodo_id)');
        $this->addSql('CREATE INDEX IDX_4E1390544576E16E ON core_productor (fruta_id)');
    }
}
