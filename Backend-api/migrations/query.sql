CREATE TABLE categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE sites (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  url VARCHAR(500) NOT NULL,
  category_id INT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_sites_categories
    FOREIGN KEY (category_id) REFERENCES categories(id)
);



DELIMITER $$

CREATE PROCEDURE spCategory_List()
BEGIN
  SELECT id, name FROM categories ORDER BY name;
END$$

DELIMITER ;


DELIMITER $$

CREATE PROCEDURE spCategory_Create(IN p_name VARCHAR(100))
BEGIN
  IF TRIM(p_name) = '' THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El nombre es requerido';
  END IF;

  INSERT INTO categories(name) VALUES (p_name);
  SELECT LAST_INSERT_ID() AS id;
END$$

DELIMITER ;


DELIMITER $$

CREATE PROCEDURE spCategory_Delete(IN p_id INT)
BEGIN
  IF EXISTS (SELECT 1 FROM sites WHERE category_id = p_id) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'No se puede borrar: categoría en uso';
  END IF;

  DELETE FROM categories WHERE id = p_id;
END$$

DELIMITER ;


DELIMITER $$

CREATE PROCEDURE spSite_List()
BEGIN
  SELECT s.id, s.name, s.url,
         c.id AS categoryId, c.name AS categoryName
  FROM sites s
  JOIN categories c ON c.id = s.category_id
  ORDER BY s.id DESC;
END$$

DELIMITER ;


DELIMITER $$

CREATE PROCEDURE spSite_Create(
  IN p_name VARCHAR(150),
  IN p_url VARCHAR(500),
  IN p_category_id INT
)
BEGIN
  IF TRIM(p_name) = '' THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Nombre requerido';
  END IF;

  IF TRIM(p_url) = '' THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'URL requerida';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM categories WHERE id = p_category_id) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Categoría inválida';
  END IF;

  INSERT INTO sites(name, url, category_id)
  VALUES (p_name, p_url, p_category_id);

  SELECT LAST_INSERT_ID() AS id;
END$$

DELIMITER ;


DELIMITER $$

CREATE PROCEDURE spSite_Delete(IN p_id INT)
BEGIN
  DELETE FROM sites WHERE id = p_id;
END$$

DELIMITER ;


DELIMITER $$

CREATE TRIGGER trCategory_PreventDeleteInUse
BEFORE DELETE ON categories
FOR EACH ROW
BEGIN
  IF EXISTS (SELECT 1 FROM sites WHERE category_id = OLD.id) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'No se puede borrar categoría: está en uso';
  END IF;
END$$

DELIMITER ;



DELIMITER $$

CREATE PROCEDURE spCategory_Update(IN p_id INT, IN p_name VARCHAR(255))
BEGIN
    UPDATE categories
    SET name = p_name
    WHERE id = p_id;
END$$

DELIMITER ;


ALTER TABLE categories
  ADD UNIQUE KEY uq_categories_name (name);

ALTER TABLE sites
  ADD UNIQUE KEY uq_sites_name (name),
  ADD UNIQUE KEY uq_sites_url (url);