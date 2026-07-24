from dao.connection import get_connection, release_connection

try:
    conn = get_connection()

    print("=" * 40)
    print(" CONEXIÓN EXITOSA A POSTGRESQL ")
    print("=" * 40)

    release_connection(conn)

except Exception as e:
    print("ERROR")
    print(e)
