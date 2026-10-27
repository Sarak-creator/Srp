import os
import sys
import psycopg

DB_URI = os.getenv("DATABASE_URL")
if not DB_URI and os.path.exists(".env"):
    with open(".env", "r", encoding="utf-8") as f:
        for line in f:
            if line.startswith("DATABASE_URL="):
                DB_URI = line.strip().split("=", 1)[1]
                break

SEED_SQL = """
-- 1. System Settings
INSERT INTO system_settings (factory_name_kh, factory_name_en, phone_number, address_kh, exchange_rate_khr_per_usd, receipt_footer_kh)
SELECT 
    'សហគ្រាសផលិតទឹកបរិសុទ្ធ អេស អរ ភី',
    'SRP Pure Water Factory',
    '012 333 444 / 098 555 666',
    'ភូមិព្រៃទា សង្កាត់ចោមចៅ ខណ្ឌពោធិ៍សែនជ័យ រាជធានីភ្នំពេញ',
    4100.00,
    'សូមអរគុណ! សូមពិនិត្យទំនិញ និងចំនួនសំបកធុងមុនពេលទទួល។'
WHERE NOT EXISTS (SELECT 1 FROM system_settings);

-- 2. Finished Water Products
INSERT INTO products (product_code, name_kh, name_en, unit, unit_cost_usd, sale_price_usd, sale_price_khr, is_refill_20l)
VALUES
('W20L-REF', 'ទឹកធុង ២០លីត្រ (ប្តូរសំបក)', '20L Container Refill', 'container_20l', 0.25, 0.75, 3000, true),
('W20L-NEW', 'ទឹកធុង ២០លីត្រ (ទិញទាំងសំបក)', '20L Container with New Bottle', 'container_20l', 2.80, 5.00, 20500, true),
('B350-PK', 'ទឹកដប ៣៥០មល (១យួរ = ២៤ដប)', '350ml Bottled Pack (24 bottles)', 'pack_350ml', 1.20, 2.20, 9000, false),
('B500-PK', 'ទឹកដប ៥០០មល (១យួរ = ២៤ដប)', '500ml Bottled Pack (24 bottles)', 'pack_500ml', 1.40, 2.50, 10000, false),
('B1500-PK', 'ទឹកដប ១៥០០មល (១យួរ = ១២ដប)', '1500ml Bottled Pack (12 bottles)', 'pack_1500ml', 1.50, 2.75, 11000, false)
ON CONFLICT (product_code) DO NOTHING;

-- 3. Customers (with 20L empty container held & debt)
INSERT INTO customers (customer_code, full_name, phone_number, delivery_address, total_debt_usd, total_debt_khr, empty_containers_held, notes)
VALUES
('CUST-000', 'អតិថិជនទូទៅ (Walk-in)', '000000000', 'ទិញផ្ទាល់នៅរោងចក្រ', 0.00, 0, 0, 'ទិញរាយទូទាត់ភ្លាមៗ'),
('CUST-001', 'ភោជនីយដ្ឋាន ម្លប់ត្រជាក់', '012 345 678', 'ផ្ទះលេខ ១២ ផ្លូវ ២៧១ សង្កាត់បឹងទំពុន', 22.50, 92000, 18, 'ដឹកទឹក ២ថ្ងៃម្តង ពេលព្រឹកម៉ោង ៨'),
('CUST-002', 'ការដ្ឋានសំណង់ សុខសាន្ត', '098 888 777', 'គម្រោងបុរីវិមានថ្មី ចោមចៅ', 45.00, 184500, 35, 'ទូទាត់លុយរៀងរាល់ចុងខែ'),
('CUST-003', 'សាលាបឋមសិក្សា វត្តបូព៌', '088 123 4567', 'ភូមិវត្តបូព៌ សង្កាត់សាលាកំរើក', 0.00, 0, 14, 'បង់លុយសុទ្ធគ្រប់ពេលដឹក'),
('CUST-004', 'ម៉ាត ២៤ម៉ោង ផ្សារលើ', '077 999 111', 'ក្បែររង្វង់មូលផ្សារលើ', 15.00, 61500, 8, 'ហាងលក់ទំនិញរាយ')
ON CONFLICT (customer_code) DO NOTHING;

-- 4. Users
INSERT INTO users (username, full_name, password_hash, role, phone)
VALUES
('admin', 'អ្នកគ្រប់គ្រងទូទៅ (Admin)', 'pbkdf2_sha256_mock_hash', 'admin', '012 333 444'),
('cashier1', 'បុគ្គលិកគិតលុយ (Cashier)', 'pbkdf2_sha256_mock_hash', 'cashier', '098 111 222'),
('driver1', 'អ្នកដឹកជញ្ជូន វណ្ណា (Driver)', 'pbkdf2_sha256_mock_hash', 'driver', '077 444 333')
ON CONFLICT (username) DO NOTHING;

-- 5. Suppliers
INSERT INTO suppliers (supplier_name, contact_person, phone_number, service_type, address)
VALUES
('រោងចក្រផ្លុំសំបកធុង និងគម្រប ជ័យជំនះ', 'លោក ជ័យ', '012 888 999', 'ផ្គត់ផ្គង់សំបកធុង ២០L និងគម្របស្អាត', 'ផ្លូវជាតិលេខ ៤ កំបូល ភ្នំពេញ'),
('ជាងម៉ាស៊ីនចម្រោះទឹក RO សុវណ្ណ', 'ជាង សុវណ្ណ', '098 777 666', 'ជួសជុល ថែទាំប្រព័ន្ធ RO & UV', 'សង្កាត់ទួលសង្កែ ខណ្ឌឫស្សីកែវ'),
('រោងពុម្ពតែមស្លាកសញ្ញា ភ្នំពេញ', 'អ្នកស្រី រចនា', '077 555 444', 'បោះពុម្ពតែមស្ទីកឃ័រ និងស្រោមបង្រួមកម្ដៅ', 'ផ្សារដេប៉ូ ខណ្ឌទួលគោក')
ON CONFLICT DO NOTHING;

-- 6. Operational Expenses
INSERT INTO operational_expenses (expense_date, category, title, amount_usd, amount_khr, total_equivalent_usd, paid_to, approved_by)
VALUES
(CURRENT_DATE, 'electricity', 'ថ្លៃអគ្គិសនីរោងចក្រទឹក (EDC)', 185.00, 758500, 185.00, 'អគ្គិសនីកម្ពុជា EDC', (SELECT id FROM users WHERE username='admin' LIMIT 1)),
(CURRENT_DATE, 'fuel', 'ប្រេងម៉ាស៊ូតឡានដឹកទឹក ២០លីត្រ', 45.00, 184500, 45.00, 'ស្ថានីយ៍ប្រេង តេលា', (SELECT id FROM users WHERE username='admin' LIMIT 1)),
(CURRENT_DATE, 'salary', 'ប្រាក់ឈ្នួលអ្នកដឹកជញ្ជូនទឹកប្រចាំថ្ងៃ', 20.00, 82000, 20.00, 'តៃកុងឡាន និងព្រូ', (SELECT id FROM users WHERE username='cashier1' LIMIT 1)),
(CURRENT_DATE, 'maintenance', 'ប្តូរស្នូលតម្រងចម្រោះកាបូន និងខ្សាច់ Quartz', 35.00, 143500, 35.00, 'ជាង សុវណ្ណ', (SELECT id FROM users WHERE username='admin' LIMIT 1));
"""

def main():
    if not DB_URI:
        print("DATABASE_URL not found in environment or .env", file=sys.stderr)
        sys.exit(1)

    print("Seeding initial factory operational data to Supabase...")
    with psycopg.connect(DB_URI) as conn:
        with conn.cursor() as cur:
            cur.execute(SEED_SQL)
            conn.commit()
            print("Seed execution finished!")

            for table in ['system_settings', 'products', 'customers', 'users', 'suppliers', 'operational_expenses']:
                cur.execute(f"SELECT count(*) FROM {table};")
                count = cur.fetchone()[0]
                print(f"  ✓ {table}: {count} records in Supabase")

if __name__ == "__main__":
    main()
