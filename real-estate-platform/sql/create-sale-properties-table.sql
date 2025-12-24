-- Script de création de la table sale_properties
-- Ce script crée le module de VENTE sans casser l'existant

USE property_db;

-- ============================================
-- CRÉATION DE LA TABLE SALE_PROPERTIES
-- ============================================

CREATE TABLE IF NOT EXISTS sale_properties (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    property_id BIGINT NOT NULL UNIQUE,
    sale_price DECIMAL(15,2) NOT NULL,
    sale_status VARCHAR(20) NOT NULL DEFAULT 'FOR_SALE',
    sold_at TIMESTAMP NULL,
    sold_price DECIMAL(15,2) NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE,
    INDEX idx_property_id (property_id),
    INDEX idx_sale_status (sale_status),
    INDEX idx_is_active (is_active),
    INDEX idx_sale_price (sale_price)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

SELECT '✅ Table sale_properties créée avec succès' as status;

-- ============================================
-- MIGRATION DES DONNÉES EXISTANTES
-- ============================================
-- Migrer les propriétés actuellement à vendre (si transaction_type = 'SALE')

INSERT INTO sale_properties (property_id, sale_price, sale_status, is_active, created_at, updated_at)
SELECT 
    id as property_id,
    price as sale_price,
    CASE 
        WHEN status = 'SOLD' THEN 'SOLD'
        WHEN status = 'RESERVED' THEN 'RESERVED'
        ELSE 'FOR_SALE'
    END as sale_status,
    CASE 
        WHEN status IN ('AVAILABLE', 'RESERVED') THEN TRUE
        ELSE FALSE
    END as is_active,
    created_at,
    COALESCE(updated_at, created_at) as updated_at
FROM properties
WHERE transaction_type = 'SALE'
    AND id NOT IN (SELECT property_id FROM sale_properties)
ON DUPLICATE KEY UPDATE
    sale_price = VALUES(sale_price),
    sale_status = VALUES(sale_status);

SELECT CONCAT('✅ ', COUNT(*), ' propriétés migrées vers sale_properties') as status
FROM sale_properties;

-- ============================================
-- DONNÉES DE TEST SUPPLÉMENTAIRES
-- ============================================
-- Ajouter quelques biens de test si nécessaire

-- INSERT INTO sale_properties (property_id, sale_price, sale_status, is_active)
-- SELECT id, price, 'FOR_SALE', TRUE
-- FROM properties
-- WHERE id IN (1, 2, 3, 4, 5)
--   AND id NOT IN (SELECT property_id FROM sale_properties)
-- LIMIT 5;

-- ============================================
-- VÉRIFICATION
-- ============================================

SELECT '\n================================' as '';
SELECT '📊 STATISTIQUES SALE PROPERTIES' as '';
SELECT '================================' as '';

SELECT CONCAT('Total biens à vendre: ', COUNT(*)) as info
FROM sale_properties WHERE is_active = TRUE;

SELECT CONCAT('FOR_SALE: ', COUNT(*)) as info
FROM sale_properties WHERE sale_status = 'FOR_SALE';

SELECT CONCAT('RESERVED: ', COUNT(*)) as info
FROM sale_properties WHERE sale_status = 'RESERVED';

SELECT CONCAT('SOLD: ', COUNT(*)) as info
FROM sale_properties WHERE sale_status = 'SOLD';

SELECT '\n✅ Migration terminée!' as '';

