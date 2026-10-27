import os
import sys
import psycopg

# Load DB_URI from environment variable or .env
DB_URI = os.getenv("DATABASE_URL")
if not DB_URI and os.path.exists(".env"):
    with open(".env", "r", encoding="utf-8") as f:
        for line in f:
            if line.startswith("DATABASE_URL="):
                DB_URI = line.strip().split("=", 1)[1]
                break

def main():
    if not DB_URI:
        print("DATABASE_URL not found in environment or .env", file=sys.stderr)
        sys.exit(1)

    print("Connecting to Supabase PostgreSQL...")
    try:
        with psycopg.connect(DB_URI) as conn:
            print("Successfully connected to Supabase PostgreSQL!")
            with conn.cursor() as cur:
                with open("supabase/migrations/20261027_initial_schema.sql", "r", encoding="utf-8") as f:
                    sql_content = f.read()

                print("Executing schema migrations...")
                cur.execute(sql_content)
                conn.commit()
                print("All tables, enums, and triggers created successfully!")

                cur.execute("""
                    SELECT table_name 
                    FROM information_schema.tables 
                    WHERE table_schema = 'public' 
                    ORDER BY table_name;
                """)
                tables = [row[0] for row in cur.fetchall()]
                print(f"Verified {len(tables)} tables in Supabase public schema.")

    except Exception as e:
        print(f"Error during migration: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()
