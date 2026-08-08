from dao.connection import get_connection, release_connection

try:
    conn = get_connection()

    print("=" * 50)
    print(" CONEXIÓN EXITOSA A POSTGRESQL ")
    print("=" * 50)

    with conn.cursor() as cur:

        cur.execute("SELECT current_database();")
        print("Base de datos:", cur.fetchone()[0])

        cur.execute("SELECT current_user;")
        print("Usuario:", cur.fetchone()[0])

        cur.execute("SELECT current_schema();")
        print("Esquema:", cur.fetchone()[0])

        print("\nCOLUMNAS DE LA TABLA videojuego:")
        print("-" * 50)

        cur.execute("""
            SELECT column_name, data_type
            FROM information_schema.columns
            WHERE table_schema = 'public'
              AND table_name = 'videojuego'
            ORDER BY ordinal_position;
        """)

        columnas = cur.fetchall()

        for columna in columnas:
            print(f"{columna[0]} -> {columna[1]}")

    release_connection(conn)

except Exception as e:
    print("ERROR")
    print(e)