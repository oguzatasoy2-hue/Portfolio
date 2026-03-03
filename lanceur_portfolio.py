import http.server
import socketserver
import webbrowser
import os

PORT = 8000
DIRECTORY = "/Users/oguzatasoy/antigravity/portfolio_oguz_atasoy"

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

def start_server():
    os.chdir(DIRECTORY)
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        print(f"🌍 Serveur lancé sur le port {PORT}")
        print("Ouverture du Portfolio dans votre navigateur...")
        # Lancer le navigateur
        webbrowser.open(f"http://localhost:{PORT}")
        print("Appuyez sur Ctrl+C pour arrêter le serveur.")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nArrêt du serveur.")

if __name__ == "__main__":
    start_server()
