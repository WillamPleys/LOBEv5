USE lobe_v5_db;

-- 1. Ensure the item name matches the WidgetRegistry key exactly for correct rendering
-- In get_widgets.php, widgets are joined with master_items to get 'nama_item'.
-- Our JS WidgetRegistry uses this 'nama_item' as the key.
UPDATE master_items SET nama_item = 'Output Field & Explorer' WHERE nama_item = 'Output Field';

-- 2. Clean up any inconsistencies (just in case)
-- Since get_widgets.php joins on master_item_id, the update to master_items is sufficient
-- for all existing and future widgets to correctly identify as 'Output Field & Explorer'.
